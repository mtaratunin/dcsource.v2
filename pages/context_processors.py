# pages/context_processors.py

import os
import json  # [DC Source] Добавлено для сериализации меню в JSON

from django.conf import settings

# [DC Source] ===== ДОРАБОТАНО: Функция для получения позиции и человекочитаемого названия раздела =====
def get_section_position_and_title(folder, folder_path, default_title=None, default_position=99):
    # ... не трогаем, остальная логика не меняется ...
    import codecs
    for fname in ["title.md", "title.txt"]:
        tfile = os.path.join(folder_path, fname)
        if os.path.isfile(tfile):
            with codecs.open(tfile, 'r', encoding='utf-8') as f:
                lines = [line.strip() for line in f if line.strip()]
                if len(lines) >= 2:
                    try:
                        position = int(lines[0])
                    except Exception:
                        position = default_position
                    title = lines[1]
                    return position, title
                elif len(lines) == 1:
                    return default_position, lines[0]
    return default_position, (default_title or folder)

def get_page_position_and_title(filepath, default_title=None, default_position=99):
    # ... не трогаем, остальная логика не меняется ...
    import re
    block_title_re = re.compile(r'{%\s*block\s+title\s*%}(.*?){%\s*endblock\s*%}', re.DOTALL | re.IGNORECASE)
    block_position_re = re.compile(r'{%\s*block\s+position\s*%}(.*?){%\s*endblock\s*%}', re.DOTALL | re.IGNORECASE)
    html_title_re = re.compile(r'<title>(.*?)</title>', re.DOTALL | re.IGNORECASE)
    meta_position_re = re.compile(r'<meta\s+name=["\']position["\']\s+content=["\'](\d+)["\']', re.IGNORECASE)
    try:
        with open(filepath, encoding='utf-8') as f:
            content = f.read()
            position_match = block_position_re.search(content)
            if position_match:
                try:
                    position = int(position_match.group(1).strip())
                except Exception:
                    position = default_position
            else:
                meta_match = meta_position_re.search(content)
                if meta_match:
                    try:
                        position = int(meta_match.group(1).strip())
                    except Exception:
                        position = default_position
                else:
                    position = default_position
            title_match = block_title_re.search(content)
            if title_match:
                title = title_match.group(1).strip()
            else:
                html_title_match = html_title_re.search(content)
                if html_title_match:
                    title = html_title_match.group(1).strip()
                else:
                    title = default_title
            return position, title
    except Exception:
        return default_position, default_title

def dynamic_menu(request):
    # ... не трогаем, остальная логика не меняется ...
    pages_templates_dir = os.path.join(settings.BASE_DIR, "pages", "templates", "pages")
    menu = []
    for folder in os.listdir(pages_templates_dir):
        folder_path = os.path.join(pages_templates_dir, folder)
        if os.path.isdir(folder_path) and not folder.startswith("_"):
            position, section_title = get_section_position_and_title(folder, folder_path)
            pages_list = []
            for file in os.listdir(folder_path):
                if (
                    file.endswith(".html")
                    and not file.startswith("_")
                    and file != "submenu"
                    and os.path.isfile(os.path.join(folder_path, file))
                ):
                    name = file.replace(".html", "")
                    file_path = os.path.join(folder_path, file)
                    page_position, page_title = get_page_position_and_title(
                        file_path,
                        name.capitalize()
                    )
                    pages_list.append({
                        "filename": file,
                        "folder": folder,  # [DC Source] Добавлено для фронта
                        "page": name,      # [DC Source] Добавлено для фронта
                        "url": f"/{folder}/{name}/",  # [DC Source] Оставлено для удобства фронта
                        "title": page_title,
                        "position": page_position,     # [DC Source] ДОБАВЛЕНО: позиция для сортировки в подменю
                    })
            pages_list_sorted = sorted(pages_list, key=lambda p: (p.get("position", 99), p.get("title", "")))
            menu.append({
                "folder": folder,
                "section_title": section_title,
                "position": position,         # [DC Source] позиция раздела для сортировки на фронте
                "pages": pages_list_sorted,
            })
    menu_sorted = sorted(menu, key=lambda m: (m.get("position", 99), m.get("section_title", "")))
    return {
        "dynamic_menu": menu_sorted,
        "dynamic_menu_json": json.dumps(menu_sorted, ensure_ascii=False)  # [DC Source] Для использования в JS
    }

# [DC Source][FIXED] Универсальный context_processor для формы обратной связи
def contact_form_defaults(request):
    # [DC Source][NEW] Автоматически определяем page_type по request.path
    import re
    path = request.path
    page_type = "home"
    if re.search(r'/compliance', path):
        page_type = "compliance"
    elif re.search(r'/lis', path):
        page_type = "lis"
    elif re.search(r'/mis', path):
        page_type = "mis"
    elif re.search(r'/pacs', path):
        page_type = "pacs"
    elif re.search(r'/ts', path):
        page_type = "ts"
    elif re.search(r'/contacts', path):
        page_type = "contacts"
    elif re.search(r'/solutions', path):
        page_type = "solutions"
    elif re.search(r'/about', path):
        page_type = "about"
    elif re.search(r'/about/privacy_policy', path):
        page_type = "compliance"
    elif re.search(r'/about/company_details', path):
        page_type = "home"
    # [DC Source][NEW] Список пунктов для message (чекбоксы)
    return {
        'message_choices': [
            ("ЛИС", "ЛИС - Лабораторная информационная система"),
            ("МИС", "МИС - Медицинская информационная система"),
            ("PACS", "PACS - Система архивирования и передачи изображений"),
            ("ТехПоддержка", "ТехПоддержка - Техническая поддержка и сопровождение"),
            ("Комплаенс", "Комплаенс"),
            ("Общие вопросы", "Общие вопросы"),
        ],
        'page_type': page_type,
    }