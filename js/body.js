'use strict';
/* ===== Körperkarte (Frau/Mann, vorne/hinten): je mehr trainiert, desto röter ===== */
const MUSCLE_DE = {
  abdominals: 'Bauch', abductors: 'Hüfte außen', adductors: 'Innenschenkel', biceps: 'Bizeps', calves: 'Waden', chest: 'Brust',
  forearms: 'Unterarme', glutes: 'Po', hamstrings: 'Beinbeuger', lats: 'Latissimus', 'lower back': 'Unterer Rücken', 'middle back': 'Mittlerer Rücken',
  neck: 'Nacken', quadriceps: 'Oberschenkel vorne', shoulders: 'Schultern', traps: 'Trapez', triceps: 'Trizeps'
};
const Body = {
  sex() { return Settings.get().sex || 'w'; },
  base(x, sex) {
    const w = sex === 'w';
    const torso = w ? 'M64 86 Q100 76 136 86 L140 120 Q130 150 127 170 Q138 198 143 230 L57 230 Q62 198 73 170 Q70 150 60 120Z'
      : 'M60 84 Q100 72 140 84 L144 120 Q138 168 136 204 L140 232 L60 232 L64 204 Q62 168 56 120Z';
    const legs = w ? '<path d="M58 224 L98 224 L96 392 L73 392 Q58 300 58 224Z"/><path d="M142 224 L102 224 L104 392 L127 392 Q142 300 142 224Z"/>'
      : '<path d="M62 226 L98 226 L96 392 L72 392 Q62 300 62 226Z"/><path d="M138 226 L102 226 L104 392 L128 392 Q138 300 138 226Z"/>';
    return `<g transform="translate(${x} 0)">
      ${w ? '<path class="hairb" d="M76 34 Q74 4 100 6 Q126 4 124 34 L130 94 Q118 100 110 84 L90 84 Q82 100 70 94Z"/>' : ''}
      <g class="base"><ellipse cx="100" cy="36" rx="${w ? 19 : 21}" ry="${w ? 24 : 26}"/>
      <rect x="${w ? 91 : 89}" y="56" width="${w ? 18 : 22}" height="22" rx="6"/>
      <path d="${torso}"/>
      <path d="M44 92 Q34 150 34 214 L48 214 Q52 150 62 104Z"/><path d="M156 92 Q166 150 166 214 L152 214 Q148 150 138 104Z"/>
      <circle cx="41" cy="222" r="9"/><circle cx="159" cy="222" r="9"/>${legs}
      <ellipse cx="84" cy="402" rx="15" ry="8"/><ellipse cx="116" cy="402" rx="15" ry="8"/></g>
      ${w ? '<path class="hairb" d="M80 26 Q84 10 100 10 Q118 10 121 28 Q110 18 100 20 Q88 18 80 26Z"/>' : ''}
    </g>`;
  },
  // Anatomische Muskeln (nur linke Hälfte, wird gespiegelt)
  front: {
    neck: ['M92 58 Q90 66 85 76 L90 78 Q94 68 96 59Z'],
    traps: ['M86 70 Q76 76 66 82 L84 81Z'],
    shoulders: ['M66 82 Q52 84 46 98 Q44 112 50 122 Q56 110 64 104 Q70 94 72 86Z'],
    chest: ['M72 86 Q86 82 99 86 L99 118 Q90 126 78 124 Q66 120 62 108 Q64 94 72 86Z'],
    biceps: ['M50 124 Q44 136 46 150 Q50 158 56 156 Q62 144 62 128 Q58 120 50 124Z'],
    forearms: ['M46 157 Q40 170 40 188 Q42 204 44 212 L50 212 Q54 196 56 178 Q58 164 56 157Z'],
    abdominals: ['M88 128 Q95 126 99 128 L99 142 L88 142 Q86 135 88 128Z', 'M87 145 L99 145 L99 159 L87 159Z', 'M87 162 L99 162 L99 177 L88 178Z', 'M89 181 L99 181 L99 202 Q93 199 90 192Z', 'M76 128 Q82 132 85 140 L85 188 Q78 184 74 172 Q72 150 76 128Z'],
    abductors: ['M65 200 Q72 204 74 218 L68 236 Q61 222 65 200Z'],
    adductors: ['M90 212 Q98 218 99 228 L96 270 Q88 254 86 236Z'],
    quadriceps: ['M80 216 Q88 222 90 240 Q90 270 86 296 L80 298 Q76 270 76 240Z', 'M70 228 Q76 222 78 236 Q78 270 80 298 Q72 300 68 286 Q64 260 70 228Z', 'M86 268 Q94 274 94 290 Q90 302 84 302 Q86 288 86 268Z'],
    calves: ['M74 318 Q80 312 84 322 Q86 350 82 380 L77 380 Q72 350 74 318Z', 'M86 324 Q92 330 92 350 Q88 368 86 372 Q84 350 86 324Z']
  },
  back: {
    neck: ['M94 56 L99 56 L99 66 L93 66Z'],
    traps: ['M100 62 Q92 66 86 72 Q72 78 64 84 Q80 90 90 100 Q96 110 100 126Z'],
    shoulders: ['M64 84 Q50 86 46 100 Q46 112 50 120 Q58 108 66 100 Q70 92 68 86Z'],
    'middle back': ['M70 94 Q82 96 89 104 Q90 116 84 122 Q74 118 68 108Z', 'M92 104 L99 112 L99 140 Q92 134 88 124Z'],
    lats: ['M68 112 Q80 124 88 128 L99 146 L99 168 Q88 176 80 180 Q70 160 66 132Z'],
    'lower back': ['M92 150 L99 152 L99 196 L89 196 Q88 172 92 150Z'],
    triceps: ['M50 120 Q44 134 46 150 Q52 158 58 154 Q62 140 62 126 Q56 118 50 120Z'],
    forearms: ['M46 157 Q40 170 40 188 Q42 204 44 212 L50 212 Q54 196 56 178 Q58 164 56 157Z'],
    abductors: ['M65 194 Q74 190 79 199 Q72 210 65 214Z'],
    glutes: ['M72 202 Q86 194 99 202 L99 240 Q86 250 72 242 Q64 224 72 202Z'],
    adductors: ['M92 244 L99 246 L99 268 Q94 262 92 244Z'],
    hamstrings: ['M70 248 Q80 244 86 250 Q86 280 82 306 L74 306 Q66 280 70 248Z', 'M88 250 Q95 252 95 262 Q94 290 90 306 L84 306 Q88 280 88 250Z'],
    calves: ['M72 318 Q80 308 86 316 Q86 340 80 360 Q72 350 70 336Z', 'M88 316 Q96 314 96 330 Q94 352 86 362 Q86 340 88 316Z', 'M76 360 Q84 366 90 360 Q88 378 84 384 L78 384 Q76 372 76 360Z']
  },
  womanFront: {
    chest: ['M72 92 Q86 86 99 92 L99 116 Q94 130 82 130 Q68 126 66 112 Q66 98 72 92Z'],
    abductors: ['M60 204 Q68 208 70 230 L64 246 Q56 228 60 204Z']
  },
  womanBack: {
    glutes: ['M68 202 Q86 192 99 202 L99 244 Q84 256 68 246 Q58 226 68 202Z'],
    abductors: ['M60 196 Q70 190 76 200 Q68 212 60 216Z']
  },
  // Muskelfasern / Konturen
  fibers: {
    front: 'M74 92 Q86 100 98 98 M70 102 Q84 110 98 108 M68 112 Q82 118 96 116 M54 96 Q58 104 62 112 M52 104 Q54 112 56 118 M80 230 Q84 260 82 292 M72 240 Q72 266 76 292 M48 134 Q52 142 54 152 M44 170 Q46 186 46 204 M78 326 Q80 350 79 374',
    back: 'M74 80 Q86 92 96 110 M80 128 Q88 150 94 166 M72 140 Q80 160 86 174 M76 212 Q86 222 96 226 M74 220 Q84 234 96 238 M76 258 Q78 282 78 302 M90 260 Q90 284 88 302 M54 98 Q58 106 62 112 M50 132 Q52 142 54 150 M78 324 Q80 340 78 356'
  },
  mirror(d) { return d.replace(/(-?\d+\.?\d*)[ ,](-?\d+\.?\d*)/g, (m, x, y) => `${(200 - x).toFixed(1).replace(/\.0$/, '')} ${y}`); },
  extra(x, sex) { // Kniescheiben, Bauchnabel, Schlüsselbein
    return `<g transform="translate(${x} 0)" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.2" pointer-events="none"><ellipse cx="84" cy="308" rx="6" ry="7"/><ellipse cx="116" cy="308" rx="6" ry="7"/><path d="M78 80 Q90 78 98 82 M122 80 Q110 78 102 82"/></g>`;
  },
  color(v) {
    if (!v) return 'var(--body)';
    const stops = [[150, 96, 102], [196, 38, 56], [240, 22, 44]];
    const t = Math.min(v, 1) * 2, i = Math.min(Math.floor(t), 1), f = t - i, a = stops[i], b = stops[i + 1];
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`;
  },
  svg(counts, sel, opts = {}) {
    const sex = opts.sex || this.sex(), w = sex === 'w';
    const max = opts.max || Math.max(1, ...Object.values(counts));
    const front = { ...this.front, ...(w ? this.womanFront : {}) }, back = { ...this.back, ...(w ? this.womanBack : {}) };
    const unit = opts.unit || 'Sätze';
    const both = list => list.map(d => d + ' ' + this.mirror(d)).join(' ');
    const part = (list, x) => Object.entries(list).map(([m, ds]) => { const d = both(ds); return `<path data-m="${m}" ${opts.mini ? '' : `data-a="bodySel" data-v="${m}"`} class="${sel === m ? 'sel' : ''}" transform="translate(${x} 0)" d="${d}" style="fill:${this.color((counts[m] || 0) / max)}"><title>${MUSCLE_DE[m]}${opts.mini ? '' : `: ${num(counts[m] || 0, 1)} ${unit}`}</title></path>`; }).join('');
    const sheen = (list, x) => `<path transform="translate(${x} 0)" d="${Object.values(list).map(both).join(' ')}" fill="url(#bsheen)"/>`;
    const fib = (d, x) => `<path transform="translate(${x} 0)" d="${d} ${this.mirror(d)}" fill="none" stroke="rgba(0,0,0,.3)" stroke-width=".9" stroke-linecap="round"/>`;
    return `<svg class="bodysvg ${opts.mini ? 'mini' : ''}" viewBox="0 0 420 ${opts.mini ? 412 : 420}" role="img" aria-label="Körperkarte">
      <defs><radialGradient id="bsheen" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient></defs>
      ${this.base(0, sex)}${this.base(220, sex)}${part(front, 0)}${part(back, 220)}
      <g pointer-events="none">${sheen(front, 0)}${sheen(back, 220)}${fib(this.fibers.front, 0)}${fib(this.fibers.back, 220)}</g>${this.extra(0, sex)}
      ${opts.mini ? '' : `<text x="100" y="418" text-anchor="middle" font-size="12" font-weight="700" fill="var(--mute)">Vorne</text>
      <text x="320" y="418" text-anchor="middle" font-size="12" font-weight="700" fill="var(--mute)">Hinten</text>`}</svg>`;
  },
  sexSwitch() {
    const s = this.sex();
    return `<div class="seg"><button data-a="bodySex" data-v="w" aria-pressed="${s === 'w'}">Frau</button><button data-a="bodySex" data-v="m" aria-pressed="${s === 'm'}">Mann</button></div>`;
  },
  // Muskeln, die eine Übung trainiert: Hauptmuskeln voll, Hilfsmuskeln halb
  forExercise(e) { const c = {}; if (!e) return c; e.sm.forEach(m => c[m] = .45); e.pm.forEach(m => c[m] = 1); return c; },
  forWorkout(w) {
    const c = {};
    w.ex.forEach(x => { const e = Train.byId[x.id], n = x.sets.length; if (!e) return; e.pm.forEach(m => c[m] = (c[m] || 0) + n); e.sm.forEach(m => c[m] = (c[m] || 0) + n * .5); });
    return c;
  }
};
Actions.bodySex = el => Settings.update(s => s.sex = el.dataset.v);
