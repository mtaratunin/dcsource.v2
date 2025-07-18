// menu_mobile.js

// [DC Source] Управление мобильным меню и раскрытием вложенных пунктов

document.addEventListener('DOMContentLoaded', function() {
  var mobileMenuBtn = document.getElementById('mobileMenuOpenBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
  var aboutMenuBtn = document.getElementById('aboutMenuBtn');
  var aboutSubmenu = document.getElementById('aboutSubmenu');

  // Открыть меню
  mobileMenuBtn.addEventListener('click', function() {
    mobileMenu.classList.remove('hide');
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
  });

  // Закрыть меню
  mobileMenuCloseBtn.addEventListener('click', function() {
    mobileMenu.classList.add('hide');
    document.body.style.overflow = ''; // Разблокируем прокрутку
    aboutSubmenu.classList.remove('open');
  });

  // Скрытие по клику вне меню (если нужно)
  mobileMenu.addEventListener('click', function(e){
    if(e.target === mobileMenu){
      mobileMenu.classList.add('hide');
      document.body.style.overflow = '';
      aboutSubmenu.classList.remove('open');
    }
  });

  // Переключить вложенное меню "О компании"
  aboutMenuBtn.addEventListener('click', function() {
    aboutSubmenu.classList.toggle('open');
  });
});