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
    btn.style.opacity = '1';
    btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', cur);
        localStorage.setItem('theme', cur);
    });
}

/* ============================================================
   1. СТАРТОВАЯ АНИМАЦИЯ
   ============================================================ */
function playEntryAnimation(onDone) {
    const loader = document.getElementById('loader');
    const page = detectPage();

    if (!window.gsap) {
        if (loader) loader.style.display = 'none';
        const btn = document.getElementById('burgerBtn');
        if (btn) btn.style.opacity = '1';
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
    } else {
        tl.fromTo('.page-logo .l1',
              { opacity: 0, y: 30, skewX: -6 },
              { opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: 'power3.out' },
              '-=0.5')
          .fromTo('.page-logo .l2',
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
              '-=0.65')
          .fromTo('.burger-btn, .theme-toggle',
              { opacity: 0, scale: 0.6, rotate: -90 },
              { opacity: 1, scale: 1, rotate: 0, duration: 0.65, ease: 'back.out(1.8)' },
              '-=0.55');

        if (page === 'tools') {
            tl.fromTo('.clock-switch',
                  { opacity: 0, scale: 0.6, rotate: -90 },
                  { opacity: 1, scale: 1, rotate: 0, duration: 0.65, ease: 'back.out(1.8)' },
                  '-=0.5');
        }
    }

    tl.to('#loader', {
        opacity: 0,
        duration: 0.3,
        onComplete: () => { if (loader) loader.style.display = 'none'; }
    }, '-=0.2');
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
            'слоги':      'reading.html',
            'часы':       'tools.html',
            'личности':   'heroes.html',
            'картины':    'art.html',
            'мульты':     'cinema.html',
            'стихи':      'poetry.html',
            'воспитание': 'articles.html'
        };

        const COMMANDS_LIST = [
            ['СЛОГИ',      'ОБУЧЕНИЕ ЧТЕНИЮ'],
            ['ЧАСЫ',       'АНАЛОГОВЫЕ ЧАСЫ'],
            ['ЛИЧНОСТИ',   'ВЕЛИКИЕ ЛИЧНОСТИ РОДИНЫ'],
            ['КАРТИНЫ',    'ЖИВОПИСЬ ТВОРЧЕСКОГО ПОДЪЁМА'],
            ['МУЛЬТЫ',     'РЕКОМЕНДОВАННЫЕ МУЛЬТФИЛЬМЫ'],
            ['СТИХИ',      'ЧТЕНИЕ ПОЭЗИИ'],
            ['ВОСПИТАНИЕ', 'СТАТЬИ О ВОСПИТАНИИ'],
            ['ВЫХОД',      'ЗАВЕРШИТЬ РАБОТУ']
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
            playAudio(s);
        }

        function setModeActive(wrapEl, btnEl) {
            [normalBtnWrap, randomBtnWrap].forEach((w) => w && w.classList.remove('active'));
            [normalBtn, randomBtn].forEach((b) => b && b.classList.remove('active'));
            if (wrapEl) wrapEl.classList.add('active');
            if (btnEl)  btnEl.classList.add('active');
        }

        if (normalBtn) {
            normalBtn.addEventListener('click', () => {
                currentMode = 'all';
                setModeActive(normalBtnWrap, normalBtn);
                renderGrid();
            });
        }
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                currentMode = 'random';
                const s = syllables.slice().sort(() => Math.random() - 0.5);
                randomItems = s.slice(0, Math.min(10, s.length));
                setModeActive(randomBtnWrap, randomBtn);
                renderGrid();
            });
        }
        if (hideLearnedBtn) {
            hideLearnedBtn.addEventListener('click', () => {
                const isActive = !hideLearnedBtn.classList.contains('active');
                hideLearnedBtn.classList.toggle('active', isActive);
                if (hideWrap) hideWrap.classList.toggle('active', isActive);
                grid.classList.toggle('hide-learned', isActive);
            });
        }
        if (clearLearnedBtn) {
            clearLearnedBtn.addEventListener('click', () => {
                learnedSet.clear();
                saveLearnedSet(learnedSet);
                renderGrid();
                flashProgress();
                showToast('ПРОГРЕСС ОЧИЩЕН');
            });
        }

        /* ====================================================
           НОВЫЙ QUIZ / DICT — дизайн-оверлеи
           + двойной клик по кнопкам = пасхалка на терминал
           ==================================================== */
        const qdOverlay = document.getElementById('qdOverlay');
        const qdClose   = document.getElementById('qdClose');
        const qdBody    = document.getElementById('qdBody');
        const qdLabel   = document.getElementById('qdLabel');
        const qdTitle   = document.getElementById('qdTitle');
        const qdFill    = document.getElementById('qdProgressFill');
        const qdCounter = document.getElementById('qdCounter');

        let qdMode = null; // 'quiz' | 'dict'
        let qdLocked = false;

        function openQD(mode){
            if (!qdOverlay) return;
            qdMode = mode;
            qdLocked = false;
            qdOverlay.classList.add('show');
            qdOverlay.setAttribute('aria-hidden','false');
            document.body.style.overflow = 'hidden';
            if (mode === 'quiz'){
                if (qdLabel) qdLabel.innerHTML = '<span class="dot"></span><span>ВИКТОРИНА · РАСПОЗНАВАНИЕ</span>';
                if (qdTitle) qdTitle.textContent = 'ЧТО?';
                startQuizQD();
            } else {
                if (qdLabel) qdLabel.innerHTML = '<span class="dot"></span><span>ДИКТАНТ</span>';
                if (qdTitle) qdTitle.textContent = 'ЧТО?';
                startDictQD();
            }
        }
        function closeQD(){
            if (!qdOverlay) return;
            qdOverlay.classList.remove('show');
            qdOverlay.setAttribute('aria-hidden','true');
            document.body.style.overflow = '';
            qdMode = null;
            if (currentAudio) { try { currentAudio.pause(); } catch(e){} }
            if (dictationAudio) { try { dictationAudio.pause(); } catch(e){} }
        }
        if (qdClose) qdClose.addEventListener('click', closeQD);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && qdOverlay && qdOverlay.classList.contains('show')) closeQD();
        });

        function qdSetProgress(cur, total){
            if (qdFill) qdFill.style.width = total ? (cur/total*100) + '%' : '0%';
            if (qdCounter) qdCounter.innerHTML = `ВОПРОС <b>${Math.min(cur+1,total)}</b> ИЗ <b>${total}</b>`;
        }

        /* ---------- QUIZ ---------- */
        function startQuizQD(){
            examQuestions = syllables.slice().sort(() => Math.random() - 0.5).slice(0, 10);
            examIndex = 0;
            examScore = 0;
            showQuizQD();
        }

        function showQuizQD(){
            if (!qdBody) return;
            qdBody.innerHTML = '';
            if (examIndex >= examQuestions.length){
                showQDResult(examScore, 10);
                return;
            }
            qdSetProgress(examIndex, examQuestions.length);
            const correct = examQuestions[examIndex];
            currentExamCorrect = correct;

            const inner = document.createElement('div');
            inner.className = 'qd-inner';

            const audioBtn = document.createElement('button');
            audioBtn.type = 'button';
            audioBtn.className = 'qd-audio';
            audioBtn.innerHTML = '<span class="ico"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg></span><span>ПРОСЛУШАТЬ</span>';
            audioBtn.addEventListener('click', () => playAudio(correct));
            inner.appendChild(audioBtn);

            const variants = new Set([correct]);
            const fl = correct.charAt(0).toUpperCase();
            const slp = syllables.filter((i) => i !== correct && i.charAt(0).toUpperCase() === fl);
            slp.sort(() => Math.random() - 0.5).slice(0, 5).forEach((i) => variants.add(i));
            const fp = syllables.filter((i) => !variants.has(i));
            while (variants.size < 6 && fp.length > 0) {
                const ri = fp[Math.floor(Math.random() * fp.length)];
                variants.add(ri);
                fp.splice(fp.indexOf(ri), 1);
            }
            const va = [...variants].sort(() => Math.random() - 0.5);

            const opts = document.createElement('div');
            opts.className = 'qd-options';
            va.forEach((v) => {
                const b = document.createElement('button');
                b.className = 'qd-opt';
                b.type = 'button';
                b.textContent = v.toUpperCase();
                b.addEventListener('click', () => handleQuizAnswer(b, v, correct, opts));
                opts.appendChild(b);
            });
            inner.appendChild(opts);
            qdBody.appendChild(inner);
            playAudio(correct);
        }

        function handleQuizAnswer(btn, sel, correct, opts){
            if (qdLocked) return;
            qdLocked = true;
            opts.querySelectorAll('.qd-opt').forEach((o) => o.disabled = true);
            if (sel === correct){
                btn.classList.add('correct');
                examScore++;
            } else {
                btn.classList.add('wrong');
                opts.querySelectorAll('.qd-opt').forEach((o) => {
                    if (o.textContent === correct.toUpperCase()) o.classList.add('reveal');
                });
                playAudio('Не-то', 0.35);
            }
            showNextButton(() => {
                qdLocked = false;
                examIndex++;
                showQuizQD();
            });
        }

        /* ---------- DICT ---------- */
        const ALPHA_LAYOUT = ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я'];
        const QWERTY_ROW1 = ['Й','Ц','У','К','Е','Н','Г','Ш','Щ','З','Х','Ъ'];
        const QWERTY_ROW2 = ['Ф','Ы','В','А','П','Р','О','Л','Д','Ж','Э'];
        const QWERTY_ROW3 = ['Я','Ч','С','М','И','Т','Ь','Б','Ю'];

        function startDictQD(){
            const pool = syllables.filter((s) => /^[А-Яа-яЁё]{2,4}$/.test(s));
            dictationQuestions = pool.slice().sort(() => Math.random() - 0.5).slice(0, 10);
            dictationIndex = 0;
            dictationScore = 0;
            dictationLayout = 'alpha';
            showDictQD();
        }

        function showDictQD(){
            if (!qdBody) return;
            qdBody.innerHTML = '';
            qdLocked = false;
            if (dictationIndex >= dictationQuestions.length){
                showQDResult(dictationScore, 10);
                return;
            }
            qdSetProgress(dictationIndex, dictationQuestions.length);
            dictationCurrent = dictationQuestions[dictationIndex];
            dictationInput = [];

            const inner = document.createElement('div');
            inner.className = 'qd-inner';

            const audioBtn = document.createElement('button');
            audioBtn.type = 'button';
            audioBtn.className = 'qd-audio';
            audioBtn.innerHTML = '<span class="ico"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg></span><span>ПРОСЛУШАТЬ</span>';
            audioBtn.addEventListener('click', () => playDictAudio());
            inner.appendChild(audioBtn);

            const slotLine = document.createElement('div');
            slotLine.className = 'qd-slot-line';
            inner.appendChild(slotLine);

            const kb = document.createElement('div');
            kb.className = 'qd-keyboard';
            inner.appendChild(kb);

            qdBody.appendChild(inner);

            renderDictSlotsQD();
            renderDictKeyboardQD();

            setTimeout(() => playDictAudio(), 250);
        }

        function renderDictSlotsQD(){
            const line = qdBody.querySelector('.qd-slot-line');
            if (!line) return;
            line.innerHTML = '';
            const total = dictationCurrent.length;
            for (let i = 0; i < total; i++){
                const s = document.createElement('span');
                s.className = 'qd-slot' + (dictationInput[i] ? ' filled' : '');
                s.textContent = dictationInput[i] || '\u00A0';
                line.appendChild(s);
            }
        }

        function renderDictKeyboardQD(){
            const kb = qdBody.querySelector('.qd-keyboard');
            if (!kb) return;
            kb.innerHTML = '';
            const rows = dictationLayout === 'alpha'
                ? [ALPHA_LAYOUT.slice()]
                : [QWERTY_ROW1.slice(), QWERTY_ROW2.slice(), QWERTY_ROW3.slice()];
            rows.forEach((row) => {
                const r = document.createElement('div');
                r.className = 'qd-kb-row';
                row.forEach((letter) => {
                    const k = document.createElement('button');
                    k.type = 'button';
                    k.className = 'qd-key';
                    k.textContent = letter;
                    k.addEventListener('click', () => pressDictKeyQD(letter));
                    r.appendChild(k);
                });
                kb.appendChild(r);
            });
            const util = document.createElement('div');
            util.className = 'qd-kb-row';
            const bs = document.createElement('button');
            bs.type = 'button';
            bs.className = 'qd-key util';
            bs.textContent = '⌫ СТЕРЕТЬ';
            bs.addEventListener('click', pressBackspaceQD);
            util.appendChild(bs);
            const sw = document.createElement('button');
            sw.type = 'button';
            sw.className = 'qd-key util';
            sw.textContent = 'РАСКЛАДКА';
            sw.addEventListener('click', () => {
                dictationLayout = dictationLayout === 'alpha' ? 'qwerty' : 'alpha';
                renderDictKeyboardQD();
            });
            util.appendChild(sw);
            kb.appendChild(util);
        }

        function pressDictKeyQD(letter){
            if (qdLocked || dictationInput.length >= dictationCurrent.length) return;
            dictationInput.push(letter);
            renderDictSlotsQD();
            if (dictationInput.length === dictationCurrent.length){
                setTimeout(checkDictQD, 220);
            }
        }
        function pressBackspaceQD(){
            if (qdLocked || !dictationInput.length) return;
            dictationInput.pop();
            renderDictSlotsQD();
        }

        function checkDictQD(){
            if (qdLocked) return;
            qdLocked = true;
            const typed = dictationInput.join('').toUpperCase();
            const correct = dictationCurrent.toUpperCase();
            const slots = qdBody.querySelectorAll('.qd-slot');
            if (typed === correct){
                dictationScore++;
                slots.forEach((s) => s.classList.add('correct'));
            } else {
                slots.forEach((s, i) => {
                    s.classList.add('wrong');
                    s.textContent = correct[i] || '\u00A0';
                });
                playAudio('Не-то', 0.35);
            }
            const kb = qdBody.querySelector('.qd-keyboard');
            if (kb) kb.style.display = 'none';
            showNextButton(() => {
                dictationIndex++;
                showDictQD();
            });
        }

        function playDictAudio(){
            if (!dictationCurrent) return;
            if (dictationAudio) { try { dictationAudio.pause(); } catch (e) {} }
            let a = audioCache[dictationCurrent];
            if (!a) {
                a = new Audio('audio/' + dictationCurrent + '.mp3');
                a.preload = 'auto';
                audioCache[dictationCurrent] = a;
            }
            try { a.currentTime = 0; } catch (e) {}
            dictationAudio = a;
            a.play().catch(() => {});
        }

        /* ---------- Общая кнопка «ДАЛЕЕ» ---------- */
        function showNextButton(onClick){
            const inner = qdBody.querySelector('.qd-inner');
            if (!inner) return;
            const wrap = document.createElement('div');
            wrap.className = 'qd-next-wrap';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'qd-next';
            btn.innerHTML = '<span>ДАЛЕЕ</span><span class="arrow"><svg viewBox="0 0 24 24"><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg></span>';
            btn.addEventListener('click', () => {
                if (btn.classList.contains('fly')) return;
                btn.classList.add('fly');
                btn.disabled = true;
                setTimeout(onClick, 420);
            });
            wrap.appendChild(btn);
            inner.appendChild(wrap);
            setTimeout(() => btn.scrollIntoView({ behavior:'smooth', block:'nearest' }), 40);
        }

        /* ---------- Результат ---------- */
        function showQDResult(score, total){
            if (!qdBody) return;
            qdBody.innerHTML = '';
            qdSetProgress(total, total);
            const inner = document.createElement('div');
            inner.className = 'qd-inner';
            const res = document.createElement('div');
            res.className = 'qd-result';
            res.innerHTML = `РЕЗУЛЬТАТ: <b>${score}</b> ИЗ <b>${total}</b>`;
            inner.appendChild(res);
            const sub = document.createElement('div');
            sub.className = 'qd-result-sub';
            if (score === total) sub.textContent = 'ОТЛИЧНО. МОЛОДЕЦ.';
            else if (score >= total*0.7) sub.textContent = 'ХОРОШО. ПРОДОЛЖАЙ ТРЕНИРОВКИ.';
            else sub.textContent = 'ПОПРОБУЙ ЕЩЁ РАЗ.';
            inner.appendChild(sub);
            qdBody.appendChild(inner);
        }

        /* ---------- Пасхалка: двойной клик по кнопкам -> терминал ---------- */
        function bindDblClickEasterEgg(btn, mode){
            if (!btn) return;
            let lastTap = 0;
            btn.addEventListener('click', (e) => {
                const now = Date.now();
                if (now - lastTap < 350){
                    e.preventDefault();
                    e.stopPropagation();
                    lastTap = 0;
                    openTerminalQD(mode);
                } else {
                    lastTap = now;
                }
            });
            btn.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openTerminalQD(mode);
            });
        }

        if (examBtn) {
            examBtn.addEventListener('click', () => openQD('quiz'));
            bindDblClickEasterEgg(examBtn, 'exam');
        }
        if (dictationBtn) {
            dictationBtn.addEventListener('click', () => openQD('dict'));
            bindDblClickEasterEgg(dictationBtn, 'dict');
        }

        /* ====================================================
           СТАРЫЙ ТЕРМИНАЛ — только как пасхалка (двойной клик)
           ==================================================== */
        function openTerm() {
            if (!termOverlay) return;
            termOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        function closeTerm() {
            if (!termOverlay) return;
            termOverlay.classList.remove('show');
            document.body.style.overflow = '';
            termMode = null;
            if (currentAudio)   { try { currentAudio.pause(); } catch (e) {} }
            if (dictationAudio) { try { dictationAudio.pause(); } catch (e) {} }
        }
        if (termExit) termExit.addEventListener('click', closeTerm);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && termMode) closeTerm(); });

        function termScroll() { if (termBody) termBody.scrollTop = termBody.scrollHeight; }
        function printTerm(text, cls = '') {
            const line = document.createElement('div');
            line.className = 'term-line ' + cls;
            line.textContent = text;
            termBody.appendChild(line);
            termScroll();
            return line;
        }
        async function typeTerm(text, speed = 10, cls = '') {
            const line = document.createElement('div');
            line.className = 'term-line ' + cls;
            termBody.appendChild(line);
            const chars = Array.from(text);
            for (let i = 0; i < chars.length; i++) {
                line.textContent += chars[i];
                termScroll();
                await sleep(speed);
            }
            termScroll();
            return line;
        }
        function clearTerm() { if (termBody) termBody.innerHTML = ''; }

        async function openTerminalQD(mode){
            openTerm();
            if (mode === 'exam') {
                termMode = 'exam';
                await startExamTerm();
            } else {
                termMode = 'dict';
                await startDictTerm();
            }
        }

        async function startExamTerm() {
            clearTerm();
            examQuestions = syllables.slice().sort(() => Math.random() - 0.5).slice(0, 10);
            examIndex = 0;
            examScore = 0;
            await typeTerm('#./ГРАМОТИНЬО ЗАПУСК --- СЦЕНАРИЙ ВИКТОРИНА', 8);
            await sleep(160);
            await printTerm('ЭЛЕКТРОННО-ВЫЧИСЛИТЕЛЬНАЯ МАШИНА --- МОДУЛЬ РАСПОЗНАВАНИЯ СЛОГОВ', '');
            await sleep(140);
            await printTerm('ОПЕРАТОР --- ГОСТЬ@ГРАМОТИНЬО', '');
            await sleep(140);
            await printTerm('КОНТРОЛЬ --- ЭЛЕКТРОНИКА НЦ', '');
            await sleep(140);
            await printTerm('ПРОТОКОЛ ЗАПУЩЕН. ЗАДАНИЙ: 10.', '');
            await sleep(200);
            await printTerm('───', '');
            await sleep(180);
            await printTerm('~#ЗВУКОВОЙ СИНТЕЗ', '');
            await sleep(200);
            showExamQuestion();
        }

        async function showExamQuestion() {
            if (examIndex >= examQuestions.length) {
                await typeTerm('$ ИТОГ', 12);
                await sleep(200);
                await printTerm(`РЕЗУЛЬТАТ: ${examScore} ИЗ 10`, '');
                await sleep(140);
                if (examScore === 10) await printTerm('ОТЛИЧНО. МОЛОДЕЦ.', '');
                else if (examScore >= 7) await printTerm('ХОРОШО. ПРОДОЛЖАЙ ТРЕНИРОВКИ.', '');
                else await printTerm('ПОПРОБУЙ ЕЩЁ РАЗ.', '');
                await sleep(140);
                createExitLine();
                return;
            }
            const correct = examQuestions[examIndex];
            currentExamCorrect = correct;
            await typeTerm(`ВОПРОС ${examIndex + 1}: ЧТО ЗВУЧАЛО?`, 10);
            await sleep(100);
            const cmdLine = await printTerm('$ ПРОИГРЫШЬ', 'cmd-underline');
            cmdLine.addEventListener('click', () => playAudio(correct));

            const variants = new Set([correct]);
            const fl = correct.charAt(0).toUpperCase();
            const slp = syllables.filter((i) => i !== correct && i.charAt(0).toUpperCase() === fl);
            slp.sort(() => Math.random() - 0.5).slice(0, 5).forEach((i) => variants.add(i));
            const fp = syllables.filter((i) => !variants.has(i));
            while (variants.size < 6 && fp.length > 0) {
                const ri = fp[Math.floor(Math.random() * fp.length)];
                variants.add(ri);
                fp.splice(fp.indexOf(ri), 1);
            }
            const va = [...variants].sort(() => Math.random() - 0.5);

            const opts = document.createElement('div');
            opts.className = 'term-options';
            va.forEach((v) => {
                const b = document.createElement('button');
                b.className = 'term-opt';
                b.textContent = '> ' + v.toUpperCase();
                b.addEventListener('click', () => handleExamAnswer(b, v, correct, opts));
                opts.appendChild(b);
            });
            termBody.appendChild(opts);
            termScroll();
            playAudio(correct);
        }

        function handleExamAnswer(btn, sel, correct, opts) {
            opts.querySelectorAll('.term-opt').forEach((o) => o.disabled = true);
            if (sel === correct) {
                btn.classList.add('correct');
                examScore++;
                printTerm('> ВЕРНО.', '');
            } else {
                btn.classList.add('wrong');
                opts.querySelectorAll('.term-opt').forEach((o) => {
                    if (o.textContent === '> ' + correct.toUpperCase()) o.classList.add('correct');
                });
                printTerm(`> ОШИБКА. ПРАВИЛЬНО: ${correct.toUpperCase()}`, '');
                playAudio('Не-то', 0.35);
            }
            const actions = document.createElement('div');
            actions.className = 'term-actions';
            const nextBtn = document.createElement('button');
            nextBtn.className = 'term-action primary';
            nextBtn.textContent = '> ДАЛЕЕ';
            nextBtn.addEventListener('click', () => { examIndex++; showExamQuestion(); });
            actions.appendChild(nextBtn);
            termBody.appendChild(actions);
            termScroll();
        }

        async function startDictTerm() {
            clearTerm();
            dictationLayout = 'alpha';
            const pool = syllables.filter((s) => /^[А-Яа-яЁё]{2,4}$/.test(s));
            dictationQuestions = pool.slice().sort(() => Math.random() - 0.5).slice(0, 10);
            dictationIndex = 0;
            dictationScore = 0;
            await typeTerm('#./ГРАМОТИНЬО ЗАПУСК --- СЦЕНАРИЙ ДИКТАНТ', 8);
            await sleep(160);
            await printTerm('ЭЛЕКТРОННО-ВЫЧИСЛИТЕЛЬНАЯ МАШИНА --- МОДУЛЬ СБОРКИ СЛОГОВ', '');
            await sleep(140);
            await printTerm('ОПЕРАТОР --- ГОСТЬ@ГРАМОТИНЬО', '');
            await sleep(140);
            await printTerm('КОНТРОЛЬ --- ЭЛЕКТРОНИКА НЦ', '');
            await sleep(140);
            await printTerm('ПРОТОКОЛ ЗАПУЩЕН. ЗАДАНИЙ: 10.', '');
            await sleep(200);
            await printTerm('───', '');
            await sleep(180);
            await printTerm('~#ЗВУКОВОЙ СИНТЕЗ', '');
            await sleep(200);
            showDictationTask();
        }

        async function showDictationTask() {
            if (dictationIndex >= dictationQuestions.length) {
                await typeTerm('$ ИТОГ', 12);
                await sleep(200);
                await printTerm(`РЕЗУЛЬТАТ: ${dictationScore} ИЗ 10`, '');
                await sleep(140);
                if (dictationScore === 10) await printTerm('ОТЛИЧНО. МОЛОДЕЦ.', '');
                else if (dictationScore >= 7) await printTerm('ХОРОШО. ПРОДОЛЖАЙ ТРЕНИРОВКИ.', '');
                else await printTerm('ПОПРОБУЙ ЕЩЁ РАЗ.', '');
                await sleep(140);
                createExitLine();
                return;
            }
            dictationLocked = false;
            dictationCurrent = dictationQuestions[dictationIndex];
            dictationInput = [];
            await typeTerm(`ЗАДАНИЕ ${dictationIndex + 1}: СОСТАВЬ СЛОГ.`, 10);
            await sleep(100);
            const cmdLine = await printTerm('$ ПРОИГРЫШЬ', 'cmd-underline');
            cmdLine.addEventListener('click', () => playDictAudio());
            renderDictAnswer();
            renderDictKeyboard();
            setTimeout(() => {
                if (dictationCurrent) playDictAudio();
            }, 250);
        }

        function renderDictAnswer() {
            const old = termBody.querySelector('.term-dict-answer');
            if (old) old.remove();
            const line = document.createElement('div');
            line.className = 'term-line term-dict-answer';
            const before = document.createElement('span');
            before.textContent = '[';
            line.appendChild(before);
            for (let i = 0; i < dictationCurrent.length; i++) {
                const slot = document.createElement('span');
                slot.className = 'term-dict-slot';
                slot.textContent = dictationInput[i] ? dictationInput[i] : '_';
                line.appendChild(slot);
                if (i < dictationCurrent.length - 1) {
                    const sep = document.createElement('span');
                    sep.textContent = ' ';
                    line.appendChild(sep);
                }
            }
            const after = document.createElement('span');
            after.textContent = ']';
            line.appendChild(after);
            const kb = termBody.querySelector('.term-keyboard');
            if (kb) termBody.insertBefore(line, kb);
            else termBody.appendChild(line);
            termScroll();
        }

        function getLayoutRows() {
            if (dictationLayout === 'alpha') return [ALPHA_LAYOUT.slice()];
            return [QWERTY_ROW1.slice(), QWERTY_ROW2.slice(), QWERTY_ROW3.slice()];
        }

        async function renderDictKeyboard(animate = true) {
            const old = termBody.querySelector('.term-keyboard');
            if (old) old.remove();
            const kb = document.createElement('div');
            kb.className = 'term-keyboard';
            termBody.appendChild(kb);
            termScroll();
            const rows = getLayoutRows();
            for (let r = 0; r < rows.length; r++) {
                const rowEl = document.createElement('div');
                rowEl.className = 'kb-row';
                kb.appendChild(rowEl);
                for (let i = 0; i < rows[r].length; i++) {
                    const letter = rows[r][i];
                    const k = document.createElement('button');
                    k.className = 'kb-key';
                    k.textContent = '';
                    k.dataset.letter = letter;
                    k.addEventListener('click', () => pressDictationKey(letter));
                    rowEl.appendChild(k);
                    if (animate) { await sleep(14); k.textContent = letter; termScroll(); }
                    else { k.textContent = letter; }
                }
            }
            const utilRow = document.createElement('div');
            utilRow.className = 'kb-row';
            kb.appendChild(utilRow);
            const bsBtn = document.createElement('button');
            bsBtn.className = 'kb-key';
            bsBtn.textContent = '';
            bsBtn.addEventListener('click', pressBackspace);
            utilRow.appendChild(bsBtn);
            const swBtn = document.createElement('button');
            swBtn.className = 'kb-key';
            swBtn.textContent = '';
            swBtn.addEventListener('click', switchLayout);
            utilRow.appendChild(swBtn);
            if (animate) {
                await sleep(14);
                bsBtn.textContent = '[⌫]';
                await sleep(14);
                swBtn.textContent = '[СМЕНИТЬ РАСКЛАДКУ]';
            } else {
                bsBtn.textContent = '[⌫]';
                swBtn.textContent = '[СМЕНИТЬ РАСКЛАДКУ]';
            }
            termScroll();
        }

        async function switchLayout() {
            dictationLayout = dictationLayout === 'alpha' ? 'qwerty' : 'alpha';
            await typeTerm(dictationLayout === 'alpha' ? '> РАСКЛАДКА: АЛФАВИТ' : '> РАСКЛАДКА: QWERTY', 14);
            await sleep(180);
            await renderDictKeyboard(true);
        }

        function pressDictationKey(letter) {
            if (dictationLocked || dictationInput.length >= dictationCurrent.length) return;
            dictationInput.push(letter);
            renderDictAnswer();
            if (dictationInput.length === dictationCurrent.length) setTimeout(checkDictationAnswer, 220);
        }
        function pressBackspace() {
            if (dictationLocked || !dictationInput.length) return;
            dictationInput.pop();
            renderDictAnswer();
        }

        async function checkDictationAnswer() {
            if (dictationLocked) return;
            dictationLocked = true;
            const typed = dictationInput.join('').toUpperCase();
            const correct = dictationCurrent.toUpperCase();
            const slots = termBody.querySelectorAll('.term-dict-slot');
            if (typed === correct) {
                dictationScore++;
                slots.forEach((slot) => slot.classList.add('correct'));
                printTerm('> ВЕРНО.', '');
            } else {
                slots.forEach((slot, i) => {
                    slot.classList.remove('filled');
                    slot.classList.add('wrong');
                    slot.textContent = correct[i] || '_';
                });
                printTerm(`> ОШИБКА. ПРАВИЛЬНО: ${correct}`, '');
                playAudio('Не-то', 0.35);
            }
            const kb = termBody.querySelector('.term-keyboard');
            if (kb) kb.remove();
            const actions = document.createElement('div');
            actions.className = 'term-actions';
            const nextBtn = document.createElement('button');
            nextBtn.className = 'term-action primary';
            nextBtn.textContent = '> ДАЛЕЕ';
            nextBtn.addEventListener('click', () => { dictationIndex++; showDictationTask(); });
            actions.appendChild(nextBtn);
            termBody.appendChild(actions);
            termScroll();
        }

        function createExitLine() {
            const wrap = document.createElement('div');
            wrap.className = 'term-line ascii-clickable';
            wrap.textContent = '[=====]';
            wrap.style.whiteSpace = 'pre';
            wrap.style.lineHeight = '1.15';
            wrap.addEventListener('click', closeTerm);
            termBody.appendChild(wrap);
            termScroll();
        }

        renderGrid();
    });
}

