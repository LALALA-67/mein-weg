'use strict';
/* ===== Animierte Übungsfigur: Gliederpuppe im Studio-Look, trainierte Muskeln leuchten rot =====
   Winkel in Grad. Rumpf t: 0 = aufrecht, + = nach vorne (rechts) geneigt.
   Gliedmaßen: 0 = gerade nach unten, + = nach vorne (rechts) geschwenkt. */
const Rig = {
  L: { torso: 50, neck: 7, head: 9.5, ua: 27, fa: 25, th: 38, sh: 37, ft: 12 },
  W: { torso: 27, ua: 11, fa: 9, th: 16, sh: 12, ft: 6.5 },
  GROUND: 178,
  base: { t: 0, hd: 0, a1: 0, b1: 0, l1: 0, k1: 0, f: 90, sh: 0, air: 0 },
  P(o) { return { ...this.base, ...o }; },

  /* --- Bewegungsmuster --- */
  pattern(e) {
    const n = (e ? e.n : '').toLowerCase(), eq = e ? e.eq : '', pm = e ? e.pm : [], P = o => this.P(o);
    const has = r => r.test(n), seated = has(/seated|sitting|preacher|bench/) && !has(/bench press|step|jump/);
    const SEAT = { mode: 'fixed', x: 96, y: 128, seat: true };
    const sit = o => ({ l1: 90, k1: 0, ...o });
    const stand = (A, B, more) => ({ mode: 'stand', A: P(A), B: P(B), ...more });
    const fixed = (A, B, more) => ({ mode: 'fixed', A: P(A), B: P(B), ...more });
    const backBar = eq === 'barbell' || eq === 'e-z curl bar';
    // Dehnen
    if (e && e.c === 'stretching') {
      const m = pm[0];
      if (m === 'quadriceps') return stand({ l1: -8, k1: -165, a1: -35, b1: -70, l2: 0, k2: 0 }, { l1: -12, k1: -170, a1: -38, b1: -72, l2: 0, k2: 0 }, { period: 4 });
      if (['chest', 'shoulders', 'biceps'].includes(m)) return stand({ t: -3, a1: -35, b1: -35 }, { t: -6, a1: -60, b1: -62 }, { period: 4 });
      if (['lats', 'triceps'].includes(m)) return stand({ t: -3, a1: 170, b1: 195 }, { t: -10, a1: 178, b1: 205 }, { period: 4 });
      if (m === 'calves') return stand({ t: 18, l1: 30, k1: -8, l2: -30, k2: -30, a1: 75, b1: 80 }, { t: 24, l1: 38, k1: -4, l2: -32, k2: -32, a1: 80, b1: 85 }, { period: 4 });
      if (m === 'neck' || m === 'traps') return stand({ hd: 0 }, { hd: 28 }, { period: 4 });
      if (['glutes', 'adductors', 'abductors', 'lower back'].includes(m)) return fixed({ t: 20, l1: 90, k1: 90, a1: 70, b1: 80, x: 80, y: 168 }, { t: 48, l1: 90, k1: 90, a1: 95, b1: 95, x: 80, y: 168 }, { period: 4 });
      return stand({ t: 55, a1: 10, b1: 10 }, { t: 92, a1: 30, b1: 30 }, { period: 4 });
    }
    if (has(/calf|calves|heel raise|toe raise|donkey/)) return stand({ a1: 0, b1: 0 }, { f: 140, a1: 0, b1: 0 }, { period: 1.8 });
    if (has(/leg extension/)) return { ...SEAT, A: P({ t: -8, l1: 90, k1: 0, a1: 15, b1: 20 }), B: P({ t: -8, l1: 90, k1: 86, a1: 15, b1: 20 }) };
    if (has(/leg curl|hamstring curl/)) {
      if (seated) return { ...SEAT, A: P({ t: -5, l1: 90, k1: 80, a1: 15, b1: 20 }), B: P({ t: -5, l1: 90, k1: -10, a1: 15, b1: 20 }) };
      return fixed({ t: 90, x: 92, y: 126, l1: -90, k1: -90, a1: 0, b1: 0, hd: -10 }, { t: 90, x: 92, y: 126, l1: -90, k1: -175, a1: 0, b1: 0, hd: -10 }, { bench: [40, 132, 110] });
    }
    if (has(/hip thrust|glute bridge|bridge|hip lift|butt lift/)) return fixed({ t: -96, x: 104, y: 171, l1: 130, k1: 12, a1: 90, b1: 90 }, { t: -114, x: 104, y: 150, l1: 100, k1: 0, a1: 90, b1: 90 });
    if (has(/glute kickback|donkey kick|kickback/) && pm.includes('glutes')) return { mode: 'ankle', ax: 52, ay: 178, A: P({ t: 90, l1: -150, k1: -90, a1: 0, b1: 0 }), B: P({ t: 90, l1: -95, k1: -110, a1: 0, b1: 0 }), quad: true };
    if (has(/lunge|split squat|step.?up/)) return stand({ l1: 22, k1: -4, l2: -22, k2: -28, a1: 0, b1: 0 }, { l1: 84, k1: -6, l2: -8, k2: -84, a1: 0, b1: 0 });
    if (has(/squat|leg press|hack|wall sit|goblet|pistol/)) {
      const arms = backBar && !has(/front/) ? { a1: -40, b1: 165 } : has(/front|goblet/) ? { a1: 40, b1: 170 } : { a1: 88, b1: 90 };
      return stand({ ...arms }, { t: 38, l1: 96, k1: -40, ...arms });
    }
    if (has(/swing/)) return stand({ t: 70, l1: 25, k1: -12, a1: -28, b1: -28 }, { t: 0, a1: 92, b1: 92 }, { period: 1.6 });
    if (has(/clean|snatch|thruster|high pull/)) return stand({ t: 60, l1: 48, k1: -28, a1: 0, b1: 0 }, { a1: 178, b1: 180 });
    if (has(/deadlift|good morning|rdl|romanian|stiff.?leg|hyperextension|back extension|pull through|superman/)) return stand({ a1: 0, b1: 0 }, { t: 78, l1: 18, k1: -2, a1: 0, b1: 0 });
    if (has(/push-?up|pushup|plyo push/)) return { mode: 'ankle', ax: 22, ay: 176, A: P({ t: 68, l1: -68, k1: -68, a1: 6, b1: 6 }), B: P({ t: 76, l1: -76, k1: -76, a1: -60, b1: 40 }) };
    if (has(/plank|hollow|bird dog|dead bug|mountain climber/)) return { mode: 'ankle', ax: 24, ay: 176, A: P({ t: 72, l1: -72, k1: -72, a1: 0, b1: 90 }), B: P({ t: 74, l1: -74, k1: -74, a1: 0, b1: 90 }), period: 3 };
    if (has(/dip/)) return fixed({ t: 0, x: 100, y: 118, l1: 30, k1: -60, a1: 0, b1: 0 }, { t: 14, x: 100, y: 138, l1: 30, k1: -60, a1: -112, b1: 6 }, { bars: true });
    if (has(/fly|flye|pec deck|crossover|butterfly/)) return fixed({ t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 58, b1: 70 }, { t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 180, b1: 180 }, { bench: [36, 132, 96] });
    if (has(/bench press|chest press|floor press|press.*bench|incline.*press|decline.*press|close-grip.*press|board press|pin press/)) {
      const t = has(/incline/) ? -62 : has(/decline/) ? -112 : -90;
      return fixed({ t, x: 112, y: 126, l1: 70, k1: -10, a1: 38, b1: 176 }, { t, x: 112, y: 126, l1: 70, k1: -10, a1: 180, b1: 180 }, { bench: [36, 132, 96] });
    }
    if (has(/shoulder press|military|overhead press|arnold|push press|jerk|seated press|press behind|dumbbell press|kettlebell press|landmine press/)) {
      const A = { a1: 40, b1: 172 }, B = { a1: 178, b1: 180 };
      return seated ? { ...SEAT, A: P(sit(A)), B: P(sit(B)) } : stand(A, B);
    }
    if (has(/shrug/)) return stand({ a1: 0, b1: 0 }, { sh: 6, a1: 0, b1: 0 }, { period: 1.8 });
    if (has(/upright row/)) return stand({ a1: 0, b1: 0 }, { a1: -140, b1: 20 });
    if (has(/raise/) && !has(/leg raise|knee raise/)) { const A = { a1: 2, b1: 6 }, B = { a1: 90, b1: 96 }; return seated ? { ...SEAT, A: P(sit(A)), B: P(sit(B)) } : stand(A, B); }
    if (has(/pull-?up|pullup|chin-?up|chinup|muscle up/)) return fixed({ x: 100, y: 120, l1: 20, k1: -50, a1: 180, b1: 180 }, { x: 100, y: 100, l1: 20, k1: -50, a1: 130, b1: 229 }, { pullbar: 18 });
    if (has(/pulldown|pull-?down|pullover/)) return { ...SEAT, A: P(sit({ t: -10, a1: 176, b1: 178 })), B: P(sit({ t: -14, a1: -20, b1: 160 })), cable: 'up' };
    if (has(/row/)) {
      if (has(/seated|cable|machine/)) return fixed({ t: -4, x: 70, y: 142, l1: 84, k1: 72, a1: 86, b1: 88 }, { t: -10, x: 70, y: 142, l1: 84, k1: 72, a1: -42, b1: 80 }, { cable: [196, 146], seatLow: true });
      return stand({ t: 70, l1: 20, k1: -10, a1: 0, b1: 0 }, { t: 70, l1: 20, k1: -10, a1: -78, b1: -4 });
    }
    if (has(/curl/)) { const A = { a1: 0, b1: 2 }, B = { a1: -6, b1: 150 }; return seated ? { ...SEAT, A: P(sit(A)), B: P(sit(B)) } : stand(A, B, eq === 'cable' ? { cable: 'down' } : {}); }
    if (has(/kickback/)) return stand({ t: 70, l1: 20, k1: -10, a1: -80, b1: 0 }, { t: 70, l1: 20, k1: -10, a1: -80, b1: -80 });
    if (has(/skull|lying triceps|lying.*extension/)) return fixed({ t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 168, b1: 58 }, { t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 172, b1: 180 }, { bench: [36, 132, 96] });
    if (has(/pushdown|push-?down|press-?down|triceps extension|tricep/) && !has(/overhead/)) return stand({ a1: 0, b1: 112 }, { a1: 0, b1: 0 }, { cable: 'up' });
    if (has(/overhead.*extension|french press|overhead triceps/)) return stand({ a1: 175, b1: -12 }, { a1: 176, b1: 178 });
    if (has(/hanging|toes to bar|knee raise|leg raise/)) {
      if (has(/hanging|toes/)) return fixed({ x: 100, y: 122, a1: 180, b1: 180 }, { x: 100, y: 122, l1: 96, k1: 20, a1: 180, b1: 180 }, { pullbar: 20 });
      return fixed({ t: -90, x: 104, y: 170, l1: 90, k1: 90, a1: 90, b1: 90 }, { t: -90, x: 104, y: 170, l1: 178, k1: 178, a1: 90, b1: 90 });
    }
    if (has(/crunch|sit-?up|situp|jackknife|v-up|ab roller|rollout|russian twist|oblique|cross-body/)) {
      const top = has(/sit-?up|situp|v-up|russian/) ? -20 : -52;
      return fixed({ t: -90, x: 110, y: 168, l1: 150, k1: 30, a1: 140, b1: 120 }, { t: top, x: 110, y: 168, l1: 150, k1: 30, a1: 120, b1: 105 });
    }
    if (has(/twist|woodchop|wood chop|side bend|rotation/)) return stand({ t: 4, a1: 150, b1: 160 }, { t: 28, a1: 20, b1: 22 });
    if (has(/jump|hop|bound|skater|burpee|box|tuck|frog/)) return stand({ t: 30, l1: 70, k1: -40, a1: -40, b1: -30 }, { air: 18, a1: 160, b1: 165 }, { period: 1.4 });
    if (has(/run|jog|sprint|treadmill|walk|carry|farmer|yoke|sled|stair|climb|elliptical|march|skip/)) return stand({ l1: 30, k1: -18, l2: -26, k2: -48, a1: -30, b1: 40, a2: 30, b2: 70 }, { l1: -26, k1: -48, l2: 30, k2: -18, a1: 30, b1: 70, a2: -30, b2: 40 }, { period: 1.1 });
    if (has(/bike|bicycl|cycling|recumbent/)) return { ...SEAT, A: P(sit({ t: 30, l1: 70, k1: -20, l2: 110, k2: 20, a1: 70, b1: 80 })), B: P(sit({ t: 30, l1: 110, k1: 20, l2: 70, k2: -20, a1: 70, b1: 80 })), period: 1.2 };
    if (has(/rowing|ergometer/)) return fixed({ t: 25, x: 80, y: 150, l1: 140, k1: 30, a1: 88, b1: 90 }, { t: -20, x: 80, y: 150, l1: 92, k1: 88, a1: -30, b1: 80 }, { cable: [196, 150], seatLow: true });
    if (has(/press/)) return fixed({ t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 38, b1: 176 }, { t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 180, b1: 180 }, { bench: [36, 132, 96] });
    if (has(/adduct|abduct/)) return { ...SEAT, A: P(sit({ a1: 15, b1: 20 })), B: P(sit({ l1: 96, a1: 15, b1: 20 })) };
    // nach Hauptmuskel
    const m = pm[0];
    if (m === 'quadriceps') return stand({ a1: 88, b1: 90 }, { t: 38, l1: 96, k1: -40, a1: 88, b1: 90 });
    if (m === 'hamstrings' || m === 'lower back') return stand({}, { t: 78, l1: 18, k1: -2 });
    if (m === 'glutes') return fixed({ t: -96, x: 104, y: 171, l1: 130, k1: 12, a1: 90, b1: 90 }, { t: -114, x: 104, y: 150, l1: 100, k1: 0, a1: 90, b1: 90 });
    if (m === 'chest') return fixed({ t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 38, b1: 176 }, { t: -90, x: 112, y: 126, l1: 70, k1: -10, a1: 180, b1: 180 }, { bench: [36, 132, 96] });
    if (m === 'shoulders') return stand({ a1: 40, b1: 172 }, { a1: 178, b1: 180 });
    if (m === 'biceps' || m === 'forearms') return stand({}, { a1: -6, b1: 150 });
    if (m === 'triceps') return stand({ a1: 0, b1: 112 }, { a1: 0, b1: 0 });
    if (m === 'lats') return { ...SEAT, A: P(sit({ t: -10, a1: 176, b1: 178 })), B: P(sit({ t: -14, a1: -20, b1: 160 })), cable: 'up' };
    if (m === 'middle back') return stand({ t: 70, l1: 20, k1: -10 }, { t: 70, l1: 20, k1: -10, a1: -78, b1: -4 });
    if (m === 'traps') return stand({}, { sh: 6 });
    if (m === 'abdominals') return fixed({ t: -90, x: 110, y: 168, l1: 150, k1: 30, a1: 140, b1: 120 }, { t: -52, x: 110, y: 168, l1: 150, k1: 30, a1: 120, b1: 105 });
    if (m === 'calves') return stand({}, { f: 140 });
    if (m === 'neck') return stand({ hd: -12 }, { hd: 24 });
    return stand({ a1: 0 }, { t: 30, l1: 70, k1: -35, a1: 60, b1: 70 });
  },

  /* --- Geometrie --- */
  joints(p, pat) {
    const L = this.L, r = d => d * Math.PI / 180;
    const up = (o, a, len) => [o[0] + Math.sin(r(a)) * len, o[1] - Math.cos(r(a)) * len];
    const dn = (o, a, len) => [o[0] + Math.sin(r(a)) * len, o[1] + Math.cos(r(a)) * len];
    const hip = [0, 0], sh = up(hip, p.t, L.torso + p.sh), nk = up(sh, p.t + p.hd * .4, L.neck), hd = up(nk, p.t + p.hd, L.head);
    const leg = (a, b) => { const k = dn(hip, a, L.th), an = dn(k, b, L.sh), toe = dn(an, b + p.f, L.ft); return { k, an, toe }; };
    const arm = (a, b) => { const el = dn(sh, a, L.ua), wr = dn(el, b, L.fa); return { el, wr }; };
    const j = { hip, sh, nk, hd, L1: leg(p.l1, p.k1), L2: leg(p.l2 ?? p.l1 - 5, p.k2 ?? p.k1 - 3), A1: arm(p.a1, p.b1), A2: arm(p.a2 ?? p.a1 - 7, p.b2 ?? p.b1 - 5) };
    let dx, dy;
    if (pat.mode === 'fixed') { dx = p.x ?? pat.x ?? 100; dy = p.y ?? pat.y ?? 110; }
    else if (pat.mode === 'ankle') { dx = pat.ax - j.L1.an[0]; dy = pat.ay - j.L1.an[1]; }
    else {
      const low = Math.max(j.L1.an[1], j.L1.toe[1], j.L2.an[1], j.L2.toe[1]) + this.W.sh / 2;
      dy = this.GROUND - low - (p.air || 0); dx = pat._dx ?? 100;
    }
    const mv = q => [q[0] + dx, q[1] + dy], out = {};
    for (const k in j) { const v = j[k]; out[k] = Array.isArray(v) ? mv(v) : Object.fromEntries(Object.entries(v).map(([a, b]) => [a, mv(b)])); }
    return out;
  },
  lerp(A, B, f) { const o = {}; for (const k in A) { const a = A[k], b = B[k] ?? a; o[k] = typeof a === 'number' && typeof b === 'number' ? a + (b - a) * f : a; } for (const k in B) if (!(k in o)) o[k] = B[k]; return o; },
  ease(t) { // Halten – hin – halten – zurück
    const p = t % 1; let f;
    if (p < .08) f = 0; else if (p < .44) f = (p - .08) / .36; else if (p < .58) f = 1; else if (p < .94) f = 1 - (p - .58) / .36; else f = 0;
    return f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
  },

  /* --- Zeichnen --- */
  draw(j, pat, ex, f) {
    const W = this.W, hot = new Set(ex ? ex.pm : []), warm = new Set(ex ? ex.sm : []);
    const C = { near: 'url(#rgN)', far: '#6f767d', line: '#15191c', hot: '#ff2a3d', warm: '#ff8a8f' };
    const seg = (a, b, w, col) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${C.line}" stroke-width="${w + 2.4}" stroke-linecap="round"/><line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    const musc = (a, b, w, side, t0, t1, m, ant, op = 1) => {
      const lvl = hot.has(m) ? 'hot' : warm.has(m) ? 'warm' : null; if (!lvl) return '';
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      let nx = dy, ny = -dx; if (ant === 'torso') { nx = -dy; ny = dx; }
      const off = side * w * .24, q1 = [a[0] + (b[0] - a[0]) * t0 + nx * off, a[1] + (b[1] - a[1]) * t0 + ny * off], q2 = [a[0] + (b[0] - a[0]) * t1 + nx * off, a[1] + (b[1] - a[1]) * t1 + ny * off];
      return `<line class="mg ${lvl}" x1="${q1[0].toFixed(1)}" y1="${q1[1].toFixed(1)}" x2="${q2[0].toFixed(1)}" y2="${q2[1].toFixed(1)}" stroke="${C[lvl]}" stroke-width="${(w * (side ? .52 : .78)).toFixed(1)}" stroke-linecap="round" opacity="${op}"/>`;
    };
    const limbArm = (A, col, op) => seg(j.sh, A.el, W.ua, col) + seg(A.el, A.wr, W.fa, col)
      + musc(j.sh, A.el, W.ua, 1, .18, .82, 'biceps', 0, op) + musc(j.sh, A.el, W.ua, -1, .12, .85, 'triceps', 0, op) + musc(A.el, A.wr, W.fa, 0, .08, .62, 'forearms', 0, op)
      + `<circle cx="${A.wr[0].toFixed(1)}" cy="${A.wr[1].toFixed(1)}" r="4.2" fill="${col}" stroke="${C.line}" stroke-width="1.2"/>`;
    const limbLeg = (G, col, op) => seg(j.hip, G.k, W.th, col) + seg(G.k, G.an, W.sh, col) + seg(G.an, G.toe, W.ft, col)
      + musc(j.hip, G.k, W.th, 1, .12, .86, 'quadriceps', 0, op) + musc(j.hip, G.k, W.th, -1, .16, .86, 'hamstrings', 0, op)
      + musc(j.hip, G.k, W.th, 0, .2, .7, 'adductors', 0, op * .8) + musc(j.hip, G.k, W.th, 0, .04, .4, 'abductors', 0, op * .8)
      + musc(G.k, G.an, W.sh, -1, .1, .56, 'calves', 0, op);
    const torso = seg(j.hip, j.sh, W.torso, C.near) + `<circle cx="${j.hip[0].toFixed(1)}" cy="${j.hip[1].toFixed(1)}" r="12.5" fill="url(#rgN)" stroke="${C.line}" stroke-width="1.6"/>`
      + musc(j.hip, j.sh, W.torso, 1, .6, .92, 'chest', 'torso') + musc(j.hip, j.sh, W.torso, 1, .1, .56, 'abdominals', 'torso')
      + musc(j.hip, j.sh, W.torso, -1, .44, .86, 'lats', 'torso') + musc(j.hip, j.sh, W.torso, -1, .55, .86, 'middle back', 'torso')
      + musc(j.hip, j.sh, W.torso, -1, .06, .42, 'lower back', 'torso') + musc(j.hip, j.sh, W.torso, -1, .84, 1.02, 'traps', 'torso');
    const glute = hot.has('glutes') || warm.has('glutes') ? (() => { let dx = j.sh[0] - j.hip[0], dy = j.sh[1] - j.hip[1]; const l = Math.hypot(dx, dy); dx /= l; dy /= l; return `<circle cx="${(j.hip[0] + dy * 7 - dx * 2).toFixed(1)}" cy="${(j.hip[1] - dx * 7 - dy * 2).toFixed(1)}" r="8.5" fill="${hot.has('glutes') ? C.hot : C.warm}" class="mg"/>`; })() : '';
    const shoulder = `<circle cx="${j.sh[0].toFixed(1)}" cy="${j.sh[1].toFixed(1)}" r="8" fill="${hot.has('shoulders') ? C.hot : warm.has('shoulders') ? C.warm : 'url(#rgN)'}" stroke="${C.line}" stroke-width="1.2" ${hot.has('shoulders') || warm.has('shoulders') ? 'class="mg"' : ''}/>`;
    const neck = seg(j.sh, j.nk, 7, C.near) + musc(j.sh, j.nk, 7, 0, 0, 1, 'neck', 0) + musc(j.sh, j.nk, 7, 0, 0, .8, 'traps', 0);
    const head = `<circle cx="${j.hd[0].toFixed(1)}" cy="${j.hd[1].toFixed(1)}" r="${this.L.head + 1.2}" fill="${C.line}"/><circle cx="${j.hd[0].toFixed(1)}" cy="${j.hd[1].toFixed(1)}" r="${this.L.head}" fill="url(#rgN)"/>`;
    // Geräte
    let props = '', back = '';
    const eq = ex ? ex.eq : '';
    if (pat.bench) { const [x, y, w] = pat.bench; back += `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3" fill="#2b3036" stroke="#0d0f11"/><rect x="${x + 10}" y="${y + 7}" width="5" height="${this.GROUND - y - 7}" fill="#1d2125"/><rect x="${x + w - 15}" y="${y + 7}" width="5" height="${this.GROUND - y - 7}" fill="#1d2125"/>`; }
    if (pat.seat) back += `<rect x="72" y="${(pat.y || 128) + 10}" width="44" height="7" rx="3" fill="#2b3036" stroke="#0d0f11"/><rect x="91" y="${(pat.y || 128) + 17}" width="6" height="${this.GROUND - (pat.y || 128) - 17}" fill="#1d2125"/>`;
    if (pat.seatLow) back += `<rect x="50" y="${(pat.y || 142) + 9}" width="40" height="6" rx="3" fill="#2b3036"/><rect x="40" y="${this.GROUND - 6}" width="160" height="6" fill="#1d2125"/>`;
    if (pat.pullbar) back += `<line x1="40" y1="${pat.pullbar}" x2="160" y2="${pat.pullbar}" stroke="#555c63" stroke-width="4" stroke-linecap="round"/>`;
    if (pat.bars) back += `<line x1="70" y1="${j.A1.wr[1] + 2}" x2="150" y2="${j.A1.wr[1] + 2}" stroke="#555c63" stroke-width="4" stroke-linecap="round"/>`;
    const w1 = j.A1.wr, w2 = j.A2.wr;
    if (pat.cable) { const anc = pat.cable === 'up' ? [w1[0] + 6, 4] : pat.cable === 'down' ? [w1[0] + 30, this.GROUND - 4] : pat.cable; back += `<line x1="${anc[0]}" y1="${anc[1]}" x2="${w1[0].toFixed(1)}" y2="${w1[1].toFixed(1)}" stroke="#8a9198" stroke-width="1.4"/><circle cx="${anc[0]}" cy="${anc[1]}" r="3" fill="#555c63"/>`; }
    else if (eq === 'cable' || eq === 'bands' || eq === 'machine') { const anc = [Math.min(196, w1[0] + 44), j.sh[1]]; back += `<line x1="${anc[0]}" y1="${anc[1]}" x2="${w1[0].toFixed(1)}" y2="${w1[1].toFixed(1)}" stroke="${eq === 'bands' ? '#b8323f' : '#8a9198'}" stroke-width="1.6"/><rect x="${anc[0] - 2}" y="${anc[1] - 30}" width="5" height="60" fill="#2b3036"/>`; }
    if (eq === 'barbell' || eq === 'e-z curl bar') props += `<circle cx="${w1[0].toFixed(1)}" cy="${w1[1].toFixed(1)}" r="14" fill="#111417" stroke="#3a4046" stroke-width="2"/><circle cx="${w1[0].toFixed(1)}" cy="${w1[1].toFixed(1)}" r="3" fill="#8a9198"/>`;
    else if (eq === 'dumbbell') props += [w2, w1].map(w => `<circle cx="${w[0].toFixed(1)}" cy="${w[1].toFixed(1)}" r="6.5" fill="#15181b" stroke="#454c53" stroke-width="1.6"/>`).join('');
    else if (eq === 'kettlebells') props += `<circle cx="${w1[0].toFixed(1)}" cy="${(w1[1] + 8).toFixed(1)}" r="7.5" fill="#15181b" stroke="#454c53" stroke-width="1.6"/>`;
    else if (eq === 'medicine ball') props += `<circle cx="${((w1[0] + w2[0]) / 2).toFixed(1)}" cy="${((w1[1] + w2[1]) / 2).toFixed(1)}" r="9" fill="#5a2a2f" stroke="#15181b" stroke-width="1.6"/>`;
    return `${back}${limbArm(j.A2, C.far, .7)}${limbLeg(j.L2, C.far, .7)}${torso}${glute}${neck}${head}${limbLeg(j.L1, C.near, 1)}${shoulder}${limbArm(j.A1, C.near, 1)}${props}`;
  },
  frame(id, f) {
    const ex = Train.byId[id], pat = this.pat(id);
    return this.draw(this.joints(this.lerp(pat.A, pat.B, f), pat), pat, ex, f);
  },
  _pc: {},
  pat(id) {
    if (this._pc[id]) return this._pc[id];
    const pat = this.pattern(Train.byId[id]);
    if (pat.mode === 'stand') { // horizontal zentrieren anhand Pose A
      const j = this.joints(pat.A, { ...pat, _dx: 0 }), xs = [j.hip, j.sh, j.hd, j.L1.toe, j.L2.toe, j.A1.wr, j.A2.wr, j.L1.k, j.A1.el].map(p => p[0]);
      pat._dx = 100 - (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    return (this._pc[id] = pat);
  },
  svg(id, cls = '') {
    return `<svg class="rig ${cls}" viewBox="0 -26 200 216" data-rig="${esc(id)}" role="img" aria-label="Animation der Übung">
      <defs><linearGradient id="rgN" gradientUnits="userSpaceOnUse" x1="40" y1="10" x2="170" y2="190"><stop offset="0" stop-color="#f2f4f6"/><stop offset=".55" stop-color="#c4c9ce"/><stop offset="1" stop-color="#8c939a"/></linearGradient>
      <radialGradient id="rgF" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="100" cy="${this.GROUND + 2}" rx="78" ry="8" fill="url(#rgF)"/><g class="rg">${this.frame(id, 0)}</g></svg>`;
  },

  /* --- Animationsschleife: nur sichtbare Figuren, ~30 fps --- */
  vis: new Set(), io: null, last: 0,
  scan() {
    if (!this.io) this.io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? this.vis.add(e.target) : this.vis.delete(e.target)), { rootMargin: '40px' });
    document.querySelectorAll('svg.rig:not([data-io])').forEach(s => { s.dataset.io = 1; this.io.observe(s); });
    this.vis.forEach(s => { if (!s.isConnected) this.vis.delete(s); });
  },
  loop(t) {
    requestAnimationFrame(x => this.loop(x));
    if (t - this.last < 33 || document.hidden) return; this.last = t;
    this.vis.forEach(s => {
      if (!s.isConnected) { this.vis.delete(s); return; }
      if (s.closest('.paused')) return;
      const id = s.dataset.rig, pat = this.pat(id), per = (pat.period || 2.6) * 1000;
      const g = s.querySelector('.rg'); if (g) g.innerHTML = this.frame(id, this.ease(t / per));
    });
  },
  start() {
    new MutationObserver(() => { cancelAnimationFrame(this._s); this._s = requestAnimationFrame(() => this.scan()); }).observe(document.body, { childList: true, subtree: true });
    this.scan(); requestAnimationFrame(t => this.loop(t));
  }
};
