'use strict';
/* ===== Gesichts-Workouts: animierte Übungen, eigene Workouts, Player, Verlauf ===== */
const FACE_ANIMS = {
  puff: 'Wangen aufblasen', fish: 'Fischmund', brow: 'Augenbrauen heben', jaw: 'Mund weit öffnen', smile: 'Lächeln halten', squint: 'Augen zukneifen',
  neck: 'Kopf zurück + Kussmund', tilt: 'Kopf seitlich neigen', vowel: 'O und E formen', tongue: 'Zunge rausstrecken', eyes: 'Augen kreisen',
  jawside: 'Kiefer seitlich', massage: 'Wangen massieren', chin: 'Kinn vorschieben', none: 'Ruhig halten'
};
const FACE_LIB = [
  { id: 'puff', name: 'Wangen aufblasen', anim: 'puff', sec: 30, desc: 'Atme ein und blase beide Wangen mit Luft auf.\nHalte 5 Sekunden, dann lass die Luft langsam raus.\nVariante: Schiebe die Luft von einer Wange in die andere.' },
  { id: 'fish', name: 'Fischmund', anim: 'fish', sec: 30, desc: 'Sauge die Wangen nach innen, sodass die Lippen nach vorne kommen.\nHalte die Spannung 5 Sekunden.\nLocker lassen und wiederholen.' },
  { id: 'brow', name: 'Augenbrauen heben', anim: 'brow', sec: 30, desc: 'Ziehe die Augenbrauen so hoch du kannst und öffne die Augen weit.\n3 Sekunden halten, dann entspannen.\nTipp: Stirn mit den Fingern leicht gegenhalten für mehr Widerstand.' },
  { id: 'jaw', name: 'Mund weit öffnen', anim: 'jaw', sec: 40, desc: 'Öffne den Mund so weit es angenehm geht.\n3 Sekunden halten, dann langsam schließen.\nNicht ruckartig – kein Schmerz!' },
  { id: 'smile', name: 'Lächeln halten', anim: 'smile', sec: 30, desc: 'Lächle so breit du kannst, die Wangen gehen nach oben.\n10 Sekunden halten.\nEntspannen und wiederholen.' },
  { id: 'squint', name: 'Augen zukneifen', anim: 'squint', sec: 30, desc: 'Kneife die Augen fest zusammen.\n3 Sekunden halten, dann weit öffnen.\nGut für die Muskeln rund um die Augen.' },
  { id: 'neck', name: 'Decke küssen (Kinnlinie)', anim: 'neck', sec: 40, desc: 'Lege den Kopf langsam in den Nacken und schau zur Decke.\nSpitze die Lippen zu einem Kussmund.\n5–10 Sekunden halten, dann zurück. Spürst du die Spannung am Hals?' },
  { id: 'tilt', name: 'Hals seitlich dehnen', anim: 'tilt', sec: 40, desc: 'Neige den Kopf langsam zur linken Schulter.\n10 Sekunden halten, dann zur rechten Seite.\nSchultern bleiben unten.' },
  { id: 'vowel', name: 'O – E Übung', anim: 'vowel', sec: 40, desc: 'Forme mit den Lippen ein großes „O“.\nWechsle zu einem breiten „E“.\nÜbertreibe die Bewegung ruhig.' },
  { id: 'tongue', name: 'Zunge zum Kinn', anim: 'tongue', sec: 30, desc: 'Öffne den Mund und strecke die Zunge Richtung Kinn.\n5 Sekunden halten.\nZurückziehen und wiederholen.' },
  { id: 'eyes', name: 'Augen kreisen', anim: 'eyes', sec: 30, desc: 'Kopf bleibt still.\nLass die Augen langsam im Kreis wandern.\nNach der Hälfte die Richtung wechseln.' },
  { id: 'jawside', name: 'Kiefer seitlich', anim: 'jawside', sec: 30, desc: 'Mund leicht öffnen.\nSchiebe den Unterkiefer langsam nach links, dann nach rechts.\nRuhig und kontrolliert.' },
  { id: 'massage', name: 'Wangen-Massage', anim: 'massage', sec: 60, desc: 'Lege die Fingerspitzen auf die Wangen.\nMassiere in kleinen Kreisen von unten nach oben.\nAm besten mit etwas Gesichtsöl oder Creme.' },
  { id: 'chin', name: 'Kinn vorschieben', anim: 'chin', sec: 30, desc: 'Schiebe den Unterkiefer nach vorne.\nZiehe die Unterlippe nach oben.\n5 Sekunden halten, entspannen.' }
];
const FACE_DEF_ROUTINES = [
  { id: 'r-glow', name: 'Morgen-Glow', items: [['puff', 30], ['fish', 30], ['brow', 30], ['smile', 30], ['eyes', 30]] },
  { id: 'r-jaw', name: 'Kinnlinie & Hals', items: [['neck', 40], ['jaw', 30], ['jawside', 30], ['chin', 30], ['tilt', 40]] }
].map(r => ({ ...r, items: r.items.map(([ex, sec]) => ({ ex, sec })) }));