/* ---------- 6.3 TOOLS ---------- */
function initTools() {
    once('tools', () => {
        const evmOverlay = document.getElementById('evmOverlay');
        const evmBody    = document.getElementById('evmBody');
        const termWord   = document.getElementById('terminalWord');
        const evmClock   = document.getElementById('evmClock');
        const evmDate    = document.getElementById('evmDate');

        if (evmOverlay && evmBody) {
            let terminalOpened  = false;
            let terminalStarted = false;
            let starfieldRaf = null;
            let starfieldActive = false;

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
                const line = document.createElement('div');
                line.className = 'term-line ' + cls;
                evmBody.appendChild(line);
                const chars = Array.from(text);
                for (let i = 0; i < chars.length; i++) {
                    line.textContent += chars[i];
                    scrollTerm();
                    await sleep(speed);
                }
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

            function closeTerminal() {
                stopStarfield();
                evmOverlay.style.display = 'none';
                document.body.style.overflow = '';
                terminalOpened = false;
            }

            function startStarfield() {
                if (starfieldActive) return;
                starfieldActive = true;
                const W = 78, H = 20, numStars = 90;
                const chars = ['*', '.', '+', '·', '°', '×'];
                const stars = [];
                for (let i = 0; i < numStars; i++) {
                    stars.push({
                        x: (Math.random() - 0.5) * 2,
                        y: (Math.random() - 0.5) * 2,
                        z: Math.random() * 1 + 0.1
                    });
                }
                const pre = document.createElement('pre');
                pre.className = 'term-line term-starfield';
                evmBody.appendChild(pre);
                scrollTerm();
                const buffer = new Array(W * H);
                function frame() {
                    if (!starfieldActive) return;
                    for (let i = 0; i < buffer.length; i++) buffer[i] = ' ';
                    for (let i = 0; i < stars.length; i++) {
                        const s = stars[i];
                        s.z -= 0.012;
                        if (s.z <= 0.05) {
                            s.x = (Math.random() - 0.5) * 2;
                            s.y = (Math.random() - 0.5) * 2;
                            s.z = 1 + Math.random() * 0.2;
                        }
                        const k = 0.9 / s.z;
                        const sx = Math.round(W / 2 + s.x * W * 0.5 * k);
                        const sy = Math.round(H / 2 + s.y * H * 0.5 * k);
                        if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
                        const idx = sy * W + sx;
                        const bright = 1 - s.z;
                        const chIdx = Math.min(chars.length - 1, Math.floor(bright * chars.length));
                        buffer[idx] = chars[chIdx];
                    }
                    let out = '';
                    for (let y = 0; y < H; y++) out += buffer.slice(y * W, (y + 1) * W).join('') + '\n';
                    pre.textContent = out;
                    scrollTerm();
                    starfieldRaf = requestAnimationFrame(frame);
                }
                frame();
            }
            function stopStarfield() {
                starfieldActive = false;
                if (starfieldRaf) { cancelAnimationFrame(starfieldRaf); starfieldRaf = null; }
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
                await typeLine('ЭЛЕКТРОННО-ВЫЧИСЛИТЕЛЬНАЯ МАШИНА: ПУСК СИСТЕМЫ', { speed: 12 });
                await sleep(180);
                await typeLine('ДАТА: ' + formatRuDate(new Date()), { speed: 10 });
                await typeLine('ОПЕРАТОР: ГОСТЬ@ГРАМОТИНЬО', { speed: 10 });
                await sleep(300);
                await typeLine('ТЕСТ ОЗУ... БЕЗ ДЕФЕКТОВ', { speed: 12 });
                await sleep(200);
                await typeLine('ТЕСТ ПЗУ... БЕЗ ДЕФЕКТОВ', { speed: 12 });
                await sleep(200);
                await typeLine('ТЕСТ ПРОЦЕССОРА... БЕЗ ДЕФЕКТОВ', { speed: 12 });
                await sleep(200);
                await typeLine('ЗАГРУЗКА МОДУЛЕЙ... МОДУЛИ ЗАГРУЖЕНЫ', { speed: 12 });
                await sleep(320);
                await typeLine('СОСТАВИТЕЛЬ: @VNVAX. БЛАГОДАРИТЬ В ТЕЛЕГРАМ.', { speed: 10 });
                await sleep(220);
                await typeLine('ДЛЯ СПИСКА КОМАНД ВВЕДИТЕ "СПРАВКА"', { speed: 12 });
                await typeLine('ДЛЯ ЗАВЕРШЕНИЯ РАБОТЫ ВВЕДИТЕ "ВЫХОД"', { speed: 12 });
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
                    await typeLine('СЕАНС ОКОНЧЕН---- 000', { speed: 14 });
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
                    const commands = [
                        { name: 'ИНФОРМАЦИЯ', action: () => runInfo() },
                        { name: 'ВЫХОД', action: () => {
                            const inp = document.getElementById('termInput');
                            if (inp) {
                                inp.value = 'выход';
                                const mirror = document.getElementById('termMirror');
                                if (mirror) mirror.textContent = 'выход';
                                inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                            } else {
                                processCommand('выход');
                            }
                        } }
                    ];
                    for (const c of commands) {
                        const item = document.createElement('div');
                        item.className = 'term-list-item';
                        const n = document.createElement('span');
                        n.className = 'cmd-name';
                        n.textContent = c.name;
                        item.appendChild(n);
                        list.appendChild(item);
                        scrollTerm();
                        item.addEventListener('click', c.action);
                        await sleep(60);
                    }
                    await sleep(140);
                    createInputLine();
                    return;
                }
                if (cmd === 'информация' || cmd === 'info') { runInfo(); return; }
                if (cmd === 'очистить' || cmd === 'clear' || cmd === 'cls') {
                    evmBody.innerHTML = '';
                    createInputLine();
                    return;
                }
                await sleep(90);
                await typeLine(`НЕИЗВЕСТНАЯ КОМАНДА: ${raw}`, { speed: 12 });
                await sleep(80);
                await typeLine('ВВЕДИТЕ "СПРАВКА" ДЛЯ СПИСКА КОМАНД.', { speed: 12 });
                createInputLine();
            }

            async function runInfo() {
                stopStarfield();
                await typeLine('$ ИНФОРМАЦИЯ', { speed: 14 });
                await sleep(200);
                await typeLine('ЗАПУСК ПРОГРАММЫ «ЗВЁЗДНОЕ НЕБО»...', { speed: 12 });
                await sleep(300);
                startStarfield();
                await sleep(1400);
                const paragraphs = [
                    'Увлечение часами имеет и философские корни.',
                    'Время — это объективная реальность, фундаментальный, коренной элемент бытия. Материя существует только во времени из бесконечного прошлого в бесконечное будущее и только этим моментом.',
                    'У всех существ, обладающих психикой, есть чувство времени, основанное на соотнесении длительности типичных для их жизнедеятельности циклических процессов. Есть это чувство и у человека. Но только человек научился измерять время, будь то обращение Земли вокруг своей оси или колебание атома цезия-133. Точность измерения времени беспредельна, так как само объективное время не дискретно, периодичны и дробимы лишь материальные процессы, которые служат его мерилом.',
                    'Механические часы обладают магической притягательностью и романтическим ореолом. Во-первых, механика — символ становления индустриального общества. Во-вторых, принцип работы механических часов гениально прост, надёжен и замкнут всего на две вещи — человека и износ механизма. Механическая энергия от человека передаётся на пружину, электромагнитная энергия пружины приводит в движение механизм. Многие современные технологии должны равняться на гениальную простоту и надёжность механических часов.'
                ];
                for (const p of paragraphs) {
                    const block = document.createElement('div');
                    block.className = 'term-prose';
                    const para = document.createElement('p');
                    block.appendChild(para);
                    evmBody.appendChild(block);
                    const chars = Array.from(p);
                    for (let i = 0; i < chars.length; i++) {
                        para.textContent += chars[i];
                        if (i % 10 === 0) scrollTerm();
                        await sleep(8);
                    }
                    scrollTerm();
                    await sleep(220);
                }
                await sleep(300);
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

            if (termWord) {
                termWord.addEventListener('click', () => {
                    if (terminalOpened) return;
                    terminalOpened = true;
                    evmOverlay.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    startTerminal();
                });
            }
        }

        if (typeof window.initToolsClock === 'function') {
            window.initToolsClock();
        }
    });
}

