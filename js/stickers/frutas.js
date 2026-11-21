/* ==========================================================================
   Pacote de Stickers SVG: Frutas e Alimentos
   Projeto: Saude na Escola: Saude Bucal
   100% offline (file:// e GitHub Pages), sem ES Modules e sem emojis nativos.
   ========================================================================== */

(function (global) {
  'use strict';

  /* Garante a existencia do namespace global do jogo e do catalogo de stickers */
  global.SaudeEscola = global.SaudeEscola || {};
  global.SaudeEscola.StickersData = global.SaudeEscola.StickersData || {};

  /**
   * Lista dos 8 stickers infantis da categoria "Frutas e Alimentos".
   * Todos os SVGs seguem o viewBox 120x120 e usam apenas tags/atributos
   * permitidos por SaudeEscola.DomSafe.parseSvg.
   */
  var ITEMS = [
    {
      id: 'banana',
      label: 'Banana',
      category: 'frutas',
      keywords: ['BANANA', 'BANANINHA', 'BANANAS'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="60" cy="103" rx="34" ry="5" fill="#F57F17" fill-opacity="0.14"/>',
        '  <path d="M47 25 C65 25 91 37 104 65 C105 68 102 72 99 70 C84 58 64 47 45 34 Z" fill="#FBC02D"/>',
        '  <path d="M52 34 C69 44 86 55 99 67 C94 59 83 45 64 35 Z" fill="#F57F17" fill-opacity="0.24"/>',
        '  <path d="M98 63 C101 62 104 64 104 67 C103 70 100 71 98 69 Z" fill="#6D4C41"/>',
        '  <path d="M47 25 C65 25 91 37 104 65 C105 68 102 72 99 70 C84 58 64 47 45 34 Z" fill="none" stroke="#795548" stroke-width="3.6" stroke-linejoin="round"/>',
        '  <path d="M39 27 C21 56 32 95 85 95 C92 95 97 92 98 88 C98 85 94 82 88 80 C62 72 52 51 48 28 Z" fill="#FFEE58"/>',
        '  <path d="M33 69 C39 87 60 95 86 94 C91 94 95 91 96 88 C80 90 52 87 33 69 Z" fill="#F9A825" fill-opacity="0.48"/>',
        '  <path d="M40 42 C38 64 53 84 85 87" fill="none" stroke="#F57F17" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.65"/>',
        '  <path d="M46 37 C46 53 56 71 78 80" fill="none" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" stroke-opacity="0.82"/>',
        '  <path d="M90 83 C95 84 99 86 98 89 C97 92 92 93 88 92 C90 89 91 86 90 83 Z" fill="#6D4C41"/>',
        '  <path d="M39 27 C21 56 32 95 85 95 C92 95 97 92 98 88 C98 85 94 82 88 80 C62 72 52 51 48 28 Z" fill="none" stroke="#6D4C41" stroke-width="4" stroke-linejoin="round"/>',
        '  <path d="M36 17 C38 14 45 14 48 18 L51 28 C46 30 40 30 37 27 Z" fill="#8D6E63" stroke="#5D4037" stroke-width="3.6" stroke-linejoin="round"/>',
        '  <line x1="41" y1="18" x2="43" y2="25" stroke="#D7CCC8" stroke-width="2" stroke-linecap="round"/>',
        '</svg>'
      ].join('\n')
    },
    {
      id: 'maca',
      label: 'Maçã',
      category: 'frutas',
      keywords: ['MACA', 'MACAS', 'MACAZINHA'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="60" cy="105" rx="28" ry="5" fill="#B71C1C" fill-opacity="0.14"/>',
        '  <path d="M57 38 C56 28 59 20 64 16 C66 15 68 17 67 20 C64 25 62 31 63 38 Z" fill="#795548" stroke="#4E342E" stroke-width="3.2" stroke-linejoin="round"/>',
        '  <path d="M63 30 C69 17 86 16 94 23 C89 35 74 37 63 30 Z" fill="#66BB6A"/>',
        '  <path d="M64 30 C74 34 86 32 93 23 C83 28 73 29 64 30 Z" fill="#43A047" fill-opacity="0.5"/>',
        '  <path d="M67 28 Q78 24 88 23" fill="none" stroke="#C8E6C9" stroke-width="2.2" stroke-linecap="round"/>',
        '  <path d="M63 30 C69 17 86 16 94 23 C89 35 74 37 63 30 Z" fill="none" stroke="#1B5E20" stroke-width="3.4" stroke-linejoin="round"/>',
        '  <path d="M60 39 C47 30 22 33 21 60 C20 84 36 100 51 100 C56 100 58 97 60 97 C62 97 64 100 69 100 C84 100 100 84 99 60 C98 33 73 30 60 39 Z" fill="#EF5350"/>',
        '  <path d="M84 39 C95 45 99 58 98 69 C95 87 82 99 69 99 C65 99 62 97 60 97 C76 93 88 78 88 58 C88 49 86 43 84 39 Z" fill="#C62828" fill-opacity="0.38"/>',
        '  <path d="M31 54 C31 44 38 39 46 39" fill="none" stroke="#FFFFFF" stroke-width="5.2" stroke-linecap="round" stroke-opacity="0.72"/>',
        '  <circle cx="32" cy="64" r="2.6" fill="#FFFFFF" fill-opacity="0.72"/>',
        '  <path d="M51 39 Q60 44 69 39" fill="none" stroke="#B71C1C" stroke-width="2.8" stroke-linecap="round"/>',
        '  <path d="M60 39 C47 30 22 33 21 60 C20 84 36 100 51 100 C56 100 58 97 60 97 C62 97 64 100 69 100 C84 100 100 84 99 60 C98 33 73 30 60 39 Z" fill="none" stroke="#9A1B1B" stroke-width="4.2" stroke-linejoin="round"/>',
        '</svg>'
      ].join('\n')
    },
    {
      id: 'melancia',
      label: 'Melancia',
      category: 'frutas',
      keywords: ['MELANCIA', 'MELANCIAS'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="60" cy="104" rx="34" ry="5" fill="#1B5E20" fill-opacity="0.14"/>',
        '  <path d="M16 76 Q60 112 104 76 L99 69 Q60 100 21 69 Z" fill="#2E7D32"/>',
        '  <path d="M60 94 Q83 94 103 75 L99 69 Q81 86 60 88 Z" fill="#1B5E20" fill-opacity="0.3"/>',
        '  <path d="M21 70 Q60 101 99 70 L94 64 Q60 91 26 64 Z" fill="#DCEDC8"/>',
        '  <path d="M56 22 Q60 18 64 22 L95 65 Q60 92 25 65 Z" fill="#FF5252"/>',
        '  <path d="M60 20 Q62 19 64 22 L95 65 Q78 78 60 79 Z" fill="#D32F2F" fill-opacity="0.22"/>',
        '  <line x1="35" y1="61" x2="55" y2="32" stroke="#FFFFFF" stroke-width="4.2" stroke-linecap="round" stroke-opacity="0.52"/>',
        '  <path d="M21 70 Q60 101 99 70" fill="none" stroke="#1B5E20" stroke-width="2" stroke-linecap="round"/>',
        '  <path d="M24 66 L56 22 Q60 18 64 22 L96 66" fill="none" stroke="#B71C1C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
        '  <path d="M24 66 L16 76 Q60 112 104 76 L96 66" fill="none" stroke="#1B5E20" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
        '  <path d="M60 36 C62.5 40 62.5 44 60 44 C57.5 44 57.5 40 60 36 Z" fill="#3E2723"/>',
        '  <path d="M49 51 C51 55.5 50 59 47.5 58.5 C45 58 46 54.5 49 51 Z" fill="#3E2723"/>',
        '  <path d="M71 51 C74 54.5 75 58 72.5 58.5 C70 59 69 55.5 71 51 Z" fill="#3E2723"/>',
        '  <path d="M41 63 C43 67.5 42 71 39.5 70.5 C37 70 38 66.5 41 63 Z" fill="#3E2723"/>',
        '  <path d="M60 61 C62.5 65 62.5 69 60 69 C57.5 69 57.5 65 60 61 Z" fill="#3E2723"/>',
        '  <path d="M79 63 C82 66.5 83 70 80.5 70.5 C78 71 77 67.5 79 63 Z" fill="#3E2723"/>',
        '</svg>'
      ].join('\n')
    },
    {
      id: 'morango',
      label: 'Morango',
      category: 'frutas',
      keywords: ['MORANGO', 'MORANGOS', 'MORANGUINHO'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="60" cy="105" rx="24" ry="5" fill="#B71C1C" fill-opacity="0.14"/>',
        '  <path d="M60 34 C41 34 25 43 27 63 C29 82 48 101 60 101 C72 101 91 82 93 63 C95 43 79 34 60 34 Z" fill="#EF5350"/>',
        '  <path d="M82 41 C90 47 93 56 92 64 C90 82 72 100 60 100 C70 93 82 77 83 59 C84 51 83 45 82 41 Z" fill="#C62828" fill-opacity="0.38"/>',
        '  <path d="M35 58 C34 49 39 43 46 41" fill="none" stroke="#FFFFFF" stroke-width="4.4" stroke-linecap="round" stroke-opacity="0.62"/>',
        '  <path d="M60 34 C41 34 25 43 27 63 C29 82 48 101 60 101 C72 101 91 82 93 63 C95 43 79 34 60 34 Z" fill="none" stroke="#9A1B1B" stroke-width="4" stroke-linejoin="round"/>',
        '  <ellipse cx="42" cy="52" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="60" cy="50" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="78" cy="52" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="50" cy="65" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="70" cy="65" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="41" cy="76" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="60" cy="78" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="79" cy="76" rx="2.1" ry="3.2" fill="#FFF59D"/>',
        '  <ellipse cx="60" cy="90" rx="2" ry="3" fill="#FFF59D"/>',
        '  <path d="M57 26 C57 19 60 15 64 15 C66 15 67 17 65 19 C63 21 63 24 63 27 Z" fill="#43A047" stroke="#1B5E20" stroke-width="3" stroke-linejoin="round"/>',
        '  <path d="M31 37 C38 29 48 28 55 31 C56 26 60 25 60 25 C60 25 64 26 65 31 C72 28 82 29 89 37 C81 40 75 37 72 44 C66 39 63 39 60 45 C57 39 54 39 48 44 C45 37 39 40 31 37 Z" fill="#66BB6A" stroke="#1B5E20" stroke-width="3.4" stroke-linejoin="round"/>',
        '</svg>'
      ].join('\n')
    },
    {
      id: 'laranja',
      label: 'Laranja',
      category: 'frutas',
      keywords: ['LARANJA', 'LARANJAS', 'MEXERICA', 'TANGERINA'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="58" cy="103" rx="38" ry="5.5" fill="#E65100" fill-opacity="0.14"/>',
        '  <path d="M48 26 C48 20 50 15 53 14 C55 13 57 15 55 18 C53 20 52 23 52 26 Z" fill="#6D4C41" stroke="#4E342E" stroke-width="2.8" stroke-linejoin="round"/>',
        '  <path d="M49 23 C43 12 27 12 20 20 C27 30 40 31 49 23 Z" fill="#66BB6A"/>',
        '  <path d="M45 22 Q34 18 25 20" fill="none" stroke="#C8E6C9" stroke-width="2" stroke-linecap="round"/>',
        '  <path d="M49 23 C43 12 27 12 20 20 C27 30 40 31 49 23 Z" fill="none" stroke="#1B5E20" stroke-width="3.2" stroke-linejoin="round"/>',
        '  <circle cx="50" cy="60" r="34" fill="#FF9800"/>',
        '  <path d="M74 36 A34 34 0 0 1 26 84 A31 31 0 0 0 74 36 Z" fill="#E65100" fill-opacity="0.35"/>',
        '  <path d="M27 50 C29 38 38 31 48 30" fill="none" stroke="#FFFFFF" stroke-width="4.8" stroke-linecap="round" stroke-opacity="0.68"/>',
        '  <circle cx="32" cy="70" r="1.6" fill="#D84315" fill-opacity="0.52"/>',
        '  <circle cx="40" cy="81" r="1.6" fill="#D84315" fill-opacity="0.52"/>',
        '  <circle cx="53" cy="83" r="1.6" fill="#D84315" fill-opacity="0.52"/>',
        '  <circle cx="63" cy="45" r="1.6" fill="#D84315" fill-opacity="0.52"/>',
        '  <circle cx="72" cy="55" r="1.6" fill="#D84315" fill-opacity="0.52"/>',
        '  <circle cx="50" cy="60" r="34" fill="none" stroke="#BF360C" stroke-width="4"/>',
        '  <circle cx="83" cy="78" r="22" fill="#FB8C00"/>',
        '  <circle cx="83" cy="78" r="17.5" fill="#FFF8E1"/>',
        '  <circle cx="83" cy="78" r="14.5" fill="#FFA726"/>',
        '  <line x1="68" y1="78" x2="98" y2="78" stroke="#FFF8E1" stroke-width="2.6" stroke-linecap="round"/>',
        '  <line x1="75.5" y1="65" x2="90.5" y2="91" stroke="#FFF8E1" stroke-width="2.6" stroke-linecap="round"/>',
        '  <line x1="90.5" y1="65" x2="75.5" y2="91" stroke="#FFF8E1" stroke-width="2.6" stroke-linecap="round"/>',
        '  <circle cx="83" cy="78" r="3.2" fill="#FFF8E1"/>',
        '  <circle cx="83" cy="78" r="22" fill="none" stroke="#BF360C" stroke-width="3.8"/>',
        '</svg>'
      ].join('\n')
    },
    {
      id: 'pessego',
      label: 'Pêssego',
      category: 'frutas',
      keywords: ['PESSEGO', 'PESSEGOS'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="60" cy="105" rx="27" ry="5" fill="#BF360C" fill-opacity="0.14"/>',
        '  <path d="M58 37 C58 28 59 20 62 15 C64 14 66 15 65 18 C63 23 62 29 62 37 Z" fill="#795548" stroke="#4E342E" stroke-width="3" stroke-linejoin="round"/>',
        '  <path d="M58 29 C50 17 34 17 28 25 C34 35 48 36 58 29 Z" fill="#66BB6A"/>',
        '  <path d="M54 28 Q43 24 34 25" fill="none" stroke="#C8E6C9" stroke-width="2" stroke-linecap="round"/>',
        '  <path d="M58 29 C50 17 34 17 28 25 C34 35 48 36 58 29 Z" fill="none" stroke="#1B5E20" stroke-width="3.2" stroke-linejoin="round"/>',
        '  <path d="M62 29 C70 16 86 16 93 24 C87 34 73 36 62 29 Z" fill="#81C784"/>',
        '  <path d="M66 28 Q77 23 87 24" fill="none" stroke="#E8F5E9" stroke-width="2" stroke-linecap="round"/>',
        '  <path d="M62 29 C70 16 86 16 93 24 C87 34 73 36 62 29 Z" fill="none" stroke="#1B5E20" stroke-width="3.2" stroke-linejoin="round"/>',
        '  <path d="M60 39 C47 31 23 36 22 61 C21 83 44 100 60 100 C76 100 99 83 98 61 C97 36 73 31 60 39 Z" fill="#FFB74D"/>',
        '  <path d="M60 39 C73 31 97 36 98 61 C99 83 76 100 60 100 C54 88 53 62 60 39 Z" fill="#FF8A65" fill-opacity="0.62"/>',
        '  <path d="M85 43 C94 50 98 60 97 70 C94 86 76 99 60 99 C73 94 87 80 88 61 C88 53 87 47 85 43 Z" fill="#E64A19" fill-opacity="0.28"/>',
        '  <path d="M60 39 C54 55 54 78 60 99 C51 82 50 56 60 39 Z" fill="#FF7043" fill-opacity="0.26"/>',
        '  <path d="M60 39 C53 56 54 77 60 94" fill="none" stroke="#BF360C" stroke-width="3.2" stroke-linecap="round"/>',
        '  <path d="M32 56 C32 47 38 41 46 40" fill="none" stroke="#FFFFFF" stroke-width="4.6" stroke-linecap="round" stroke-opacity="0.68"/>',
        '  <path d="M60 39 C47 31 23 36 22 61 C21 83 44 100 60 100 C76 100 99 83 98 61 C97 36 73 31 60 39 Z" fill="none" stroke="#BF360C" stroke-width="4" stroke-linejoin="round"/>',
        '</svg>'
      ].join('\n')
    },
    {
      id: 'bolo',
      label: 'Bolo',
      category: 'frutas',
      keywords: ['BOLO', 'BOLINHO', 'TORTA'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="60" cy="105" rx="41" ry="5" fill="#5D4037" fill-opacity="0.14"/>',
        '  <ellipse cx="60" cy="96" rx="43" ry="10" fill="#B3E5FC" stroke="#0288D1" stroke-width="3.6"/>',
        '  <ellipse cx="60" cy="94" rx="36" ry="6.5" fill="#E1F5FE"/>',
        '  <path d="M27 52 L93 52 L91 88 C91 92 78 95 60 95 C42 95 29 92 29 88 Z" fill="#FFCC80"/>',
        '  <path d="M28 71 Q60 76 92 71 L91.5 78 Q60 83 28.5 78 Z" fill="#FF80AB"/>',
        '  <path d="M78 52 L93 52 L91 88 C91 91 85 93 77 94 Z" fill="#F57C00" fill-opacity="0.2"/>',
        '  <path d="M27 52 L93 52 L91 88 C91 92 78 95 60 95 C42 95 29 92 29 88 Z" fill="none" stroke="#6D4C41" stroke-width="3.8" stroke-linejoin="round"/>',
        '  <path d="M25 53 C25 43 37 39 60 39 C83 39 95 43 95 53 C95 59 90 66 85 66 C80 66 79 58 73 58 C67 58 66 68 60 68 C54 68 53 58 47 58 C41 58 40 66 35 66 C30 66 25 59 25 53 Z" fill="#FFFFFF"/>',
        '  <path d="M26 54 C28 59 31 65 35 65 C39 65 41 57 47 57 C53 57 54 67 60 67 C66 67 67 57 73 57 C79 57 80 65 85 65 C89 65 93 59 94 54 C84 58 72 60 60 60 C48 60 36 58 26 54 Z" fill="#F8BBD0" fill-opacity="0.88"/>',
        '  <path d="M25 53 C25 43 37 39 60 39 C83 39 95 43 95 53 C95 59 90 66 85 66 C80 66 79 58 73 58 C67 58 66 68 60 68 C54 68 53 58 47 58 C41 58 40 66 35 66 C30 66 25 59 25 53 Z" fill="none" stroke="#AD1457" stroke-width="3.6" stroke-linejoin="round"/>',
        '  <circle cx="38" cy="49" r="2.7" fill="#29B6F6"/>',
        '  <circle cx="49" cy="45" r="2.5" fill="#FFD54F"/>',
        '  <circle cx="71" cy="45" r="2.6" fill="#66BB6A"/>',
        '  <circle cx="82" cy="50" r="2.7" fill="#FF7043"/>',
        '  <circle cx="51" cy="53" r="2.4" fill="#FF4081"/>',
        '  <circle cx="70" cy="53" r="2.4" fill="#AB47BC"/>',
        '  <path d="M48 40 C50 35 55 34 60 34 C65 34 70 35 72 40 Z" fill="#FFFFFF" stroke="#AD1457" stroke-width="2.6" stroke-linejoin="round"/>',
        '  <path d="M60 22 C60 15 65 12 70 13" fill="none" stroke="#2E7D32" stroke-width="3" stroke-linecap="round"/>',
        '  <circle cx="60" cy="29" r="10" fill="#E53935"/>',
        '  <path d="M67 23 A10 10 0 0 1 53 36 A8.5 8.5 0 0 0 67 23 Z" fill="#B71C1C" fill-opacity="0.38"/>',
        '  <circle cx="56" cy="25.5" r="2.7" fill="#FFFFFF" fill-opacity="0.8"/>',
        '  <circle cx="60" cy="29" r="10" fill="none" stroke="#9A1B1B" stroke-width="3.4"/>',
        '</svg>'
      ].join('\n')
    },
    {
      id: 'queijo',
      label: 'Queijo',
      category: 'frutas',
      keywords: ['QUEIJO', 'QUEIJINHO', 'QUEIJOS'],
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
        '  <ellipse cx="60" cy="100" rx="38" ry="5.5" fill="#E65100" fill-opacity="0.14"/>',
        '  <path d="M17 56 L77 26 Q94 34 102 54 Z" fill="#FFEE58"/>',
        '  <ellipse cx="66" cy="42" rx="6.5" ry="3.5" fill="#D84315" fill-opacity="0.65"/>',
        '  <ellipse cx="66" cy="42.7" rx="5.8" ry="2.8" fill="#F57F17"/>',
        '  <ellipse cx="47" cy="48" rx="4.5" ry="2.4" fill="#D84315" fill-opacity="0.6"/>',
        '  <ellipse cx="47" cy="48.5" rx="4" ry="1.9" fill="#F57F17"/>',
        '  <ellipse cx="81" cy="39" rx="3.8" ry="2.1" fill="#D84315" fill-opacity="0.6"/>',
        '  <ellipse cx="81" cy="39.5" rx="3.3" ry="1.6" fill="#F57F17"/>',
        '  <path d="M17 56 L102 54 L102 86 Q60 90 17 86 Z" fill="#FFD54F"/>',
        '  <path d="M17 77 Q60 81 102 77 L102 86 Q60 90 17 86 Z" fill="#FFA000" fill-opacity="0.35"/>',
        '  <line x1="25" y1="58" x2="93" y2="56" stroke="#FFF9C4" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.78"/>',
        '  <circle cx="75" cy="70" r="8.2" fill="#D84315" fill-opacity="0.65"/>',
        '  <circle cx="75" cy="71.2" r="7.2" fill="#F57F17"/>',
        '  <circle cx="37" cy="70" r="5.6" fill="#D84315" fill-opacity="0.65"/>',
        '  <circle cx="37" cy="70.9" r="4.8" fill="#F57F17"/>',
        '  <circle cx="55" cy="78" r="4.2" fill="#D84315" fill-opacity="0.62"/>',
        '  <circle cx="55" cy="78.8" r="3.5" fill="#F57F17"/>',
        '  <circle cx="53" cy="64" r="3.4" fill="#D84315" fill-opacity="0.6"/>',
        '  <circle cx="53" cy="64.6" r="2.8" fill="#F57F17"/>',
        '  <ellipse cx="92" cy="64" rx="4.2" ry="5" fill="#D84315" fill-opacity="0.62"/>',
        '  <ellipse cx="92" cy="64.8" rx="3.6" ry="4.2" fill="#F57F17"/>',
        '  <line x1="17" y1="56" x2="102" y2="54" stroke="#8D5500" stroke-width="3.4" stroke-linecap="round"/>',
        '  <path d="M17 56 L77 26 Q94 34 102 54 L102 86 Q60 90 17 86 Z" fill="none" stroke="#8D5500" stroke-width="4" stroke-linejoin="round"/>',
        '</svg>'
      ].join('\n')
    }
  ];

  /* Registro publico da categoria no catalogo de stickers */
  global.SaudeEscola.StickersData.frutas = {
    id: 'frutas',
    label: 'Frutas e Alimentos',
    items: ITEMS
  };
})(typeof window !== 'undefined' ? window : globalThis);
