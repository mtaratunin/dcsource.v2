// static/js/sticky_footer.js

// [DC Source] sticky_footer.js — отвечает за уменьшение шапки при прокрутке и расширение футера при скролле до низа страницы

// [DC Source] Проверка и применение shrink для шапки и расширения футера при прокрутке
document.addEventListener('scroll', function () {
  // [DC Source] Проверяем: существует ли меню и логотип
  const navbar = document.getElementById('main-navbar');
  const logo = document.getElementById('navbar-logo');
  if (navbar && logo) {
    if (window.scrollY > 30) {
      navbar.classList.add('navbar-shrink');
      logo.style.height = '32px';
    } else {
      navbar.classList.remove('navbar-shrink');
      logo.style.height = '60px'; // [DC Source] Исправлено: высота по умолчанию для логотипа как в _base.html
    }
  }

  // [DC Source] Скрипт для расширения футера при скролле до низа страницы
  const footer = document.getElementById('main-footer');
  if (footer) {
    // window.innerHeight + window.scrollY >= document.body.offsetHeight - 2 означает "почти низ"
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 2)) {
      footer.classList.add('footer-expanded');
    } else {
      footer.classList.remove('footer-expanded');
    }
  }
});

// [DC Source] ИНИЦИАЛИЗАЦИЯ: при загрузке страницы сразу проверяем скролл и применяем классы
document.addEventListener('DOMContentLoaded', function () {
  const navbar = document.getElementById('main-navbar');
  const logo = document.getElementById('navbar-logo');
  if (navbar && logo) {
    if (window.scrollY > 30) {
      navbar.classList.add('navbar-shrink');
      logo.style.height = '32px';
    } else {
      navbar.classList.remove('navbar-shrink');
      logo.style.height = '60px'; // [DC Source] Исправлено: высота по умолчанию для логотипа как в _base.html
    }
  }
  const footer = document.getElementById('main-footer');
  if (footer) {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 2)) {
      footer.classList.add('footer-expanded');
    } else {
      footer.classList.remove('footer-expanded');
    }
  }
});