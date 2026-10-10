// win-effects.js
// Эффекты на canvas: flame (ошибка) и sand game (победа, "УРА").

/* ============================================================
   БАЗОВЫЙ КЛАСС
   ============================================================ */
class BaseEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this.raf = null;
        this.startTime = 0;

        this.dpr = 1;
        this.width = 0;
        this.height = 0;
        this.fontSize = 14;
        this.cellW = 0;
        this.cellH = 0;
        this.cols = 0;
        this.rows = 0;

        this.glyphCache = new Map();
        this._onResize = () => this.resize();
        window.addEventListener('resize', this._onResize);
    }

    resize() {
        this.dpr = window.devicePixelRatio || 1;
        const w = this.canvas.clientWidth || window.innerWidth;
        const h = this.canvas.clientHeight || window.innerHeight;
        this.canvas.width  = Math.floor(w * this.dpr);
        this.canvas.height = Math.floor(h * this.dpr);
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.width = w;
        this.height = h;
        this.cellW = this.fontSize * 0.6;
        this.cellH = this.fontSize;
        this.cols = Math.ceil(w / this.cellW);
        this.rows = Math.ceil(h / this.cellH);
        this.glyphCache.clear();

        if (this.onResize) this.onResize();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.resize();
        this.startTime = performance.now();
        if (this.onStart) this.onStart();
        const loop = (now) => {
            if (!this.running) return;
            this.render(now);
            this.raf = requestAnimationFrame(loop);
        };
        this.raf = requestAnimationFrame(loop);
    }

    stop() {
        this.running = false;
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = null;
    }

    drawCell(x, y, char, fg, bg) {
        const px = Math.floor(x * this.cellW);
        const py = Math.floor(y * this.cellH);
        const w = Math.ceil(this.cellW);
        const h = Math.ceil(this.cellH);

        if (bg && bg !== 'black' && bg !== 'transparent') {
            this.ctx.fillStyle = bg;
            this.ctx.fillRect(px, py, w, h);
        }
        if (char && char !== ' ') {
            const glyph = this.getGlyph(char, fg || '#fff');
            this.ctx.drawImage(glyph, px, py);
        }
    }

    getGlyph(char, color) {
        const key = char + '|' + color;
        let c = this.glyphCache.get(key);
        if (c) return c;

        const w = Math.ceil(this.cellW);
        const h = Math.ceil(this.cellH);
        c = document.createElement('canvas');
        c.width = w; c.height = h;
        const g = c.getContext('2d');
        g.font = `bold ${this.fontSize}px 'Segoe UI', monospace`;
        g.textBaseline = 'top';
        g.textAlign = 'left';
        g.fillStyle = color;
        g.fillText(char, 0, 0);

        this.glyphCache.set(key, c);
        return c;
    }

    render() {}
}

/* ============================================================
   1. FLAME — для ошибки (без надписи по центру)
   ============================================================ */
class FlameEffect extends BaseEffect {
    constructor(canvas) {
        super(canvas);
        this.fontSize = 14;
        this.palette = [
            'black', 'purple', 'darkred', 'red',
            'orangered', 'gold', 'lemonchiffon', 'white'
        ];
        this.flame = '011222233334444444455566667'.split('').map(Number);
        this.data = [];
        this._noiseInit = false;
    }

    onResize() {
        this.data = new Array(this.cols * this.rows).fill(0);
    }

