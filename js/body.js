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
  front: {
    neck: 'M91 60 h18 v16 h-18z',
    traps: 'M89 72 Q74 76 64 84 L90 84Z M111 72 Q126 76 136 84 L110 84Z',
    shoulders: 'M44 96 a15 15 0 0 1 28 -12 L64 112 Q50 112 44 96Z M156 96 a15 15 0 0 0 -28 -12 L136 112 Q150 112 156 96Z',
    chest: 'M72 88 Q99 82 99 90 L99 124 Q84 132 70 120 Q66 104 72 88Z M128 88 Q101 82 101 90 L101 124 Q116 132 130 120 Q134 104 128 88Z',
    biceps: 'M42 112 Q48 104 60 110 Q60 140 52 154 Q42 150 40 132Z M158 112 Q152 104 140 110 Q140 140 148 154 Q158 150 160 132Z',
    forearms: 'M39 158 Q46 154 53 160 Q52 190 47 212 L37 212 Q35 186 39 158Z M161 158 Q154 154 147 160 Q148 190 153 212 L163 212 Q165 186 161 158Z',
    abdominals: 'M85 130 Q100 126 115 130 L114 196 Q100 204 86 196Z M72 130 Q80 134 82 150 L82 196 Q72 190 68 170 Q68 146 72 130Z M128 130 Q120 134 118 150 L118 196 Q128 190 132 170 Q132 146 128 130Z',
    abductors: 'M62 208 Q70 212 72 232 L66 246 Q60 230 62 208Z M138 208 Q130 212 128 232 L134 246 Q140 230 138 208Z',
    adductors: 'M90 214 Q98 220 98 232 L96 286 Q88 268 86 240Z M110 214 Q102 220 102 232 L104 286 Q112 268 114 240Z',
    quadriceps: 'M68 232 Q78 214 88 232 Q96 268 92 300 Q84 312 74 302 Q64 272 68 232Z M132 232 Q122 214 112 232 Q104 268 108 300 Q116 312 126 302 Q136 272 132 232Z',
    calves: 'M72 322 Q80 316 88 322 Q92 352 86 384 L76 384 Q68 352 72 322Z M128 322 Q120 316 112 322 Q108 352 114 384 L124 384 Q132 352 128 322Z'
  },
  back: {
    neck: 'M91 58 h18 v12 h-18z',
    traps: 'M100 64 L134 86 L112 102 L100 120 L88 102 L66 86Z',
    shoulders: 'M44 96 a15 15 0 0 1 24 -14 L64 112 Q50 112 44 96Z M156 96 a15 15 0 0 0 -24 -14 L136 112 Q150 112 156 96Z',
    'middle back': 'M88 106 L100 122 L112 106 L114 150 L100 156 L86 150Z',
    lats: 'M68 102 L84 106 L84 152 Q80 170 76 178 Q64 150 62 118Z M132 102 L116 106 L116 152 Q120 170 124 178 Q136 150 138 118Z',
    'lower back': 'M86 156 L100 160 L114 156 L116 192 Q100 198 84 192Z',
    triceps: 'M42 112 Q48 104 60 110 Q60 140 52 154 Q42 150 40 132Z M158 112 Q152 104 140 110 Q140 140 148 154 Q158 150 160 132Z',
    forearms: 'M39 158 Q46 154 53 160 Q52 190 47 212 L37 212 Q35 186 39 158Z M161 158 Q154 154 147 160 Q148 190 153 212 L163 212 Q165 186 161 158Z',
    abductors: 'M62 200 Q68 204 70 214 L64 224 Q60 214 62 200Z M138 200 Q132 204 130 214 L136 224 Q140 214 138 200Z',
    glutes: 'M70 204 Q84 196 99 204 L99 236 Q86 246 72 238 Q66 222 70 204Z M130 204 Q116 196 101 204 L101 236 Q114 246 128 238 Q134 222 130 204Z',
    hamstrings: 'M68 246 Q80 240 96 248 Q96 284 90 306 L74 306 Q64 278 68 246Z M132 246 Q120 240 104 248 Q104 284 110 306 L126 306 Q136 278 132 246Z',
    calves: 'M70 318 Q80 308 90 318 Q94 346 86 380 L76 380 Q66 346 70 318Z M130 318 Q120 308 110 318 Q106 346 114 380 L124 380 Q134 346 130 318Z'
  },
  // Abweichungen für den Frauenkörper (schmalere Taille, breitere Hüfte, runde Brust/Po)
  womanFront: {
    chest: 'M73 94 Q86 86 99 94 L99 116 Q92 130 80 128 Q68 122 70 106 Q70 98 73 94Z M127 94 Q114 86 101 94 L101 116 Q108 130 120 128 Q132 122 130 106 Q130 98 127 94Z',
    abdominals: 'M86 132 Q100 128 114 132 L113 194 Q100 202 87 194Z M76 134 Q82 138 83 152 L83 192 Q76 186 74 170 Q73 148 76 134Z M124 134 Q118 138 117 152 L117 192 Q124 186 126 170 Q127 148 124 134Z',
    abductors: 'M58 206 Q68 210 70 232 L64 248 Q56 230 58 206Z M142 206 Q132 210 130 232 L136 248 Q144 230 142 206Z'
  },
  womanBack: {
    glutes: 'M66 204 Q84 194 99 204 L99 240 Q84 254 68 244 Q60 224 66 204Z M134 204 Q116 194 101 204 L101 240 Q116 254 132 244 Q140 224 134 204Z',
    abductors: 'M58 198 Q64 204 66 216 L60 228 Q55 214 58 198Z M142 198 Q136 204 134 216 L140 228 Q145 214 142 198Z',
    lats: 'M68 102 L84 106 L84 150 Q80 164 78 170 Q66 146 64 118Z M132 102 L116 106 L116 150 Q120 164 122 170 Q134 146 136 118Z'
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
    const part = (list, x) => Object.entries(list).map(([m, d]) => `<path data-m="${m}" ${opts.mini ? '' : `data-a="bodySel" data-v="${m}"`} class="${sel === m ? 'sel' : ''}" transform="translate(${x} 0)" d="${d}" style="fill:${this.color((counts[m] || 0) / max)}"><title>${MUSCLE_DE[m]}${opts.mini ? '' : `: ${num(counts[m] || 0, 1)} ${unit}`}</title></path>`).join('');
    const sheen = (list, x) => Object.values(list).map(d => `<path transform="translate(${x} 0)" d="${d}" fill="url(#bsheen)"/>`).join('');
    return `<svg class="bodysvg ${opts.mini ? 'mini' : ''}" viewBox="0 0 420 ${opts.mini ? 412 : 420}" role="img" aria-label="Körperkarte">
      <defs><radialGradient id="bsheen" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>
      ${this.base(0, sex)}${this.base(220, sex)}${part(front, 0)}${part(back, 220)}
      <g pointer-events="none">${sheen(front, 0)}${sheen(back, 220)}</g>
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
