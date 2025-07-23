// sticky_footer.js
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
          logo.style.height = '48px';
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
          logo.style.height = '48px';
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