function faceSVG(anim, cls = '') {
  const lip = '#c4507c', dark = '#7a2440', line = '#d3a089';
  return `<svg class="face f-${anim} ${cls}" viewBox="0 0 200 230" aria-hidden="true">
    <path d="M14 230 Q22 200 74 198 L126 198 Q178 200 186 230Z" fill="var(--pink)"/>
    <path d="M78 150 L78 206 Q100 214 122 206 L122 150Z" fill="var(--skin2)"/>
    <path class="neckline fl" d="M88 182 Q100 188 112 182 M92 194 Q100 198 108 194" stroke="${line}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g class="head">
      <ellipse cx="100" cy="94" rx="66" ry="76" fill="var(--hair)"/>
      <ellipse class="bulge" cx="47" cy="134" rx="16" ry="19" fill="var(--skin)"/><ellipse class="bulge" cx="153" cy="134" rx="16" ry="19" fill="var(--skin)"/>
      <ellipse cx="42" cy="110" rx="8" ry="13" fill="var(--skin2)"/><ellipse cx="158" cy="110" rx="8" ry="13" fill="var(--skin2)"/>
      <ellipse cx="100" cy="108" rx="58" ry="72" fill="var(--skin)"/>
      <path d="M42 94 Q46 34 100 32 Q154 34 158 94 Q146 58 106 56 Q86 70 58 70 Q48 78 42 94Z" fill="var(--hair)"/>
      <path class="fl" d="M76 64 Q100 58 124 64 M80 71 Q100 66 120 71" stroke="${line}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse class="hollow" cx="68" cy="136" rx="9" ry="15" fill="rgba(150,70,60,.22)"/><ellipse class="hollow" cx="132" cy="136" rx="9" ry="15" fill="rgba(150,70,60,.22)"/>
      <ellipse class="ck" cx="66" cy="128" rx="12" ry="8" fill="var(--blush)" opacity=".65"/><ellipse class="ck" cx="134" cy="128" rx="12" ry="8" fill="var(--blush)" opacity=".65"/>
      <path class="bw" d="M62 82 Q75 73 89 79" stroke="var(--hair)" stroke-width="4.5" fill="none" stroke-linecap="round"/><path class="bw" d="M111 79 Q125 73 138 82" stroke="var(--hair)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <g class="eye"><ellipse cx="76" cy="98" rx="10" ry="7.5" fill="#fff"/><circle class="pu" cx="76" cy="98" r="4.6" fill="#3d2030"/></g>
      <g class="eye"><ellipse cx="124" cy="98" rx="10" ry="7.5" fill="#fff"/><circle class="pu" cx="124" cy="98" r="4.6" fill="#3d2030"/></g>
      <path d="M100 104 Q97 118 93 122 Q100 126 107 122" stroke="${line}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path class="chin" d="M90 170 Q100 175 110 170" stroke="${line}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g class="mouth">
        <path class="m m-n" d="M86 146 Q100 153 114 146" stroke="${lip}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path class="m m-press" d="M89 148 L111 148" stroke="${lip}" stroke-width="4.5" stroke-linecap="round"/>
        <g class="m m-fish"><ellipse cx="100" cy="148" rx="7" ry="9" fill="${lip}"/><ellipse cx="100" cy="148" rx="2.5" ry="4" fill="${dark}"/></g>
        <g class="m m-open"><ellipse cx="100" cy="151" rx="13" ry="13" fill="${dark}"/><rect x="91" y="139" width="18" height="5" rx="2" fill="#fff"/></g>
        <path class="m m-smile" d="M80 141 Q100 168 120 141 Q100 152 80 141Z" fill="${dark}" stroke="${lip}" stroke-width="3" stroke-linejoin="round"/>
        <ellipse class="m m-kiss" cx="100" cy="147" rx="7" ry="6" fill="${lip}"/>
        <ellipse class="m m-o" cx="100" cy="149" rx="8.5" ry="12" fill="${dark}" stroke="${lip}" stroke-width="3"/>
        <ellipse class="m m-e" cx="100" cy="148" rx="17" ry="4.5" fill="${dark}" stroke="${lip}" stroke-width="3"/>
        <rect class="tongue" x="93" y="152" width="14" height="24" rx="7" fill="#ec6f92"/>
      </g>
      <g class="hand"><rect x="40" y="114" width="10" height="26" rx="5" fill="var(--skin2)" stroke="${line}"/><rect x="50" y="110" width="10" height="28" rx="5" fill="var(--skin2)" stroke="${line}"/><rect x="60" y="114" width="10" height="24" rx="5" fill="var(--skin2)" stroke="${line}"/></g>
      <g class="hand"><rect x="150" y="114" width="10" height="26" rx="5" fill="var(--skin2)" stroke="${line}"/><rect x="140" y="110" width="10" height="28" rx="5" fill="var(--skin2)" stroke="${line}"/><rect x="130" y="114" width="10" height="24" rx="5" fill="var(--skin2)" stroke="${line}"/></g>
    </g></svg>`;
}

