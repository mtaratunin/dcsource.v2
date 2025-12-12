# django_project/urls.py
from django.conf import settings
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # path("admin/", admin.site.urls),
    # path("accounts/", include("allauth.urls")),
    path("", include("pages.urls")),  # [DC Source][CHECKED] Корректно подключен pages.urls для всех путей с корня
]

handler400 = "pages.views.bad_request"        # если нужен
handler403 = "pages.views.permission_denied"
handler404 = "pages.views.page_not_found"
handler500 = "pages.views.server_error"