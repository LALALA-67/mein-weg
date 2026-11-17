'use strict';
/* ===== Essen: Mahlzeiten, Barcode-Scanner, Open Food Facts ===== */
const MEALS = [['fruehstueck', 'Frühstück'], ['mittag', 'Mittagessen'], ['abend', 'Abendessen'], ['snacks', 'Snacks']];
const MACRO = [['p', 'Protein', 'var(--prot)'], ['c', 'Kohlenhydrate', 'var(--carb)'], ['f', 'Fett', 'var(--fat)']];
// Richtwerte pro 100 g (Durchschnittswerte aus Nährwerttabellen)
const BASICS = [
  ['Apfel', 52, .3, 14, .2, 180], ['Banane', 89, 1.1, 23, .3, 120], ['Erdbeeren', 32, .7, 7.7, .3], ['Heidelbeeren', 57, .7, 14, .3], ['Orange', 47, .9, 12, .1, 150],
  ['Haferflocken', 372, 13.5, 58.7, 7, 50], ['Reis (gekocht)', 130, 2.7, 28, .3, 200], ['Nudeln (gekocht)', 150, 5.5, 30, .9, 200], ['Kartoffeln (gekocht)', 77, 2, 17, .1, 200],
  ['Vollkornbrot', 220, 8, 40, 2.5, 50], ['Toastbrot', 265, 8, 49, 3.6, 25], ['Brötchen', 270, 9, 53, 2, 60],
  ['Ei (gekocht)', 155, 13, 1.1, 11, 60], ['Hähnchenbrust', 110, 23, 0, 1.5, 150], ['Putenbrust', 105, 24, 0, 1, 150], ['Rinderhack', 250, 26, 0, 15, 125],
  ['Lachs', 208, 20, 0, 13, 125], ['Thunfisch (Dose, Wasser)', 116, 26, 0, 1, 130], ['Magerquark', 67, 12, 4, .3, 250], ['Skyr natur', 63, 11, 4, .2, 150],
  ['Griechischer Joghurt 10%', 133, 5, 4, 10, 150], ['Milch 1,5%', 47, 3.4, 4.8, 1.5, 250], ['Hüttenkäse', 98, 12, 3, 4.3, 200], ['Gouda', 356, 25, 0, 27, 30],
  ['Mozzarella', 254, 18, 1, 19, 125], ['Tofu', 120, 13, 1.5, 7, 100], ['Linsen (gekocht)', 116, 9, 20, .4, 150], ['Kichererbsen (gekocht)', 164, 9, 27, 2.6, 150],
  ['Brokkoli', 34, 2.8, 7, .4, 150], ['Gurke', 15, .7, 3.6, .1, 100], ['Tomate', 18, .9, 3.9, .2, 100], ['Paprika', 31, 1, 6, .3, 150], ['Avocado', 160, 2, 9, 15, 70],
  ['Mandeln', 579, 21, 22, 50, 30], ['Erdnussbutter', 588, 25, 20, 50, 15], ['Olivenöl', 884, 0, 0, 100, 10], ['Butter', 717, .9, .1, 81, 10],
  ['Whey Protein (Pulver)', 380, 78, 8, 5, 30], ['Proteinriegel', 360, 33, 35, 12, 60], ['Dunkle Schokolade 70%', 600, 8, 34, 43, 20], ['Reiswaffel', 387, 8, 81, 3, 8]
].map(([name, kcal, p, c, f, serving]) => ({ key: 'b:' + name, name, brand: 'Richtwert', per: { kcal, p, c, f }, serving: serving || null }));

