# [DC Source][NEW] Модель для хранения запросов на OTP-код для телефона (audit)
from django.db import models

class PhoneOTPRequest(models.Model):
    phone = models.CharField(max_length=16)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    # [DC Source][NEW] Хранит историю отправленных кодов для аудита