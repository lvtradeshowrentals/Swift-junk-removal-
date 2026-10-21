/* ============================================================================
   The junk and the crew. Items are drawn once as <g id="it-NAME"> in the shared
   sprite (origin = bottom centre, up is negative) and re-used with <use>, so
   the pile at the kerb, the item in the crew's hands, the item in flight and
   the item in the bed are all the same artwork.
   ========================================================================== */
(function (SW) {
  'use strict';

  /* name: [width, height, art]. Art is drawn inside x -w/2..w/2, y -h..0 */
  const A = {};

  A.box = [62, 46, `
    <rect x="-31" y="-46" width="62" height="46" rx="2" fill="#c99a6c"/>
    <rect x="-31" y="-46" width="62" height="11" rx="2" fill="#dcb286"/>
    <rect x="-4.5" y="-46" width="9" height="46" fill="#ecd6ae" opacity=".8"/>
    <rect x="-31" y="-14" width="62" height="14" fill="#5b3a2a" opacity=".16"/>
    <rect x="11" y="-27" width="15" height="10" rx="1" fill="#f4efe5" opacity=".92"/>
    <path d="M13 -23 H24 M13 -20 H21" stroke="#9aa0b4" stroke-width="1"/>`];

  A.boxStack = [74, 86, `
    <rect x="-36" y="-46" width="68" height="46" rx="2" fill="#c0905f"/>
    <rect x="-36" y="-46" width="68" height="10" rx="2" fill="#d4a97b"/>
    <rect x="-6" y="-46" width="8" height="46" fill="#ecd6ae" opacity=".75"/>
    <rect x="-36" y="-14" width="68" height="14" fill="#5b3a2a" opacity=".18"/>
    <rect x="-26" y="-86" width="54" height="40" rx="2" fill="#d1a276" transform="rotate(-3 0 -46)"/>
    <rect x="-26" y="-86" width="54" height="9" rx="2" fill="#e3bb91" transform="rotate(-3 0 -46)"/>
    <rect x="-2.5" y="-86" width="7" height="40" fill="#ecd6ae" opacity=".7" transform="rotate(-3 0 -46)"/>`];

  A.mattress = [132, 22, `
    <rect x="-66" y="-22" width="132" height="22" rx="8" fill="#e6e1d6"/>
    <rect x="-66" y="-22" width="132" height="8" rx="4" fill="#f7f4ec"/>
    <path d="M-58 -11 H58" stroke="#c5bdad" stroke-width="1.3" stroke-dasharray="7 4"/>
    <rect x="-66" y="-7" width="132" height="3.4" fill="#8b93b8" opacity=".55"/>
    <rect x="-66" y="-3" width="132" height="3" rx="1.5" fill="#b4ad9e" opacity=".5"/>
    <rect x="42" y="-17" width="14" height="6" rx="1" fill="#f4efe5"/>`];

  A.armchair = [96, 88, `
    <rect x="-40" y="-88" width="80" height="62" rx="12" fill="#7a4f36"/>
    <rect x="-40" y="-88" width="80" height="14" rx="9" fill="#93653f" opacity=".9"/>
    <rect x="-33" y="-42" width="66" height="24" rx="8" fill="#9a6a47"/>
    <rect x="-33" y="-42" width="66" height="7" rx="5" fill="#b27c56" opacity=".8"/>
    <rect x="-48" y="-56" width="17" height="46" rx="8" fill="#85583a"/>
    <rect x="31" y="-56" width="17" height="46" rx="8" fill="#85583a"/>
    <rect x="-40" y="-12" width="9" height="12" rx="2" fill="#2a1a14"/><rect x="31" y="-12" width="9" height="12" rx="2" fill="#2a1a14"/>
    <path d="M-30 -78 H30 M-30 -64 H30" stroke="#5b3a28" stroke-width="1" opacity=".5"/>
    <circle cx="-14" cy="-70" r="1.6" fill="#5b3a28"/><circle cx="0" cy="-70" r="1.6" fill="#5b3a28"/><circle cx="14" cy="-70" r="1.6" fill="#5b3a28"/>`];

  A.couch = [156, 80, `
    <rect x="-74" y="-80" width="148" height="52" rx="14" fill="#56648a"/>
    <rect x="-74" y="-80" width="148" height="13" rx="9" fill="#6f7ea6" opacity=".9"/>
    <rect x="-62" y="-44" width="124" height="26" rx="8" fill="#6a79a0"/>
    <path d="M-20 -44 V-18 M21 -44 V-18" stroke="#46527a" stroke-width="1.4"/>
    <rect x="-78" y="-56" width="22" height="46" rx="10" fill="#5c6b92"/>
    <rect x="56" y="-56" width="22" height="46" rx="10" fill="#5c6b92"/>
    <rect x="-70" y="-12" width="9" height="12" rx="2" fill="#241a1a"/><rect x="62" y="-12" width="9" height="12" rx="2" fill="#241a1a"/>
    <rect x="-62" y="-44" width="124" height="6" rx="3" fill="#8793b8" opacity=".5"/>`];

  A.fridge = [52, 130, `
    <rect x="-26" y="-130" width="52" height="124" rx="5" fill="#dfe3ea"/>
    <rect x="-26" y="-130" width="52" height="124" rx="5" fill="url(#fridgeSheen)"/>
    <path d="M-26 -88 H26" stroke="#a9b0be" stroke-width="1.6"/>
    <rect x="16" y="-124" width="4" height="30" rx="2" fill="#8d96a8"/><rect x="16" y="-82" width="4" height="40" rx="2" fill="#8d96a8"/>
    <rect x="-18" y="-114" width="16" height="12" rx="1" fill="#e8803f" opacity=".85"/>
    <rect x="-22" y="-6" width="10" height="6" fill="#2a2d38"/><rect x="12" y="-6" width="10" height="6" fill="#2a2d38"/>`];

  A.tv = [78, 62, `
    <rect x="-39" y="-60" width="78" height="48" rx="3" fill="#0c0f16"/>
    <rect x="-36" y="-57" width="72" height="42" rx="1.5" fill="#161c2b"/>
    <path d="M-36 -57 L-6 -57 L-30 -15 L-36 -15 Z" fill="#fff" opacity=".1"/>
    <rect x="-8" y="-12" width="16" height="9" fill="#242836"/><rect x="-22" y="-4" width="44" height="4" rx="2" fill="#242836"/>`];

  A.bike = [108, 66, `
    <circle cx="-34" cy="-21" r="20" fill="none" stroke="#1d2130" stroke-width="3.2"/><circle cx="-34" cy="-21" r="15" fill="none" stroke="#9aa3b8" stroke-width=".8" opacity=".6"/>
    <circle cx="34" cy="-21" r="20" fill="none" stroke="#1d2130" stroke-width="3.2"/><circle cx="34" cy="-21" r="15" fill="none" stroke="#9aa3b8" stroke-width=".8" opacity=".6"/>
    <path d="M-34 -21 L-10 -46 L22 -46 L34 -21 M-10 -46 L0 -21 L-34 -21 M0 -21 L22 -46" fill="none" stroke="#c4632d" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M22 -46 L26 -58 H36 M-12 -50 H-2" stroke="#1d2130" stroke-width="3.2" stroke-linecap="round"/>
    <rect x="-16" y="-54" width="20" height="5" rx="2.5" fill="#1d2130"/>`];

  A.lumber = [164, 40, `
    <g><rect x="-82" y="-40" width="160" height="9" rx="1" fill="#dcb67e"/><rect x="-78" y="-40" width="6" height="9" fill="#efd3a6"/><path d="M-60 -36 H70" stroke="#b98c58" stroke-width=".8"/></g>
    <g><rect x="-80" y="-31" width="164" height="9" rx="1" fill="#cfa66c"/><rect x="76" y="-31" width="8" height="9" fill="#e9c995"/><path d="M-70 -27 H60" stroke="#a8794a" stroke-width=".8"/></g>
    <g><rect x="-82" y="-22" width="158" height="9" rx="1" fill="#d9b278"/><rect x="-82" y="-22" width="6" height="9" fill="#efd3a6"/><path d="M-50 -18 H66" stroke="#b98c58" stroke-width=".8"/></g>
    <g><rect x="-79" y="-13" width="162" height="13" rx="1" fill="#c79d63"/><rect x="77" y="-13" width="6" height="13" fill="#e9c995"/></g>
    <rect x="-34" y="-42" width="6" height="42" fill="#2a2f40" opacity=".85"/><rect x="34" y="-42" width="6" height="42" fill="#2a2f40" opacity=".85"/>`];

  A.drywall = [124, 40, `
    <rect x="-62" y="-40" width="124" height="9" rx="1" fill="#d9dbe1"/><rect x="-62" y="-31" width="124" height="9" rx="1" fill="#cfd1d8"/>
    <rect x="-60" y="-22" width="124" height="9" rx="1" fill="#d4d6dd"/><rect x="-58" y="-13" width="122" height="13" rx="1" fill="#c3c6ce"/>
    <path d="M-50 -35 H30 M-44 -26 H40" stroke="#8d94a8" stroke-width="1" opacity=".55"/>
    <rect x="-62" y="-40" width="124" height="2" fill="#fff" opacity=".4"/>
    <rect x="30" y="-39" width="26" height="6" rx="1" fill="#e8803f" opacity=".7"/>`];

  A.bags = [62, 60, `
    <path d="M-30 0 Q-34 -28 -22 -44 Q-17 -50 -12 -44 Q-6 -30 -2 0 Z" fill="#1a1d2a"/>
    <path d="M-22 -44 L-24 -54 L-14 -52 L-12 -44 Z" fill="#1a1d2a"/>
    <path d="M-4 0 Q-6 -34 8 -50 Q16 -58 24 -48 Q34 -30 30 0 Z" fill="#232738"/>
    <path d="M8 -50 L6 -60 L18 -58 L20 -49 Z" fill="#232738"/>
    <path d="M12 -40 Q10 -20 14 -8" stroke="#6f7894" stroke-width="2" fill="none" opacity=".55"/>
    <path d="M-24 -36 Q-26 -20 -22 -8" stroke="#6f7894" stroke-width="1.6" fill="none" opacity=".45"/>`];

  A.brush = [150, 62, `
    <path d="M-70 0 Q-60 -22 -34 -30 Q-10 -46 18 -38 Q50 -34 70 -8 L74 0 Z" fill="#5a4a30"/>
    <path d="M-62 -4 L-24 -34 M-40 -10 L6 -44 M-10 -6 L38 -40 M20 -6 L64 -22 M-72 -2 L-30 -22 M10 -4 L56 -12" stroke="#8a6c44" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M-48 -8 L-10 -40 M0 -8 L44 -34" stroke="#c9a56a" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
    <path d="M-30 -22 Q-8 -66 34 -34 Q10 -44 -30 -22Z" fill="#6f8f3f"/><path d="M-26 -24 Q-4 -58 30 -34" stroke="#b6cf6a" stroke-width="1.4" fill="none" opacity=".7"/>
    <path d="M-60 -14 Q-52 -50 -12 -42 Q-40 -38 -60 -14Z" fill="#587a34"/>
    <path d="M24 -26 Q50 -52 78 -22 Q54 -34 24 -26Z" fill="#7a9a46"/>
    <path d="M-72 -2 L-52 -10 M60 -2 L78 -6 M-20 -2 L8 -12" stroke="#3d3220" stroke-width="2.4" stroke-linecap="round"/>`];

  A.bucket = [38, 44, `
    <path d="M-17 -40 H17 L14 0 H-14 Z" fill="#3a6fb0"/>
    <path d="M-17 -40 H17 L16.4 -34 H-16.4 Z" fill="#5a90d0"/>
    <path d="M-14 0 H14 L13.6 -8 H-13.6 Z" fill="#26497a" opacity=".7"/>
    <path d="M-17 -38 Q0 -62 17 -38" fill="none" stroke="#2a2f40" stroke-width="2"/>
    <path d="M-8 -34 Q-6 -22 -9 -14" stroke="#f1f3f7" stroke-width="3" fill="none" opacity=".9" stroke-linecap="round"/>`];

  A.cabinet = [88, 62, `
    <rect x="-44" y="-62" width="88" height="62" rx="2" fill="#c49762"/>
    <rect x="-44" y="-62" width="88" height="6" fill="#dbb27e"/>
    <rect x="-40" y="-52" width="38" height="46" rx="1.5" fill="#b7894f"/><rect x="2" y="-52" width="38" height="46" rx="1.5" fill="#b7894f"/>
    <rect x="-36" y="-48" width="30" height="38" rx="1" fill="none" stroke="#8d6538" stroke-width="1.2"/><rect x="6" y="-48" width="30" height="38" rx="1" fill="none" stroke="#8d6538" stroke-width="1.2"/>
    <rect x="-8" y="-36" width="4" height="12" rx="2" fill="#3a2d22"/><rect x="4" y="-36" width="4" height="12" rx="2" fill="#3a2d22"/>`];

  A.desk = [120, 70, `
    <rect x="-60" y="-70" width="120" height="9" rx="2" fill="#c9a06c"/><rect x="-60" y="-70" width="120" height="3" rx="1.5" fill="#e2bd8a"/>
    <rect x="-56" y="-61" width="6" height="61" fill="#8d6a45"/><rect x="-22" y="-61" width="6" height="61" fill="#8d6a45"/>
    <rect x="-22" y="-61" width="78" height="40" rx="1" fill="#b78d5b"/>
    <path d="M-16 -50 H50 M-16 -38 H50 M-16 -26 H50" stroke="#7d5a38" stroke-width="1.2"/>
    <rect x="12" y="-56" width="14" height="3" rx="1.5" fill="#3a2d22"/><rect x="12" y="-44" width="14" height="3" rx="1.5" fill="#3a2d22"/><rect x="12" y="-32" width="14" height="3" rx="1.5" fill="#3a2d22"/>
    <rect x="52" y="-61" width="6" height="61" fill="#8d6a45"/>`];

  A.chair = [54, 84, `
    <path d="M-20 -84 Q-24 -84 -24 -78 V-44 Q-24 -38 -18 -38 H-10 V-84 Z" fill="#232738"/>
    <rect x="-20" y="-86" width="8" height="46" rx="4" fill="#2f3550"/>
    <rect x="-24" y="-42" width="48" height="11" rx="5" fill="#2a2f45"/><rect x="-24" y="-42" width="48" height="3" rx="1.5" fill="#4a5276"/>
    <rect x="-3" y="-31" width="6" height="22" fill="#9aa3b8"/>
    <path d="M-24 -9 H24 M0 -9 L-22 -2 M0 -9 L22 -2" stroke="#1d2130" stroke-width="4" stroke-linecap="round"/>
    <circle cx="-24" cy="-3" r="3" fill="#0e1018"/><circle cx="24" cy="-3" r="3" fill="#0e1018"/>`];

  A.filing = [46, 80, `
    <rect x="-23" y="-80" width="46" height="80" rx="2" fill="#8d96a8"/>
    <rect x="-23" y="-80" width="46" height="5" fill="#b4bccb"/>
    <path d="M-23 -54 H23 M-23 -28 H23" stroke="#5f6779" stroke-width="1.6"/>
    <rect x="-9" y="-66" width="18" height="5" rx="2.5" fill="#3a4152"/><rect x="-9" y="-40" width="18" height="5" rx="2.5" fill="#3a4152"/><rect x="-9" y="-14" width="18" height="5" rx="2.5" fill="#3a4152"/>
    <rect x="-17" y="-76" width="12" height="7" fill="#f4efe5" opacity=".85"/>`];

  A.monitor = [64, 58, `
    <rect x="-32" y="-58" width="64" height="40" rx="2" fill="#10131c"/>
    <rect x="-29" y="-55" width="58" height="34" fill="#1d2740"/>
    <path d="M-29 -55 L-4 -55 L-24 -21 L-29 -21 Z" fill="#fff" opacity=".1"/>
    <rect x="-4" y="-18" width="8" height="10" fill="#242836"/><rect x="-18" y="-8" width="36" height="8" rx="3" fill="#2a2f40"/>`];

  A.dresser = [92, 76, `
    <rect x="-46" y="-76" width="92" height="70" rx="3" fill="#a9763f"/>
    <rect x="-46" y="-76" width="92" height="6" rx="2" fill="#c8935a"/>
    <path d="M-42 -50 H42 M-42 -30 H42" stroke="#6f4a26" stroke-width="1.6"/>
    <rect x="-8" y="-60" width="16" height="4" rx="2" fill="#3a2a1a"/><rect x="-8" y="-40" width="16" height="4" rx="2" fill="#3a2a1a"/><rect x="-8" y="-19" width="16" height="4" rx="2" fill="#3a2a1a"/>
    <rect x="-40" y="-6" width="8" height="6" fill="#4a2f18"/><rect x="32" y="-6" width="8" height="6" fill="#4a2f18"/>`];

  A.lamp = [40, 96, `
    <path d="M-16 -96 H16 L22 -64 H-22 Z" fill="#efe3c6"/><path d="M-16 -96 H16 L18 -88 H-18 Z" fill="#fff6dc"/>
    <rect x="-2" y="-64" width="4" height="56" fill="#3a3f52"/>
    <ellipse cx="0" cy="-4" rx="15" ry="4.5" fill="#2a2f42"/>`];

  A.plant = [48, 70, `
    <path d="M-14 -22 H14 L11 0 H-11 Z" fill="#b5653a"/><rect x="-15" y="-26" width="30" height="6" rx="2" fill="#c8794a"/>
    <path d="M0 -24 Q-20 -40 -16 -66 Q-4 -50 0 -24 M0 -24 Q18 -44 14 -70 Q2 -52 0 -24 M0 -24 Q-2 -48 4 -62" fill="#3f8a5a" stroke="#2c6a42" stroke-width="1"/>`];

  A.frames = [56, 64, `
    <rect x="-24" y="-60" width="38" height="52" fill="#d9b25a"/><rect x="-20" y="-56" width="30" height="44" fill="#3a4a78"/>
    <path d="M-20 -22 L-8 -38 L2 -26 L10 -34 V-12 H-20 Z" fill="#7a96c8" opacity=".8"/>
    <g transform="rotate(8 22 0)"><rect x="6" y="-52" width="28" height="44" fill="#c8a04a"/><rect x="9" y="-49" width="22" height="38" fill="#e8e3da"/></g>`];

  /* a mattress stood on its end, seen face-on: how it waits at the kerb */
  A.mattressUp = [66, 132, `
    <rect x="-33" y="-132" width="66" height="132" rx="9" fill="#e6e1d6"/>
    <rect x="-33" y="-132" width="66" height="132" rx="9" fill="none" stroke="#f7f4ec" stroke-width="3"/>
    <path d="M-30 -99 H30 M-30 -66 H30 M-30 -33 H30 M-11 -129 V-3 M11 -129 V-3" stroke="#c5bdad" stroke-width="1.3"/>
    <g fill="#b4ad9e"><circle cx="-11" cy="-99" r="1.7"/><circle cx="11" cy="-99" r="1.7"/><circle cx="-11" cy="-66" r="1.7"/><circle cx="11" cy="-66" r="1.7"/><circle cx="-11" cy="-33" r="1.7"/><circle cx="11" cy="-33" r="1.7"/></g>
    <rect x="-37" y="-82" width="8" height="5" rx="2" fill="#bdb5a4"/><rect x="29" y="-82" width="8" height="5" rx="2" fill="#bdb5a4"/>
    <rect x="-12" y="-24" width="24" height="10" rx="1" fill="#8b93b8" opacity=".6"/>
    <rect x="19" y="-132" width="14" height="132" rx="7" fill="#1a1d2a" opacity=".09"/>`];

  A.yard = [64, 52, `
    <path d="M-30 0 Q-34 -22 -20 -36 L20 -36 Q34 -22 30 0 Z" fill="#7f8a9c"/>
    <path d="M-24 -36 Q-20 -52 0 -52 Q20 -52 24 -36 Z" fill="#6a7487"/>
    <rect x="-3" y="-60" width="6" height="14" fill="#2a2f40"/>`];

  SW.ITEM_DIM = {};
  Object.keys(A).forEach((k) => { SW.ITEM_DIM[k] = { w: A[k][0], h: A[k][1] }; });

  SW.itemDefsNight = function () {
    let s = '';
    Object.keys(A).forEach((k) => { s += `<g id="it-${k}N">${SW.night.recolor(A[k][2])}</g>`; });
    return s;
  };

  SW.itemDefs = function () {
    let s = `<linearGradient id="fridgeSheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1a1030" stop-opacity=".22"/></linearGradient>`;
    Object.keys(A).forEach((k) => { s += `<g id="it-${k}">${A[k][2]}</g>`; });
    return s;
  };

  /* ---------- crew ----------
     Side-on figure, feet at (0,0), about 225 units tall, facing +x. Every moving
     part is its own group so the ride can pose it from the scroll position.   */
  SW.crewMarkup = function (pal) {
    const pants = pal.pants || '#272d44';
    return `
      <ellipse class="c-shadow" cx="2" cy="1" rx="38" ry="6" fill="#05060f" opacity=".42"/>
      <g class="c-body">
        <g class="c-legB" transform="translate(-4 -118)">
          <path d="M-8 0 L8 0 L7 56 L-6 56 Z" fill="${pants}" opacity=".82"/>
          <g class="c-shinB" transform="translate(0 56)"><path d="M-6 0 L7 0 L6 50 L-5 50 Z" fill="${pants}" opacity=".82"/><path d="M-6 48 L8 48 L17 55 L17 62 L-6 62 Z" fill="#2a1e18"/></g>
        </g>
        <g class="c-armB" transform="translate(2 -178)">
          <path d="M-5 0 L5 0 L4.4 36 L-4.4 36 Z" fill="${pal.skin}" opacity=".85"/><path d="M-6 -1 L6 -1 L5.6 18 L-5.6 18 Z" fill="${pal.shirt}" opacity=".9"/>
          <g class="c-foreB" transform="translate(0 36)"><path d="M-4.4 0 L4.4 0 L4 30 L-4 30 Z" fill="${pal.skin}" opacity=".85"/><ellipse cx="0" cy="33" rx="6" ry="6.4" fill="#b08a50"/></g>
        </g>
        <path d="M-17 -118 L22 -118 L24 -150 Q26 -176 19 -185 L-12 -185 Q-21 -176 -19 -150 Z" fill="${pal.shirt}"/>
        <path d="M-17 -118 L22 -118 L22.4 -126 L-17.4 -126 Z" fill="#1a1d2a"/>
        <rect x="-3" y="-125" width="10" height="6" rx="1" fill="#9aa3b8"/>
        <path d="M-15 -150 L-9 -156 L-3 -150 L-9 -144 Z M-9 -150 L-3 -156 L3 -150 L-3 -144 Z" fill="#e8803f" opacity=".95" transform="translate(-4 -6)"/>
        <path d="M-12 -185 Q2 -178 19 -185 L18 -190 L-11 -190 Z" fill="${pal.shirt}"/>
        <rect x="-1" y="-197" width="11" height="14" rx="4" fill="${pal.skin}"/>
        <ellipse cx="4" cy="-211" rx="14" ry="17" fill="${pal.skin}"/>
        <path d="M17 -211 L24 -205 L17 -202 Z" fill="${pal.skin}"/>
        <ellipse cx="-2" cy="-208" rx="4" ry="6" fill="${pal.skinDark}"/>
        <path d="M-12 -214 Q-14 -232 5 -232 Q20 -231 20 -218 L-8 -216 Z" fill="#12204a"/>
        <path d="M-12 -214 Q-13 -218 -11 -222 L-6 -216 Z" fill="${pal.hair}"/>
        <path d="M14 -218 L33 -216 L32 -211 L14 -214 Z" fill="#e8803f"/>
        <path d="M0 -229 Q8 -231 15 -226" stroke="#3a4a8a" stroke-width="1.6" fill="none"/>
        <circle cx="12" cy="-211" r="1.7" fill="#1a1020"/>
        <g class="c-legF" transform="translate(4 -118)">
          <path d="M-8 0 L8 0 L7 56 L-6 56 Z" fill="${pants}"/>
          <g class="c-shinF" transform="translate(0 56)"><path d="M-6 0 L7 0 L6 50 L-5 50 Z" fill="${pants}"/><path d="M-6 48 L8 48 L17 55 L17 62 L-6 62 Z" fill="#3a2a20"/><path d="M-6 59 L17 59 L17 62 L-6 62 Z" fill="#14111a"/></g>
        </g>
        <g class="c-carry"></g>
        <g class="c-armF" transform="translate(4 -178)">
          <path d="M-5 0 L5 0 L4.4 36 L-4.4 36 Z" fill="${pal.skin}"/><path d="M-6.4 -1 L6.4 -1 L6 19 L-6 19 Z" fill="${pal.shirt}"/>
          <g class="c-foreF" transform="translate(0 36)"><path d="M-4.4 0 L4.4 0 L4 30 L-4 30 Z" fill="${pal.skin}"/><ellipse cx="0" cy="33" rx="6.4" ry="6.8" fill="#c79a58"/></g>
        </g>
      </g>`;
  };
  SW.CREW_PAL = [
    { shirt: '#16265a', skin: '#c68e66', skinDark: '#a8714e', hair: '#2a1a12' },
    { shirt: '#16265a', skin: '#8a5a3c', skinDark: '#6e452c', hair: '#0f0a08', pants: '#2a2f46' },
  ];
})(window.SW);