const OFF_FIELDS = 'code,product_name,product_name_de,brands,nutriments,serving_quantity,image_front_small_url';
const Food = {
  st: null, scanner: null,
  totals(d) {
    const t = { kcal: 0, p: 0, c: 0, f: 0 };
    MEALS.forEach(([m]) => d.meals[m].forEach(i => { t.kcal += +i.kcal || 0; t.p += +i.p || 0; t.c += +i.c || 0; t.f += +i.f || 0; }));
    return t;
  },
  calc(per, g) { const k = g / 100; return { kcal: Math.round(per.kcal * k), p: Math.round(per.p * k * 10) / 10, c: Math.round(per.c * k * 10) / 10, f: Math.round(per.f * k * 10) / 10 }; },
  fromOFF(p) {
    const n = p.nutriments || {};
    const kcal = n['energy-kcal_100g'] != null ? +n['energy-kcal_100g'] : (n.energy_100g ? n.energy_100g / 4.184 : 0);
    return { key: 'o:' + p.code, code: p.code, name: p.product_name_de || p.product_name || 'Unbekanntes Produkt', brand: (p.brands || '').split(',')[0].trim(), img: p.image_front_small_url || '',
      per: { kcal: Math.round(kcal), p: +(n.proteins_100g || 0), c: +(n.carbohydrates_100g || 0), f: +(n.fat_100g || 0) }, serving: +p.serving_quantity || null, nokcal: n['energy-kcal_100g'] == null && !n.energy_100g };
  },
  recent() { return Store.get('foods', { recent: [] }).recent || []; },
  remember(prod) {
    const r = this.recent().filter(x => x.key !== prod.key);
    const { key, code, name, brand, img, per, serving } = prod;
    r.unshift({ key, code, name, brand, img, per, serving });
    Store.set('foods', { recent: r.slice(0, 80) });
  },
  ring(val, goal, size = 150) {
    const C = 2 * Math.PI * 42, p = Math.min(val / goal, 1), over = val > goal;
    return `<div class="ringbox" style="width:${size}px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--card2)" stroke-width="10"/><circle cx="50" cy="50" r="42" fill="none" stroke="${over ? '#e8384f' : 'var(--kcal)'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset .6s"/></svg>
      <div class="c"><b>${num(goal - val < 0 ? val - goal : goal - val)}</b><span>${val > goal ? 'kcal zu viel' : 'kcal übrig'}</span></div></div>`;
  },
  macros(t, g) {
    return MACRO.map(([k, l, col]) => `<div class="macro"><div class="row"><span>${l}</span><span class="num">${num(t[k])} / ${g[k]} g</span></div><div class="bar"><i style="width:${Math.min(t[k] / g[k], 1) * 100}%;background:${col}"></i></div></div>`).join('');
  },
  summaryCard(d) {
    const g = Settings.get().goals, t = this.totals(d);
    return `<section class="card summary">${this.ring(t.kcal, g.kcal)}<div class="macros"><div class="row between"><b style="font-size:18px">${num(t.kcal)} kcal gegessen</b><span class="small">Ziel ${num(g.kcal)}</span></div>${this.macros(t, g)}</div></section>`;
  },
  itemRow(i, m) {
    return `<li data-a="foodEdit" data-v="${m}|${i.id}">${i.img ? `<img class="food-img" src="${esc(i.img)}" alt="" loading="lazy">` : `<span class="food-img">${esc((i.name || '?')[0].toUpperCase())}</span>`}
      <span class="t"><b>${esc(i.name)}</b><small>${esc(i.brand ? i.brand + ' · ' : '')}${num(i.g)} g</small><span class="mm"><span class="p">P ${num(i.p, 1)}</span><span class="c">K ${num(i.c, 1)}</span><span class="f">F ${num(i.f, 1)}</span></span></span><span class="num" style="font-weight:800">${num(i.kcal)} kcal</span></li>`;
  }
};

