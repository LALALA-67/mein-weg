'use strict';
/* ===== Atmosphäre: Regen + Blitze ===== */
const FX = {
  c: null, ctx: null, drops: [], on: true, w: 0, h: 0, raf: 0,
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
    const n = Math.min(240, Math.round(this.w * this.h / 7000));
    this.drops = Array.from({ length: n }, () => this.drop(true));
  },
  drop(any) { const z = Math.random(); return { x: Math.random() * (this.w + 200) - 50, y: any ? Math.random() * this.h : -30 - Math.random() * 200, l: 8 + z * 22, v: 7 + z * 13, a: .08 + z * .32, z }; },
  start() { if (this.on && !this.raf) this.raf = requestAnimationFrame(t => this.loop(t)); },
  loop() {
    this.raf = 0;
    if (!this.on || document.hidden) return;
    const g = this.ctx, light = getComputedStyle(document.documentElement).colorScheme === 'light';
    g.clearRect(0, 0, this.w, this.h);
    g.lineCap = 'round';
    const col = light ? '60,70,80' : '190,205,220';
    for (const d of this.drops) {
      g.strokeStyle = `rgba(${col},${d.a})`; g.lineWidth = .6 + d.z * .9;
      g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * .22, d.y + d.l); g.stroke();
      d.y += d.v; d.x -= d.v * .22;
      if (d.y > this.h) {
        if (d.z > .6) { g.strokeStyle = `rgba(${col},${d.a * .8})`; g.beginPath(); g.ellipse(d.x, this.h - 4, 3 + d.z * 4, 1 + d.z, 0, 0, Math.PI * 2); g.stroke(); }
        Object.assign(d, this.drop(false));
      }
    }
    this.raf = requestAnimationFrame(t => this.loop(t));
  },
  thunder() {
    const next = () => setTimeout(() => {
      const sc = document.querySelector('.scene');
      if (this.on && sc && !document.hidden) { sc.classList.remove('lightning'); void sc.offsetWidth; sc.classList.add('lightning'); }
      next();
    }, 25000 + Math.random() * 45000);
    next();
  }
};
