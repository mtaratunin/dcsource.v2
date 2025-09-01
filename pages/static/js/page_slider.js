// page_slider.js

// [DC Source] Слайдер для главной страницы. Теперь с поддержкой slider.txt-конфигурации.

document.addEventListener('DOMContentLoaded', function () {
  // [DC Source] Настройки
  const pageType = window.pageType || 'home';
  const sliderImagesFolder = `/static/images/_slider/${pageType}/`;
  const sliderConfigFile = sliderImagesFolder + 'slider.txt';
  const defaultDuration = 5; // секунд, если не указано в slider.txt

  // [DC Source] Загружаем slider.txt и парсим слайды
  fetch(sliderConfigFile)
    .then(response => {
      if (!response.ok) throw new Error('Slider config not found');
      return response.text();
    })
    .then(parseSliderConfig)
    .then(slides => {
      if (slides.length > 0) {
        // [DC Source] ДОРАБОТАНО: всегда сортируем slides перед передачей дальше (гарантия порядка даже при асинхронности)
        slides = slides.slice().sort((a, b) => {
          if (typeof a.__order === 'number' && typeof b.__order === 'number') {
            return a.__order - b.__order;
          }
          if (typeof a.__order === 'number') return -1;
          if (typeof b.__order === 'number') return 1;
          return 0;
        });
        preloadImages(slides, buildSlider);
      }
    })
    .catch(console.error);

  // [DC Source] Парсер slider.txt под новую структуру (slide: N, file: ...)
  function parseSliderConfig(text) {
    // [DC Source] Удаляем описание и комменты
    let lines = text.replace(/^\s*###.*?###\s*$/gms, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length && !line.startsWith('#'));
    let slides = [];
    let slide = {};

    lines.forEach(line => {
      if (line.startsWith('slide:')) {
        if (Object.keys(slide).length) {
          slides.push(slide);
          slide = {};
        }
        // [DC Source] slide: N (номер очереди)
        // [DC Source] ВАЖНО: сохраняем номер очереди в поле __order
        slide['__order'] = parseInt(line.replace('slide:', '').trim(), 10);
      } else if (line.startsWith('file:')) {
        // [DC Source] file: slideX.jpg
        slide['file'] = line.replace('file:', '').trim();
      } else if (line.includes(':')) {
        let [key, ...rest] = line.split(':');
        slide[key.trim()] = rest.join(':').trim();
      }
    });
    if (Object.keys(slide).length) slides.push(slide);

    // [DC Source] Устанавливаем дефолтные значения и приводим к нужному виду
    slides.forEach(s => {
      if (!s['duration']) s['duration'] = defaultDuration;
      if (!s['file']) s['file'] = '';
      if (!s['title']) s['title'] = '';
      if (!s['desc']) s['desc'] = '';
      if (!s['text-position']) s['text-position'] = 'center';
      if (!s['text-align']) s['text-align'] = 'left';
      if (typeof s['url'] !== 'string') s['url'] = '';
      s['url'] = s['url'].trim();
      // [DC Source] Для совместимости с остальным кодом
      s['slide'] = s['file'];
    });

    // [DC Source] Чёткая сортировка по __order (slide: N) всегда при парсинге
    slides.sort((a, b) => {
      if (typeof a.__order === 'number' && typeof b.__order === 'number') {
        return a.__order - b.__order;
      }
      if (typeof a.__order === 'number') return -1;
      if (typeof b.__order === 'number') return 1;
      return 0;
    });

    // [DC Source] Фильтрация только тех у кого есть файл
    return slides.filter(s => s['slide']);
  }

  // [DC Source] Предзагрузка изображений, только существующие слайды
  function preloadImages(slides, callback) {
    // [DC Source] ГАРАНТИЯ: создаём копию массива и сортируем здесь для исключения любых случайных reorder
    slides = slides.slice().sort((a, b) => {
      if (typeof a.__order === 'number' && typeof b.__order === 'number') {
        return a.__order - b.__order;
      }
      if (typeof a.__order === 'number') return -1;
      if (typeof b.__order === 'number') return 1;
      return 0;
    });
    let loaded = 0, total = slides.length;
    let readySlides = [];
    slides.forEach((s, idx) => {
      let img = new Image();
      img.onload = function () {
        readySlides.push(Object.assign({}, s, { urlImg: sliderImagesFolder + s['slide'], __order: s.__order }));
        loaded++;
        // [DC Source] ДОРАБОТАНО: при каждом загрузившемся изображении сортируем readySlides по __order
        if (loaded === total) {
          readySlides.sort((a, b) => {
            if (typeof a.__order === 'number' && typeof b.__order === 'number') {
              return a.__order - b.__order;
            }
            if (typeof a.__order === 'number') return -1;
            if (typeof b.__order === 'number') return 1;
            return 0;
          });
          callback(readySlides);
        }
      };
      img.onerror = function () {
        loaded++;
        if (loaded === total) {
          readySlides.sort((a, b) => {
            if (typeof a.__order === 'number' && typeof b.__order === 'number') {
              return a.__order - b.__order;
            }
            if (typeof a.__order === 'number') return -1;
            if (typeof b.__order === 'number') return 1;
            return 0;
          });
          callback(readySlides);
        }
      };
      img.src = sliderImagesFolder + s['slide'];
    });
  }

  // [DC Source] Создание DOM для слайдера
  function buildSlider(slides) {
    // [DC Source] ГАРАНТИЯ: дополнительно сортируем slides здесь (в случае если где-то был reorder)
    slides = slides.slice().sort((a, b) => {
      if (typeof a.__order === 'number' && typeof b.__order === 'number') {
        return a.__order - b.__order;
      }
      if (typeof a.__order === 'number') return -1;
      if (typeof b.__order === 'number') return 1;
      return 0;
    });

    const sliderImages = document.getElementById('slider-images');
    if (!sliderImages) return;

    // [DC Source] Удаляем старые слайды (если есть)
    sliderImages.querySelectorAll('.slider-image, .slider-content').forEach(el => el.remove());

    // [DC Source] ДОРАБОТАНО: Создаём массив для хранения DOM-нод текстовых блоков (чтобы потом управлять их z-index)
    let contentBlocks = [];

    slides.forEach((slide, idx) => {
      // [DC Source] Картинка
      let img = document.createElement('img');
      img.src = slide.urlImg;
      img.className = 'slider-image' + (idx === 0 ? ' active' : '');

      // [DC Source] slide-effect для картинки (эффект движения/масштабирования)
      if (slide['slide-effect']) {
        img.classList.add('slide-effect-' + slide['slide-effect']);
      }

      img.alt = slide.title || `Слайд ${idx+1}`;
      img.dataset.idx = idx;
      sliderImages.appendChild(img);

      // [DC Source] Оверлей с текстом
      let content = document.createElement('div');
      content.className = 'slider-content' + (idx === 0 ? ' active' : '');

      // [DC Source] Позиционирование текста по вертикали и горизонтали через style (flex)
      let justify;
      switch((slide['text-position'] || '').toLowerCase()) {
        case 'top': justify = 'flex-start'; break;
        case 'bottom': justify = 'flex-end'; break;
        default: justify = 'center';
      }
      let align, textAlign;
      switch((slide['text-align'] || '').toLowerCase()) {
        case 'right': align = 'flex-end'; textAlign = 'right'; break;
        case 'center': align = 'center'; textAlign = 'center'; break;
        default: align = 'flex-start'; textAlign = 'left';
      }
      content.style.justifyContent = justify;
      content.style.alignItems = align;
      content.style.textAlign = textAlign;

      // [DC Source] Для каждой текстовой области применяем эффекты (индивидуально для каждого слайда)
      if (slide['slide-effect']) content.classList.add('slide-effect-' + slide['slide-effect']);
      // [DC Source] Контейнеры для title, desc, url

      // [DC Source][NEW] Разделяем title на строки по "\n" и отображаем каждую строку отдельно
      if (slide.title) {
        let titleLines = slide.title.split('\\n'); // Разделение по "\n" в строке
        titleLines.forEach(line => {
          let title = document.createElement('div');
          title.className = 'slider-title';
          if (slide['title-effects']) title.classList.add('title-effect-' + slide['title-effects']);
          title.innerText = line;
          content.appendChild(title);
        });
      }
      // [DC Source][NEW] Разделяем desc на строки по "\n" и отображаем каждую строку отдельно
      if (slide.desc) {
        let descLines = slide.desc.split('\\n'); // Разделение по "\n" в строке
        descLines.forEach(line => {
          let desc = document.createElement('div');
          desc.className = 'slider-desc';
          if (slide['desc-effects']) desc.classList.add('desc-effect-' + slide['desc-effects']);
          desc.innerText = line;
          content.appendChild(desc);
        });
      }
      // [DC Source] Кнопка Подробнее только если url не пустой и не пробел
      if (slide.url && slide.url.length > 0) {
        let btn = document.createElement('a');
        btn.className = 'slider-link';
        btn.href = slide.url;
        btn.target = '_self';
        btn.rel = 'noopener noreferrer';
        btn.innerText = 'Подробнее';
        if (slide['url-effects']) btn.classList.add('url-effect-' + slide['url-effects']);
        content.appendChild(btn);
      }
      sliderImages.appendChild(content);

      // [DC Source] ДОБАВЛЕНО: Сохраняем ссылку на текстовый блок
      contentBlocks.push(content);
    });

    // [DC Source] Слайдерная логика
    let current = 0;
    let timer = null;
    const TOTAL = slides.length;

    // [DC Source] Функция для сброса и применения эффектов к каждому слайду + управление z-index
    function applyEffects(idx) {
      let contents = sliderImages.querySelectorAll('.slider-content');
      let images = sliderImages.querySelectorAll('.slider-image');
      contents.forEach((ct, i) => {
        ct.className = 'slider-content' + (i === idx ? ' active' : '');
        let slideData = slides[i];
        if (i === idx && slideData['slide-effect']) ct.classList.add('slide-effect-' + slideData['slide-effect']);
        // title
        let t = ct.querySelector('.slider-title');
        if (t) {
          t.className = 'slider-title';
          if (i === idx && slideData['title-effects']) t.classList.add('title-effect-' + slideData['title-effects']);
        }
        // desc
        let d = ct.querySelector('.slider-desc');
        if (d) {
          d.className = 'slider-desc';
          if (i === idx && slideData['desc-effects']) d.classList.add('desc-effect-' + slideData['desc-effects']);
        }
        // url
        let u = ct.querySelector('.slider-link');
        if (u) {
          u.className = 'slider-link';
          if (i === idx && slideData['url-effects']) u.classList.add('url-effect-' + slideData['url-effects']);
        }
        // [DC Source] Управляем z-index — активный .slider-content всегда 6, остальные -1 чтобы не мешали клику и не видны были
        ct.style.zIndex = (i === idx) ? '6' : '-1';
      });
      // [DC Source] Для slide-effect — сбрасываем и применяем анимации только к активному слайду
      images.forEach((img, i) => {
        img.classList.remove(
          'slide-effect-zoom-in',
          'slide-effect-zoom-out',
          'slide-effect-pan-left',
          'slide-effect-pan-right'
        );
        if (i === idx && slides[i]['slide-effect']) {
          img.classList.add('slide-effect-' + slides[i]['slide-effect']);
        }
      });
    }

    function showSlide(idx) {
      if (idx < 0) idx = TOTAL - 1;
      if (idx >= TOTAL) idx = 0;
      // [DC Source] Слайды
      let imgs = sliderImages.querySelectorAll('.slider-image');
      let contents = sliderImages.querySelectorAll('.slider-content');
      imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
      contents.forEach((ct, i) => ct.classList.toggle('active', i === idx));
      applyEffects(idx);
      current = idx;
    }

    function nextSlide() {
      showSlide(current + 1);
      startAuto();
    }
    function prevSlide() {
      showSlide(current - 1);
      startAuto();
    }
    function startAuto() {
      stopAuto();
      let dur = Number(slides[current].duration) || defaultDuration;
      timer = setTimeout(() => {
        showSlide(current + 1);
        startAuto();
      }, dur * 1000);
    }
    function stopAuto() {
      if (timer) clearTimeout(timer);
      timer = null;
    }

    // [DC Source] SVG-стрелки — прямоугольные, минималистичные
    document.getElementById('slider-arrow-left').innerHTML =
      '<svg viewBox="0 0 32 32"><polyline points="20,8 12,16 20,24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.getElementById('slider-arrow-right').innerHTML =
      '<svg viewBox="0 0 32 32"><polyline points="12,8 20,16 12,24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    document.getElementById('slider-arrow-left').onclick = function () {
      prevSlide();
    };
    document.getElementById('slider-arrow-right').onclick = function () {
      nextSlide();
    };

    // [DC Source] Автосмена слайдов по duration
    startAuto();

    // [DC Source] Свайпы на мобильных
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
        }
      }
      startX = null;
    });

    // [DC Source] Пауза автопрокрутки на наведении на текст или кнопку
    function addPauseOnHover() {
      sliderImages.querySelectorAll('.slider-content, .slider-link').forEach(el => {
        el.addEventListener('mouseenter', stopAuto);
        el.addEventListener('mouseleave', startAuto);
        el.addEventListener('touchstart', stopAuto, {passive: true});
        el.addEventListener('touchend', startAuto, {passive: true});
      });
    }
    addPauseOnHover();
  }
});