    render() {
        this.stepFlame();
        this.ctx.clearRect(0, 0, this.width, this.height);

        const cols = this.cols, rows = this.rows;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const u = this.data[y * cols + x];
                const v = this.flame[Math.min(this.flame.length - 1, Math.max(0, u))];
                if (v === 0) continue;
                const ch = String(u % 10);
                const fg = this.palette[Math.min(this.palette.length - 1, v + 1)];
                const bg = this.palette[v];
                this.drawCell(x, y, ch, fg, bg);
            }
        }
    }

    stepFlame() {
        const cols = this.cols, rows = this.rows;
        const data = this.data;
        if (!cols || !rows) return;

        const t = performance.now() * 0.0015;
        const last = cols * (rows - 1);
        for (let i = 0; i < cols; i++) {
            const val = Math.floor(this.mapRange(this.noise(i * 0.05, t), 0, 1, 5, 50));
            const idx = last + i;
            data[idx] = Math.min(val, data[idx] + 2);
        }

        for (let i = 0; i < data.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const destCol = Math.max(0, Math.min(cols - 1, col + this.rndi(-1, 1)));
            const dest = row * cols + destCol;
            const srcRow = Math.min(rows - 1, row + 1);
            const src = srcRow * cols + col;
            data[dest] = Math.max(0, data[src] - this.rndi(0, 2));
        }
    }

    rndi(a, b = 0) {
        if (a > b) [a, b] = [b, a];
        return Math.floor(a + Math.random() * (b - a + 1));
    }

    mapRange(v, a, b, c, d) { return c + (v - a) / (b - a) * (d - c); }

    noise(px, py) {
        if (!this._noiseInit) {
            const tableSize = 256;
            const r = new Array(tableSize);
            const perm = new Array(tableSize * 2);
            for (let k = 0; k < tableSize; k++) { r[k] = Math.random(); perm[k] = k; }
            for (let k = 0; k < tableSize; k++) {
                const i = Math.floor(Math.random() * tableSize);
                [perm[k], perm[i]] = [perm[i], perm[k]];
                perm[k + tableSize] = perm[k];
            }
            this._r = r; this._perm = perm;
            this._noiseInit = true;
        }
        const tableSize = 256;
        const r = this._r, perm = this._perm;
        const xi = Math.floor(px), yi = Math.floor(py);
        const tx = px - xi, ty = py - yi;
        const rx0 = xi % tableSize, rx1 = (rx0 + 1) % tableSize;
        const ry0 = yi % tableSize, ry1 = (ry0 + 1) % tableSize;
        const c00 = r[perm[perm[rx0] + ry0]];
        const c10 = r[perm[perm[rx1] + ry0]];
        const c01 = r[perm[perm[rx0] + ry1]];
        const c11 = r[perm[perm[rx1] + ry1]];
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const nx0 = c00 + (c10 - c00) * sx;
        const nx1 = c01 + (c11 - c01) * sx;
        return nx0 + (nx1 - nx0) * sy;
    }
}

/* ============================================================
   2. SAND GAME (победа, слово "УРА")
   ============================================================ */
class SandEffect extends BaseEffect {
    constructor(canvas) {
        super(canvas);
        this.fontSize = 20;
        this.WORD = 'УРА';
        this.LETTERS = this.WORD.split('');
        this.letterIndex = 0;

        this.grid = null;
        this.nextGrid = null;
        this._width = 0;
        this._height = 0;

        this.SOLID = '\u0000';

        // курсор для спавна (мышь/тач)
        this.cursor = { x: -100, y: -100, pressed: false };

        // автоматический спавн по центру, чтобы сразу было видно
        this.autoSpawnTimer = 0;
        this.autoSpawnX = 0;
        this.autoSpawnY = 0;

        this._setupInput();
    }

