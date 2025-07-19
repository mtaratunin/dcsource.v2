# pages/urls.py

from django.urls import path
from .views import HomePageView, DynamicPageView

urlpatterns = [
    path("", HomePageView.as_view(), name="home"),
    path("<str:folder>/<str:page>/", DynamicPageView.as_view(), name="dynamic_page"),
]