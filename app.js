/* ============================================================
   ГРАМОТИНЬО — app.js
   ============================================================ */
'use strict';

/* ============================================================
   0. УТИЛИТЫ
   ============================================================ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;
const SPEED_MULT = IS_MOBILE ? 0.65 : 1;
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ============================================================
   0.1 ТЕМА
   ============================================================ */
function initTheme(){
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', cur);
        localStorage.setItem('theme', cur);
    });
}

/* ============================================================
   1. СТАРТОВАЯ АНИМАЦИЯ
   Бургер и тема появляются СИНХРОННО — одним твином.
   ============================================================ */
function revealHeaderControls() {
    const burger = document.getElementById('burgerBtn');
    const theme  = document.getElementById('themeToggle');
    const clock  = document.getElementById('clockSwitch');
    if (burger) burger.style.opacity = '1';
    if (theme)  theme.style.opacity  = '1';
    if (clock)  clock.style.opacity  = '1';
}

function playEntryAnimation(onDone) {
    const loader = document.getElementById('loader');
    const page = detectPage();

    if (!window.gsap) {
        if (loader) loader.style.display = 'none';
        revealHeaderControls();
        const wrap = document.getElementById('mainContent');
        if (wrap) wrap.style.opacity = '1';
        $$('.word-inner').forEach((el) => { el.style.transform = 'none'; });
        $$('.hero-meta, .hero-sub').forEach((el) => { el.style.opacity = '1'; });
        $$('.page-logo .l1, .page-logo .l2').forEach((el) => { el.style.opacity = '1'; });
        $$('.clock-switch, .clock-side, .clock-digital').forEach((el) => { el.style.opacity = '1'; });
        const acc = document.getElementById('accentLine');
        if (acc) acc.style.width = '120px';
        if (typeof onDone === 'function') onDone();
        return;
    }

    const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        onComplete: () => { if (typeof onDone === 'function') onDone(); }
    });

    tl.to('.shutter', {
        duration: 0.8,
        scaleY: 0,
        stagger: { amount: 0.3, from: 'center' },
        ease: 'expo.inOut'
    });

    if (page === 'home') {
        tl.set('#mainContent', { opacity: 1 })
          .to('.word-inner', {
              y: '0%',
              duration: 1.1,
              stagger: 0.08,
              ease: 'elastic.out(1, 0.6)'
          }, '-=0.4')
          .to('.hero-meta', {
              opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
          }, '-=0.8')
          .to('#accentLine', {
              width: '120px', duration: 0.8, ease: 'power3.inOut'
          }, '-=0.4')
          .to('.hero-sub', {
              opacity: 1, x: 0, duration: 0.8, ease: 'power3.out'
          }, '-=0.6')
          .to('.burger-btn, .theme-toggle', {
              opacity: 1, duration: 0.6, ease: 'power2.out'
          }, '-=0.5');
    } else if (page === 'games') {
        /* На games.html нет шапки, лоадера и меню — просто показываем кнопки */
        revealHeaderControls();
        tl.to('#loader', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => { if (loader) loader.style.display = 'none'; }
        });
    } else {
        tl.fromTo('.page-logo .l1',
              { opacity: 0, y: 30, skewX: -6 },
              { opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: 'power3.out' },
              '-=0.5')
          .fromTo('.page-logo .l2',
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
              '-=0.65')
          .to('.burger-btn, .theme-toggle', {
              opacity: 1, duration: 0.6, ease: 'power2.out'
          }, '-=0.55');

        if (page === 'tools') {
            tl.fromTo('.clock-switch',
                  { opacity: 0, scale: 0.6, rotate: -90 },
                  { opacity: 1, scale: 1, rotate: 0, duration: 0.65, ease: 'back.out(1.8)' },
                  '-=0.5');
        }
    }

    if (page !== 'games') {
        tl.to('#loader', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => { if (loader) loader.style.display = 'none'; }
        }, '-=0.2');
    }
}

/* ============================================================
   2. БУРГЕР-МЕНЮ
   ============================================================ */
let _menuBound = false;

