/* ============================================================
   SHARED.JS — общий слой для всех страниц
   ============================================================ */

/* ---------- УТИЛИТЫ ---------- */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

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
   СТАРТОВАЯ АНИМАЦИЯ ПОЯВЛЕНИЯ СТРАНИЦЫ
   ============================================================ */
function playPageEntryAnimation() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    /* 1. Шторки уезжают */
    tl.to('.shutter', {
        duration: 0.8,
        scaleY: 0,
        stagger: { amount: 0.3, from: 'center' },
        ease: 'expo.inOut'
    });

    /* 2. Проявляем ГЛАВНЫЙ контейнер страницы.
       У разных страниц он может называться по-разному:
       — .wrapper (index, heroes, art)
       — .page-header (tools)
       — другие элементы с [data-page-content]
       Универсально: сначала ищем [data-page-content], иначе .wrapper, иначе .page-header. */
    const pageContent =
        document.querySelector('[data-page-content]') ||
        document.querySelector('.wrapper') ||
        document.querySelector('.page-header');

    if (pageContent) {
        tl.set(pageContent, { opacity: 1 }, '-=0.4');
    }

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
    } else {
        /* Мобила — лёгкий fade логотипа и мгновенный показ бургера */
        if (document.querySelector('.page-logo')) {
            tl.to('.page-logo', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
        }
        if (document.querySelector('.burger-btn')) {
            tl.set('.burger-btn', { opacity: 1 });
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
