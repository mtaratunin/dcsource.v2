// home_slider.js

// [DC Source] Слайдер для главной страницы. Автоматически подбирает картинки slideXX.* из /static/images/slider/home/

document.addEventListener('DOMContentLoaded', function () {
  // [DC Source] Настройки
  const sliderImagesFolder = '/static/images/slider/home/';
  // [DC Source] ДОБАВИТЬ: список расширений, которые поддерживаем
  const extensions = ['jpg', 'jpeg', 'png'];

  // [DC Source] ДОБАВИТЬ: максимальное количество слайдов, чтобы не делать лишних запросов
  const MAX_SLIDES = 5;

  // [DC Source] Собираем список слайдов (slide1, slide2, ..., slideN)
  // Django не отдаёт список файлов на фронт, поэтому формируем массив в JS вручную (можно заменить на Django-переменную, если надо)
  let slides = [];
  for (let i = 1; i <= MAX_SLIDES; i++) {
    for (let ext of extensions) {
      let url = `${sliderImagesFolder}slide${i}.${ext}`;
      // [DC Source] Проверка существования изображения через создание объекта Image (асинхронно)
      slides.push({ url, pos: i, ext });
    }
  }

  // [DC Source] Фильтруем реально существующие файлы (работает только для картинок, возвращающих 200 OK)
  let validSlides = [];
  let checked = 0;

  function checkSlidesReady() {
    // [DC Source] Когда все картинки проверены, запускаем слайдер
    if (checked === slides.length) {
      validSlides.sort((a, b) => a.pos - b.pos);
      if (validSlides.length > 0) {
        buildSlider(validSlides);
      }
    }
  }

  slides.forEach(slide => {
    let img = new Image();
    img.onload = function () {
      validSlides.push(slide);
      checked++;
      checkSlidesReady();
    };
    img.onerror = function () {
      checked++;
      checkSlidesReady();
    };
    img.src = slide.url;
  });

  // [DC Source] Сам слайдер
  function buildSlider(slides) {
    const sliderImages = document.getElementById('slider-images');
    if (!sliderImages) return;

    // [DC Source] Создаём DOM для всех слайдов, только первый активный
    slides.forEach((slide, idx) => {
      let img = document.createElement('img');
      img.src = slide.url;
      img.className = 'slider-image' + (idx === 0 ? ' active' : '');
      img.alt = `Слайд ${slide.pos}`;
      img.dataset.idx = idx;
      sliderImages.appendChild(img);
    });

    let current = 0;
    let timer = null;
    const TOTAL = slides.length;

    function showSlide(idx) {
      let imgs = sliderImages.querySelectorAll('.slider-image');
      if (idx < 0) idx = TOTAL - 1;
      if (idx >= TOTAL) idx = 0;
      imgs.forEach((img, i) => {
        if (i === idx) {
          img.classList.add('active');
        } else {
          img.classList.remove('active');
        }
      });
      current = idx;
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function prevSlide() {
      showSlide(current - 1);
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(nextSlide, 5000);
    }

    function stopAuto() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // [DC Source] ДОРАБОТАНО: SVG-стрелки — прямоугольные, минималистичные
    document.getElementById('slider-arrow-left').innerHTML =
      '<svg viewBox="0 0 32 32"><polyline points="20,8 12,16 20,24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.getElementById('slider-arrow-right').innerHTML =
      '<svg viewBox="0 0 32 32"><polyline points="12,8 20,16 12,24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // [DC Source] Навешиваем обработчики на стрелки
    document.getElementById('slider-arrow-left').onclick = function () {
      prevSlide();
      startAuto();
    };
    document.getElementById('slider-arrow-right').onclick = function () {
      nextSlide();
      startAuto();
    };

    // [DC Source] Автосмена слайдов каждые 5 сек
    startAuto();

    // [DC Source] Можно добавить свайпы для мобильных (по желанию)
    let startX = null;
    sliderImages.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    });
    sliderImages.addEventListener('touchend', function (e) {
      if (startX !== null && e.changedTouches.length === 1) {
        let diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) prevSlide();
          else nextSlide();
          startAuto();
        }
      }
      startX = null;
    });
  }
});