Views.essen = {
  render() {
    const d = Day.get();
    return `<div class="top"><div><h1>Essen</h1><div class="sub">${fmtDate(App.date)}</div></div>${App.dateNav()}</div>
    ${Food.summaryCard(d)}
    <div class="cards" style="margin-top:14px">${MEALS.map(([m, l]) => {
      const items = d.meals[m], kc = items.reduce((a, i) => a + (+i.kcal || 0), 0);
      return `<section class="card meal"><div class="meal-h"><h3>${l}</h3><span class="kc">${num(kc)} kcal</span><button class="icon pink" data-a="foodAdd" data-v="${m}" aria-label="${l} hinzufügen">${ic('plus')}</button></div>
        ${items.length ? `<ul class="list">${items.map(i => Food.itemRow(i, m)).join('')}</ul>` : ''}
        <div style="padding:0 16px 14px" class="row"><button class="grow" data-a="foodAdd" data-v="${m}" data-mode="scan">${ic('scan')} Scannen</button><button class="grow" data-a="foodAdd" data-v="${m}" data-mode="search">${ic('search')} Suchen</button></div></section>`;
    }).join('')}</div>
    <p class="small" style="margin-top:14px">Produktdaten von <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener" style="color:inherit">Open Food Facts</a> (freie Datenbank, Werte können fehlen oder abweichen).</p>`;
  }
};