const Face = {
  sub: 'workouts', month: today().slice(0, 7), ed: null, P: null,
  data() { const d = Store.get('face', {}); return { custom: d.custom || [], routines: d.routines || clone(FACE_DEF_ROUTINES) }; },
  save(fn) { const d = clone(this.data()); fn(d); Store.set('face', d); App.render(); },
  all() { return [...FACE_LIB, ...this.data().custom]; },
  ex(id) { return this.all().find(e => e.id === id); },
  log(k) { return Store.get('fl:' + k, { list: [] }).list || []; },
  streak() {
    let n = 0, d = today(); const has = s => this.log(s.slice(0, 7)).some(x => x.date === s);
    if (!has(d)) d = addDays(d, -1);
    while (has(d) && n < 400) { n++; d = addDays(d, -1); }
    return n;
  },
  doneToday() { return this.log(today().slice(0, 7)).filter(x => x.date === today()).length; }
};

Views.gesicht = {
  render() {
    const tabs = [['workouts', 'Workouts'], ['uebungen', 'Übungen'], ['verlauf', 'Verlauf']];
    let body = Face.sub === 'workouts' ? faceWorkouts() : Face.sub === 'uebungen' ? faceLibrary() : faceHistory();
    return `<div class="top"><h1>Gesicht</h1><span class="tag" style="font-size:14px">${Face.streak()} Tage in Folge</span></div>
      <div class="tabs">${tabs.map(([k, l]) => `<button data-a="faSub" data-v="${k}" aria-pressed="${Face.sub === k}">${l}</button>`).join('')}</div>${body}`;
  }
};
function routineDur(r) { return r.items.reduce((a, i) => a + (+i.sec || 0), 0); }
function faceWorkouts() {
  const rs = Face.data().routines, done = Face.doneToday();
  return `<div class="card hero" style="margin-bottom:14px"><b style="font-size:18px">${done ? `Heute schon ${done}× trainiert – super!` : 'Heute noch kein Gesichts-Workout'}</b><p class="muted" style="margin-top:4px">Wähle ein Workout und folge der Animation. Der Timer führt dich durch jede Übung.</p></div>
    <div class="cards">${rs.map(r => `<section class="card routine"><div class="row between"><h2 style="margin:0">${esc(r.name)}</h2><button class="icon ghost" data-a="faEdit" data-v="${r.id}" aria-label="Bearbeiten">${ic('edit')}</button></div>
      <div class="faces-mini">${r.items.slice(0, 6).map(i => { const e = Face.ex(i.ex); return e ? faceSVG(e.anim) : ''; }).join('')}</div>
      <p class="small">${r.items.length} Übungen · ${fmtDur(routineDur(r))}</p>
      <button class="pri" data-a="faStart" data-v="${r.id}" ${r.items.length ? '' : 'disabled'}>${ic('play')} Starten</button></section>`).join('')}
    <button class="card" data-a="faEdit" data-v="" style="min-height:160px;border-style:dashed;display:grid;place-content:center;justify-items:center;gap:4px">${ic('plus')}<b>Neues Gesichts-Workout</b><span class="small">Stell deine eigenen Übungen zusammen</span></button></div>`;
}
function faceLibrary() {
  const custom = Face.data().custom.map(e => e.id);
  return `<div class="faces">${Face.all().map(e => `<button class="facecard" data-a="faDetail" data-v="${e.id}">${faceSVG(e.anim)}<span>${esc(e.name)}</span><span class="small">${e.sec} Sek${custom.includes(e.id) ? ' · eigene' : ''}</span></button>`).join('')}
    <button class="facecard" data-a="faCustom" data-v="" style="border-style:dashed;place-content:center;min-height:180px">${ic('plus')}<span>Eigene Übung</span></button></div>`;
}
function faceHistory() {
  const k = Face.month, list = Face.log(k).slice().sort((a, b) => b.t - a.t), days = new Set(list.map(x => x.date));
  const [y, m] = k.split('-').map(Number), n = new Date(y, m, 0).getDate(), off = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const total = list.reduce((a, x) => a + (x.dur || 0), 0);
  return `<div class="row between" style="margin-bottom:12px"><button class="icon" data-a="faMonth" data-v="-1" aria-label="Voriger Monat">${ic('left')}</button><h2 style="margin:0">${monthName(k)}</h2><button class="icon" data-a="faMonth" data-v="1" aria-label="Nächster Monat">${ic('right')}</button></div>
    <div class="portion" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:14px"><div><b>${list.length}</b><span>Workouts</span></div><div><b>${days.size}</b><span>Tage</span></div><div><b>${Math.round(total / 60)}</b><span>Minuten</span></div></div>
    <div class="cards"><section class="card"><div class="month" style="gap:4px;display:grid">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<div class="small" style="text-align:center;font-weight:800">${d}</div>`).join('')}
      ${Array.from({ length: off }, () => '<div></div>').join('')}${Array.from({ length: n }, (_, i) => { const ds = `${k}-${pad(i + 1)}`, on = days.has(ds); return `<div style="aspect-ratio:1;display:grid;place-items:center;border-radius:50%;font-weight:800;font-size:14px;background:${on ? 'var(--acc)' : ds === today() ? 'var(--card2)' : 'transparent'};color:${on ? 'var(--on-acc)' : 'inherit'}">${i + 1}</div>`; }).join('')}</div></section>
    <section class="card"><h2>Einheiten</h2><ul class="list">${list.map(x => `<li><span class="t"><b>${esc(x.name)}</b><small>${fmtDate(x.date)} · ${x.n} Übungen · ${fmtDur(x.dur)}</small></span><button class="x" data-a="faDelLog" data-v="${x.id}" aria-label="Löschen">${ic('x')}</button></li>`).join('') || '<li class="empty">Noch keine Einheiten in diesem Monat.</li>'}</ul></section></div>`;
}

/* --- Routine bearbeiten --- */
function routineModal() {
  const r = Face.ed;
  return `${App.sheetHead(r.isNew ? 'Neues Gesichts-Workout' : 'Workout bearbeiten')}
    <label>Name<input id="rname" data-i="faName" value="${esc(r.name)}" placeholder="z. B. Abend-Routine" autocomplete="off"></label>
    <h3 style="margin:16px 0 8px">Ablauf (${fmtDur(routineDur(r))})</h3>
    <div class="exlist">${r.items.map((it, i) => { const e = Face.ex(it.ex); return e ? `<div class="exrow"><span style="width:52px">${faceSVG(e.anim)}</span><span class="t"><b>${esc(e.name)}</b></span>
      <input id="rsec-${i}" type="number" inputmode="numeric" min="5" step="5" value="${it.sec}" data-c="faSec" data-v="${i}" style="width:74px" aria-label="Sekunden"><span class="small">s</span>
      <span style="display:grid"><button class="x" data-a="faMove" data-v="${i}|-1" aria-label="Nach oben" ${i ? '' : 'disabled'}>${ic('up')}</button><button class="x" data-a="faMove" data-v="${i}|1" aria-label="Nach unten" ${i < r.items.length - 1 ? '' : 'disabled'}>${ic('down')}</button></span>
      <button class="x" data-a="faRemove" data-v="${i}" aria-label="Entfernen">${ic('x')}</button></div>` : ''; }).join('') || '<p class="empty">Füge unten Übungen hinzu.</p>'}</div>
    <h3 style="margin:16px 0 8px">Übung hinzufügen</h3>
    <div class="anim-pick">${Face.all().map(e => `<button data-a="faAddItem" data-v="${e.id}">${faceSVG(e.anim)}<span>${esc(e.name)}</span></button>`).join('')}</div>
    <div class="row" style="margin-top:16px">${r.isNew ? '' : `<button class="danger" data-a="faDelRoutine">${ic('trash')} Löschen</button>`}<button class="pri grow" data-a="faSaveRoutine">Speichern</button></div>`;
}
Actions.faSub = el => { Face.sub = el.dataset.v; App.render(); };
Actions.faMonth = el => { Face.month = addMonth(Face.month, +el.dataset.v); App.render(); };
Actions.faEdit = el => {
  const r = Face.data().routines.find(x => x.id === el.dataset.v);
  Face.ed = r ? clone(r) : { id: uid(), name: '', items: [], isNew: true };
  App.modal(routineModal);
};
Changes.faName = el => { Face.ed.name = el.value; };
Changes.faSec = el => { Face.ed.items[+el.dataset.v].sec = Math.max(5, +el.value || 30); App.refreshModal(); };
Actions.faMove = el => { const [i, d] = el.dataset.v.split('|').map(Number), a = Face.ed.items, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; App.refreshModal(); };
Actions.faRemove = el => { Face.ed.items.splice(+el.dataset.v, 1); App.refreshModal(); };
Actions.faAddItem = el => { const e = Face.ex(el.dataset.v); Face.ed.items.push({ ex: e.id, sec: e.sec }); App.refreshModal(); App.toast(e.name + ' hinzugefügt'); };
Actions.faSaveRoutine = () => {
  const r = Face.ed; if (!r.name.trim()) r.name = 'Mein Workout';
  const { isNew, ...clean } = r;
  Face.save(d => { const i = d.routines.findIndex(x => x.id === r.id); if (i >= 0) d.routines[i] = clean; else d.routines.push(clean); });
  App.closeModal();
};
Actions.faDelRoutine = () => { const id = Face.ed.id; App.confirm('Dieses Gesichts-Workout löschen?', () => Face.save(d => { d.routines = d.routines.filter(x => x.id !== id); })); };

/* --- Übung ansehen / eigene Übung --- */
Actions.faDetail = el => {
  const e = Face.ex(el.dataset.v); if (!e) return;
  const own = Face.data().custom.some(c => c.id === e.id);
  App.modal(() => `${App.sheetHead(esc(e.name))}<div style="max-width:260px;margin:0 auto">${faceSVG(e.anim)}</div>
    <ol style="padding-left:20px;display:grid;gap:6px;margin:14px 0">${(e.desc || '').split('\n').filter(Boolean).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <div class="row">${own ? `<button data-a="faCustom" data-v="${e.id}">${ic('edit')} Bearbeiten</button>` : ''}<button class="pri grow" data-a="faTry" data-v="${e.id}">${ic('play')} ${e.sec} Sek üben</button></div>`);
};
Actions.faCustom = el => {
  const e = Face.data().custom.find(c => c.id === el.dataset.v);
  Face.ced = e ? clone(e) : { id: 'c-' + uid(), name: '', anim: 'puff', sec: 30, desc: '', isNew: true };
  App.modal(() => { const c = Face.ced; return `${App.sheetHead(c.isNew ? 'Eigene Übung' : 'Übung bearbeiten')}
    <div class="stack"><label>Name<input id="cname" data-i="faCName" value="${esc(c.name)}" placeholder="z. B. Gua Sha Kinn" autocomplete="off"></label>
    <div><p class="small" style="margin-bottom:6px">Welche Animation passt dazu?</p><div class="anim-pick">${Object.entries(FACE_ANIMS).map(([k, l]) => `<button data-a="faCAnim" data-v="${k}" aria-pressed="${c.anim === k}">${faceSVG(k)}<span>${l}</span></button>`).join('')}</div></div>
    <label>Dauer in Sekunden<input id="csec" type="number" inputmode="numeric" min="5" step="5" value="${c.sec}" data-i="faCSec"></label>
    <label>Anleitung (jede Zeile = ein Schritt)<textarea id="cdesc" data-i="faCDesc" placeholder="Was genau machst du?">${esc(c.desc)}</textarea></label>
    <div class="row">${c.isNew ? '' : `<button class="danger" data-a="faCDel">${ic('trash')} Löschen</button>`}<button class="pri grow" data-a="faCSave">Speichern</button></div></div>`; });
};
Changes.faCName = el => { Face.ced.name = el.value; };
Changes.faCSec = el => { Face.ced.sec = Math.max(5, +el.value || 30); };
Changes.faCDesc = el => { Face.ced.desc = el.value; };
Actions.faCAnim = el => { Face.ced.anim = el.dataset.v; App.refreshModal(); };
Actions.faCSave = () => {
  const c = Face.ced; if (!c.name.trim()) { App.toast('Gib der Übung einen Namen.'); return; }
  const { isNew, ...clean } = c;
  Face.save(d => { const i = d.custom.findIndex(x => x.id === c.id); if (i >= 0) d.custom[i] = clean; else d.custom.push(clean); });
  App.closeModal(); App.toast('Übung gespeichert – du findest sie beim Bearbeiten deiner Workouts.');
};
Actions.faCDel = () => { const id = Face.ced.id; App.confirm('Eigene Übung löschen? Sie wird auch aus deinen Workouts entfernt.', () => Face.save(d => { d.custom = d.custom.filter(x => x.id !== id); d.routines.forEach(r => r.items = r.items.filter(i => i.ex !== id)); })); };
Actions.faDelLog = el => { const k = Face.month; Store.set('fl:' + k, { list: Face.log(k).filter(x => x.id !== el.dataset.v) }); App.render(); };

/* --- Player --- */
function startPlayer(r) {
  App.closeModal();
  Face.P = { r, i: 0, left: r.items[0].sec, paused: false, t0: Date.now(), done: false };
  $('#player').hidden = false; document.body.style.overflow = 'hidden';
  renderPlayer(); tickPlayer();
}
function tickPlayer() {
  clearInterval(Face.int);
  Face.int = setInterval(() => {
    const P = Face.P; if (!P || P.paused || P.done) return;
    P.left--;
    if (P.left <= 0) { nextEx(); return; }
    const c = $('#pcount'); if (c) c.textContent = P.left;
    const ring = $('#pring'); if (ring) ring.style.strokeDashoffset = ringOff();
  }, 1000);
}
function ringOff() { const P = Face.P, C = 2 * Math.PI * 46, tot = +P.r.items[P.i].sec || 30; return C * (1 - P.left / tot); }
function nextEx(d = 1) {
  const P = Face.P, j = P.i + d;
  if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
  if (j >= P.r.items.length) { P.done = true; P.i = P.r.items.length; logFace(P.r.items.length); renderPlayer(); return; }
  if (j < 0) return;
  P.i = j; P.left = +P.r.items[j].sec || 30; renderPlayer();
}
function logFace(n) {
  const P = Face.P; if (P.logged || n < 1) return; P.logged = true;
  const k = today().slice(0, 7);
  const list = Face.log(k); list.push({ id: uid(), date: today(), t: Date.now(), routineId: P.r.id, name: P.r.name, dur: Math.round((Date.now() - P.t0) / 1000), n });
  Store.set('fl:' + k, { list });
}
function renderPlayer() {
  const P = Face.P, el = $('#player');
  if (P.done) {
    el.innerHTML = `<div class="row between"><span></span><button class="icon ghost" data-a="faClose" aria-label="Schließen">${ic('x')}</button></div>
      <div class="stage">${faceSVG('smile')}<h1>Geschafft!</h1><p class="steps">${esc(P.r.name)} · ${P.r.items.length} Übungen · ${fmtDur((Date.now() - P.t0) / 1000)}<br>Gespeichert in deinem Verlauf. ${Face.streak()} Tage in Folge!</p></div>
      <button class="pri" data-a="faClose">Fertig</button>`;
    return;
  }
  const it = P.r.items[P.i], e = Face.ex(it.ex) || { name: '?', anim: 'none', desc: '' }, C = 2 * Math.PI * 46;
  el.innerHTML = `<div class="row between"><button class="icon ghost" data-a="faClose" aria-label="Beenden">${ic('x')}</button><b>${esc(P.r.name)}</b><span class="small num">${P.i + 1}/${P.r.items.length}</span></div>
    <div class="stage">${faceSVG(e.anim, P.paused ? 'paused' : '')}
      <h2 style="margin:0">${esc(e.name)}</h2>
      <div style="position:relative;width:110px;height:110px"><svg viewBox="0 0 100 100" style="width:100%;height:100%"><circle cx="50" cy="50" r="46" fill="none" stroke="var(--card2)" stroke-width="7"/><circle id="pring" cx="50" cy="50" r="46" fill="none" stroke="var(--acc)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" style="stroke-dashoffset:${ringOff()};transition:stroke-dashoffset 1s linear" transform="rotate(-90 50 50)"/></svg><span class="count" id="pcount" style="position:absolute;inset:0;display:grid;place-items:center;font-size:40px">${P.left}</span></div>
      <p class="steps">${esc((e.desc || '').split('\n').filter(Boolean).join(' '))}</p>
      <div class="dots">${P.r.items.map((_, i) => `<i class="${i < P.i ? 'done' : i === P.i ? 'on' : ''}"></i>`).join('')}</div></div>
    <div class="row"><button class="icon" data-a="faPrev" aria-label="Zurück" ${P.i ? '' : 'disabled'}>${ic('left')}</button><button class="pri grow" data-a="faPause">${ic(P.paused ? 'play' : 'pause')} ${P.paused ? 'Weiter' : 'Pause'}</button><button class="icon" data-a="faNext" aria-label="Nächste Übung">${ic('right')}</button></div>`;
}
Actions.faStart = el => { const r = Face.data().routines.find(x => x.id === el.dataset.v); if (r && r.items.length) startPlayer(clone(r)); };
Actions.faTry = el => { const e = Face.ex(el.dataset.v); startPlayer({ id: 'single', name: e.name, items: [{ ex: e.id, sec: e.sec }] }); };
Actions.faPause = () => { Face.P.paused = !Face.P.paused; renderPlayer(); };
Actions.faNext = () => nextEx(1);
Actions.faPrev = () => nextEx(-1);
Actions.faClose = () => {
  const P = Face.P;
  if (P && !P.done && P.i > 0) logFace(P.i);
  clearInterval(Face.int); Face.P = null; $('#player').hidden = true; $('#player').innerHTML = ''; document.body.style.overflow = ''; App.render();
};
