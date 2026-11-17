'use strict';
/* ===== Training: Mappen, Übungsdatenbank, Live-Workout, Verlauf, Körperkarte ===== */
const EX_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const EQUIP_DE = { barbell: 'Langhantel', dumbbell: 'Kurzhantel', other: 'Sonstiges', 'body only': 'Körpergewicht', cable: 'Kabelzug', none: 'Ohne Gerät', machine: 'Maschine', kettlebells: 'Kettlebell', bands: 'Widerstandsband', 'medicine ball': 'Medizinball', 'exercise ball': 'Gymnastikball', 'foam roll': 'Faszienrolle', 'e-z curl bar': 'SZ-Stange' };
const CAT_DE = { strength: 'Kraft', stretching: 'Dehnen', plyometrics: 'Sprungkraft', powerlifting: 'Powerlifting', 'olympic weightlifting': 'Gewichtheben', strongman: 'Strongman', cardio: 'Cardio' };
const LVL_DE = { beginner: 'Anfänger', intermediate: 'Fortgeschritten', expert: 'Profi' };
const FCOLORS = ['#a3243a', '#54458a', '#2f6b5a', '#8a6a1c', '#3e5f86', '#7a2d6e'];
const SYN = { kniebeuge: 'squat', bankdrücken: 'bench press', bank: 'bench', brust: 'chest|bench|fly|push', rücken: 'row|pulldown|pull-up|deadlift', schulter: 'shoulder|raise|press', bein: 'squat|leg|lunge', arm: 'curl|tricep', kreuzheben: 'deadlift', klimmzug: 'pull', klimmzüge: 'pull', liegestütz: 'push-up|pushup', ausfallschritt: 'lunge', rudern: 'row', schulterdrücken: 'shoulder press|military press', seitheben: 'lateral raise', hüftheben: 'hip thrust|glute bridge|bridge', 'hip thrust': 'hip thrust', wadenheben: 'calf', beinpresse: 'leg press', latzug: 'pulldown', fliegende: 'fly|flye', butterfly: 'fly|flye', dehnen: 'stretch', dehnung: 'stretch', bauch: 'crunch|ab |sit-up|plank', unterarmstütz: 'plank', po: 'glute|hip thrust', beinstrecker: 'leg extension', beincurl: 'leg curl', trizeps: 'tricep', bizeps: 'curl', springen: 'jump', seilspringen: 'rope jumping', laufen: 'running|jog', rad: 'bicycl|cycling', hantel: 'dumbbell|barbell', kurzhantel: 'dumbbell', langhantel: 'barbell', kabel: 'cable', ' band': 'band' };
const STARTER = [
  { name: 'Oberkörper', color: FCOLORS[0], ex: ['Barbell_Bench_Press_-_Medium_Grip', 'Incline_Dumbbell_Press', 'Dumbbell_Shoulder_Press', 'Side_Lateral_Raise', 'Triceps_Pushdown'] },
  { name: 'Rücken & Arme', color: FCOLORS[1], ex: ['Wide-Grip_Lat_Pulldown', 'Seated_Cable_Rows', 'Bent_Over_Barbell_Row', 'Dumbbell_Bicep_Curl', 'Barbell_Curl'] },
  { name: 'Beine & Po', color: FCOLORS[2], ex: ['Barbell_Squat', 'Barbell_Hip_Thrust', 'Romanian_Deadlift', 'Leg_Press', 'Lying_Leg_Curls', 'Standing_Calf_Raises'] }
];

