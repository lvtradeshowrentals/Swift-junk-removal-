"""Replace the truck (defs + markup + wheel/rack JS) in index.html with the true-proportion version."""
import re, sys
P = r'C:\Users\Cleo\Desktop\swift-junk-removal\index.html'
s = open(P, encoding='utf-8').read()

# ---------------------------------------------------------------- defs
DEFS = r'''      <!-- ===== truck: true-scale full-size crew-cab pickup =====
           1 unit = 0.32 in. Wheelbase 147.5 in (axles x=141 / x=601), 33 in tyres,
           roof 75 in, bed rail 56 in, 70 in bed, hood ~81 in. -->
      <path id="bodyP" d="M8 -170 Q8 -176 14 -176 L222 -176 L238 -224 Q242 -236 262 -236 L404 -236 Q424 -236 436 -222 L468 -184 L694 -167 Q712 -164 714 -150 L718 -108 Q722 -100 722 -88 L722 -64 Q722 -52 712 -46 L706 -36 L661 -36 A63 63 0 1 0 541 -36 L201 -36 A63 63 0 1 0 81 -36 L22 -36 Q8 -36 8 -48 Z"/>
      <clipPath id="bodyClip"><use href="#bodyP"/></clipPath>
      <path id="glassF" d="M352 -181 L446 -181 L427 -219 Q423 -227 414 -227 L352 -227 Z"/>
      <path id="glassR" d="M240 -181 L338 -181 L338 -227 L253 -227 Q247 -226 245 -219 Z"/>
      <clipPath id="glassFClip"><use href="#glassF"/></clipPath>
      <clipPath id="glassRClip"><use href="#glassR"/></clipPath>

      <linearGradient id="paint" x1="0" y1="-236" x2="0" y2="-36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#f8faff"/>
        <stop offset=".17" stop-color="#eaeef8"/>
        <stop offset=".30" stop-color="#e0e5f2"/>
        <stop offset=".41" stop-color="#b6bed6"/>
        <stop offset=".49" stop-color="#eef1f9"/>
        <stop offset=".66" stop-color="#d3d9e9"/>
        <stop offset=".85" stop-color="#aab2cb"/>
        <stop offset="1" stop-color="#8d96b3"/>
      </linearGradient>
      <linearGradient id="paintWarm" x1="0" y1="0" x2="722" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#6a5a9a" stop-opacity=".30"/>
        <stop offset=".45" stop-color="#9a86b8" stop-opacity="0"/>
        <stop offset=".8" stop-color="#ffb27a" stop-opacity=".24"/>
        <stop offset="1" stop-color="#ffc58c" stop-opacity=".6"/>
      </linearGradient>
      <linearGradient id="paintTop" x1="0" y1="-238" x2="0" y2="-166" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff0dc" stop-opacity=".9"/><stop offset="1" stop-color="#fff0dc" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="paintLow" x1="0" y1="-96" x2="0" y2="-36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1b1640" stop-opacity="0"/><stop offset="1" stop-color="#ff9d68" stop-opacity=".22"/>
      </linearGradient>
      <linearGradient id="glass" x1="0" y1="-228" x2="0" y2="-180" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#18223f"/><stop offset=".55" stop-color="#35466f"/><stop offset="1" stop-color="#9a7589"/>
      </linearGradient>
      <linearGradient id="rim" x1="262" y1="0" x2="722" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffd9b0" stop-opacity=".2"/><stop offset=".6" stop-color="#ffc78c" stop-opacity=".8"/><stop offset="1" stop-color="#fff0d2"/>
      </linearGradient>
      <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6f8fd"/><stop offset=".45" stop-color="#aab3ca"/><stop offset=".55" stop-color="#dde3f0"/><stop offset="1" stop-color="#6d7690"/>
      </linearGradient>
      <linearGradient id="navyBand" x1="0" y1="-80" x2="0" y2="-36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1d2d52"/><stop offset=".6" stop-color="#0f1a35"/><stop offset="1" stop-color="#0a1226"/>
      </linearGradient>
      <linearGradient id="under" x1="0" y1="-38" x2="0" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#04060c"/><stop offset=".6" stop-color="#0d0f1c"/><stop offset="1" stop-color="#3a2b3e"/>
      </linearGradient>
      <linearGradient id="bedIn" x1="0" y1="-232" x2="0" y2="-176" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#171f3a" stop-opacity=".6"/><stop offset="1" stop-color="#0a0e1c" stop-opacity=".97"/>
      </linearGradient>
      <linearGradient id="spokeG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8d96b0"/><stop offset=".45" stop-color="#f2f5fb"/><stop offset="1" stop-color="#9aa3bb"/>
      </linearGradient>
      <radialGradient id="rotorG" cx=".5" cy=".5" r=".5">
        <stop offset=".55" stop-color="#2a3046"/><stop offset=".9" stop-color="#59607a"/><stop offset="1" stop-color="#3b415a"/>
      </radialGradient>
      <radialGradient id="rimG" cx=".38" cy=".32" r=".8">
        <stop offset="0" stop-color="#f6f8fd"/><stop offset=".55" stop-color="#aab3c8"/><stop offset="1" stop-color="#5e6784"/>
      </radialGradient>
      <radialGradient id="tireG" cx=".5" cy=".5" r=".5">
        <stop offset=".78" stop-color="#0b0d15"/><stop offset=".92" stop-color="#1c2032"/><stop offset="1" stop-color="#05060b"/>
      </radialGradient>
      <radialGradient id="headG" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#fff1c8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="beam" x1="722" y1="0" x2="1320" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff0cc" stop-opacity=".62"/><stop offset=".5" stop-color="#ffdca0" stop-opacity=".16"/><stop offset="1" stop-color="#ffdca0" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="tailG" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#ff6a52" stop-opacity=".95"/><stop offset="1" stop-color="#ff3a2d" stop-opacity="0"/>
      </radialGradient>
'''
a = s.index('      <!-- ===== truck ===== -->')
b = s.index('    </defs>\n\n    <g id="back-layer"></g>')
s = s[:a] + DEFS + s[b:]

