/* ============================================================================
   The truck: a full-size crew-cab pickup traced from the owner's reference photo
   (wheelbase 65% of length, cab 42%, hood 23%, windshield ~29 deg, 33 in tyres).
   Local units: x 0..722 rear to nose, y 0 = road, negative is up.
   The svg's viewBox is "-40 -340 840 360" so the load can heap above the cab.
   ========================================================================== */
(function (SW) {
  'use strict';
  const { f } = SW;
  SW.truck = {};
  const BODY_D = 'M10 -179 L254 -179 L256 -236 Q258 -245 270 -245 L448 -245 Q462 -245 472 -238 L562 -189 L700 -177 Q713 -175 715 -163 L718 -118 L722 -96 L722 -61 Q722 -55 716 -55 L680 -55 A66 66 0 0 0 548 -55 L211 -55 A66 66 0 0 0 79 -55 L8 -55 Q0 -55 0 -63 L0 -172 Q0 -179 10 -179 Z';
  SW.truck.VB = { x: -40, y: -340, w: 840, h: 360 };

  /* alpha mask: opaque everywhere except where the truck (and the heap in its bed) is, so lights behind it stay behind it */
  SW.truck.silhouette = function () {
    const vb = SW.truck.VB;
    const circ = (cx) => `M${cx - 55.5} -55.5 a55.5 55.5 0 1 0 111 0 a55.5 55.5 0 1 0 -111 0 Z`;
    const d = `M${vb.x} ${vb.y} H${vb.x + vb.w} V${vb.y + vb.h} H${vb.x} Z ${BODY_D} ${circ(145)} ${circ(614)} M14 -330 H254 V-179 H14 Z`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}"><path d="${d}" fill-rule="evenodd" fill="#000"/></svg>`;
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  };

  SW.truck.defs = function () {
    return `
      <path id="bodyP" d="M10 -179 L254 -179 L256 -236 Q258 -245 270 -245 L448 -245 Q462 -245 472 -238 L562 -189 L700 -177 Q713 -175 715 -163 L718 -118 L722 -96 L722 -61 Q722 -55 716 -55 L680 -55 A66 66 0 0 0 548 -55 L211 -55 A66 66 0 0 0 79 -55 L8 -55 Q0 -55 0 -63 L0 -172 Q0 -179 10 -179 Z"/>
      <clipPath id="bodyClip"><use href="#bodyP"/></clipPath>
      <path id="glassF" d="M404 -176 H532 L466 -230 Q463 -232 458 -232 H404 Z"/>
      <path id="glassR" d="M280 -176 H381 V-232 H292 Q280 -231 279 -221 Z"/>
      <clipPath id="glassFClip"><use href="#glassF"/></clipPath>
      <clipPath id="glassRClip"><use href="#glassR"/></clipPath>
      <linearGradient id="paint" x1="0" y1="-246" x2="0" y2="-55" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#f8faff"/><stop offset=".2" stop-color="#edf0f9"/><stop offset=".36" stop-color="#e2e7f3"/><stop offset=".5" stop-color="#c7cee2"/><stop offset=".58" stop-color="#eef1f9"/><stop offset=".8" stop-color="#d3d9e9"/><stop offset="1" stop-color="#a9b1ca"/>
      </linearGradient>
      <linearGradient id="paintWarm" x1="0" y1="0" x2="722" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#6a5a9a" stop-opacity=".28"/><stop offset=".45" stop-color="#9a86b8" stop-opacity="0"/><stop offset=".82" stop-color="#ffb27a" stop-opacity=".22"/><stop offset="1" stop-color="#ffc58c" stop-opacity=".58"/>
      </linearGradient>
      <linearGradient id="paintTop" x1="0" y1="-248" x2="0" y2="-170" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0dc" stop-opacity=".9"/><stop offset="1" stop-color="#fff0dc" stop-opacity="0"/></linearGradient>
      <linearGradient id="paintLow" x1="0" y1="-100" x2="0" y2="-55" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1b1640" stop-opacity="0"/><stop offset="1" stop-color="#ff9d68" stop-opacity=".2"/></linearGradient>
      <linearGradient id="glass" x1="0" y1="-232" x2="0" y2="-176" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1f2638"/><stop offset=".6" stop-color="#3d465e"/><stop offset="1" stop-color="#8e7683"/></linearGradient>
      <linearGradient id="rim" x1="270" y1="0" x2="722" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd9b0" stop-opacity=".2"/><stop offset=".6" stop-color="#ffc78c" stop-opacity=".8"/><stop offset="1" stop-color="#fff0d2"/></linearGradient>
      <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f8fd"/><stop offset=".45" stop-color="#aab3ca"/><stop offset=".55" stop-color="#dde3f0"/><stop offset="1" stop-color="#6d7690"/></linearGradient>
      <linearGradient id="navyBand" x1="0" y1="-76" x2="0" y2="-55" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1d2d52"/><stop offset="1" stop-color="#0a1226"/></linearGradient>
      <linearGradient id="plasticG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3144"/><stop offset=".3" stop-color="#171a27"/><stop offset="1" stop-color="#0b0d16"/></linearGradient>
      <linearGradient id="underShade" x1="0" y1="-56" x2="0" y2="-26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#04060c" stop-opacity=".95"/><stop offset="1" stop-color="#04060c" stop-opacity="0"/></linearGradient>
      <radialGradient id="tireG" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#0d0f18"/><stop offset=".9" stop-color="#1a1d2a"/><stop offset="1" stop-color="#05060b"/></radialGradient>
      <radialGradient id="rimG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#5b627c"/><stop offset=".55" stop-color="#2b3045"/><stop offset="1" stop-color="#12151f"/></radialGradient>
      <linearGradient id="spokeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b1f2f"/><stop offset=".5" stop-color="#474e68"/><stop offset="1" stop-color="#20243a"/></linearGradient>
      <radialGradient id="headG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#fff1c8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/></radialGradient>
      <linearGradient id="beam" x1="720" y1="0" x2="1320" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0cc" stop-opacity=".6"/><stop offset=".5" stop-color="#ffdca0" stop-opacity=".15"/><stop offset="1" stop-color="#ffdca0" stop-opacity="0"/></linearGradient>
      <radialGradient id="tailG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff6a52" stop-opacity=".95"/><stop offset="1" stop-color="#ff3a2d" stop-opacity="0"/></radialGradient>
      <linearGradient id="tarpG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a476f"/><stop offset="1" stop-color="#171e36"/></linearGradient>
    `;
  };

  /* black alloys on all-terrain tyres. The spin group is turned by the ride from distance travelled. */
  SW.truck.wheel = function (cx) {
    let spokes = '', lugs = '';
    for (let i = 0; i < 5; i++) for (const d of [-10, 10]) {
      spokes += `<path d="M-3.2 -11 L-4.4 -30 Q0 -32 4.4 -30 L3.2 -11 Z" fill="url(#spokeG)" transform="rotate(${i * 72 + d})"/><path d="M-1.4 -13 L-2 -29" stroke="#8d96b0" stroke-opacity=".55" stroke-width=".8" transform="rotate(${i * 72 + d})"/>`;
    }
    for (let i = 0; i < 6; i++) lugs += `<circle cx="${f(9 * Math.cos((i * 60 + 30) * Math.PI / 180))}" cy="${f(9 * Math.sin((i * 60 + 30) * Math.PI / 180))}" r="1.7" fill="#5b627c" stroke="#10131d" stroke-width=".5"/>`;
    return `<g transform="translate(${cx} -55.5)">
      <g class="wheel-spin">
        <circle r="55.5" fill="url(#tireG)"/>
        <circle r="51.5" fill="none" stroke="#262a3a" stroke-width="8" stroke-dasharray="7.2 3.5"/>
        <circle r="55" fill="none" stroke="#07080d" stroke-width="1.6"/>
        <circle r="46" fill="none" stroke="#1d2130" stroke-width="1.6"/>
        <circle r="43" fill="none" stroke="#2e3348" stroke-width="2" stroke-dasharray="1.4 2.6" opacity=".8"/>
        <circle r="34" fill="#0c0e17"/><circle r="33" fill="none" stroke="#7d86a2" stroke-width="1.6" opacity=".7"/>
        <circle r="31" fill="url(#rimG)"/><circle r="23" fill="#0a0c14" opacity=".55"/>
        ${spokes}
        <circle r="13" fill="url(#rimG)" stroke="#0a0c14" stroke-width="1"/>${lugs}
        <circle r="6.2" fill="#0f1a33" stroke="#e8803f" stroke-width="1.4"/>
        <path d="M-3.2 -2.8 L0 0 L-3.2 2.8 M0 -2.8 L3.2 0 L0 2.8" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      </g>
      <path d="M-52 -16 A55 55 0 0 1 12 -54" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2.4"/>
      <path d="M36 -42 A55 55 0 0 1 55 -8" fill="none" stroke="#ffb27a" stroke-opacity=".5" stroke-width="2.6"/>
      <path d="M-30 -9 A31 31 0 0 1 8 -30" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>
    </g>`;
  };

  SW.truck.markup = function () {
    const T = 'font-family="Instrument Sans, Segoe UI, sans-serif"';
    return `
      <ellipse cx="361" cy="3.4" rx="411" ry="14.8" fill="#05060f" opacity=".7" filter="url(#fblur8)"/>
      <ellipse cx="361" cy="1" rx="386" ry="4" fill="#02030a" opacity=".55" filter="url(#fblur3)"/>
      <ellipse cx="145" cy="1" rx="62" ry="6.1" fill="#02030a" opacity=".9" filter="url(#fblur3)"/>
      <ellipse cx="614" cy="1" rx="62" ry="6.1" fill="#02030a" opacity=".9" filter="url(#fblur3)"/>
      <g class="speedlines" id="speedlines" opacity="0">
        <path d="M-6 -150 l-44 0 l12 -10 l44 0 z M-6 -118 l-84 0 l14 -10 l84 0 z M-6 -84 l-58 0 l12 -10 l58 0 z" fill="#e8803f" opacity=".55"/>
      </g>

      <rect x="211" y="-56" width="337" height="30" fill="url(#underShade)"/>
      <path d="M79 -55 A66 66 0 0 1 211 -55 Z" fill="#04060b"/><path d="M548 -55 A66 66 0 0 1 680 -55 Z" fill="#04060b"/>
      <g id="wheels">${SW.truck.wheel(145)}${SW.truck.wheel(614)}</g>

      <g class="truck-body" id="truckBody">
        <g id="bedLoad">
          <path id="loadMass" d="" fill="url(#tarpG)" visibility="hidden"/>
          <path id="loadRim" d="" fill="none" stroke="#9fb0e0" stroke-opacity=".5" stroke-width="1.6" visibility="hidden"/>
          <g id="bedItems"></g>
          <g id="straps" opacity="0">
            <path d="M92 -300 V-150 M176 -300 V-150" stroke="#10131c" stroke-width="5"/>
            <rect x="89" y="-186" width="6" height="12" rx="1.5" fill="#e8803f"/><rect x="173" y="-186" width="6" height="12" rx="1.5" fill="#e8803f"/>
          </g>
        </g>

        <use href="#bodyP" fill="url(#paint)"/>
        <g clip-path="url(#bodyClip)">
          <rect x="0" y="-250" width="730" height="200" fill="url(#paintWarm)"/>
          <rect x="0" y="-250" width="730" height="84" fill="url(#paintTop)" opacity=".75"/>
          <path d="M262 -178 H396 L378 -146 H262 Z" fill="#fff" opacity=".14"/><path d="M404 -178 H544 L526 -146 H404 Z" fill="#fff" opacity=".12"/>
          <path d="M26 -176 L132 -176 L112 -148 L26 -148 Z" fill="#fff" opacity=".15"/><path d="M566 -189 L698 -178 L698 -171 L566 -182 Z" fill="#fff" opacity=".34"/>
          <path d="M34 -146 H78 M212 -146 H394 M404 -146 H544 M552 -147 H690" stroke="#fff" stroke-opacity=".7" stroke-width="1.3" fill="none"/>
          <path d="M34 -144.4 H78 M212 -144.4 H394 M404 -144.4 H544 M552 -145.4 H690" stroke="#7d87a6" stroke-opacity=".6" stroke-width="1.1" fill="none"/>
          <rect x="0" y="-77" width="730" height="24" fill="url(#navyBand)"/><rect x="0" y="-79" width="730" height="2" fill="#e8803f"/><rect x="0" y="-77" width="730" height="24" fill="url(#paintLow)"/>
          <rect x="211" y="-62" width="337" height="7" fill="url(#plasticG)"/><rect x="211" y="-62" width="337" height="1" fill="#6b7390" opacity=".5"/>
        </g>
        <path d="M79 -55 A66 66 0 0 1 211 -55" fill="none" stroke="#12151f" stroke-width="9"/><path d="M548 -55 A66 66 0 0 1 680 -55" fill="none" stroke="#12151f" stroke-width="9"/>
        <path d="M75 -58 A70 70 0 0 1 215 -58" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.1"/><path d="M544 -58 A70 70 0 0 1 684 -58" fill="none" stroke="#ffd2a0" stroke-opacity=".5" stroke-width="1.2"/>

        <use href="#glassR" fill="url(#glass)"/><use href="#glassF" fill="url(#glass)"/>
        <g clip-path="url(#glassRClip)">
          <path d="M296 -176 V-196 Q296 -204 306 -205 H330 Q340 -205 340 -196 V-176 Z" fill="#0f1422" opacity=".8"/><rect x="306" y="-219" width="26" height="14" rx="6" fill="#161c2e" opacity=".85"/>
          <path d="M292 -232 L336 -232 L304 -176 L282 -176 Z" fill="#ffc99a" opacity=".16"/><path d="M346 -232 L370 -232 L350 -176 L336 -176 Z" fill="#ffc99a" opacity=".1"/>
        </g>
        <g clip-path="url(#glassFClip)">
          <path d="M424 -176 V-197 Q424 -206 435 -207 H458 Q468 -207 468 -197 V-176 Z" fill="#0f1422" opacity=".8"/><rect x="434" y="-222" width="26" height="15" rx="6" fill="#161c2e" opacity=".85"/>
          <path d="M416 -232 L462 -232 L430 -176 L410 -176 Z" fill="#ffc99a" opacity=".16"/>
        </g>
        <use href="#glassR" fill="none" stroke="#06080e" stroke-width="2.2"/><use href="#glassF" fill="none" stroke="#06080e" stroke-width="2.2"/>
        <rect x="381" y="-233" width="23" height="58" fill="#0c0f19"/><rect x="381" y="-233" width="2" height="58" fill="#fff" opacity=".12"/>
        <path d="M280 -176 H532" stroke="#06080e" stroke-width="3"/><path d="M280 -178 H381 M404 -178 H528" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>

        <path d="M257 -176 L258 -58 M398 -176 C398 -140 400 -90 401 -58 M545 -178 C545 -130 545 -90 543 -60" stroke="#7a84a2" stroke-width="1.3" fill="none" opacity=".9"/>
        <path d="M258.2 -176 L259.2 -58 M399.2 -176 C399.2 -140 401.2 -90 402.2 -58 M546.2 -178 C546.2 -130 546.2 -90 544.2 -60" stroke="#fff" stroke-width=".8" fill="none" opacity=".5"/>
        <path d="M564 -186 C620 -184 680 -176 712 -166" stroke="#7a84a2" stroke-width="1.1" fill="none" opacity=".85"/>
        <rect x="268" y="-160" width="36" height="8.5" rx="4" fill="#232838"/><rect x="268" y="-160" width="36" height="2.6" rx="1.3" fill="#8d96b0" opacity=".7"/>
        <rect x="404" y="-160" width="36" height="8.5" rx="4" fill="#232838"/><rect x="404" y="-160" width="36" height="2.6" rx="1.3" fill="#8d96b0" opacity=".7"/>
        <path d="M497 -196 Q498 -201 505 -201 L521 -199 Q531 -193 531 -179 L531 -162 Q531 -158 527 -158 L509 -158 Q502 -159 502 -167 Z" fill="#0c0f19"/>
        <path d="M501 -199 L520 -197" stroke="#ffcf9a" stroke-width="1.7" stroke-linecap="round" opacity=".9"/><rect x="523" y="-186" width="6" height="3.6" rx="1.4" fill="#ffb347"/>
        <path d="M580 -190 L660 -182 L662 -179 L582 -187 Z" fill="#0c0f19"/>

        <g id="liveryBed">
          <use href="#mark-light" x="46" y="-171" width="52" height="33"/><rect x="106" y="-167" width="1.6" height="30" fill="#0f1a33" opacity=".3"/>
          <text x="115" y="-142" ${T} font-weight="700" font-size="26" letter-spacing="2.1" fill="#0f1a33">SWIFT</text>
          <text x="116" y="-131.5" ${T} font-weight="600" font-size="7.2" letter-spacing="3.3" fill="#c4632d">JUNK REMOVAL</text>
        </g>
        <g id="liveryRear">
          <use href="#mark-light" x="299" y="-148" width="56" height="35"/>
          <text x="327" y="-95" text-anchor="middle" ${T} font-weight="700" font-size="21" letter-spacing="2.1" fill="#0f1a33">SWIFT</text>
          <text x="328" y="-86.6" text-anchor="middle" ${T} font-weight="600" font-size="6.4" letter-spacing="3" fill="#c4632d">JUNK REMOVAL</text>
        </g>
        <g id="liveryDoor">
          <text x="412" y="-124" ${T} font-weight="700" font-size="13.4" letter-spacing=".2" fill="#0f1a33">(702) 000-0000</text>
          <rect x="412" y="-118" width="112" height="1.2" fill="#e8803f"/>
          <text x="412" y="-107" ${T} font-weight="500" font-size="8" letter-spacing=".4" fill="#33405f">Las Vegas &amp; Henderson</text>
          <text x="412" y="-96" ${T} font-weight="600" font-size="8" letter-spacing=".4" fill="#c4632d">Free quotes</text>
        </g>

        <path d="M270 -245 L448 -245 Q462 -245 472 -238 L562 -189 L700 -177 Q713 -175 715 -163" fill="none" stroke="url(#rim)" stroke-width="3" stroke-linecap="round"/>
        <path d="M10 -179 L254 -179" stroke="#ffcf9c" stroke-width="1.5" opacity=".65"/><path d="M10 -181 L254 -181" stroke="#10131c" stroke-width="2.6"/>

        <path d="M668 -164 L704 -160 L707 -141 L672 -139 Z" fill="#0a0e1b" stroke="#6d7690" stroke-width="1"/>
        <path d="M676 -157 L701 -155 L703 -146 L679 -144.5 Z" fill="#f6a93e"/><path d="M677 -156 L700 -154" stroke="#fff3c8" stroke-width="1.4" opacity=".8"/>
        <path d="M705 -161 L716 -159 L718 -113 L708 -115 Z" fill="#090c17"/>
        <path d="M706 -150 H717 M707 -139 H717.5 M707.5 -128 H718 M708 -118 H718" stroke="#aab3ca" stroke-width="1.1"/>
        <path d="M674 -101 L718 -97 L722 -95 L722 -61 Q722 -57 716 -57 L678 -57 Z" fill="#10131d"/><path d="M675 -100 L718 -96" stroke="#5b627c" stroke-width="1.4"/><path d="M680 -66 H718" stroke="#e8803f" stroke-width="1.4" opacity=".9"/>
        <circle cx="706" cy="-82" r="4" fill="#ffe9b8"/>

        <path d="M11 -170 H33 Q35.5 -170 35 -166 L31 -118 Q30.6 -115.5 28 -115.5 H12 Q10 -115.5 10 -118 Z" fill="#5c0f0c"/>
        <path d="M13.5 -167 H31.5 L28.6 -119 H13.5 Z" fill="#cf2a21"/><path d="M15 -165 H19.5 L18 -121 H15 Z" fill="#ff6e5c" opacity=".85"/>
        <path d="M22 -165 H30 L28.4 -141 H22 Z" fill="#a31d17"/><rect x="13.5" y="-131" width="15" height="9" rx="1" fill="#f5e7d0" opacity=".85"/>
        <path d="M0 -92 Q0 -96 6 -96 H52 V-58 H8 Q0 -58 0 -66 Z" fill="#10131d"/><path d="M2 -95 H50" stroke="#5b627c" stroke-width="1.4"/><path d="M6 -90 H46" stroke="#232838" stroke-width="3" stroke-dasharray="5 3"/>
      </g>`;
  };

  /* headlights, tail glow and the pool of light on the road: drawn above the night grade */
  SW.truck.lights = function () {
    return `
      <path d="M720 -140 L1320 -196 L1320 -4 L720 -118 Z" fill="url(#beam)" filter="url(#fblur3)"/>
      <circle cx="690" cy="-150" r="46" fill="url(#headG)"/><circle cx="706" cy="-82" r="14" fill="url(#headG)" opacity=".7"/>
      <ellipse cx="1010" cy="-3" rx="300" ry="13" fill="#ffd9a0" opacity=".25" filter="url(#fblur8)"/>
      <ellipse cx="6" cy="-143" rx="22" ry="34" fill="url(#tailG)" opacity=".55"/>
      <rect x="360" y="-241" width="52" height="5" rx="2" fill="#ffb347" opacity=".0"/>`;
  };

  /* ---------- the heap in the bed: a tarp-covered mass that rises as the jobs are done ---------- */
  const BED_A = 22, BED_B = 252, RAIL = -179, HMAX = 98;
  SW.truck.massTop = function (x, L) {
    const p = .62 + .22 * Math.sin(x / 19 + .6) + .16 * Math.sin(x / 7.5 + 1.2);
    const edge = SW.smooth(BED_A, BED_A + 26, x) * .3 + .7;
    const edge2 = SW.smooth(BED_B, BED_B - 26, x) * .22 + .78;
    return RAIL - 6 - L * HMAX * p * edge * edge2;
  };
  SW.truck.massPath = function (L) {
    if (L <= .001) return { d: '', rim: '' };
    let top = '';
    for (let x = BED_A; x <= BED_B; x += 6) top += `${x === BED_A ? 'M' : 'L'}${x} ${f(SW.truck.massTop(x, L))} `;
    return { d: top + `L${BED_B} -150 L${BED_A} -150 Z`, rim: top };
  };
})(window.SW);
