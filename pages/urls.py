# pages/urls.py

from django.urls import path
from .views import HomePageView, DynamicPageView
from . import views

urlpatterns = [
    path("", HomePageView.as_view(), name="home"),
    # [DC Source][NEW] Запросить SMS-код — должен быть выше динамического!
    path('contact/request_sms/', views.request_phone_sms_code, name='request_phone_sms_code'),
    # [DC Source][NEW] Подтвердить код из SMS
    path('contact/confirm_sms/', views.confirm_phone_sms_code, name='confirm_phone_sms_code'),
    # [DC Source][NEW] Отправить форму обратной связи
    path('contact/submit/', views.contact_form_submit, name='contact_form_submit'),
    # [DC Source][NEW] Страница с формой обратной связи
    path('contact/', views.contact_form_page, name='contact_form_page'),
    # [DC Source][NEW] Динамическое отображение страниц — СТАВИМ В САМЫЙ НИЗ!
    path("<str:folder>/<str:page>/", DynamicPageView.as_view(), name="dynamic_page"),
]