const Train = {
  sub: 'mappen', ex: null, byId: {}, loading: false, q: '', fm: '', fe: '', limit: 40, folderId: null, pick: null, month: today().slice(0, 7), bodySel: null,
  async load() {
    if (this.ex || this.loading) return; this.loading = true;
    try { this.ex = await (await fetch('data/exercises.json')).json(); this.ex.forEach(e => this.byId[e.id] = e); }
    catch (e) { this.ex = []; App.toast('Übungen konnten nicht geladen werden.'); }
    this.loading = false; App.render();
  },
  folders() { return Store.get('folders', { list: [] }).list || []; },
  saveFolders(l) { Store.set('folders', { list: l }); App.render(); },
  wk(k) { return Store.get('wk:' + k, { list: [] }).list || []; },
  active() { try { return JSON.parse(localStorage.getItem('mw-active')); } catch (e) { return null; } },
  setActive(a) { if (a) localStorage.setItem('mw-active', JSON.stringify(a)); else localStorage.removeItem('mw-active'); },
  name(id) { const e = this.byId[id]; return e ? e.n : id.replace(/_/g, ' '); },
  anim(id, cls = '') { return `<div class="anim ${cls}">${Rig.svg(id)}</div>`; },
  muscles(e) { return e ? e.pm.map(m => MUSCLE_DE[m] || m).join(', ') : ''; },
  filtered() {
    let list = this.ex || [];
    if (this.fm) list = list.filter(e => e.pm.includes(this.fm) || e.sm.includes(this.fm));
    if (this.fe) list = list.filter(e => e.eq === this.fe);
    const q = this.q.toLowerCase().trim();
    if (q) {
      const alts = [q], words = q.split(/\s+/); Object.entries(SYN).forEach(([de, en]) => { de = de.trim(); if (q === de || words.some(w => w.startsWith(de))) alts.push(...en.split('|')); });
      list = list.filter(e => { const n = e.n.toLowerCase(); return alts.some(a => n.includes(a)) || e.pm.some(m => (MUSCLE_DE[m] || '').toLowerCase().includes(q)); });
    }
    return list;
  },
  lastFor(id) {
    for (let i = 0; i < 6; i++) {
      const l = this.wk(addMonth(today().slice(0, 7), -i)).slice().sort((a, b) => b.start - a.start);
      for (const w of l) { const x = w.ex.find(e => e.id === id); if (x && x.sets.length) return x.sets; }
    }
    return null;
  },
  monthCounts(k) {
    const c = {}; let sets = 0, time = 0;
    const list = this.wk(k);
    list.forEach(w => { time += w.dur || 0; w.ex.forEach(x => { const e = this.byId[x.id], n = x.sets.length; sets += n; if (!e) return; e.pm.forEach(m => c[m] = (c[m] || 0) + n); e.sm.forEach(m => c[m] = (c[m] || 0) + n * .5); }); });
    return { c, sets, time, count: list.length };
  }
};

Views.training = {
  render() {
    Train.load();
    const a = Train.active();
    if (Train.sub === 'live' && a) return liveView(a);
    if (Train.sub === 'live') Train.sub = 'mappen';
    const tabs = [['mappen', 'Mappen', 'folder'], ['uebungen', 'Übungen', 'list'], ['verlauf', 'Verlauf', 'history'], ['koerper', 'Körper', 'body']];
    const banner = a ? `<button class="card hero" data-a="trLive" style="width:100%;justify-content:space-between;margin-bottom:14px;text-align:left"><span><b style="font-size:17px">Workout läuft: ${esc(a.name)}</b><br><span class="muted"><span class="livet">${fmtDur((Date.now() - a.start) / 1000)}</span> · ${a.ex.length} Übungen</span></span>${ic('play')}</button>` : '';
    let body = '';
    if (!Train.ex) body = '<p class="empty">Übungsdatenbank wird geladen …</p>';
    else if (Train.sub === 'mappen') body = Train.folderId ? folderView() : foldersView();
    else if (Train.sub === 'uebungen') body = libraryView();
    else if (Train.sub === 'verlauf') body = historyView();
    else body = bodyView();
    return `<div class="top"><h1>Training</h1></div>${banner}
      <div class="tabs">${tabs.map(([k, l, i]) => `<button data-a="trSub" data-v="${k}" aria-pressed="${Train.sub === k}">${ic(i)} ${l}</button>`).join('')}</div>${body}`;
  }
};