/* ---------- 6.4 HEROES ---------- */
function initHeroes() {
    once('heroes', () => {
        const heroesData = [
            { name: "Александров",       birthYear: 1905, deathYear: 1994, images: ["Александров.jpg"],       audio: "Александров.mp3" },
            { name: "Белинский",         birthYear: 1811, deathYear: 1848, images: ["Белинский.jpg"],         audio: "Белинский.mp3" },
            { name: "Бородин",           birthYear: 1833, deathYear: 1887, images: ["Бородин.jpg"],           audio: "Бородин.mp3" },
            { name: "Брежнев",           birthYear: 1906, deathYear: 1982, images: ["Брежнев.jpg"],           audio: "Брежнев.mp3" },
            { name: "Ворошилов",         birthYear: 1881, deathYear: 1969, images: ["Ворошилов.jpg", "Ворошилов2.jpg", "Ворошилов3.jpg"], audio: "Ворошилов.mp3" },
            { name: "Гагарин",           birthYear: 1934, deathYear: 1968, images: ["Гагарин.jpg"],           audio: "Гагарин.mp3" },
            { name: "Глинка",            birthYear: 1804, deathYear: 1857, images: ["Глинка.jpg"],            audio: "Глинка.mp3" },
            { name: "Гоголь",            birthYear: 1809, deathYear: 1852, images: ["Гоголь.jpg"],            audio: "Гоголь.mp3" },
            { name: "Горький",           birthYear: 1868, deathYear: 1936, images: ["Горький.jpg", "Горький2.jpg", "Горький 3.jpg"], audio: "Горький.mp3" },
            { name: "Даргомыжский",      birthYear: 1813, deathYear: 1869, images: ["Даргомыжский.jpg"],      audio: "Даргомыжский.mp3" },
            { name: "Дзержинский",       birthYear: 1877, deathYear: 1926, images: ["Дзержинский.jpg"],       audio: "Дзержинский.mp3" },
            { name: "Добролюбов",        birthYear: 1836, deathYear: 1861, images: ["Добролюбов.jpg"],        audio: "Добролюбов.mp3" },
            { name: "Жуковский",         birthYear: 1847, deathYear: 1921, images: ["Жуковский.jpg"],         audio: "Жуковский.mp3" },
            { name: "Карпинский",        birthYear: 1846, deathYear: 1936, images: ["Карпинкий.jpg"],         audio: "Карпинский.mp3" },
            { name: "Курчатов",          birthYear: 1902, deathYear: 1960, images: ["Курчатов.jpg"],          audio: "Курчатов.mp3" },
            { name: "Ленин",             birthYear: 1870, deathYear: 1924, images: ["Ленин.jpg", "Ленин2.jpg", "Ленин3.jpg", "Ленин4.jpg", "Ленин5.jpg"], audio: "Ленин.mp3" },
            { name: "Лермонтов",         birthYear: 1814, deathYear: 1841, images: ["Лермонтов.jpg"],         audio: "Лермонтов.mp3" },
            { name: "Ломоносов",         birthYear: 1711, deathYear: 1765, images: ["Ломоносов.jpeg"],        audio: "Ломоносов.mp3" },
            { name: "Макаренко",         birthYear: 1888, deathYear: 1939, images: ["Макаренко.jpg"],         audio: "Макаренко.mp3" },
            { name: "Маяковский",        birthYear: 1893, deathYear: 1930, images: ["Маяковский.jpg"],        audio: "Маяковский.mp3" },
            { name: "Менделеев",         birthYear: 1834, deathYear: 1907, images: ["Менделеев.jpg"],         audio: "Менделеев.mp3" },
            { name: "Мечников",          birthYear: 1845, deathYear: 1916, images: ["Мечников.jpg"],          audio: "Мечников.mp3" },
            { name: "Мичурин",           birthYear: 1855, deathYear: 1935, images: ["Мичурин.jpg", "Мичурин2.jpg", "Мичурин3.jpg"], audio: "Мичурин.mp3" },
            { name: "Молотов",           birthYear: 1890, deathYear: 1986, images: ["Молотов.jpg"],           audio: "Молотов.mp3" },
            { name: "Мусоргский",        birthYear: 1839, deathYear: 1881, images: ["Мусоргский.jpg"],        audio: "Мусоргский.mp3" },
            { name: "Некрасов",          birthYear: 1821, deathYear: 1878, images: ["Некрасов.jpg"],          audio: "Некрасов.mp3" },
            { name: "Островский",        birthYear: 1904, deathYear: 1936, images: ["Островский.jpg"],        audio: "Островский.mp3" },
            { name: "Павлов",            birthYear: 1849, deathYear: 1936, images: ["Павлов.png"],            audio: "Павлов.mp3" },
            { name: "Папанин",           birthYear: 1894, deathYear: 1986, images: ["Папанин.jpg"],           audio: "Папанин.mp3" },
            { name: "Пётр Великий",      birthYear: 1672, deathYear: 1725, images: ["Петр.jpg", "Пётр2.jpg"], audio: "Первый.mp3" },
            { name: "Писарев",           birthYear: 1840, deathYear: 1868, images: ["Писарев.jpg"],           audio: "Писарев.mp3" },
            { name: "Попов",             birthYear: 1859, deathYear: 1906, images: ["Попов.jpg"],             audio: "Попов.mp3" },
            { name: "Пушкин",            birthYear: 1799, deathYear: 1837, images: ["Пушкин.jpg", "Пушкин3.jpg"], audio: "Пушкин.mp3" },
            { name: "Репин",             birthYear: 1844, deathYear: 1930, overrideCentury: 19, images: ["Репин.jpg"], audio: "Репин.mp3" },
            { name: "Римский-Корсаков",  birthYear: 1844, deathYear: 1908, images: ["Римский-Корсаков.jpg"],  audio: "Римский-Корсаков.mp3" },
            { name: "Салтыков-Щедрин",   birthYear: 1826, deathYear: 1889, images: ["Салтыков-Щедрин.jpg"],   audio: "Салтыков-Щедрин.mp3" },
            { name: "Семашко",           birthYear: 1874, deathYear: 1949, images: ["Семашко.jpg"],           audio: "Семашко.mp3" },
            { name: "Сеченов",           birthYear: 1829, deathYear: 1905, images: ["Сеченов.jpg"],           audio: "Сеченов.mp3" },
            { name: "Сталин",            birthYear: 1878, deathYear: 1953, images: ["Сталин.jpg", "Сталин2.jpg", "Сталин3.jpg", "Сталин4.jpg", "Сталин5.jpg", "Сталин6.jpg", "Сталин7.jpg", "Сталин8.jpg", "Сталин9.jpg"], audio: "Сталин.mp3" },
            { name: "Суворов",           birthYear: 1729, deathYear: 1800, images: ["Суворов.jpg"],           audio: "Суворов.mp3" },
            { name: "Толстой",           birthYear: 1828, deathYear: 1910, images: ["Толстой.jpg", "Толстой2.jpg", "Толстой3.jpg", "Толстой4.jpg"], audio: "Толстой.mp3" },
            { name: "Тургенев",          birthYear: 1818, deathYear: 1883, images: ["Тургенев.jpg"],          audio: "Тургенев.mp3" },
            { name: "Фрунзе",            birthYear: 1885, deathYear: 1925, images: ["Фрунзе.jpg"],            audio: "Фрунзе.mp3" },
            { name: "Циолковский",       birthYear: 1857, deathYear: 1935, images: ["Циолковский.jpg"],       audio: "Циолковский.mp3" },
            { name: "Чайковский",        birthYear: 1840, deathYear: 1893, images: ["Чайковский.jpg"],        audio: "Чайковский.mp3" },
            { name: "Чернышевский",      birthYear: 1828, deathYear: 1889, images: ["Чернышевский.jpg"],      audio: "Чернышевский.mp3" },
            { name: "Чехов",             birthYear: 1860, deathYear: 1904, images: ["Чехов.jpg"],             audio: "Чехов.mp3" },
            { name: "Шишкин",            birthYear: 1832, deathYear: 1898, images: ["Шишкин.jpg"],            audio: "Шишкин.mp3" },
            { name: "Шолохов",           birthYear: 1905, deathYear: 1984, images: ["Шолохов.jpg"],           audio: "Шолохов.mp3" }
        ];

        const TL_START = 1650, TL_END = 2010, TL_RANGE = TL_END - TL_START;
        const tlPos = (y) => ((y - TL_START) / TL_RANGE) * 100;
        const TL_CENTURIES = [1700, 1800, 1900, 2000];
        const TL_HALVES = [1750, 1850, 1950];
        const TL_WARS = [
            { year: 1721, name: 'Победа в<br>Северной<br>войне' },
            { year: 1812, name: 'Отечественная<br>война' },
            { year: 1914, name: 'Первая<br>мировая' },
            { year: 1945, name: 'Победа<br>в Великой<br>Отечественной' }
        ];
        const TL_OTHERS = [
            { year: 1825, name: 'Восстание<br>декабристов' },
            { year: 1861, name: 'Отмена<br>крепостного<br>права' },
            { year: 1917, name: 'Октябрьская<br>революция' },
            { year: 1991, name: 'Разрушение<br>СССР' }
        ];

        function buildTimelineHTML(b, d) {
            const bY = Math.max(b, TL_START), dY = Math.min(d, TL_END);
            const l = tlPos(bY), w = tlPos(dY) - l;
            let h = '<div class="htl-panel"><div class="htl-head"><div class="htl-head-cell"><div class="htl-head-label">ХРОНОЛОГИЯ ИСТОРИИ</div></div><div class="htl-head-cell"></div></div><div class="htl-body"><div class="htl">';
            for (let y = 1700; y <= 2000; y += 10) {
                if (y % 100 === 0 || y % 50 === 0) continue;
                h += `<div class="htl-dtick" style="left:${tlPos(y)}%"></div>`;
            }
            TL_HALVES.forEach((y) => { h += `<div class="htl-htick" style="left:${tlPos(y)}%"></div>`; });
            h += '<div class="htl-axis"></div>';
            TL_CENTURIES.forEach((y) => { h += `<div class="htl-ctick" style="left:${tlPos(y)}%"></div>`; });
            h += `<div class="htl-life" style="left:${l}%;width:${w}%"></div>`;
            TL_WARS.forEach((e) => {
                h += `<div class="htl-war" style="left:${tlPos(e.year)}%"><div class="htl-war-label"><div class="htl-war-year">${e.year}</div><div class="htl-war-name">${e.name}</div></div><div class="htl-war-tick"></div></div>`;
            });
            TL_OTHERS.forEach((e) => {
                h += `<div class="htl-other" style="left:${tlPos(e.year)}%"><div class="htl-other-tick"></div><div class="htl-other-label"><div class="htl-other-year">${e.year}</div><div class="htl-other-name">${e.name}</div></div></div>`;
            });
            TL_CENTURIES.forEach((y) => { h += `<div class="htl-cnum" style="left:${tlPos(y)}%">${y}</div>`; });
            h += '</div></div></div>';
            return h;
        }

        function encodePath(p) {
            return p.split('/').map((s) => encodeURIComponent(s)).join('/');
        }

        function renderHeroesTimeline() {
            const timeline = document.getElementById('heroesTimeline');
            if (!timeline) return;

            const centuries = [
                { name: "XVIII ВЕК", filter: (h) => h.overrideCentury === 18 || (!h.overrideCentury && h.deathYear < 1801) },
                { name: "XIX ВЕК",   filter: (h) => h.overrideCentury === 19 || (!h.overrideCentury && h.deathYear >= 1801 && h.deathYear <= 1921) },
                { name: "XX ВЕК",    filter: (h) => h.overrideCentury === 20 || (!h.overrideCentury && h.deathYear > 1921) }
            ];

            let html = '';
            centuries.forEach((c) => {
                const heroes = heroesData.filter(c.filter).sort((a, b) => a.deathYear - b.deathYear);
                if (heroes.length === 0) return;
                html += `<div class="century-header"><span class="century-title">${c.name}</span></div><div class="heroes-grid">`;
                let sovietBandInserted = false;
                heroes.forEach((hero) => {
                    if (!sovietBandInserted && hero.name === "Ленин") {
                        html += `</div><div class="soviet-band">СОВЕТСКИЙ ПЕРИОД</div><div class="heroes-grid">`;
                        sovietBandInserted = true;
                    }
                    const imgPath = encodePath('Great Rus/' + hero.images[0]);
                    const age = hero.deathYear - hero.birthYear;
                    const imagesJson = JSON.stringify(hero.images.map((i) => encodePath('Great Rus/' + i)));
                    const audioPath = encodePath('Great Rus/' + hero.audio);
                    html += `<div class="hero-item" data-name="${hero.name}" data-birth="${hero.birthYear}" data-death="${hero.deathYear}" data-audio="${audioPath}" data-images='${imagesJson}'>
                        <div class="hero-photo"><img src="${imgPath}" alt="${hero.name}" loading="lazy" decoding="async"></div>
                        <div class="hero-info">
                            <div class="hero-name">${hero.name}</div>
                            <div class="hero-years">${hero.birthYear}—${hero.deathYear} <span class="hero-age">${age}</span></div>
                        </div>
                    </div>`;
                });
                html += `</div>`;
            });

            timeline.innerHTML = html;

            timeline.querySelectorAll('.hero-item').forEach((item) => {
                item.addEventListener('click', function () {
                    openHeroModal(
                        this.dataset.name,
                        JSON.parse(this.dataset.images),
                        this.dataset.audio,
                        parseInt(this.dataset.birth, 10),
                        parseInt(this.dataset.death, 10)
                    );
                });
            });
        }

        let heroModal = null;
        const heroAudio = new Audio();
        let currentImageIndex = 0;
        let currentImages = [];

        function openHeroModal(name, images, audioSrc, birthYear, deathYear) {
            if (heroModal) heroModal.remove();
            currentImages = images;
            currentImageIndex = 0;
            const navHTML = images.length > 1
                ? `<button class="hero-nav prev" type="button" aria-label="Предыдущий">‹</button><button class="hero-nav next" type="button" aria-label="Следующий">›</button>`
                : '';
            const initials = name.split(/\s+/).map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase();

            heroModal = document.createElement('div');
            heroModal.className = 'hero-modal';
            heroModal.innerHTML = `
                <button class="hero-modal-repeat" type="button" aria-label="Повторить звук">♪</button>
                <button class="hero-modal-close" type="button" aria-label="Закрыть">×</button>
                <div class="hero-modal-portrait-wrap">
                    ${navHTML}
                    <img class="hero-modal-portrait" src="${images[0]}" alt="${name}" decoding="async">
                </div>
                <div class="hero-modal-info">
                    <h3>${name}</h3>
                    <div class="hero-modal-years">${birthYear} — ${deathYear}</div>
                </div>
                <div class="hero-modal-timeline">${buildTimelineHTML(birthYear, deathYear)}</div>
            `;

            const imgEl = heroModal.querySelector('.hero-modal-portrait');
            imgEl.addEventListener('error', () => {
                const placeholder = document.createElement('div');
                placeholder.className = 'hero-portrait-placeholder';
                placeholder.textContent = initials;
                imgEl.replaceWith(placeholder);
            });

            document.body.appendChild(heroModal);
            playHeroAudio(audioSrc);

            heroModal.querySelector('.hero-modal-close').addEventListener('click', () => {
                heroModal.remove();
                heroAudio.pause();
                heroAudio.currentTime = 0;
            });
            heroModal.querySelector('.hero-modal-repeat').addEventListener('click', () => playHeroAudio(audioSrc));

            const prevBtn = heroModal.querySelector('.hero-nav.prev');
            const nextBtn = heroModal.querySelector('.hero-nav.next');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
                    const im = heroModal.querySelector('.hero-modal-portrait');
                    if (im) im.src = currentImages[currentImageIndex];
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
                    const im = heroModal.querySelector('.hero-modal-portrait');
                    if (im) im.src = currentImages[currentImageIndex];
                });
            }
        }

        function playHeroAudio(src) {
            heroAudio.pause();
            heroAudio.src = src;
            heroAudio.currentTime = 0;
            heroAudio.play().catch((e) => console.log('Ошибка воспроизведения', e));
        }

        renderHeroesTimeline();
    });
}

