# pages/context_processors.py

import os
import json  # [DC Source] Добавлено для сериализации меню в JSON

from django.conf import settings

# [DC Source] ===== ДОРАБОТАНО: Функция для получения позиции и человекочитаемого названия раздела =====
def get_section_position_and_title(folder, folder_path, default_title=None, default_position=99):
    """
    Получить позицию и человекочитаемое название раздела из title.md или title.txt.
    Первая строка — позиция, вторая строка — название.
    Если файла нет — возвращает (default_position, default_title или имя папки).
    """
    import codecs
    for fname in ["title.md", "title.txt"]:
        tfile = os.path.join(folder_path, fname)
        if os.path.isfile(tfile):
            with codecs.open(tfile, 'r', encoding='utf-8') as f:
                lines = [line.strip() for line in f if line.strip()]
                if len(lines) >= 2:
                    # [DC Source] Первая строка — позиция, вторая — название
                    try:
                        position = int(lines[0])
                    except Exception:
                        position = default_position
                    title = lines[1]
                    return position, title
                elif len(lines) == 1:
                    # [DC Source] Только название, позиции нет
                    return default_position, lines[0]
    return default_position, (default_title or folder)

# [DC Source] ===== ДОРАБОТАНО: Функция для получения позиции и наименования страницы =====
def get_page_position_and_title(filepath, default_title=None, default_position=99):
    """
    Получить позицию и человекочитаемое название страницы из html-файла.
    Ищет {% block position %}...{% endblock %} или <meta name="position"...> для позиции,
    и {% block title %}...{% endblock %} или <title>... для наименования.
    Если не найдено — возвращает (default_position, default_title).
    """
    import re
    block_title_re = re.compile(r'{%\s*block\s+title\s*%}(.*?){%\s*endblock\s*%}', re.DOTALL | re.IGNORECASE)
    block_position_re = re.compile(r'{%\s*block\s+position\s*%}(.*?){%\s*endblock\s*%}', re.DOTALL | re.IGNORECASE)
    html_title_re = re.compile(r'<title>(.*?)</title>', re.DOTALL | re.IGNORECASE)
    meta_position_re = re.compile(r'<meta\s+name=["\']position["\']\s+content=["\'](\d+)["\']', re.IGNORECASE)
    try:
        with open(filepath, encoding='utf-8') as f:
            content = f.read()
            # [DC Source] Получаем позицию: сначала ищем {% block position %}, потом meta name="position"
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
            # [DC Source] Получаем наименование: сначала ищем {% block title %}, потом <title>
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

# [DC Source] Динамическое формирование структуры меню на основе структуры шаблонов pages
def dynamic_menu(request):
    """
    Контекст-процессор для генерации структуры главного меню и подразделов.
    """
    pages_templates_dir = os.path.join(settings.BASE_DIR, "pages", "templates", "pages")
    menu = []
    # [DC Source] Сканируем корневые папки (разделы)
    for folder in os.listdir(pages_templates_dir):
        folder_path = os.path.join(pages_templates_dir, folder)
        if os.path.isdir(folder_path) and not folder.startswith("_"):
            # [DC Source] получаем позицию и название раздела из файла title.txt/title.md или из имени папки
            position, section_title = get_section_position_and_title(folder, folder_path)
            # [DC Source] Сканируем html-файлы в разделе (исключая служебные и подменю)
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
                    # [DC Source] получаем позицию и наименование страницы из файла (через блоки position и title или через <title>)
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
            # [DC Source] Сортировка пунктов подменю по позиции, затем по title
            pages_list_sorted = sorted(pages_list, key=lambda p: (p.get("position", 99), p.get("title", "")))
            menu.append({
                "folder": folder,
                "section_title": section_title,
                "position": position,         # [DC Source] позиция раздела для сортировки на фронте
                "pages": pages_list_sorted,
            })
    # [DC Source] Сортируем меню по полю 'position', затем по section_title
    menu_sorted = sorted(menu, key=lambda m: (m.get("position", 99), m.get("section_title", "")))
    # [DC Source] Возвращаем меню как обычный объект и как JSON для фронта (JS)
    return {
        "dynamic_menu": menu_sorted,
        "dynamic_menu_json": json.dumps(menu_sorted, ensure_ascii=False)  # [DC Source] Для использования в JS
    }