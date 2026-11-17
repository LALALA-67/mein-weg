'use strict';
/* ===== Helfer ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const today = () => iso(new Date());
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const num = (x, d = 0) => (+x || 0).toLocaleString('de-DE', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MO = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const fmtDate = s => { const d = parse(s); return `${WDL[d.getDay()]}, ${d.getDate()}. ${MO[d.getMonth()]}`; };
const relDay = s => { const n = Math.round((parse(s) - parse(today())) / 864e5); return n === 0 ? 'Heute' : n === -1 ? 'Gestern' : n === 1 ? 'Morgen' : null; };
const monthName = k => { const [y, m] = k.split('-').map(Number); return `${MO[m - 1]} ${y}`; };
const addMonth = (k, n) => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const fmtDur = s => { s = Math.round(s); const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)} Std ${m % 60} Min` : m ? `${m} Min` : `${s} Sek`; };

const ICONS = {
  heute: '<path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/><circle cx="12" cy="12" r="4"/>',
  essen: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.2 1.2-3.5 4-3.5 7.5H17"/>',
  training: '<path d="M2.5 10v4M5.5 7v10M18.5 7v10M21.5 10v4M5.5 12h13"/>',
  gesicht: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.9 2 5.1 2 7 0M9 9.5h.01M15 9.5h.01"/>',
  kalender: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  set: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  scan: '<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M7 8v8M10 8v8M13 8v8M16.5 8v8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
  pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  body: '<circle cx="12" cy="4.5" r="2"/><path d="M6 8.5h12M12 8.5v6M12 14.5l-3 6.5M12 14.5l3 6.5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.5L4 8M4 13a8 8 0 0 0 14.3 4.5L20 16"/><path d="M4 4v4h4M20 20v-4h-4"/>'
};
const ic = (k, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ''}</svg>`;
const LOGO = '<svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#f7b6d2"/><path d="M20 30s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12z" fill="#d6518e"/></svg>';

/* ===== Lokaler Speicher (jede Seite = ein "Dokument" mit Zeitstempel) ===== */
const Store = {
  P: 'mw:',
  raw(k) { try { return JSON.parse(localStorage.getItem(this.P + k)); } catch (e) { return null; } },
  get(k, def) { const r = this.raw(k); return r && r.d !== undefined ? r.d : def; },
  set(k, d) {
    const r = { d, t: Date.now() };
    try { localStorage.setItem(this.P + k, JSON.stringify(r)); }
    catch (e) { App.toast('Speicher auf diesem Gerät ist voll.'); return; }
    Sync.mark(k);
  },
  put(k, d, t) { try { localStorage.setItem(this.P + k, JSON.stringify({ d, t })); } catch (e) {} },
  keys() { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(this.P)) out.push(k.slice(this.P.length)); } return out; }
};

