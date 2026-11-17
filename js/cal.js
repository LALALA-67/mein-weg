'use strict';
/* ===== Kalender im Stil von Google Kalender: Tag / Woche / Monat ===== */
const CATS = [['termin', 'Termin', '#3e5f86'], ['test', 'Test / Prüfung', '#a3243a'], ['wichtig', 'Wichtig', '#7a2d6e'], ['schule', 'Schule / Arbeit', '#8a6a1c'], ['sport', 'Sport', '#2f6b5a'], ['privat', 'Privat', '#54458a']];
const HOUR = 48;
const toMin = t => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const toTime = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const Cal = {
  view: innerWidth < 700 ? 'day' : 'week', at: today(), ed: null, scrolled: null,
  events() { return Store.get('events', { list: [] }).list || []; },
  save(l) { Store.set('events', { list: l }); App.render(); },
  color(e) { return (CATS.find(c => c[0] === e.cat) || CATS[0])[2]; },
  catName(e) { return (CATS.find(c => c[0] === e.cat) || CATS[0])[1]; },
  on(d) { return this.events().filter(e => e.date === d).sort((a, b) => (b.allDay ? 1 : 0) - (a.allDay ? 1 : 0) || toMin(a.start) - toMin(b.start)); },
  timeLabel(e) { return e.allDay ? 'Ganztägig' : `${e.start} – ${e.end}`; },
  weekStart(d) { const x = parse(d); return addDays(d, -((x.getDay() + 6) % 7)); },
  days() { if (this.view === 'day') return [this.at]; const s = this.weekStart(this.at); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); },
  title() {
    const d = parse(this.at);
    if (this.view === 'month') return `${MO[d.getMonth()]} ${d.getFullYear()}`;
    if (this.view === 'day') return `${WDL[d.getDay()]}, ${d.getDate()}. ${MO[d.getMonth()]}`;
    const ds = this.days(), a = parse(ds[0]), b = parse(ds[6]);
    return a.getMonth() === b.getMonth() ? `${a.getDate()}.–${b.getDate()}. ${MO[a.getMonth()]} ${a.getFullYear()}` : `${a.getDate()}. ${MO[a.getMonth()].slice(0, 3)} – ${b.getDate()}. ${MO[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
  }
};
function layoutDay(list) {
  const out = []; let cl = [], lanes = [], end = 0;
  const flush = () => { cl.forEach(o => o.n = lanes.length); out.push(...cl); cl = []; lanes = []; end = 0; };
  list.map(e => ({ e, s: toMin(e.start), f: Math.max(toMin(e.end), toMin(e.start) + 25) })).sort((a, b) => a.s - b.s || b.f - a.f).forEach(o => {
    if (cl.length && o.s >= end) flush();
    let l = lanes.findIndex(x => x <= o.s); if (l < 0) { l = lanes.length; lanes.push(o.f); } else lanes[l] = o.f;
    o.lane = l; cl.push(o); end = Math.max(end, o.f);
  });
  flush(); return out;
}
Views.kalender = {
  render() {
    const v = Cal.view;
    const head = `<div class="calbar"><button data-a="calToday">Heute</button><button class="icon" data-a="calNav" data-v="-1" aria-label="Zurück">${ic('left')}</button><button class="icon" data-a="calNav" data-v="1" aria-label="Weiter">${ic('right')}</button><h1>${Cal.title()}</h1>
      <div class="seg">${[['day', 'Tag'], ['week', 'Woche'], ['month', 'Monat']].map(([k, l]) => `<button data-a="calView" data-v="${k}" aria-pressed="${v === k}">${l}</button>`).join('')}</div>
      <button class="pri" data-a="calNew">${ic('plus')} Termin</button></div>`;
    return head + (v === 'month' ? monthGrid() : timeGrid()) + agenda();
  },
  mount(sc) {
    const s = $('.wk-scroll'); if (!s) return;
    const key = Cal.view + Cal.at;
    if (sc != null && Cal.scrolled === key) { s.scrollTop = sc; return; }
    Cal.scrolled = key;
    const now = new Date(), showNow = Cal.days().includes(today());
    s.scrollTop = Math.max(0, ((showNow ? now.getHours() - 1.5 : 7) * HOUR));
  }
};
function timeGrid() {
  const ds = Cal.days(), cols = `52px repeat(${ds.length},minmax(0,1fr))`, t = today(), now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
  const hasAll = ds.some(d => Cal.on(d).some(e => e.allDay));
  return `<div class="calwrap">
    <div class="wk-head" style="grid-template-columns:${cols}"><div></div>${ds.map(d => { const x = parse(d); return `<div class="d ${d === t ? 'today' : ''}" data-a="calDay" data-v="${d}"><span>${WD[x.getDay()]}</span><b>${x.getDate()}</b></div>`; }).join('')}</div>
    ${hasAll ? `<div class="allday" style="grid-template-columns:${cols}"><div class="gut">ganzt.</div>${ds.map(d => `<div class="c">${Cal.on(d).filter(e => e.allDay).map(e => `<button class="chipev" style="background:${Cal.color(e)}" data-a="calEv" data-v="${e.id}">${esc(e.title)}</button>`).join('')}</div>`).join('')}</div>` : ''}
    <div class="wk-scroll"><div class="wk-grid" style="grid-template-columns:${cols};height:${24 * HOUR}px">
      <div class="gut">${Array.from({ length: 23 }, (_, i) => `<span style="top:${(i + 1) * HOUR}px">${pad(i + 1)}:00</span>`).join('')}</div>
      ${ds.map(d => `<div class="daycol" data-a="calSlot" data-v="${d}">${layoutDay(Cal.on(d).filter(e => !e.allDay)).map(o => {
        const top = o.s / 60 * HOUR, h = Math.max((o.f - o.s) / 60 * HOUR, 22), w = 100 / o.n;
        return `<button class="ev" data-a="calEv" data-v="${o.e.id}" style="top:${top}px;height:${h - 2}px;left:calc(${o.lane * w}% + 2px);width:calc(${w}% - 4px);background:${Cal.color(o.e)}">${esc(o.e.title)}${h > 34 ? `<small>${o.e.start} – ${o.e.end}</small>` : ''}</button>`;
      }).join('')}${d === t ? `<div class="nowline" style="top:${nowMin / 60 * HOUR}px"></div>` : ''}</div>`).join('')}
    </div></div></div>`;
}
function monthGrid() {
  const d = parse(Cal.at), first = iso(new Date(d.getFullYear(), d.getMonth(), 1)), start = Cal.weekStart(first), t = today();
  return `<div class="calwrap"><div class="month">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(w => `<div class="h">${w}</div>`).join('')}
    ${Array.from({ length: 42 }, (_, i) => {
      const ds = addDays(start, i), x = parse(ds), evs = Cal.on(ds), max = innerWidth < 600 ? 2 : 3;
      return `<div class="cell ${x.getMonth() !== d.getMonth() ? 'o' : ''} ${ds === t ? 'today' : ''}" data-a="calDay" data-v="${ds}"><span class="dn">${x.getDate()}</span>
        ${evs.slice(0, max).map(e => `<button class="chipev" style="background:${Cal.color(e)}" data-a="calEv" data-v="${e.id}">${e.allDay ? '' : `<span class="tm">${e.start} </span>`}${esc(e.title)}</button>`).join('')}
        ${evs.length > max ? `<span class="more">+${evs.length - max} weitere</span>` : ''}</div>`;
    }).join('')}</div></div>`;
}
function agenda() {
  const t = today();
  const list = Cal.view === 'day' ? Cal.on(Cal.at) : Cal.events().filter(e => e.date >= t).sort((a, b) => a.date.localeCompare(b.date) || toMin(a.start) - toMin(b.start)).slice(0, 12);
  const title = Cal.view === 'day' ? 'Termine an diesem Tag' : 'Demnächst';
  return `<section class="card" style="margin-top:14px"><h2>${title}</h2><ul class="list agenda">${list.map(e => `<li data-a="calEv" data-v="${e.id}" style="cursor:pointer"><span class="dotc" style="background:${Cal.color(e)}"></span>
    <span class="tm num">${e.allDay ? 'Ganztägig' : e.start + '–' + e.end}</span><span class="t"><b>${esc(e.title)}</b>${Cal.view === 'day' ? '' : `<small>${relDay(e.date) || fmtDate(e.date)} · ${Cal.catName(e)}</small>`}${e.note ? `<small>${esc(e.note)}</small>` : ''}</span></li>`).join('') || `<li class="empty">${Cal.view === 'day' ? 'Nichts geplant. Tippe in den Kalender, um einen Termin anzulegen.' : 'Keine kommenden Termine.'}</li>`}</ul></section>`;
}

/* --- Termin-Dialog --- */
function eventModal() {
  const e = Cal.ed;
  return `${App.sheetHead(e.isNew ? 'Neuer Termin' : 'Termin bearbeiten')}
    <div class="stack"><input id="etitle" data-i="calTitle" value="${esc(e.title)}" placeholder="Titel, z. B. Mathe-Test" style="font-size:20px;font-weight:800" autocomplete="off" autofocus>
    <label style="display:flex;align-items:center;gap:10px;color:var(--ink)"><input type="checkbox" data-c="calAll" ${e.allDay ? 'checked' : ''} style="width:22px;min-height:22px;accent-color:var(--acc)"> Ganztägig</label>
    <div class="formgrid"><label>Datum<input id="edate" type="date" value="${e.date}" data-c="calDate"></label>
    ${e.allDay ? '' : `<label>Beginn<input id="estart" type="time" value="${e.start}" data-c="calStart"></label><label>Ende<input id="eend" type="time" value="${e.end}" data-c="calEnd"></label>`}</div>
    <div><p class="small" style="margin-bottom:6px">Kategorie</p><div class="colors">${CATS.map(([k, l, c]) => `<button data-a="calCat" data-v="${k}" aria-pressed="${e.cat === k}"><i style="background:${c}"></i>${l}</button>`).join('')}</div></div>
    <label>Notiz<textarea id="enote" data-i="calNote" placeholder="Raum, Themen, mitbringen …">${esc(e.note || '')}</textarea></label>
    <div class="row">${e.isNew ? '' : `<button class="danger" data-a="calDel">${ic('trash')} Löschen</button>`}<button class="pri grow" data-a="calSave">Speichern</button></div></div>`;
}
function openEvent(e) { Cal.ed = e; App.modal(eventModal); }
Actions.calView = el => { Cal.view = el.dataset.v; App.render(); };
Actions.calToday = () => { Cal.at = today(); App.render(); };
Actions.calNav = el => {
  const n = +el.dataset.v;
  if (Cal.view === 'month') { const d = parse(Cal.at); Cal.at = iso(new Date(d.getFullYear(), d.getMonth() + n, 1)); }
  else Cal.at = addDays(Cal.at, n * (Cal.view === 'week' ? 7 : 1));
  App.render();
};
Actions.calDay = el => { Cal.at = el.dataset.v; Cal.view = 'day'; App.render(); };
Actions.calSlot = (el, ev) => {
  const r = el.getBoundingClientRect(), m = Math.max(0, Math.min(23 * 60 + 30, Math.floor((ev.clientY - r.top) / HOUR * 2) * 30));
  openEvent({ id: uid(), isNew: true, title: '', date: el.dataset.v, allDay: false, start: toTime(m), end: toTime(Math.min(m + 60, 23 * 60 + 59)), cat: 'termin', note: '' });
};
Actions.calNew = () => {
  const now = new Date(), m = Math.min((now.getHours() + 1) * 60, 23 * 60);
  openEvent({ id: uid(), isNew: true, title: '', date: Cal.view === 'day' ? Cal.at : (Cal.days().includes(today()) || Cal.view === 'month' ? today() : Cal.at), allDay: false, start: toTime(m), end: toTime(Math.min(m + 60, 23 * 60 + 59)), cat: 'termin', note: '' });
};
Actions.calEv = el => { const e = Cal.events().find(x => x.id === el.dataset.v); if (e) openEvent(clone(e)); };
Changes.calTitle = el => { Cal.ed.title = el.value; };
Changes.calNote = el => { Cal.ed.note = el.value; };
Changes.calAll = el => { Cal.ed.allDay = el.checked; App.refreshModal(); };
Changes.calDate = el => { if (el.value) Cal.ed.date = el.value; };
Changes.calStart = el => { const e = Cal.ed, dur = toMin(e.end) - toMin(e.start); e.start = el.value || e.start; e.end = toTime(Math.min(toMin(e.start) + Math.max(dur, 15), 23 * 60 + 59)); App.refreshModal(); };
Changes.calEnd = el => { const e = Cal.ed; e.end = el.value || e.end; if (toMin(e.end) <= toMin(e.start)) { e.end = toTime(Math.min(toMin(e.start) + 30, 23 * 60 + 59)); App.toast('Ende muss nach dem Beginn liegen.'); App.refreshModal(); } };
Actions.calCat = el => { Cal.ed.cat = el.dataset.v; App.refreshModal(); };
Actions.calSave = () => {
  const e = Cal.ed; if (!e.title.trim()) { App.toast('Gib dem Termin einen Titel.'); $('#etitle') && $('#etitle').focus(); return; }
  const { isNew, ...clean } = e; clean.title = clean.title.trim();
  const l = Cal.events(), i = l.findIndex(x => x.id === e.id); if (i >= 0) l[i] = clean; else l.push(clean);
  App.closeModal(); Cal.save(l); App.toast('Termin gespeichert');
};
Actions.calDel = () => { const id = Cal.ed.id; App.confirm('Diesen Termin löschen?', () => Cal.save(Cal.events().filter(x => x.id !== id))); };
