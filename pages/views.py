# pages/views.py
# [DC Source][NEW] Views для формы обратной связи с подтверждением телефона и отправкой email
import os
import re
import random
import requests  # [DC Source][NEW] Для проверки капчи Cloudflare Turnstile
from django.views.generic import TemplateView
from django.shortcuts import render
from django.http import JsonResponse, Http404
from django.core.mail import send_mail
from django.conf import settings
from .forms import ContactForm
from .models import PhoneOTPRequest

class HomePageView(TemplateView):
    template_name = "pages/home.html"

class AboutPageView(TemplateView):
    template_name = "pages/about/index.html"

class PrivacyPolicyPageView(TemplateView):
    template_name = "pages/about/privacy-policy.html"

# class CompanyDetailsPageView(TemplateView):
#     template_name = "pages/about/company_details.html"

class DynamicPageView(TemplateView):
    """
    Динамическое отображение страниц по шаблону pages/<folder>/<page>.html
    """
    def get_template_names(self):
        folder = self.kwargs.get("folder")
        page = self.kwargs.get("page")
        template_path = f"pages/{folder}/{page}.html"
        # Проверяем существование файла
        full_path = os.path.join(
            os.path.dirname(__file__), "templates", "pages", folder, f"{page}.html"
        )
        if not os.path.exists(full_path):
            raise Http404
        return [template_path]

from django.views.decorators.http import require_POST

def send_sms_code_via_smsc(phone, code):
    # [DC Source][FIXED] Импорт из django_project, а не pages
    from django_project.sms_sender import send_sms_via_smsc
    message = f"{code} - Ваш код подтверждения\nKOTERU.KZ для DCSource.kz"
    return send_sms_via_smsc(phone, message)

# [DC Source][NEW] Проверка Cloudflare Turnstile токена
def verify_turnstile_token(token, remoteip=None):
    secret_key = "0x4AAAAAABpBjw6nI6aY2vWPyIRFUTyFR8Y"
    data = {
        "secret": secret_key,
        "response": token,
    }
    if remoteip:
        data["remoteip"] = remoteip
    try:
        resp = requests.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", data=data, timeout=5)
        result = resp.json()
        return result.get("success", False)
    except Exception as e:
        # [DC Source][NEW] Если ошибка при проверке капчи — не пропускаем
        return False

@require_POST
def request_phone_sms_code(request):
    phone = request.POST.get('phone')
    # [DC Source][NEW] Проверяем Cloudflare Turnstile капчу перед подтверждением телефона
    turnstile_token = request.POST.get("cf-turnstile-response")
    if not turnstile_token or not verify_turnstile_token(turnstile_token, request.META.get("REMOTE_ADDR")):
        return JsonResponse({'error': 'Не пройдена капча Cloudflare. Пожалуйста, подтвердите, что вы не робот.'}, status=400)
    # [DC Source][FIXED] Поддержка +7XXXXXXXXXX и 8XXXXXXXXXX, но на шлюз отправляем +7XXXXXXXXXX
    phone_norm = phone
    if re.match(r'^8\d{10}$', phone):
        phone_norm = "+7" + phone[1:]
    elif re.match(r'^\+7\d{10}$', phone):
        phone_norm = phone
    else:
        return JsonResponse({'error': 'Введите номер в формате +7XXXXXXXXXX или 8XXXXXXXXXX'}, status=400)
    code = '%04d' % random.randint(0, 9999)
    try:
        obj = PhoneOTPRequest.objects.create(phone=phone_norm, code=code)
        result = send_sms_code_via_smsc(phone_norm, code)
        if not result:
            return JsonResponse({'error': 'Ошибка отправки SMS. Нет ответа от SMSC.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Ошибка отправки SMS: {e}'}, status=400)
    request.session['contact_phone'] = phone_norm
    request.session['contact_phone_code'] = code
    return JsonResponse({'ok': True})

@require_POST
def confirm_phone_sms_code(request):
    code = request.POST.get('code')
    phone = request.session.get('contact_phone')
    session_code = request.session.get('contact_phone_code')
    if not phone or not session_code:
        return JsonResponse({'error': 'Нет активного запроса на код.'}, status=400)
    if code != session_code:
        return JsonResponse({'error': 'Неверный код.'}, status=400)
    return JsonResponse({'ok': True, 'phone': phone})

