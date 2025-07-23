// dc_dynamic_menu.js

// [DC Source] Динамическое построение главного, мобильного и бокового меню на основе window.DC_DYNAMIC_MENU

// [DC Source] ДОРАБОТАНО: поддержка сортировки разделов меню по полю position, если оно есть
// [DC Source] ДОРАБОТАНО: поддержка сортировки пунктов подменю по полю position, если оно есть

document.addEventListener('DOMContentLoaded', function() {
  // [DC Source] Сортируем разделы по position (по возрастанию), если поле есть
  let menuData = window.DC_DYNAMIC_MENU ? [...window.DC_DYNAMIC_MENU] : [];
  menuData.sort(function(a, b) {
    // [DC Source] Если поле position нет, считаем его равным 99
    let posA = typeof a.position !== "undefined" ? a.position : 99;
    let posB = typeof b.position !== "undefined" ? b.position : 99;
    if (posA !== posB) return posA - posB;
    // если позиции равны — сортируем по section_title
    return (a.section_title || "").localeCompare(b.section_title || "");
  });

  // Главное меню
  const navBar = document.getElementById('dc-main-menu');
  if (navBar && menuData.length > 0) {
    let html = '<ul class="navbar-nav ms-auto mb-2 mb-lg-0">';
    html += '<li class="nav-item"><a class="nav-link" href="/">Главная</a></li>';
    menuData.forEach(section => {
      // [DC Source] Сортируем страницы раздела по позиции (если есть)
      let pages = Array.isArray(section.pages) ? [...section.pages] : [];
      pages.sort(function(a, b) {
        let posA = typeof a.position !== "undefined" ? a.position : 99;
        let posB = typeof b.position !== "undefined" ? b.position : 99;
        if (posA !== posB) return posA - posB;
        return (a.title || "").localeCompare(b.title || "");
      });
      // [DC Source] Используем section.section_title для показа названия раздела
      html += `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="${section.folder}Dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">${section.section_title}</a>
          <ul class="dropdown-menu" aria-labelledby="${section.folder}Dropdown">
      `;
      pages.forEach(page => {
        html += `<li><a class="dropdown-item" href="${page.url}">${page.title}</a></li>`;
      });
      html += '</ul></li>';
    });
    html += '</ul>';
    navBar.innerHTML = html;
  }

  // [DC Source] Мобильное меню: строим только наполнение, контейнер уже есть в _base.html
  const mobileMenu = document.getElementById('dc-mobile-menu');
  if (mobileMenu && menuData.length > 0) {
    let html = '<ul class="mobile-menu-list">';
    html += '<li><a href="/" class="mobile-menu-link">Главная</a></li>';
    menuData.forEach(section => {
      // [DC Source] Сортируем страницы раздела по позиции (если есть)
      let pages = Array.isArray(section.pages) ? [...section.pages] : [];
      pages.sort(function(a, b) {
        let posA = typeof a.position !== "undefined" ? a.position : 99;
        let posB = typeof b.position !== "undefined" ? b.position : 99;
        if (posA !== posB) return posA - posB;
        return (a.title || "").localeCompare(b.title || "");
      });
      // [DC Source] Используем section.section_title для показа названия раздела
      html += `
        <li>
          <button class="mobile-menu-link" type="button" data-target="#${section.folder}Submenu">${section.section_title}</button>
          <ul class="mobile-submenu" id="${section.folder}Submenu">
      `;
      pages.forEach(page => {
        html += `<li><a href="${page.url}" class="mobile-menu-link">${page.title}</a></li>`;
      });
      html += '</ul></li>';
    });
    html += '</ul>';
    mobileMenu.innerHTML = html;
  }

  // [DC Source] Боковое меню раздела (side-menu)
  const sideMenu = document.getElementById('dc-side-menu');
  if (sideMenu && menuData.length > 0) {
    // Определяем текущий раздел и страницу по URL (пример: /about/privacy_policy/)
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    var folder = pathParts[0];
    var currentPage = pathParts[1] || '';
    var section = menuData.find(function(s) { return s.folder === folder; });
    if (section) {
      let pages = Array.isArray(section.pages) ? [...section.pages] : [];
      pages.sort(function(a, b) {
        let posA = typeof a.position !== "undefined" ? a.position : 99;
        let posB = typeof b.position !== "undefined" ? b.position : 99;
        if (posA !== posB) return posA - posB;
        return (a.title || "").localeCompare(b.title || "");
      });
      let html = '';
      pages.forEach(function(page) {
        let active = (page.page === currentPage) ? ' active' : '';
        // [DC Source] Используем стили dc-menu-btn для бокового меню
        html += `<li><a href="${page.url}" class="dc-menu-btn${active}">${page.title}</a></li>`;
      });
      sideMenu.innerHTML = html;
    }
  }
});