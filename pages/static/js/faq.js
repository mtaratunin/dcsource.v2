// faq.js
// [DC Source][NEW][FAQ] Логика FAQ вынесена из pacs.html (ранее был инлайн-скрипт)
(function() {
  // [DC Source][FAQ] Инициализация аккордеона
  const container = document.getElementById('pacs-faq');
  if (!container) return;

  const items = Array.from(container.querySelectorAll('.faq-item'));

  // [DC Source][FIX][FAQ] Гарантируем закрытое начальное состояние, даже если в HTML случайно оставили класс .faq-item-open
  items.forEach(item => {
    if (item.classList.contains('faq-item-open')) {
      item.classList.remove('faq-item-open');
    }
    const q = item.querySelector('.faq-question');
    const aw = item.querySelector('.faq-answer-wrapper');
    if (q) q.setAttribute('aria-expanded', 'false');
    if (aw) {
      aw.style.maxHeight = '0px';
      aw.setAttribute('aria-hidden', 'true');
    }
  });

  // Функция открытия/закрытия
  function toggleItem(item) {
    const isOpen = item.classList.contains('faq-item-open');
    const answerWrapper = item.querySelector('.faq-answer-wrapper');

    if (!answerWrapper) return;

    if (isOpen) {
      // Закрываем
      item.classList.remove('faq-item-open');
      answerWrapper.style.maxHeight = '0px';
      item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      answerWrapper.setAttribute('aria-hidden', 'true');
    } else {
      // Закрываем остальные (оставляем одиночное открытие)
      items.forEach(i => {
        if (i !== item && i.classList.contains('faq-item-open')) {
          const aw = i.querySelector('.faq-answer-wrapper');
            i.classList.remove('faq-item-open');
            if (aw) aw.style.maxHeight = '0px';
            const q = i.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'false');
            if (aw) aw.setAttribute('aria-hidden', 'true');
        }
      });

      // Открываем текущий
      item.classList.add('faq-item-open');
      answerWrapper.style.maxHeight = answerWrapper.scrollHeight + 'px';
      item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
      answerWrapper.setAttribute('aria-hidden', 'false');
    }
  }

  // Вешаем события
  container.addEventListener('click', function(e) {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const parentItem = btn.closest('.faq-item');
    if (parentItem) toggleItem(parentItem);
  });

  // [DC Source][FAQ] При ресайзе корректируем max-height открытых элементов
  window.addEventListener('resize', function() {
    items.forEach(item => {
      if (item.classList.contains('faq-item-open')) {
        const aw = item.querySelector('.faq-answer-wrapper');
        if (aw) aw.style.maxHeight = aw.scrollHeight + 'px';
      }
    });
  });
})();