/* --- Hinzufügen-Dialog --- */
function foodModal() {
  const s = Food.st;
  if (s.step === 'portion') return foodPortion();
  const tabs = [['scan', 'Scannen'], ['search', 'Suchen'], ['recent', 'Zuletzt'], ['manual', 'Eigenes']];
  let body = '';
  if (s.mode === 'scan') {
    body = `<div id="reader"></div>
      ${s.err ? `<p class="small" style="margin-top:8px;color:#d64545">${esc(s.err)}</p>` : `<p class="small" style="margin-top:8px">Halte den Barcode ins Bild – er wird automatisch erkannt.</p>`}
      ${s.loading ? `<p style="margin-top:8px"><b>Suche Produkt ${esc(s.code || '')} …</b></p>` : ''}
      ${s.notfound ? `<div class="card" style="margin-top:10px"><b>Produkt ${esc(s.code)} nicht gefunden.</b><p class="small">Trag es einfach selbst ein – beim nächsten Mal ist es unter „Zuletzt“.</p><button class="pri" style="margin-top:8px" data-a="foodMode" data-v="manual">Selbst eintragen</button></div>` : ''}
      <form data-f="foodCode" class="row" style="margin-top:10px"><input name="code" id="fcode" inputmode="numeric" placeholder="Barcode-Nummer eintippen" autocomplete="off"><button>Suchen</button></form>
      <label class="small" style="margin-top:10px;display:flex;align-items:center;gap:8px;cursor:pointer">${ic('camera')}<span>Kamera geht nicht? <u>Foto vom Barcode auswählen</u></span><input type="file" accept="image/*" capture="environment" data-c="foodPhoto" hidden></label>`;
  } else if (s.mode === 'search') {
    const q = (s.q || '').toLowerCase();
    const basics = q ? BASICS.filter(b => b.name.toLowerCase().includes(q)) : BASICS.slice(0, 12);
    body = `<form data-f="foodSearch" class="row"><input name="q" id="fq" placeholder="z. B. Skyr, Haferflocken, Nutella" value="${esc(s.q || '')}" autocomplete="off" autofocus><button class="pri">${ic('search')}</button></form>
      <div class="stack" style="margin-top:12px">
      ${s.loading ? '<p class="empty">Suche in Open Food Facts …</p>' : ''}
      ${s.err ? `<p class="small" style="color:#d64545">${esc(s.err)}</p>` : ''}
      ${s.results && s.results.length ? `<h3>Produkte</h3>${s.results.map((p, i) => foodResult(p, 'res', i)).join('')}` : (s.results && !s.loading ? '<p class="empty">Keine Produkte gefunden.</p>' : '')}
      ${basics.length ? `<h3>Grundnahrungsmittel <span class="small">(Richtwerte)</span></h3>${basics.map(b => foodResult(b, 'basic', BASICS.indexOf(b))).join('')}` : ''}
      </div>`;
  } else if (s.mode === 'recent') {
    const r = Food.recent();
    body = r.length ? `<div class="stack">${r.map((p, i) => foodResult(p, 'recent', i)).join('')}</div>` : '<p class="empty">Hier erscheinen Lebensmittel, die du schon mal eingetragen hast.</p>';
  } else {
    body = `<form data-f="foodManual" class="stack">
      <label>Name<input name="name" required placeholder="z. B. Mamas Lasagne" autocomplete="off"></label>
      <label>Menge in Gramm<input name="g" type="number" inputmode="decimal" min="1" placeholder="z. B. 300" required></label>
      <p class="small">Nährwerte für diese Menge:</p>
      <div class="formgrid"><label>Kalorien<input name="kcal" type="number" inputmode="decimal" min="0" required></label><label>Protein (g)<input name="p" type="number" inputmode="decimal" min="0" step="0.1" value="0"></label><label>Kohlenh. (g)<input name="c" type="number" inputmode="decimal" min="0" step="0.1" value="0"></label><label>Fett (g)<input name="f" type="number" inputmode="decimal" min="0" step="0.1" value="0"></label></div>
      ${s.code ? `<input type="hidden" name="code" value="${esc(s.code)}">` : ''}
      <button class="pri">Hinzufügen</button></form>`;
  }
  return `${App.sheetHead(MEALS.find(m => m[0] === s.meal)[1] + ' hinzufügen')}
    <div class="seg" style="margin-bottom:14px;width:100%">${tabs.map(([k, l]) => `<button class="grow" data-a="foodMode" data-v="${k}" aria-pressed="${s.mode === k}">${l}</button>`).join('')}</div>${body}`;
}
function foodResult(p, src, i) {
  return `<button class="result" data-a="foodPick" data-v="${src}|${i}">${p.img ? `<img class="food-img" src="${esc(p.img)}" alt="" loading="lazy">` : `<span class="food-img">${esc(p.name[0].toUpperCase())}</span>`}
    <span class="grow"><b>${esc(p.name)}</b><span class="small" style="display:block">${esc(p.brand || '')}${p.brand ? ' · ' : ''}${num(p.per.kcal)} kcal / 100 g</span></span></button>`;
}
function foodPortion() {
  const s = Food.st, p = s.product, g = +s.grams || 0, v = Food.calc(p.per, g);
  const opts = [...(p.serving ? [[p.serving, `1 Portion (${num(p.serving)} g)`]] : []), [50, '50 g'], [100, '100 g'], [150, '150 g'], [200, '200 g'], [250, '250 g']];
  return `${App.sheetHead(s.editId ? 'Eintrag bearbeiten' : 'Menge wählen')}
    <div class="row" style="margin-bottom:12px">${p.img ? `<img class="food-img" style="width:64px;height:64px" src="${esc(p.img)}" alt="">` : ''}<div class="grow"><h3>${esc(p.name)}</h3><p class="small">${esc(p.brand || '')} · pro 100 g: ${num(p.per.kcal)} kcal · P ${num(p.per.p, 1)} · K ${num(p.per.c, 1)} · F ${num(p.per.f, 1)}</p></div></div>
    ${p.nokcal ? '<p class="small" style="color:#d64545;margin-bottom:8px">Für dieses Produkt fehlen Kalorienangaben in der Datenbank.</p>' : ''}
    <label>Menge in Gramm<input id="fg" type="number" inputmode="decimal" min="0" value="${esc(s.grams)}" data-i="foodGrams"></label>
    <div class="chips" style="margin:10px 0">${opts.map(([n, l]) => `<button class="chip" data-a="foodGramsSet" data-v="${n}" aria-pressed="${+s.grams === +n}">${l}</button>`).join('')}</div>
    <div class="portion" style="margin:12px 0"><div><b>${num(v.kcal)}</b><span>kcal</span></div><div><b style="color:var(--prot)">${num(v.p, 1)}</b><span>Protein</span></div><div><b style="color:var(--carb)">${num(v.c, 1)}</b><span>Kohlenh.</span></div><div><b style="color:var(--fat)">${num(v.f, 1)}</b><span>Fett</span></div></div>
    <p class="small" style="margin-bottom:6px">Mahlzeit</p>
    <div class="chips" style="margin-bottom:16px">${MEALS.map(([m, l]) => `<button class="chip" data-a="foodMeal" data-v="${m}" aria-pressed="${s.meal === m}">${l}</button>`).join('')}</div>
    <div class="row">${s.editId ? `<button class="danger" data-a="foodDel">${ic('trash')} Löschen</button>` : `<button data-a="foodBack">Zurück</button>`}<button class="pri grow" data-a="foodSave" ${g > 0 ? '' : 'disabled'}>${s.editId ? 'Speichern' : 'Hinzufügen'}</button></div>`;
}