/* ===== Sync über Supabase ===== */
const Sync = {
  client: null, user: null, state: 'off', msg: '', busy: false, timer: null,
  dirty: new Set(JSON.parse(localStorage.getItem('mw-dirty') || '[]')),
  cfg() {
    const c = window.MW_CONFIG || {};
    return { url: localStorage.getItem('mw-cfg-url') || c.supabaseUrl || '', key: localStorage.getItem('mw-cfg-key') || c.supabaseKey || '' };
  },
  saveDirty() { try { localStorage.setItem('mw-dirty', JSON.stringify([...this.dirty])); } catch (e) {} },
  mark(k) { this.dirty.add(k); this.saveDirty(); clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 800); },
  async init() {
    const c = this.cfg();
    if (!c.url || !c.key || !window.supabase) { this.state = 'off'; App.renderStatus(); return; }
    try {
      this.client = window.supabase.createClient(c.url, c.key, { auth: { persistSession: true, autoRefreshToken: true } });
      const { data } = await this.client.auth.getSession();
      this.user = data.session ? data.session.user : null;
      this.client.auth.onAuthStateChange((_e, s) => {
        const was = this.user && this.user.id; this.user = s ? s.user : null;
        if (this.user && this.user.id !== was) this.pull(true);
        if (!this.user) { this.state = 'login'; App.render(); }
      });
      if (this.user) await this.pull(true); else { this.state = 'login'; App.renderStatus(); }
    } catch (e) { this.state = 'err'; this.msg = e.message; App.renderStatus(); }
  },
  async pull(full) {
    if (!this.user || !this.client) return;
    this.state = 'busy'; App.renderStatus();
    try {
      const key = 'mw-pulled-' + this.user.id;
      const prev = localStorage.getItem(key);
      full = !prev;
      const since = full ? '1970-01-01T00:00:00Z' : new Date(Date.parse(prev) - 36e5).toISOString(); // 1 Std. Überlappung
      let from = 0, max = since, changed = false;
      const seen = new Set();
      for (;;) {
        const { data, error } = await this.client.from('kv').select('key,data,updated_at').gt('updated_at', since).order('updated_at').range(from, from + 999);
        if (error) throw error;
        for (const row of data) {
          seen.add(row.key);
          const t = Date.parse(row.updated_at), loc = Store.raw(row.key);
          if (!loc || t > loc.t) { Store.put(row.key, row.data, t); this.dirty.delete(row.key); changed = true; }
          else if (loc.t > t) this.dirty.add(row.key);
          if (row.updated_at > max) max = row.updated_at;
        }
        if (data.length < 1000) break; from += 1000;
      }
      if (full) Store.keys().forEach(k => { const r = Store.raw(k); if (r && r.t && !seen.has(k)) this.dirty.add(k); });
      localStorage.setItem(key, max); this.saveDirty();
      this.state = 'ok';
      await this.flush(full);
      if (changed) App.render(); else App.renderStatus();
    } catch (e) { this.state = 'err'; this.msg = e.message || String(e); App.renderStatus(); }
  },
  async flush(force) {
    if (!this.user || !this.client || this.busy || !this.dirty.size) return;
    this.busy = true;
    try {
      while (this.dirty.size) {
        const keys = [...this.dirty].slice(0, 200);
        const rows = keys.map(k => { const r = Store.raw(k); return r ? { user_id: this.user.id, key: k, data: r.d, updated_at: new Date(r.t).toISOString(), _t: r.t } : null; }).filter(Boolean);
        if (!force) { /* nur Neueres hochladen – Server entscheidet per Zeitstempel nicht, daher vorher prüfen */ }
        const { error } = await this.client.from('kv').upsert(rows.map(({ _t, ...r }) => r), { onConflict: 'user_id,key' });
        if (error) throw error;
        keys.forEach(k => { const r = Store.raw(k), sent = rows.find(x => x.key === k); if (!r || !sent || r.t === sent._t) this.dirty.delete(k); });
        this.saveDirty();
      }
      this.state = 'ok';
    } catch (e) { this.state = 'err'; this.msg = e.message || String(e); }
    this.busy = false; App.renderStatus();
  },
  async signIn(email, pw, create) {
    if (!this.client) await this.init();
    if (!this.client) throw new Error('Supabase ist noch nicht eingerichtet.');
    const fn = create ? this.client.auth.signUp({ email, password: pw }) : this.client.auth.signInWithPassword({ email, password: pw });
    const { data, error } = await fn;
    if (error) throw error;
    if (create && !data.session) return 'confirm';
    return 'ok';
  },
  async signOut() { if (this.client) await this.client.auth.signOut(); this.user = null; this.state = 'login'; },
  label() {
    return ({ off: ['', 'Nur auf diesem Gerät gespeichert'], login: ['', 'Sync bereit – bitte anmelden'], busy: ['', 'Synchronisiere …'], ok: ['ok', 'Synchronisiert'], err: ['err', 'Sync-Fehler – tippe für Details'] })[this.state];
  }
};

/* ===== Einstellungen ===== */
const DEFAULTS = { goals: { kcal: 2000, p: 150, c: 200, f: 50 }, water: 8, theme: 'auto', routine: ['Gesichtspflege morgens', 'Lernen', 'Zimmer aufräumen'] };
const Settings = {
  get() { const s = Store.get('settings', {}); return { ...DEFAULTS, ...s, goals: { ...DEFAULTS.goals, ...(s.goals || {}) } }; },
  update(fn) { const s = clone(this.get()); fn(s); Store.set('settings', s); App.applyTheme(); App.render(); }
};

