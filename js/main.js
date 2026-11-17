'use strict';
/* ===== Heute-Seite, Einstellungen, Start ===== */
let editRoutine = false;
function greeting() { const h = new Date().getHours(); return h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend'; }
function glassSVG(full) { return `<svg viewBox="0 0 30 40" aria-hidden="true"><path d="M4 3h22l-3 34H7z" fill="${full ? 'var(--water)' : 'none'}" stroke="var(--water)" stroke-width="2.2" stroke-linejoin="round" opacity="${full ? 1 : .45}"/></svg>`; }

Views.heute = {
  render() {
    const s = Settings.get(), d = Day.get(), evs = Cal.on(App.date);
    const items = [...s.routine.map(r => ({ t: r, done: !!d.routine[r], r: 1 })), ...d.todos.map((t, i) => ({ ...t, i }))];
    const open = items.filter(x => !x.done).length;
    const wk = Train.wk(App.date.slice(0, 7)).filter(w => w.date === App.date);
    const fl = Face.log(App.date.slice(0, 7)).filter(x => x.date === App.date);
    const isToday = App.date === today();
    return `<div class="top"><div><h1>${isToday ? greeting() + '!' : esc(relDay(App.date) || 'Dein Tag')}</h1><div class="sub">${fmtDate(App.date)}</div></div>
      <div class="row">${App.dateNav()}<button class="icon hide-d" data-a="go" data-v="einstellungen" aria-label="Einstellungen">${ic('set')}</button></div></div>
    <div class="qa" style="margin-bottom:14px"><button data-a="quickScan">${ic('scan')}<span>Essen scannen</span></button><button data-a="go" data-v="training">${ic('training')}<span>Training</span></button><button data-a="go" data-v="gesicht">${ic('gesicht')}<span>Gesicht</span></button></div>
    <div class="cards">
      <div class="col">${Food.summaryCard(d)}
        <section class="card"><div class="row between"><h2 style="margin:0">Wasser</h2><span class="num" style="font-weight:800">${num(d.water * .25, 2)} / ${num(s.water * .25, 2)} l</span></div>
          <div class="glasses">${Array.from({ length: Math.max(s.water, d.water) }, (_, i) => `<button data-a="waterSet" data-v="${i + 1}" aria-label="${i + 1} Gläser">${glassSVG(i < d.water)}</button>`).join('')}</div>
          <div class="row"><button data-a="water" data-v="-1" aria-label="Ein Glas weniger">−</button><button class="pri grow" data-a="water" data-v="1">${ic('drop')} + 1 Glas (250 ml)</button></div></section>
        <section class="card"><h2>Bewegung & Pflege</h2><ul class="list">
          <li><span class="t"><b>Training</b><small>${wk.length ? wk.map(w => esc(w.name) + ' · ' + fmtDur(w.dur)).join(', ') : 'Noch kein Workout'}</small></span><button data-a="go" data-v="training">${wk.length ? ic('check') : 'Los'}</button></li>
          <li><span class="t"><b>Gesichts-Workout</b><small>${fl.length ? fl.map(x => esc(x.name)).join(', ') : 'Noch nicht gemacht'}</small></span><button data-a="go" data-v="gesicht">${fl.length ? ic('check') : 'Los'}</button></li></ul></section>
        ${weightCard()}
      </div>
      <div class="col">
        <section class="card"><div class="row between"><h2 style="margin:0">${isToday ? 'Heute' : 'Termine'} im Kalender</h2><button class="icon pink" data-a="todayEvent" aria-label="Termin hinzufügen">${ic('plus')}</button></div>
          <ul class="list agenda" style="margin-top:6px">${evs.map(e => `<li data-a="calEv" data-v="${e.id}" style="cursor:pointer"><span class="dotc" style="background:${Cal.color(e)}"></span><span class="tm num">${e.allDay ? 'Ganztägig' : e.start + '–' + e.end}</span><span class="t"><b>${esc(e.title)}</b><small>${Cal.catName(e)}</small></span></li>`).join('') || '<li class="empty">Keine Termine an diesem Tag.</li>'}</ul>
          ${upcomingTests()}</section>
        <section class="card"><div class="row between"><h2 style="margin:0">Tagesplan</h2><span class="small">${open} offen</span></div>
          <ul class="list" style="margin-top:6px">${items.map(x => `<li class="${x.done ? 'done' : ''}"><button class="chk" aria-pressed="${!!x.done}" aria-label="Erledigt" data-a="${x.r ? 'rtToggle' : 'tdToggle'}" data-v="${esc(x.r ? x.t : x.i)}">${x.done ? ic('check') : ''}</button><span class="t">${esc(x.t)}${x.r ? ' <span class="tag">täglich</span>' : ''}</span>${x.r ? '' : `<button class="x" data-a="tdDel" data-v="${x.i}" aria-label="Löschen">${ic('x')}</button>`}</li>`).join('') || '<li class="empty">Noch nichts geplant.</li>'}</ul>
          <form data-f="todo" class="row" style="margin-top:8px"><input name="t" id="todoin" placeholder="Neue Aufgabe" autocomplete="off"><button class="pri icon" aria-label="Hinzufügen">${ic('plus')}</button></form>
          <button class="ghost" style="margin-top:4px" data-a="editRoutine">${editRoutine ? 'Fertig' : 'Tägliche Routine bearbeiten'}</button>
          ${editRoutine ? `<ul class="list">${s.routine.map((r, i) => `<li><span class="t">${esc(r)}</span><button class="x" data-a="rtDel" data-v="${i}" aria-label="Entfernen">${ic('x')}</button></li>`).join('')}</ul><form data-f="routine" class="row"><input name="t" id="rtin" placeholder="Jeden Tag: …" autocomplete="off"><button class="icon" aria-label="Hinzufügen">${ic('plus')}</button></form>` : ''}
        </section>
      </div>
    </div>
    <p class="status syncst hide-d" style="margin-top:14px" data-a="syncInfo"></p>`;
  }
};
function weightCard() {
  const l = (Store.get('weight', { list: [] }).list || []).slice().sort((a, b) => a.d.localeCompare(b.d)), last = l[l.length - 1], prev = l[l.length - 2];
  const recent = l.slice(-30), goal = +Settings.get().goalWeight || 0;
  let chart = '';
  if (recent.length > 1) {
    const vs = recent.map(x => x.kg), lo = Math.min(...vs, goal || Infinity) - .5, hi = Math.max(...vs, goal || -Infinity) + .5, W = 300, H = 80;
    const x = i => 6 + i * (W - 12) / (recent.length - 1), y = v => H - 6 - (v - lo) / (hi - lo) * (H - 12);
    chart = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;margin-top:8px">${goal ? `<line x1="0" x2="${W}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}" stroke="var(--mute)" stroke-dasharray="4 4"/><text x="${W - 4}" y="${(y(goal) - 3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--mute)">Ziel ${num(goal, 1)}</text>` : ''}
      <path d="${recent.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(r.kg).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--acc)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${recent.map((r, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(r.kg).toFixed(1)}" r="2.6" fill="var(--acc)"/>`).join('')}</svg>`;
  }
  const diff = last && prev ? last.kg - prev.kg : 0;
  return `<section class="card"><div class="row between"><h2 style="margin:0">Körpergewicht</h2>${last ? `<span class="num" style="font-weight:700">${num(last.kg, 1)} kg ${prev ? `<span class="small">${diff > 0 ? '+' : ''}${num(diff, 1)}</span>` : ''}</span>` : ''}</div>
    ${chart}<form data-f="weight" class="row" style="margin-top:10px"><input id="wkg" name="kg" type="number" inputmode="decimal" step="0.1" min="20" max="400" placeholder="${last ? num(last.kg, 1) : 'z. B. 62,5'} kg" required><button class="pri">Eintragen</button></form>
    <p class="small" style="margin-top:6px">${l.length ? `${l.length} Einträge · gilt für ${relDay(App.date) || fmtDate(App.date)}` : 'Trag am besten morgens nach dem Aufstehen ein – dann sind die Werte vergleichbar.'}</p></section>`;
}
Forms.weight = v => { const kg = Math.round(parseFloat(String(v.kg).replace(',', '.')) * 10) / 10; if (!(kg > 20 && kg < 400)) return; const l = (Store.get('weight', { list: [] }).list || []).filter(x => x.d !== App.date); l.push({ d: App.date, kg }); Store.set('weight', { list: l }); App.render(); App.toast('Gewicht gespeichert'); };
function upcomingTests() {
  const t = today(), l = Cal.events().filter(e => e.cat === 'test' && e.date > App.date && e.date >= t).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  if (!l.length) return '';
  return `<div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)"><p class="small" style="font-weight:800;margin-bottom:4px">Nächste Tests</p>${l.map(e => { const n = Math.round((parse(e.date) - parse(t)) / 864e5); return `<div class="row between" style="font-size:14px;padding:2px 0"><span>${esc(e.title)}</span><span class="tag">${n === 1 ? 'morgen' : 'in ' + n + ' Tagen'}</span></div>`; }).join('')}</div>`;
}
Actions.quickScan = () => { const h = new Date().getHours(); openFood(h < 11 ? 'fruehstueck' : h < 15 ? 'mittag' : h < 21 ? 'abend' : 'snacks', 'scan'); };
Actions.water = el => Day.update(d => d.water = Math.max(0, d.water + +el.dataset.v));
Actions.waterSet = el => Day.update(d => { const n = +el.dataset.v; d.water = d.water === n ? n - 1 : n; });
Actions.rtToggle = el => Day.update(d => d.routine[el.dataset.v] = !d.routine[el.dataset.v]);
Actions.tdToggle = el => Day.update(d => d.todos[+el.dataset.v].done = !d.todos[+el.dataset.v].done);
Actions.tdDel = el => Day.update(d => d.todos.splice(+el.dataset.v, 1));
Actions.editRoutine = () => { editRoutine = !editRoutine; App.render(); };
Actions.rtDel = el => Settings.update(s => s.routine.splice(+el.dataset.v, 1));
Actions.todayEvent = () => { Cal.at = App.date; const m = Math.min((new Date().getHours() + 1) * 60, 23 * 60); openEvent({ id: uid(), isNew: true, title: '', date: App.date, allDay: false, start: toTime(m), end: toTime(Math.min(m + 60, 1439)), cat: 'termin', note: '' }); };
Forms.todo = (v, f) => { if (!v.t) return; Day.update(d => d.todos.push({ t: v.t, done: false })); const i = $('#todoin'); if (i) { i.value = ''; i.focus(); } };
Forms.routine = v => { if (!v.t) return; Settings.update(s => { if (!s.routine.includes(v.t)) s.routine.push(v.t); }); const i = $('#rtin'); if (i) { i.value = ''; i.focus(); } };

/* ===== Einstellungen ===== */
Views.einstellungen = {
  render() {
    const s = Settings.get(), c = Sync.cfg(), [dc, dl] = Sync.label();
    const sync = Sync.user ? `<p style="margin-bottom:10px">Angemeldet als <b>${esc(Sync.user.email)}</b></p>${Sync.state === 'err' ? `<p class="small" style="color:#d64545;margin-bottom:8px">${esc(Sync.msg)}</p>` : ''}
      <div class="row"><button class="grow" data-a="syncNow">${ic('sync')} Jetzt synchronisieren</button><button class="grow" data-a="syncOut">Abmelden</button></div>`
      : `<p class="small">Der Server für Konten ist noch nicht eingerichtet – deine Daten bleiben vorerst auf diesem Gerät.</p>`;
    return `<div class="top"><h1>Einstellungen</h1></div><div class="cards">
      <div class="col"><section class="card"><h2>Design</h2><div class="seg" style="width:100%">${[['dark', 'Nacht'], ['light', 'Nebel'], ['auto', 'Automatisch']].map(([k, l]) => `<button class="grow" data-a="theme" data-v="${k}" aria-pressed="${s.theme === k}">${l}</button>`).join('')}</div>
        <div class="row between" style="margin-top:14px"><span><b>Regen & Gewitter</b><br><span class="small">Animierter Regen und ab und zu ein Blitz</span></span><button class="chk" style="width:52px;border-radius:99px" data-a="rainToggle" aria-pressed="${FX.on}" aria-label="Regen an/aus">${FX.on ? ic('check') : ''}</button></div></section>
      <section class="card"><h2>Benachrichtigungen</h2>${Push.box()}</section>
      <section class="card"><h2>Dein Körper</h2><p class="small" style="margin-bottom:10px">Für die Körperkarte nach dem Training und im Monatsrückblick.</p>${Body.sexSwitch()}</section>
      <section class="card"><h2>App installieren</h2>${installBox()}</section>
      <section class="card"><h2>Deine Tagesziele</h2><form data-f="goals" class="stack"><div class="formgrid">
        <label>Kalorien<input name="kcal" type="number" inputmode="numeric" min="800" max="6000" value="${s.goals.kcal}"></label>
        <label>Protein (g)<input name="p" type="number" inputmode="numeric" min="0" value="${s.goals.p}"></label>
        <label>Kohlenhydrate (g)<input name="c" type="number" inputmode="numeric" min="0" value="${s.goals.c}"></label>
        <label>Fett (g)<input name="f" type="number" inputmode="numeric" min="0" value="${s.goals.f}"></label>
        <label>Wasser (Gläser à 250 ml)<input name="water" type="number" inputmode="numeric" min="1" max="20" value="${s.water}"></label>
        <label>Zielgewicht (kg, optional)<input name="goalWeight" type="number" inputmode="decimal" step="0.1" value="${s.goalWeight || ''}"></label></div>
        <p class="small">Deine Makros ergeben ${num(s.goals.p * 4 + s.goals.c * 4 + s.goals.f * 9)} kcal (Protein & Kohlenhydrate 4 kcal/g, Fett 9 kcal/g).</p>
        <button class="pri">Ziele speichern</button></form></section></div>
      <div class="col"><section class="card"><div class="row between"><h2 style="margin:0">Konto & Sync</h2><span class="status"><span class="dot ${dc}"></span>${dl}</span></div><div style="margin-top:12px">${sync}</div></section>
      <section class="card"><h2>Journal-PIN</h2>${Journal.pinSet() ? '<p class="small" style="margin-bottom:10px">Dein Journal ist auf diesem Gerät mit einer PIN geschützt.</p><button style="width:100%" data-a="jPinOff">PIN entfernen</button>'
        : '<p class="small" style="margin-bottom:10px">Schütze dein Journal auf diesem Gerät zusätzlich mit einer PIN (4–8 Ziffern).</p><form data-f="jPin" class="row"><input id="jpinset" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" placeholder="Neue PIN" required autocomplete="off"><button class="pri">Setzen</button></form>'}</section>
      <section class="card"><h2>Server-Sicherungen</h2><p class="small" style="margin-bottom:10px">Jede Nacht wird automatisch eine Kopie all deiner Daten auf dem Server gespeichert (14 Tage lang). Falls mal etwas verloren geht, kannst du einen Stand zurückholen.</p>
        ${Backups.list ? (Backups.list.length ? `<ul class="list">${Backups.list.map(b => `<li><span class="t"><b>${fmtDate(b.day)}</b><small>${b.n} Einträge</small></span><button data-a="bkRestore" data-v="${b.day}">Zurückholen</button></li>`).join('')}</ul>` : '<p class="small">Noch keine Sicherung vorhanden – die erste entsteht heute Nacht.</p>') : `<button style="width:100%" data-a="bkLoad" ${Sync.user ? '' : 'disabled'}>Sicherungen anzeigen</button>`}</section>
      <section class="card"><h2>Backup</h2><p class="small" style="margin-bottom:10px">Sichere alle Daten als Datei oder spiele ein Backup wieder ein.</p>
        <div class="row"><button class="grow" data-a="exportData">Backup herunterladen</button><label class="grow" style="display:block"><span class="sr" style="display:none">Backup laden</span><input type="file" accept="application/json,.json" data-c="importData" hidden><span style="display:flex;justify-content:center;align-items:center;min-height:44px;border-radius:14px;background:var(--card2);color:var(--ink);font-weight:800;cursor:pointer">Backup laden</span></label></div></section>
      <section class="card"><h2>Über die App</h2><p class="small">Produktdaten: Open Food Facts (ODbL). Übungen & Bilder: Free Exercise DB (Public Domain). Gesichts-Animationen: selbst gezeichnet.</p></section></div></div>`;
  }
};
Actions.theme = el => Settings.update(s => s.theme = el.dataset.v);
Forms.jPin = async v => { if (!/^\d{4,8}$/.test(v.pin || '')) { App.toast('4–8 Ziffern'); return; } localStorage.setItem('mw-jpin', await Journal.hash(v.pin)); Journal.unlocked = true; App.render(); App.toast('PIN gesetzt'); };
Actions.jPinOff = () => App.confirm('PIN für das Journal auf diesem Gerät entfernen?', () => { localStorage.removeItem('mw-jpin'); App.render(); }, 'Entfernen');
const Backups = { list: null };
Actions.bkLoad = async () => {
  const { data, error } = await Sync.client.from('kv_backup').select('day').order('day', { ascending: false }).limit(5000);
  if (error) { App.toast('Konnte Sicherungen nicht laden: ' + error.message); return; }
  const c = {}; (data || []).forEach(r => c[r.day] = (c[r.day] || 0) + 1);
  Backups.list = Object.entries(c).map(([day, n]) => ({ day, n })); App.render();
};
Actions.bkRestore = el => { const day = el.dataset.v; App.confirm(`Stand vom ${fmtDate(day)} zurückholen? Neuere Änderungen an denselben Bereichen werden überschrieben.`, async () => {
  const { data, error } = await Sync.client.from('kv_backup').select('key,data').eq('day', day);
  if (error) { App.toast('Fehler: ' + error.message); return; }
  (data || []).forEach(r => { Store.put(r.key, r.data, Date.now()); Sync.mark(r.key); });
  App.applyTheme(); App.render(); App.toast(`${(data || []).length} Bereiche wiederhergestellt`);
}, 'Zurückholen'); };
Actions.rainToggle = () => Settings.update(s => s.rain = !FX.on);
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (App.tab === 'einstellungen') App.render(); });
addEventListener('appinstalled', () => { installEvt = null; App.toast('App installiert!'); });
function installBox() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return '<p class="small">Du benutzt gerade die installierte App. ✓</p>';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (installEvt) return '<p class="small" style="margin-bottom:10px">Installiere The Lore als eigene App – mit Symbol, eigenem Fenster und ohne Browser-Leiste.</p><button class="pri" style="width:100%" data-a="install">App installieren</button>';
  if (ios) return '<p class="small">iPhone: Öffne diese Seite in <b>Safari</b>, tippe unten auf <b>Teilen</b> (Quadrat mit Pfeil) und dann auf <b>„Zum Home-Bildschirm“</b>.</p>';
  return '<p class="small">Laptop (Chrome/Edge): Klick rechts in der Adressleiste auf das Symbol <b>„App installieren“</b> (Bildschirm mit Pfeil) oder im Menü ⋮ auf <b>„The Lore installieren“</b>.<br>Android (Chrome): Menü ⋮ → <b>„App installieren“</b>.</p>';
}
Actions.install = async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; App.render(); };
Forms.goals = v => { Settings.update(s => { s.goals = { kcal: +v.kcal || 2000, p: +v.p || 0, c: +v.c || 0, f: +v.f || 0 }; s.water = Math.max(1, +v.water || 8); s.goalWeight = parseFloat(String(v.goalWeight || '').replace(',', '.')) || 0; }); App.toast('Ziele gespeichert'); };
Actions.syncNow = () => Sync.pull(false);
Actions.syncOut = () => App.confirm('Abmelden? Deine Daten bleiben sicher in deinem Konto gespeichert.', () => Sync.signOut(), 'Abmelden');
Actions.exportData = () => {
  const out = {}; Store.keys().forEach(k => out[k] = Store.raw(k));
  const blob = new Blob([JSON.stringify({ app: 'the-lore', v: 1, at: new Date().toISOString(), data: out })], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `the-lore-backup-${today()}.json`; document.body.appendChild(a); a.click(); a.remove();
};
Changes.importData = async el => {
  const f = el.files && el.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text()); if ((j.app !== 'the-lore' && j.app !== 'mein-weg')) throw new Error();
    App.confirm('Backup einspielen? Gleichnamige Einträge werden überschrieben.', () => { Object.entries(j.data).forEach(([k, r]) => { Store.put(k, r.d, Date.now()); Sync.mark(k); }); App.applyTheme(); App.render(); App.toast('Backup geladen'); }, 'Einspielen');
  } catch (e) { App.toast('Das ist keine gültige Backup-Datei.'); }
};

