'use strict';
/* ===== Gesichts-Workouts: animierte Übungen, eigene Workouts, Player, Verlauf ===== */
const FACE_ANIMS = {
  puff: 'Wangen aufblasen', fish: 'Fischmund', brow: 'Augenbrauen heben', jaw: 'Mund weit öffnen', smile: 'Lächeln halten', squint: 'Augen zukneifen',
  neck: 'Kopf zurück + Kussmund', tilt: 'Kopf seitlich neigen', vowel: 'O und E formen', tongue: 'Zunge rausstrecken', eyes: 'Augen kreisen',
  jawside: 'Kiefer seitlich', chin: 'Kinn vorschieben', massage: 'Wangen kreisen', forehead: 'Stirn ausstreichen', temples: 'Schläfen kreisen',
  eyesmass: 'Augenpartie massieren', lymph: 'Hals ausstreichen', knuckle: 'Knöchel am Kiefer',
  gs1: 'Gua Sha ① Hals', gs2: 'Gua Sha ② Kiefer', gs3: 'Gua Sha ③ Mundwinkel', gs4: 'Gua Sha ④ Wangen', gs5: 'Gua Sha ⑤ Nase', gs6: 'Gua Sha ⑥ Unter den Augen', gs7: 'Gua Sha ⑦ Stirn', gs8: 'Gua Sha ⑧ Brauen', gsall: 'Gua Sha Übersicht', none: 'Ruhig halten'
};
const FACE_CATS = ['Alle', 'Training', 'Massage', 'Gua Sha', 'Dehnen', 'Augen'];
const FACE_LIB = [
  { id: 'puff', cat: 'Training', name: 'Wangen aufblasen', anim: 'puff', sec: 30, desc: 'Atme ein und blase beide Wangen mit Luft auf.\nHalte 5 Sekunden, dann lass die Luft langsam raus.\nVariante: Schiebe die Luft von einer Wange in die andere.' },
  { id: 'fish', cat: 'Training', name: 'Fischmund', anim: 'fish', sec: 30, desc: 'Sauge die Wangen nach innen, sodass die Lippen nach vorne kommen.\nHalte die Spannung 5 Sekunden.\nLocker lassen und wiederholen.' },
  { id: 'brow', cat: 'Training', name: 'Augenbrauen heben', anim: 'brow', sec: 30, desc: 'Ziehe die Augenbrauen so hoch du kannst und öffne die Augen weit.\n3 Sekunden halten, dann entspannen.\nTipp: Stirn mit den Fingern leicht gegenhalten für mehr Widerstand.' },
  { id: 'jaw', cat: 'Training', name: 'Mund weit öffnen', anim: 'jaw', sec: 40, desc: 'Öffne den Mund so weit es angenehm geht.\n3 Sekunden halten, dann langsam schließen.\nNicht ruckartig – kein Schmerz!' },
  { id: 'smile', cat: 'Training', name: 'Lächeln halten', anim: 'smile', sec: 30, desc: 'Lächle so breit du kannst, die Wangen gehen nach oben.\n10 Sekunden halten.\nEntspannen und wiederholen.' },
  { id: 'neck', cat: 'Training', name: 'Decke küssen (Kinnlinie)', anim: 'neck', sec: 40, desc: 'Lege den Kopf langsam in den Nacken und schau zur Decke.\nSpitze die Lippen zu einem Kussmund.\n5–10 Sekunden halten, dann zurück.' },
  { id: 'vowel', cat: 'Training', name: 'O – E Übung', anim: 'vowel', sec: 40, desc: 'Forme mit den Lippen ein großes „O“.\nWechsle zu einem breiten „E“.\nÜbertreibe die Bewegung ruhig.' },
  { id: 'tongue', cat: 'Training', name: 'Zunge zum Kinn', anim: 'tongue', sec: 30, desc: 'Öffne den Mund und strecke die Zunge Richtung Kinn.\n5 Sekunden halten.\nZurückziehen und wiederholen.' },
  { id: 'jawside', cat: 'Training', name: 'Kiefer seitlich', anim: 'jawside', sec: 30, desc: 'Mund leicht öffnen.\nSchiebe den Unterkiefer langsam nach links, dann nach rechts.\nRuhig und kontrolliert.' },
  { id: 'chin', cat: 'Training', name: 'Kinn vorschieben', anim: 'chin', sec: 30, desc: 'Schiebe den Unterkiefer nach vorne.\nZiehe die Unterlippe nach oben.\n5 Sekunden halten, entspannen.' },
  { id: 'tilt', cat: 'Dehnen', name: 'Hals seitlich dehnen', anim: 'tilt', sec: 40, desc: 'Neige den Kopf langsam zur linken Schulter.\n10 Sekunden halten, dann zur rechten Seite.\nSchultern bleiben unten.' },
  { id: 'squint', cat: 'Augen', name: 'Augen zukneifen', anim: 'squint', sec: 30, desc: 'Kneife die Augen fest zusammen.\n3 Sekunden halten, dann weit öffnen.\nGut für die Muskeln rund um die Augen.' },
  { id: 'eyes', cat: 'Augen', name: 'Augen kreisen', anim: 'eyes', sec: 30, desc: 'Kopf bleibt still.\nLass die Augen langsam im Kreis wandern.\nNach der Hälfte die Richtung wechseln.' },
  { id: 'eyesmass', cat: 'Augen', name: 'Augenpartie massieren', anim: 'eyesmass', sec: 45, desc: 'Lege die Ringfinger unter die Augen – sie drücken am sanftesten.\nKleine Kreise von innen nach außen Richtung Schläfe.\nGut gegen Schwellungen am Morgen.' },
  { id: 'massage', cat: 'Massage', name: 'Wangen-Massage', anim: 'massage', sec: 60, desc: 'Lege Zeige-, Mittel- und Ringfinger auf die Wangen.\nMassiere in kleinen Kreisen von unten nach oben.\nMit etwas Gesichtsöl oder Creme gleiten die Finger besser.' },
  { id: 'forehead', cat: 'Massage', name: 'Stirn ausstreichen', anim: 'forehead', sec: 45, desc: 'Lege die Finger über die Augenbrauen.\nStreiche abwechselnd mit beiden Händen nach oben bis zum Haaransatz.\nLöst Spannung und glättet die Stirn.' },
  { id: 'temples', cat: 'Massage', name: 'Schläfen kreisen', anim: 'temples', sec: 45, desc: 'Lege die Fingerspitzen auf die Schläfen.\nKreise langsam mit leichtem Druck.\nAtme dabei ruhig – hilft auch bei Kopfspannung.' },
  { id: 'lymph', cat: 'Massage', name: 'Lymphdrainage Hals', anim: 'lymph', sec: 45, desc: 'Lege die flachen Finger unter die Ohren.\nStreiche sanft am Hals entlang nach unten zum Schlüsselbein.\nNur leichter Druck – das entwässert und entschwellt.' },
  { id: 'knuckle', cat: 'Massage', name: 'Knöchel am Kiefer', anim: 'knuckle', sec: 45, desc: 'Mach lockere Fäuste und lege die Knöchel ans Kinn.\nZiehe sie entlang der Kieferlinie bis unter die Ohren.\nLöst verspannte Kaumuskeln.' },
  { id: 'gsall', cat: 'Gua Sha', name: 'Gua Sha komplett (alle Zonen)', anim: 'gsall', sec: 120, desc: 'Gesichtsöl auftragen, Stein flach (ca. 15°) halten.\nArbeite die Zonen ① bis ⑧ von unten nach oben ab.\nImmer von der Mitte nach außen und nach oben streichen, je 5–10 Züge pro Zone und Seite.' },
  { id: 'gs1', cat: 'Gua Sha', name: '① Hals', anim: 'gs1', sec: 45, desc: 'Setze den Stein am unteren Hals an.\nStreiche sanft nach oben und außen bis unter den Kiefer.\nNur leichter Druck am Hals.' },
  { id: 'guasha', cat: 'Gua Sha', name: '② Kieferlinie', anim: 'gs2', sec: 60, desc: 'Setze die Kerbe des Steins am Kinn an.\nZiehe entlang der Kieferlinie bis zum Ohr.\nJede Seite 5–10 Mal.' },
  { id: 'gs3', cat: 'Gua Sha', name: '③ Mundwinkel', anim: 'gs3', sec: 45, desc: 'Setze den Stein unter dem Mundwinkel an.\nStreiche nach oben Richtung Wangenknochen und weiter zum Ohr.\nGlättet die Lachfalten.' },
  { id: 'guashacheek', cat: 'Gua Sha', name: '④ Wangen', anim: 'gs4', sec: 60, desc: 'Setze den Stein neben der Nase unter dem Wangenknochen an.\nZiehe flach nach außen bis zum Ohr.\nAm Ende kurz wackeln, dann neu ansetzen.' },
  { id: 'gs5', cat: 'Gua Sha', name: '⑤ Nase', anim: 'gs5', sec: 30, desc: 'Setze die schmale Seite neben dem Nasenflügel an.\nStreiche entlang der Nase nach oben.\nGanz sanft – die Haut ist hier dünn.' },
  { id: 'gs6', cat: 'Gua Sha', name: '⑥ Unter den Augen', anim: 'gs6', sec: 45, desc: 'Stein sehr flach unter dem inneren Augenwinkel ansetzen.\nNach außen Richtung Schläfe streichen.\nKaum Druck – gut gegen Schwellungen.' },
  { id: 'gs7', cat: 'Gua Sha', name: '⑦ Stirn', anim: 'gs7', sec: 45, desc: 'Setze den Stein zwischen den Augenbrauen an.\nStreiche gerade nach oben bis zum Haaransatz.\nArbeite dich von der Mitte zu den Seiten.' },
  { id: 'gs8', cat: 'Gua Sha', name: '⑧ Augenbrauen', anim: 'gs8', sec: 45, desc: 'Setze den Stein über der Augenbraue innen an.\nStreiche im Bogen über die Braue zur Schläfe.\nAn der Schläfe kurz halten.' }
];
const FACE_DEF_ROUTINES = [
  { id: 'r-glow', name: 'Morgen-Glow', items: [['eyesmass', 45], ['puff', 30], ['forehead', 45], ['smile', 30], ['lymph', 45]] },
  { id: 'r-jaw', name: 'Kinnlinie & Hals', items: [['neck', 40], ['jaw', 30], ['knuckle', 45], ['guasha', 60], ['gs1', 45], ['tilt', 40]] }
].map(r => ({ ...r, items: r.items.map(([ex, sec]) => ({ ex, sec })) }));