    _setupInput() {
        const c = this.canvas;
        const self = this;

        const updateFromEvent = (clientX, clientY) => {
            const rect = c.getBoundingClientRect();
            const x = Math.floor((clientX - rect.left) / self.cellW);
            const y = Math.floor((clientY - rect.top) / self.cellH);
            self.cursor.x = x;
            self.cursor.y = y;
        };

        c.addEventListener('mousemove', (e) => updateFromEvent(e.clientX, e.clientY));
        c.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                self.cursor.pressed = true;
                updateFromEvent(e.clientX, e.clientY);
            }
        });
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) self.cursor.pressed = false;
        });
        c.addEventListener('mouseleave', () => {
            self.cursor.pressed = false;
            self.cursor.x = -100;
            self.cursor.y = -100;
        });

        c.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            const rect = c.getBoundingClientRect();
            self.cursor.x = Math.floor((t.clientX - rect.left) / self.cellW);
            self.cursor.y = Math.floor((t.clientY - rect.top) / self.cellH);
            self.cursor.pressed = true;
        }, { passive: false });
        c.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            const rect = c.getBoundingClientRect();
            self.cursor.x = Math.floor((t.clientX - rect.left) / self.cellW);
            self.cursor.y = Math.floor((t.clientY - rect.top) / self.cellH);
        }, { passive: false });
        c.addEventListener('touchend', (e) => {
            e.preventDefault();
            self.cursor.pressed = false;
            self.cursor.x = -100;
            self.cursor.y = -100;
        }, { passive: false });
    }

    onResize() {
        this._width = this.cols;
        this._height = this.rows;

        // пересоздаём сетку (сохраняем, если была)
        const old = this.grid;
        const oldW = this._oldW || 0;
        const oldH = this._oldH || 0;

        const w = this._width, h = this._height;
        const newGrid = new Array(w * h);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let ch;
                if (y === h - 1 || x === 0 || x === w - 1) {
                    ch = this.SOLID;
                } else if (old && x < oldW && y < oldH) {
                    ch = old[y * oldW + x];
                } else {
                    ch = ' ';
                }
                newGrid[y * w + x] = ch;
            }
        }
        this.grid = newGrid;
        this._oldW = w;
        this._oldH = h;

        // точка автоспавна — над центром
        this.autoSpawnX = Math.floor(w / 2);
        this.autoSpawnY = Math.floor(h * 0.25);
    }

    nextLetter() {
        const ch = this.LETTERS[this.letterIndex];
        this.letterIndex = (this.letterIndex + 1) % this.LETTERS.length;
        return ch;
    }

    idx(x, y) { return y * this._width + x; }
    inBounds(x, y) { return x >= 0 && x < this._width && y >= 0 && y < this._height; }

    render() {
        this.step();
        this.draw();
    }

    step() {
        const w = this._width, h = this._height;
        if (!w || !h) return;

        this.nextGrid = this.grid.slice();

        // автоспавн в верхней части, чтобы всегда что-то сыпалось
        this.autoSpawnTimer++;
        if (this.autoSpawnTimer % 4 === 0) {
            const cx = this.autoSpawnX + Math.floor((Math.random() - 0.5) * 8);
            const cy = this.autoSpawnY;
            if (this.inBounds(cx, cy) && this.nextGrid[this.idx(cx, cy)] === ' ') {
                this.nextGrid[this.idx(cx, cy)] = this.nextLetter();
            }
        }

        // спавн от курсора/тапа
        if (this.cursor.pressed) {
            for (let dy = -4; dy <= 4; dy++) {
                for (let dx = -4; dx <= 4; dx++) {
                    if (dx * dx + dy * dy > 16) continue;
                    const cx = this.cursor.x + dx;
                    const cy = this.cursor.y + dy;
                    if (!this.inBounds(cx, cy)) continue;
                    if (this.nextGrid[this.idx(cx, cy)] === this.SOLID) continue;
                    if (this.nextGrid[this.idx(cx, cy)] !== ' ') continue;
                    if (Math.random() < 0.4) {
                        this.nextGrid[this.idx(cx, cy)] = this.nextLetter();
                    }
                }
            }
        }

        const frame = Math.floor(performance.now() / 60);

        for (let y = h - 2; y >= 1; y--) {
            const dir = (frame + y) % 2 === 0 ? -1 : 1;

            for (let x = 1; x < w - 1; x++) {
                const i = this.idx(x, y);
                const cell = this.nextGrid[i];
                if (cell === ' ' || cell === this.SOLID) continue;

                const belowIdx = this.idx(x, y + 1);
                if (this.nextGrid[belowIdx] === ' ') {
                    this.nextGrid[belowIdx] = cell;
                    this.nextGrid[i] = ' ';
                    continue;
                }

                const blIdx = this.idx(x - 1, y + 1);
                const brIdx = this.idx(x + 1, y + 1);
                const lIdx  = this.idx(x - 1, y);
                const rIdx  = this.idx(x + 1, y);

                const leftFree  = this.nextGrid[blIdx] === ' ';
                const rightFree = this.nextGrid[brIdx] === ' ';
                const leftSideFree  = this.nextGrid[lIdx] === ' ';
                const rightSideFree = this.nextGrid[rIdx] === ' ';

                if (dir === -1) {
                    if (leftFree && leftSideFree) {
                        this.nextGrid[blIdx] = cell;
                        this.nextGrid[i] = ' ';
                        continue;
                    }
                    if (rightFree && rightSideFree) {
                        this.nextGrid[brIdx] = cell;
                        this.nextGrid[i] = ' ';
                        continue;
                    }
                } else {
                    if (rightFree && rightSideFree) {
                        this.nextGrid[brIdx] = cell;
                        this.nextGrid[i] = ' ';
                        continue;
                    }
                    if (leftFree && leftSideFree) {
                        this.nextGrid[blIdx] = cell;
                        this.nextGrid[i] = ' ';
                        continue;
                    }
                }
            }
        }

        this.grid = this.nextGrid;
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const w = this._width, h = this._height;
        if (!w || !h) return;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${this.fontSize}px 'Courier New', monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 240, 180, 0.7)';
        ctx.shadowBlur = 6;

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const ch = this.grid[this.idx(x, y)];
                if (ch === ' ' || ch === this.SOLID) continue;
                const px = x * this.cellW + this.cellW / 2;
                const py = y * this.cellH + this.cellH / 2;
                ctx.fillText(ch, px, py);
            }
        }

        ctx.shadowBlur = 0;
    }
}

/* ============================================================
   ФАБРИКИ
   ============================================================ */
export function createFlameEffect(canvas) {
    return new FlameEffect(canvas);
}

export function createSandEffect(canvas) {
    return new SandEffect(canvas);
}

export { FlameEffect, SandEffect };
