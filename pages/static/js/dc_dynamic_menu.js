// dc_dynamic_menu.js
//
// [DC Source] Динамическое построение главного, мобильного и бокового меню на основе window.DC_DYNAMIC_MENU
//
// [DC Source] ДОРАБОТАНО: поддержка сортировки разделов меню по полю position, если оно есть
// [DC Source] ДОРАБОТАНО: поддержка сортировки пунктов подменю по полю position, если оно есть
// [DC Source][UPDATE 2025-08-09] (ИСТОРИЯ) Ранее добавлялся статический пункт "Техподдержка" (ts.html) после раздела "Решения".
// [DC Source][UPDATE 2025-08-11] Реализация новых требований (index страницы, hover, мобильное меню с +/-).
// [DC Source][UPDATE 2025-08-11][CHANGE] Убрано статическое добавление пункта "Техподдержка". Теперь "Техподдержка" формируется
//                                      динамически как обычный раздел (если присутствует в window.DC_DYNAMIC_MENU).
// [DC Source][UPDATE 2025-08-11][FIX] Выпадающее меню слишком быстро закрывалось (добавлена задержка закрытия).
// [DC Source][UPDATE 2025-08-11][FIX2] Показывать стрелочку (caret) у раздела в десктопном меню ТОЛЬКО если есть реальные
//                                      дочерние пункты (кроме index). Реализовано условным добавлением классов
//                                      .dropdown / .dropdown-toggle и HTML списка.
//
document.addEventListener('DOMContentLoaded', function() {

  // --- Вспомогательные функции -------------------------------------------------

  // [DC Source] Нормализуем значение position (если нет — 99)
  function getPos(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
    return 99;
  }

  // [DC Source] Проверка: является ли страница index (не показываем в списках)
  function isIndexPage(pageObj) {
    if (!pageObj) return false;
    const name = (pageObj.page || '').toLowerCase();
    if (name === 'index') return true;
    const p = pageObj.position;
    if (p === 0 || p === '0' || p === '00') return true;
    return false;
  }

  // [DC Source] Сортировка разделов
  let menuData = window.DC_DYNAMIC_MENU ? [...window.DC_DYNAMIC_MENU] : [];
  menuData.sort(function(a, b) {
    const posA = getPos(a.position);
    const posB = getPos(b.position);
    if (posA !== posB) return posA - posB;
    return (a.section_title || '').localeCompare(b.section_title || '');
  });

  // --- DESKTOP / Главное меню ---------------------------------------------------

  const navBar = document.getElementById('dc-main-menu');
  if (navBar && menuData.length > 0) {
    let html = '<ul class="navbar-nav ms-auto mb-2 mb-lg-0">';
    html += '<li class="nav-item"><a class="nav-link" href="/">Главная</a></li>';

    menuData.forEach(section => {
      let pages = Array.isArray(section.pages) ? [...section.pages] : [];

      // Сортировка страниц внутри раздела
      pages.sort(function(a, b) {
        const posA = getPos(a.position);
        const posB = getPos(b.position);
        if (posA !== posB) return posA - posB;
        return (a.title || '').localeCompare(b.title || '');
      });

      // Определяем index-страницу раздела
      const indexPage = pages.find(p => isIndexPage(p));
      const indexUrl = indexPage ? indexPage.url : (pages[0] ? pages[0].url : '#');

      // Фильтруем страницы для выпадающего меню (убираем index)
      const dropdownPages = pages.filter(p => !isIndexPage(p));

      // [DC Source][FIX2] Добавляем классы dropdown / dropdown-toggle ТОЛЬКО если есть элементы подменю
      const hasDropdown = dropdownPages.length > 0;
      const liClasses = 'nav-item' + (hasDropdown ? ' dropdown dc-hover-dropdown' : '');
      const linkClasses = 'nav-link' + (hasDropdown ? ' dropdown-toggle' : '');
      const ariaExp = hasDropdown ? 'aria-expanded="false"' : '';
      const ariaAttrs = hasDropdown ? `id="${section.folder}Dropdown"` : '';

      html += `
        <li class="${liClasses}">
          <a class="${linkClasses}" href="${indexUrl}" ${ariaAttrs} ${ariaExp}>${section.section_title}</a>
          ${hasDropdown ? '<ul class="dropdown-menu" aria-labelledby="'+section.folder+'Dropdown">' : ''}
      `;
      if (hasDropdown) {
        dropdownPages.forEach(page => {
          html += `<li><a class="dropdown-item" href="${page.url}">${page.title}</a></li>`;
        });
        html += '</ul>';
      }
      html += '</li>';
    });

    html += '</ul>';
    navBar.innerHTML = html;

    // [DC Source][HOVER] Реализация hover-поведения выпадающих меню с задержкой закрытия (только для имеющих dropdown)
    const hoverItems = navBar.querySelectorAll('.dc-hover-dropdown');

    const closeTimers = new WeakMap();
    const CLOSE_DELAY = 160; // мс

    hoverItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      const menu = item.querySelector('.dropdown-menu');
      if (!menu) return;

      function clearCloseTimer() {
        const t = closeTimers.get(item);
        if (t) {
          clearTimeout(t);
          closeTimers.delete(item);
        }
      }

      function open() {
        clearCloseTimer();
        item.classList.add('show');
        menu.classList.add('show');
        link.setAttribute('aria-expanded', 'true');
      }

      function scheduleClose() {
        clearCloseTimer();
        const timer = setTimeout(() => {
          item.classList.remove('show');
          menu.classList.remove('show');
          link.setAttribute('aria-expanded', 'false');
          closeTimers.delete(item);
        }, CLOSE_DELAY);
        closeTimers.set(item, timer);
      }

      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', scheduleClose);
      menu.addEventListener('mouseenter', open);
      menu.addEventListener('mouseleave', scheduleClose);

      link.addEventListener('focus', open);
      menu.addEventListener('focusin', open);

      menu.addEventListener('focusout', (e) => {
        if (!menu.contains(e.relatedTarget) && e.relatedTarget !== link) {
          scheduleClose();
        }
      });

      link.addEventListener('blur', (e) => {
        if (!item.contains(e.relatedTarget)) {
          scheduleClose();
        }
      });
    });
  }

  // --- MOBILE / Мобильное меню --------------------------------------------------

  const mobileMenu = document.getElementById('dc-mobile-menu');
  if (mobileMenu && menuData.length > 0) {
    let html = '<ul class="mobile-menu-list">';
    html += '<li class="mobile-root-item"><a href="/" class="mobile-menu-link">Главная</a></li>';

    menuData.forEach(section => {
      let pages = Array.isArray(section.pages) ? [...section.pages] : [];
      pages.sort(function(a, b) {
        const posA = getPos(a.position);
        const posB = getPos(b.position);
        if (posA !== posB) return posA - posB;
        return (a.title || '').localeCompare(b.title || '');
      });

      const indexPage = pages.find(p => isIndexPage(p));
      const indexUrl = indexPage ? indexPage.url : (pages[0] ? pages[0].url : '#');
      const submenuPages = pages.filter(p => !isIndexPage(p));

      html += '<li class="mobile-section">';
      html += '<div class="mobile-section-header">';
      html += `<a href="${indexUrl}" class="mobile-menu-link mobile-section-link">${section.section_title}</a>`;

      if (submenuPages.length) {
        const submenuId = `${section.folder}Submenu`;
        html += `
          <button class="mobile-submenu-toggle" type="button" aria-expanded="false" aria-controls="${submenuId}" data-target="#${submenuId}">
            <span class="mobile-submenu-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Открыть меню раздела ${section.section_title}</span>
          </button>
        `;
      }
      html += '</div>';

      if (submenuPages.length) {
        const submenuId = `${section.folder}Submenu`;
        html += `<ul class="mobile-submenu" id="${submenuId}" aria-hidden="true">`;
        submenuPages.forEach(page => {
          html += `<li><a href="${page.url}" class="mobile-menu-link">${page.title}</a></li>`;
        });
        html += '</ul>';
      }

      html += '</li>';
    });

    html += '</ul>';
    mobileMenu.innerHTML = html;
  }

  // --- SIDE / Боковое меню ------------------------------------------------------

  const sideMenu = document.getElementById('dc-side-menu');
  if (sideMenu && menuData.length > 0) {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const folder = pathParts[0];
    const currentPage = pathParts[1] || '';
    const section = menuData.find(s => s.folder === folder);
    if (section) {
      let pages = Array.isArray(section.pages) ? [...section.pages] : [];
      pages.sort(function(a, b) {
        const posA = getPos(a.position);
        const posB = getPos(b.position);
        if (posA !== posB) return posA - posB;
        return (a.title || '').localeCompare(b.title || '');
      });

      let html = '';
      pages.forEach(page => {
        // if (isIndexPage(page)) return; // при необходимости скрыть index в боковом меню
        const active = (page.page === currentPage) ? ' active' : '';
        html += `<li><a href="${page.url}" class="dc-menu-btn${active}">${page.title}</a></li>`;
      });
      sideMenu.innerHTML = html;
    }
  }

  // --- MOBILE submenu toggle (дублирование для независимости от menu_mobile.js) ---
  (function initMobileSubmenuToggle(){
    const container = document.getElementById('dc-mobile-menu');
    if (!container) return;
    container.addEventListener('click', function(e){
      const btn = e.target.closest('.mobile-submenu-toggle');
      if (!btn) return;
      const targetSel = btn.getAttribute('data-target');
      const submenu = targetSel ? container.querySelector(targetSel) : null;
      if (!submenu) return;
      const isOpen = submenu.classList.toggle('open');
      submenu.setAttribute('aria-hidden', String(!isOpen));
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.classList.toggle('open', isOpen);
      e.preventDefault();
      e.stopPropagation();
    });
  })();
});