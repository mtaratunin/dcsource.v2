// menu_mobile.js
//
// [DC Source] Управление мобильным меню и раскрытием вложенных пунктов
// [DC Source] ДОРАБОТАНО: полностью динамическое открытие/закрытие мобильного меню и подменю
// [DC Source][UPDATE 2025-08-11] Адаптация под новую структуру мобильного меню:
//   - В каждой секции теперь есть:
//       <div class="mobile-section-header">
//         <a ...>Название раздела (ведёт на index)</a>
//         <button class="mobile-submenu-toggle" ...> (+/-) </button>   (опционально, если есть внутренние страницы кроме index)
//       </div>
//       <ul class="mobile-submenu">...</ul>
//   - Кнопка раскрытия НЕ предотвращает переход по ссылке раздела.
//   - Добавлены aria-атрибуты для доступности.
//
// ПРЕДУПРЕЖДЕНИЕ: Иконка +/- требует CSS (см. комментарий в dc_dynamic_menu.js)

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

  // [DC Source] Закрыть меню по кнопке-кресту
  if (mobileMenuCloseBtn && mobileMenu) {
    mobileMenuCloseBtn.addEventListener('click', function() {
      closeMobileMenu();
    });
  }

  // [DC Source] Закрыть меню по клику вне (оверлей — сам контейнер)
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function(e){
      if(e.target === mobileMenu){
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hide');
    document.body.style.overflow = '';
    // Свернуть все открытые подменю
    var openSubmenus = mobileMenu.querySelectorAll('.mobile-submenu.open');
    openSubmenus.forEach(function(sub) {
      sub.classList.remove('open');
      sub.setAttribute('aria-hidden','true');
    });
    // Сброс состояния кнопок
    var toggles = mobileMenu.querySelectorAll('.mobile-submenu-toggle.open');
    toggles.forEach(function(btn){
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    });
  }

  // [DC Source] Делегирование: управление раскрытием подменю через кнопки .mobile-submenu-toggle
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function(e) {
      var toggleBtn = e.target.closest('.mobile-submenu-toggle');
      if (!toggleBtn) return;

      var targetSel = toggleBtn.getAttribute('data-target');
      if (!targetSel) return;
      var submenu = mobileMenu.querySelector(targetSel);
      if (!submenu) return;

      var willOpen = !submenu.classList.contains('open');

      // Закрываем прочие открытые (опционально; если нужно оставить множественное раскрытие — закомментировать блок)
      // mobileMenu.querySelectorAll('.mobile-submenu.open').forEach(function(opened){
      //   if (opened !== submenu) {
      //     opened.classList.remove('open');
      //     opened.setAttribute('aria-hidden','true');
      //     var relatedBtn = mobileMenu.querySelector('.mobile-submenu-toggle[data-target="#'+opened.id+'"]');
      //     if (relatedBtn) {
      //       relatedBtn.classList.remove('open');
      //       relatedBtn.setAttribute('aria-expanded','false');
      //     }
      //   }
      // });

      // Переключаем текущее
      submenu.classList.toggle('open', willOpen);
      submenu.setAttribute('aria-hidden', String(!willOpen));
      toggleBtn.classList.toggle('open', willOpen);
      toggleBtn.setAttribute('aria-expanded', String(willOpen));

      e.preventDefault();
      e.stopPropagation();
    });
  }
});