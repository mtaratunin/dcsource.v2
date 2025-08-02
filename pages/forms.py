# pages/forms.py
# [DC Source][FIXED] Форма обратной связи: имя минимум 2 символа, фамилия минимум 1 символ (если обязательна)
from django import forms
import re

MESSAGE_CHOICES = [
    ("ЛИС", "ЛИС"),
    ("МИС", "МИС"),
    ("PACS", "PACS"),
    ("ТехПоддержка", "ТехПоддержка"),
    ("Комплаенс", "Комплаенс"),
    ("Общие вопросы", "Общие вопросы"),
]

class ContactForm(forms.Form):
    name = forms.CharField(min_length=2, required=True)  # [DC Source][FIXED] минимум 2 символа!
    surname = forms.CharField(required=False)
    phone = forms.CharField(required=True)
    email = forms.EmailField(required=True)
    company = forms.CharField(required=False)
    position = forms.CharField(required=False)
    message = forms.MultipleChoiceField(choices=MESSAGE_CHOICES, required=True)

    def clean_name(self):
        name = self.cleaned_data.get('name')
        # [DC Source][FIXED] минимум 2 символа!
        if not re.match(r'^[А-Яа-яA-Za-z]{2,}$', name):
            raise forms.ValidationError('Имя должно содержать минимум 2 буквы (латиница или кириллица).')
        return name

    def clean_surname(self):
        surname = self.cleaned_data.get('surname')
        # [DC Source][FIXED] Проверка только если поле заполнено
        if surname and not re.match(r'^[А-Яа-яA-Za-z]{1,}$', surname):
            raise forms.ValidationError('Фамилия должна содержать минимум 1 букву (латиница или кириллица).')
        return surname

    # [DC Source][FIXED] Поддержка +7XXXXXXXXXX и 8XXXXXXXXXX, преобразование к +7XXXXXXXXXX
    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        phone_norm = phone
        # [DC Source][FIXED] Проверка формата
        if re.match(r'^\+7\d{10}$', phone):
            phone_norm = phone
        elif re.match(r'^8\d{10}$', phone):
            phone_norm = "+7" + phone[1:]
        else:
            raise forms.ValidationError('Телефон должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX (Казахстан)')
        return phone_norm

    def clean_company(self):
        company = self.cleaned_data.get('company')
        if company and not re.match(r'^[А-Яа-яЁё\s\-]{2,}.*$', company):
            raise forms.ValidationError('Название компании должно быть минимум 2 буквы на русском или казахском.')
        return company

    def clean_position(self):
        position = self.cleaned_data.get('position')
        if position:
            if len(position) < 3:
                raise forms.ValidationError('Должность должна быть не менее 3 букв.')
            if not re.match(r'^[А-Яа-яA-Za-z]{3,}$', position):
                raise forms.ValidationError('Должность должна быть только буквами (латиница или кириллица).')
        return position

    def clean_message(self):
        message = self.cleaned_data.get('message')
        if not message or not isinstance(message, list) or len(message) == 0:
            raise forms.ValidationError('Необходимо выбрать хотя бы один пункт запроса.')
        return message