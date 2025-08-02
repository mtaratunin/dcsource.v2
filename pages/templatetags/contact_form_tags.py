# pages/templatetags/contact_form_tags.py
from django import template

register = template.Library()

@register.inclusion_tag('pages/contact_form.html', takes_context=True)
def render_contact_form(context, page_type='home'):
    # [DC Source][NEW] Универсальный тег для формы обратной связи
    message_choices = [
        ("ЛИС", "ЛИС"),
        ("МИС", "МИС"),
        ("PACS", "PACS"),
        ("ТехПоддержка", "ТехПоддержка"),
        ("Комплаенс", "Комплаенс"),
        ("Общие вопросы", "Общие вопросы"),
    ]
    ctx = context.flatten()
    ctx['page_type'] = page_type
    ctx['message_choices'] = message_choices
    return ctx