function openFood(meal, mode) {
  Food.st = { meal, mode: mode || 'scan', step: 'pick', q: '', results: null };
  App.modal(foodModal, { mount: foodMount, onClose: stopScanner, sticky: () => Food.st && Food.st.mode === 'scan' && Food.st.step === 'pick' && !!Food.scanner });
}
function refreshFood() { if (App.modalRender === foodModal) App.refreshModal(); }
function loadScript(src) {
  return new Promise((ok, no) => { if ($(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('Skript konnte nicht geladen werden')); document.head.appendChild(s); });
}
const QR_SRC = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
async function foodMount() {
  const s = Food.st;
  if (!s || s.mode !== 'scan' || s.step !== 'pick' || s.loading || s.notfound || Food.scanner) return;
  if (!$('#reader')) return;
  try {
    await loadScript(QR_SRC);
    if (!Food.st || Food.st.mode !== 'scan' || !$('#reader')) return;
    const F = window.Html5QrcodeSupportedFormats;
    const sc = new window.Html5Qrcode('reader', { formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128], experimentalFeatures: { useBarCodeDetectorIfSupported: true }, verbose: false });
    Food.scanner = sc;
    await sc.start({ facingMode: 'environment' }, { fps: 12, qrbox: (w, h) => ({ width: Math.min(w * .85, 320), height: Math.min(h * .5, 160) }), aspectRatio: 1.4 }, code => onCode(code), () => {});
  } catch (e) {
    Food.scanner = null;
    s.err = /permission|NotAllowed/i.test(String(e)) ? 'Kamera-Zugriff wurde nicht erlaubt. Erlaube die Kamera in den Browser-Einstellungen oder tippe die Nummer ein.' : 'Kamera konnte nicht gestartet werden. Tippe die Nummer ein oder nimm ein Foto.';
    refreshFood();
  }
}
async function stopScanner() {
  const sc = Food.scanner; Food.scanner = null;
  if (sc) { try { await sc.stop(); } catch (e) {} try { sc.clear(); } catch (e) {} }
}
async function onCode(code) {
  if (!Food.st || Food.st.loading) return;
  if (navigator.vibrate) navigator.vibrate(60);
  await stopScanner();
  lookupCode(code);
}
async function lookupCode(code) {
  const s = Food.st; s.code = code; s.loading = true; s.notfound = false; s.err = ''; refreshFood();
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`);
    const j = await r.json();
    s.loading = false;
    if (j.status === 1 && j.product) pickProduct(Food.fromOFF({ ...j.product, code }));
    else { s.notfound = true; refreshFood(); }
  } catch (e) { s.loading = false; s.err = 'Keine Verbindung zur Produktdatenbank. Bist du online?'; refreshFood(); }
}
function pickProduct(p) {
  const s = Food.st; s.product = p; s.step = 'portion'; s.grams = p.serving || 100; refreshFood();
}

Actions.foodAdd = el => openFood(el.dataset.v, el.dataset.mode);
Actions.foodMode = async el => { await stopScanner(); Object.assign(Food.st, { mode: el.dataset.v, err: '', loading: false, notfound: Food.st.mode === 'scan' && el.dataset.v === 'manual' ? false : false }); refreshFood(); };
Actions.foodPick = el => {
  const [src, i] = el.dataset.v.split('|');
  const p = src === 'res' ? Food.st.results[+i] : src === 'basic' ? BASICS[+i] : Food.recent()[+i];
  if (p) pickProduct(clone(p));
};
Actions.foodBack = () => { Object.assign(Food.st, { step: 'pick', loading: false, notfound: false }); refreshFood(); };
Actions.foodGramsSet = el => { Food.st.grams = +el.dataset.v; refreshFood(); };
Actions.foodMeal = el => { Food.st.meal = el.dataset.v; refreshFood(); };
Changes.foodGrams = el => { Food.st.grams = el.value; refreshFood(); };
Actions.foodSave = () => {
  const s = Food.st, p = s.product, g = Math.max(0, +s.grams || 0), v = Food.calc(p.per, g);
  const item = { id: s.editId || uid(), name: p.name, brand: p.brand || '', code: p.code || '', img: p.img || '', per: p.per, serving: p.serving || null, key: p.key || '', g, ...v };
  Day.update(d => {
    if (s.editId) MEALS.forEach(([m]) => { d.meals[m] = d.meals[m].filter(x => x.id !== s.editId); });
    d.meals[s.meal].push(item);
  });
  if (p.key) Food.remember(p);
  App.closeModal(); App.toast(`${p.name} eingetragen`);
};
Actions.foodDel = () => { const s = Food.st; Day.update(d => MEALS.forEach(([m]) => { d.meals[m] = d.meals[m].filter(x => x.id !== s.editId); })); App.closeModal(); };
Actions.foodEdit = el => {
  const [m, id] = el.dataset.v.split('|'), it = Day.get().meals[m].find(x => x.id === id);
  if (!it) return;
  const per = it.per || (it.g ? { kcal: it.kcal * 100 / it.g, p: it.p * 100 / it.g, c: it.c * 100 / it.g, f: it.f * 100 / it.g } : { kcal: it.kcal, p: it.p, c: it.c, f: it.f });
  Food.st = { meal: m, step: 'portion', editId: id, grams: it.g || 100, product: { name: it.name, brand: it.brand, img: it.img, code: it.code, per, serving: it.serving, key: it.key } };
  App.modal(foodModal, { mount: foodMount, onClose: stopScanner });
};
Forms.foodCode = v => { if (v.code) { stopScanner().then(() => lookupCode(v.code.replace(/\D/g, ''))); } };
Forms.foodSearch = async v => {
  const s = Food.st; s.q = v.q; if (!v.q) { s.results = null; refreshFood(); return; }
  s.loading = true; s.err = ''; refreshFood();
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(v.q)}&search_simple=1&action=process&json=1&page_size=25&sort_by=unique_scans_n&fields=${OFF_FIELDS}`;
    const j = await (await fetch(url)).json();
    s.results = (j.products || []).filter(p => p.product_name || p.product_name_de).map(Food.fromOFF);
  } catch (e) {
    try {
      const j = await (await fetch(`https://search.openfoodfacts.org/search?q=${encodeURIComponent(v.q)}&page_size=25&fields=${OFF_FIELDS}`)).json();
      s.results = (j.hits || []).filter(p => p.product_name || p.product_name_de).map(Food.fromOFF);
    } catch (e2) { s.results = []; s.err = 'Suche gerade nicht erreichbar. Bist du online?'; }
  }
  s.loading = false; if (Food.st === s) refreshFood();
};
Forms.foodManual = v => {
  const g = Math.max(1, +v.g || 100), k = 100 / g;
  const p = { key: 'm:' + v.name.toLowerCase(), code: v.code || '', name: v.name, brand: 'Eigenes', per: { kcal: Math.round(+v.kcal * k), p: +v.p * k, c: +v.c * k, f: +v.f * k }, serving: g };
  Food.st.product = p; Food.st.grams = g; Food.st.step = 'portion';
  Actions.foodSave();
};
Changes.foodPhoto = async el => {
  const file = el.files && el.files[0]; if (!file) return;
  try {
    await stopScanner(); await loadScript(QR_SRC);
    let host = $('#qr-file'); if (!host) { host = document.createElement('div'); host.id = 'qr-file'; host.hidden = true; document.body.appendChild(host); }
    const sc = new window.Html5Qrcode('qr-file');
    const code = await sc.scanFile(file, false); try { sc.clear(); } catch (e) {}
    lookupCode(code);
  } catch (e) { Food.st.err = 'Auf dem Foto wurde kein Barcode erkannt. Versuch es näher und scharf.'; refreshFood(); }
};
