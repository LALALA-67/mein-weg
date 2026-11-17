'use strict';
/* ===== Atmosphäre: Regen mit Tiefe, Tropfen auf der Scheibe, Blitze ===== */
const FX = {
  c: null, ctx: null, drops: [], glass: [], bolt: null, on: true, w: 0, h: 0, raf: 0, t0: 0,
  init() {
    this.c = document.getElementById('rain'); if (!this.c) return;
    this.ctx = this.c.getContext('2d');
    addEventListener('resize', () => this.size());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.start(); });
    this.size(); this.apply(); this.thunder();
  },
  apply() {
    const s = Settings.get().rain;
    this.on = s === undefined ? !matchMedia('(prefers-reduced-motion: reduce)').matches : !!s;
    if (this.on) this.start(); else { cancelAnimationFrame(this.raf); this.raf = 0; this.ctx && this.ctx.clearRect(0, 0, this.w, this.h); }
  },
  size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    this.w = innerWidth; this.h = innerHeight;
    this.c.width = this.w * d; this.c.height = this.h * d; this.ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.min(300, Math.round(this.w * this.h / 5500));
    this.drops = Array.from({ length: n }, () => this.drop(true));
    const g = this.w < 700 ? 9 : 18;
    this.glass = Array.from({ length: g }, () => this.bead(true));
  },
  // z: 0 = weit weg (dünn, langsam, blass), 1 = nah (lang, schnell, hell)
  drop(any) { const z = Math.pow(Math.random(), 1.6); return { x: Math.random() * (this.w + 300) - 60, y: any ? Math.random() * this.h : -40 - Math.random() * 300, l: 6 + z * 30, v: 6 + z * 18, a: .06 + z * .34, z }; },
  bead(any) { const r = 1.5 + Math.random() * 3.5; return { x: Math.random() * this.w, y: any ? Math.random() * this.h : -10, r, vy: 0, trail: [], hold: Math.random() * 300 }; },
  start() { if (this.on && !this.raf) this.raf = requestAnimationFrame(() => this.loop()); },
  loop() {
    this.raf = 0;
    if (!this.on || document.hidden) return;
    const g = this.ctx, light = getComputedStyle(document.documentElement).colorScheme === 'light';
    const col = light ? '55,65,75' : '200,212,226';
    g.clearRect(0, 0, this.w, this.h);
    g.lineCap = 'round';
    // Regen
    for (const d of this.drops) {
      g.strokeStyle = `rgba(${col},${d.a})`; g.lineWidth = .5 + d.z * 1.1;
      g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * .2, d.y + d.l); g.stroke();
      d.y += d.v; d.x -= d.v * .2;
      if (d.y > this.h - (1 - d.z) * this.h * .25) {
        if (d.z > .45) { g.strokeStyle = `rgba(${col},${d.a * .7})`; g.lineWidth = .8; g.beginPath(); g.ellipse(d.x, d.y, 2 + d.z * 6, .8 + d.z * 1.6, 0, Math.PI, Math.PI * 2); g.stroke(); }
        Object.assign(d, this.drop(false));
      }
    }
    // Tropfen auf der Scheibe
    for (const b of this.glass) {
      if (b.hold > 0) { b.hold--; if (Math.random() < .004) b.r += .3; }
      else { b.vy = Math.min(b.vy + .02 * b.r, 2.6); b.y += b.vy; b.x += Math.sin(b.y * .05) * .15; b.trail.push([b.x, b.y]); if (b.trail.length > 60) b.trail.shift(); if (Math.random() < .02) b.hold = 20 + Math.random() * 80, b.vy = 0; }
      if (b.r < 3 && b.hold <= 0 && Math.random() < .5) b.hold = 1;
      if (b.trail.length > 1) { g.strokeStyle = light ? 'rgba(255,255,255,.35)' : 'rgba(190,205,220,.12)'; g.lineWidth = b.r * .7; g.beginPath(); b.trail.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
      const gr = g.createRadialGradient(b.x - b.r * .35, b.y - b.r * .4, b.r * .1, b.x, b.y, b.r);
      gr.addColorStop(0, light ? 'rgba(255,255,255,.95)' : 'rgba(235,242,250,.75)'); gr.addColorStop(.6, light ? 'rgba(200,210,215,.35)' : 'rgba(120,135,150,.25)'); gr.addColorStop(1, 'rgba(0,0,0,.35)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(b.x, b.y, b.r, b.r * 1.15, 0, 0, Math.PI * 2); g.fill();
      if (b.y > this.h + 10) Object.assign(b, this.bead(false));
    }
    // Blitz
    if (this.bolt) {
      const bl = this.bolt; bl.ttl--;
      if (bl.ttl > 0) {
        g.save(); g.shadowColor = 'rgba(200,215,255,.9)'; g.shadowBlur = 18; g.strokeStyle = `rgba(235,240,255,${Math.min(1, bl.ttl / 6)})`; g.lineWidth = 2;
        g.beginPath(); bl.pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
        g.lineWidth = 1; bl.forks.forEach(f => { g.beginPath(); f.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); });
        g.restore();
      } else this.bolt = null;
    }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  makeBolt() {
    let x = this.w * (.15 + Math.random() * .7), y = 0; const pts = [[x, y]], forks = [], end = this.h * (.45 + Math.random() * .15);
    while (y < end) { x += (Math.random() - .5) * 38; y += 10 + Math.random() * 22; pts.push([x, y]);
      if (Math.random() < .18) { let fx = x, fy = y; const f = [[fx, fy]]; for (let i = 0; i < 5; i++) { fx += (Math.random() - .3) * 30; fy += 10 + Math.random() * 16; f.push([fx, fy]); } forks.push(f); } }
    this.bolt = { pts, forks, ttl: 14 };
  },
  thunder() {
    const next = () => setTimeout(() => {
      const sc = document.querySelector('.scene');
      if (this.on && sc && !document.hidden) { sc.classList.remove('lightning'); void sc.offsetWidth; sc.classList.add('lightning'); if (Math.random() < .7) this.makeBolt(); }
      next();
    }, 22000 + Math.random() * 40000);
    next();
  }
};