# ---------------------------------------------------------------- markup
BODY = r'''    <!-- contact shadows -->
    <ellipse cx="436" cy="482" rx="410" ry="15" fill="#05060f" opacity=".72" filter="url(#fblur8)"/>
    <ellipse cx="436" cy="479" rx="330" ry="4" fill="#02030a" opacity=".6" filter="url(#fblur3)"/>
    <ellipse cx="211" cy="479" rx="62" ry="6" fill="#02030a" opacity=".9" filter="url(#fblur3)"/>
    <ellipse cx="671" cy="479" rx="62" ry="6" fill="#02030a" opacity=".9" filter="url(#fblur3)"/>

    <!-- ============================ THE TRUCK ============================ -->
    <g id="truck" transform="translate(70 478)">
      <g filter="url(#fblur8)">
        <circle class="exhaust" cx="-10" cy="-30" r="9" fill="#dfe4f2"/>
        <circle class="exhaust" cx="-10" cy="-30" r="9" fill="#dfe4f2" style="animation-delay:-2.2s"/>
      </g>

      <!-- underbody: frame, axles, driveshaft, exhaust, tank. Seen through the 10 in of ground clearance -->
      <rect x="92" y="-38" width="528" height="38" fill="url(#under)"/>
      <path d="M90 -22 H300 Q312 -22 312 -17 Q312 -12 300 -12 H90 Z" fill="#2b3046"/>
      <ellipse cx="338" cy="-21" rx="42" ry="11" fill="#3a4058"/><ellipse cx="338" cy="-25" rx="38" ry="4" fill="#8d96b0" opacity=".45"/>
      <path d="M372 -19 H560" stroke="#46506a" stroke-width="5" stroke-linecap="round"/>
      <rect x="402" y="-35" width="96" height="21" rx="7" fill="#161a2b"/><rect x="406" y="-33" width="88" height="3" rx="1.5" fill="#6b7390" opacity=".5"/>
      <rect x="196" y="-30" width="58" height="4" fill="#1d2236"/>
      <path d="M92 -8 H620" stroke="#ffa868" stroke-opacity=".22" stroke-width="1.5"/>
      <g id="wheels"></g>

      <!-- side steps -->
      <path d="M252 -37 H508 V-31 Q508 -24 500 -24 H260 Q252 -24 252 -31 Z" fill="#0b1020"/>
      <rect x="256" y="-36" width="248" height="1.8" fill="#c3cbde" opacity=".85"/>
      <path d="M268 -29 H494" stroke="#2a3150" stroke-width="3" stroke-dasharray="6 4"/>

      <g class="truck-idle">
        <!-- ===== body paint ===== -->
        <use href="#bodyP" fill="url(#paint)"/>
        <g clip-path="url(#bodyClip)">
          <rect x="0" y="-240" width="730" height="206" fill="url(#paintWarm)"/>
          <rect x="0" y="-240" width="730" height="80" fill="url(#paintTop)" opacity=".75"/>
          <!-- sky-reflection glints on doors, bed side and hood -->
          <path d="M246 -176 H452 L428 -140 H246 Z" fill="#fff" opacity=".13"/>
          <path d="M40 -170 L120 -170 L96 -140 L40 -140 Z" fill="#fff" opacity=".16"/>
          <path d="M520 -183 L690 -167 L690 -160 L520 -176 Z" fill="#fff" opacity=".34"/>
          <path d="M480 -150 L700 -150 L700 -142 L480 -142 Z" fill="#ffd2a4" opacity=".12"/>
          <!-- shoulder crease and lower crease -->
          <path d="M14 -140 H216 M240 -140 H452 M462 -141 H706" stroke="#fff" stroke-opacity=".7" stroke-width="1.3" fill="none"/>
          <path d="M14 -138.4 H216 M240 -138.4 H452 M462 -139.4 H706" stroke="#7d87a6" stroke-opacity=".65" stroke-width="1.1" fill="none"/>
          <!-- navy rocker band, copper pin-stripe -->
          <rect x="0" y="-80" width="730" height="46" fill="url(#navyBand)"/>
          <rect x="0" y="-82.6" width="730" height="2" fill="#e8803f"/>
          <rect x="0" y="-80.4" width="730" height="1" fill="#fff" opacity=".22"/>
          <rect x="0" y="-80" width="730" height="46" fill="url(#paintLow)"/>
          <!-- black front valance -->
          <path d="M640 -60 L716 -58 L710 -36 L640 -36 Z" fill="#0b0e19"/>
          <path d="M646 -52 H706" stroke="#3a4260" stroke-width="2"/>
        </g>

        <!-- ===== fender flares ===== -->
        <path d="M81 -36 A63 63 0 1 1 201 -36" fill="none" stroke="#161b2d" stroke-width="6"/>
        <path d="M541 -36 A63 63 0 1 1 661 -36" fill="none" stroke="#161b2d" stroke-width="6"/>
        <path d="M78 -44 A67 67 0 0 1 204 -44" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.1" transform="translate(0 -8) translate(0 8)"/>
        <path d="M538 -46 A67 67 0 0 1 664 -46" fill="none" stroke="#ffd2a0" stroke-opacity=".55" stroke-width="1.2"/>

        <!-- ===== cab glass with the interior in it ===== -->
        <use href="#glassF" fill="url(#glass)"/>
        <use href="#glassR" fill="url(#glass)"/>
        <g clip-path="url(#glassFClip)">
          <path d="M362 -181 V-198 Q362 -209 376 -211 H394 Q405 -211 405 -199 V-181 Z" fill="#0a0f1f"/>
          <rect x="372" y="-224" width="24" height="15" rx="6" fill="#10182d"/>
          <path d="M424 -181 L446 -181 L430 -214 Z" fill="#0a0f1f" opacity=".7"/>
          <path d="M362 -227 L398 -227 L368 -181 L352 -181 Z" fill="#ffc99a" opacity=".2"/>
          <path d="M408 -227 L426 -227 L404 -181 L394 -181 Z" fill="#ffc99a" opacity=".12"/>
        </g>
        <g clip-path="url(#glassRClip)">
          <path d="M256 -181 V-195 Q256 -203 268 -204 H290 Q299 -204 299 -195 V-181 Z" fill="#0a0f1f"/>
          <rect x="266" y="-217" width="22" height="13" rx="5.5" fill="#10182d"/>
          <path d="M262 -227 L296 -227 L268 -181 L246 -181 Z" fill="#ffc99a" opacity=".2"/>
        </g>
        <use href="#glassF" fill="none" stroke="#05070e" stroke-width="2.4"/>
        <use href="#glassR" fill="none" stroke="#05070e" stroke-width="2.4"/>
        <path d="M352 -181 H446 M240 -181 H338" stroke="#fff" stroke-opacity=".75" stroke-width="1.4"/>
        <rect x="338" y="-229" width="14" height="50" fill="#0a0f1e"/>

        <!-- ===== door seams, handles, mirror ===== -->
        <path d="M454 -176 C454 -120 458 -72 458 -38 M338 -178 L340 -38 M237 -178 L237 -38" stroke="#7a84a2" stroke-width="1.3" fill="none" opacity=".9"/>
        <path d="M455.2 -176 C455.2 -120 459.2 -72 459.2 -38 M339.2 -178 L341.2 -38 M238.2 -178 L238.2 -38" stroke="#fff" stroke-width=".8" fill="none" opacity=".55"/>
        <path d="M470 -177 L598 -167 L708 -152" stroke="#7a84a2" stroke-width="1.1" fill="none" opacity=".85"/>
        <rect x="414" y="-166" width="28" height="6.5" rx="3.2" fill="url(#chrome)"/>
        <rect x="302" y="-166" width="28" height="6.5" rx="3.2" fill="url(#chrome)"/>
        <path d="M452 -206 Q452 -213 460 -213 L474 -211 Q481 -200 479 -186 L458 -184 Z" fill="#0b1020"/>
        <path d="M455 -211 L473 -209" stroke="#ffcf9a" stroke-width="1.7" stroke-linecap="round" opacity=".9"/>
        <rect x="470" y="-193" width="6" height="3.4" rx="1.4" fill="#ffb347"/>

        <!-- ===== roof gear ===== -->
        <rect x="360" y="-241" width="52" height="5" rx="2" fill="#ffb347"/>
        <rect x="360" y="-241" width="52" height="5" rx="2" fill="#ffb347" filter="url(#fblur3)" opacity=".85"/>
        <path d="M262 -236 L271 -246 L282 -236 Z" fill="#0b1020"/>

        <!-- ===== bed: rail cap, see-through stake rack, headache rack ===== -->
        <rect x="14" y="-232" width="210" height="56" fill="url(#bedIn)"/>
        <rect x="12" y="-181" width="212" height="7" rx="3" fill="#161c30"/>
        <rect x="12" y="-181" width="212" height="2" rx="1" fill="#ffc690" opacity=".6"/>
        <g id="rack"></g>

        <!-- ===== livery ===== -->
        <g id="liveryBed">
          <use href="#mark-light" x="28" y="-171" width="56" height="35"/>
          <rect x="92" y="-166" width="1.6" height="30" fill="#0f1a33" opacity=".3"/>
          <text x="102" y="-141" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="700" font-size="29" letter-spacing="2.4" fill="#0f1a33">SWIFT</text>
          <text x="103" y="-130.4" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="600" font-size="7.8" letter-spacing="3.4" fill="#c4632d">JUNK REMOVAL</text>
        </g>
        <use href="#mark-light" x="248" y="-153" width="76" height="48"/>
        <g id="liveryDoor">
          <text x="357" y="-128" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="700" font-size="11.6" letter-spacing=".2" fill="#0f1a33">(702) 000-0000</text>
          <rect x="357" y="-123" width="86" height="1.1" fill="#e8803f"/>
          <text x="357" y="-113" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="500" font-size="7.4" letter-spacing=".4" fill="#33405f">Las Vegas &amp; Henderson</text>
          <text x="357" y="-103" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="600" font-size="7.4" letter-spacing=".4" fill="#c4632d">Free quotes</text>
        </g>

        <!-- ===== rim light on every upward and forward edge (sunrise ahead) ===== -->
        <path d="M262 -236 L404 -236 Q424 -236 436 -222 L468 -184 L694 -167 Q712 -164 714 -150" fill="none" stroke="url(#rim)" stroke-width="3" stroke-linecap="round"/>
        <path d="M14 -176 L222 -176" stroke="#ffcf9c" stroke-width="1.4" opacity=".6"/>

        <!-- ===== front end ===== -->
        <path d="M698 -156 L717 -152 L720 -126 L700 -121 Z" fill="#0a0f1e" stroke="#6d7690" stroke-width="1.2"/>
        <path d="M703 -149 L714 -147 L716 -130 L705 -127 Z" fill="#fff6dc"/>
        <path d="M699 -154 L718 -150" stroke="#ffb072" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M713 -118 L721 -115 L722 -98 L713 -100 Z" fill="#090d19"/>
        <path d="M713 -112 H722 M713 -106 H722" stroke="#aab3ca" stroke-width="1.2"/>
        <path d="M696 -96 L722 -94 Q727 -80 725 -68 L712 -58 L694 -60 Z" fill="url(#chrome)"/>
        <circle cx="709" cy="-78" r="4.2" fill="#ffe9b8"/>
        <circle cx="709" cy="-78" r="9" fill="#ffd9a0" opacity=".35" filter="url(#fblur3)"/>

        <!-- ===== rear end ===== -->
        <path d="M8 -170 H19 V-136 H8 Z" fill="#b8231c"/>
        <path d="M8 -170 H12 V-136 H8 Z" fill="#ff5a48"/>
        <rect x="8" y="-134" width="11" height="7" rx="1.5" fill="#ffb347"/>
        <ellipse cx="3" cy="-152" rx="22" ry="30" fill="url(#tailG)" opacity=".5"/>
        <path d="M-7 -96 L19 -96 L19 -57 L2 -53 Q-7 -53 -7 -60 Z" fill="url(#chrome)"/>
        <rect x="-7" y="-98" width="26" height="5" rx="1.5" fill="#10152a"/>
        <rect x="-5" y="-96.6" width="22" height="1.2" fill="#c3cbde" opacity=".5"/>
        <rect x="2" y="-54" width="22" height="16" rx="2" fill="#090c17"/><circle cx="13" cy="-46" r="2.2" fill="#3a4260"/>
      </g>

      <!-- headlight glow and beam -->
      <path d="M720 -140 L1320 -196 L1320 -2 L720 -118 Z" fill="url(#beam)" filter="url(#fblur3)" style="mix-blend-mode:screen"/>
      <circle cx="712" cy="-138" r="48" fill="url(#headG)" style="mix-blend-mode:screen"/>
      <ellipse cx="1010" cy="-3" rx="300" ry="13" fill="#ffd9a0" opacity=".22" filter="url(#fblur8)" style="mix-blend-mode:screen"/>
    </g>

'''
a = s.index('    <!-- soft contact shadow under truck -->')
b = s.index('    <g id="motes"></g>')
s = s[:a] + BODY + s[b:]