/* ===== App-Kern ===== */
const Views = {}, Actions = {}, Forms = {}, Changes = {};
const TABS = [['heute', 'Heute'], ['essen', 'Essen'], ['training', 'Training'], ['gesicht', 'Gesicht'], ['kalender', 'Kalender']];
const App = {
  tab: 'heute', date: today(), modalRender: null,
  start() {
    const h = location.hash.slice(1);
    if (Views[h]) this.tab = h;
    this.applyTheme(); this.render(); Sync.init();
    addEventListener('hashchange', () => { const t = location.hash.slice(1); if (Views[t] && t !== this.tab) { this.tab = t; this.render(); } });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (this.date !== today() && this._lastToday !== today()) { this._lastToday = today(); } Sync.pull(false); } });
    setInterval(() => { if (!document.hidden) Sync.pull(false); }, 90000);
  },
  go(tab) { this.tab = tab; history.replaceState(null, '', '#' + tab); this.render(); scrollTo(0, 0); },
  applyTheme() { const t = Settings.get().theme; if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; },
  render() {
    const a = document.activeElement;
    const keep = a && a.id && $('#main').contains(a) ? { id: a.id, v: a.value, s: a.selectionStart } : null;
    $('#nav').innerHTML = `<div class="brand">${LOGO}<span>Mein Weg</span></div>` +
      TABS.map(([k, l]) => `<button data-a="go" data-v="${k}" ${k === this.tab ? 'aria-current="page"' : ''}><span class="ni">${ic(k)}</span><span>${l}</span></button>`).join('') +
      `<div class="navset"><button data-a="go" data-v="einstellungen" ${this.tab === 'einstellungen' ? 'aria-current="page"' : ''}><span class="ni">${ic('set')}</span><span>Einstellungen</span></button><p class="status" id="syncst" style="padding:8px"></p></div>`;
    const v = Views[this.tab] || Views.heute;
    const sc = $('.wk-scroll') ? $('.wk-scroll').scrollTop : null;
    $('#main').innerHTML = v.render();
    if (v.mount) v.mount(sc);
    if (keep) { const el = document.getElementById(keep.id); if (el && 'value' in el) { el.value = keep.v; el.focus(); try { el.setSelectionRange(keep.s, keep.s); } catch (e) {} } }
    if (this.modalRender && !$('#modal').hidden && !(this.modalOpts.sticky && this.modalOpts.sticky())) this.refreshModal();
    this.renderStatus();
  },
  renderStatus() {
    const [c, l] = Sync.label();
    $$('.syncst, #syncst').forEach(el => el.innerHTML = `<span class="dot ${c}"></span><span>${l}</span>`);
  },
  modal(fn, opts = {}) {
    this.modalRender = fn; this.modalOpts = opts;
    $('#modal').hidden = false; document.body.style.overflow = 'hidden';
    this.refreshModal(true);
  },
  refreshModal(first) {
    const sh = $('#modal .sheet'), a = document.activeElement;
    const keep = !first && a && a.id && sh.contains(a) ? { id: a.id, v: a.value, s: a.selectionStart } : null;
    const st = sh.scrollTop;
    sh.innerHTML = this.modalRender();
    if (!first) sh.scrollTop = st;
    if (keep) { const el = document.getElementById(keep.id); if (el && 'value' in el) { el.value = keep.v; el.focus(); try { el.setSelectionRange(keep.s, keep.s); } catch (e) {} } }
    if (this.modalOpts.mount) this.modalOpts.mount(first);
    if (first) { const f = sh.querySelector('[autofocus]'); if (f && matchMedia('(min-width:700px)').matches) f.focus(); }
  },
  closeModal() {
    if (this.modalOpts && this.modalOpts.onClose) this.modalOpts.onClose();
    this.modalRender = null; this.modalOpts = {};
    $('#modal').hidden = true; $('#modal .sheet').innerHTML = ''; document.body.style.overflow = '';
  },
  sheetHead(title) { return `<div class="sheet-h"><h2>${title}</h2><button class="icon ghost" data-a="closeModal" aria-label="Schließen">${ic('x')}</button></div>`; },
  toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(this._tt); this._tt = setTimeout(() => t.hidden = true, 3200); },
  confirm(text, yes, label = 'Löschen') {
    this.modal(() => `${this.sheetHead('Sicher?')}<p style="margin-bottom:16px">${esc(text)}</p><div class="row"><button class="grow" data-a="closeModal">Abbrechen</button><button class="grow pri" data-a="confirmYes">${label}</button></div>`);
    this._yes = yes;
  },
  dateNav() {
    const r = relDay(this.date);
    return `<div class="row"><button class="icon" data-a="day" data-v="-1" aria-label="Vorheriger Tag">${ic('left')}</button><button data-a="day" data-v="0" style="min-width:96px">${r || parse(this.date).getDate() + '. ' + MO[parse(this.date).getMonth()].slice(0, 3)}</button><button class="icon" data-a="day" data-v="1" aria-label="Nächster Tag">${ic('right')}</button></div>`;
  }
};

/* ===== Tagesdaten ===== */
const Day = {
  key: d => 'day:' + d,
  get(d = App.date) { const x = Store.get(this.key(d), {}); return { water: 0, meals: { fruehstueck: [], mittag: [], abend: [], snacks: [] }, todos: [], routine: {}, ...x, meals: { fruehstueck: [], mittag: [], abend: [], snacks: [], ...(x.meals || {}) } }; },
  update(fn, d = App.date) { const x = clone(this.get(d)); fn(x); Store.set(this.key(d), x); App.render(); }
};

/* ===== Globale Ereignisse ===== */
Actions.go = el => App.go(el.dataset.v);
Actions.closeModal = () => App.closeModal();
Actions.confirmYes = () => { const f = App._yes; App.closeModal(); if (f) f(); };
Actions.day = el => { const v = +el.dataset.v; App.date = v === 0 ? today() : addDays(App.date, v); App.render(); };
Actions.syncInfo = () => App.go('einstellungen');

document.addEventListener('click', e => {
  if (e.target.id === 'modal') { App.closeModal(); return; }
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const f = Actions[el.dataset.a];
  if (f) { e.preventDefault(); f(el, e); }
});
document.addEventListener('submit', e => {
  const f = e.target, fn = Forms[f.dataset.f];
  if (!fn) return;
  e.preventDefault();
  const v = {}; new FormData(f).forEach((val, k) => v[k] = typeof val === 'string' ? val.trim() : val);
  fn(v, f);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (el && Changes[el.dataset.c]) Changes[el.dataset.c](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && Changes[el.dataset.i]) Changes[el.dataset.i](el, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) App.closeModal(); });
