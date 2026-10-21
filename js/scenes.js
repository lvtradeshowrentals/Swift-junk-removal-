/* ============================================================================
   Daytime illustrations for the Services showroom. Five scenes, one per service,
   each a different building with that job's real pile out front (the same item art
   the ride uses) and the Swift truck waiting on the right. Canvas is 800 x 600.
   Placeholder art: swap any scene for a real photo later without touching the layout.
   ========================================================================== */
(function (SW) {
  'use strict';
  const { f, mk } = SW;
  SW.scenes = {};
  const W = 800, H = 600, GROUND = 396, DY = 80;   /* content sits DY lower than its own coordinates, leaving more sky for the labels */

  SW.scenes.defs = function () {
    return `
      <linearGradient id="svSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3dcf5"/><stop offset=".55" stop-color="#e5eef8"/><stop offset="1" stop-color="#fdf0dc"/></linearGradient>
      <radialGradient id="svSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff8e6"/><stop offset=".35" stop-color="#ffe9b8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/></radialGradient>
      <linearGradient id="svFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4bddc"/><stop offset="1" stop-color="#d4d6ea"/></linearGradient>
      <linearGradient id="svNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3b3a6"/><stop offset="1" stop-color="#ead3bf"/></linearGradient>
      <linearGradient id="svGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e2d5"/><stop offset="1" stop-color="#d2cabb"/></linearGradient>
      <linearGradient id="svStucco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#efdcc4"/><stop offset="1" stop-color="#e3cbb0"/></linearGradient>
      <linearGradient id="svSage" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe6dc"/><stop offset="1" stop-color="#cdd8cb"/></linearGradient>
      <linearGradient id="svCream" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6ebd9"/><stop offset="1" stop-color="#ecdcc3"/></linearGradient>
      <linearGradient id="svRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d27545"/><stop offset="1" stop-color="#b25a33"/></linearGradient>
      <linearGradient id="svGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d5e8f8"/><stop offset="1" stop-color="#a9c8e6"/></linearGradient>
      <linearGradient id="svDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2e40"/><stop offset="1" stop-color="#4c4656"/></linearGradient>
      <linearGradient id="svShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b2440" stop-opacity=".0"/><stop offset="1" stop-color="#1b2440" stop-opacity=".14"/></linearGradient>
      <linearGradient id="svWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7c690"/><stop offset="1" stop-color="#cfa56d"/></linearGradient>
    `;
  };

  /* ---------- shared pieces ---------- */
  const skyBg = () => `<rect width="${W}" height="${H + DY}" fill="url(#svSky)"/><circle cx="650" cy="128" r="92" fill="url(#svSun)"/><g class="sv-clouds" fill="#fff" opacity=".9"><ellipse cx="170" cy="96" rx="58" ry="13"/><ellipse cx="206" cy="86" rx="36" ry="12"/><ellipse cx="520" cy="170" rx="70" ry="12"/><ellipse cx="556" cy="161" rx="38" ry="11"/><ellipse cx="740" cy="236" rx="54" ry="10"/></g>`;
  const sky = () => {
    let s = '';
    s += `<path d="M0 352 L58 318 L112 340 L190 288 L268 336 L346 304 L430 348 L520 296 L610 338 L700 308 L800 346 V380 H0Z" fill="url(#svFar)"/>`;
    s += `<path d="M0 372 Q90 336 190 366 T380 360 T580 368 T800 352 V400 H0Z" fill="url(#svNear)"/>`;
    return s;
  };
  const ground = () => {
    let s = `<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="url(#svGround)"/><path d="M0 ${GROUND} H${W}" stroke="#bfb6a4" stroke-width="2"/>`;
    s += `<path d="M0 ${GROUND + 2} H${W} V${GROUND + 9} H0Z" fill="#c9c1b0"/>`;
    return s;
  };
  const truck = () => {
    const t = SW.truck.markup().replace('<g id="bedItems"></g>', '').replace(/ id="[^"]*"/g, '');
    return `<g transform="translate(512 526) scale(.4)">${t}</g>`;
  };
  const shadow = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * .09)}" fill="#1b2440" opacity=".2" filter="url(#fblur3)"/>`;
  let n = 0;
  const item = (type, x, y, s, rot) => {
    const i = n++;
    return `<g transform="translate(${x} ${y})"><g class="it-pop" style="--i:${i}"><g transform="rotate(${rot || 0}) scale(${s})"><use href="#it-${type}"/></g></g></g>`;
  };
  const pile = (list) => {
    n = 0; let s = '';
    list.forEach((it, i) => { if (it[2] > 480) s += `<g class="it-sh" style="--i:${i}">${shadow(it[1], it[2] + 2, SW.ITEM_DIM[it[0]].w * it[3] / 2 * (it[4] ? .45 : 1))}</g>`; });
    list.forEach((it) => { s += item(it[0], it[1], it[2], it[3], it[4]); });
    return s;
  };
  const roofTiles = (x0, x1, y0, y1, clip) => {
    let s = '';
    for (let y = y0 + 8; y < y1; y += 9) s += `M${x0} ${y} H${x1} `;
    return `<path d="${s}" stroke="#8f4325" stroke-opacity=".28" stroke-width="1.6" fill="none" clip-path="url(#${clip})"/>`;
  };
  const win = (x, y, w, h, shutters) => {
    let s = `<rect x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}" rx="3" fill="#fbf6ec"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#svGlass)"/>`;
    s += `<path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="#fbf6ec" stroke-width="3"/><path d="M${x + 4} ${y + h - 4} L${x + w * .5} ${y + 4} H${x + w * .7} L${x + w * .25} ${y + h - 4}Z" fill="#fff" opacity=".35"/>`;
    s += `<rect x="${x - 7}" y="${y + h + 5}" width="${w + 14}" height="5" rx="1.5" fill="#d3b79a"/>`;
    if (shutters) s += `<rect x="${x - 26}" y="${y - 4}" width="18" height="${h + 8}" rx="2" fill="#23314f"/><rect x="${x + w + 8}" y="${y - 4}" width="18" height="${h + 8}" rx="2" fill="#23314f"/>`;
    return s;
  };
  const agave = (x, y, k) => {
    let s = '';
    for (let i = 0; i < 9; i++) { const a = -90 + (i - 4) * 17, L = 36 * k, r = a * Math.PI / 180; s += `<path d="M${x} ${y} Q${f(x + Math.cos(r) * L * .6 - 4)} ${f(y + Math.sin(r) * L * .6)} ${f(x + Math.cos(r) * L)} ${f(y + Math.sin(r) * L)} Q${f(x + Math.cos(r) * L * .6 + 4)} ${f(y + Math.sin(r) * L * .6)} ${x} ${y}Z" fill="${i % 2 ? '#5f9a86' : '#4a8470'}"/>`; }
    return s;
  };
  const palm = (x, y, h) => {
    let s = `<path d="M${x - 5} ${y} Q${x + 9} ${y - h * .5} ${x + 2} ${y - h} L${x + 7} ${y - h} Q${x + 16} ${y - h * .5} ${x + 5} ${y}Z" fill="#9b7a62"/>`;
    for (let i = 0; i < 9; i++) { const a = -170 + i * 20, r = a * Math.PI / 180, L = 52; s += `<path d="M${x + 4} ${y - h} Q${f(x + 4 + Math.cos(r) * L * .5)} ${f(y - h + Math.sin(r) * L * .5 - 12)} ${f(x + 4 + Math.cos(r) * L)} ${f(y - h + Math.sin(r) * L + 12)}" stroke="${i % 2 ? '#4d8f62' : '#3b7a52'}" stroke-width="6" stroke-linecap="round" fill="none"/>`; }
    return s;
  };

  /* ---------- A: garage and home ---------- */
  function garage() {
    let s = sky() + palm(560, GROUND + 4, 150) + ground();
    s += `<rect x="-20" y="170" width="500" height="${GROUND - 170}" fill="url(#svStucco)"/><rect x="-20" y="170" width="500" height="${GROUND - 170}" fill="url(#svShade)"/>`;
    s += `<clipPath id="cpA"><path d="M-34 172 L494 172 L446 112 L14 112Z"/></clipPath><path d="M-34 172 L494 172 L446 112 L14 112Z" fill="url(#svRoof)"/>${roofTiles(-20, 480, 112, 172, 'cpA')}<rect x="-34" y="170" width="528" height="9" fill="#f6efe2"/><rect x="-34" y="179" width="528" height="6" fill="#1b2440" opacity=".14"/>`;
    /* open garage: dark interior with shelves */
    s += `<rect x="62" y="214" width="244" height="${GROUND - 214}" fill="#fbf6ec"/><rect x="72" y="224" width="224" height="${GROUND - 224}" fill="url(#svDark)"/>`;
    s += `<path d="M72 300 H296 M72 352 H296" stroke="#8a7a66" stroke-width="5"/>`;
    s += `<g opacity=".85"><rect x="84" y="262" width="40" height="38" fill="#b48a5c"/><rect x="130" y="276" width="30" height="24" fill="#c79a68"/><rect x="236" y="256" width="46" height="44" fill="#a97f52"/><rect x="92" y="318" width="52" height="34" fill="#c79a68"/><rect x="226" y="324" width="60" height="28" fill="#b48a5c"/><rect x="170" y="330" width="34" height="22" fill="#d9ae7c"/></g>`;
    s += `<circle cx="184" cy="236" r="26" fill="#ffe9b4" opacity=".35"/><path d="M184 224 V234" stroke="#fff4d2" stroke-width="2"/><circle cx="184" cy="238" r="5" fill="#fff4d2"/>`;
    s += `<rect x="62" y="214" width="244" height="26" fill="#f4eee2"/><path d="M62 227 H306" stroke="#d9cfbd" stroke-width="2"/><path d="M96 214 V240 M130 214 V240 M164 214 V240 M198 214 V240 M232 214 V240 M266 214 V240" stroke="#d9cfbd" stroke-width="2"/>`;
    s += win(356, 236, 70, 64, true);
    s += `<rect x="330" y="205" width="14" height="22" rx="3" fill="#fff4d2"/><rect x="328" y="203" width="18" height="5" fill="#23314f"/>`;
    s += `<path d="M62 ${GROUND} H306 L396 ${H} H-30 L40 ${GROUND}Z" fill="#e3ddd0"/><path d="M184 ${GROUND} L184 ${H} M120 ${GROUND} L60 ${H} M250 ${GROUND} L322 ${H}" stroke="#bfb6a4" stroke-width="2"/>`;
    s += agave(420, GROUND + 14, 1.1) + agave(452, GROUND + 18, .8);
    s += truck();
    s += pile([['boxStack', 106, 506, 1.1, 0], ['mattress', 112, 416, .98, -5], ['box', 176, 514, 1.05, 0], ['bike', 262, 514, 1.1, 0], ['armchair', 410, 516, 1.05, 0]]);
    return s;
  }

  /* ---------- B: furniture and appliances (apartment turnover) ---------- */
  function furniture() {
    let s = sky() + ground();
    s += `<rect x="-10" y="130" width="480" height="${GROUND - 130}" fill="url(#svSage)"/><rect x="-10" y="130" width="480" height="${GROUND - 130}" fill="url(#svShade)"/>`;
    s += `<rect x="-14" y="116" width="488" height="18" fill="#f0f3f6"/><rect x="-14" y="134" width="488" height="6" fill="#1b2440" opacity=".16"/>`;
    s += `<rect x="-10" y="262" width="480" height="10" fill="#f0f3f6"/><rect x="-10" y="272" width="480" height="5" fill="#1b2440" opacity=".12"/>`;
    [[28, 156], [138, 156], [248, 156], [358, 156]].forEach(([x, y]) => { s += win(x, y, 62, 74, false); });
    [[28, 300], [138, 300], [248, 300]].forEach(([x, y]) => { s += win(x, y, 62, 62, false); });
    /* balcony rails */
    for (let x = 20; x < 330; x += 110) { s += `<rect x="${x}" y="232" width="84" height="5" fill="#23314f"/><path d="${Array.from({ length: 9 }, (_, i) => `M${x + 4 + i * 10} 232 V262`).join(' ')}" stroke="#23314f" stroke-width="2.2"/><rect x="${x}" y="262" width="84" height="5" fill="#23314f"/>`; }
    /* stair tower and entry */
    s += `<rect x="366" y="150" width="104" height="${GROUND - 150}" fill="#c4cfd8"/><path d="${Array.from({ length: 12 }, (_, i) => `M366 ${166 + i * 18} H470`).join(' ')}" stroke="#f0f3f6" stroke-width="5" opacity=".9"/><rect x="366" y="150" width="104" height="8" fill="#23314f"/>`;
    s += `<rect x="380" y="328" width="76" height="${GROUND - 328}" fill="#23314f"/><rect x="386" y="334" width="64" height="${GROUND - 334}" fill="url(#svGlass)"/><path d="M418 334 V${GROUND}" stroke="#23314f" stroke-width="3"/>`;
    s += `<rect x="372" y="318" width="92" height="10" fill="#f0f3f6"/>`;
    s += agave(80, GROUND + 14, 1) + agave(300, GROUND + 14, .9);
    s += truck();
    s += pile([['couch', 122, 514, 1.1, 0], ['mattress', 124, 428, 1.02, -3], ['fridge', 240, 516, 1.05, 0], ['tv', 316, 516, 1.1, 0], ['box', 414, 516, 1.05, 0]]);
    return s;
  }

  /* ---------- C: construction and renovation ---------- */
  function construction() {
    let s = sky() + ground();
    /* bare framing on the left, house wrap and ply on the right */
    s += `<rect x="-10" y="176" width="300" height="${GROUND - 176}" fill="#f2e9dc"/>`;
    for (let x = -4; x < 290; x += 22) s += `<rect x="${x}" y="176" width="7" height="${GROUND - 176}" fill="url(#svWood)"/>`;
    s += `<rect x="-10" y="176" width="300" height="9" fill="#cfa56d"/><rect x="-10" y="${GROUND - 9}" width="300" height="9" fill="#cfa56d"/><rect x="-10" y="268" width="300" height="7" fill="#d9b27a"/>`;
    s += `<path d="M2 176 L120 268 M120 268 L2 ${GROUND - 9}" stroke="#c19760" stroke-width="5" opacity=".7"/>`;
    s += `<rect x="290" y="176" width="190" height="${GROUND - 176}" fill="#eceff4"/><rect x="290" y="176" width="190" height="${GROUND - 176}" fill="url(#svShade)"/>`;
    s += `<path d="${Array.from({ length: 9 }, (_, i) => `M290 ${196 + i * 24} L480 ${176 + i * 24}`).join(' ')}" stroke="#c5ccd9" stroke-width="2" opacity=".7"/>`;
    s += `<rect x="330" y="214" width="76" height="70" fill="#9fb8d6"/><rect x="330" y="214" width="76" height="70" fill="none" stroke="#eceff4" stroke-width="6"/><path d="M368 214 V284 M330 249 H406" stroke="#eceff4" stroke-width="4"/>`;
    s += `<rect x="410" y="300" width="70" height="${GROUND - 300}" fill="#e0c28f"/><path d="M410 ${GROUND - 40} H480" stroke="#b98c58" stroke-width="2"/>`;
    /* roof trusses */
    s += `<path d="M-10 176 L120 96 L250 176 M250 176 L370 96 L490 176 M120 96 V176 M370 96 V176 M-10 176 H490" stroke="#cfa56d" stroke-width="9" fill="none" stroke-linejoin="round"/><path d="M370 96 L490 176" stroke="#cfa56d" stroke-width="9"/>`;
    s += `<path d="M262 118 L490 118 L490 176 L330 176Z" fill="#2c6fb5" opacity=".92"/><path d="M290 140 L470 128" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`;
    /* ladder and cones */
    s += `<g transform="translate(210 ${GROUND}) rotate(-8)"><rect x="-4" y="-170" width="6" height="170" fill="#e8803f"/><rect x="30" y="-170" width="6" height="170" fill="#e8803f"/>${Array.from({ length: 9 }, (_, i) => `<rect x="-4" y="${-156 + i * 18}" width="40" height="4" fill="#f5b383"/>`).join('')}</g>`;
    s += `<g><path d="M462 ${GROUND + 26} l8 -34 l8 34Z" fill="#e8803f"/><rect x="458" y="${GROUND + 24}" width="24" height="5" fill="#d5702f"/><path d="M465 ${GROUND + 10} h10" stroke="#fff" stroke-width="3"/></g>`;
    s += truck();
    s += pile([['lumber', 92, 512, 1.0, 0], ['drywall', 228, 516, 1.05, 0], ['bags', 316, 516, 1.1, 0], ['bucket', 382, 516, 1.05, 0], ['cabinet', 452, 516, 1.05, 0]]);
    return s;
  }

  /* ---------- D: commercial and property ---------- */
  function commercial() {
    let s = sky() + ground();
    s += `<rect x="-10" y="168" width="490" height="${GROUND - 168}" fill="#e9edf3"/>`;
    s += `<rect x="-14" y="150" width="498" height="24" fill="#1c2740"/><rect x="-14" y="174" width="498" height="5" fill="#e8803f"/>`;
    s += `<g transform="translate(36 154) scale(.16)"><use href="#mark-dark" width="172" height="108"/></g><rect x="80" y="158" width="120" height="9" rx="3" fill="#f5f8fd" opacity=".8"/>`;
    s += `<rect x="30" y="196" width="440" height="${GROUND - 196}" fill="#23314f"/>`;
    for (let i = 0; i < 4; i++) { const x = 36 + i * 108; s += `<rect x="${x}" y="202" width="102" height="${GROUND - 208}" fill="url(#svGlass)"/>`; }
    /* office glimpsed through the glass */
    s += `<g opacity=".7"><rect x="52" y="300" width="70" height="8" fill="#7e8fb2"/><rect x="60" y="308" width="6" height="36" fill="#7e8fb2"/><rect x="108" y="308" width="6" height="36" fill="#7e8fb2"/><rect x="82" y="276" width="30" height="24" fill="#5f7094"/><rect x="164" y="316" width="64" height="8" fill="#7e8fb2"/><rect x="172" y="324" width="6" height="30" fill="#7e8fb2"/><rect x="214" y="324" width="6" height="30" fill="#7e8fb2"/><rect x="262" y="286" width="26" height="60" fill="#9aa9c6"/><rect x="368" y="310" width="62" height="8" fill="#7e8fb2"/></g>`;
    for (let i = 0; i < 4; i++) { const x = 36 + i * 108; s += `<path d="M${x + 8} ${GROUND - 14} L${x + 64} 206 H${x + 88} L${x + 30} ${GROUND - 14}Z" fill="#fff" opacity=".28"/>`; }
    s += `<rect x="30" y="196" width="440" height="6" fill="#1c2740"/><rect x="30" y="${GROUND - 8}" width="440" height="8" fill="#1c2740"/>`;
    s += `<rect x="40" y="218" width="64" height="${GROUND - 220}" fill="none"/><path d="M144 202 V${GROUND} M252 202 V${GROUND} M360 202 V${GROUND}" stroke="#23314f" stroke-width="6"/>`;
    s += `<path d="M20 196 L480 196 L498 184 L2 184Z" fill="#c9d3e2"/>`;
    s += agave(494, GROUND + 14, .9);
    s += truck();
    s += pile([['desk', 92, 516, 1.1, 0], ['chair', 178, 516, 1.12, 0], ['filing', 234, 516, 1.12, 0], ['boxStack', 306, 516, 1.08, 0], ['monitor', 392, 516, 1.12, 0]]);
    return s;
  }

  /* ---------- E: estate and move-out ---------- */
  function estate() {
    let s = sky() + palm(540, GROUND + 4, 170) + ground();
    s += `<rect x="40" y="206" width="400" height="${GROUND - 206}" fill="url(#svCream)"/><rect x="40" y="206" width="400" height="${GROUND - 206}" fill="url(#svShade)"/>`;
    s += `<clipPath id="cpE"><path d="M18 210 L240 78 L462 210Z"/></clipPath><path d="M18 210 L240 78 L462 210Z" fill="url(#svRoof)"/>${roofTiles(18, 462, 78, 210, 'cpE')}<path d="M18 210 L240 78 L462 210" fill="none" stroke="#f6efe2" stroke-width="7" stroke-linejoin="round"/>`;
    s += `<circle cx="240" cy="150" r="22" fill="#fbf6ec"/><circle cx="240" cy="150" r="16" fill="url(#svGlass)"/><path d="M240 134 V166 M224 150 H256" stroke="#fbf6ec" stroke-width="3"/>`;
    s += win(88, 238, 56, 66, true) + win(336, 238, 56, 66, true);
    s += `<rect x="150" y="318" width="180" height="${GROUND - 318}" fill="#fbf6ec" opacity=".0"/>`;
    s += `<rect x="150" y="300" width="180" height="12" fill="#fbf6ec"/><rect x="150" y="312" width="180" height="5" fill="#1b2440" opacity=".14"/>`;
    [158, 218, 296].forEach((x) => { s += `<rect x="${x}" y="312" width="14" height="${GROUND - 312}" fill="#fbf6ec"/><rect x="${x - 3}" y="${GROUND - 8}" width="20" height="8" fill="#e5dccb"/>`; });
    s += `<rect x="238" y="326" width="52" height="${GROUND - 326}" fill="#23314f"/><rect x="246" y="336" width="36" height="22" fill="url(#svGlass)"/><circle cx="268" cy="366" r="10" fill="none" stroke="#5f9a6a" stroke-width="4"/><circle cx="282" cy="${GROUND - 24}" r="2.5" fill="#e8c27a"/>`;
    s += `<path d="M230 ${GROUND} H298 L312 ${GROUND + 14} H216Z" fill="#e5dccb"/>`;
    s += `<path d="M118 ${GROUND + 6} H250 V${H} H60Z" fill="#e3ddd0" opacity="0"/>`;
    s += `<rect x="52" y="${GROUND - 22}" width="96" height="24" rx="10" fill="#5f9a6a"/><rect x="340" y="${GROUND - 22}" width="96" height="24" rx="10" fill="#5f9a6a"/>`;
    s += agave(30, GROUND + 14, 1.05);
    s += truck();
    s += pile([['dresser', 92, 516, 1.1, 0], ['armchair', 192, 516, 1.1, 0], ['boxStack', 272, 516, 1.1, 0], ['lamp', 338, 516, 1.12, 0], ['frames', 400, 516, 1.12, 0]]);
    return s;
  }

  const wrap = (fn) => () => skyBg() + `<g transform="translate(0 ${DY})">` + fn() + '</g>';
  SW.scenes.build = { garage: wrap(garage), furniture: wrap(furniture), construction: wrap(construction), commercial: wrap(commercial), estate: wrap(estate) };
  SW.scenes.H = H + DY;

  /* labels pinned to the pile: [text, x, y of the item's top, stem length], all in canvas units */
  SW.scenes.pins = {
    garage: [['Boxes and bins', 100, 500, 56, 'l'], ['Bikes', 262, 521, 40, 'c'], ['Armchairs', 410, 504, 40, 'c']],
    furniture: [['Couches', 120, 506, 58, 'l'], ['Refrigerators', 240, 460, 38, 'c'], ['TVs', 316, 528, 78, 'c'], ['Boxes', 414, 548, 40, 'c']],
    construction: [['Lumber', 92, 552, 40, 'l'], ['Drywall', 228, 554, 78, 'c'], ['Debris bags', 316, 530, 40, 'c'], ['Cabinets', 452, 531, 78, 'c']],
    commercial: [['Desks', 92, 519, 40, 'l'], ['Chairs', 178, 502, 74, 'c'], ['File cabinets', 234, 506, 36, 'c'], ['Monitors', 392, 531, 40, 'c']],
    estate: [['Dressers', 92, 512, 40, 'l'], ['Armchairs', 192, 499, 74, 'c'], ['Lamps', 338, 488, 36, 'c'], ['Frames', 400, 524, 74, 'c']],
  };

})(window.SW);
