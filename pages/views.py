# pages/views.py
# [DC Source][NEW] Views для формы обратной связи с подтверждением телефона и отправкой email
import os
import re
import random
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
    template_name = "pages/about/about.html"

class PrivacyPolicyPageView(TemplateView):
    template_name = "pages/about/privacy_policy.html"

class CompanyDetailsPageView(TemplateView):
    template_name = "pages/about/company_details.html"

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

@require_POST
def request_phone_sms_code(request):
    print("DEBUG POST DATA:", request.POST)
    phone = request.POST.get('phone')
    # [DC Source][FIXED] Поддержка +7XXXXXXXXXX и 8XXXXXXXXXX, но на шлюз отправляем +7XXXXXXXXXX
    phone_norm = phone
    if re.match(r'^8\d{10}$', phone):
        phone_norm = "+7" + phone[1:]
    elif re.match(r'^\+7\d{10}$', phone):
        phone_norm = phone
    else:
        print("DEBUG: Validation failed (phone format)")
        return JsonResponse({'error': 'Введите номер в формате +7XXXXXXXXXX или 8XXXXXXXXXX'}, status=400)
    code = '%04d' % random.randint(0, 9999)
    try:
        obj = PhoneOTPRequest.objects.create(phone=phone_norm, code=code)
        print("DEBUG: PhoneOTPRequest created:", obj)
        result = send_sms_code_via_smsc(phone_norm, code)
        print("DEBUG: SMSC result:", result)
        if not result:
            print("DEBUG: No result from SMSC")
            return JsonResponse({'error': 'Ошибка отправки SMS. Нет ответа от SMSC.'}, status=400)
    except Exception as e:
        print("DEBUG: Exception occurred:", e)
        return JsonResponse({'error': f'Ошибка отправки SMS: {e}'}, status=400)
    request.session['contact_phone'] = phone_norm
    request.session['contact_phone_code'] = code
    print("DEBUG: Success, returning ok")
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
            ["info@koteru.kz"],
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
        ("Общие вопросы", "Общие вопросы"),
    ]
    return render(request, 'contact_form.html', {'page_type': page_type, 'message_choices': message_choices})