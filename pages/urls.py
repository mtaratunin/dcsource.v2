from django.urls import path

from .views import HomePageView, AboutPageView, PrivacyPolicyPageView, CompanyDetailsPageView

urlpatterns = [
    path("", HomePageView.as_view(), name="home"),
    path("about/", AboutPageView.as_view(), name="about"),
    path("privacy_policy/", PrivacyPolicyPageView.as_view(), name="privacy_policy"),
    path("company_details/", CompanyDetailsPageView.as_view(), name="company_details"),
]
