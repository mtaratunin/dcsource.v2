//pages/static/js/active-menu.js
// [DC Source] Автоматическое выделение активного пункта меню-якоря при прокрутке страницы
document.addEventListener('DOMContentLoaded', function () {
    // Собираем все якорные пункты меню (ссылки с .dc-menu-btn и href="#...")
    const menuLinks = document.querySelectorAll('.dc-menu-btn[href^="#"]');
    // Собираем все секции-документы с нужными id
    const sections = [];
    menuLinks.forEach(link => {
        const id = link.getAttribute('href').replace('#', '');
        const section = document.getElementById(id);
        if (section) {
            sections.push({link, section});
        }
    });

    // Функция для выделения активного пункта меню
    function activateMenu() {
        let found = false;
        let scrollPosition = window.scrollY || window.pageYOffset;
        // Чуть выше, чтобы активировать пункт до верхней границы
        scrollPosition += 100;
        for (let i = sections.length - 1; i >= 0; i--) {
            const {link, section} = sections[i];
            if (section.offsetTop <= scrollPosition) {
                menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                found = true;
                break;
            }
        }
        // Если ни один не найден, снимаем выделение
        if (!found) {
            menuLinks.forEach(l => l.classList.remove('active'));
        }
    }

    // Навешиваем обработчик на скролл и при загрузке
    window.addEventListener('scroll', activateMenu);
    window.addEventListener('resize', activateMenu);
    activateMenu();

    // [DC Source] При клике по пункту меню - плавный скролл
    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const id = this.getAttribute('href').replace('#', '');
            const section = document.getElementById(id);
            if (section) {
                e.preventDefault();
                window.scrollTo({
                    top: section.offsetTop - 70, // [DC Source] учесть высоту шапки
                    behavior: 'smooth'
                });
            }
        });
    });
});