/* ===== Anmelden / Registrieren ===== */
const AUTH_ERR = [[/invalid login/i, 'E-Mail oder Passwort falsch.'], [/not confirmed/i, 'Bitte bestätige zuerst deine E-Mail – der Link ist in deinem Postfach.'], [/already registered|already been registered/i, 'Diese E-Mail ist schon registriert. Melde dich an.'],
  [/at least 6|weak/i, 'Das Passwort muss mindestens 6 Zeichen haben.'], [/rate limit|too many|security purposes/i, 'Zu viele Versuche – bitte warte ein paar Minuten.'], [/fetch|network/i, 'Keine Verbindung. Bist du online?'], [/invalid.*email|email.*invalid/i, 'Bitte gib eine gültige E-Mail-Adresse ein.']];
const authErr = e => { const m = (e && e.message) || String(e); const f = AUTH_ERR.find(([r]) => r.test(m)); return f ? f[1] : m; };
const Auth = {
  mode: 'login', err: '', msg: '', busy: false, email: '',
  render() {
    let body;
    if (!Sync.client && Sync.state === 'init') body = '<p class="empty" style="text-align:center">Lädt …</p>';
    else if (!Sync.client) body = `<p style="margin-bottom:12px">${esc(Sync.msg || 'Keine Verbindung zum Server.')}</p><button class="pri" style="width:100%" data-a="authRetry">Nochmal versuchen</button>`;
    else if (Sync.recovery) body = `<form data-f="authNewPw" class="stack"><h2 style="margin:0">Neues Passwort</h2><label>Neues Passwort<input id="anpw" name="pw" type="password" autocomplete="new-password" minlength="6" required></label><button class="pri" ${this.busy ? 'disabled' : ''}>Passwort speichern</button></form>`;
    else if (this.mode === 'reset') body = `<form data-f="authReset" class="stack"><h2 style="margin:0">Passwort vergessen</h2><p class="small">Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.</p><label>E-Mail<input id="aemail" name="email" type="email" autocomplete="email" required value="${esc(Auth.email || '')}"></label><button class="pri" ${this.busy ? 'disabled' : ''}>Link senden</button><button type="button" class="ghost" data-a="authMode" data-v="login">Zurück zur Anmeldung</button></form>`;
    else {
      const reg = this.mode === 'register';
      body = `<div class="seg" style="width:100%;margin-bottom:14px"><button class="grow" data-a="authMode" data-v="login" aria-pressed="${!reg}">Anmelden</button><button class="grow" data-a="authMode" data-v="register" aria-pressed="${reg}">Registrieren</button></div>
        <form data-f="authLogin" class="stack"><label>E-Mail<input id="aemail" name="email" type="email" autocomplete="email" required value="${esc(Auth.email || '')}"></label>
        <label>Passwort<input id="apw" name="pw" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" minlength="6" required></label>
        ${reg ? '<label>Passwort wiederholen<input id="apw2" name="pw2" type="password" autocomplete="new-password" minlength="6" required></label>' : ''}
        <button class="pri" ${this.busy ? 'disabled' : ''}>${this.busy ? 'Einen Moment …' : reg ? 'Konto erstellen' : 'Anmelden'}</button>
        ${reg ? '' : '<button type="button" class="ghost" data-a="authMode" data-v="reset">Passwort vergessen?</button>'}</form>`;
    }
    return `<div class="authwrap"><div class="authcard">${LOGO}<h1 style="margin-bottom:18px">The Lore</h1>
      ${this.err ? `<p class="amsg err">${esc(this.err)}</p>` : ''}${this.msg ? `<p class="amsg">${esc(this.msg)}</p>` : ''}${body}</div></div>`;
  }
};
Actions.authMode = el => { Auth.mode = el.dataset.v; Auth.err = ''; Auth.msg = ''; App.render(); };
Actions.authRetry = () => { Sync.state = 'init'; App.render(); Sync.init(); };
Forms.authLogin = async v => {
  const reg = Auth.mode === 'register';
  Auth.err = ''; Auth.msg = ''; Auth.email = v.email;
  if (reg && v.pw !== v.pw2) { Auth.err = 'Die Passwörter stimmen nicht überein.'; App.render(); return; }
  Auth.busy = true; App.render();
  try {
    const r = await Sync.signIn(v.email, v.pw, reg);
    if (r === 'confirm') { Auth.mode = 'login'; Auth.msg = `Fast geschafft! Wir haben dir eine E-Mail an ${v.email} geschickt. Klick auf den Link darin, dann bist du angemeldet.`; }
  } catch (e) { Auth.err = authErr(e); }
  Auth.busy = false; App.render();
};
Forms.authReset = async v => {
  Auth.err = ''; Auth.busy = true; App.render();
  try { await Sync.resetPw(v.email); Auth.mode = 'login'; Auth.msg = 'Falls ein Konto existiert, ist der Link unterwegs. Schau in dein Postfach.'; }
  catch (e) { Auth.err = authErr(e); }
  Auth.busy = false; App.render();
};
Forms.authNewPw = async v => {
  Auth.err = ''; Auth.busy = true; App.render();
  try { await Sync.updatePw(v.pw); Auth.msg = ''; App.toast('Neues Passwort gespeichert'); }
  catch (e) { Auth.err = authErr(e); }
  Auth.busy = false; App.render();
};

App.start();
FX.init();
Push.init();
