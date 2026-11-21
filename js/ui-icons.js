/* ==========================================================================
   Icones Vetoriais de Interface (UI Icons)
   Projeto: Saude na Escola: Saude Bucal
   5 conjuntos infantis modernos (10 SVGs ao todo), 100% offline, sem <defs>,
   sem id=, sem style inline e compativeis com DomSafe.parseSvg e CSP estrito.
   ========================================================================== */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------------------
     1) SOM (viewBox="0 0 44 44")
     ------------------------------------------------------------------------ */

  var SOUND_ON = [
    '<svg viewBox="0 0 44 44" aria-hidden="true">',
    '  <path d="M7 15 L12 15 L19.5 9.5 Q23 7.5 23 11.5 L23 32.5 Q23 36.5 19.5 34.5 L12 29 L7 29 Q4.5 29 4.5 26.5 L4.5 17.5 Q4.5 15 7 15 Z" fill="#FFB300"/>',
    '  <path d="M7 15.2 L11.5 15.2 L11.5 28.8 L7 28.8 Q4.7 28.8 4.7 26.5 L4.7 17.5 Q4.7 15.2 7 15.2 Z" fill="#FB8C00"/>',
    '  <path d="M4.8 23.5 L22.8 23.5 L22.8 32.5 Q22.8 36 19.5 34.2 L12 28.8 L7 28.8 Q4.8 28.8 4.8 26.5 Z" fill="#E65100" fill-opacity="0.32"/>',
    '  <path d="M6.4 17.4 L9.8 17.4" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-opacity="0.75"/>',
    '  <path d="M13.6 15.4 L19.6 11.6" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.85"/>',
    '  <line x1="11.5" y1="15.6" x2="11.5" y2="28.4" stroke="#7A2E00" stroke-width="1.8" stroke-linecap="round" stroke-opacity="0.4"/>',
    '  <path d="M7 15 L12 15 L19.5 9.5 Q23 7.5 23 11.5 L23 32.5 Q23 36.5 19.5 34.5 L12 29 L7 29 Q4.5 29 4.5 26.5 L4.5 17.5 Q4.5 15 7 15 Z" fill="none" stroke="#7A2E00" stroke-width="2.4" stroke-linejoin="round"/>',
    '  <path d="M26.8 18.2 Q30.2 22 26.8 25.8" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>',
    '  <path d="M30.5 14.5 Q35.6 22 30.5 29.5" fill="none" stroke="#FFF59D" stroke-width="2.8" stroke-linecap="round"/>',
    '  <path d="M34.2 10.8 Q41.0 22 34.2 33.2" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>',
    '  <path d="M37.5 8.5 L38.1 10.1 L39.7 10.7 L38.1 11.3 L37.5 12.9 L36.9 11.3 L35.3 10.7 L36.9 10.1 Z" fill="#FFF59D"/>',
    '  <circle cx="38.2" cy="31.5" r="1.2" fill="#FFFFFF"/>',
    '</svg>'
  ].join('\n');

  var SOUND_OFF = [
    '<svg viewBox="0 0 44 44" aria-hidden="true">',
    '  <path d="M6.8 15 L11.5 15 L18.8 9.6 Q22.2 7.6 22.2 11.6 L22.2 32.4 Q22.2 36.4 18.8 34.4 L11.5 29 L6.8 29 Q4.4 29 4.4 26.5 L4.4 17.5 Q4.4 15 6.8 15 Z" fill="#CFD8DC"/>',
    '  <path d="M6.8 15.2 L11.2 15.2 L11.2 28.8 L6.8 28.8 Q4.6 28.8 4.6 26.5 L4.6 17.5 Q4.6 15.2 6.8 15.2 Z" fill="#90A4AE"/>',
    '  <path d="M4.6 23.5 L22.0 23.5 L22.0 32.4 Q22.0 35.8 18.8 34.1 L11.5 28.8 L6.8 28.8 Q4.6 28.8 4.6 26.5 Z" fill="#607D8B" fill-opacity="0.32"/>',
    '  <path d="M6.3 17.4 L9.5 17.4" fill="none" stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round" stroke-opacity="0.72"/>',
    '  <path d="M13.2 15.4 L18.9 11.6" fill="none" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round" stroke-opacity="0.82"/>',
    '  <line x1="11.2" y1="15.6" x2="11.2" y2="28.4" stroke="#37474F" stroke-width="1.7" stroke-linecap="round" stroke-opacity="0.38"/>',
    '  <path d="M6.8 15 L11.5 15 L18.8 9.6 Q22.2 7.6 22.2 11.6 L22.2 32.4 Q22.2 36.4 18.8 34.4 L11.5 29 L6.8 29 Q4.4 29 4.4 26.5 L4.4 17.5 Q4.4 15 6.8 15 Z" fill="none" stroke="#37474F" stroke-width="2.4" stroke-linejoin="round"/>',
    '  <circle cx="31.5" cy="22" r="8.2" fill="#EF5350" stroke="#B71C1C" stroke-width="2.2"/>',
    '  <path d="M26.5 18.2 A6.2 6.2 0 0 1 35.8 17.5" fill="none" stroke="#FFCDD2" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.72"/>',
    '  <line x1="28.2" y1="18.7" x2="34.8" y2="25.3" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>',
    '  <line x1="34.8" y1="18.7" x2="28.2" y2="25.3" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>',
    '</svg>'
  ].join('\n');

  /* ------------------------------------------------------------------------
     2) MEDALHAS DE PODIO (viewBox="0 0 48 48")
     ------------------------------------------------------------------------ */

  var MEDAL_1 = [
    '<svg viewBox="0 0 48 48" aria-hidden="true">',
    '  <path d="M27 4 L36 4 L28 17 L21 17 Z" fill="#E53935" stroke="#8E1C1C" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M30.2 4.6 L32.9 4.6 L25.8 16.4 L23.5 16.4 Z" fill="#FFD54F"/>',
    '  <path d="M12 4 L21 4 L27 17 L20 17 Z" fill="#EF5350" stroke="#8E1C1C" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M15.1 4.6 L17.8 4.6 L24.5 16.4 L22.2 16.4 Z" fill="#FFD54F"/>',
    '  <circle cx="24" cy="17.2" r="2.8" fill="none" stroke="#B26A00" stroke-width="2.4"/>',
    '  <circle cx="24" cy="17.2" r="2.8" fill="none" stroke="#FFE082" stroke-width="1.1"/>',
    '  <path d="M36.8 31 Q38 34.8 35.1 37.4 Q34.3 41.3 30.4 42.1 Q27.8 45 24 43.8 Q20.2 45 17.6 42.1 Q13.7 41.3 12.9 37.4 Q10 34.8 11.2 31 Q10 27.2 12.9 24.6 Q13.7 20.7 17.6 19.9 Q20.2 17 24 18.2 Q27.8 17 30.4 19.9 Q34.3 20.7 35.1 24.6 Q38 27.2 36.8 31 Z" fill="#FFD54F" stroke="#B26A00" stroke-width="2.1" stroke-linejoin="round"/>',
    '  <circle cx="24" cy="31" r="10.1" fill="#FFB300" stroke="#B26A00" stroke-width="1.6"/>',
    '  <path d="M16.1 36.6 A9.7 9.7 0 0 0 31.9 36.6 A14 14 0 0 1 16.1 36.6 Z" fill="#E65100" fill-opacity="0.28"/>',
    '  <path d="M16.5 27.5 A8.8 8.8 0 0 1 28.5 22.8" fill="none" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round" stroke-opacity="0.72"/>',
    '  <polygon points="24,24.6 25.6,28.7 30.1,29 26.7,31.9 27.8,36.2 24,33.8 20.2,36.2 21.3,31.9 17.9,29 22.4,28.7" fill="#FFFDE7" stroke="#B26A00" stroke-width="1.3" stroke-linejoin="round"/>',
    '  <path d="M8.5 20.5 L9.3 22.3 L11.1 23.1 L9.3 23.9 L8.5 25.7 L7.7 23.9 L5.9 23.1 L7.7 22.3 Z" fill="#FFD54F" stroke="#B26A00" stroke-width="0.9" stroke-linejoin="round"/>',
    '  <path d="M39.8 21.5 L40.5 23 L42 23.7 L40.5 24.4 L39.8 25.9 L39.1 24.4 L37.6 23.7 L39.1 23 Z" fill="#FFF59D" stroke="#B26A00" stroke-width="0.9" stroke-linejoin="round"/>',
    '</svg>'
  ].join('\n');

  var MEDAL_2 = [
    '<svg viewBox="0 0 48 48" aria-hidden="true">',
    '  <path d="M27 4 L36 4 L28 17 L21 17 Z" fill="#1976D2" stroke="#0D47A1" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M30.2 4.6 L32.9 4.6 L25.8 16.4 L23.5 16.4 Z" fill="#81D4FA"/>',
    '  <path d="M12 4 L21 4 L27 17 L20 17 Z" fill="#1E88E5" stroke="#0D47A1" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M15.1 4.6 L17.8 4.6 L24.5 16.4 L22.2 16.4 Z" fill="#81D4FA"/>',
    '  <circle cx="24" cy="17.2" r="2.8" fill="none" stroke="#455A64" stroke-width="2.4"/>',
    '  <circle cx="24" cy="17.2" r="2.8" fill="none" stroke="#ECEFF1" stroke-width="1.1"/>',
    '  <circle cx="24" cy="31" r="13.2" fill="#ECEFF1" stroke="#455A64" stroke-width="2.2"/>',
    '  <circle cx="24" cy="31" r="9.9" fill="#CFD8DC" stroke="#607D8B" stroke-width="1.6"/>',
    '  <path d="M16.1 36.6 A9.5 9.5 0 0 0 31.9 36.6 A14 14 0 0 1 16.1 36.6 Z" fill="#78909C" fill-opacity="0.38"/>',
    '  <path d="M16.2 27.6 A9 9 0 0 1 28.8 22.8" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.88"/>',
    '  <polygon points="24,24.6 25.6,28.7 30.1,29 26.7,31.9 27.8,36.2 24,33.8 20.2,36.2 21.3,31.9 17.9,29 22.4,28.7" fill="#FFFFFF" stroke="#455A64" stroke-width="1.3" stroke-linejoin="round"/>',
    '  <circle cx="38.5" cy="23.5" r="1.4" fill="#ECEFF1" stroke="#455A64" stroke-width="0.9"/>',
    '</svg>'
  ].join('\n');

  var MEDAL_3 = [
    '<svg viewBox="0 0 48 48" aria-hidden="true">',
    '  <path d="M27 4 L36 4 L28 17 L21 17 Z" fill="#219653" stroke="#1B5E20" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M30.2 4.6 L32.9 4.6 L25.8 16.4 L23.5 16.4 Z" fill="#FFD54F"/>',
    '  <path d="M12 4 L21 4 L27 17 L20 17 Z" fill="#2BB673" stroke="#1B5E20" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M15.1 4.6 L17.8 4.6 L24.5 16.4 L22.2 16.4 Z" fill="#FFD54F"/>',
    '  <circle cx="24" cy="17.2" r="2.8" fill="none" stroke="#BF360C" stroke-width="2.4"/>',
    '  <circle cx="24" cy="17.2" r="2.8" fill="none" stroke="#FFCC80" stroke-width="1.1"/>',
    '  <circle cx="24" cy="31" r="13.2" fill="#FFCC80" stroke="#BF360C" stroke-width="2.2"/>',
    '  <circle cx="24" cy="31" r="9.9" fill="#FB8C00" stroke="#BF360C" stroke-width="1.6"/>',
    '  <path d="M16.1 36.6 A9.5 9.5 0 0 0 31.9 36.6 A14 14 0 0 1 16.1 36.6 Z" fill="#BF360C" fill-opacity="0.28"/>',
    '  <path d="M16.4 27.6 A9 9 0 0 1 28.6 22.8" fill="none" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round" stroke-opacity="0.65"/>',
    '  <polygon points="24,24.6 25.6,28.7 30.1,29 26.7,31.9 27.8,36.2 24,33.8 20.2,36.2 21.3,31.9 17.9,29 22.4,28.7" fill="#FFF3E0" stroke="#BF360C" stroke-width="1.3" stroke-linejoin="round"/>',
    '</svg>'
  ].join('\n');

  /* ------------------------------------------------------------------------
     3) TROFEUS (Header 40x40, Modal 120x120, Ranking 80x80)
     ------------------------------------------------------------------------ */

  var TROPHY_HEADER = [
    '<svg viewBox="0 0 40 40" aria-hidden="true">',
    '  <path d="M11.5 10 C5.5 10 5.5 19 12.2 19.6" fill="none" stroke="#E65100" stroke-width="4.4" stroke-linecap="round"/>',
    '  <path d="M11.5 10 C5.5 10 5.5 19 12.2 19.6" fill="none" stroke="#FFEE58" stroke-width="1.9" stroke-linecap="round"/>',
    '  <path d="M28.5 10 C34.5 10 34.5 19 27.8 19.6" fill="none" stroke="#E65100" stroke-width="4.4" stroke-linecap="round"/>',
    '  <path d="M28.5 10 C34.5 10 34.5 19 27.8 19.6" fill="none" stroke="#FFEE58" stroke-width="1.9" stroke-linecap="round"/>',
    '  <path d="M17.5 23.5 L22.5 23.5 L23.2 29.8 L16.8 29.8 Z" fill="#FFB300" stroke="#E65100" stroke-width="2" stroke-linejoin="round"/>',
    '  <rect x="13" y="29.5" width="14" height="3.2" rx="1.6" fill="#FFEE58" stroke="#E65100" stroke-width="1.9"/>',
    '  <rect x="9.8" y="32.6" width="20.4" height="4" rx="1.8" fill="#FB8C00" stroke="#E65100" stroke-width="2"/>',
    '  <path d="M10.5 7 L29.5 7 C29.5 17 26 24 20 24.5 C14 24 10.5 17 10.5 7 Z" fill="#FFB300"/>',
    '  <path d="M12.2 8 L17.5 8 C17.2 15 17.8 20.5 19.5 23.8 C14.8 22.4 12.4 16.5 12.2 8 Z" fill="#FFEE58" fill-opacity="0.72"/>',
    '  <path d="M25 8 L29 8 C28.8 16.5 25.8 22.8 20.5 24 C23.8 20.8 25.2 15 25 8 Z" fill="#E65100" fill-opacity="0.24"/>',
    '  <path d="M10.5 7 L29.5 7 C29.5 17 26 24 20 24.5 C14 24 10.5 17 10.5 7 Z" fill="none" stroke="#E65100" stroke-width="2.1" stroke-linejoin="round"/>',
    '  <rect x="9.2" y="5.2" width="21.6" height="3.2" rx="1.6" fill="#FFEE58" stroke="#E65100" stroke-width="2"/>',
    '  <polygon points="20,11.2 21.1,14 24,14.2 21.7,16.1 22.5,19 20,17.4 17.5,19 18.3,16.1 16,14.2 18.9,14" fill="#FFFFFF" stroke="#E65100" stroke-width="1.1" stroke-linejoin="round"/>',
    '  <path d="M6.2 4.5 L6.8 6 L8.3 6.6 L6.8 7.2 L6.2 8.7 L5.6 7.2 L4.1 6.6 L5.6 6 Z" fill="#FFEE58"/>',
    '  <path d="M33.8 4.5 L34.4 6 L35.9 6.6 L34.4 7.2 L33.8 8.7 L33.2 7.2 L31.7 6.6 L33.2 6 Z" fill="#FFEE58"/>',
    '</svg>'
  ].join('\n');

  var TROPHY_MODAL = [
    '<svg viewBox="0 0 120 120" aria-hidden="true">',
    '  <ellipse cx="60" cy="109" rx="34" ry="4.8" fill="#5D4037" fill-opacity="0.16"/>',
    '  <polygon points="18,16 20.2,21 25.6,21.5 21.4,25.1 22.7,30.4 18,27.6 13.3,30.4 14.6,25.1 10.4,21.5 15.8,21" fill="#FFEE58" stroke="#E65100" stroke-width="2" stroke-linejoin="round"/>',
    '  <polygon points="102,17 104,21.4 108.8,21.8 105.1,25 106.2,29.7 102,27.2 97.8,29.7 98.9,25 95.2,21.8 100,21.4" fill="#FFEE58" stroke="#E65100" stroke-width="2" stroke-linejoin="round"/>',
    '  <rect x="11" y="51" width="7" height="3.6" rx="1.8" transform="rotate(-28 14.5 52.8)" fill="#FF7043"/>',
    '  <circle cx="22" cy="78" r="2.8" fill="#29B6F6"/>',
    '  <rect x="102" y="49" width="7" height="3.6" rx="1.8" transform="rotate(26 105.5 50.8)" fill="#66BB6A"/>',
    '  <circle cx="97" cy="77" r="2.8" fill="#EC407A"/>',
    '  <circle cx="35" cy="13" r="2.2" fill="#4DD0E1"/>',
    '  <circle cx="85" cy="13" r="2.2" fill="#FF8A65"/>',
    '  <path d="M60 6 L61.3 9.2 L64.5 10.5 L61.3 11.8 L60 15 L58.7 11.8 L55.5 10.5 L58.7 9.2 Z" fill="#FFEE58" stroke="#E65100" stroke-width="1.1" stroke-linejoin="round"/>',
    '  <path d="M33 30 C16 28 14 48 25 56 C28 58 33 58 37 56" fill="none" stroke="#B25000" stroke-width="10.8" stroke-linecap="round"/>',
    '  <path d="M33 30 C16 28 14 48 25 56 C28 58 33 58 37 56" fill="none" stroke="#FFC107" stroke-width="5.6" stroke-linecap="round"/>',
    '  <path d="M30 30.2 C21 29.8 17.5 39 21 47" fill="none" stroke="#FFF9C4" stroke-width="1.9" stroke-linecap="round" stroke-opacity="0.75"/>',
    '  <path d="M87 30 C104 28 106 48 95 56 C92 58 87 58 83 56" fill="none" stroke="#B25000" stroke-width="10.8" stroke-linecap="round"/>',
    '  <path d="M87 30 C104 28 106 48 95 56 C92 58 87 58 83 56" fill="none" stroke="#FFC107" stroke-width="5.6" stroke-linecap="round"/>',
    '  <path d="M90 30.2 C99 29.8 102.5 39 99 47" fill="none" stroke="#FFF9C4" stroke-width="1.9" stroke-linecap="round" stroke-opacity="0.75"/>',
    '  <path d="M53 75 L67 75 L70 86 L50 86 Z" fill="#FFB300" stroke="#B25000" stroke-width="2.8" stroke-linejoin="round"/>',
    '  <path d="M62 76 L66 76 L68.5 85 L62 85 Z" fill="#E65100" fill-opacity="0.28"/>',
    '  <rect x="49" y="70.5" width="22" height="6" rx="3" fill="#FFEE58" stroke="#B25000" stroke-width="2.6"/>',
    '  <rect x="37" y="85" width="46" height="6.8" rx="3.2" fill="#FFD54F" stroke="#B25000" stroke-width="2.8"/>',
    '  <path d="M33 91 L87 91 L91 105 Q91 107.5 88 107.5 L32 107.5 Q29 107.5 29 105 Z" fill="#8D4E2A" stroke="#4E2A14" stroke-width="3" stroke-linejoin="round"/>',
    '  <path d="M30.5 102 L89.5 102 L90.6 105.5 Q90.6 107 88 107 L32 107 Q29.4 107 29.4 105.5 Z" fill="#4E2A14" fill-opacity="0.32"/>',
    '  <rect x="42" y="94.5" width="36" height="9.5" rx="3" fill="#FFF59D" stroke="#B25000" stroke-width="2"/>',
    '  <path d="M46 95.5 L53 95.5 L48 103 L43.5 103 L43.5 97.5 Z" fill="#FFFFFF" fill-opacity="0.65"/>',
    '  <circle cx="46.5" cy="99.2" r="1.2" fill="#B25000"/>',
    '  <circle cx="73.5" cy="99.2" r="1.2" fill="#B25000"/>',
    '  <polygon points="60,96.4 60.8,98.3 62.8,98.5 61.3,99.8 61.7,101.8 60,100.7 58.3,101.8 58.7,99.8 57.2,98.5 59.2,98.3" fill="#FFB300" stroke="#B25000" stroke-width="0.8" stroke-linejoin="round"/>',
    '  <path d="M32 22 L88 22 C88 49 80 71 60 72 C40 71 32 49 32 22 Z" fill="#FFB300"/>',
    '  <path d="M37 25 C37 42 40 56 47 64 C42 54 40 40 41 25 Z" fill="#FFF9C4" fill-opacity="0.68"/>',
    '  <path d="M72 22 L88 22 C88 49 80 71 60 72 C70 63 75 45 72 22 Z" fill="#E65100" fill-opacity="0.24"/>',
    '  <path d="M32 22 L88 22 C88 49 80 71 60 72 C40 71 32 49 32 22 Z" fill="none" stroke="#B25000" stroke-width="3.2" stroke-linejoin="round"/>',
    '  <rect x="29" y="18" width="62" height="7.5" rx="3.7" fill="#FFEE58" stroke="#B25000" stroke-width="3"/>',
    '  <path d="M34 20.5 L64 20.5" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-opacity="0.72"/>',
    '  <circle cx="60" cy="45" r="16.2" fill="#E0F7FA" stroke="#B25000" stroke-width="2.2"/>',
    '  <circle cx="60" cy="45" r="13.8" fill="none" stroke="#FFFFFF" stroke-width="1.3" stroke-opacity="0.8"/>',
    '  <path d="M60 36.2 C57.4 34.2 51.4 34.2 50.4 39.4 C49.4 44.6 51.5 48.6 53 52.6 C54 55.2 56.8 55.2 57.5 52.6 C58.2 50 59.2 49.5 60 49.5 C60.8 49.5 61.8 50 62.5 52.6 C63.2 55.2 66 55.2 67 52.6 C68.5 48.6 70.6 44.6 69.6 39.4 C68.6 34.2 62.6 34.2 60 36.2 Z" fill="#FFFFFF"/>',
    '  <path d="M65.8 36.2 C68.8 37.8 69.6 43 66.8 52 C65.8 54 64.2 53.8 63.4 51.4 C65.5 46.8 67 40.5 65.8 36.2 Z" fill="#B3E5FC" fill-opacity="0.45"/>',
    '  <path d="M60 36.2 C57.4 34.2 51.4 34.2 50.4 39.4 C49.4 44.6 51.5 48.6 53 52.6 C54 55.2 56.8 55.2 57.5 52.6 C58.2 50 59.2 49.5 60 49.5 C60.8 49.5 61.8 50 62.5 52.6 C63.2 55.2 66 55.2 67 52.6 C68.5 48.6 70.6 44.6 69.6 39.4 C68.6 34.2 62.6 34.2 60 36.2 Z" fill="none" stroke="#37474F" stroke-width="2.1" stroke-linejoin="round"/>',
    '  <circle cx="56.2" cy="41.8" r="1.45" fill="#263238"/>',
    '  <circle cx="63.8" cy="41.8" r="1.45" fill="#263238"/>',
    '  <circle cx="55.7" cy="41.3" r="0.55" fill="#FFFFFF"/>',
    '  <circle cx="63.3" cy="41.3" r="0.55" fill="#FFFFFF"/>',
    '  <ellipse cx="53.6" cy="44.2" rx="1.5" ry="0.9" fill="#FF8A80" fill-opacity="0.68"/>',
    '  <ellipse cx="66.4" cy="44.2" rx="1.5" ry="0.9" fill="#FF8A80" fill-opacity="0.68"/>',
    '  <path d="M57.2 44.8 Q60 47.4 62.8 44.8" fill="none" stroke="#263238" stroke-width="1.5" stroke-linecap="round"/>',
    '</svg>'
  ].join('\n');

  var TROPHY_RANKING = [
    '<svg viewBox="0 0 80 80" aria-hidden="true">',
    '  <ellipse cx="40" cy="75" rx="22" ry="3.2" fill="#4E2A14" fill-opacity="0.16"/>',
    '  <polygon points="10.5,8.5 11.9,11.6 15.2,11.9 12.6,14.1 13.4,17.4 10.5,15.6 7.6,17.4 8.4,14.1 5.8,11.9 9.1,11.6" fill="#FFEE58" stroke="#9E4700" stroke-width="1.5" stroke-linejoin="round"/>',
    '  <polygon points="69.5,8.5 70.9,11.6 74.2,11.9 71.6,14.1 72.4,17.4 69.5,15.6 66.6,17.4 67.4,14.1 64.8,11.9 68.1,11.6" fill="#FFEE58" stroke="#9E4700" stroke-width="1.5" stroke-linejoin="round"/>',
    '  <path d="M12 43 L12.8 45 L14.8 45.8 L12.8 46.6 L12 48.6 L11.2 46.6 L9.2 45.8 L11.2 45 Z" fill="#FFF59D" stroke="#9E4700" stroke-width="1" stroke-linejoin="round"/>',
    '  <path d="M68 43 L68.8 45 L70.8 45.8 L68.8 46.6 L68 48.6 L67.2 46.6 L65.2 45.8 L67.2 45 Z" fill="#FFF59D" stroke="#9E4700" stroke-width="1" stroke-linejoin="round"/>',
    '  <path d="M21.5 20 C10.5 20 10.5 35 24 37" fill="none" stroke="#9E4700" stroke-width="7" stroke-linecap="round"/>',
    '  <path d="M21.5 20 C10.5 20 10.5 35 24 37" fill="none" stroke="#FFD54F" stroke-width="3.2" stroke-linecap="round"/>',
    '  <path d="M58.5 20 C69.5 20 69.5 35 56 37" fill="none" stroke="#9E4700" stroke-width="7" stroke-linecap="round"/>',
    '  <path d="M58.5 20 C69.5 20 69.5 35 56 37" fill="none" stroke="#FFD54F" stroke-width="3.2" stroke-linecap="round"/>',
    '  <path d="M35.5 52 L44.5 52 L46.5 60 L33.5 60 Z" fill="#FFB300" stroke="#9E4700" stroke-width="2.2" stroke-linejoin="round"/>',
    '  <path d="M41.5 52.5 L44 52.5 L45.8 59.5 L41.5 59.5 Z" fill="#E65100" fill-opacity="0.28"/>',
    '  <rect x="33.5" y="48" width="13" height="4.2" rx="2.1" fill="#FFEE58" stroke="#9E4700" stroke-width="2"/>',
    '  <rect x="26" y="59.5" width="28" height="4.8" rx="2.2" fill="#FFD54F" stroke="#9E4700" stroke-width="2.2"/>',
    '  <path d="M22 64 L58 64 L61 72 Q61 74 59 74 L21 74 Q19 74 19 72 Z" fill="#79421D" stroke="#4E2A14" stroke-width="2.4" stroke-linejoin="round"/>',
    '  <rect x="31" y="66.5" width="18" height="5" rx="1.8" fill="#FFF59D" stroke="#9E4700" stroke-width="1.4"/>',
    '  <path d="M22 16 L58 16 C58 35 51 47 40 48.5 C29 47 22 35 22 16 Z" fill="#FFB300"/>',
    '  <path d="M23.5 17 L35 17 L37.5 47.2 C29 44.5 24 34 23.5 17 Z" fill="#FFE082" fill-opacity="0.78"/>',
    '  <path d="M26.8 17 L31.2 17 L33.8 45.2 C29.2 41 27.2 31 26.8 17 Z" fill="#FFF8E1" fill-opacity="0.62"/>',
    '  <path d="M45 17 L56.5 17 C56 34 51 44.5 42.5 47.2 Z" fill="#E65100" fill-opacity="0.26"/>',
    '  <path d="M22 16 L58 16 C58 35 51 47 40 48.5 C29 47 22 35 22 16 Z" fill="none" stroke="#9E4700" stroke-width="2.6" stroke-linejoin="round"/>',
    '  <rect x="19.5" y="12.5" width="41" height="5" rx="2.5" fill="#FFEE58" stroke="#9E4700" stroke-width="2.4"/>',
    '  <path d="M23.5 14.3 L41 14.3" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.72"/>',
    '  <polygon points="40,21.5 42.2,26.9 48.1,27.4 43.6,31.2 45,36.9 40,33.8 35,36.9 36.4,31.2 31.9,27.4 37.8,26.9" fill="#FFFFFF" stroke="#9E4700" stroke-width="1.8" stroke-linejoin="round"/>',
    '</svg>'
  ].join('\n');

  /* ------------------------------------------------------------------------
     4) CASINHA ACOLHEDORA (HOME - viewBox="0 0 44 44")
     ------------------------------------------------------------------------ */

  var HOME = [
    '<svg viewBox="0 0 44 44" aria-hidden="true">',
    '  <rect x="28.5" y="8" width="5.5" height="9" rx="1" fill="#FF8A65" stroke="#5D4037" stroke-width="2"/>',
    '  <rect x="27.3" y="6.8" width="7.9" height="2.6" rx="1.2" fill="#D84315" stroke="#5D4037" stroke-width="1.8"/>',
    '  <path d="M10.5 21 L22 10 L33.5 21 L33.5 36.5 Q33.5 38.5 31.5 38.5 L12.5 38.5 Q10.5 38.5 10.5 36.5 Z" fill="#FFF8E7"/>',
    '  <path d="M28.8 16.5 L33.5 21 L33.5 38.5 L28.8 38.5 Z" fill="#E6D5B8" fill-opacity="0.7"/>',
    '  <path d="M10.5 21.5 L22 11 L33.5 21.5 L33.5 24.4 L22 14 L10.5 24.4 Z" fill="#D7C09E" fill-opacity="0.45"/>',
    '  <path d="M10.5 21 L22 10 L33.5 21 L33.5 36.5 Q33.5 38.5 31.5 38.5 L12.5 38.5 Q10.5 38.5 10.5 36.5 Z" fill="none" stroke="#5D4037" stroke-width="2.2" stroke-linejoin="round"/>',
    '  <path d="M6.5 23.4 L22 10.6 L37.5 23.4" fill="none" stroke="#5D4037" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>',
    '  <path d="M6.5 23.4 L22 10.6 L37.5 23.4" fill="none" stroke="#FFAB91" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    '  <path d="M5 21.2 L22 7.4 L39 21.2" fill="none" stroke="#5D4037" stroke-width="6.6" stroke-linecap="round" stroke-linejoin="round"/>',
    '  <path d="M5 21.2 L22 7.4 L39 21.2" fill="none" stroke="#EF5350" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
    '  <path d="M8.5 17.5 L21 7.4" fill="none" stroke="#FFCDD2" stroke-width="1.1" stroke-linecap="round" stroke-opacity="0.75"/>',
    '  <circle cx="22" cy="18.6" r="3.1" fill="#FFF176" stroke="#5D4037" stroke-width="1.8"/>',
    '  <line x1="22" y1="15.8" x2="22" y2="21.4" stroke="#5D4037" stroke-width="1.1"/>',
    '  <line x1="19.2" y1="18.6" x2="24.8" y2="18.6" stroke="#5D4037" stroke-width="1.1"/>',
    '  <path d="M17.5 38.5 L17.5 29 C17.5 25.5 26.5 25.5 26.5 29 L26.5 38.5 Z" fill="#4FC3F7"/>',
    '  <path d="M17.5 38.5 L17.5 29 C17.5 26.8 20.5 26 22.8 26.4 C20 27 19.3 28.5 19.3 38.5 Z" fill="#0288D1" fill-opacity="0.22"/>',
    '  <path d="M17.5 38.5 L17.5 29 C17.5 25.5 26.5 25.5 26.5 29 L26.5 38.5 Z" fill="none" stroke="#5D4037" stroke-width="2" stroke-linejoin="round"/>',
    '  <circle cx="24.2" cy="32.8" r="1.25" fill="#FFD54F" stroke="#5D4037" stroke-width="0.9"/>',
    '  <path d="M6.2 38.5 C4.5 38.5 4.2 35.5 6.2 34.5 C6.2 31.8 9.8 31 11.4 33 C13.5 32.5 15.2 34.5 14.5 37 C14.5 38.5 13 38.5 12 38.5 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.9" stroke-linejoin="round"/>',
    '  <path d="M7.6 34.8 C8.5 33 10.6 33 11.5 34.2" fill="none" stroke="#C8E6C9" stroke-width="1.1" stroke-linecap="round"/>',
    '  <path d="M30 38.5 C29 38.5 29 36.5 29.8 34.8 C30.2 32.2 33.5 31.8 34.8 33.5 C36.8 32.8 39.2 34.8 38.2 37.5 C38 38.5 37 38.5 36 38.5 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.9" stroke-linejoin="round"/>',
    '  <path d="M31.4 34.8 C32.2 33.2 34 33.2 34.8 34.4" fill="none" stroke="#C8E6C9" stroke-width="1.1" stroke-linecap="round"/>',
    '</svg>'
  ].join('\n');

  /* ------------------------------------------------------------------------
     5) BOTAO ROXO "OUTRA PALAVRA" / "NOVOS PARES" (NEXT_CYCLE - 40x40)
     ------------------------------------------------------------------------ */

  var NEXT_CYCLE = [
    '<svg viewBox="0 0 40 40" aria-hidden="true">',
    '  <circle cx="20" cy="20" r="16" fill="#FFFFFF" fill-opacity="0.16"/>',
    '  <circle cx="20" cy="20" r="10.5" fill="#FFFFFF" fill-opacity="0.08"/>',
    '  <path d="M11.7 16.1 A2.3 2.3 0 0 1 7.5 14.2 A13.8 13.8 0 0 1 31.3 12.1 L33.2 10.8 L33.1 18.7 L25.7 16.0 L27.5 14.7 A9.2 9.2 0 0 0 11.7 16.1 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M10.3 14.5 A12 12 0 0 1 29.5 13.0" fill="none" stroke="#FFF176" stroke-width="1.6" stroke-linecap="round"/>',
    '  <path d="M28.3 23.9 A2.3 2.3 0 0 1 32.5 25.8 A13.8 13.8 0 0 1 8.7 27.9 L6.8 29.2 L6.9 21.3 L14.3 24.0 L12.5 25.3 A9.2 9.2 0 0 0 28.3 23.9 Z" fill="#4DD0E1" stroke="#00838F" stroke-width="2" stroke-linejoin="round"/>',
    '  <path d="M29.7 25.5 A12 12 0 0 1 10.5 27.0" fill="none" stroke="#80DEEA" stroke-width="1.6" stroke-linecap="round"/>',
    '  <circle cx="20" cy="20" r="4.6" fill="#FFF176" fill-opacity="0.32"/>',
    '  <path d="M20 15.6 L21.1 18.9 L24.4 20 L21.1 21.1 L20 24.4 L18.9 21.1 L15.6 20 L18.9 18.9 Z" fill="#FFFFFF"/>',
    '  <circle cx="15.2" cy="16.2" r="0.9" fill="#FFFFFF"/>',
    '  <circle cx="24.8" cy="23.8" r="0.9" fill="#FFFFFF"/>',
    '</svg>'
  ].join('\n');

  /* ------------------------------------------------------------------------
     Helper de Selecao de Medalha por Posicao
     ------------------------------------------------------------------------ */

  /**
   * Retorna o SVG da medalha correspondente a posicao no podio (1, 2 ou 3).
   * @param {number} position
   * @returns {string}
   */
  function getMedalSvg(position) {
    if (position === 1) {
      return MEDAL_1;
    }
    if (position === 2) {
      return MEDAL_2;
    }
    if (position === 3) {
      return MEDAL_3;
    }
    return '';
  }

  /* ------------------------------------------------------------------------
     Exportacao no Namespace Global
     ------------------------------------------------------------------------ */

  global.SaudeEscola = global.SaudeEscola || {};
  global.SaudeEscola.UiIcons = {
    SOUND_ON: SOUND_ON,
    SOUND_OFF: SOUND_OFF,
    MEDAL_1: MEDAL_1,
    MEDAL_2: MEDAL_2,
    MEDAL_3: MEDAL_3,
    TROPHY_HEADER: TROPHY_HEADER,
    TROPHY_MODAL: TROPHY_MODAL,
    TROPHY_RANKING: TROPHY_RANKING,
    HOME: HOME,
    NEXT_CYCLE: NEXT_CYCLE,
    getMedalSvg: getMedalSvg
  };
}(typeof window !== 'undefined' ? window : globalThis));