# ---------------------------------------------------------------- wheel + rack JS
JS = r'''  /* ---------- truck: wheels + rack ---------- */
  (() => {
    const wheel = (cx) => {
      const P = (rad, a) => `${f(rad * Math.cos(a * Math.PI / 180))} ${f(rad * Math.sin(a * Math.PI / 180))}`;
      let spokes = '', lugs = '';
      for (let i = 0; i < 5; i++) for (const d of [-9, 9]) {
        spokes += `<path d="M-3.4 -12 L-4.8 -30 Q0 -32.4 4.8 -30 L3.4 -12 Z" fill="url(#spokeG)" transform="rotate(${i * 72 + d})"/>
          <path d="M0 -13 L0 -30" stroke="#fff" stroke-opacity=".55" stroke-width=".9" transform="rotate(${i * 72 + d})"/>`;
      }
      for (let i = 0; i < 6; i++) lugs += `<circle cx="${f(9.6 * Math.cos((i * 60 + 30) * Math.PI / 180))}" cy="${f(9.6 * Math.sin((i * 60 + 30) * Math.PI / 180))}" r="1.8" fill="#d3dae8" stroke="#2b3248" stroke-width=".5"/>`;
      return `<g transform="translate(${cx} -54)">
        <circle r="63" fill="#04060b"/>
        <circle r="54" fill="url(#tireG)"/>
        <circle r="53" fill="none" stroke="#0a0c14" stroke-width="2"/>
        <circle r="47.5" fill="none" stroke="#262c46" stroke-width="2" stroke-dasharray="1.6 2.4" opacity=".85"/>
        <circle r="41.5" fill="none" stroke="#161b2e" stroke-width="1.2"/>
        <path d="M-52 -14 A54 54 0 0 1 14 -52" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2.4"/>
        <path d="M34 -42 A54 54 0 0 1 53 -8" fill="none" stroke="#ffb27a" stroke-opacity=".55" stroke-width="2.6"/>
        <circle r="35" fill="url(#rimG)"/>
        <circle r="31.5" fill="#0e1428"/>
        <circle r="28.5" fill="url(#rotorG)"/>
        <circle r="22" fill="none" stroke="#6b7390" stroke-width=".7" opacity=".55"/>
        <path d="M${P(30, -74)} A30 30 0 0 1 ${P(30, -16)} L${P(22, -16)} A22 22 0 0 0 ${P(22, -74)} Z" fill="#e8803f"/>
        <path d="M${P(29, -70)} A29 29 0 0 1 ${P(29, -40)}" fill="none" stroke="#ffd9b0" stroke-width="1.2" opacity=".7"/>
        ${spokes}
        <circle r="13.5" fill="url(#rimG)"/>
        ${lugs}
        <circle r="6.6" fill="#0f1a33" stroke="#e8803f" stroke-width="1.4"/>
        <path d="M-3.4 -3 L0 0 L-3.4 3 M0 -3 L3.4 0 L0 3" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <path d="M-33 -8 A34 34 0 0 1 8 -33" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/>
      </g>`;
    };
    put('wheels', wheel(141) + wheel(601));

    let rack = '';
    [32, 78, 124, 170].forEach(x => {
      rack += `<rect x="${x}" y="-233" width="6" height="57" rx="1.5" fill="#141c34"/><rect x="${x + 4}" y="-233" width="2" height="57" fill="#ffb27a" opacity=".5"/>`;
    });
    rack += `<rect x="26" y="-236" width="200" height="7" rx="3" fill="#141c34"/><rect x="26" y="-236" width="200" height="2.2" rx="1" fill="#ffc690" opacity=".75"/>`;
    rack += `<rect x="26" y="-205" width="196" height="5" fill="#141c34"/><rect x="26" y="-205" width="196" height="1.5" fill="#ffc690" opacity=".5"/>`;
    /* headache rack behind the cab */
    rack += `<rect x="210" y="-236" width="6" height="61" rx="1.5" fill="#141c34"/><rect x="220" y="-236" width="6" height="61" rx="1.5" fill="#141c34"/>`;
    [-222, -206, -190].forEach(y => { rack += `<rect x="210" y="${y}" width="16" height="3.6" fill="#141c34"/>`; });
    rack += `<rect x="224" y="-236" width="2" height="61" fill="#ffb27a" opacity=".55"/>`;
    put('rack', rack);
  })();

'''
a = s.index('  /* ---------- truck: wheels + rack ---------- */')
b = s.index('  /* ---------- drifting dust motes in the low sun ---------- */')
s = s[:a] + JS + s[b:]

open(P, 'w', encoding='utf-8').write(s)
print('patched truck OK, bytes', len(s))