/* Hände und Gua-Sha-Stein für Massage-Animationen (Spitze des Mittelfingers = 0,0, zeigt nach oben) */
const HAND = `<g class="hd"><path d="M-14 46 L-17 125 L23 125 L19 46Z"/><rect class="sleeve" x="-19" y="100" width="44" height="30" rx="4"/>
  <path d="M-12 31 Q-24 27 -27 14 Q-28 8 -23 9 Q-19 11 -16 21 L-11 26Z"/>
  <rect x="-11" y="5" width="7" height="30" rx="3.5"/><rect x="-3.5" y="0" width="7" height="34" rx="3.5"/><rect x="4" y="4" width="7" height="31" rx="3.5"/><rect x="11" y="10" width="6" height="26" rx="3"/>
  <path d="M-13 28 Q-15 50 -10 57 L18 57 Q21 44 18 30Z"/><g class="nail"><ellipse cx="-7.5" cy="8" rx="2.3" ry="2.8"/><ellipse cx="0" cy="3" rx="2.3" ry="2.8"/><ellipse cx="7.5" cy="7" rx="2.3" ry="2.8"/><ellipse cx="14" cy="13" rx="2" ry="2.5"/></g></g>`;
const STONE = `<g class="stone"><path d="M-14 0 Q-12 -14 0 -16 Q12 -14 14 0 Q14 10 6 14 Q0 10 -6 14 Q-14 10 -14 0Z"/><path class="shine" d="M-8 -6 Q-4 -12 4 -12" fill="none"/></g>`;
const TOOL_POS = {
  massage: [HAND, 64, 126, 12], forehead: [HAND, 84, 82, 0], temples: [HAND, 50, 98, 28], eyesmass: [HAND, 80, 114, 52],
  lymph: [HAND, 82, 150, -6], knuckle: [HAND, 92, 168, -46]
};
function faceTools(anim) {
  const t = TOOL_POS[anim]; if (!t) return '';
  const [shape, x, y, r] = t, one = `<g transform="translate(${x} ${y}) rotate(${r})"><g class="mv">${shape}</g></g>`;
  return `<g class="tools">${one}<g class="r" transform="translate(200 0) scale(-1 1)">${one}</g></g>`;
}
/* Gua-Sha-Zonen: Pfeile (linke Gesichtshälfte, wird gespiegelt) */
const GS_ZONES = {
  gs1: ['M98 199 Q84 197 74 183'], gs2: ['M97 177 Q74 172 54 138', 'M96 168 Q78 163 61 130'], gs3: ['M85 160 L84 136', 'M88 166 Q70 158 52 126'],
  gs4: ['M90 133 Q72 128 50 113', 'M88 141 Q70 139 52 124'], gs5: ['M93 127 L93 107'], gs6: ['M86 111 Q72 115 56 103'],
  gs7: ['M91 90 L91 62'], gs8: ['M88 80 Q70 67 52 80']
};
const GS_NUM = { gs1: [118, 196], gs2: [134, 172], gs3: [120, 152], gs4: [140, 140], gs5: [112, 120], gs6: [146, 106], gs7: [100, 96], gs8: [124, 72] };
function gsOverlay(anim) {
  const zones = anim === 'gsall' ? Object.keys(GS_ZONES) : [anim];
  const dur = 2.6, arrows = (z, i) => GS_ZONES[z].map((d, k) => `<path class="gsar" d="${d}" pathLength="100" marker-end="url(#gsHead)" style="animation-delay:${(i * .35 + k * .2).toFixed(2)}s"/>`).join('');
  const stone = z => anim === 'gsall' ? '' : GS_ZONES[z].slice(0, 1).map(d => `<g class="gsstone"><path d="M-9 -6 Q0 -12 9 -6 Q12 2 6 7 Q0 4 -6 7 Q-12 2 -9 -6Z" fill="url(#fquartz)" stroke="rgba(150,60,90,.6)"/><path d="M-5 -6 Q0 -9 4 -7" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/><animateMotion dur="${dur}s" repeatCount="indefinite" rotate="auto" path="${d}" keyPoints="0;0;1;1" keyTimes="0;.1;.75;1" calcMode="linear"/></g>`).join('');
  const side = zones.map((z, i) => arrows(z, i) + stone(z)).join('');
  const center = zones.includes('gs7') ? `<path class="gsar" d="M100 92 L100 58" pathLength="100" marker-end="url(#gsHead)"/>` : '';
  const nums = anim === 'gsall' ? zones.map(z => `<g class="gsnum"><circle cx="${GS_NUM[z][0]}" cy="${GS_NUM[z][1]}" r="6.2"/><text x="${GS_NUM[z][0]}" y="${GS_NUM[z][1] + 3}" text-anchor="middle">${z.slice(2)}</text></g>`).join('') : '';
  return `<defs><marker id="gsHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#555a61"/></marker></defs>
    <g class="gsov">${side}<g transform="translate(200 0) scale(-1 1)">${side}</g>${center}${nums}</g>`;
}
function faceSVG(anim, cls = '') {
  if (anim && anim.startsWith('gs')) cls += ' gs';
  const lipD = '#a63a55', mouthIn = '#4e1222', line = 'rgba(150,92,72,.55)';
  return `<svg class="face f-${anim} ${cls}" viewBox="0 0 200 230" aria-hidden="true">
    <defs><radialGradient id="fskin" cx="48%" cy="38%" r="68%"><stop offset="0" stop-color="#f8e1d2"/><stop offset=".65" stop-color="#efcab3"/><stop offset="1" stop-color="#d9a68b"/></radialGradient>
    <linearGradient id="fhair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2622"/><stop offset="1" stop-color="#160d0b"/></linearGradient>
    <linearGradient id="flip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c25a72"/><stop offset="1" stop-color="#963049"/></linearGradient>
    <radialGradient id="firis" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#7b5a3c"/><stop offset="1" stop-color="#2e1c12"/></radialGradient>
    <linearGradient id="fquartz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6c9d6"/><stop offset="1" stop-color="#d98aa3"/></linearGradient></defs>
    <path d="M38 104 Q32 28 100 24 Q168 28 162 104 L172 204 Q150 218 132 198 L128 150 L72 150 L68 198 Q50 218 28 204Z" fill="url(#fhair)"/>
    <path d="M10 230 Q20 198 72 192 L128 192 Q180 198 190 230Z" fill="var(--pink)"/><path d="M84 192 L100 214 L116 192" fill="#e2b49b"/>
    <path d="M80 140 Q81 176 76 196 Q100 206 124 196 Q119 176 120 140Z" fill="#e6b9a1"/>
    <path d="M80 150 Q100 176 120 150 L120 164 Q100 184 80 164Z" fill="rgba(140,80,60,.28)"/>
    <path class="neckline fl" d="M88 182 Q100 188 112 182 M92 193 Q100 197 108 193" stroke="${line}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g class="head">
      <ellipse class="bulge" cx="47" cy="134" rx="15" ry="19" fill="#efcab3"/><ellipse class="bulge" cx="153" cy="134" rx="15" ry="19" fill="#efcab3"/>
      <ellipse cx="44" cy="112" rx="7" ry="12" fill="#e6b9a1"/><ellipse cx="156" cy="112" rx="7" ry="12" fill="#e6b9a1"/>
      <path d="M44 102 Q44 50 100 42 Q156 50 156 102 Q156 140 137 160 Q118 179 100 181 Q82 179 63 160 Q44 140 44 102Z" fill="url(#fskin)"/>
      <path d="M50 120 Q56 150 74 166 Q60 146 58 118Z M150 120 Q144 150 126 166 Q140 146 142 118Z" fill="rgba(170,100,80,.18)"/>
      <path class="bangs" d="M42 106 Q36 40 100 34 Q162 38 160 102 Q152 64 120 54 Q98 74 66 72 Q52 82 42 106Z" fill="url(#fhair)"/>
      <path d="M66 70 Q90 66 112 52 M80 66 Q100 58 116 50 M128 58 Q146 72 154 96" stroke="rgba(255,255,255,.08)" stroke-width="1.5" fill="none"/>
      <path class="fl" d="M78 66 Q100 61 122 66 M82 72 Q100 68 118 72" stroke="${line}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <ellipse class="hollow" cx="70" cy="140" rx="9" ry="15" fill="rgba(140,70,55,.24)"/><ellipse class="hollow" cx="130" cy="140" rx="9" ry="15" fill="rgba(140,70,55,.24)"/>
      <ellipse class="ck" cx="68" cy="130" rx="13" ry="8" fill="rgba(226,110,124,.32)"/><ellipse class="ck" cx="132" cy="130" rx="13" ry="8" fill="rgba(226,110,124,.32)"/>
      <path class="bw" d="M61 86 Q73 75 90 81 Q76 80 61 89Z" fill="#33201c"/><path class="bw" d="M139 86 Q127 75 110 81 Q124 80 139 89Z" fill="#33201c"/>
      <g class="eye"><path d="M65 101 Q76 92 89 101 Q77 108 65 101Z" fill="#fbf7f2"/><g class="pu"><circle cx="77" cy="100.5" r="5" fill="url(#firis)"/><circle cx="77" cy="100.5" r="2.1" fill="#120a07"/><circle cx="78.6" cy="98.8" r="1.1" fill="#fff"/></g><path d="M64 101 Q76 91 90 100" stroke="#24150f" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M66 99 l-3 -3 M70 95.6 l-1.6 -3.4 M75 94 l-.6 -3.6 M80 94 l.6 -3.4 M85 96 l1.6 -3" stroke="#24150f" stroke-width="1.1" stroke-linecap="round"/><path d="M67 103.5 Q77 108 87 103" stroke="${line}" stroke-width="1" fill="none"/></g>
      <g class="eye"><path d="M135 101 Q124 92 111 101 Q123 108 135 101Z" fill="#fbf7f2"/><g class="pu"><circle cx="123" cy="100.5" r="5" fill="url(#firis)"/><circle cx="123" cy="100.5" r="2.1" fill="#120a07"/><circle cx="124.6" cy="98.8" r="1.1" fill="#fff"/></g><path d="M136 101 Q124 91 110 100" stroke="#24150f" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M134 99 l3 -3 M130 95.6 l1.6 -3.4 M125 94 l.6 -3.6 M120 94 l-.6 -3.4 M115 96 l-1.6 -3" stroke="#24150f" stroke-width="1.1" stroke-linecap="round"/><path d="M133 103.5 Q123 108 113 103" stroke="${line}" stroke-width="1" fill="none"/></g>
      <path d="M97 100 Q95 114 92 123" stroke="rgba(160,100,80,.45)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M91 125 Q95 129 100 127.5 Q105 129 109 125" stroke="#b07c66" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="120" rx="3.5" ry="2.2" fill="rgba(255,255,255,.35)"/>
      <path class="chin" d="M91 170 Q100 175 109 170" stroke="${line}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <g class="mouth">
        <g class="m m-n"><path d="M86 148 Q93 142 100 145.5 Q107 142 114 148 Q100 150.5 86 148Z" fill="url(#flip)"/><path d="M86 148 Q100 151 114 148 Q108 157 100 157 Q92 157 86 148Z" fill="${lipD}"/><path d="M93 153 Q100 155 106 153" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/></g>
        <path class="m m-press" d="M88 149 Q100 146.5 112 149 Q100 152 88 149Z" fill="${lipD}"/>
        <g class="m m-fish"><ellipse cx="100" cy="149" rx="7.5" ry="9.5" fill="url(#flip)"/><ellipse cx="100" cy="149" rx="2.6" ry="4.2" fill="${mouthIn}"/></g>
        <g class="m m-open"><ellipse cx="100" cy="152" rx="13" ry="13.5" fill="${mouthIn}" stroke="${lipD}" stroke-width="3.5"/><path d="M90 141 Q100 139 110 141 L109 146 Q100 147.5 91 146Z" fill="#fff"/></g>
        <g class="m m-smile"><path d="M79 143 Q100 168 121 143 Q100 152 79 143Z" fill="${mouthIn}" stroke="${lipD}" stroke-width="3" stroke-linejoin="round"/><path d="M84 145.5 Q100 152 116 145.5 L114 150 Q100 155 86 150Z" fill="#fff"/></g>
        <ellipse class="m m-kiss" cx="100" cy="148" rx="7.5" ry="6.5" fill="url(#flip)"/>
        <ellipse class="m m-o" cx="100" cy="150" rx="8.5" ry="12" fill="${mouthIn}" stroke="${lipD}" stroke-width="3.5"/>
        <ellipse class="m m-e" cx="100" cy="149" rx="17" ry="4.5" fill="${mouthIn}" stroke="${lipD}" stroke-width="3.5"/>
        <rect class="tongue" x="93" y="153" width="14" height="24" rx="7" fill="#e26a88"/>
      </g>
      ${faceTools(anim)}${anim && anim.startsWith('gs') ? gsOverlay(anim) : ''}
    </g></svg>`;
}
const Face = {
  sub: 'workouts', month: today().slice(0, 7), ed: null, P: null, q: '', cat: 'Alle', rq: '',
  data() { const d = Store.get('face', {}); return { custom: d.custom || [], routines: d.routines || clone(FACE_DEF_ROUTINES) }; },
  save(fn) { const d = clone(this.data()); fn(d); Store.set('face', d); App.render(); },
  all() { return [...FACE_LIB, ...this.data().custom.map(c => ({ cat: 'Eigene', ...c }))]; },
  find(q, cat) {
    q = (q || '').toLowerCase().trim();
    return this.all().filter(e => (!cat || cat === 'Alle' || e.cat === cat) && (!q || (e.name + ' ' + (e.cat || '') + ' ' + (FACE_ANIMS[e.anim] || '') + ' ' + (e.desc || '')).toLowerCase().includes(q)));
  },
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
  const custom = Face.data().custom.map(e => e.id), list = Face.find(Face.q, Face.cat);
  const cats = [...FACE_CATS, ...(custom.length ? ['Eigene'] : [])];
  return `<div class="stack" style="margin-bottom:12px"><input id="faq" data-i="faQ" type="search" placeholder="Suchen: Gua Sha, Kiefer, Augen, Stirn …" value="${esc(Face.q)}" autocomplete="off">
    <div class="chips">${cats.map(c => `<button class="chip" data-a="faCat" data-v="${c}" aria-pressed="${Face.cat === c}">${c}</button>`).join('')}</div></div>
    <div class="faces">${list.map(e => `<button class="facecard" data-a="faDetail" data-v="${e.id}">${faceSVG(e.anim)}<span>${esc(e.name)}</span><span class="small">${esc(e.cat || '')} · ${e.sec} Sek</span></button>`).join('')}
    <button class="facecard" data-a="faCustom" data-v="" style="border-style:dashed;place-content:center;min-height:180px">${ic('plus')}<span>Eigene Übung</span></button></div>
    ${list.length ? '' : '<p class="empty">Nichts gefunden – probier ein anderes Wort oder leg eine eigene Übung an.</p>'}`;
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
    <input id="rq" data-i="faRQ" type="search" placeholder="Suchen: Massage, Gua Sha, Augen …" value="${esc(Face.rq)}" autocomplete="off" style="margin-bottom:8px">
    <div class="anim-pick">${Face.find(Face.rq).map(e => `<button data-a="faAddItem" data-v="${e.id}">${faceSVG(e.anim)}<span>${esc(e.name)}</span></button>`).join('') || '<p class="empty">Nichts gefunden.</p>'}</div>
    <div class="row" style="margin-top:16px">${r.isNew ? '' : `<button class="danger" data-a="faDelRoutine">${ic('trash')} Löschen</button>`}<button class="pri grow" data-a="faSaveRoutine">Speichern</button></div>`;
}
Actions.faSub = el => { Face.sub = el.dataset.v; App.render(); };
Changes.faQ = el => { Face.q = el.value; App.render(); };
Changes.faRQ = el => { Face.rq = el.value; App.refreshModal(); };
Actions.faCat = el => { Face.cat = el.dataset.v; App.render(); };
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