/* ---------- 6.5 CINEMA + POETRY ---------- */
function initMediaGrid(config) {
    const { gridId, hashPrefix, label, videos, key } = config;
    once(key, () => {
        const gridEl = document.getElementById(gridId);
        const modal  = document.getElementById('mediaPlayerModal');
        const frame  = document.getElementById('mediaPlayerFrame');
        const close  = document.getElementById('mediaPlayerClose');
        if (!gridEl || !modal || !frame) return;

        const pad2 = (n) => String(n).padStart(2, '0');

        function renderGrid(items) {
            gridEl.innerHTML = '';
            const frag = document.createDocumentFragment();
            items.forEach((v, i) => {
                const card = document.createElement('a');
                card.className = 'media-card';
                card.href = hashPrefix + v.id;
                card.dataset.videoId = v.id;

                const thumb = document.createElement('div');
                thumb.className = 'media-thumb';

                const img = document.createElement('img');
                img.className = 'thumb-img';
                img.alt = v.title;
                img.loading = 'lazy';
                img.decoding = 'async';
                img.src = 'https://rutube.ru/api/video/' + v.id + '/thumbnail/?redirect=1';
                img.onerror = function () { img.style.display = 'none'; };

                const num = document.createElement('div');
                num.className = 'media-num';
                num.textContent = pad2(i + 1);

                const play = document.createElement('div');
                play.className = 'media-play';

                thumb.appendChild(img);
                thumb.appendChild(num);
                thumb.appendChild(play);

                const info = document.createElement('div');
                info.className = 'media-info';

                const top = document.createElement('div');
                top.className = 'media-info-top';
                const dot = document.createElement('span');
                dot.className = 'dot';
                const labelEl = document.createElement('span');
                labelEl.textContent = label;
                top.appendChild(dot);
                top.appendChild(labelEl);

                const title = document.createElement('div');
                title.className = 'media-title';
                title.textContent = v.title;

                const line = document.createElement('span');
                line.className = 'media-title-line';

                const arrow = document.createElement('span');
                arrow.className = 'media-arrow';
                arrow.textContent = '→';

                info.appendChild(top);
                info.appendChild(title);
                info.appendChild(line);
                card.appendChild(thumb);
                card.appendChild(info);
                card.appendChild(arrow);
                frag.appendChild(card);
            });
            gridEl.appendChild(frag);
        }

        function openPlayer(id) {
            frame.src = 'https://rutube.ru/play/embed/' + id + '/';
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        function closePlayer() {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(() => { frame.src = 'about:blank'; }, 400);
        }
        function closeAndClearHash() {
            if (window.location.hash.startsWith(hashPrefix)) {
                history.pushState('', document.title, window.location.pathname + window.location.search);
                closePlayer();
            } else {
                closePlayer();
            }
        }
        function handleHash() {
            const hash = window.location.hash;
            if (hash.startsWith(hashPrefix)) {
                const id = hash.slice(hashPrefix.length);
                if (id) openPlayer(id);
            } else {
                if (modal.classList.contains('show')) closePlayer();
            }
        }

        if (close) close.addEventListener('click', (e) => { e.preventDefault(); closeAndClearHash(); });
        modal.addEventListener('click', (e) => { if (e.target === modal) closeAndClearHash(); });
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('show') && e.key === 'Escape') closeAndClearHash();
        });
        window.addEventListener('hashchange', handleHash);

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.media-card');
            if (!card) return;
            if (window.location.hash === card.getAttribute('href')) {
                e.preventDefault();
                const id = card.dataset.videoId;
                if (id) openPlayer(id);
            }
        });

        renderGrid(videos);
        handleHash();
    });
}

