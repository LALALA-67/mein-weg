'use strict';
/* ===== Journal: Tagebuch mit Mondphasen-Stimmung, Impuls des Tages, Dankbarkeit, Tags, Suche, optionaler PIN ===== */
const MOODS = [[1, 'Schwer'], [2, 'Mies'], [3, 'Okay'], [4, 'Gut'], [5, 'Großartig']];
const PROMPTS = [
  'Was hat dich heute zum Lächeln gebracht?', 'Welcher Moment heute war es wert, aufgeschrieben zu werden?', 'Was hast du heute über dich gelernt?',
  'Worauf bist du heute stolz – auch wenn es klein ist?', 'Was hat dir heute Energie geraubt, und was hat sie zurückgegeben?', 'Wem bist du heute dankbar und warum?',
  'Was würdest du deinem Ich von vor einem Jahr sagen?', 'Welche Sorge darf heute Nacht hier bleiben, statt mit dir ins Bett zu gehen?', 'Was willst du morgen anders machen?',
  'Beschreibe den heutigen Tag in drei Worten.', 'Was hat dich heute überrascht?', 'Welches Gespräch geht dir noch durch den Kopf?',
  'Was hast du heute für deinen Körper getan?', 'Was hat dich heute herausgefordert?', 'Wofür hättest du dir heute mehr Zeit gewünscht?',
  'Welches Lied passt zu deinem Tag?', 'Was ist gerade dein größtes Ziel – und welcher kleine Schritt kam heute dazu?', 'Wann hast du dich heute am meisten wie du selbst gefühlt?',
  'Was möchtest du loslassen?', 'Was war heute schöner als erwartet?', 'Welche Gewohnheit tut dir gerade gut?', 'Wen würdest du gern wiedersehen?',
  'Was ist ein Geheimnis, das nur dein Tagebuch kennen darf?', 'Wie hast du heute mit Stress umgehen können?', 'Was gibt dir gerade Hoffnung?',
  'Welche Erinnerung kam dir heute in den Sinn?', 'Was hat dich heute inspiriert?', 'Worüber hast du heute gelacht?', 'Was brauchst du gerade am meisten?',
  'Wenn heute ein Kapitel in deinem Buch wäre – wie hieße es?'
];
const Journal = {
  date: today(), q: '', unlocked: false,
  key(d) { return 'jr:' + d.slice(0, 7); },
  month(k) { return (Store.get('jr:' + k, { entries: {} }).entries) || {}; },
  get(d) { return { mood: 0, text: '', grat: ['', '', ''], tags: [], ...(this.month(d.slice(0, 7))[d] || {}) }; },
  set(d, fn, render = true) {
    const k = d.slice(0, 7), all = clone(this.month(k)), e = { ...this.get(d) }; fn(e); e.t = Date.now();
    const empty = !e.mood && !e.text.trim() && !e.grat.some(Boolean) && !e.tags.length;
    if (empty) delete all[d]; else all[d] = e;
    Store.set('jr:' + k, { entries: all }); if (render) App.render();
  },
  prompt(d) { const n = parse(d).getTime() / 864e5 | 0; return PROMPTS[((n % PROMPTS.length) + PROMPTS.length) % PROMPTS.length]; },
  allEntries() {
    const out = [];
    Store.keys().filter(k => k.startsWith('jr:')).forEach(k => { const m = (Store.get(k, {}).entries) || {}; Object.entries(m).forEach(([d, e]) => out.push({ d, ...e })); });
    return out.sort((a, b) => b.d.localeCompare(a.d));
  },
  streak() { let n = 0, d = today(); if (!this.month(d.slice(0, 7))[d]) d = addDays(d, -1); while (this.month(d.slice(0, 7))[d] && n < 999) { n++; d = addDays(d, -1); } return n; },
  allTags() { const s = new Set(); this.allEntries().forEach(e => (e.tags || []).forEach(t => s.add(t))); return [...s].sort(); },
  pinSet() { return !!localStorage.getItem('mw-jpin'); },
  async hash(p) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('the-lore:' + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
};
function moonSVG(level, size = 34) {
  // 0 = Neumond … 5 = Vollmond
  const lit = ['#2a3036', '#ebe5d6'], r = 15, cx = [0, 20, 27, 0, 44, 0][level];
  const shadow = level >= 5 ? '' : level === 3 ? `<rect x="17" y="2" width="15" height="30" fill="${lit[0]}"/>` : `<circle cx="${cx}" cy="17" r="${r}" fill="${lit[0]}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 34 34" aria-hidden="true"><defs><clipPath id="mc${level}"><circle cx="17" cy="17" r="${r}"/></clipPath></defs>
    <circle cx="17" cy="17" r="${r + 1}" fill="#0b0e11"/><g clip-path="url(#mc${level})"><circle cx="17" cy="17" r="${r}" fill="${level ? lit[1] : lit[0]}"/>${level ? shadow : ''}</g>
    <circle cx="17" cy="17" r="${r}" fill="none" stroke="rgba(255,255,255,.18)"/></svg>`;
}
function moodChart() {
  const days = Array.from({ length: 30 }, (_, i) => addDays(today(), i - 29)), vals = days.map(d => Journal.get(d).mood || null);
  if (!vals.some(Boolean)) return '<p class="small">Sobald du ein paar Tage Stimmung einträgst, siehst du hier deinen Verlauf.</p>';
  const W = 300, H = 90, x = i => 8 + i * (W - 16) / 29, y = v => H - 10 - (v - 1) * (H - 24) / 4;
  let path = '', open = false; vals.forEach((v, i) => { if (v) { path += `${open ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `; open = true; } else open = false; });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><path d="${path}" fill="none" stroke="var(--acc)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${vals.map((v, i) => v ? `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.2" fill="var(--acc)"/>` : '').join('')}
    <text x="4" y="12" font-size="9" fill="var(--mute)">Großartig</text><text x="4" y="${H - 2}" font-size="9" fill="var(--mute)">Schwer</text></svg><p class="small" style="text-align:center">Letzte 30 Tage</p>`;
}
Views.journal = {
  render() {
    if (Journal.pinSet() && !Journal.unlocked) return `<div class="top"><h1>Journal</h1></div><section class="card jlock"><div style="text-align:center">${moonSVG(2, 56)}</div><h2 style="text-align:center">Dein Journal ist gesperrt</h2>
      <form data-f="jUnlock" class="stack" style="max-width:280px;margin:0 auto"><input id="jpin" name="pin" type="password" inputmode="numeric" autocomplete="off" placeholder="PIN" style="text-align:center;font-size:22px;letter-spacing:.3em" autofocus><button class="pri">Öffnen</button></form></section>`;
    const d = Journal.date, e = Journal.get(d), words = (e.text.trim().match(/\S+/g) || []).length, tags = Journal.allTags();
    const k = d.slice(0, 7), mon = Journal.month(k), [y, m] = k.split('-').map(Number), n = new Date(y, m, 0).getDate(), off = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const q = Journal.q.toLowerCase().trim(), list = Journal.allEntries().filter(x => !q || (x.text + ' ' + (x.grat || []).join(' ') + ' ' + (x.tags || []).join(' ')).toLowerCase().includes(q)).slice(0, 30);
    return `<div class="top"><div><h1>Journal</h1><div class="sub">${fmtDate(d)}</div></div>
      <div class="row"><button class="icon" data-a="jDay" data-v="-1" aria-label="Vorheriger Tag">${ic('left')}</button><button data-a="jDay" data-v="0">${relDay(d) || parse(d).getDate() + '. ' + MO[parse(d).getMonth()].slice(0, 3)}</button><button class="icon" data-a="jDay" data-v="1" aria-label="Nächster Tag" ${d >= today() ? 'disabled' : ''}>${ic('right')}</button></div></div>
    <div class="cards jgrid">
      <div class="col">
        <section class="card jpaper"><h2>Wie war dein Tag?</h2><div class="moods">${MOODS.map(([v, l]) => `<button class="mood" data-a="jMood" data-v="${v}" aria-pressed="${e.mood === v}" aria-label="${l}">${moonSVG(v)}<span>${l}</span></button>`).join('')}</div>
          <p class="jprompt">${esc(Journal.prompt(d))}</p>
          <textarea id="jtext" data-i="jText" class="jtext" placeholder="Schreib einfach drauf los …">${esc(e.text)}</textarea>
          <div class="row between"><span class="small">${words} Wörter · wird automatisch gespeichert</span><span class="small syncst"></span></div></section>
        <section class="card"><h2>Drei Dinge, für die ich dankbar bin</h2><div class="stack">${[0, 1, 2].map(i => `<input id="jg${i}" data-i="jGrat" data-v="${i}" value="${esc(e.grat[i] || '')}" placeholder="${i + 1}." autocomplete="off">`).join('')}</div></section>
        <section class="card"><h2>Tags</h2><div class="chips" style="margin-bottom:8px">${e.tags.map(t => `<button class="chip" aria-pressed="true" data-a="jTagDel" data-v="${esc(t)}">${esc(t)} ×</button>`).join('') || '<span class="small">Noch keine Tags für diesen Tag.</span>'}</div>
          <form data-f="jTag" class="row"><input id="jtag" name="t" placeholder="z. B. Schule, Familie, Training" autocomplete="off" list="jtags"><button>${ic('plus')}</button></form>
          <datalist id="jtags">${tags.map(t => `<option value="${esc(t)}">`).join('')}</datalist></section>
      </div>
      <div class="col">
        <section class="card"><div class="row between"><h2 style="margin:0">${MO[m - 1]} ${y}</h2><span class="tag">${Journal.streak()} Tage in Folge</span></div>
          <div class="jcal">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(w => `<span class="h">${w}</span>`).join('')}${Array.from({ length: off }, () => '<span></span>').join('')}
          ${Array.from({ length: n }, (_, i) => { const ds = `${k}-${pad(i + 1)}`, en = mon[ds]; return `<button data-a="jGo" data-v="${ds}" class="${ds === d ? 'sel' : ''} ${ds === today() ? 'today' : ''}" ${ds > today() ? 'disabled' : ''}>${en && en.mood ? moonSVG(en.mood, 22) : `<b>${i + 1}</b>`}${en && !en.mood ? '<i></i>' : ''}</button>`; }).join('')}</div></section>
        <section class="card"><h2>Stimmungsverlauf</h2>${moodChart()}</section>
        <section class="card"><h2>Einträge</h2><input id="jq" data-i="jQ" type="search" placeholder="Einträge durchsuchen …" value="${esc(Journal.q)}" autocomplete="off" style="margin-bottom:8px">
          <ul class="list">${list.map(x => `<li data-a="jGo" data-v="${x.d}" style="cursor:pointer">${x.mood ? moonSVG(x.mood, 26) : ''}<span class="t"><b>${fmtDate(x.d)}</b><small>${esc((x.text || (x.grat || []).filter(Boolean).join(' · ') || '').slice(0, 90))}${(x.text || '').length > 90 ? '…' : ''}</small></span></li>`).join('') || '<li class="empty">Noch keine Einträge.</li>'}</ul></section>
      </div></div>`;
  }
};
Actions.jDay = el => { const v = +el.dataset.v; Journal.date = v === 0 ? today() : addDays(Journal.date, v); if (Journal.date > today()) Journal.date = today(); App.render(); };
Actions.jGo = el => { Journal.date = el.dataset.v; App.render(); scrollTo(0, 0); };
Actions.jMood = el => Journal.set(Journal.date, e => { const v = +el.dataset.v; e.mood = e.mood === v ? 0 : v; });
Changes.jText = el => { clearTimeout(Journal._t); const d = Journal.date, v = el.value; Journal._t = setTimeout(() => Journal.set(d, e => e.text = v, false), 700); };
Changes.jGrat = el => { clearTimeout(Journal._g); const d = Journal.date, i = +el.dataset.v, v = el.value; Journal._g = setTimeout(() => Journal.set(d, e => { e.grat = [...e.grat]; e.grat[i] = v; }, false), 700); };
Changes.jQ = el => { Journal.q = el.value; App.render(); };
Forms.jTag = v => { const t = (v.t || '').trim(); if (!t) return; Journal.set(Journal.date, e => { if (!e.tags.includes(t)) e.tags = [...e.tags, t]; }); const i = $('#jtag'); if (i) { i.value = ''; i.focus(); } };
Actions.jTagDel = el => Journal.set(Journal.date, e => { e.tags = e.tags.filter(t => t !== el.dataset.v); });
Forms.jUnlock = async v => { if (await Journal.hash(v.pin || '') === localStorage.getItem('mw-jpin')) { Journal.unlocked = true; App.render(); } else { App.toast('Falsche PIN'); const i = $('#jpin'); if (i) { i.value = ''; i.focus(); } } };
