from django.views.generic import TemplateView


class HomePageView(TemplateView):
    template_name = "pages/home.html"


class AboutPageView(TemplateView):
    template_name = "pages/about/about.html"

class PrivacyPolicyPageView(TemplateView):
    template_name = "pages/about/privacy_policy.html"

class CompanyDetailsPageView(TemplateView):
    template_name = "pages/about/company_details.html"