function initCinema() {
    initMediaGrid({
        key: 'cinema',
        gridId: 'cartoonsGrid',
        hashPrefix: '#cartoon/',
        label: 'МУЛЬТФИЛЬМ · RUTUBE',
        videos: [
            { title: 'Полёт на Луну',    id: 'e4028c9ad811b8a70b113b362d511950' },
            { title: 'Сармико',          id: 'b6fba827c3ee4c79a1eda71471f33019' },
            { title: 'Друзья-товарищи',  id: 'a5bf522e5b66677fc547ebf0be9c1f79' },
            { title: 'Каштанка',         id: '1d3f8cd887b3591d3dbefd5267c327b5' },
            { title: 'Кем быть?',        id: 'a68023b02d3e6ca8d96e89f34decf01d' }
        ]
    });
}

function initPoetry() {
    initMediaGrid({
        key: 'poetry',
        gridId: 'poemsGrid',
        hashPrefix: '#poem/',
        label: 'СТИХИ · RUTUBE',
        videos: [
            { title: 'Сергей Есенин — «Письмо к женщине»',                   id: 'dc08664f71952500f4bc0440947fc491' },
            { title: 'Константин Симонов — «Жди меня»',                      id: 'dc08664f71952500f4bc0440947fc491' },
            { title: 'Александр Пушкин — «Письмо Татьяны»',                  id: 'b8c412a92afc0422b921253fbe2e0c55' },
            { title: 'Михаил Лермонтов — «К *** (Я не унижусь пред тобою)»', id: 'b634ebd5bfead10073766860d83c5ed9' },
            { title: 'Николай Некрасов — «Ты всегда хороша несравненно…»',   id: '8ca305e0e8a8a4eabbdf76a6c9ffd111' },
            { title: 'Сергей Есенин — «Ты меня не любишь, не жалеешь...»',   id: '099eb1da530d476cc58887631ec26a3b' },
            { title: 'Светлана Бондарь — «Ночью я чинила глобус»',           id: 'b8b7fe121bba74e8379c5c72f1562d84' },
            { title: 'Константин Симонов — «Открытое письмо»',               id: '999594c3ae9cf70edefdf7f5de918b1e' },
            { title: 'Яна Мкр — «Папа, смотри...»',                          id: '35f3e4547d8fda4788da95386a2d5c22' },
            { title: 'Злата Маркина — «Как всё сложилось?»',                 id: '8aad257df3edbc8ea9691765455b5f38' },
            { title: 'Наталья Дроздова — «Спасибо всем, кто нам мешает»',    id: '85af9336e91b8bfff7b440bc034c5403' },
            { title: 'Андрей Гоголев — «Бросай филфак»',                     id: '0b6686b4ac680ab139f8b7347ef4fbf6' },
            { title: '«Как работал Маяковский» (документальный фильм, 1947)', id: '999594c3ae9cf70edefdf7f5de918b1e' },
            { title: 'Сказка о Пете и Симе',                                 id: 'c62a174674bc4ab8497d7468b318ab24' }
        ]
    });
}