@require_POST
def contact_form_submit(request):
    post_data = request.POST.copy()
    if "message" in post_data and not isinstance(post_data.getlist("message"), list):
        post_data.setlist("message", [post_data.get("message")])
    form = ContactForm(post_data)
    # [DC Source][FIXED] Валидация на бэке полностью повторяет логику фронта
    errors = {}
    name = post_data.get("name", "").strip()
    surname = post_data.get("surname", "").strip()
    company = post_data.get("company", "").strip()
    position = post_data.get("position", "").strip()
    show_company = post_data.get("show_company", "") == "on"
    # [DC Source][FIXED] Регулярки для имени, фамилии, должности, компании как на фронте
    re_letters = r'^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]{2,}$'
    re_surname = r'^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$'
    re_position = r'^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$'
    re_company = r'^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-–—"\']{2,}.*[!]?$', # разрешаем ! и кавычки

    # [DC Source][FIXED] Имя: минимум 2 буквы, разрешены буквы (рус, англ, казахские), пробелы, дефисы
    if not re.match(re_letters, name):
        errors['name'] = ["Имя должно содержать минимум 2 буквы (латиница, кириллица, казахские буквы, пробел, дефис)."]

    # [DC Source][FIXED] Фамилия: минимум 1 буква, разрешены буквы (рус, англ, казахские), пробелы, дефисы
    if surname and not re.match(re_surname, surname):
        errors['surname'] = ["Фамилия должна содержать минимум 1 букву (латиница, кириллица, казахские буквы, пробел, дефис)."]

    # [DC Source][FIXED] Компания: если отмечена, минимум 2 символа, разрешены буквы (рус, англ, казахские), пробелы, дефисы, тире, кавычки, !
    if show_company and (not company or not re.match(r'^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-–—"\']{2,}[!]?$', company)):
        errors['company'] = ["Название компании должно быть минимум 2 буквы (русский, казахский, английский алфавит, пробел, дефис, тире, кавычки, !)."]

    # [DC Source][FIXED] Должность: если отмечена, минимум 3 символа, разрешены буквы (рус, англ, казахские), пробелы, дефисы
    if show_company and (not position or not re.match(r'^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]{3,}$', position)):
        errors['position'] = ["Должность должна быть минимум 3 буквы (латиница, кириллица, казахские буквы, пробел, дефис)."]

    # [DC Source][FIXED] Если есть ошибки, возвращаем их сразу, НЕ трогаем остальное
    if errors:
        return JsonResponse({'error': errors}, status=400)

    if form.is_valid():
        subject = "Заявка с сайта DC Source"
        cleaned = form.cleaned_data
        msg_lines = [
            f"Имя: {cleaned.get('name', '')}",
            f"Фамилия: {cleaned.get('surname', '')}",
            f"Телефон: {cleaned.get('phone', '')}",
            f"E-mail: {cleaned.get('email', '')}",
        ]
        # [DC Source][FIXED] Добавляем статус галочки "Указать компанию и должность"
        company_checkbox_checked = post_data.get("show_company", "") == "on"
        msg_lines.append(f'Флажок "Указать компанию и должность": {"Отмечен!" if company_checkbox_checked else "НЕ отмечен!"}')
        # [DC Source][FIXED] Добавляем статус галочки "Даю согласие на обработку персональных данных"
        personal_data_checked = post_data.get("personal_data_accept", "") == "on"
        msg_lines.append(f'Флажок "Даю согласие на обработку персональных данных": {"Отмечен!" if personal_data_checked else "НЕ отмечен!"}')
        if cleaned.get('company'):
            msg_lines.append(f"Компания: {cleaned.get('company')}")
        if cleaned.get('position'):
            msg_lines.append(f"Должность: {cleaned.get('position')}")
        msg_lines.append(f"Запрос: {', '.join(cleaned.get('message'))}")
        message = "\n".join(msg_lines)
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            ["sales@dcsource.kz", "m.taratunin@inova.kz"],
        )
        return JsonResponse({'ok': True})
    else:
        return JsonResponse({'error': form.errors}, status=400)

def contact_form_page(request):
    page_type = request.GET.get('page', 'home')
    message_choices = [
        ("ЛИС", "ЛИС"),
        ("МИС", "МИС"),
        ("PACS", "PACS"),
        ("ТехПоддержка", "ТехПоддержка"),
        ("Комплаенс", "Комплаенс"),
        ("Персональные данные", "Персональные данные"),
        ("Общие вопросы", "Общие вопросы"),
    ]
    return render(request, 'contact_form.html', {'page_type': page_type, 'message_choices': message_choices})