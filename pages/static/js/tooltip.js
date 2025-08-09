//tooltip.js
// [DC Source][NEW][ABBR TOOLTIP] Инициализация Bootstrap tooltip для всех аббревиатур
document.addEventListener('DOMContentLoaded', function() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (el) {
    // Используем bootstrap.Tooltip из уже подключенного bundle
    new bootstrap.Tooltip(el);
  });
});