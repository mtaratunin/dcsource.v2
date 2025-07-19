# pages/views.py
from django.views.generic import TemplateView
from django.http import Http404
import os

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

