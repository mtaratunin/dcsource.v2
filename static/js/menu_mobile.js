// pages/static/js/menu_mobile.js

// [DC Source] Управление мобильным меню и раскрытием вложенных пунктов
// [DC Source] ДОРАБОТАНО: полностью динамическое открытие/закрытие мобильного меню и подменю

document.addEventListener('DOMContentLoaded', function() {
  // [DC Source] Получаем элементы мобильного меню и кнопок
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileMenuOpenBtn = document.getElementById('mobileMenuOpenBtn');
  var mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');

  // [DC Source] Открыть мобильное меню по бургеру
  if (mobileMenuOpenBtn && mobileMenu) {
    mobileMenuOpenBtn.addEventListener('click', function() {
      mobileMenu.classList.remove('hide');
      document.body.style.overflow = 'hidden';
    });
  }

  // [DC Source] Закрыть меню по кнопке-кресту (если такая кнопка есть)
  if (mobileMenuCloseBtn && mobileMenu) {
    mobileMenuCloseBtn.addEventListener('click', function() {
      mobileMenu.classList.add('hide');
      document.body.style.overflow = '';
      var openSubmenus = mobileMenu.querySelectorAll('.mobile-submenu.open');
      openSubmenus.forEach(function(sub) { sub.classList.remove('open'); });
    });
  }

  // [DC Source] Закрыть меню по клику вне меню (оверлей)
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function(e){
      if(e.target === mobileMenu){
        mobileMenu.classList.add('hide');
        document.body.style.overflow = '';
        var openSubmenus = mobileMenu.querySelectorAll('.mobile-submenu.open');
        openSubmenus.forEach(function(sub) { sub.classList.remove('open'); });
      }
    });

    // [DC Source] Переключатели вложенных подменю (универсально для любого количества разделов)
    mobileMenu.addEventListener('click', function(e) {
      var btn = e.target.closest('.mobile-menu-link[type="button"][data-target]');
      if (btn) {
        var submenuId = btn.getAttribute('data-target');
        var submenu = mobileMenu.querySelector(submenuId);
        if (submenu) {
          submenu.classList.toggle('open');
        }
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
});