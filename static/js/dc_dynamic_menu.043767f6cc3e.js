// dc_dynamic_menu.js

// [DC Source] Динамическое построение главного, мобильного и бокового меню на основе window.DC_DYNAMIC_MENU

document.addEventListener('DOMContentLoaded', function() {
  // Главное меню
  const navBar = document.getElementById('dc-main-menu');
  if (navBar && window.DC_DYNAMIC_MENU) {
    let html = '<ul class="navbar-nav ms-auto mb-2 mb-lg-0">';
    html += '<li class="nav-item"><a class="nav-link" href="/">Главная</a></li>';
    window.DC_DYNAMIC_MENU.forEach(section => {
      html += `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="${section.folder}Dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">${section.section_title}</a>
          <ul class="dropdown-menu" aria-labelledby="${section.folder}Dropdown">
      `;
      section.pages.forEach(page => {
        html += `<li><a class="dropdown-item" href="${page.url}">${page.title}</a></li>`;
      });
      html += '</ul></li>';
    });
    html += '</ul>';
    navBar.innerHTML = html;
  }

  // [DC Source] Мобильное меню: строим только наполнение, контейнер уже есть в _base.html
  const mobileMenu = document.getElementById('dc-mobile-menu');
  if (mobileMenu && window.DC_DYNAMIC_MENU) {
    let html = '<ul class="mobile-menu-list">';
    html += '<li><a href="/" class="mobile-menu-link">Главная</a></li>';
    window.DC_DYNAMIC_MENU.forEach(section => {
      html += `
        <li>
          <button class="mobile-menu-link" type="button" data-target="#${section.folder}Submenu">${section.section_title}</button>
          <ul class="mobile-submenu" id="${section.folder}Submenu">
      `;
      section.pages.forEach(page => {
        html += `<li><a href="${page.url}" class="mobile-menu-link">${page.title}</a></li>`;
      });
      html += '</ul></li>';
    });
    html += '</ul>';
    mobileMenu.innerHTML = html;
  }

  // [DC Source] Боковое меню раздела (side-menu)
  const sideMenu = document.getElementById('dc-side-menu');
  if (sideMenu && window.DC_DYNAMIC_MENU) {
    // Определяем текущий раздел и страницу по URL (пример: /about/privacy_policy/)
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    var folder = pathParts[0];
    var currentPage = pathParts[1] || '';
    var section = window.DC_DYNAMIC_MENU.find(function(s) { return s.folder === folder; });
    if (section) {
      let html = '';
      section.pages.forEach(function(page) {
        let active = (page.page === currentPage) ? ' active' : '';
        // [DC Source] Используем стили dc-menu-btn для бокового меню
        html += `<li><a href="${page.url}" class="dc-menu-btn${active}">${page.title}</a></li>`;
      });
      sideMenu.innerHTML = html;
    }
  }
});