# django_project/urls.py
from django.conf import settings
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("", include("pages.urls")),  # [DC Source][CHECKED] Корректно подключен pages.urls для всех путей с корня
]