/* ---------- 6.6 ART ---------- */
function initArt() {
    once('art', () => {
        const INDEX_URL = 'art/index.json';
        const IMG_DIR   = 'art/';

        const MQ_NARROW = window.matchMedia('(max-width: 640px)');
        const MQ_COARSE = window.matchMedia('(pointer: coarse)');
        const isTouchMode = () => MQ_NARROW.matches || MQ_COARSE.matches;
        const IS_MOBILE_ART = window.matchMedia('(max-width: 768px)').matches;

        const canvas   = document.getElementById('artCanvas');
        const inner    = document.getElementById('artCanvasInner');
        const catcher  = document.getElementById('artScrollCatcher');
        const info     = document.getElementById('artInfo');
        const controls = document.getElementById('artControls');
        const progress = document.getElementById('artProgressFill');
        const prevBtn  = document.getElementById('artPrev');
        const nextBtn  = document.getElementById('artNext');
        const closeBtn = document.getElementById('artClose');

        if (!canvas || !inner || !catcher) return;

        let items = [];
        let order = 'random';
        let current = 0;
        let currentImgEl = null;
        let prevImgEl    = null;
        let nextImgEl    = null;
        let dragging = false;
        let startX = 0, startY = 0;
        let lastX = 0, lastY = 0;
        let axis = null;
        let t0 = 0;
        let started = false;
        let closing = false;

        let wheelAccum = 0;
        let wheelTimer = null;
        let animating = false;

        async function loadIndex() {
            const res = await fetch(INDEX_URL, { cache: 'no-cache' });
            if (!res.ok) throw new Error('art/index.json: HTTP ' + res.status);
            const raw = await res.text();
            let data;
            try { data = JSON.parse(raw); }
            catch (e1) {
                const cleaned = raw
                    .replace(/^\uFEFF/, '')
                    .replace(/\/\/[^\n]*/g, '')
                    .replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/,\s*([\]}])/g, '$1');
                data = JSON.parse(cleaned);
            }
            if (!Array.isArray(data)) throw new Error('art/index.json должен быть массивом');
            return data.map((x) => String(x).replace(/\.(jpg|jpeg|png|webp)$/i, ''));
        }

        function showState(text, isError) {
            clearImage();
            const div = document.createElement('div');
            div.className = 'art-state' + (isError ? ' is-error' : '');
            div.textContent = text;
            inner.appendChild(div);
        }
        function clearState() {
            inner.querySelectorAll('.art-state').forEach((el) => el.remove());
        }
        function clearImage() {
            if (currentImgEl) { currentImgEl.remove(); currentImgEl = null; }
            if (prevImgEl)    { prevImgEl.remove();    prevImgEl = null; }
            if (nextImgEl)    { nextImgEl.remove();    nextImgEl = null; }
        }

        function buildOrder() {
            if (order === 'standard') items.sort((a, b) => Number(a) - Number(b));
            else {
                for (let i = items.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [items[i], items[j]] = [items[j], items[i]];
                }
            }
        }

        function preloadAround(idx) {
            [idx + 1, idx - 1, idx + 2].forEach((i) => {
                if (i < 0 || i >= items.length) return;
                const img = new Image();
                img.src = IMG_DIR + encodeURIComponent(items[i]) + '.jpg';
            });
        }

        function updateNav() {
            if (!prevBtn || !nextBtn) return;
            prevBtn.disabled = current <= 0;
            nextBtn.disabled = current >= items.length - 1;
        }
        function updateProgress() {
            if (info) info.textContent = (current + 1) + ' / ' + items.length;
            if (progress) progress.style.width = ((current + 1) / items.length * 100) + '%';
            updateNav();
        }

        function makeImg(id) {
            const img = document.createElement('img');
            img.className = 'art-image';
            img.alt = 'Картина ' + id;
            img.draggable = false;
            img.decoding = 'async';
            img.src = IMG_DIR + encodeURIComponent(id) + '.jpg';
            img.addEventListener('error', () => {
                const state = document.createElement('div');
                state.className = 'art-state is-error';
                state.textContent = 'Не удалось загрузить картину ' + id;
                img.replaceWith(state);
            });
            return img;
        }

        function makeWrap(id, offsetX) {
            const wrap = document.createElement('div');
            wrap.className = 'art-image-wrap';
            wrap.style.transform = 'translate3d(' + offsetX + 'px,0,0)';
            wrap.style.opacity = '1';
            wrap.appendChild(makeImg(id));
            return wrap;
        }

        function renderLayers(offsetX) {
            clearImage();
            const hasPrev = current > 0;
            const hasNext = current < items.length - 1;

            if (hasPrev) {
                prevImgEl = makeWrap(items[current - 1], offsetX - inner.clientWidth);
                inner.appendChild(prevImgEl);
            }
            currentImgEl = makeWrap(items[current], offsetX);
            inner.appendChild(currentImgEl);
            if (hasNext) {
                nextImgEl = makeWrap(items[current + 1], offsetX + inner.clientWidth);
                inner.appendChild(nextImgEl);
            }
            updateProgress();
        }

        function showImage(idx) {
            if (idx < 0 || idx >= items.length) return;
            current = idx;
            renderLayers(0);
            preloadAround(idx);
        }

        /* ---------- Анимация перелистывания ---------- */
        function animateTo(direction, cb) {
            if (animating) return;
            const W = inner.clientWidth;
            const targetX = -direction * W;

            if (IS_MOBILE_ART) {
                /* Лёгкая мобильная: мгновенная смена с fade-out/in */
                animating = true;
                const wraps = [prevImgEl, currentImgEl, nextImgEl].filter(Boolean);
                wraps.forEach((w) => {
                    w.classList.add('art-sliding');
                    w.style.transform = 'translate3d(' + targetX + 'px,0,0)';
                });
                setTimeout(() => {
                    if (direction === 1) current += 1;
                    else                current -= 1;
                    renderLayers(0);
                    preloadAround(current);
                    animating = false;
                    if (typeof cb === 'function') cb();
                }, 200);
                return;
            }

            /* Десктоп: плавный слайд */
            animating = true;
            if (!currentImgEl) { animating = false; return; }
            const wraps = [prevImgEl, currentImgEl, nextImgEl].filter(Boolean);
            wraps.forEach((w) => {
                w.classList.add('art-sliding');
                const cur = parseFloat((w.style.transform.match(/translate3d\(([^p]+)px/) || [0,0])[1]) || 0;
                w.style.transform = 'translate3d(' + (cur + targetX) + 'px,0,0)';
            });
            setTimeout(() => {
                if (direction === 1) current += 1;
                else                current -= 1;
                renderLayers(0);
                preloadAround(current);
                animating = false;
                if (typeof cb === 'function') cb();
            }, 560);
        }

        function step(dir) {
            if (animating) return;
            if (dir > 0 && current < items.length - 1) animateTo(1);
            else if (dir < 0 && current > 0) animateTo(-1);
        }

        function openArt() {
            if (started) {
                canvas.classList.add('show');
                document.body.style.overflow = 'hidden';
                return;
            }
            started = true;
            canvas.classList.add('show');
            document.body.style.overflow = 'hidden';
            showState('Загрузка…');
            loadIndex().then((list) => {
                items = list;
                if (!items.length) { showState('Пока нет картин'); return; }
                clearState();
                buildOrder();
                current = 0;
                showImage(0);
            }).catch((err) => showState(err.message || 'Ошибка загрузки', true));
        }

        function closeArt() {
            if (!canvas.classList.contains('show')) return;
            closing = true;
            canvas.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                closing = false;
                if (typeof openMenu === 'function') openMenu();
            }, 300);
        }

        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); step(-1); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); step(1); });
        if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeArt(); });

        /* Колесо мыши (десктоп) — плавное накопление */
        function onWheel(e) {
            if (isTouchMode() || IS_MOBILE_ART) return;
            e.preventDefault();
            if (!currentImgEl || animating) return;

            wheelAccum += e.deltaY;
            const W = inner.clientWidth;

            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => {
                const threshold = W * 0.14;
                if (wheelAccum > threshold && current < items.length - 1) {
                    step(1);
                } else if (wheelAccum < -threshold && current > 0) {
                    step(-1);
                }
                wheelAccum = 0;
            }, 90);
        }
        canvas.addEventListener('wheel', onWheel, { passive: false });

        document.addEventListener('keydown', (e) => {
            if (!canvas.classList.contains('show')) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault(); step(1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault(); step(-1);
            } else if (e.key === 'Escape') {
                e.preventDefault(); closeArt();
            }
        });

        function getPoint(e) {
            if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }

        /* Свайпы */
        catcher.addEventListener('touchstart', (e) => {
            if (closing || animating) return;
            if (e.touches.length !== 1) return;
            const p = getPoint(e);
            dragging = true;
            axis = null;
            startX = lastX = p.x;
            startY = lastY = p.y;
            t0 = Date.now();
            if (currentImgEl) currentImgEl.classList.remove('art-sliding');
            if (prevImgEl)    prevImgEl.classList.remove('art-sliding');
            if (nextImgEl)    nextImgEl.classList.remove('art-sliding');
        }, { passive: true });

        catcher.addEventListener('touchmove', (e) => {
            if (!dragging || closing || animating) return;
            if (e.touches.length !== 1) { dragging = false; return; }
            const p = getPoint(e);
            lastX = p.x;
            lastY = p.y;

            if (!axis) {
                const dx = Math.abs(p.x - startX);
                const dy = Math.abs(p.y - startY);
                if (dx < 6 && dy < 6) return;
                axis = dy > dx ? 'v' : 'h';
            }

            const W = inner.clientWidth;

            if (axis === 'h') {
                if (e.cancelable) e.preventDefault();
                /* На мобильном не двигаем слои — только жест */
                if (IS_MOBILE_ART) return;
                const dx = p.x - startX;
                if (currentImgEl) currentImgEl.style.transform = 'translate3d(' + dx + 'px,0,0)';
                if (prevImgEl)    prevImgEl.style.transform    = 'translate3d(' + (-W + dx) + 'px,0,0)';
                if (nextImgEl)    nextImgEl.style.transform    = 'translate3d(' + ( W + dx) + 'px,0,0)';
            } else {
                if (IS_MOBILE_ART) return;
                const dy = p.y - startY;
                if (currentImgEl) {
                    currentImgEl.style.transform = 'translate3d(0,' + dy + 'px,0)';
                    currentImgEl.style.opacity = String(Math.max(0.3, 1 - Math.abs(dy) / 400));
                }
            }
        }, { passive: false });

        catcher.addEventListener('touchend', () => {
            if (!dragging) return;
            dragging = false;
            const dt = Date.now() - t0;
            const dx = lastX - startX;
            const dy = lastY - startY;
            const adx = Math.abs(dx);
            const ady = Math.abs(dy);

            if (axis === 'h') {
                const W = inner.clientWidth;
                const threshold = Math.min(W * 0.18, 90);
                const fast = dt < 260 && adx > 40;
                const far = adx > threshold;

                if ((fast || far) && dx < 0 && current < items.length - 1) {
                    step(1);
                } else if ((fast || far) && dx > 0 && current > 0) {
                    step(-1);
                } else {
                    renderLayers(0);
                }
            } else if (axis === 'v') {
                if (ady > 80) {
                    closeArt();
                } else {
                    renderLayers(0);
                }
            } else {
                renderLayers(0);
            }
            axis = null;
        }, { passive: true });

        catcher.addEventListener('touchcancel', () => {
            dragging = false;
            axis = null;
            renderLayers(0);
        }, { passive: true });

        /* Смена порядка */
        if (controls) {
            controls.querySelectorAll('.art-order-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newOrder = btn.dataset.order;
                    if (newOrder === order) return;
                    order = newOrder;
                    controls.querySelectorAll('.art-order-btn').forEach((b) => b.classList.toggle('active', b === btn));
                    buildOrder();
                    current = 0;
                    clearImage();
                    showImage(0);
                });
            });
        }

        document.querySelectorAll('.art-side').forEach((el) => {
            el.addEventListener('click', (e) => e.stopPropagation());
        });

        updateProgress();
        updateNav();
        window.artOpen  = openArt;
        window.artClose = closeArt;
    });
}

