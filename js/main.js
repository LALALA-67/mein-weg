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
let syncErr = '';
Views.einstellungen = {
  render() {
    const s = Settings.get(), c = Sync.cfg(), [dc, dl] = Sync.label();
    let sync;
    if (!c.url || !c.key) sync = `<p class="small" style="margin-bottom:10px">Damit Handy und Laptop dieselben Daten haben, verbinde die App mit deinem kostenlosen Supabase-Projekt. Trag die beiden Werte aus Supabase (Project Settings → API) ein.</p>
      <form data-f="syncCfg" class="stack"><label>Project URL<input name="url" placeholder="https://xxxx.supabase.co" autocomplete="off"></label><label>anon public Key<input name="key" placeholder="eyJhbGciOi…" autocomplete="off"></label><button class="pri">Verbinden</button></form>`;
    else if (!Sync.user) sync = `<p class="small" style="margin-bottom:10px">Melde dich an – auf jedem Gerät mit derselben E-Mail.</p>
      <form data-f="syncLogin" class="stack"><label>E-Mail<input name="email" type="email" autocomplete="email" required></label><label>Passwort<input name="pw" type="password" autocomplete="current-password" minlength="6" required></label>
      <div class="row"><button class="pri grow" name="mode" value="in">Anmelden</button><button class="grow" type="button" data-a="syncSignup">Konto erstellen</button></div></form>
      ${syncErr ? `<p class="small" style="color:#d64545;margin-top:8px">${esc(syncErr)}</p>` : ''}
      <button class="ghost" style="margin-top:6px" data-a="syncReset">Supabase-Verbindung ändern</button>`;
    else sync = `<p style="margin-bottom:10px">Angemeldet als <b>${esc(Sync.user.email)}</b></p>${Sync.state === 'err' ? `<p class="small" style="color:#d64545;margin-bottom:8px">${esc(Sync.msg)}</p>` : ''}
      <div class="row"><button class="grow" data-a="syncNow">${ic('sync')} Jetzt synchronisieren</button><button class="grow" data-a="syncOut">Abmelden</button></div>`;
    return `<div class="top"><h1>Einstellungen</h1></div><div class="cards">
      <div class="col"><section class="card"><h2>Design</h2><div class="seg" style="width:100%">${[['auto', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, l]) => `<button class="grow" data-a="theme" data-v="${k}" aria-pressed="${s.theme === k}">${l}</button>`).join('')}</div></section>
      <section class="card"><h2>Deine Tagesziele</h2><form data-f="goals" class="stack"><div class="formgrid">
        <label>Kalorien<input name="kcal" type="number" inputmode="numeric" min="800" max="6000" value="${s.goals.kcal}"></label>
        <label>Protein (g)<input name="p" type="number" inputmode="numeric" min="0" value="${s.goals.p}"></label>
        <label>Kohlenhydrate (g)<input name="c" type="number" inputmode="numeric" min="0" value="${s.goals.c}"></label>
        <label>Fett (g)<input name="f" type="number" inputmode="numeric" min="0" value="${s.goals.f}"></label>
        <label>Wasser (Gläser à 250 ml)<input name="water" type="number" inputmode="numeric" min="1" max="20" value="${s.water}"></label></div>
        <p class="small">Deine Makros ergeben ${num(s.goals.p * 4 + s.goals.c * 4 + s.goals.f * 9)} kcal (Protein & Kohlenhydrate 4 kcal/g, Fett 9 kcal/g).</p>
        <button class="pri">Ziele speichern</button></form></section></div>
      <div class="col"><section class="card"><div class="row between"><h2 style="margin:0">Sync Handy ↔ Laptop</h2><span class="status"><span class="dot ${dc}"></span>${dl}</span></div><div style="margin-top:12px">${sync}</div></section>
      <section class="card"><h2>Backup</h2><p class="small" style="margin-bottom:10px">Sichere alle Daten als Datei oder spiele ein Backup wieder ein.</p>
        <div class="row"><button class="grow" data-a="exportData">Backup herunterladen</button><label class="grow" style="display:block"><span class="sr" style="display:none">Backup laden</span><input type="file" accept="application/json,.json" data-c="importData" hidden><span style="display:flex;justify-content:center;align-items:center;min-height:44px;border-radius:14px;background:var(--card2);color:var(--ink);font-weight:800;cursor:pointer">Backup laden</span></label></div></section>
      <section class="card"><h2>Über die App</h2><p class="small">Produktdaten: Open Food Facts (ODbL). Übungen & Bilder: Free Exercise DB (Public Domain). Gesichts-Animationen: selbst gezeichnet.</p></section></div></div>`;
  }
};
Actions.theme = el => Settings.update(s => s.theme = el.dataset.v);
Forms.goals = v => { Settings.update(s => { s.goals = { kcal: +v.kcal || 2000, p: +v.p || 0, c: +v.c || 0, f: +v.f || 0 }; s.water = Math.max(1, +v.water || 8); }); App.toast('Ziele gespeichert'); };
Forms.syncCfg = async v => {
  if (!/^https:\/\/.+/.test(v.url) || v.key.length < 20) { App.toast('Bitte URL und Key genau aus Supabase kopieren.'); return; }
  localStorage.setItem('mw-cfg-url', v.url.replace(/\/$/, '')); localStorage.setItem('mw-cfg-key', v.key);
  await Sync.init(); App.render();
};
Forms.syncLogin = async (v, f) => {
  syncErr = '';
  try { await Sync.signIn(v.email, v.pw, f._signup); f._signup = false; App.toast('Angemeldet – Daten werden synchronisiert'); }
  catch (e) { syncErr = /Invalid login/i.test(e.message) ? 'E-Mail oder Passwort falsch.' : /confirm/i.test(e.message) ? 'Bitte bestätige zuerst deine E-Mail (Link im Postfach).' : e.message; }
  App.render();
};
Actions.syncSignup = async () => {
  const f = $('form[data-f="syncLogin"]'); if (!f.reportValidity()) return;
  const email = f.elements.email.value.trim(), pw = f.elements.pw.value;
  syncErr = '';
  try { const r = await Sync.signIn(email, pw, true); syncErr = r === 'confirm' ? 'Konto erstellt! Bestätige den Link in deiner E-Mail und melde dich dann hier an.' : ''; if (r === 'ok') App.toast('Konto erstellt und angemeldet'); }
  catch (e) { syncErr = e.message; }
  App.render();
};
Actions.syncNow = () => Sync.pull(false);
Actions.syncOut = async () => { await Sync.signOut(); App.render(); };
Actions.syncReset = () => { localStorage.removeItem('mw-cfg-url'); localStorage.removeItem('mw-cfg-key'); Sync.client = null; Sync.state = 'off'; App.render(); };
Actions.exportData = () => {
  const out = {}; Store.keys().forEach(k => out[k] = Store.raw(k));
  const blob = new Blob([JSON.stringify({ app: 'mein-weg', v: 1, at: new Date().toISOString(), data: out })], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `mein-weg-backup-${today()}.json`; document.body.appendChild(a); a.click(); a.remove();
};
Changes.importData = async el => {
  const f = el.files && el.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text()); if (j.app !== 'mein-weg') throw new Error();
    App.confirm('Backup einspielen? Gleichnamige Einträge werden überschrieben.', () => { Object.entries(j.data).forEach(([k, r]) => { Store.put(k, r.d, Date.now()); Sync.mark(k); }); App.applyTheme(); App.render(); App.toast('Backup geladen'); }, 'Einspielen');
  } catch (e) { App.toast('Das ist keine gültige Backup-Datei.'); }
};

App.start();
