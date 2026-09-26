/* ============================================================
   ГРАМОТИНЬО — tools-clock.js
   Логика аналоговых часов на странице tools.html.
   ============================================================ */
'use strict';

window.initToolsClock = function () {
    const clockView    = document.getElementById('clockView');
    const watchView    = document.getElementById('watchView');
    const schemeView   = document.getElementById('schemeView');
    const minuteScheme = document.getElementById('minuteScheme');
    const clockSwitch  = document.getElementById('clockSwitch');
    const styleLabel   = document.getElementById('styleLabel');
    const clockDigitalEl = document.getElementById('clockDigital');
    if (!clockView || !watchView) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const NS = 'http://www.w3.org/2000/svg';
    const CX = 200, CY = 260, VIEWBOX_W = 440;
    const MOVE_THRESHOLD = 5;
    const TAP_MIN_DURATION = 400, TAP_MAX_DURATION = 1200;
    const TAP_MAX_MOVE = 12, GRAB_RADIUS = 220;
    const AUDIO_DIR = 'clock_audio/';

    const SVGS = {
        'minimal':       document.getElementById('watchSvgMinimal'),
        'victory-light': document.getElementById('watchSvgLight'),
        'victory-dark':  document.getElementById('watchSvgDark')
    };
    const PREFIXES = { 'minimal': 'clkM', 'victory-light': 'clkL', 'victory-dark': 'clkDk' };
    const STYLE_LABELS = {
        'minimal': 'минималистичные',
        'victory-light': 'победа · светлые',
        'victory-dark': 'победа · тёмные'
    };
    const STYLE_ORDER = ['minimal', 'victory-light', 'victory-dark'];

    let currentStyle = 'minimal';
    let hour = 3, minute = 0, seconds = 0;
    let totalMinutes = (hour % 12) * 60 + minute;
    let currentView = 'watch';
    let lastDragTime = 0;

    const AC_CTOR = window.AudioContext || window.webkitAudioContext;
    const audioCtx = AC_CTOR ? new AC_CTOR() : null;
    const audioBuffers = new Map();
    const decodePromises = new Map();
    let playSession = 0;
    let audioUnlocked = false;

    function fetchBuffer(name) {
        if (!audioCtx) return Promise.resolve(null);
        if (audioBuffers.has(name)) return Promise.resolve(audioBuffers.get(name));
        if (decodePromises.has(name)) return decodePromises.get(name);
        const p = fetch(AUDIO_DIR + name)
            .then(r => r.arrayBuffer())
            .then(buf => new Promise((resolve, reject) => {
                audioCtx.decodeAudioData(buf, resolve, reject);
            }))
            .then(decoded => {
                audioBuffers.set(name, decoded);
                decodePromises.delete(name);
                return decoded;
            })
            .catch(err => {
                decodePromises.delete(name);
                console.warn('Не удалось загрузить', name, err);
                return null;
            });
        decodePromises.set(name, p);
        return p;
    }

    function preloadOnDemand() {
        if (!audioCtx) return;
        fetchBuffer(`h_${String(hour).padStart(2, '0')}.mp3`);
        if (minute === 0) fetchBuffer('rovno.mp3');
        else fetchBuffer(`m_${String(minute).padStart(2, '0')}.mp3`);
    }

    function unlockAudioContext() {
        if (!audioCtx || audioUnlocked) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            audioUnlocked = audioCtx.state === 'running';
        } catch (e) {}
    }

    function stopClockAudio() { playSession++; }

    function speakTime() {
        if (!audioCtx) return;
        unlockAudioContext();
        const myToken = ++playSession;
        const isStale = () => myToken !== playSession;
        const seq = [`h_${String(hour).padStart(2, '0')}.mp3`];
        if (minute === 0) seq.push('rovno.mp3');
        else seq.push(`m_${String(minute).padStart(2, '0')}.mp3`);

        Promise.all(seq.map(fetchBuffer)).then(() => {
            if (isStale()) return;
            const playChain = () => {
                if (isStale()) return;
                const name = seq.shift();
                if (!name) return;
                const buf = audioBuffers.get(name);
                if (!buf) { playChain(); return; }
                const src = audioCtx.createBufferSource();
                src.buffer = buf;
                src.connect(audioCtx.destination);
                src.onended = () => { if (!isStale()) playChain(); };
                src.start(0);
            };
            playChain();
        });
    }

    const builtDials = new Set();

    function buildDial(prefix) {
        if (builtDials.has(prefix)) return;
        const svg = prefix === 'clkM' ? SVGS['minimal']
                  : prefix === 'clkL' ? SVGS['victory-light']
                  : SVGS['victory-dark'];
        const ticks   = svg.querySelector('#' + prefix + '-ticksGroup');
        const numbers = svg.querySelector('#' + prefix + '-numbersGroup');
        if (!ticks || !numbers) return;
        const isDark = (prefix === 'clkDk');
        const isMin  = (prefix === 'clkM');

        if (isMin) {
            for (let i = 0; i < 60; i++) {
                const a = (i * 6 - 90) * Math.PI / 180;
                const big = i % 5 === 0;
                const r1 = big ? 130 : 137, r2 = 144;
                const l = document.createElementNS(NS, 'line');
                l.setAttribute('x1', (CX + r1 * Math.cos(a)).toFixed(2));
                l.setAttribute('y1', (CY + r1 * Math.sin(a)).toFixed(2));
                l.setAttribute('x2', (CX + r2 * Math.cos(a)).toFixed(2));
                l.setAttribute('y2', (CY + r2 * Math.sin(a)).toFixed(2));
                l.setAttribute('stroke', 'currentColor');
                l.setAttribute('stroke-width', big ? '1.3' : '0.6');
                l.setAttribute('opacity', big ? '0.85' : '0.32');
                l.setAttribute('stroke-linecap', 'round');
                ticks.appendChild(l);
            }
            for (let i = 1; i <= 12; i++) {
                const a = (i * 30 - 90) * Math.PI / 180;
                const t = document.createElementNS(NS, 'text');
                t.setAttribute('x', (CX + 110 * Math.cos(a)).toFixed(2));
                t.setAttribute('y', (CY + 110 * Math.sin(a)).toFixed(2));
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('dominant-baseline', 'central');
                t.setAttribute('font-family', "Inter, system-ui, sans-serif");
                t.setAttribute('font-size', '19');
                t.setAttribute('font-weight', '300');
                t.setAttribute('fill', 'currentColor');
                t.setAttribute('opacity', '0.75');
                t.textContent = i;
                numbers.appendChild(t);
            }
        } else {
            const numColor = isDark ? '#f5e6b8' : '#1a1a1a';

            for (let i = 0; i < 60; i++) {
                const a = (i * 6 - 90) * Math.PI / 180;
                const big = i % 5 === 0;
                const rIn = big ? 128 : 133;
                const rOut = 141;
                const l = document.createElementNS(NS, 'line');
                l.setAttribute('x1', (CX + rIn * Math.cos(a)).toFixed(2));
                l.setAttribute('y1', (CY + rIn * Math.sin(a)).toFixed(2));
                l.setAttribute('x2', (CX + rOut * Math.cos(a)).toFixed(2));
                l.setAttribute('y2', (CY + rOut * Math.sin(a)).toFixed(2));
                l.setAttribute('stroke', numColor);
                l.setAttribute('stroke-width', big ? '1.8' : '0.7');
                l.setAttribute('opacity', big ? '1' : (isDark ? '0.75' : '0.6'));
                l.setAttribute('stroke-linecap', 'butt');
                ticks.appendChild(l);
            }

            for (let i = 1; i <= 12; i++) {
                if (i === 6) continue;
                const a = (i * 30 - 90) * Math.PI / 180;
                const t = document.createElementNS(NS, 'text');
                t.setAttribute('x', (CX + 108 * Math.cos(a)).toFixed(2));
                t.setAttribute('y', (CY + 108 * Math.sin(a)).toFixed(2));
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('dominant-baseline', 'central');
                t.setAttribute('font-family', "Georgia, 'Times New Roman', serif");
                t.setAttribute('font-size', '26');
                t.setAttribute('font-weight', '700');
                t.setAttribute('fill', numColor);
                t.textContent = i;
                numbers.appendChild(t);
            }
        }
        builtDials.add(prefix);
    }

    function buildSubDial(prefix) {
        const key = prefix + '-sub';
        if (builtDials.has(key)) return;
        const isDark = prefix === 'clkDk';
        const svg = isDark ? SVGS['victory-dark'] : SVGS['victory-light'];
        const subTicks = svg.querySelector('#' + prefix + '-subTicks');
        if (!subTicks) return;
        const scx = 200;
        const scy = 345;
        const rIn  = isDark ? 24 : 26;
        const rOut = isDark ? 31 : 33;
        const color = isDark ? '#e8cf83' : '#1a1a1a';
        for (let i = 0; i < 60; i++) {
            const a = (i * 6 - 90) * Math.PI / 180;
            const big = i % 5 === 0;
            const r1 = big ? rIn : rIn + 3;
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('x1', (scx + r1 * Math.cos(a)).toFixed(2));
            l.setAttribute('y1', (scy + r1 * Math.sin(a)).toFixed(2));
            l.setAttribute('x2', (scx + rOut * Math.cos(a)).toFixed(2));
            l.setAttribute('y2', (scy + rOut * Math.sin(a)).toFixed(2));
            l.setAttribute('stroke', color);
            l.setAttribute('stroke-width', big ? '1' : '0.5');
            l.setAttribute('opacity', big ? '0.95' : '0.55');
            l.setAttribute('stroke-linecap', 'round');
            subTicks.appendChild(l);
        }
        builtDials.add(key);
    }

    let hourHandEl, minuteHandEl, activeSecondHand;

    function applyStyle(style) {
        if (!SVGS[style]) return;
        currentStyle = style;

        Object.entries(SVGS).forEach(([k, svg]) => {
            if (!svg) return;
            svg.style.display = (k === style) ? 'block' : 'none';
        });

        const prefix = PREFIXES[style];
        hourHandEl   = SVGS[style].querySelector('#' + prefix + '-hourHand');
        minuteHandEl = SVGS[style].querySelector('#' + prefix + '-minuteHand');
        activeSecondHand = SVGS[style].querySelector('#' + prefix + '-secondHand');

        buildDial(prefix);
        if (style !== 'minimal') buildSubDial(prefix);

        if (styleLabel) styleLabel.textContent = STYLE_LABELS[style];

        render();
        preloadOnDemand();
    }

    function render() {
        const hourDeg = (hour % 12) * 30 + minute * 0.5;
        const minuteDeg = minute * 6;
        if (hourHandEl)   hourHandEl.setAttribute('transform',   `rotate(${hourDeg} ${CX} ${CY})`);
        if (minuteHandEl) minuteHandEl.setAttribute('transform', `rotate(${minuteDeg} ${CX} ${CY})`);

        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        const dh = document.getElementById('clockDigitalH');
        const dm = document.getElementById('clockDigitalM');
        if (dh) dh.textContent = hh;
        if (dm) dm.textContent = mm;

        renderSecondHand();
    }

    function renderSecondHand() {
        if (!activeSecondHand) return;
        if (currentStyle === 'minimal') {
            const deg = seconds * 6;
            activeSecondHand.setAttribute('transform', `rotate(${deg} ${CX} ${CY})`);
            return;
        }
        let scx, scy, srad;
        if (currentStyle === 'victory-dark')      { scx = 200; scy = 345; srad = 26; }
        else if (currentStyle === 'victory-light'){ scx = 200; scy = 345; srad = 28; }
        else return;
        const deg = seconds * 6;
        const rad = (deg - 90) * Math.PI / 180;
        const x2 = scx + srad * Math.cos(rad);
        const y2 = scy + srad * Math.sin(rad);
        activeSecondHand.setAttribute('x1', scx);
        activeSecondHand.setAttribute('y1', scy);
        activeSecondHand.setAttribute('x2', x2.toFixed(2));
        activeSecondHand.setAttribute('y2', y2.toFixed(2));
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => { isVisible = !document.hidden; });

    setInterval(() => {
        if (!isVisible) return;
        seconds = (seconds + 1) % 60;
        if (seconds === 0) {
            totalMinutes = Math.round(totalMinutes) + 1;
            applyTotal();
            render();
        } else {
            renderSecondHand();
        }
    }, 1000);

    function applyTotal() {
        const rounded = Math.round(totalMinutes);
        minute = ((rounded % 60) + 60) % 60;
        let h = Math.floor(rounded / 60) % 12;
        h = ((h % 12) + 12) % 12;
        hour = h === 0 ? 12 : h;
    }

    function setView(view) {
        currentView = view;
        if (view === 'watch') {
            watchView.classList.remove('hidden');
            schemeView.classList.remove('active');
            clockView.classList.remove('view-scheme');
            clockView.classList.add('view-watch');
        } else {
            watchView.classList.add('hidden');
            schemeView.classList.add('active');
            clockView.classList.remove('view-watch');
            clockView.classList.add('view-scheme');
        }
    }
    function toggleView() { setView(currentView === 'watch' ? 'scheme' : 'watch'); }

    function getPoint(e) {
        if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }
    function angleFromPoint(p) {
        const rect = clockView.getBoundingClientRect();
        const scale = rect.width / VIEWBOX_W;
        const cx = rect.left + CX * scale;
        const cy = rect.top + CY * scale;
        let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90;
        return (a % 360 + 360) % 360;
    }
    function angleDiff(a, b) { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
    function isPointInsideWatch(p) {
        const rect = clockView.getBoundingClientRect();
        const scale = rect.width / VIEWBOX_W;
        const cx = rect.left + CX * scale;
        const cy = rect.top + CY * scale;
        return Math.hypot(p.x - cx, p.y - cy) <= GRAB_RADIUS * scale;
    }

    let gesture = null;
    function startGesture(point, source) {
        if (gesture) return;
        unlockAudioContext();
        gesture = { startX: point.x, startY: point.y, startTime: Date.now(), mode: null, pointer: null, angle: 0, source };
    }
    function moveGesture(e, point) {
        if (!gesture) return;
        const dx = point.x - gesture.startX, dy = point.y - gesture.startY;
        const adx = Math.abs(dx), ady = Math.abs(dy);
        if (!gesture.mode) {
            if (adx < MOVE_THRESHOLD && ady < MOVE_THRESHOLD) return;
            if (gesture.source === 'touch' && ady > adx * 2.0) { gesture.mode = 'scroll'; return; }
            if (currentView === 'watch' && isPointInsideWatch(point)) {
                gesture.mode = 'drag';
                const ang = angleFromPoint(point);
                const hourAng = ((hour % 12) * 30 + minute * 0.5 + 360) % 360;
                const minAng  = (minute * 6 + 360) % 360;
                gesture.pointer = angleDiff(ang, minAng) <= angleDiff(ang, hourAng) ? 'minute' : 'hour';
                gesture.angle = ang;
                clockView.classList.add('dragging');
            } else {
                gesture.mode = 'other';
            }
        }
        if (gesture.mode === 'drag') {
            lastDragTime = Date.now();
            if (e.cancelable !== false) { try { e.preventDefault(); } catch (err) {} }
            const ang = angleFromPoint(point);
            if (gesture.pointer === 'minute') {
                let delta = ang - gesture.angle;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;
                totalMinutes += delta / 6;
                applyTotal();
            } else {
                let h = (ang - minute * 0.5) / 30;
                h = ((Math.round(h) % 12) + 12) % 12;
                hour = h === 0 ? 12 : h;
                totalMinutes = (hour % 12) * 60 + minute;
            }
            gesture.angle = ang;
            render();
        }
    }
    function endGesture(point) {
        if (!gesture) return;
        const duration = Date.now() - gesture.startTime;
        const wasDrag   = gesture.mode === 'drag';
        const wasScroll = gesture.mode === 'scroll';
        const wasOther  = gesture.mode === 'other';
        if (wasDrag) {
            clockView.classList.remove('dragging');
            lastDragTime = Date.now();
            if (!isIOS) speakTime();
        } else if (!wasScroll && !wasOther && point && duration >= TAP_MIN_DURATION && duration < TAP_MAX_DURATION) {
            const ddx = Math.abs(point.x - gesture.startX);
            const ddy = Math.abs(point.y - gesture.startY);
            if (ddx < TAP_MAX_MOVE && ddy < TAP_MAX_MOVE) {
                if (currentView === 'scheme' || isPointInsideWatch(point)) toggleView();
            }
        }
        gesture = null;
    }
    function cancelGesture() {
        if (!gesture) return;
        if (gesture.mode === 'drag') clockView.classList.remove('dragging');
        gesture = null;
    }

    clockView.addEventListener('touchstart', e => { if (e.touches.length !== 1) return; startGesture(getPoint(e), 'touch'); }, { passive: true });
    clockView.addEventListener('touchmove', e => {
        if (!gesture || gesture.source !== 'touch') return;
        if (e.touches.length !== 1) { cancelGesture(); return; }
        moveGesture(e, getPoint(e));
    }, { passive: false });
    clockView.addEventListener('touchend', e => { if (!gesture || gesture.source !== 'touch') return; endGesture(getPoint(e)); }, { passive: true });
    clockView.addEventListener('touchcancel', () => { if (!gesture || gesture.source !== 'touch') return; cancelGesture(); }, { passive: true });

    clockView.addEventListener('mousedown', e => { if (e.button !== 0) return; startGesture(getPoint(e), 'mouse'); });
    window.addEventListener('mousemove', e => { if (!gesture || gesture.source !== 'mouse') return; moveGesture(e, getPoint(e)); });
    window.addEventListener('mouseup', e => { if (!gesture || gesture.source !== 'mouse') return; endGesture(getPoint(e)); });

    if (clockDigitalEl) {
        clockDigitalEl.addEventListener('click', e => {
            e.stopPropagation();
            unlockAudioContext();
            speakTime();
        });
    }

    let clickTimer = null, clickCount = 0;
    function playSpin() {
        clockSwitch.classList.remove('spin');
        void clockSwitch.offsetWidth;
        clockSwitch.classList.add('spin');
        setTimeout(() => clockSwitch.classList.remove('spin'), 950);
    }
    clockSwitch.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                const idx = STYLE_ORDER.indexOf(currentStyle);
                applyStyle(STYLE_ORDER[(idx + 1) % STYLE_ORDER.length]);
                playSpin();
                clickCount = 0;
            }, 280);
        } else if (clickCount === 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            toggleView();
            playSpin();
        }
    });

    (function buildScheme() {
        if (!minuteScheme) return;
        const S = 100;
        for (let i = 0; i < 12; i++) {
            const a = (i * 30 - 90) * Math.PI / 180;
            const v = i === 0 ? 60 : i * 5;
            const t = document.createElementNS(NS, 'text');
            t.setAttribute('x', S + 62 * Math.cos(a));
            t.setAttribute('y', S + 62 * Math.sin(a));
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('dominant-baseline', 'central');
            t.setAttribute('font-family', "IBM Plex Mono, monospace");
            t.setAttribute('font-size', '22');
            t.setAttribute('font-weight', '700');
            t.setAttribute('fill', 'currentColor');
            t.textContent = v;
            minuteScheme.appendChild(t);
        }
    })();
   (function () {
    // Определяем телефон (не планшет, не комп)
    function isPhone() {
        var ua = navigator.userAgent || navigator.vendor || window.opera || '';

        // iPad — это планшет (в т.ч. iPadOS 13+, который маскируется под Mac)
        if (/iPad/i.test(ua)) return false;
        if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return false;

        // iPhone / iPod — телефон
        if (/iPhone|iPod/i.test(ua)) return true;

        // Android: с "Mobile" — телефон, без — планшет/ТВ
        if (/Android/i.test(ua)) return /Mobile/i.test(ua);

        // Прочие мобильные
        if (/Mobi|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua)) return true;

        // Fallback: узкий экран + тач → телефон
        if (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 768) return true;

        return false;
    }

    var btn = document.getElementById('spaceSwitch');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        var target = isPhone() ? 'spacewatch2.html' : 'spacewatch.html';
        window.location.href = target;
    });
})();

    applyStyle('minimal');
    setView('watch');
};