/* ---------- 6.7 ARTICLES ---------- */
function initArticles() {
    once('articles', () => {
        const INDEX_URL      = 'articles/index.json';
        const ARTICLE_DIR    = 'articles/';
        const HASH_PREFIX    = '#article/';
        const ARTICLE_SUFFIX = '.md';

        const list          = document.getElementById('parentsList');
        const reader        = document.getElementById('reader');
        const readerBody    = document.getElementById('readerBody');
        const readerTitle   = document.getElementById('readerTitle');
        const readerContent = document.getElementById('readerContent');
        const readerTime    = document.getElementById('readerTime');
        const progressFill  = document.getElementById('progressFill');
        const backBtnTop    = document.getElementById('backBtnTop');
        const backBtnBottom = document.getElementById('backBtnBottom');

        if (!list || !reader) return;

        const indexCache   = { loaded: false, data: [] };
        const articleCache = new Map();
        let readingSlug    = null;

        const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        function inline(text) {
            return esc(text)
                .replace(/`([^`]+?)`/g, '<code>$1</code>')
                .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
                .replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<em>$2</em>')
                .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        }

        function mdToHtml(src) {
            src = String(src || '').replace(/\r\n?/g, '\n');
            const codeBlocks = [];
            src = src.replace(/```([\s\S]*?)```/g, (_, code) => {
                codeBlocks.push(code.replace(/^\n/, ''));
                return `\u0000CB${codeBlocks.length - 1}\u0000`;
            });
            const lines = src.split('\n');
            const out = [];
            let para = [];
            const flush = () => {
                if (!para.length) return;
                out.push('<p>' + para.map(inline).join('<br>') + '</p>');
                para = [];
            };
            let i = 0;
            while (i < lines.length) {
                const line = lines[i];
                const cb = line.match(/^\u0000CB(\d+)\u0000\s*$/);
                if (cb) { flush(); out.push('<pre><code>' + esc(codeBlocks[+cb[1]]) + '</code></pre>'); i++; continue; }
                if (/^\s*$/.test(line)) { flush(); i++; continue; }
                if (/^#{1,6}\s+/.test(line)) {
                    flush();
                    const m = line.match(/^(#{1,6})\s+(.*)$/);
                    const lvl = m[1].length;
                    out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
                    i++; continue;
                }
                if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flush(); out.push('<hr>'); i++; continue; }
                if (/^>\s?/.test(line)) {
                    flush();
                    const buf = [];
                    while (i < lines.length && /^>\s?/.test(lines[i])) {
                        buf.push(lines[i].replace(/^>\s?/, ''));
                        i++;
                    }
                    out.push('<blockquote>' + buf.map(inline).join('<br>') + '</blockquote>');
                    continue;
                }
                if (/^[-*+]\s+/.test(line)) {
                    flush();
                    const items = [];
                    while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
                        items.push('<li>' + inline(lines[i].replace(/^[-*+]\s+/, '')) + '</li>');
                        i++;
                    }
                    out.push('<ul>' + items.join('') + '</ul>');
                    continue;
                }
                if (/^\d+\.\s+/.test(line)) {
                    flush();
                    const items = [];
                    while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
                        items.push('<li>' + inline(lines[i].replace(/^\d+\.\s+/, '')) + '</li>');
                        i++;
                    }
                    out.push('<ol>' + items.join('') + '</ol>');
                    continue;
                }
                para.push(line);
                i++;
            }
            flush();
            return out.join('\n');
        }

        function stripLeadingH1(md) {
            return String(md || '').replace(/^\s*#\s+.*?(?:\r?\n|$)/, '');
        }

        async function loadIndex(force) {
            if (indexCache.loaded && !force) return indexCache.data;
            const res = await fetch(INDEX_URL, { cache: 'no-cache' });
            if (!res.ok) throw new Error('index.json: HTTP ' + res.status);
            const raw = await res.text();
            let data;
            try { data = JSON.parse(raw); }
            catch (e1) {
                const cleaned = raw
                    .replace(/^\uFEFF/, '')
                    .replace(/\/\/[^\n]*/g, '')
                    .replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/,\s*([\]}])/g, '$1');
                data = JSON.parse(cleaned);
            }
            if (!Array.isArray(data)) throw new Error('index.json должен быть массивом');
            indexCache.data = data;
            indexCache.loaded = true;
            return data;
        }

        async function loadArticle(slug) {
            if (articleCache.has(slug)) return articleCache.get(slug);
            const res = await fetch(ARTICLE_DIR + encodeURIComponent(slug) + ARTICLE_SUFFIX, { cache: 'no-cache' });
            if (!res.ok) throw new Error('Статья не найдена: ' + slug);
            const text = await res.text();
            articleCache.set(slug, text);
            return text;
        }

        function renderLoading() {
            list.innerHTML = '<div class="parents-state">ЗАГРУЗКА…</div>';
        }
        function renderError(msg) {
            list.innerHTML = '';
            const div = document.createElement('div');
            div.className = 'parents-state is-error';
            div.innerHTML = 'НЕ УДАЛОСЬ ЗАГРУЗИТЬ СТАТЬИ' +
                '<small>' + esc(msg) +
                '<br>Убедитесь, что сайт открыт через веб-сервер (не file://), а файл articles/index.json существует.</small>';
            list.appendChild(div);
        }
        function renderEmpty() {
            list.innerHTML = '<div class="parents-state">ПОКА НЕТ СТАТЕЙ<small>Создайте articles/index.json и добавьте первый материал</small></div>';
        }

        function renderList(items) {
            list.innerHTML = '';
            if (!items.length) { renderEmpty(); return; }
            const frag = document.createDocumentFragment();
            items.forEach((item) => {
                const slug  = String(item.slug || '').trim();
                const title = String(item.title || slug || 'Без названия');
                if (!slug) return;

                const card = document.createElement('a');
                card.className = 'parents-card';
                card.href = HASH_PREFIX + encodeURIComponent(slug);
                card.dataset.slug = slug;

                const num = document.createElement('span');
                num.className = 'parents-num';

                const body = document.createElement('div');
                body.className = 'parents-body';

                const label = document.createElement('div');
                label.className = 'parents-label';
                const dot = document.createElement('span');
                dot.className = 'dot';
                const labelText = document.createElement('span');
                labelText.textContent = 'ЗАМЕТКИ · РАЗМЫШЛЕНИЯ · ТЕОРИЯ';
                label.appendChild(dot);
                label.appendChild(labelText);

                const titleEl = document.createElement('div');
                titleEl.className = 'parents-title';
                titleEl.textContent = title;

                const line = document.createElement('span');
                line.className = 'parents-title-line';

                body.appendChild(label);
                body.appendChild(titleEl);
                body.appendChild(line);

                const arrow = document.createElement('span');
                arrow.className = 'parents-arrow';
                arrow.textContent = '→';

                card.appendChild(num);
                card.appendChild(body);
                card.appendChild(arrow);

                card.addEventListener('click', (e) => {
                    if (window.location.hash === card.getAttribute('href')) {
                        e.preventDefault();
                        openBySlug(slug);
                    }
                });

                frag.appendChild(card);
            });
            list.appendChild(frag);
        }

        function readTime(text) {
            const words = String(text).replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
            const mins = Math.max(1, Math.round(words / 180));
            return 'ПРИМЕРНОЕ ВРЕМЯ ДОКЛАДА: ' + mins + ' МИН';
        }

        async function openBySlug(slug) {
            if (!slug) return;
            if (readingSlug === slug && reader.classList.contains('show')) return;

            let md;
            try {
                md = await loadArticle(slug);
            } catch (err) {
                if (window.location.hash.startsWith(HASH_PREFIX)) {
                    history.replaceState('', document.title, window.location.pathname + window.location.search);
                }
                readingSlug = null;
                return;
            }

            const meta  = indexCache.data.find((x) => x && x.slug === slug) || {};
            const title = meta.title || slug;
            const html  = mdToHtml(stripLeadingH1(md));

            readingSlug = slug;
            if (readerTitle) readerTitle.textContent = title;
            if (readerContent) readerContent.innerHTML = html;
            if (readerTime) readerTime.textContent = readTime(html);

            document.body.style.overflow = 'hidden';
            reader.setAttribute('aria-hidden', 'false');
            requestAnimationFrame(() => {
                reader.classList.add('show');
                if (readerBody) readerBody.scrollTop = 0;
                if (progressFill) progressFill.style.width = '0%';
            });
        }

        function closeReader() {
            if (!reader.classList.contains('show')) return;
            reader.classList.remove('show');
            reader.setAttribute('aria-hidden', 'true');
            readingSlug = null;
            document.body.style.overflow = '';
        }
        function closeArticle() {
            if (window.location.hash.startsWith(HASH_PREFIX)) {
                history.pushState('', document.title, window.location.pathname + window.location.search);
                closeReader();
            } else {
                closeReader();
            }
        }

        function handleHash() {
            const hash = window.location.hash;
            if (hash.startsWith(HASH_PREFIX)) {
                const slug = decodeURIComponent(hash.slice(HASH_PREFIX.length));
                if (readingSlug !== slug) openBySlug(slug);
            } else {
                if (readingSlug) closeReader();
            }
        }

        window.addEventListener('hashchange', handleHash);

        if (backBtnTop)    backBtnTop.addEventListener('click', closeArticle);
        if (backBtnBottom) backBtnBottom.addEventListener('click', closeArticle);

        document.addEventListener('keydown', (e) => {
            if (reader.classList.contains('show') && e.key === 'Escape') closeArticle();
        });

        if (readerBody) {
            readerBody.addEventListener('scroll', () => {
                const max = readerBody.scrollHeight - readerBody.clientHeight;
                const p = max > 0 ? (readerBody.scrollTop / max) * 100 : 0;
                if (progressFill) progressFill.style.width = p + '%';
            }, { passive: true });
        }

        renderLoading();
        loadIndex()
            .then((items) => renderList(items))
            .catch((err) => { console.warn('Parents:', err); renderError(err.message || 'Ошибка загрузки'); })
            .finally(() => { handleHash(); });
    });
}

/* ============================================================
   7. СТРАНИЦА И СТАРТ
   ============================================================ */
function detectPage() {
    let path = (window.location.pathname.split('/').filter(Boolean).pop() || '').toLowerCase();
    path = path.replace(/\.html$/, '');
    if (path === '' || path === 'index')  return 'home';
    if (path === 'reading')    return 'reading';
    if (path === 'tools')      return 'tools';
    if (path === 'heroes')     return 'heroes';
    if (path === 'cinema')     return 'cinema';
    if (path === 'poetry')     return 'poetry';
    if (path === 'art')        return 'art';
    if (path === 'articles')   return 'articles';
    return 'unknown';
}

function initPageSpecific(page) {
    switch (page) {
        case 'home':     initHome();     break;
        case 'reading':  initReading();  break;
        case 'tools':    initTools();    break;
        case 'heroes':   initHeroes();   break;
        case 'cinema':   initCinema();   break;
        case 'poetry':   initPoetry();   break;
        case 'art':      initArt();      break;
        case 'articles': initArticles(); break;
    }
}

function bootstrap() {
    initTheme();
    initBurger();
    initPageSpecific(detectPage());

    const page = detectPage();
    playEntryAnimation(() => {
        if (page === 'home' || page === 'tools') {
            const tw = document.getElementById('terminalWord');
            if (tw) setTimeout(() => triggerCyberFlicker(tw), 500);
        }
        if (page === 'art' && typeof window.artOpen === 'function') {
            setTimeout(() => window.artOpen(), 200);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
