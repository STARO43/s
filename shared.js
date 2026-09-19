/* ============================================================
   SHARED.JS — общий слой для всех страниц
   ============================================================ */

/* ---------- УТИЛИТЫ ---------- */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

/* ============================================================
   АВАРИЙНЫЙ СБРОС — если что-то пойдёт не так, страница всё равно покажется.
   Срабатывает через 2.5 сек после загрузки. Если к этому моменту контент
   ещё скрыт — принудительно показываем всё.
   ============================================================ */
function emergencyReveal() {
    /* 1. Слова hero — снимаем translateY */
    document.querySelectorAll('.word-inner').forEach(el => {
        el.style.transform = 'translateY(0)';
    });

    /* 2. Контейнер страницы — снимаем opacity */
    const containers = document.querySelectorAll(
        '[data-page-content], .wrapper, .page-header, .heroes-timeline, .media-wrapper, .syllable-grid, .controls'
    );
    containers.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });

    /* 3. Логотип и бургер — снимаем скрытие */
    document.querySelectorAll('.page-logo, .page-logo .l1, .page-logo .l2, .burger-btn, .clock-side, .hero-meta, .hero-sub')
        .forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });

    /* 4. Акцентная линия — задаём ширину */
    const accent = document.getElementById('accentLine');
    if (accent) accent.style.width = '120px';

    /* 5. Лоадер — прячем */
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    /* 6. Шторки — прячем */
    document.querySelectorAll('.shutter').forEach(el => {
        el.style.transform = 'scaleY(0)';
    });
}

/* Страховочный таймер: если через 2.5 секунды страница ещё "пустая" — показываем насильно */
setTimeout(emergencyReveal, 2500);

/* ============================================================
   БУРГЕР-МЕНЮ
   ============================================================ */
function initBurger() {
    const burgerBtn  = document.getElementById('burgerBtn');
    const burgerMenu = document.getElementById('burgerMenu');
    if (!burgerBtn || !burgerMenu) return;

    function openMenu() {
        burgerMenu.classList.add('open');
        burgerBtn.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
    }
    function closeMenu() {
        burgerMenu.classList.remove('open');
        burgerBtn.classList.remove('open');
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
    }

    burgerBtn.addEventListener('click', () => {
        if (burgerMenu.classList.contains('open')) closeMenu();
        else openMenu();
    });

    document.querySelectorAll('.burger-link').forEach(link => {
        link.addEventListener('click', () => closeMenu());
    });
}

/* ============================================================
   СТАРТОВАЯ АНИМАЦИЯ
   ============================================================ */
function playPageEntryAnimation() {
    /* Если GSAP не загрузился — сразу аварийный показ */
    if (typeof gsap === 'undefined') {
        emergencyReveal();
        return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    /* 1. Шторки уезжают */
    tl.to('.shutter', {
        duration: 0.8,
        scaleY: 0,
        stagger: { amount: 0.3, from: 'center' },
        ease: 'expo.inOut'
    });

    /* 2. Проявляем контейнер */
    const pageContent =
        document.querySelector('[data-page-content]') ||
        document.querySelector('.wrapper') ||
        document.querySelector('.page-header');

    if (pageContent) tl.set(pageContent, { opacity: 1 }, '-=0.4');

    /* 3. Десктопная анимация логотипа и бургера */
    if (!IS_MOBILE) {
        if (document.querySelector('.page-logo .l1')) {
            tl.fromTo('.page-logo .l1',
                    { opacity: 0, y: 30, skewX: -6 },
                    { opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: 'power3.out' },
                    '-=0.5')
                .fromTo('.page-logo .l2',
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
                    '-=0.65');
        }

        if (document.querySelector('.burger-btn')) {
            tl.fromTo('.burger-btn',
                { opacity: 0, scale: 0.6, rotate: -90 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.65, ease: 'back.out(1.8)' },
                '-=0.55');
        }

        if (document.querySelector('.hero-meta')) {
            tl.fromTo('.hero-meta',
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.8');
        }

        if (document.getElementById('accentLine')) {
            tl.fromTo('#accentLine',
                { width: 0 },
                { width: '120px', duration: 0.8, ease: 'power3.inOut' }, '-=0.4');
        }

        if (document.querySelector('.hero-sub')) {
            tl.fromTo('.hero-sub',
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
        }
    } else {
        /* Мобила */
        if (document.querySelector('.page-logo')) {
            tl.to('.page-logo', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
        }
        if (document.querySelector('.burger-btn')) {
            tl.set('.burger-btn', { opacity: 1 });
        }
        if (document.querySelector('.hero-meta')) {
            tl.set('.hero-meta', { opacity: 1 });
        }
        if (document.querySelector('.hero-sub')) {
            tl.set('.hero-sub', { opacity: 1 });
        }
        if (document.getElementById('accentLine')) {
            tl.set('#accentLine', { width: '120px' });
        }
    }

    /* 4. Лоадер уходит */
    if (document.getElementById('loader')) {
        tl.to('#loader', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                const loader = document.getElementById('loader');
                if (loader) loader.style.display = 'none';
            }
        }, '-=0.2');
    }

    return tl;
}

/* ============================================================
   АВТОЗАПУСК
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initBurger();
    playPageEntryAnimation();
});
