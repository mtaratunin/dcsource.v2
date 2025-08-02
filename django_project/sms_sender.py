# dcsource.v2/django_project/sms_sender.py
from django.conf import settings
from .smsc_api import SMSC

def send_sms_via_smsc(phone, text):
    # Берём параметры из настроек
    sender = settings.SMSC_KZ_SENDER or ""
    smsc = SMSC(
        login=settings.SMSC_KZ_LOGIN or "",
        password=settings.SMSC_KZ_PASSWORD or "",
        debug=settings.SMSC_KZ_DEBUG
    )

    # Убираем плюс только если он в начале (для шлюза)
    phone_for_smsc = phone.lstrip('+')
    # print("DEBUG SMSC SEND TO:", phone_for_smsc)
    # print("DEBUG SMSC LOGIN:", settings.SMSC_KZ_LOGIN)
    # print("DEBUG SMSC PASSWORD:", settings.SMSC_KZ_PASSWORD)
    # print("DEBUG SMSC SENDER:", sender)

    result = smsc.send_sms(phone_for_smsc, text, sender=sender)
    # print("DEBUG SMSC RESULT:", result)
    if len(result) > 1 and result[1].startswith('-'):
        raise Exception(f"SMSC.KZ error {result[1]}: {result}")
    return result