function openMenu() {
    const menu = document.getElementById('burgerMenu');
    const btn  = document.getElementById('burgerBtn');
    if (!menu || !btn) return;
    menu.classList.add('open');
    btn.classList.add('open');
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function closeMenu() {
    const menu = document.getElementById('burgerMenu');
    const btn  = document.getElementById('burgerBtn');
    if (!menu || !btn) return;
    menu.classList.remove('open');
    btn.classList.remove('open');
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

function initBurger() {
    const btn  = document.getElementById('burgerBtn');
    const menu = document.getElementById('burgerMenu');
    if (!btn || !menu || _menuBound) return;
    _menuBound = true;

    btn.addEventListener('click', () => {
        if (menu.classList.contains('open')) closeMenu();
        else openMenu();
    });

    $$('.burger-link').forEach((link) => {
        link.addEventListener('click', () => {
            window.location.href = link.href;
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });
}

/* ============================================================
   3. ЗАКРЫТИЕ МОДАЛОК
   ============================================================ */
function closeAllModals() {
    $$('.media-player-overlay.show, .parents-reader-overlay.show').forEach((el) => {
        el.classList.remove('show');
        el.setAttribute('aria-hidden', 'true');
    });
    const frame = document.getElementById('mediaPlayerFrame');
    if (frame) frame.src = 'about:blank';
    const hm = document.querySelector('.hero-modal');
    if (hm) hm.remove();
    const evm = document.getElementById('evmOverlay');
    if (evm) evm.style.display = 'none';
    const termRead = document.getElementById('termOverlay');
    if (termRead) termRead.classList.remove('show');
    const art = document.getElementById('artCanvas');
    if (art) art.classList.remove('show');
    document.body.style.overflow = '';
}

/* ============================================================
   4. КИБЕР-МЕРЦАНИЕ
   ============================================================ */
function triggerCyberFlicker(el, durationMs = 1700) {
    if (!el) return;
    el.classList.add('cyber-flicker');
    setTimeout(() => el.classList.remove('cyber-flicker'), durationMs);
}

/* ============================================================
   5. ТОСТЫ
   ============================================================ */
function ensureToastContainer() {
    let c = document.querySelector('.toast-container');
    if (!c) {
        c = document.createElement('div');
        c.className = 'toast-container';
        document.body.appendChild(c);
    }
    return c;
}
function showToast(text) {
    const c = ensureToastContainer();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    t.style.opacity = '0';
    t.style.transform = 'translateY(12px)';
    t.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    c.appendChild(t);
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-8px)';
        setTimeout(() => t.remove(), 320);
    }, 2100);
}
window.showToast = showToast;

/* ============================================================
   6. ИНИЦИАЛИЗАЦИЯ СТРАНИЦ
   ============================================================ */
const _inited = new Set();
function once(key, fn) {
    if (_inited.has(key)) return;
    _inited.add(key);
    try { fn(); } catch (err) { console.error('[init ' + key + ']', err); }
}

/* ---------- 6.1 INDEX ---------- */
function initHome() {
    once('home', () => {
        const terminalWord = document.getElementById('terminalWord');
        const evmOverlay   = document.getElementById('evmOverlay');
        const evmBody      = document.getElementById('evmBody');
        const evmClock     = document.getElementById('evmClock');
        const evmDate      = document.getElementById('evmDate');
        if (!evmOverlay || !evmBody) return;

        let terminalOpened  = false;
        let terminalStarted = false;

        function updateClock() {
            const d = new Date();
            const p = (n) => String(n).padStart(2, '0');
            if (evmClock) evmClock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
            if (evmDate)  evmDate.textContent  = `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
        }
        setInterval(updateClock, 1000);
        updateClock();

        const scrollTerm = () => { evmBody.scrollTop = evmBody.scrollHeight; };

        function formatRuDate(d) {
            const p = (n) => String(n).padStart(2, '0');
            return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
        }

        async function typeLine(text, opts = {}) {
            const { speed = 18, cls = '' } = opts;
            const realSpeed = Math.max(1, Math.round(speed * SPEED_MULT));
            const line = document.createElement('div');
            line.className = 'term-line ' + cls;
            evmBody.appendChild(line);
            const chars = Array.from(text);
            for (let i = 0; i < chars.length; i++) {
                line.textContent += chars[i];
                scrollTerm();
                await sleep(realSpeed);
            }
            scrollTerm();
            return line;
        }

        function printLine(text, cls = '') {
            const line = document.createElement('div');
            line.className = 'term-line ' + cls;
            line.textContent = text;
            evmBody.appendChild(line);
            scrollTerm();
            return line;
        }

        const ASCII_ART = [
            '█████ ████   ███  █   █  ███  █████ █   █ █   █ █      ███ ',
            '█     █   █ █   █ ██ ██ █   █   █   ██  █ █   █ █     █   █',
            '█     ████  █████ █ █ █ █   █   █   █ █ █ █████ ████  █   █',
            '█     █   █ █   █ █   █ █   █   █   █  ██ █   █ █   █ █   █',
            '█     █   █ █   █ █   █  ███    █   █   █ █   █ ████   ███ '
        ];

        const ROUTES = {
            'слоги':       'reading.html',
            'часы':        'tools.html',
            'личности':    'heroes.html',
            'картины':     'art.html',
            'мульты':      'cinema.html',
            'мультфильмы': 'cinema.html',
            'игры':        'games.html',
            'стихи':       'poetry.html',
            'воспитание':  'articles.html'
        };

        const COMMANDS_LIST = [
            ['СЛОГИ',       'ОБУЧЕНИЕ ЧТЕНИЮ'],
            ['ЧАСЫ',        'АНАЛОГОВЫЕ ЧАСЫ'],
            ['ЛИЧНОСТИ',    'ВЕЛИКИЕ ЛИЧНОСТИ РОДИНЫ'],
            ['КАРТИНЫ',     'ЖИВОПИСЬ ТВОРЧЕСКОГО ПОДЪЁМА'],
            ['МУЛЬТФИЛЬМЫ', 'РЕКОМЕНДОВАННЫЕ МУЛЬТФИЛЬМЫ'],
            ['ИГРЫ',        'ИГРОВОЙ РАЗДЕЛ'],
            ['СТИХИ',       'ЧТЕНИЕ ПОЭЗИИ'],
            ['ВОСПИТАНИЕ',  'СТАТЬИ О ВОСПИТАНИИ'],
            ['ВЫХОД',       'ЗАВЕРШИТЬ РАБОТУ']
        ];

        function openTerminal() {
            if (terminalOpened) return;
            terminalOpened = true;
            evmOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            startTerminal();
        }
        function closeTerminal() {
            evmOverlay.style.display = 'none';
            document.body.style.overflow = '';
            terminalOpened  = false;
            terminalStarted = false;
            evmBody.innerHTML = '';
        }

        function navigateWithEffect(href) {
            closeTerminal();
            window.location.href = href;
        }

        async function startTerminal() {
            if (terminalStarted) return;
            terminalStarted = true;
            await sleep(200);

            const frame = document.createElement('div');
            frame.className = 'term-frame';
            const pre = document.createElement('pre');
            pre.className = 'term-ascii';
            frame.appendChild(pre);
            evmBody.appendChild(frame);
            scrollTerm();

            for (const line of ASCII_ART) {
                pre.textContent += line + '\n';
                scrollTerm();
                await sleep(45);
            }
            await sleep(420);

            await typeLine('ЭЛЕКТРОННО-ВЫЧИСЛИТЕЛЬНАЯ МАШИНА ----- ПУСК СИСТЕМЫ', { speed: 20 });
            await sleep(180);
            await typeLine('ДАТА: ' + formatRuDate(new Date()), { speed: 10 });
            await typeLine('ОПЕРАТОР ---------- ГОСТЬ@ГРАМОТИНЬО', { speed: 19 });
            await sleep(300);
            await typeLine('ТЕСТ ОЗУ ---------- БЕЗ ДЕФЕКТОВ', { speed: 9 });
            await sleep(200);
            await typeLine('ТЕСТ ПЗУ ---------- БЕЗ ДЕФЕКТОВ', { speed: 19 });
            await sleep(200);
            await typeLine('ТЕСТ ПРОЦЕССОРА --- БЕЗ ДЕФЕКТОВ', { speed: 30 });
            await sleep(200);
            await typeLine('ЗАГРУЗКА МОДУЛЕЙ ------------ МОДУЛИ ЗАГРУЖЕНЫ', { speed: 25 });
            await sleep(320);
            await typeLine('СОСТАВИТЕЛЬ ----------------- @VNVAX ДЛЯ ТЕЛЕГРАМ.', { speed: 33 });
            await sleep(220);
            await typeLine('СПИСОК КОМАНД --------------- СПРАВКА', { speed: 15 });
            await typeLine('ЗАВЕРШЕНИЕ РАБОТЫ ----------- ВЫХОД', { speed: 15 });
            await sleep(420);
            createInputLine();
        }

        function createInputLine() {
            const line = document.createElement('div');
            line.className = 'term-line term-input-line';

            const prompt = document.createElement('span');
            prompt.textContent = 'ГОСТЬ@ГРАМОТИНЬО:~#\u00A0';

            const mirror = document.createElement('span');
            mirror.className = 'term-mirror';
            mirror.id = 'termMirror';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'term-input';
            input.id = 'termInput';
            input.autocomplete = 'off';
            input.autocapitalize = 'off';
            input.spellcheck = false;

            const caret = document.createElement('span');
            caret.className = 'term-caret';

            line.appendChild(prompt);
            line.appendChild(mirror);
            line.appendChild(caret);
            line.appendChild(input);
            evmBody.appendChild(line);
            scrollTerm();

            input.addEventListener('input', () => {
                mirror.textContent = input.value;
                input.style.width = '0';
                scrollTerm();
            });
            input.addEventListener('keydown', (e) => handleInputKey(e, mirror));

            setTimeout(() => {
                try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
                scrollTerm();
            }, 50);
        }

        async function handleInputKey(e, mirror) {
            if (e.key !== 'Enter') return;
            const input = e.target;
            const value = input.value.trim();
            input.disabled = true;

            const line = input.parentNode;
            const caret = line.querySelector('.term-caret');
            if (caret) caret.remove();
            if (mirror) mirror.remove();

            const frozen = document.createElement('span');
            frozen.textContent = value;
            input.replaceWith(frozen);
            scrollTerm();

            await processCommand(value);
        }

        async function processCommand(raw) {
            const cmd = raw.toLowerCase().replace(/\s+/g, ' ').trim();
            if (!cmd) { createInputLine(); return; }

            if (cmd === 'выход' || cmd === 'exit' || cmd === 'quit') {
                await typeLine('ЗАВЕРШЕНИЕ РАБОТЫ...', { speed: 12 });
                await sleep(300);
                await typeLine('СЕАНС ОКОНЧЕН ---- 000', { speed: 14 });
                await sleep(600);
                closeTerminal();
                return;
            }

            if (cmd === 'справка' || cmd === 'help' || cmd === '?' || cmd === 'помощь') {
                await sleep(120);
                await typeLine('СПИСОК ДОСТУПНЫХ КОМАНД:', { speed: 10 });
                await sleep(120);

                const list = document.createElement('div');
                list.className = 'term-list';
                evmBody.appendChild(list);
                scrollTerm();

                for (const [name, desc] of COMMANDS_LIST) {
                    const item = document.createElement('div');
                    item.className = 'term-list-item';

                    const n = document.createElement('span');
                    n.className = 'cmd-name';
                    n.textContent = name;

                    const d = document.createElement('span');
                    d.className = 'cmd-desc';
                    d.textContent = desc;

                    item.appendChild(n);
                    item.appendChild(d);
                    list.appendChild(item);
                    scrollTerm();

                    const key = name.toLowerCase();
                    if (ROUTES[key]) {
                        item.addEventListener('click', () => navigateWithEffect(ROUTES[key]));
                    } else if (key === 'выход') {
                        item.addEventListener('click', () => {
                            const inp = document.getElementById('termInput');
                            if (inp) {
                                inp.value = 'выход';
                                const m = document.getElementById('termMirror');
                                if (m) m.textContent = 'выход';
                                inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                            } else {
                                processCommand('выход');
                            }
                        });
                    }
                    await sleep(60);
                }
                await sleep(140);
                createInputLine();
                return;
            }

            if (cmd === 'очистить' || cmd === 'clear' || cmd === 'cls') {
                evmBody.innerHTML = '';
                createInputLine();
                return;
            }

            if (ROUTES[cmd]) {
                await typeLine(`ЗАПУСК МОДУЛЯ «${cmd.toUpperCase()}»...`, { speed: 12 });
                await sleep(320);
                navigateWithEffect(ROUTES[cmd]);
                return;
            }

            await sleep(90);
            await typeLine(`НЕИЗВЕСТНАЯ КОМАНДА: ${raw}`, { speed: 12 });
            await sleep(80);
            await typeLine('ВВЕДИТЕ "СПРАВКА" ДЛЯ СПИСКА КОМАНД.', { speed: 12 });
            createInputLine();
        }

        evmBody.addEventListener('click', (e) => {
            if (e.target.closest('.term-list-item')) return;
            const inp = document.getElementById('termInput');
            if (inp && !inp.disabled) inp.focus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && terminalOpened) closeTerminal();
        });

        if (terminalWord) {
            terminalWord.addEventListener('click', openTerminal);
        }
        window.__gramotinoHomeCloseTerminal = closeTerminal;
    });
}

/* ---------- 6.2 READING ---------- */
function initReading() {
    once('reading', () => {
        const rawItems = ['ЁЖ', 'ёлка', 'ЁН', 'АБ', 'АВ', 'АГ', 'АЗ', 'АК', 'АЛ', 'Алла', 'АМ', 'АН', 'Анна', 'АП', 'арка', 'арфа', 'АС', 'АТ', 'АХ', 'АЧ', 'АШ', 'БА', 'БАК', 'БАЯН', 'БЕ', 'БИ', 'БО', 'БОК', 'БОР', 'Боря', 'БЫ', 'БЫК', 'БЭ', 'БЯ', 'ВА', 'Валя', 'ВЕ', 'ВЕЕР', 'ВИ', 'Витя', 'Вова', 'ВОЗ', 'ВОЛ', 'ВОЛК', 'ВУ', 'ВЫ', 'ВЭ', 'ВЮ', 'ГА', 'ГАЗ', 'Галя', 'ГЕ', 'Гена', 'ГИ', 'ГО', 'ГОД', 'ГЫ', 'ГЭ', 'ДА', 'ДИ', 'ДОМ', 'ДУ', 'ДУБ', 'ДУШ', 'ДЫ', 'ДЫМ', 'ДЭ', 'ДЮ', 'ДЯ', 'ЕГ', 'ЕЖ', 'ЕЛ', 'ЕМ', 'ЕН', 'ЕР', 'ЕС', 'если', 'ЕТ', 'ЕФ', 'ЕХ', 'ЕЦ', 'ЕЧ', 'ЕШ', 'ЖА', 'Женя', 'ЖИ', 'ЖО', 'ЖУ', 'ЖУК', 'ЖЭ', 'ЗА', 'ЗИ', 'Зина', 'ЗО', 'ЗУ', 'ЗЫ', 'ЗЭ', 'ЗЮ', 'ЗЯ', 'ИБ', 'ИВ', 'игра', 'ИЖ', 'ИК', 'икра', 'ИЛ', 'ИМ', 'ИН', 'ИР', 'ИС', 'ИТ', 'ИФ', 'ИЧ', 'ИШ', 'ЙОД', 'КА', 'Катя', 'КЕ', 'КИ', 'КИТ', 'КОЛ', 'Коля', 'КОМ', 'КОТ', 'КОФЕ', 'КРАЙ', 'КРАН', 'КУ', 'КЫ', 'КЭ', 'ЛЁ', 'Лёва', 'Лёша', 'ЛАК', 'ЛЕ', 'ЛЕВ', 'Лена', 'ЛЕС', 'ЛЕЩ', 'ЛИ', 'ЛИФТ', 'ЛО', 'ЛОМ', 'ЛУ', 'ЛЫ', 'ЛЫЖИ', 'ЛЭ', 'ЛЮ', 'Люба', 'Люда', 'ЛЮК', 'ЛЯ', 'МА', 'МАК', 'МЕ', 'МЕЛ', 'МЕХ', 'МЕЧ', 'МИ', 'Миша', 'МО', 'МОХ', 'МУ', 'МУХА', 'МЫ', 'МЫЛО', 'МЫС', 'МЭ', 'МЯ', 'МЯЧ', 'НЁ', 'НА', 'НЕ', 'Нина', 'НО', 'НОЖ', 'НОС', 'НУ', 'НЫ', 'НЭ', 'НЯ', 'одна', 'ОЖ', 'ОКНО', 'ОЛ', 'ОМ', 'ОН', 'ОП', 'ОР', 'ОС', 'ОФ', 'ОХ', 'ОЧ', 'очки', 'ОШ', 'ПА', 'ПАУК', 'ПЕРО', 'Петя', 'ПИ', 'ПУ', 'ПУХ', 'ПЫ', 'ПЭ', 'ПЯ', 'РА', 'РАК', 'РИ', 'РИС', 'РО', 'Рома', 'РОТ', 'РУ', 'РЫ', 'РЫБА', 'РЭ', 'РЮ', 'РЯ', 'СЁ', 'СА', 'Саша', 'СЕ', 'СИ', 'СОК', 'СОМ', 'СОР', 'СТУЛ', 'СУ', 'СУК', 'СУП', 'СЫ', 'СЫР', 'СЭ', 'СЮ', 'СЯ', 'Тёма', 'ТА', 'ТАЗ', 'Таня', 'ТЕ', 'ТИ', 'ТО', 'Толя', 'Тома', 'ТОРТ', 'ТРОС', 'ТУ', 'ТЫ', 'ТЭ', 'ТЮ', 'ТЯ', 'УБ', 'УГОЛ', 'УЖ', 'УЛ', 'УМ', 'УН', 'УР', 'урна', 'УС', 'УТ', 'утка', 'утро', 'УФ', 'УХ', 'УХО', 'УЧ', 'УШ', 'ушко', 'ФА', 'ФЕ', 'Федя', 'ФИ', 'ФО', 'ФУ', 'ФЫ', 'ФЭ', 'ХА', 'ХЕ', 'ХО', 'ХУ', 'ХЫ', 'ХЭ', 'ЦА', 'ЦЕ', 'ЦИ', 'ЦО', 'ЦУ', 'ЦЭ', 'ЧА', 'ЧАЙ', 'ЧЕК', 'ЧИ', 'ЧУ', 'ЧЭ', 'ША', 'ШАГ', 'ШЕ', 'ШИ', 'ШОВ', 'ШУ', 'ШЭ', 'ЩИ', 'ЩИТ', 'ЫВ', 'ЫК', 'ЫМ', 'ЫН', 'ЫС', 'ЫТ', 'ЫХ', 'ЭБ', 'ЭК', 'ЭЛ', 'ЭМ', 'ЭН', 'ЭП', 'ЭР', 'ЭС', 'ЭТ', 'ЭФ', 'ЭХ', 'ЭЦ', 'юбка', 'ЮГ', 'юнга', 'ЯБ', 'ЯВ', 'ЯД', 'ЯК', 'ЯЛ', 'ЯМ', 'ЯН', 'ЯП', 'ЯР', 'ЯС', 'ЯТ', 'ЯХ', 'яхта', 'ЯЦ'];

        const syllables = rawItems.sort((a, b) => {
            const l = a.length - b.length;
            if (l !== 0) return l;
            return a.localeCompare(b, 'ru', { sensitivity: 'base' });
        });

        const grid = document.getElementById('syllableGrid');
        if (!grid) return;

        ensureToastContainer();

        const normalBtnWrap   = document.getElementById('normalBtn')?.closest('.ibtn-wrap');
        const randomBtnWrap   = document.getElementById('randomBtn')?.closest('.ibtn-wrap');
        const normalBtn       = document.getElementById('normalBtn');
        const randomBtn       = document.getElementById('randomBtn');
        const hideLearnedBtn  = document.getElementById('hideLearnedBtn');
        const hideWrap        = hideLearnedBtn?.closest('.ibtn-wrap');
        const clearLearnedBtn = document.getElementById('clearLearnedBtn');
        const examBtn         = document.getElementById('examBtn');
        const dictationBtn    = document.getElementById('dictationBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressLabel   = document.getElementById('progressLabel');
        const progressFill    = document.getElementById('progressFill');
        const termOverlay     = document.getElementById('termOverlay');
        const termBody        = document.getElementById('termBody');
        const termExit        = document.getElementById('termExit');

        let currentMode = 'all';
        let randomItems = [];
        let currentAudio = null;
        let progressTimer = null;
        let examQuestions = [], examIndex = 0, examScore = 0, currentExamCorrect = '';
        let dictationQuestions = [], dictationIndex = 0, dictationScore = 0;
        let dictationCurrent = '', dictationInput = [], dictationLocked = false, dictationAudio = null;
        let dictationLayout = 'alpha';
        let termMode = null;

        const audioCache = {};
        const AUDIO_CACHE_LIMIT = 60;

        function loadLearnedSet() {
            try { return new Set(JSON.parse(localStorage.getItem('learned_syllables') || '[]')); }
            catch { return new Set(); }
        }
        function saveLearnedSet(s) { localStorage.setItem('learned_syllables', JSON.stringify(Array.from(s))); }
        let learnedSet = loadLearnedSet();

        function refreshProgressData() {
            const t = syllables.length;
            const m = [...syllables].filter((s) => learnedSet.has(s)).length;
            const p = t ? Math.round((m / t) * 100) : 0;
            if (progressLabel) progressLabel.textContent = `${m} / ${t}`;
            if (progressFill)  progressFill.style.width = p + '%';
        }
        function flashProgress() {
            refreshProgressData();
            if (!progressContainer) return;
            progressContainer.classList.add('show');
            clearTimeout(progressTimer);
            progressTimer = setTimeout(() => progressContainer.classList.remove('show'), 2200);
        }

        function renderGrid() {
            const items = currentMode === 'random' ? randomItems : syllables;
            const frag = document.createDocumentFragment();
            items.forEach((syllable, idx) => {
                const item = document.createElement('span');
                item.className = 'syllable-item';
                item.dataset.syllable = syllable;
                if (learnedSet.has(syllable)) item.classList.add('learned');

                const dot = document.createElement('span');
                dot.className = 'syllable-dot';
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleLearned(syllable, item);
                });

                const txt = document.createElement('span');
                txt.className = 'syllable-text';
                txt.textContent = syllable;

                item.appendChild(dot);
                item.appendChild(txt);
                item.addEventListener('click', () => handleSyllableClick(syllable, item));
                frag.appendChild(item);

                if (idx < items.length - 1) {
                    const sep = document.createElement('span');
                    sep.className = 'syllable-sep';
                    sep.textContent = '·';
                    frag.appendChild(sep);
                }
            });
            grid.innerHTML = '';
            grid.appendChild(frag);
            refreshProgressData();
        }

        function toggleLearned(s, item) {
            if (learnedSet.has(s)) learnedSet.delete(s); else learnedSet.add(s);
            saveLearnedSet(learnedSet);
            item.classList.toggle('learned', learnedSet.has(s));
            flashProgress();
        }

        function playAudio(s, vol) {
            if (currentAudio) { try { currentAudio.pause(); } catch (e) {} }
            let a = audioCache[s];
            if (!a) {
                a = new Audio('audio/' + s + '.mp3');
                a.preload = 'auto';
                audioCache[s] = a;
                const keys = Object.keys(audioCache);
                if (keys.length > AUDIO_CACHE_LIMIT) {
                    const firstKey = keys[0];
                    if (firstKey !== s) {
                        try { audioCache[firstKey].pause(); } catch (e) {}
                        delete audioCache[firstKey];
                    }
                }
            }
            try { a.currentTime = 0; } catch (e) {}
            a.volume = (typeof vol === 'number') ? vol : 1;
            currentAudio = a;
            a.play().catch(() => {});
        }

        function handleSyllableClick(s, item) {
            item.classList.add('playing');
            setTimeout(() => item.classList.remove('playing'), 450);
            play
