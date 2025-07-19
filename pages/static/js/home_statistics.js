// home_statistics.js
// [DC Source] Анимированный каунтер для статистики на главной

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.stat-counter').forEach(function(counter) {
    let target = parseInt(counter.dataset.target, 10) || 0;
    let duration = 1200;
    let startTime = null;
    let started = false;
    function animateCounter(ts) {
      if (!startTime) startTime = ts;
      let progress = Math.min((ts - startTime) / duration, 1);
      let value = Math.floor(progress * target);
      counter.textContent = value > 0 ? value : 0;
      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        counter.textContent = target;
      }
    }
    function startIfVisible() {
      if (started) return;
      let rect = counter.getBoundingClientRect();
      let winH = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < winH - 30) {
        started = true;
        requestAnimationFrame(animateCounter);
        window.removeEventListener('scroll', startIfVisible);
      }
    }
    window.addEventListener('scroll', startIfVisible);
    startIfVisible();
  });
});