function foldersView() {
  const f = Train.folders();
  return `<div class="folders">${f.map(x => {
    const last = lastDone(x.id);
    return `<button class="folder" style="--fc:${x.color}" data-a="trFolder" data-v="${x.id}"><span class="tab"></span><h3>${esc(x.name)}</h3><span class="small">${x.ex.length} Übungen${last ? ' · zuletzt ' + (relDay(last) || parse(last).getDate() + '.' + (parse(last).getMonth() + 1) + '.') : ''}</span>
      <span class="row" style="gap:4px;margin-top:auto">${x.ex.slice(0, 4).map(id => Train.anim(id, 'sm')).join('')}</span></button>`;
  }).join('')}
    <button class="folder" data-a="trNewFolder" style="place-content:center;justify-items:center;border-style:dashed">${ic('plus')}<b>Neue Mappe</b><span class="small">z. B. „Push“, „Beine“, „Ganzkörper“</span></button></div>
    ${f.length ? '' : `<div class="card" style="margin-top:14px"><h3>Noch keine Mappen</h3><p class="small" style="margin:6px 0 10px">Lege eigene Mappen an oder starte mit drei Beispiel-Mappen, die du danach anpassen kannst.</p><button class="pri" data-a="trStarter">Beispiel-Mappen anlegen</button></div>`}
    <button style="margin-top:14px;width:100%" data-a="trStart" data-v="">${ic('play')} Freies Workout starten</button>`;
}
function lastDone(fid) {
  for (let i = 0; i < 3; i++) { const l = Train.wk(addMonth(today().slice(0, 7), -i)).filter(w => w.folderId === fid).sort((a, b) => b.start - a.start); if (l.length) return l[0].date; }
  return null;
}
function folderView() {
  const f = Train.folders().find(x => x.id === Train.folderId);
  if (!f) { Train.folderId = null; return foldersView(); }
  return `<div class="row" style="margin-bottom:12px"><button class="icon" data-a="trFolder" data-v="" aria-label="Zurück">${ic('left')}</button><h2 class="grow" style="margin:0;display:flex;gap:8px;align-items:center"><span class="dotc" style="background:${f.color};width:16px;height:16px"></span>${esc(f.name)}</h2><button class="icon" data-a="trEditFolder" aria-label="Mappe bearbeiten">${ic('edit')}</button></div>
    <button class="pri" style="width:100%;margin-bottom:12px" data-a="trStart" data-v="${f.id}" ${f.ex.length ? '' : 'disabled'}>${ic('play')} Workout starten</button>
    <div class="exlist">${f.ex.map((id, i) => `<div class="exrow"><span data-a="trDetail" data-v="${esc(id)}" style="cursor:pointer">${Train.anim(id, 'sm')}</span><span class="t" data-a="trDetail" data-v="${esc(id)}" style="cursor:pointer"><b>${esc(Train.name(id))}</b><span class="small">${esc(Train.muscles(Train.byId[id]))}</span></span>
      <span style="display:grid"><button class="x" data-a="trMove" data-v="${i}|-1" aria-label="Nach oben" ${i ? '' : 'disabled'}>${ic('up')}</button><button class="x" data-a="trMove" data-v="${i}|1" aria-label="Nach unten" ${i < f.ex.length - 1 ? '' : 'disabled'}>${ic('down')}</button></span><button class="x" data-a="trRemoveEx" data-v="${i}" aria-label="Entfernen">${ic('x')}</button></div>`).join('') || '<p class="empty">Diese Mappe ist noch leer.</p>'}</div>
    <button style="width:100%;margin-top:12px" data-a="trPick" data-v="${f.id}">${ic('plus')} Übungen hinzufügen</button>`;
}
function libraryView() {
  const list = Train.filtered(), pick = Train.pick;
  const target = pick === 'live' ? (Train.active() || {}).ex || [] : pick ? ((Train.folders().find(f => f.id === pick) || {}).ex || []) : null;
  const targetIds = target ? target.map(x => typeof x === 'string' ? x : x.id) : null;
  const muscles = Object.keys(MUSCLE_DE).sort((a, b) => MUSCLE_DE[a].localeCompare(MUSCLE_DE[b]));
  return `${pick ? `<div class="card hero row between" style="margin-bottom:12px"><b>Tippe auf + um Übungen ${pick === 'live' ? 'zum Workout' : 'zur Mappe'} hinzuzufügen</b><button class="pri" data-a="trPickDone">Fertig</button></div>` : ''}
    <div class="stack" style="margin-bottom:12px"><input id="exq" data-i="trQ" type="search" placeholder="Suchen: Kniebeuge, Bankdrücken, Po, Bizeps …" value="${esc(Train.q)}" autocomplete="off">
    <div class="row"><select data-c="trFm" aria-label="Muskel"><option value="">Alle Muskeln</option>${muscles.map(m => `<option value="${m}" ${Train.fm === m ? 'selected' : ''}>${MUSCLE_DE[m]}</option>`).join('')}</select>
    <select data-c="trFe" aria-label="Gerät"><option value="">Alle Geräte</option>${Object.entries(EQUIP_DE).map(([k, v]) => `<option value="${k}" ${Train.fe === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <p class="small">${list.length} von ${Train.ex.length} Übungen · Namen und Anleitungen sind auf Englisch</p></div>
    <div class="exlist">${list.slice(0, Train.limit).map(e => `<div class="exrow"><span data-a="trDetail" data-v="${esc(e.id)}" style="cursor:pointer">${Train.anim(e.id, 'sm')}</span><span class="t" data-a="trDetail" data-v="${esc(e.id)}" style="cursor:pointer"><b>${esc(e.n)}</b><span class="small">${esc(Train.muscles(e))} · ${esc(EQUIP_DE[e.eq] || e.eq)}</span></span>
      ${targetIds ? `<button class="icon ${targetIds.includes(e.id) ? 'pri' : 'pink'}" data-a="trToggle" data-v="${esc(e.id)}" aria-label="Hinzufügen">${ic(targetIds.includes(e.id) ? 'check' : 'plus')}</button>` : ''}</div>`).join('') || '<p class="empty">Keine Übung gefunden.</p>'}</div>
    ${list.length > Train.limit ? `<button style="width:100%;margin-top:12px" data-a="trMore">Mehr anzeigen (${list.length - Train.limit} weitere)</button>` : ''}`;
}
function monthNav(act) {
  return `<div class="row between" style="margin-bottom:12px"><button class="icon" data-a="${act}" data-v="-1" aria-label="Voriger Monat">${ic('left')}</button><h2 style="margin:0">${monthName(Train.month)}</h2><button class="icon" data-a="${act}" data-v="1" aria-label="Nächster Monat">${ic('right')}</button></div>`;
}
function historyView() {
  const list = Train.wk(Train.month).slice().sort((a, b) => b.start - a.start), s = Train.monthCounts(Train.month);
  return `${monthNav('trMonth')}
    <div class="portion" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:14px"><div><b>${s.count}</b><span>Workouts</span></div><div><b>${Math.round(s.time / 60)}</b><span>Minuten</span></div><div><b>${s.sets}</b><span>Sätze</span></div></div>
    <div class="card"><ul class="list">${list.map(w => `<li data-a="trShow" data-v="${w.id}" style="cursor:pointer"><span class="dotc" style="background:${(Train.folders().find(f => f.id === w.folderId) || {}).color || 'var(--pink)'}"></span><span class="t"><b>${esc(w.name)}</b><small>${fmtDate(w.date)} · ${fmtDur(w.dur)} · ${w.ex.reduce((a, x) => a + x.sets.length, 0)} Sätze</small></span>${ic('right')}</li>`).join('') || '<li class="empty">In diesem Monat noch kein Workout.</li>'}</ul></div>`;
}
function bodyView() {
  const s = Train.monthCounts(Train.month), entries = Object.entries(s.c).sort((a, b) => b[1] - a[1]), max = entries.length ? entries[0][1] : 1;
  const sel = Train.bodySel;
  let selInfo = '';
  if (sel) {
    const ex = {};
    Train.wk(Train.month).forEach(w => w.ex.forEach(x => { const e = Train.byId[x.id]; if (e && (e.pm.includes(sel) || e.sm.includes(sel))) ex[x.id] = (ex[x.id] || 0) + x.sets.length; }));
    const top = Object.entries(ex).sort((a, b) => b[1] - a[1]).slice(0, 5);
    selInfo = `<div class="card" style="margin-top:12px"><h3>${MUSCLE_DE[sel]}: ${num(s.c[sel] || 0, 1)} Sätze</h3>${top.length ? `<ul class="list">${top.map(([id, n]) => `<li><span class="t">${esc(Train.name(id))}</span><span class="num">${n} Sätze</span></li>`).join('')}</ul>` : `<p class="small">Diesen Monat noch nicht trainiert. Tipp: Suche unter „Übungen“ nach ${MUSCLE_DE[sel]}.</p><button style="margin-top:8px" data-a="trFindMuscle" data-v="${sel}">Übungen für ${MUSCLE_DE[sel]}</button>`}</div>`;
  }
  return `${monthNav('trMonth')}
    <div class="bodymap"><div class="card"><div class="row between" style="margin-bottom:8px"><span class="small">Je röter, desto mehr trainiert</span>${Body.sexSwitch()}</div>${Body.svg(s.c, sel)}<div class="legend" style="margin-top:8px"><span>wenig</span><i></i><span>viel</span></div><p class="small" style="margin-top:6px">Tippe auf einen Muskel für Details.</p></div>
    <div><div class="card"><h2>${entries.length ? 'Am meisten trainiert' : 'Noch keine Daten'}</h2>
    ${entries.length ? entries.map(([m, n]) => `<div class="macro" style="margin-bottom:10px;cursor:pointer" data-a="bodySel" data-v="${m}"><div class="row"><span>${MUSCLE_DE[m]}</span><span class="num">${num(n, 1)} Sätze</span></div><div class="bar"><i style="width:${n / max * 100}%;background:${Body.color(n / max)}"></i></div></div>`).join('') : '<p class="small">Sobald du Workouts abschließt, färbt sich der Körper: je dunkler, desto mehr Sätze für diesen Muskel. Hilfsmuskeln zählen halb.</p>'}
    </div>${selInfo}</div></div>`;
}

/* --- Live-Workout --- */
function liveView(a) {
  return `<div class="live row between"><div><h1 style="font-size:24px">${esc(a.name)}</h1><span class="sub" id="livet">${fmtDur((Date.now() - a.start) / 1000)}</span></div><button class="pri" data-a="trFinish">Beenden</button></div>
    <div class="stack" style="margin-top:6px">${a.ex.map((x, ei) => {
      const last = Train.lastFor(x.id);
      return `<section class="card"><div class="row" style="margin-bottom:8px"><span data-a="trDetail" data-v="${esc(x.id)}" style="cursor:pointer">${Train.anim(x.id, 'sm')}</span><div class="grow"><h3>${esc(Train.name(x.id))}</h3><span class="small">${last ? 'Letztes Mal: ' + last.map(s => `${num(s.r)}×${num(s.kg, 1)}kg`).join(', ') : esc(Train.muscles(Train.byId[x.id]))}</span></div><button class="x" data-a="trLiveRemove" data-v="${ei}" aria-label="Übung entfernen">${ic('trash')}</button></div>
      <table class="sets"><thead><tr><th>Satz</th><th>kg</th><th>Wdh.</th><th>✓</th></tr></thead><tbody>${x.sets.map((s, si) => `<tr class="${s.ok ? 'ok' : ''}"><td><b>${si + 1}</b></td>
        <td><input id="s-${ei}-${si}-kg" type="number" inputmode="decimal" step="0.5" min="0" value="${s.kg ?? ''}" data-c="trSet" data-v="${ei}|${si}|kg" aria-label="Gewicht"></td>
        <td><input id="s-${ei}-${si}-r" type="number" inputmode="numeric" min="0" value="${s.r ?? ''}" data-c="trSet" data-v="${ei}|${si}|r" aria-label="Wiederholungen"></td>
        <td><button class="chk" style="margin:auto" aria-pressed="${!!s.ok}" data-a="trSetOk" data-v="${ei}|${si}" aria-label="Satz erledigt">${s.ok ? ic('check') : ''}</button></td></tr>`).join('')}</tbody></table>
      <div class="row" style="margin-top:8px"><button class="grow" data-a="trAddSet" data-v="${ei}">${ic('plus')} Satz</button>${x.sets.length > 1 ? `<button data-a="trDelSet" data-v="${ei}">− Satz</button>` : ''}</div></section>`;
    }).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="grow" data-a="trPick" data-v="live">${ic('plus')} Übung hinzufügen</button></div>
    <button class="danger" style="width:100%;margin-top:8px" data-a="trCancel">Workout verwerfen</button>`;
}
function newSets(id) {
  const last = Train.lastFor(id);
  return last ? last.map(s => ({ r: s.r, kg: s.kg, ok: false })) : [{ r: 10, kg: '', ok: false }, { r: 10, kg: '', ok: false }, { r: 10, kg: '', ok: false }];
}
setInterval(() => { const a = Train.active(); if (!a) return; const t = fmtDur((Date.now() - a.start) / 1000); $$('#livet,.livet').forEach(el => el.textContent = t); }, 1000);

Actions.trSub = el => { Train.sub = el.dataset.v; Train.pick = null; App.render(); };
Actions.trLive = () => { Train.sub = 'live'; App.render(); scrollTo(0, 0); };
Actions.trFolder = el => { Train.folderId = el.dataset.v || null; App.render(); scrollTo(0, 0); };
Actions.trStarter = () => Train.saveFolders(STARTER.map(s => ({ id: uid(), ...clone(s) })));
Actions.trNewFolder = () => folderModal(null);
Actions.trEditFolder = () => folderModal(Train.folders().find(f => f.id === Train.folderId));
function folderModal(f) {
  let color = f ? f.color : FCOLORS[Train.folders().length % FCOLORS.length];
  App.modal(() => `${App.sheetHead(f ? 'Mappe bearbeiten' : 'Neue Mappe')}
    <form data-f="trFolder" class="stack"><label>Name<input name="name" id="fname" required value="${esc(f ? f.name : '')}" placeholder="z. B. Push Day" autocomplete="off" autofocus></label>
    <div><p class="small" style="margin-bottom:6px">Farbe</p><div class="colors">${FCOLORS.map(c => `<button type="button" data-a="trColor" data-v="${c}" aria-pressed="${c === color}" aria-label="Farbe"><i style="background:${c}"></i></button>`).join('')}</div></div>
    <input type="hidden" name="color" value="${color}"><input type="hidden" name="id" value="${f ? f.id : ''}">
    <div class="row">${f ? `<button type="button" class="danger" data-a="trDelFolder">${ic('trash')} Löschen</button>` : ''}<button class="pri grow">Speichern</button></div></form>`);
  Actions.trColor = el => { color = el.dataset.v; App.refreshModal(); };
}
Forms.trFolder = v => {
  const l = Train.folders();
  if (v.id) { const f = l.find(x => x.id === v.id); if (f) { f.name = v.name; f.color = v.color; } }
  else { const id = uid(); l.push({ id, name: v.name, color: v.color, ex: [] }); Train.folderId = id; }
  App.closeModal(); Train.saveFolders(l);
};
Actions.trDelFolder = () => { const id = Train.folderId; App.confirm('Mappe wirklich löschen? Dein Verlauf bleibt erhalten.', () => { Train.folderId = null; Train.saveFolders(Train.folders().filter(f => f.id !== id)); }); };
Actions.trMove = el => { const [i, d] = el.dataset.v.split('|').map(Number); const l = Train.folders(), f = l.find(x => x.id === Train.folderId); const j = i + d; if (!f || j < 0 || j >= f.ex.length) return; [f.ex[i], f.ex[j]] = [f.ex[j], f.ex[i]]; Train.saveFolders(l); };
Actions.trRemoveEx = el => { const l = Train.folders(), f = l.find(x => x.id === Train.folderId); if (f) { f.ex.splice(+el.dataset.v, 1); Train.saveFolders(l); } };
Actions.trPick = el => { Train.pick = el.dataset.v; Train.sub = 'uebungen'; App.render(); scrollTo(0, 0); };
Actions.trPickDone = () => { const p = Train.pick; Train.pick = null; if (p === 'live') Train.sub = 'live'; else { Train.sub = 'mappen'; Train.folderId = p; } App.render(); scrollTo(0, 0); };
Actions.trToggle = el => {
  const id = el.dataset.v, p = Train.pick;
  if (p === 'live') { const a = Train.active(); if (!a) return; const i = a.ex.findIndex(x => x.id === id); if (i >= 0) a.ex.splice(i, 1); else a.ex.push({ id, sets: newSets(id) }); Train.setActive(a); App.render(); return; }
  const l = Train.folders(), f = l.find(x => x.id === p); if (!f) return;
  const i = f.ex.indexOf(id); if (i >= 0) f.ex.splice(i, 1); else f.ex.push(id); Train.saveFolders(l);
};
Actions.trMore = () => { Train.limit += 60; App.render(); };
Changes.trQ = el => { Train.q = el.value; Train.limit = 40; App.render(); };
Changes.trFm = el => { Train.fm = el.value; Train.limit = 40; App.render(); };
Changes.trFe = el => { Train.fe = el.value; Train.limit = 40; App.render(); };
Actions.trFindMuscle = el => { Train.fm = el.dataset.v; Train.q = ''; Train.fe = ''; Train.sub = 'uebungen'; App.render(); scrollTo(0, 0); };
Actions.trMonth = el => { Train.month = addMonth(Train.month, +el.dataset.v); App.render(); };
Actions.bodySel = el => { Train.bodySel = Train.bodySel === el.dataset.v ? null : el.dataset.v; App.render(); };
Actions.trDetail = el => {
  const id = el.dataset.v;
  App.modal(() => {
    const e = Train.byId[id]; if (!e) return App.sheetHead('Übung') + '<p class="empty">Nicht gefunden.</p>';
    const fl = Train.folders();
    return `${App.sheetHead(esc(e.n))}${Train.anim(id)}
      <div class="chips" style="margin:12px 0"><span class="tag">${LVL_DE[e.l] || e.l}</span><span class="tag">${EQUIP_DE[e.eq] || e.eq}</span><span class="tag">${CAT_DE[e.c] || e.c}</span></div>
      <div class="card" style="padding:12px;margin-bottom:12px">${Body.svg(Body.forExercise(e), null, { mini: true, max: 1 })}
        <div class="musclekey"><span><i style="background:${Body.color(1)}"></i>Hauptmuskel</span><span><i style="background:${Body.color(.45)}"></i>Hilfsmuskel</span></div></div>
      <p><b>Hauptmuskeln:</b> ${e.pm.map(m => MUSCLE_DE[m]).join(', ')}${e.sm.length ? `<br><b>Hilfsmuskeln:</b> ${e.sm.map(m => MUSCLE_DE[m]).join(', ')}` : ''}</p>
      ${fl.length ? `<p class="small" style="margin:14px 0 6px">In Mappe speichern</p><div class="chips">${fl.map(f => `<button class="chip" data-a="trInFolder" data-v="${f.id}|${esc(id)}" aria-pressed="${f.ex.includes(id)}"><span class="dotc" style="background:${f.color}"></span> ${esc(f.name)}</button>`).join('')}</div>` : ''}
      <h3 style="margin:16px 0 6px">Anleitung <span class="small">(Englisch)</span></h3><ol style="margin:0;padding-left:20px;display:grid;gap:6px">${e.i.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
  });
};
Actions.trInFolder = el => { const [fid, id] = el.dataset.v.split('|'); const l = Train.folders(), f = l.find(x => x.id === fid); if (!f) return; const i = f.ex.indexOf(id); if (i >= 0) f.ex.splice(i, 1); else f.ex.push(id); Train.saveFolders(l); };
Actions.trStart = el => {
  if (Train.active()) { Train.sub = 'live'; App.render(); App.toast('Es läuft schon ein Workout.'); return; }
  const f = Train.folders().find(x => x.id === el.dataset.v);
  Train.setActive({ folderId: f ? f.id : '', name: f ? f.name : 'Freies Workout', start: Date.now(), ex: f ? f.ex.map(id => ({ id, sets: newSets(id) })) : [] });
  Train.sub = 'live'; App.go('training');
};
Changes.trSet = el => { const [ei, si, k] = el.dataset.v.split('|'); const a = Train.active(); if (!a) return; a.ex[+ei].sets[+si][k] = el.value === '' ? '' : +el.value; Train.setActive(a); };
Actions.trSetOk = el => { const [ei, si] = el.dataset.v.split('|').map(Number); const a = Train.active(); const s = a.ex[ei].sets[si]; s.ok = !s.ok; Train.setActive(a); if (s.ok && navigator.vibrate) navigator.vibrate(40); App.render(); };
Actions.trAddSet = el => { const a = Train.active(), x = a.ex[+el.dataset.v], l = x.sets[x.sets.length - 1] || { r: 10, kg: '' }; x.sets.push({ r: l.r, kg: l.kg, ok: false }); Train.setActive(a); App.render(); };
Actions.trDelSet = el => { const a = Train.active(); a.ex[+el.dataset.v].sets.pop(); Train.setActive(a); App.render(); };
Actions.trLiveRemove = el => { const a = Train.active(); a.ex.splice(+el.dataset.v, 1); Train.setActive(a); App.render(); };
Actions.trCancel = () => App.confirm('Workout verwerfen? Die Eingaben gehen verloren.', () => { Train.setActive(null); Train.sub = 'mappen'; App.render(); }, 'Verwerfen');
Actions.trFinish = () => {
  const a = Train.active(); if (!a) return;
  const ex = a.ex.map(x => ({ id: x.id, sets: x.sets.filter(s => s.ok).map(s => ({ r: +s.r || 0, kg: +s.kg || 0 })) })).filter(x => x.sets.length);
  if (!ex.length) { App.toast('Hake mindestens einen Satz ab (✓), um das Workout zu speichern.'); return; }
  const d = iso(new Date(a.start)), k = 'wk:' + d.slice(0, 7);
  const list = Train.wk(d.slice(0, 7)); list.push({ id: uid(), date: d, start: a.start, dur: Math.round((Date.now() - a.start) / 1000), name: a.name, folderId: a.folderId, ex });
  const w = list[list.length - 1];
  Store.set(k, { list }); Train.setActive(null); Train.sub = 'verlauf'; Train.month = d.slice(0, 7);
  App.render(); workoutSummary(w, true);
};
function workoutSummary(w, fresh) {
  App.modal(() => {
    const c = Body.forWorkout(w), sets = w.ex.reduce((a, x) => a + x.sets.length, 0), vol = w.ex.reduce((a, x) => a + x.sets.reduce((b, s) => b + s.r * s.kg, 0), 0);
    const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m]) => MUSCLE_DE[m]);
    return `${App.sheetHead(fresh ? 'Workout geschafft!' : esc(w.name))}
      <p class="small">${esc(w.name)} · ${fmtDate(w.date)}</p>
      <div class="sumstats"><div><b>${fmtDur(w.dur).replace(' Min', '′').replace(' Std ', 'h ')}</b><span>Dauer</span></div><div><b>${sets}</b><span>Sätze</span></div><div><b>${num(vol)}</b><span>kg bewegt</span></div></div>
      <div class="row between" style="margin-bottom:6px"><h3>Das hast du trainiert</h3>${Body.sexSwitch()}</div>
      <div class="card" style="padding:10px">${Body.svg(c, null, { mini: true })}<div class="legend" style="margin-top:6px"><span>wenig</span><i></i><span>viel</span></div></div>
      ${top.length ? `<p style="margin:10px 0">Am stärksten: <b>${top.join(', ')}</b></p>` : ''}
      <div class="stack">${w.ex.map(x => `<div class="exrow">${Train.anim(x.id, 'sm')}<span class="t"><b>${esc(Train.name(x.id))}</b><span class="small">${x.sets.map(s => `${num(s.r)} × ${num(s.kg, 1)} kg`).join(' · ')}</span></span></div>`).join('')}</div>
      ${fresh ? '<button class="pri" style="width:100%;margin-top:14px" data-a="closeModal">Fertig</button>' : `<button class="danger" style="width:100%;margin-top:14px" data-a="trDelWorkout" data-v="${w.id}">${ic('trash')} Workout löschen</button>`}`;
  });
}
Actions.trShow = el => {
  const w = Train.wk(Train.month).find(x => x.id === el.dataset.v); if (w) workoutSummary(w, false);
};
Actions.trShowOld = el => {
  const w = Train.wk(Train.month).find(x => x.id === el.dataset.v); if (!w) return;
  App.modal(() => `${App.sheetHead(esc(w.name))}<p class="small" style="margin-bottom:12px">${fmtDate(w.date)} · ${fmtDur(w.dur)}</p>
    <div class="stack">${w.ex.map(x => `<div class="exrow">${Train.anim(x.id, 'sm')}<span class="t"><b>${esc(Train.name(x.id))}</b><span class="small">${x.sets.map(s => `${num(s.r)} × ${num(s.kg, 1)} kg`).join(' · ')}</span></span></div>`).join('')}</div>
    <button class="danger" style="width:100%;margin-top:14px" data-a="trDelWorkout" data-v="${w.id}">${ic('trash')} Workout löschen</button>`);
};
Actions.trDelWorkout = el => { const id = el.dataset.v, k = Train.month; App.confirm('Dieses Workout aus dem Verlauf löschen?', () => { Store.set('wk:' + k, { list: Train.wk(k).filter(w => w.id !== id) }); App.render(); }); };
