/* ==========================================================================
   Banco de Palavras Pedagogico, SVGs Base e Filas Persistentes (v2)
   Compativel 100% offline (file:// e GitHub Pages) sem ES Modules.
   ========================================================================== */

(function (global) {
  'use strict';

  var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

  /* ----------------------------------------------------------------------
     1. Constantes de persistencia das filas de dicas e frases
     ---------------------------------------------------------------------- */
  var CLUE_QUEUES_STORAGE_KEY = 'saudeBucalClueQueues';
  var CLUE_POOL_VERSION = 'v2_80clues';

  var SENTENCE_QUEUES_STORAGE_KEY = 'saudeBucalSentenceQueues';
  var SENTENCE_POOL_VERSION = 'v1_80sentences';

  /* ----------------------------------------------------------------------
     2. Banco de palavras padrao (10 palavras x 8 dicas x 8 frases = 80/80)
     ---------------------------------------------------------------------- */
  var DEFAULT_WORDS = [
    {
      id: 'BOCA',
      word: 'BOCA',
      plain: 'BOCA',
      syllables: ['BO', 'CA'],
      intruders: ['PA', 'TO', 'LA', 'MI'],
      emoji: '',
      clue: 'PARTE DO ROSTO ONDE MORAM OS DENTES E A LÍNGUA.',
      clues: [
        'PARTE DO ROSTO ONDE MORAM OS DENTES E A LÍNGUA.',
        'SERVE PARA FALAR, COMER E SORRIR!',
        'DEPOIS DE COMER, PRECISA FICAR BEM LIMPINHA!',
        'É POR ONDE A COMIDA ENTRA QUANDO VAMOS ALMOÇAR.',
        'O DENTISTA CUIDA MUITO BEM DA SAÚDE DELA!',
        'QUANDO BOCEJAMOS DE SONO, ELA SE ABRE BEM GRANDE!',
        'LUGAR ONDE GUARDAMOS O NOSSO SORRISO.',
        'ENXAGUAMOS COM ÁGUA DEPOIS DA ESCOVAÇÃO!'
      ],
      sentence: 'ANTES DE DORMIR, DEIXO A MINHA ___ BEM LIMPINHA!',
      sentences: [
        'ANTES DE DORMIR, DEIXO A MINHA ___ BEM LIMPINHA!',
        'ABRO A ___ PARA O DENTISTA VER MEUS DENTES.',
        'MASTIGO A COMIDA DEVAGAR COM A ___ FECHADA.',
        'FAÇO BOCHECHO COM ÁGUA PARA ENXAGUAR A ___!',
        'DENTRO DA MINHA ___ MORAM OS DENTES E A LÍNGUA.',
        'QUANDO VOU CANTAR, ABRO BEM A MINHA ___!',
        'CUIDAR DA ___ FAZ MUITO BEM PARA A NOSSA SAÚDE.',
        'DEPOIS DO LANCHE, ENXÁGUO E DEIXO A MINHA ___ LIMPINHA!'
      ],
      sentenceBefore: 'ABRO BEM A ',
      sentenceAfter: ' PARA ESCOVAR OS DENTES.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="60" cy="105" rx="34" ry="5.5" fill="#0288D1" fill-opacity="0.12"/>',
        '          <path d="M14 57 C24 37 44 32 54 40 Q60 45 66 40 C76 32 96 37 106 57 C98 91 78 99 60 99 C42 99 22 91 14 57 Z" fill="#EF5350"/>',
        '          <path d="M23 71 C34 90 49 95 60 95 C71 95 86 90 97 71 C85 84 72 89 60 89 C48 89 35 84 23 71 Z" fill="#C62828" fill-opacity="0.35"/>',
        '          <path d="M32 45 Q42 40 50 44" fill="none" stroke="#FFCDD2" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.8"/>',
        '          <path d="M14 57 C24 37 44 32 54 40 Q60 45 66 40 C76 32 96 37 106 57 C98 91 78 99 60 99 C42 99 22 91 14 57 Z" fill="none" stroke="#B71C1C" stroke-width="4.2" stroke-linejoin="round"/>',
        '          <path d="M24 58 Q60 44 96 58 Q88 86 60 86 Q32 86 24 58 Z" fill="#7B103B" stroke="#880E4F" stroke-width="2.6" stroke-linejoin="round"/>',
        '          <path d="M28 57 Q60 48 92 57 L89 67 Q60 63 31 67 Z" fill="#FFFFFF"/>',
        '          <path d="M31 63 Q60 60 89 63 L89 67 Q60 63 31 67 Z" fill="#E1F5FE"/>',
        '          <line x1="46" y1="54" x2="46" y2="65" stroke="#B3E5FC" stroke-width="2" stroke-linecap="round"/>',
        '          <line x1="60" y1="53" x2="60" y2="64" stroke="#B3E5FC" stroke-width="2" stroke-linecap="round"/>',
        '          <line x1="74" y1="54" x2="74" y2="65" stroke="#B3E5FC" stroke-width="2" stroke-linecap="round"/>',
        '          <path d="M28 57 Q60 48 92 57 L89 67 Q60 63 31 67 Z" fill="none" stroke="#0288D1" stroke-width="2.2" stroke-linejoin="round"/>',
        '          <path d="M38 78 Q60 65 82 78 Q71 86 60 86 Q49 86 38 78 Z" fill="#FF80AB" stroke="#C2185B" stroke-width="2.4" stroke-linejoin="round"/>',
        '          <path d="M60 72 L60 84" stroke="#EC407A" stroke-width="2.2" stroke-linecap="round"/>',
        '          <ellipse cx="50" cy="76" rx="5" ry="2.2" fill="#FCE4EC" fill-opacity="0.75"/>',
        '          <path d="M98 20 L100.4 26 L106.4 28.4 L100.4 30.8 L98 36.8 L95.6 30.8 L89.6 28.4 L95.6 26 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.5" stroke-linejoin="round"/>',
        '          <circle cx="22" cy="30" r="3" fill="#FFF176"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'DENTE',
      word: 'DENTE',
      plain: 'DENTE',
      syllables: ['DEN', 'TE'],
      intruders: ['PAN', 'CA', 'BO', 'LU'],
      emoji: '',
      clue: 'BRANQUINHO E DURO, SERVE PARA MASTIGAR A COMIDA!',
      clues: [
        'BRANQUINHO E DURO, SERVE PARA MASTIGAR A COMIDA!',
        'TEMOS VÁRIOS DELES ENFILEIRADOS DENTRO DA BOCA.',
        'QUANDO SOMOS CRIANÇAS, ELE É DE LEITE E DEPOIS TROCA!',
        'PRECISA SER ESCOVADO TODOS OS DIAS PARA BRILHAR!',
        'ELE CORTA E TRITURA OS ALIMENTOS QUE COMEMOS.',
        'QUANDO ELE CAI NA INFÂNCIA, A FADA VEM VISITAR!',
        'CADA UM PRECISA FICAR BEM LIMPINHO E FORTE NA BOCA!',
        'JUNTO COM OS OUTROS, FORMA O NOSSO SORRISO!'
      ],
      sentence: 'QUANDO O ___ DE LEITE CAI, NASCE OUTRO NO LUGAR!',
      sentences: [
        'QUANDO O ___ DE LEITE CAI, NASCE OUTRO NO LUGAR!',
        'CADA ___ DA NOSSA BOCA PRECISA SER BEM ESCOVADO.',
        'O ___ BRANQUINHO E FORTE AJUDA A MORDER A MAÇÃ!',
        'PASSO A ESCOVA COM CARINHO EM CIMA DE CADA ___.',
        'SE NÃO CUIDARMOS BEM, O ___ PODE FICAR DOENTE.',
        'MEU ___ BRILHA QUANDO TERMINO A ESCOVAÇÃO!',
        'CUIDAMOS DE CADA ___ COM MUITO CAPRICHO TODOS OS DIAS.',
        'CADA ___ AJUDA A MASTIGAR TODA A COMIDA.'
      ],
      sentenceBefore: 'MEU ',
      sentenceAfter: ' FICA BRANQUINHO E FORTE!',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="60" cy="110" rx="28" ry="5" fill="#0288D1" fill-opacity="0.14"/>',
        '          <path d="M34 22 C19 22 17 55 27 77 C33 90 35 106 45 106 C52 106 55 86 60 86 C65 86 68 106 75 106 C85 106 87 90 93 77 C103 55 101 22 86 22 C73 22 68 31 60 31 C52 31 47 22 34 22 Z" fill="#FFFFFF"/>',
        '          <path d="M85 24 C96 29 98 54 90 75 C84 88 82 103 75 103 C70 103 67 90 63 85 C70 84 77 77 82 65 C89 49 90 33 82 25 Z" fill="#E1F5FE"/>',
        '          <path d="M32 32 C25 38 25 51 29 61" fill="none" stroke="#E0F7FA" stroke-width="5.2" stroke-linecap="round"/>',
        '          <path d="M34 22 C19 22 17 55 27 77 C33 90 35 106 45 106 C52 106 55 86 60 86 C65 86 68 106 75 106 C85 106 87 90 93 77 C103 55 101 22 86 22 C73 22 68 31 60 31 C52 31 47 22 34 22 Z" fill="none" stroke="#0288D1" stroke-width="4.5" stroke-linejoin="round"/>',
        '          <path d="M40 42 Q46 38 51 42" fill="none" stroke="#0288D1" stroke-width="2.4" stroke-linecap="round"/>',
        '          <path d="M69 42 Q74 38 80 42" fill="none" stroke="#0288D1" stroke-width="2.4" stroke-linecap="round"/>',
        '          <circle cx="46" cy="52" r="5.6" fill="#01579B"/>',
        '          <circle cx="74" cy="52" r="5.6" fill="#01579B"/>',
        '          <circle cx="44" cy="50" r="2.1" fill="#FFFFFF"/>',
        '          <circle cx="72" cy="50" r="2.1" fill="#FFFFFF"/>',
        '          <circle cx="48" cy="54" r="1" fill="#FFFFFF"/>',
        '          <circle cx="76" cy="54" r="1" fill="#FFFFFF"/>',
        '          <ellipse cx="35" cy="61" rx="5.5" ry="3.2" fill="#FF80AB" fill-opacity="0.85"/>',
        '          <ellipse cx="85" cy="61" rx="5.5" ry="3.2" fill="#FF80AB" fill-opacity="0.85"/>',
        '          <path d="M48 63 Q60 77 72 63 Z" fill="#C2185B"/>',
        '          <path d="M53 69 Q60 65 67 69 Q60 74 53 69 Z" fill="#FF80AB"/>',
        '          <path d="M48 63 Q60 77 72 63 Q60 66 48 63 Z" fill="none" stroke="#01579B" stroke-width="3.2" stroke-linejoin="round"/>',
        '          <path d="M100 12 L102.6 18.4 L109 21 L102.6 23.6 L100 30 L97.4 23.6 L91 21 L97.4 18.4 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.6" stroke-linejoin="round"/>',
        '          <path d="M18 22 L19.6 26 L23.6 27.6 L19.6 29.2 L18 33.2 L16.4 29.2 L12.4 27.6 L16.4 26 Z" fill="#FFF176"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'PASTA',
      word: 'PASTA',
      plain: 'PASTA',
      syllables: ['PAS', 'TA'],
      intruders: ['POS', 'TE', 'FA', 'RI'],
      emoji: '',
      clue: 'CREME CHEIROSO QUE COLOCAMOS EM CIMA DA ESCOVA.',
      clues: [
        'CREME CHEIROSO QUE COLOCAMOS EM CIMA DA ESCOVA.',
        'FAZ ESPUMINHA NA BOCA E AJUDA A LIMPAR OS DENTES.',
        'USAMOS SÓ UM POUQUINHO DELA, DO TAMANHO DE UMA ERVILHA!',
        'TEM FLÚOR PARA DEIXAR OS DENTES BEM PROTEGIDOS.',
        'VEM DENTRO DE UM TUBINHO QUE APERTAMOS PARA SAIR.',
        'DEIXA UM CHEIRINHO BEM FRESCO E GOSTOSO NA BOCA!',
        'NÃO É PARA ENGOLIR, É SÓ PARA ESCOVAR E CUSPIR!',
        'JUNTO COM A ESCOVA, ELA ESPANTA O BICHINHO DA CÁRIE.'
      ],
      sentence: 'COLOCO UM POUQUINHO DE ___ NA MINHA ESCOVA.',
      sentences: [
        'COLOCO UM POUQUINHO DE ___ NA MINHA ESCOVA.',
        'A ___ DE DENTE TEM UM CHEIRINHO MUITO BOM!',
        'O FLÚOR QUE ESTÁ NA ___ PROTEGE O NOSSO SORRISO.',
        'APERTO O TUBINHO DEVAGAR PARA A ___ SAIR.',
        'A ESPUMINHA DA ___ AJUDA A LIMPAR OS DENTES!',
        'DEPOIS DE USAR A ___, ENXÁGUO A BOCA COM ÁGUA.',
        'A QUANTIDADE CERTA DE ___ É DO TAMANHO DE UMA ERVILHA!',
        'GUARDAMOS O TUBO DA ___ FECHADO NO BANHEIRO.'
      ],
      sentenceBefore: 'COLOCO A ',
      sentenceAfter: ' DE DENTE NA ESCOVA.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="58" cy="105" rx="38" ry="5.5" fill="#0288D1" fill-opacity="0.12"/>',
        '          <g transform="rotate(-14 58 64)">',
        '            <rect x="9" y="42" width="13" height="44" rx="3.5" fill="#0288D1" stroke="#01579B" stroke-width="3.8" stroke-linejoin="round"/>',
        '            <line x1="13" y1="52" x2="18" y2="52" stroke="#81D4FA" stroke-width="2.2" stroke-linecap="round"/>',
        '            <line x1="13" y1="64" x2="18" y2="64" stroke="#81D4FA" stroke-width="2.2" stroke-linecap="round"/>',
        '            <line x1="13" y1="76" x2="18" y2="76" stroke="#81D4FA" stroke-width="2.2" stroke-linecap="round"/>',
        '            <path d="M22 44 L76 48 C81 48.5 84 52 84 57 L84 71 C84 76 81 79.5 76 80 L22 84 Z" fill="#29B6F6"/>',
        '            <path d="M22 72 L83 69 C83 75 80 79 75 79.5 L22 84 Z" fill="#0288D1" fill-opacity="0.45"/>',
        '            <path d="M27 50 L74 52.5" fill="none" stroke="#B3E5FC" stroke-width="4" stroke-linecap="round"/>',
        '            <rect x="31" y="54" width="40" height="20" rx="7" fill="#FFFFFF" stroke="#0288D1" stroke-width="2.4"/>',
        '            <path d="M40 58 C37 58 37 64 39 68 C40 70 41 72 42.5 72 C43.8 72 44 68.5 45 68.5 C46 68.5 46.2 72 47.5 72 C49 72 50 70 51 68 C53 64 53 58 50 58 C47.5 58 46.5 60 45 60 C43.5 60 42.5 58 40 58 Z" fill="#E1F5FE" stroke="#0288D1" stroke-width="1.8" stroke-linejoin="round"/>',
        '            <line x1="57" y1="61" x2="66" y2="61" stroke="#26C6DA" stroke-width="3" stroke-linecap="round"/>',
        '            <line x1="57" y1="67" x2="64" y2="67" stroke="#80DEEA" stroke-width="2.6" stroke-linecap="round"/>',
        '            <path d="M22 44 L76 48 C81 48.5 84 52 84 57 L84 71 C84 76 81 79.5 76 80 L22 84 Z" fill="none" stroke="#01579B" stroke-width="4" stroke-linejoin="round"/>',
        '            <rect x="83" y="56" width="11" height="16" rx="3" fill="#ECEFF1" stroke="#455A64" stroke-width="3.2"/>',
        '            <line x1="88" y1="57" x2="88" y2="71" stroke="#B0BEC5" stroke-width="2"/>',
        '            <path d="M94 61 C104 49 115 54 113 65 C112 73 102 76 94 68 Z" fill="#80DEEA" stroke="#00838F" stroke-width="3.2" stroke-linejoin="round"/>',
        '            <path d="M98 62 Q105 56 109 62" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>',
        '          </g>',
        '          <circle cx="98" cy="30" r="4.5" fill="#E0F7FA" stroke="#00ACC1" stroke-width="2"/>',
        '          <circle cx="108" cy="39" r="2.8" fill="#E0F7FA" stroke="#00ACC1" stroke-width="1.8"/>',
        '          <path d="M84 18 L86 23 L91 25 L86 27 L84 32 L82 27 L77 25 L82 23 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.4" stroke-linejoin="round"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'ESCOVA',
      word: 'ESCOVA',
      plain: 'ESCOVA',
      syllables: ['ES', 'CO', 'VA'],
      intruders: ['AS', 'PA', 'TO', 'LE'],
      emoji: '',
      clue: 'TEM CERDAS MACIAS PARA LIMPAR TODOS OS DENTES.',
      clues: [
        'TEM CERDAS MACIAS PARA LIMPAR TODOS OS DENTES.',
        'COLOCAMOS A PASTA EM CIMA DELA PARA LIMPAR OS DENTES.',
        'FAZ MOVIMENTOS DE VAIVÉM PARA LIMPAR O SORRISO!',
        'CADA PESSOA TEM A SUA E NÃO PODE EMPRESTAR!',
        'É USADA DEPOIS DO CAFÉ, DO ALMOÇO E DO JANTAR!',
        'QUANDO AS CERDAS FICAM VELHINHAS, PRECISAMOS DE UMA NOVA.',
        'ELA TAMBÉM AJUDA A LIMPAR A NOSSA LÍNGUA DE LEVE!',
        'FICA GUARDADA BEM LIMPINHA NO BANHEIRO DEPOIS DO USO.'
      ],
      sentence: 'A MINHA ___ TEM CERDAS BEM MACIAS!',
      sentences: [
        'A MINHA ___ TEM CERDAS BEM MACIAS!',
        'PASSO A ___ EM TODOS OS DENTES DEPOIS DE COMER.',
        'LAVO A MINHA ___ COM ÁGUA DEPOIS DE TERMINAR.',
        'CADA CRIANÇA TEM A SUA PRÓPRIA ___ DE DENTE!',
        'MOVIMENTO A ___ PARA LÁ E PARA CÁ COM CUIDADO.',
        'QUANDO A ___ FICA VELHINHA, TROCAMOS POR UMA NOVA.',
        'LEVO A MINHA ___ NA MOCHILA PARA LIMPAR OS DENTES NA ESCOLA!',
        'COLOCO O CREME DENTAL EM CIMA DA ___!'
      ],
      sentenceBefore: 'EU USO A ',
      sentenceAfter: ' PARA LIMPAR OS DENTES.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="62" cy="105" rx="39" ry="5.5" fill="#BF360C" fill-opacity="0.12"/>',
        '          <g transform="rotate(-16 60 64)">',
        '            <rect x="15" y="42" width="35" height="22" rx="6" fill="#E0F7FA"/>',
        '            <rect x="17" y="56" width="31" height="7" rx="2" fill="#80DEEA"/>',
        '            <line x1="23" y1="44" x2="23" y2="62" stroke="#00ACC1" stroke-width="2.6" stroke-linecap="round"/>',
        '            <line x1="32" y1="44" x2="32" y2="62" stroke="#00ACC1" stroke-width="2.6" stroke-linecap="round"/>',
        '            <line x1="41" y1="44" x2="41" y2="62" stroke="#00ACC1" stroke-width="2.6" stroke-linecap="round"/>',
        '            <rect x="15" y="42" width="35" height="22" rx="6" fill="none" stroke="#00838F" stroke-width="3.6" stroke-linejoin="round"/>',
        '            <path d="M15 44 C19 29 33 26 42 35 C47 32 53 36 51 44 Z" fill="#4DD0E1" stroke="#00838F" stroke-width="3.4" stroke-linejoin="round"/>',
        '            <path d="M22 39 Q30 33 38 37" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>',
        '            <path d="M11 66 C11 61 15 59 22 59 L55 59 C62 59 68 62 76 62 L103 61 C109 61 113 65 113 70 C113 75 109 79 103 79 L72 78 C64 78 58 75 50 75 L22 75 C15 75 11 71 11 66 Z" fill="#FF7043"/>',
        '            <path d="M14 71 L50 71 C58 71 64 74 72 74 L103 74 C107 74 110 72 112 69 C112 75 108 79 103 79 L72 78 C64 78 58 75 50 75 L22 75 C17 75 15 73 14 71 Z" fill="#D84315" fill-opacity="0.38"/>',
        '            <rect x="74" y="65" width="25" height="8" rx="4" fill="#FFF3E0" stroke="#E64A19" stroke-width="2"/>',
        '            <circle cx="80" cy="69" r="1.4" fill="#FF7043"/>',
        '            <circle cx="86.5" cy="69" r="1.4" fill="#FF7043"/>',
        '            <circle cx="93" cy="69" r="1.4" fill="#FF7043"/>',
        '            <path d="M20 63 L52 63" fill="none" stroke="#FFAB91" stroke-width="2.8" stroke-linecap="round"/>',
        '            <path d="M11 66 C11 61 15 59 22 59 L55 59 C62 59 68 62 76 62 L103 61 C109 61 113 65 113 70 C113 75 109 79 103 79 L72 78 C64 78 58 75 50 75 L22 75 C15 75 11 71 11 66 Z" fill="none" stroke="#BF360C" stroke-width="4" stroke-linejoin="round"/>',
        '          </g>',
        '          <path d="M28 16 L30.2 21.6 L35.8 23.8 L30.2 26 L28 31.6 L25.8 26 L20.2 23.8 L25.8 21.6 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.5" stroke-linejoin="round"/>',
        '          <circle cx="52" cy="24" r="4" fill="#E0F7FA" stroke="#00ACC1" stroke-width="2"/>',
        '          <circle cx="14" cy="40" r="3" fill="#E0F7FA" stroke="#00ACC1" stroke-width="1.8"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'SORRISO',
      word: 'SORRISO',
      plain: 'SORRISO',
      syllables: ['SOR', 'RI', 'SO'],
      intruders: ['SAR', 'RA', 'MO', 'TU'],
      emoji: '',
      clue: 'APARECE NO ROSTO QUANDO ESTAMOS MUITO FELIZES!',
      clues: [
        'APARECE NO ROSTO QUANDO ESTAMOS MUITO FELIZES!',
        'FICA LINDO E BRILHANTE QUANDO CUIDAMOS DOS DENTES.',
        'APARECE BEM BONITO NA HORA DE TIRAR UMA FOTO!',
        'QUANDO CONTAMOS UMA PIADA ENGRAÇADA, ELE APARECE NA HORA!',
        'FICA MUITO SAUDÁVEL QUANDO OS DENTES ESTÃO BEM ESCOVADOS!',
        'É UM JEITO CARINHOSO DE CUMPRIMENTAR OS NOSSOS AMIGOS.',
        'QUANDO ESTAMOS ALEGRES, NOSSA BOCA ABRE UM BEM GRANDE!',
        'O DENTISTA FICA ORGULHOSO QUANDO ELE ESTÁ BEM CUIDADO!'
      ],
      sentence: 'MEU ___ FICA LINDO COM OS DENTES LIMPINHOS!',
      sentences: [
        'MEU ___ FICA LINDO COM OS DENTES LIMPINHOS!',
        'DOU UM ___ BEM GRANDE QUANDO ENCONTRO MEUS AMIGOS!',
        'CUIDAR DOS DENTES DEIXA O NOSSO ___ BRILHANTE.',
        'NA HORA DA FOTO, MOSTRO O MEU MELHOR ___!',
        'UM ___ SAUDÁVEL MOSTRA QUE CUIDO DA MINHA BOCA.',
        'A PROFESSORA ADORA VER O ___ DE TODA A TURMA!',
        'QUANDO ESTOU MUITO ALEGRE, ABRO UM BELO ___!',
        'ESCOVAR OS DENTES TODOS OS DIAS PROTEGE O MEU ___.'
      ],
      sentenceBefore: 'DENTES LIMPOS DEIXAM MEU ',
      sentenceAfter: ' LINDO!',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="60" cy="110" rx="31" ry="5" fill="#F57F17" fill-opacity="0.16"/>',
        '          <circle cx="60" cy="60" r="44" fill="#FFD54F"/>',
        '          <path d="M94 34 A44 44 0 0 1 28 89 A40 40 0 0 0 94 34 Z" fill="#FFB300" fill-opacity="0.55"/>',
        '          <ellipse cx="44" cy="31" rx="13" ry="6.5" transform="rotate(-22 44 31)" fill="#FFF8E1" fill-opacity="0.7"/>',
        '          <circle cx="60" cy="60" r="44" fill="none" stroke="#EF6C00" stroke-width="4.5"/>',
        '          <path d="M34 36 Q42 31 49 36" fill="none" stroke="#E65100" stroke-width="3" stroke-linecap="round"/>',
        '          <path d="M71 36 Q78 31 86 36" fill="none" stroke="#E65100" stroke-width="3" stroke-linecap="round"/>',
        '          <circle cx="42" cy="48" r="6" fill="#3E2723"/>',
        '          <circle cx="78" cy="48" r="6" fill="#3E2723"/>',
        '          <circle cx="40" cy="46" r="2.2" fill="#FFFFFF"/>',
        '          <circle cx="76" cy="46" r="2.2" fill="#FFFFFF"/>',
        '          <circle cx="44" cy="50" r="1" fill="#FFFFFF"/>',
        '          <circle cx="80" cy="50" r="1" fill="#FFFFFF"/>',
        '          <ellipse cx="29" cy="59" rx="7" ry="4.2" fill="#FF8A80" fill-opacity="0.78"/>',
        '          <ellipse cx="91" cy="59" rx="7" ry="4.2" fill="#FF8A80" fill-opacity="0.78"/>',
        '          <path d="M31 64 Q60 97 89 64 Q60 71 31 64 Z" fill="#C62828"/>',
        '          <path d="M34 65 Q60 72 86 65 L83 75 Q60 80 37 75 Z" fill="#FFFFFF"/>',
        '          <line x1="49" y1="68" x2="49" y2="76" stroke="#CFD8DC" stroke-width="1.8" stroke-linecap="round"/>',
        '          <line x1="60" y1="69" x2="60" y2="77" stroke="#CFD8DC" stroke-width="1.8" stroke-linecap="round"/>',
        '          <line x1="71" y1="68" x2="71" y2="76" stroke="#CFD8DC" stroke-width="1.8" stroke-linecap="round"/>',
        '          <path d="M46 82 Q60 75 74 82 Q60 90 46 82 Z" fill="#FF80AB"/>',
        '          <path d="M31 64 Q60 97 89 64 Q60 71 31 64 Z" fill="none" stroke="#B71C1C" stroke-width="3.8" stroke-linejoin="round"/>',
        '          <path d="M104 14 L106.2 19.6 L111.8 21.8 L106.2 24 L104 29.6 L101.8 24 L96.2 21.8 L101.8 19.6 Z" fill="#FFF176" stroke="#F57F17" stroke-width="1.4" stroke-linejoin="round"/>',
        '          <circle cx="16" cy="24" r="3.2" fill="#FFF59D"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'FIO',
      word: 'FIO',
      plain: 'FIO',
      syllables: ['FI', 'O'],
      intruders: ['FA', 'U', 'BO', 'TE'],
      emoji: '',
      clue: 'LIMPA ENTRE OS DENTES ONDE A ESCOVA NÃO ALCANÇA!',
      clues: [
        'LIMPA ENTRE OS DENTES ONDE A ESCOVA NÃO ALCANÇA!',
        'AJUDA A TIRAR OS RESTINHOS DE COMIDA ENTRE OS DENTES.',
        'É O MELHOR AMIGO DA ESCOVA PARA UMA LIMPEZA COMPLETA!',
        'USAMOS TODOS OS DIAS PARA PROTEGER A GENGIVA E OS DENTES.',
        'O DENTISTA ENSINA A PASSAR ENTRE OS DENTES COM CUIDADO!',
        'EVITA QUE O BICHINHO DA CÁRIE FIQUE ESCONDIDO ENTRE OS DENTES.',
        'COMPLETA A HIGIENE BUCAL JUNTO COM A ESCOVA E A PASTA.',
        'DEIXA O ESPAÇO ENTRE OS DENTES BEM LIMPINHO!'
      ],
      sentence: 'O ___ DENTAL LIMPA ONDE A ESCOVA NÃO ALCANÇA!',
      sentences: [
        'O ___ DENTAL LIMPA ONDE A ESCOVA NÃO ALCANÇA!',
        'USAMOS O ___ DENTAL PARA LIMPAR ENTRE OS DENTES.',
        'O ___ DENTAL AJUDA A TIRAR RESTINHOS DE COMIDA.',
        'USAR O ___ DENTAL DEIXA A ESCOVAÇÃO COMPLETA.',
        'O DENTISTA ENSINA A USAR O ___ DENTAL TODOS OS DIAS.',
        'O ___ DENTAL AJUDA A EVITAR O BICHINHO DA CÁRIE.',
        'GUARDAMOS O ___ DENTAL JUNTO COM A ESCOVA E A PASTA.',
        'ANTES OU DEPOIS DA ESCOVA, USAMOS O ___ DENTAL!'
      ],
      sentenceBefore: 'PASSO O ',
      sentenceAfter: ' DENTAL ENTRE OS DENTES.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="52" cy="105" rx="31" ry="5.5" fill="#1B5E20" fill-opacity="0.14"/>',
        '          <path d="M28 32 C28 20 38 15 52 15 C66 15 76 20 76 32 Z" fill="#A5D6A7" stroke="#2E7D32" stroke-width="3.8" stroke-linejoin="round"/>',
        '          <path d="M37 23 Q52 18 66 23" fill="none" stroke="#E8F5E9" stroke-width="3" stroke-linecap="round"/>',
        '          <rect x="65" y="24" width="9" height="9" rx="2" fill="#CFD8DC" stroke="#455A64" stroke-width="2.4"/>',
        '          <path d="M72 28 C94 15 112 36 96 58 C84 74 96 92 110 86" fill="none" stroke="#00838F" stroke-width="7.5" stroke-linecap="round"/>',
        '          <path d="M72 28 C94 15 112 36 96 58 C84 74 96 92 110 86" fill="none" stroke="#80DEEA" stroke-width="3.8" stroke-linecap="round"/>',
        '          <rect x="22" y="30" width="60" height="68" rx="16" fill="#66BB6A"/>',
        '          <path d="M70 32 C77 33 82 39 82 46 L82 82 C82 91 75 98 66 98 L34 98 C30 98 27 96 25 94 L66 90 C72 89 74 85 74 78 L74 36 Z" fill="#43A047" fill-opacity="0.45"/>',
        '          <path d="M29 42 L29 76" fill="none" stroke="#C8E6C9" stroke-width="4" stroke-linecap="round"/>',
        '          <rect x="22" y="30" width="60" height="68" rx="16" fill="none" stroke="#1B5E20" stroke-width="4.2"/>',
        '          <circle cx="52" cy="64" r="19" fill="#FFFFFF" stroke="#2E7D32" stroke-width="3.6"/>',
        '          <circle cx="52" cy="64" r="14" fill="none" stroke="#E0F7FA" stroke-width="4"/>',
        '          <circle cx="52" cy="64" r="9.5" fill="#E8F5E9" stroke="#2E7D32" stroke-width="2.5"/>',
        '          <circle cx="48.5" cy="62.5" r="1.7" fill="#1B5E20"/>',
        '          <circle cx="55.5" cy="62.5" r="1.7" fill="#1B5E20"/>',
        '          <path d="M48.5 66.5 Q52 69.8 55.5 66.5" fill="none" stroke="#1B5E20" stroke-width="2" stroke-linecap="round"/>',
        '          <path d="M104 66 L105.8 70.5 L110.3 72.3 L105.8 74.1 L104 78.6 L102.2 74.1 L97.7 72.3 L102.2 70.5 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.3" stroke-linejoin="round"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'AGUA',
      word: 'ÁGUA',
      plain: 'AGUA',
      syllables: ['Á', 'GUA'],
      intruders: ['O', 'GUE', 'PA', 'LI'],
      emoji: '',
      clue: 'SERVE PARA ENXAGUAR A BOCA DEPOIS DE ESCOVAR.',
      clues: [
        'SERVE PARA ENXAGUAR A BOCA DEPOIS DE ESCOVAR.',
        'NÃO TEM COR, NÃO TEM CHEIRO E FAZ PASSAR A NOSSA SEDE!',
        'SAI DA TORNEIRA DA PIA PARA LAVAR A NOSSA ESCOVA.',
        'FAZEMOS BOCHECHO COM ELA PARA TIRAR A ESPUMA DA PASTA.',
        'FAZ MUITO BEM PARA A SAÚDE QUANDO BEBEMOS TODOS OS DIAS!',
        'FECHAMOS A TORNEIRA AO ESCOVAR PARA ECONOMIZAR!',
        'DEIXA A BOCA FRESQUINHA E LIMPA DEPOIS DA REFEIÇÃO.',
        'É UM LÍQUIDO TRANSPARENTE E MUITO IMPORTANTE PARA A VIDA!'
      ],
      sentence: 'BEBER ___ TODOS OS DIAS FAZ BEM PARA O CORPO E PARA A BOCA!',
      sentences: [
        'BEBER ___ TODOS OS DIAS FAZ BEM PARA O CORPO E PARA A BOCA!',
        'ABRO A TORNEIRA PARA PEGAR UM POUQUINHO DE ___.',
        'ENXÁGUO A MINHA BOCA COM ___ FRESQUINHA!',
        'LAVO AS CERDAS DA ESCOVA COM ___ LIMPA.',
        'A ___ TIRA TODA A ESPUMINHA DA PASTA DE DENTE!',
        'ECONOMIZO ___ FECHANDO A TORNEIRA ENQUANTO ESCOVO.',
        'DEPOIS DE BRINCAR, TOMO UM COPO DE ___ PARA PASSAR A SEDE!',
        'A ___ É TRANSPARENTE E DEIXA TUDO BEM LIMPINHO.'
      ],
      sentenceBefore: 'ENXÁGUO A BOCA COM ',
      sentenceAfter: ' LIMPINHA.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="60" cy="108" rx="34" ry="5.5" fill="#B3E5FC" stroke="#29B6F6" stroke-width="2.2"/>',
        '          <path d="M60 12 C60 12 24 54 24 78 C24 98 40 107 60 107 C80 107 96 98 96 78 C96 54 60 12 60 12 Z" fill="#29B6F6"/>',
        '          <path d="M77 44 C88 60 92 72 91 80 C89 96 75 104 58 104 C70 100 80 90 81 76 C82 65 80 54 77 44 Z" fill="#0288D1" fill-opacity="0.52"/>',
        '          <path d="M37 74 C35 60 43 44 53 32" fill="none" stroke="#E1F5FE" stroke-width="6" stroke-linecap="round"/>',
        '          <circle cx="38" cy="83" r="2.8" fill="#E1F5FE"/>',
        '          <path d="M60 12 C60 12 24 54 24 78 C24 98 40 107 60 107 C80 107 96 98 96 78 C96 54 60 12 60 12 Z" fill="none" stroke="#01579B" stroke-width="4.5" stroke-linejoin="round"/>',
        '          <circle cx="49" cy="74" r="5" fill="#01579B"/>',
        '          <circle cx="71" cy="74" r="5" fill="#01579B"/>',
        '          <circle cx="47.3" cy="72.3" r="1.9" fill="#FFFFFF"/>',
        '          <circle cx="69.3" cy="72.3" r="1.9" fill="#FFFFFF"/>',
        '          <ellipse cx="39" cy="81" rx="4.8" ry="2.8" fill="#FF80AB" fill-opacity="0.85"/>',
        '          <ellipse cx="81" cy="81" rx="4.8" ry="2.8" fill="#FF80AB" fill-opacity="0.85"/>',
        '          <path d="M51 84 Q60 93 69 84" fill="none" stroke="#01579B" stroke-width="3.8" stroke-linecap="round"/>',
        '          <path d="M97 30 C97 30 90 40 90 45 C90 49 93 52 97 52 C101 52 104 49 104 45 C104 40 97 30 97 30 Z" fill="#81D4FA" stroke="#0288D1" stroke-width="2.6" stroke-linejoin="round"/>',
        '          <path d="M21 36 C21 36 16 43 16 47 C16 50 18.2 52 21 52 C23.8 52 26 50 26 47 C26 43 21 36 21 36 Z" fill="#B3E5FC" stroke="#0288D1" stroke-width="2.4" stroke-linejoin="round"/>',
        '          <path d="M84 14 L86 19 L91 21 L86 23 L84 28 L82 23 L77 21 L82 19 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.4" stroke-linejoin="round"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'CARIE',
      word: 'CÁRIE',
      plain: 'CARIE',
      syllables: ['CÁ', 'RI', 'E'],
      intruders: ['CO', 'RA', 'I', 'TU'],
      emoji: '',
      clue: 'BICHINHO QUE APARECE NOS DENTES SE NÃO ESCOVARMOS APÓS COMER.',
      clues: [
        'BICHINHO QUE APARECE NOS DENTES SE NÃO ESCOVARMOS APÓS COMER.',
        'GOSTA DE RESTINHOS DE DOCE QUE FICAM ESQUECIDOS NO DENTE.',
        'PODE FAZER UM BURAQUINHO NO DENTE SE NÃO CUIDARMOS BEM.',
        'VAI EMBORA CORRENDO QUANDO USAMOS A ESCOVA, A PASTA E O FIO!',
        'FAZ O DENTE DOER QUANDO ESQUECEMOS DA HIGIENE BUCAL.',
        'O DENTISTA AJUDA A TRATAR O DENTE QUANDO ELA APARECE.',
        'NÃO APARECE NA BOCA DE QUEM ESCOVA OS DENTES DIREITINHO!',
        'ADORARIA MORAR NO DENTE SUJO, MAS A ESCOVA NÃO DEIXA!'
      ],
      sentence: 'ESCOVAR OS DENTES APÓS AS REFEIÇÕES EVITA A ___!',
      sentences: [
        'ESCOVAR OS DENTES APÓS AS REFEIÇÕES EVITA A ___!',
        'A ___ APARECE QUANDO ESQUECEMOS DE LIMPAR OS DENTES.',
        'O BICHINHO DA ___ NÃO GOSTA DE DENTE LIMPINHO!',
        'COMER MUITO DOCE SEM ESCOVAR PODE CAUSAR ___.',
        'O DENTISTA AJUDA A PROTEGER NOSSA BOCA CONTRA A ___!',
        'QUANDO USAMOS FIO E ESCOVA, A ___ PASSA LONGE!',
        'A ___ PODE FAZER UM BURAQUINHO E DEIXAR O DENTE DOENDO.',
        'QUEM CUIDA DO SORRISO TODOS OS DIAS FICA LIVRE DA ___!'
      ],
      sentenceBefore: 'ESCOVAR OS DENTES ESPANTA A ',
      sentenceAfter: ' PARA LONGE!',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="60" cy="108" rx="30" ry="5" fill="#4A148C" fill-opacity="0.16"/>',
        '          <path d="M60 16 L60 30 M26 30 L38 42 M94 30 L82 42 M18 64 L30 62 M102 64 L90 62" stroke="#7B1FA2" stroke-width="5.5" stroke-linecap="round"/>',
        '          <circle cx="60" cy="14" r="5" fill="#CE93D8" stroke="#4A148C" stroke-width="3"/>',
        '          <circle cx="24" cy="28" r="5" fill="#CE93D8" stroke="#4A148C" stroke-width="3"/>',
        '          <circle cx="96" cy="28" r="5" fill="#CE93D8" stroke="#4A148C" stroke-width="3"/>',
        '          <circle cx="16" cy="64" r="4.5" fill="#CE93D8" stroke="#4A148C" stroke-width="3"/>',
        '          <circle cx="104" cy="64" r="4.5" fill="#CE93D8" stroke="#4A148C" stroke-width="3"/>',
        '          <ellipse cx="45" cy="98" rx="9" ry="6" fill="#8E24AA" stroke="#4A148C" stroke-width="3.6"/>',
        '          <ellipse cx="75" cy="98" rx="9" ry="6" fill="#8E24AA" stroke="#4A148C" stroke-width="3.6"/>',
        '          <path d="M60 28 C79 28 93 41 93 60 C93 78 82 95 60 95 C38 95 27 78 27 60 C27 41 41 28 60 28 Z" fill="#AB47BC"/>',
        '          <path d="M88 46 C94 64 85 91 60 93 C48 94 39 90 34 85 C50 88 73 84 82 68 C86 60 88 53 88 46 Z" fill="#7B1FA2" fill-opacity="0.52"/>',
        '          <circle cx="38" cy="76" r="4.5" fill="#CE93D8" fill-opacity="0.55"/>',
        '          <circle cx="82" cy="74" r="3.5" fill="#CE93D8" fill-opacity="0.55"/>',
        '          <circle cx="60" cy="36" r="3" fill="#CE93D8" fill-opacity="0.55"/>',
        '          <path d="M60 28 C79 28 93 41 93 60 C93 78 82 95 60 95 C38 95 27 78 27 60 C27 41 41 28 60 28 Z" fill="none" stroke="#4A148C" stroke-width="4.5" stroke-linejoin="round"/>',
        '          <circle cx="48" cy="56" r="9.5" fill="#FFFFFF" stroke="#4A148C" stroke-width="3"/>',
        '          <circle cx="72" cy="56" r="8" fill="#FFFFFF" stroke="#4A148C" stroke-width="3"/>',
        '          <circle cx="50" cy="56" r="4" fill="#1A052B"/>',
        '          <circle cx="70" cy="56" r="3.6" fill="#1A052B"/>',
        '          <circle cx="48.5" cy="54.2" r="1.5" fill="#FFFFFF"/>',
        '          <circle cx="68.7" cy="54.2" r="1.4" fill="#FFFFFF"/>',
        '          <path d="M38 44 L55 48" stroke="#4A148C" stroke-width="3.6" stroke-linecap="round"/>',
        '          <path d="M82 44 L65 48" stroke="#4A148C" stroke-width="3.6" stroke-linecap="round"/>',
        '          <path d="M43 76 Q51 70 60 75 Q69 80 77 73" fill="none" stroke="#311B92" stroke-width="3.8" stroke-linecap="round"/>',
        '          <polygon points="56,74 63,76 58,83" fill="#FFFFFF" stroke="#4A148C" stroke-width="2" stroke-linejoin="round"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'LINGUA',
      word: 'LÍNGUA',
      plain: 'LINGUA',
      syllables: ['LÍN', 'GUA'],
      intruders: ['LAN', 'GUE', 'BO', 'SI'],
      emoji: '',
      clue: 'SENTE O GOSTO DOS ALIMENTOS DOCES E SALGADOS!',
      clues: [
        'SENTE O GOSTO DOS ALIMENTOS DOCES E SALGADOS!',
        'MORA DENTRO DA BOCA E NOS AJUDA A FALAR E ENGOLIR.',
        'É ROSINHA, ELA SE MEXE BASTANTE E TAMBÉM PRECISA SER ESCOVADA!',
        'SENTE SE A COMIDA ESTÁ QUENTE OU SE O SORVETE ESTÁ GELADO.',
        'NO FINAL DA ESCOVAÇÃO, PASSAMOS A ESCOVA NELA DE LEVE.',
        'AJUDA A MISTURAR A COMIDA ENQUANTO ESTAMOS MASTIGANDO.',
        'QUANDO TOMAMOS SORVETE COLORIDO, ELA FICA PINTADA!',
        'FICA BEM LIMPINHA QUANDO É ESCOVADA COM CARINHO!'
      ],
      sentence: 'SENTIMOS O SABOR DOS ALIMENTOS COM A ___!',
      sentences: [
        'SENTIMOS O SABOR DOS ALIMENTOS COM A ___!',
        'NO FINAL DA ESCOVAÇÃO, TAMBÉM LIMPAMOS A NOSSA ___.',
        'A ___ NOS AJUDA A FALAR TODAS AS PALAVRAS!',
        'PASSO A ESCOVA DE LEVE EM CIMA DA ___ PARA LIMPAR.',
        'A ___ SENTE SE O ALIMENTO É DOCE OU SALGADO!',
        'DENTRO DA BOCA, A ___ AJUDA A MISTURAR A COMIDA.',
        'NOSSA ___ É ROSINHA E MORA JUNTO COM OS DENTES!',
        'ESCOVAR A ___ COMPLETA A HIGIENE DA BOCA.'
      ],
      sentenceBefore: 'TAMBÉM ESCOVO A MINHA ',
      sentenceAfter: ' COM CUIDADO.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="60" cy="109" rx="28" ry="5" fill="#C2185B" fill-opacity="0.14"/>',
        '          <path d="M18 37 Q60 18 102 37 Q94 64 60 66 Q26 64 18 37 Z" fill="#880E4F" stroke="#880E4F" stroke-width="3" stroke-linejoin="round"/>',
        '          <path d="M30 33 Q60 25 90 33 L87 44 Q60 40 33 44 Z" fill="#FFFFFF" stroke="#0288D1" stroke-width="2.4" stroke-linejoin="round"/>',
        '          <line x1="46" y1="31" x2="46" y2="42" stroke="#B3E5FC" stroke-width="2" stroke-linecap="round"/>',
        '          <line x1="60" y1="30" x2="60" y2="41" stroke="#B3E5FC" stroke-width="2" stroke-linecap="round"/>',
        '          <line x1="74" y1="31" x2="74" y2="42" stroke="#B3E5FC" stroke-width="2" stroke-linecap="round"/>',
        '          <path d="M13 38 C27 18 48 16 60 22 C72 16 93 18 107 38 C91 28 74 26 60 30 C46 26 29 28 13 38 Z" fill="#EF5350" stroke="#B71C1C" stroke-width="3.6" stroke-linejoin="round"/>',
        '          <path d="M32 42 Q60 37 88 42 L88 68 C88 94 74 102 60 102 C46 102 32 94 32 68 Z" fill="#FF80AB"/>',
        '          <path d="M77 44 L85 44 L85 68 C85 91 72 99 60 99 C55 99 50 98 46 96 C61 95 75 88 77 68 Z" fill="#EC407A" fill-opacity="0.46"/>',
        '          <path d="M34 42 Q60 38 86 42 L86 49 Q60 45 34 49 Z" fill="#C2185B" fill-opacity="0.22"/>',
        '          <ellipse cx="46" cy="65" rx="5.5" ry="12" transform="rotate(-8 46 65)" fill="#FCE4EC" fill-opacity="0.72"/>',
        '          <path d="M32 42 Q60 37 88 42 L88 68 C88 94 74 102 60 102 C46 102 32 94 32 68 Z" fill="none" stroke="#C2185B" stroke-width="4.4" stroke-linejoin="round"/>',
        '          <path d="M60 45 L60 80" stroke="#C2185B" stroke-width="3.6" stroke-linecap="round"/>',
        '          <path d="M101 66 L103 71 L108 73 L103 75 L101 80 L99 75 L94 73 L99 71 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.4" stroke-linejoin="round"/>',
        '          <circle cx="19" cy="72" r="3.4" fill="#80DEEA" stroke="#00ACC1" stroke-width="1.6"/>',
        '        </svg>'
      ].join('\n')
    },
    {
      id: 'GENGIVA',
      word: 'GENGIVA',
      plain: 'GENGIVA',
      syllables: ['GEN', 'GI', 'VA'],
      intruders: ['GAN', 'GE', 'VO', 'PA'],
      emoji: '',
      clue: 'PARTE ROSINHA QUE ABRAÇA E SEGURA OS DENTES BEM FIRMES.',
      clues: [
        'PARTE ROSINHA QUE ABRAÇA E SEGURA OS DENTES BEM FIRMES.',
        'FICA EM VOLTA DE CADA DENTE DENTRO DA NOSSA BOCA.',
        'PRECISAMOS ESCOVAR COM CARINHO E DEVAGAR PERTO DELA.',
        'PODE FICAR VERMELHA E DOER SE NÃO USARMOS O FIO DENTAL.',
        'É COMO UM COLCHÃOZINHO FIRME ONDE OS DENTES FICAM PRESOS.',
        'QUANDO UM DENTE DE LEITE VAI NASCER, ELE APARECE NELA!',
        'GOSTA DE ESCOVA COM CERDAS BEM MACIAS!',
        'PROTEGE A RAIZ DOS NOSSOS DENTES PARA ELES NÃO CAÍREM.'
      ],
      sentence: 'A ___ SEGURA OS NOSSOS DENTES BEM FIRMES NO LUGAR!',
      sentences: [
        'A ___ SEGURA OS NOSSOS DENTES BEM FIRMES NO LUGAR!',
        'ESCOVO PERTO DA ___ BEM DEVAGAR E COM CARINHO.',
        'QUANDO ESTÁ SAUDÁVEL, A NOSSA ___ TEM COR ROSINHA!',
        'A ___ FICA EM VOLTA DE TODOS OS NOSSOS DENTES.',
        'USAR O FIO DENTAL AJUDA A MANTER A ___ SAUDÁVEL!',
        'AS CERDAS MACIAS DA ESCOVA CUIDAM BEM DA ___.',
        'OS DENTINHOS NASCEM E FICAM PRESOS NA NOSSA ___!',
        'CUIDAR DA ___ É TÃO IMPORTANTE QUANTO CUIDAR DO DENTE.'
      ],
      sentenceBefore: 'A ',
      sentenceAfter: ' ROSINHA SEGURA OS NOSSOS DENTES.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <ellipse cx="60" cy="107" rx="40" ry="5.5" fill="#0288D1" fill-opacity="0.12"/>',
        '          <rect x="19" y="56" width="25" height="40" rx="10" fill="#FFFFFF"/>',
        '          <path d="M37 60 L42 60 L42 86 C42 91 39 94 34 95 C37 91 37 87 37 81 Z" fill="#E1F5FE"/>',
        '          <rect x="19" y="56" width="25" height="40" rx="10" fill="none" stroke="#0288D1" stroke-width="3.8"/>',
        '          <rect x="47" y="55" width="26" height="43" rx="10" fill="#FFFFFF"/>',
        '          <path d="M65 59 L71 59 L71 88 C71 93 68 96 63 97 C66 93 65 89 65 83 Z" fill="#E1F5FE"/>',
        '          <rect x="47" y="55" width="26" height="43" rx="10" fill="none" stroke="#0288D1" stroke-width="3.8"/>',
        '          <circle cx="55.5" cy="76" r="2.2" fill="#01579B"/>',
        '          <circle cx="64.5" cy="76" r="2.2" fill="#01579B"/>',
        '          <ellipse cx="52" cy="80.5" rx="2.4" ry="1.4" fill="#FF80AB" fill-opacity="0.85"/>',
        '          <ellipse cx="68" cy="80.5" rx="2.4" ry="1.4" fill="#FF80AB" fill-opacity="0.85"/>',
        '          <path d="M56 82 Q60 86 64 82" fill="none" stroke="#01579B" stroke-width="2.2" stroke-linecap="round"/>',
        '          <rect x="76" y="56" width="25" height="40" rx="10" fill="#FFFFFF"/>',
        '          <path d="M94 60 L99 60 L99 86 C99 91 96 94 91 95 C94 91 94 87 94 81 Z" fill="#E1F5FE"/>',
        '          <rect x="76" y="56" width="25" height="40" rx="10" fill="none" stroke="#0288D1" stroke-width="3.8"/>',
        '          <path d="M12 58 C12 24 108 24 108 58 L108 70 C102 62 94 59 88 59 C81 59 76 64 73 71 C70 63 65 59 60 59 C55 59 50 63 47 71 C44 64 39 59 32 59 C26 59 18 62 12 70 Z" fill="#F48FB1"/>',
        '          <path d="M14 63 C20 55 27 53 33 53 C40 53 44 57 47 63 C50 57 55 53 60 53 C65 53 70 57 73 63 C76 57 80 53 87 53 C93 53 100 55 106 63 L106 70 C100 62 93 59 88 59 C81 59 76 64 73 71 C70 63 65 59 60 59 C55 59 50 63 47 71 C44 64 39 59 32 59 C26 59 19 62 14 70 Z" fill="#EC407A" fill-opacity="0.45"/>',
        '          <path d="M32 39 Q60 31 88 39" fill="none" stroke="#FCE4EC" stroke-width="5" stroke-linecap="round" stroke-opacity="0.82"/>',
        '          <path d="M12 58 C12 24 108 24 108 58 L108 70 C102 62 94 59 88 59 C81 59 76 64 73 71 C70 63 65 59 60 59 C55 59 50 63 47 71 C44 64 39 59 32 59 C26 59 18 62 12 70 Z" fill="none" stroke="#AD1457" stroke-width="4.4" stroke-linejoin="round"/>',
        '          <path d="M101 16 L103 21 L108 23 L103 25 L101 30 L99 25 L94 23 L99 21 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.4" stroke-linejoin="round"/>',
        '          <circle cx="19" cy="24" r="3.2" fill="#FFF176"/>',
        '        </svg>'
      ].join('\n')
    }
  ];

  /* ----------------------------------------------------------------------
     3. SVGs base da interface (mantidos separados de SaudeEscola.SVGs)
     ---------------------------------------------------------------------- */
  function getUiIcon(key, fallback) {
    var ui = global.SaudeEscola && global.SaudeEscola.UiIcons;
    return (ui && typeof ui[key] === 'string' && ui[key]) ? ui[key] : (fallback || '');
  }

  var SVGS = {
    SOUND_ON: getUiIcon('SOUND_ON', [
      '<svg viewBox="0 0 44 44" aria-hidden="true">',
      '  <ellipse cx="19" cy="39" rx="12" ry="2.2" fill="#004D40" fill-opacity="0.18"/>',
      '  <rect x="4" y="15" width="9.5" height="14" rx="4.2" fill="#FF9800" stroke="#E65100" stroke-width="2.6"/>',
      '  <path d="M13.5 15.2 L24.5 7.4 C26 6.4 27.5 7.4 27.5 9.2 L27.5 34.8 C27.5 36.6 26 37.6 24.5 36.6 L13.5 28.8 Z" fill="#FFD54F" stroke="#E65100" stroke-width="2.6" stroke-linejoin="round"/>',
      '  <path d="M32 14.5 Q37 22 32 29.5" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round"/>',
      '  <path d="M36 9.5 Q42.5 22 36 34.5" fill="none" stroke="#FFF59D" stroke-width="3.2" stroke-linecap="round"/>',
      '</svg>'
    ].join('\n')),

    SOUND_OFF: getUiIcon('SOUND_OFF', [
      '<svg viewBox="0 0 44 44" aria-hidden="true">',
      '  <ellipse cx="19" cy="39" rx="12" ry="2.2" fill="#263238" fill-opacity="0.18"/>',
      '  <rect x="4" y="15" width="9.5" height="14" rx="4.2" fill="#90A4AE" stroke="#37474F" stroke-width="2.6"/>',
      '  <path d="M13.5 15.2 L24.5 7.4 C26 6.4 27.5 7.4 27.5 9.2 L27.5 34.8 C27.5 36.6 26 37.6 24.5 36.6 L13.5 28.8 Z" fill="#CFD8DC" stroke="#37474F" stroke-width="2.6" stroke-linejoin="round"/>',
      '  <circle cx="34" cy="22" r="8.2" fill="#EF5350" stroke="#B71C1C" stroke-width="2.4"/>',
      '  <path d="M30.8 18.8 L37.2 25.2 M37.2 18.8 L30.8 25.2" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>',
      '</svg>'
    ].join('\n')),

    PLAY_ICON: [
      '<svg viewBox="0 0 40 40" aria-hidden="true">',
      '  <circle cx="20" cy="20" r="16" fill="#FFEE58" stroke="#F57F17" stroke-width="2.8"/>',
      '  <path d="M10 12 A12 12 0 0 1 25 8.5" fill="none" stroke="#FFFDE7" stroke-width="2.8" stroke-linecap="round"/>',
      '  <polygon points="15.5,11.5 29.5,20 15.5,28.5" fill="#2E7D32" stroke="#1B5E20" stroke-width="2.2" stroke-linejoin="round"/>',
      '</svg>'
    ].join('\n'),

    NEXT_CYCLE: getUiIcon('NEXT_CYCLE', [
      '<svg viewBox="0 0 40 40" aria-hidden="true">',
      '  <circle cx="20" cy="20" r="16" fill="#FFFFFF" fill-opacity="0.18"/>',
      '  <path d="M9.5 17 A11.5 11.5 0 0 1 29.5 12" fill="none" stroke="#FFF176" stroke-width="4.2" stroke-linecap="round"/>',
      '  <polygon points="31.5,5.5 34.5,15.5 24,14.5" fill="#FFF176" stroke="#F57F17" stroke-width="1.6" stroke-linejoin="round"/>',
      '  <path d="M30.5 23 A11.5 11.5 0 0 1 10.5 28" fill="none" stroke="#80DEEA" stroke-width="4.2" stroke-linecap="round"/>',
      '  <polygon points="8.5,34.5 5.5,24.5 16,25.5" fill="#80DEEA" stroke="#00838F" stroke-width="1.6" stroke-linejoin="round"/>',
      '</svg>'
    ].join('\n')),

    HOME: getUiIcon('HOME', ''),
    TROPHY_HEADER: getUiIcon('TROPHY_HEADER', ''),
    TROPHY_MODAL: getUiIcon('TROPHY_MODAL', ''),
    TROPHY_RANKING: getUiIcon('TROPHY_RANKING', ''),

    CARD_TOOTH: [
      '',
      '      <svg viewBox="0 0 64 64" aria-hidden="true">',
      '        <ellipse cx="32" cy="57" rx="16" ry="3.2" fill="#01579B" fill-opacity="0.18"/>',
      '        <path d="M18 11 C9.5 11 8.5 29 14 41 C17 48.5 18 55 24 55 C28 55 29.5 44 32 44 C34.5 44 36 55 40 55 C46 55 47 48.5 50 41 C55.5 29 54.5 11 46 11 C39 11 36 16.5 32 16.5 C28 16.5 25 11 18 11 Z" fill="#FFFFFF"/>',
      '        <path d="M45 12.5 C51.5 16 52.5 29.5 48 40 C45 47.5 44 53 40 53 C37 53 35.5 45.5 33 43.5 C38 42.5 42 38 45 31.5 C48.5 23.5 48 16 44 12.5 Z" fill="#E1F5FE"/>',
      '        <path d="M16.5 17 C13 20.5 13 27.5 15.5 33" fill="none" stroke="#E0F7FA" stroke-width="3" stroke-linecap="round"/>',
      '        <path d="M18 11 C9.5 11 8.5 29 14 41 C17 48.5 18 55 24 55 C28 55 29.5 44 32 44 C34.5 44 36 55 40 55 C46 55 47 48.5 50 41 C55.5 29 54.5 11 46 11 C39 11 36 16.5 32 16.5 C28 16.5 25 11 18 11 Z" fill="none" stroke="#01579B" stroke-width="3.2" stroke-linejoin="round"/>',
      '        <circle cx="24.5" cy="27.5" r="3" fill="#01579B"/>',
      '        <circle cx="39.5" cy="27.5" r="3" fill="#01579B"/>',
      '        <circle cx="23.5" cy="26.4" r="1.1" fill="#FFFFFF"/>',
      '        <circle cx="38.5" cy="26.4" r="1.1" fill="#FFFFFF"/>',
      '        <ellipse cx="19.5" cy="32.5" rx="3.2" ry="1.9" fill="#FF80AB" fill-opacity="0.8"/>',
      '        <ellipse cx="44.5" cy="32.5" rx="3.2" ry="1.9" fill="#FF80AB" fill-opacity="0.8"/>',
      '        <path d="M26 34.5 Q32 40 38 34.5" fill="none" stroke="#01579B" stroke-width="2.8" stroke-linecap="round"/>',
      '        <path d="M53 7 L54.4 10.5 L58 11.8 L54.4 13.1 L53 16.6 L51.6 13.1 L48 11.8 L51.6 10.5 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.2" stroke-linejoin="round"/>',
      '      </svg>',
      '    '
    ].join('\n'),

    SMALL_STAR: [
      '',
      '      <svg viewBox="0 0 40 40" aria-hidden="true">',
      '        <polygon points="20,2.6 25.3,13.4 37.2,15.1 28.6,23.5 30.6,35.4 20,29.8 9.4,35.4 11.4,23.5 2.8,15.1 14.7,13.4" fill="#FFD54F"/>',
      '        <polygon points="20,20.5 37.2,15.1 28.6,23.5 30.6,35.4 20,29.8" fill="#FFB300" fill-opacity="0.65"/>',
      '        <polygon points="20,6.2 23.4,13.8 12.2,16 14.7,13.4 20,2.6" fill="#FFFDE7" fill-opacity="0.88"/>',
      '        <polygon points="20,2.6 25.3,13.4 37.2,15.1 28.6,23.5 30.6,35.4 20,29.8 9.4,35.4 11.4,23.5 2.8,15.1 14.7,13.4" fill="none" stroke="#E65100" stroke-width="2.6" stroke-linejoin="round"/>',
      '        <circle cx="17.5" cy="16.5" r="1.8" fill="#FFFDE7"/>',
      '      </svg>',
      '    '
    ].join('\n'),

    MASCOT_HERO: [
      '<svg class="mascot-svg" viewBox="0 0 150 150" width="100%" height="100%" aria-hidden="true">',
      '  <ellipse class="mascot-shadow" cx="75" cy="138" rx="35" ry="6.5" fill="#0288D1" fill-opacity="0.16"/>',
      '  <g class="mascot-cape">',
      '    <path d="M34 56 Q16 96 14 126 Q46 133 75 127 Q104 133 136 126 Q134 96 116 56 Z" fill="#FF7043"/>',
      '    <path d="M110 58 Q128 96 131 124 Q112 128 94 126 Q106 94 102 60 Z" fill="#E64A19" fill-opacity="0.45"/>',
      '    <path d="M34 56 Q16 96 14 126 Q46 133 75 127 Q104 133 136 126 Q134 96 116 56 Z" fill="none" stroke="#BF360C" stroke-width="4" stroke-linejoin="round"/>',
      '  </g>',
      '  <g class="mascot-arm-left">',
      '    <path d="M40 76 Q22 86 24 100 Q26 108 34 106 Q41 102 42 88 Z" fill="#FFFFFF" stroke="#0288D1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
      '    <circle cx="29" cy="100" r="6.5" fill="#FFFFFF" stroke="#0288D1" stroke-width="3.6"/>',
      '  </g>',
      '  <g class="mascot-arm-right">',
      '    <path d="M108 75 Q126 62 128 48 Q129 40 121 41 Q113 44 109 62 Z" fill="#FFFFFF" stroke="#0288D1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
      '    <circle cx="125" cy="45" r="7" fill="#FFFFFF" stroke="#0288D1" stroke-width="3.6"/>',
      '    <path d="M132 33 Q138 38 136 45" fill="none" stroke="#FFD54F" stroke-width="2.6" stroke-linecap="round"/>',
      '  </g>',
      '  <g class="mascot-body-group">',
      '    <path d="M42 26 C24 26 21 63 32 90 C38 106 41 128 53 128 C61 128 65 103 75 103 C85 103 89 128 97 128 C109 128 112 106 118 90 C129 63 126 26 108 26 C92 26 86 36 75 36 C64 36 58 26 42 26 Z" fill="#FFFFFF"/>',
      '    <path d="M106 28 C120 34 123 62 113 88 C107 104 104 124 96 124 C90 124 86 108 81 101 C90 100 98 92 104 78 C113 59 113 39 103 29 Z" fill="#E1F5FE"/>',
      '    <path d="M39 38 C32 45 32 61 36 73" fill="none" stroke="#E0F7FA" stroke-width="5.5" stroke-linecap="round"/>',
      '    <path d="M42 26 C24 26 21 63 32 90 C38 106 41 128 53 128 C61 128 65 103 75 103 C85 103 89 128 97 128 C109 128 112 106 118 90 C129 63 126 26 108 26 C92 26 86 36 75 36 C64 36 58 26 42 26 Z" fill="none" stroke="#0288D1" stroke-width="4.6" stroke-linejoin="round"/>',
      '    <g class="mascot-eyes-normal">',
      '      <g class="mascot-brows-normal">',
      '        <path d="M48 48 Q55 43 62 48" fill="none" stroke="#0288D1" stroke-width="2.6" stroke-linecap="round"/>',
      '        <path d="M88 48 Q95 43 102 48" fill="none" stroke="#0288D1" stroke-width="2.6" stroke-linecap="round"/>',
      '      </g>',
      '      <g class="mascot-eye-orbs">',
      '        <circle cx="55" cy="59" r="6.5" fill="#01579B"/>',
      '        <circle cx="95" cy="59" r="6.5" fill="#01579B"/>',
      '        <circle cx="52.8" cy="56.6" r="2.3" fill="#FFFFFF"/>',
      '        <circle cx="92.8" cy="56.6" r="2.3" fill="#FFFFFF"/>',
      '        <circle cx="57.4" cy="61.6" r="1.1" fill="#FFFFFF" fill-opacity="0.85"/>',
      '        <circle cx="97.4" cy="61.6" r="1.1" fill="#FFFFFF" fill-opacity="0.85"/>',
      '      </g>',
      '    </g>',
      '    <g class="mascot-eyes-happy">',
      '      <path d="M47 61 Q55 51 63 61" fill="none" stroke="#01579B" stroke-width="4.2" stroke-linecap="round"/>',
      '      <path d="M87 61 Q95 51 103 61" fill="none" stroke="#01579B" stroke-width="4.2" stroke-linecap="round"/>',
      '    </g>',
      '    <g class="mascot-eyes-encourage">',
      '      <path d="M47 47 Q55 41 63 44" fill="none" stroke="#0288D1" stroke-width="3" stroke-linecap="round"/>',
      '      <path d="M103 47 Q95 41 87 44" fill="none" stroke="#0288D1" stroke-width="3" stroke-linecap="round"/>',
      '      <circle cx="57" cy="59" r="6.6" fill="#01579B"/>',
      '      <circle cx="97" cy="59" r="6.6" fill="#01579B"/>',
      '      <circle cx="54.8" cy="56.4" r="2.4" fill="#FFFFFF"/>',
      '      <circle cx="94.8" cy="56.4" r="2.4" fill="#FFFFFF"/>',
      '      <circle cx="59.4" cy="61.5" r="1.2" fill="#FFFFFF" fill-opacity="0.88"/>',
      '      <circle cx="99.4" cy="61.5" r="1.2" fill="#FFFFFF" fill-opacity="0.88"/>',
      '    </g>',
      '    <g class="mascot-eyes-curious">',
      '      <path d="M47 44 Q55 37 63 43" fill="none" stroke="#0288D1" stroke-width="3" stroke-linecap="round"/>',
      '      <path d="M88 49 Q95 46 102 49" fill="none" stroke="#0288D1" stroke-width="2.6" stroke-linecap="round"/>',
      '      <circle cx="56.5" cy="58.2" r="6.5" fill="#01579B"/>',
      '      <circle cx="96.5" cy="58.2" r="6.5" fill="#01579B"/>',
      '      <circle cx="58.3" cy="55.8" r="2.3" fill="#FFFFFF"/>',
      '      <circle cx="98.3" cy="55.8" r="2.3" fill="#FFFFFF"/>',
      '      <circle cx="54.4" cy="60.8" r="1.1" fill="#FFFFFF" fill-opacity="0.82"/>',
      '      <circle cx="94.4" cy="60.8" r="1.1" fill="#FFFFFF" fill-opacity="0.82"/>',
      '    </g>',
      '    <g class="mascot-eyes-triumph">',
      '      <path d="M47 45 Q55 39 63 45" fill="none" stroke="#E65100" stroke-width="2.8" stroke-linecap="round"/>',
      '      <path d="M87 45 Q95 39 103 45" fill="none" stroke="#E65100" stroke-width="2.8" stroke-linecap="round"/>',
      '      <polygon points="55,49.5 57.6,55.2 63.8,56 59.2,60.3 60.4,66.4 55,63.4 49.6,66.4 50.8,60.3 46.2,56 52.4,55.2" fill="#FFD54F" stroke="#E65100" stroke-width="1.8" stroke-linejoin="round"/>',
      '      <polygon points="95,49.5 97.6,55.2 103.8,56 99.2,60.3 100.4,66.4 95,63.4 89.6,66.4 90.8,60.3 86.2,56 92.4,55.2" fill="#FFD54F" stroke="#E65100" stroke-width="1.8" stroke-linejoin="round"/>',
      '      <circle cx="55" cy="58.2" r="2" fill="#FFFFFF"/>',
      '      <circle cx="95" cy="58.2" r="2" fill="#FFFFFF"/>',
      '    </g>',
      '    <g class="mascot-cheeks">',
      '      <ellipse cx="42" cy="70" rx="6.5" ry="3.8" fill="#FF80AB" fill-opacity="0.78"/>',
      '      <ellipse cx="108" cy="70" rx="6.5" ry="3.8" fill="#FF80AB" fill-opacity="0.78"/>',
      '    </g>',
      '    <path class="mascot-mouth-normal" d="M58 76 Q75 91 92 76" fill="none" stroke="#01579B" stroke-width="4.5" stroke-linecap="round"/>',
      '    <g class="mascot-mouth-happy">',
      '      <path d="M57 74 Q75 96 93 74 Z" fill="#AD1457" stroke="#01579B" stroke-width="3.6" stroke-linejoin="round"/>',
      '      <path d="M64 82 Q75 88 86 82 Q75 91 64 82 Z" fill="#FF80AB"/>',
      '    </g>',
      '    <g class="mascot-mouth-encourage">',
      '      <path d="M62 76 Q75 73 88 76 Q89 91 75 91 Q61 91 62 76 Z" fill="#AD1457" stroke="#01579B" stroke-width="3.6" stroke-linejoin="round"/>',
      '      <path d="M67 84 Q75 80 83 84 Q75 89 67 84 Z" fill="#FF80AB"/>',
      '    </g>',
      '    <g class="mascot-mouth-curious">',
      '      <path d="M61 78 Q71 82 81 76" fill="none" stroke="#01579B" stroke-width="3.8" stroke-linecap="round"/>',
      '      <ellipse cx="83" cy="81" rx="4.2" ry="3.4" fill="#AD1457" fill-opacity="0.82" stroke="#01579B" stroke-width="2.4"/>',
      '    </g>',
      '    <g class="mascot-mouth-triumph">',
      '      <path d="M54 73 Q75 100 96 73 Z" fill="#AD1457" stroke="#01579B" stroke-width="3.6" stroke-linejoin="round"/>',
      '      <path d="M62 83 Q75 91 88 83 Q75 95 62 83 Z" fill="#FF80AB"/>',
      '      <path d="M60 75.5 Q75 77.5 90 75.5" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>',
      '    </g>',
      '    <g class="mascot-mouth-talking">',
      '      <g class="mascot-mouth-talk-jaw">',
      '        <path d="M61 76 Q75 74 89 76 Q89 93 75 93 Q61 93 61 76 Z" fill="#AD1457" stroke="#01579B" stroke-width="3.6" stroke-linejoin="round"/>',
      '        <path d="M67 86 Q75 81 83 86 Q75 91 67 86 Z" fill="#FF80AB"/>',
      '        <path d="M66 77.5 Q75 76.5 84 77.5" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>',
      '      </g>',
      '      <path class="mascot-mouth-talk-upper" d="M60 76 Q75 73 90 76" fill="none" stroke="#01579B" stroke-width="3.8" stroke-linecap="round"/>',
      '    </g>',
      '  </g>',
      '  <g class="mascot-sparkles">',
      '    <path d="M122 10 L124.8 17.2 L132 20 L124.8 22.8 L122 30 L119.2 22.8 L112 20 L119.2 17.2 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.6" stroke-linejoin="round"/>',
      '    <circle cx="24" cy="26" r="4" fill="#FFF176" stroke="#F57F17" stroke-width="1.4"/>',
      '    <circle cx="139" cy="64" r="3" fill="#FFF176"/>',
      '  </g>',
      '  <g class="mascot-encourage-badge">',
      '    <circle cx="126" cy="24" r="14.5" fill="#FFF8E1" stroke="#FB8C00" stroke-width="3"/>',
      '    <circle cx="126" cy="24" r="11" fill="#FFE082" fill-opacity="0.45"/>',
      '    <path d="M126 15.5 L128.4 21.4 L134.6 22.1 L129.9 26.2 L131.2 32.3 L126 29.1 L120.8 32.3 L122.1 26.2 L117.4 22.1 L123.6 21.4 Z" fill="#FF9800" stroke="#E65100" stroke-width="1.6" stroke-linejoin="round"/>',
      '    <circle cx="141" cy="14" r="3" fill="#FFB300"/>',
      '  </g>',
      '  <g class="mascot-curious-badge">',
      '    <circle cx="111" cy="34" r="2.6" fill="#E0F7FA" stroke="#00838F" stroke-width="1.8"/>',
      '    <circle cx="117" cy="28" r="3.6" fill="#E0F7FA" stroke="#00838F" stroke-width="1.8"/>',
      '    <ellipse cx="130" cy="19" rx="13" ry="11" fill="#E0F7FA" stroke="#00838F" stroke-width="2.4"/>',
      '    <path d="M126.8 15.5 C126.8 12.6 133.2 12.6 133.2 15.6 C133.2 17.8 130 18.2 130 20.5" fill="none" stroke="#006064" stroke-width="2.6" stroke-linecap="round"/>',
      '    <circle cx="130" cy="24" r="1.5" fill="#006064"/>',
      '  </g>',
      '  <g class="mascot-triumph-fx">',
      '    <polygon points="56,22 61,9 69,17 75,7 81,17 89,9 94,22" fill="#FFD54F" stroke="#E65100" stroke-width="2.4" stroke-linejoin="round"/>',
      '    <circle cx="62" cy="16.5" r="2" fill="#FF4081"/>',
      '    <circle cx="75" cy="14.5" r="2.2" fill="#29B6F6"/>',
      '    <circle cx="88" cy="16.5" r="2" fill="#66BB6A"/>',
      '    <polygon points="22,12 24,17 29,19 24,21 22,26 20,21 15,19 20,17" fill="#FF80AB" stroke="#AD1457" stroke-width="1.2" stroke-linejoin="round"/>',
      '    <polygon points="128,12 130,17 135,19 130,21 128,26 126,21 121,19 126,17" fill="#4DD0E1" stroke="#00838F" stroke-width="1.2" stroke-linejoin="round"/>',
      '    <circle cx="16" cy="54" r="3" fill="#FFD54F"/>',
      '    <circle cx="136" cy="52" r="3" fill="#FF7043"/>',
      '  </g>',
      '</svg>'
    ].join('\n'),

    KEY_BACKSPACE: [
      '<svg viewBox="0 0 40 40" aria-hidden="true">',
      '  <path d="M13.5 9.5 L4.5 20 L13.5 30.5 L34 30.5 C35.8 30.5 37.5 29 37.5 27 L37.5 13 C37.5 11 35.8 9.5 34 9.5 Z" fill="#FFEBEE" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round"/>',
      '  <path d="M18.5 15 L29.5 25 M29.5 15 L18.5 25" stroke="#C62828" stroke-width="3.6" stroke-linecap="round"/>',
      '</svg>'
    ].join('\n'),

    KEY_VERIFY: [
      '<svg viewBox="0 0 40 40" aria-hidden="true">',
      '  <circle cx="20" cy="20" r="16" fill="#E8F5E9" stroke="#FFFFFF" stroke-width="2.8"/>',
      '  <path d="M10 13 A11.5 11.5 0 0 1 24 8.8" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>',
      '  <path d="M12 20.5 L17.8 26.5 L28.5 14" fill="none" stroke="#1B5E20" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>',
      '</svg>'
    ].join('\n'),

    MINI_BACKSPACE: [
      '<svg viewBox="0 0 40 40" aria-hidden="true">',
      '  <path d="M13.5 9.5 L4.5 20 L13.5 30.5 L34 30.5 C35.8 30.5 37.5 29 37.5 27 L37.5 13 C37.5 11 35.8 9.5 34 9.5 Z" fill="#FFEBEE" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>',
      '  <path d="M18.5 15 L29.5 25 M29.5 15 L18.5 25" stroke="#C62828" stroke-width="3.5" stroke-linecap="round"/>',
      '</svg>'
    ].join('\n')
  };

  SVGS.REPLAY_ICON = SVGS.NEXT_CYCLE;

  /**
   * Retorna o SVG da medalha de podio para o ranking (1o, 2o ou 3o lugar).
   */
  function getMedalSvg(position) {
    var ui = global.SaudeEscola && global.SaudeEscola.UiIcons;
    if (ui && typeof ui.getMedalSvg === 'function') {
      var uiMedal = ui.getMedalSvg(position);
      if (uiMedal) return uiMedal;
    }
    if (position === 1) {
      return [
        '',
        '          <svg viewBox="0 0 48 48" aria-hidden="true">',
        '            <polygon points="10,3 23,19 16,19 5,3" fill="#EF5350" stroke="#B71C1C" stroke-width="1.6" stroke-linejoin="round"/>',
        '            <polygon points="11.5,4.2 19,17 17,17 9,4.2" fill="#FFCA28"/>',
        '            <polygon points="38,3 25,19 32,19 43,3" fill="#E53935" stroke="#B71C1C" stroke-width="1.6" stroke-linejoin="round"/>',
        '            <polygon points="36.5,4.2 29,17 31,17 39,4.2" fill="#FFCA28"/>',
        '            <circle cx="24" cy="15.5" r="2.8" fill="none" stroke="#E65100" stroke-width="2.2"/>',
        '            <circle cx="24" cy="29.5" r="14.5" fill="#FFEE58"/>',
        '            <path d="M33 18 A14.5 14.5 0 0 1 15 41 A13 13 0 0 0 33 18 Z" fill="#FBC02D" fill-opacity="0.58"/>',
        '            <circle cx="24" cy="29.5" r="14.5" fill="none" stroke="#E65100" stroke-width="3"/>',
        '            <circle cx="24" cy="29.5" r="10.6" fill="none" stroke="#FFF9C4" stroke-width="1.8"/>',
        '            <path d="M15.5 23 A10 10 0 0 1 25 19" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>',
        '            <polygon points="24,20.5 26.8,26 32.8,26.9 28.4,31.1 29.5,37.1 24,34.2 18.5,37.1 19.6,31.1 15.2,26.9 21.2,26" fill="#FFFDE7" stroke="#E65100" stroke-width="1.7" stroke-linejoin="round"/>',
        '            <circle cx="40" cy="14" r="2" fill="#FFF176"/>',
        '          </svg>',
        '        '
      ].join('\n');
    } else if (position === 2) {
      return [
        '',
        '          <svg viewBox="0 0 48 48" aria-hidden="true">',
        '            <polygon points="10,3 23,19 16,19 5,3" fill="#42A5F5" stroke="#0D47A1" stroke-width="1.6" stroke-linejoin="round"/>',
        '            <polygon points="11.5,4.2 19,17 17,17 9,4.2" fill="#E1F5FE"/>',
        '            <polygon points="38,3 25,19 32,19 43,3" fill="#1E88E5" stroke="#0D47A1" stroke-width="1.6" stroke-linejoin="round"/>',
        '            <polygon points="36.5,4.2 29,17 31,17 39,4.2" fill="#E1F5FE"/>',
        '            <circle cx="24" cy="15.5" r="2.8" fill="none" stroke="#455A64" stroke-width="2.2"/>',
        '            <circle cx="24" cy="29.5" r="14.5" fill="#ECEFF1"/>',
        '            <path d="M33 18 A14.5 14.5 0 0 1 15 41 A13 13 0 0 0 33 18 Z" fill="#B0BEC5" fill-opacity="0.62"/>',
        '            <circle cx="24" cy="29.5" r="14.5" fill="none" stroke="#455A64" stroke-width="3"/>',
        '            <circle cx="24" cy="29.5" r="10.6" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>',
        '            <path d="M15.5 23 A10 10 0 0 1 25 19" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>',
        '            <polygon points="24,20.5 26.8,26 32.8,26.9 28.4,31.1 29.5,37.1 24,34.2 18.5,37.1 19.6,31.1 15.2,26.9 21.2,26" fill="#FFFFFF" stroke="#455A64" stroke-width="1.7" stroke-linejoin="round"/>',
        '            <circle cx="40" cy="14" r="2" fill="#E1F5FE"/>',
        '          </svg>',
        '        '
      ].join('\n');
    } else if (position === 3) {
      return [
        '',
        '          <svg viewBox="0 0 48 48" aria-hidden="true">',
        '            <polygon points="10,3 23,19 16,19 5,3" fill="#66BB6A" stroke="#1B5E20" stroke-width="1.6" stroke-linejoin="round"/>',
        '            <polygon points="11.5,4.2 19,17 17,17 9,4.2" fill="#FFF176"/>',
        '            <polygon points="38,3 25,19 32,19 43,3" fill="#43A047" stroke="#1B5E20" stroke-width="1.6" stroke-linejoin="round"/>',
        '            <polygon points="36.5,4.2 29,17 31,17 39,4.2" fill="#FFF176"/>',
        '            <circle cx="24" cy="15.5" r="2.8" fill="none" stroke="#BF360C" stroke-width="2.2"/>',
        '            <circle cx="24" cy="29.5" r="14.5" fill="#FFCC80"/>',
        '            <path d="M33 18 A14.5 14.5 0 0 1 15 41 A13 13 0 0 0 33 18 Z" fill="#FB8C00" fill-opacity="0.5"/>',
        '            <circle cx="24" cy="29.5" r="14.5" fill="none" stroke="#BF360C" stroke-width="3"/>',
        '            <circle cx="24" cy="29.5" r="10.6" fill="none" stroke="#FFF8E1" stroke-width="1.8"/>',
        '            <path d="M15.5 23 A10 10 0 0 1 25 19" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>',
        '            <polygon points="24,20.5 26.8,26 32.8,26.9 28.4,31.1 29.5,37.1 24,34.2 18.5,37.1 19.6,31.1 15.2,26.9 21.2,26" fill="#FFF8E1" stroke="#BF360C" stroke-width="1.7" stroke-linejoin="round"/>',
        '            <circle cx="40" cy="14" r="2" fill="#FFF176"/>',
        '          </svg>',
        '        '
      ].join('\n');
    }
    return '';
  }

  /* ----------------------------------------------------------------------
     4. Resolucao de modulos e banco ativo (padrao vs. Palavras da Semana)
     ---------------------------------------------------------------------- */
  var FALLBACK_INTRUDERS = ['PA', 'TO', 'LA', 'MI', 'BO', 'CA'];

  function getSaudeModule(name) {
    return (SaudeEscola && SaudeEscola[name]) ? SaudeEscola[name] : null;
  }

  /**
   * Remove acentos e preserva apenas letras maiusculas [A-Z] como fallback seguro.
   */
  function normalizePlainFallback(str) {
    var txt = String(str == null ? '' : str);
    if (typeof txt.normalize === 'function') {
      txt = txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return txt.toUpperCase().replace(/[^A-Z]/g, '');
  }

  /**
   * Ajusta a tag <svg> raiz para escalar a 100% mantendo a proporcao centralizada.
   */
  function normalizarSvgResponsivo(svgMarkup) {
    if (typeof svgMarkup !== 'string') return '';
    return svgMarkup.replace(/<svg\b([^>]*)>/i, function (_match, attrs) {
      var cleaned = String(attrs || '')
        .replace(/\s*\bwidth\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s*\bheight\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s*\bpreserveAspectRatio\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .trim();
      var extra = 'width="100%" height="100%" preserveAspectRatio="xMidYMid meet"';
      return '<svg ' + (cleaned ? cleaned + ' ' : '') + extra + '>';
    });
  }

  /**
   * Normaliza defensivamente uma palavra da semana para uso uniforme nas Fases 1, 2 e 3.
   */
  function normalizeWeeklyItem(item, index, storage, rawById, rawByPlain) {
    if (!item || typeof item !== 'object') return null;

    var rawWord = String(item.word || item.palavra || '').trim().toUpperCase();
    if (!rawWord) return null;

    var plain = String(item.plain || '').trim().toUpperCase();
    if (!plain) {
      plain = (storage && typeof storage.normalizarPlain === 'function')
        ? String(storage.normalizarPlain(rawWord) || '').toUpperCase()
        : normalizePlainFallback(rawWord);
    }
    if (!plain) {
      plain = normalizePlainFallback(rawWord);
    }
    if (!plain) return null;

    var rawSyls = Array.isArray(item.syllables) && item.syllables.length > 0
      ? item.syllables
      : (Array.isArray(item.silabas) && item.silabas.length > 0 ? item.silabas : [rawWord]);
    var syllables = [];
    for (var i = 0; i < rawSyls.length; i += 1) {
      var syl = String(rawSyls[i] == null ? '' : rawSyls[i]).trim().toUpperCase();
      if (syl) syllables.push(syl);
    }
    if (syllables.length === 0) {
      syllables = [rawWord];
    }

    var ownSylMap = {};
    for (var sIdx = 0; sIdx < syllables.length; sIdx += 1) {
      ownSylMap[syllables[sIdx]] = true;
    }

    var intruders = [];
    var seenIntruders = {};
    var rawIntruders = Array.isArray(item.intruders) ? item.intruders : [];
    for (var j = 0; j < rawIntruders.length; j += 1) {
      var cand = String(rawIntruders[j] == null ? '' : rawIntruders[j]).trim().toUpperCase();
      if (cand && !ownSylMap[cand] && !seenIntruders[cand]) {
        seenIntruders[cand] = true;
        intruders.push(cand);
      }
    }
    for (var f = 0; f < FALLBACK_INTRUDERS.length && intruders.length < 2; f += 1) {
      var fb = FALLBACK_INTRUDERS[f];
      if (!ownSylMap[fb] && !seenIntruders[fb]) {
        seenIntruders[fb] = true;
        intruders.push(fb);
      }
    }

    var itemIdStr = item.id ? String(item.id) : '';
    var rawMatch = null;
    if (itemIdStr && rawById && rawById[itemIdStr]) {
      rawMatch = rawById[itemIdStr];
    } else if (plain && rawByPlain && rawByPlain[plain]) {
      rawMatch = rawByPlain[plain];
    }

    var dicaOriginal;
    if (rawMatch) {
      dicaOriginal = String(rawMatch.dica || '').trim().toUpperCase();
    } else {
      dicaOriginal = String(
        item.dicaOriginal !== undefined ? item.dicaOriginal : (item.dica || '')
      ).trim().toUpperCase();
    }

    var fraseOriginal;
    if (rawMatch) {
      fraseOriginal = String(rawMatch.frase || '').trim().toUpperCase();
    } else {
      fraseOriginal = String(
        item.fraseOriginal !== undefined ? item.fraseOriginal : (item.frase || item.sentence || '')
      ).trim().toUpperCase();
      if (/^PALAVRA DA SEMANA! ESCREVA NO TECLADO:/i.test(fraseOriginal) ||
          /^DICA:\s.*—\s*ESCREVA A PALAVRA:/i.test(fraseOriginal)) {
        fraseOriginal = '';
      }
    }

    var clue = String(
      item.clue || dicaOriginal || 'JUNTE OS PEDACINHOS PARA FORMAR A PALAVRA!'
    ).trim().toUpperCase();

    var clues = Array.isArray(item.clues) && item.clues.length > 0
      ? item.clues.slice()
      : [clue];

    var silabaInicial = String(
      item.silabaInicial || syllables[0] || rawWord.slice(0, 2)
    ).trim().toUpperCase();

    var p3Mode;
    var sentence;
    if (fraseOriginal) {
      p3Mode = 'FRASE';
      sentence = fraseOriginal.indexOf('___') !== -1
        ? fraseOriginal
        : (fraseOriginal + ' (___)');
    } else if (dicaOriginal) {
      p3Mode = 'DICA';
      sentence = 'DICA: ' + dicaOriginal;
    } else {
      p3Mode = 'DITADO';
      sentence = 'DITADO DA PROFESSORA! ESCREVA A PALAVRA:';
    }

    var sentences = [sentence];
    var stickersApi = getSaudeModule('Stickers');
    var explicitStickerId = rawMatch && rawMatch.stickerId !== undefined
      ? rawMatch.stickerId
      : (item.stickerId !== undefined ? item.stickerId : null);
    if (typeof explicitStickerId === 'string') {
      explicitStickerId = explicitStickerId.trim().toLowerCase();
      if (!explicitStickerId) explicitStickerId = null;
    } else {
      explicitStickerId = null;
    }

    var resolvedSticker = null;
    if (explicitStickerId === 'none') {
      resolvedSticker = null;
    } else if (explicitStickerId && stickersApi && typeof stickersApi.getById === 'function') {
      resolvedSticker = stickersApi.getById(explicitStickerId);
    } else if (!explicitStickerId && stickersApi && typeof stickersApi.matchByWord === 'function') {
      resolvedSticker = stickersApi.matchByWord(plain || rawWord);
    }

    var hasSticker = Boolean(resolvedSticker && resolvedSticker.svg) ||
      Boolean(!stickersApi && explicitStickerId !== 'none' && item.hasSticker && item.svg);
    var finalStickerId = explicitStickerId === 'none'
      ? 'none'
      : (resolvedSticker ? resolvedSticker.id : (hasSticker ? explicitStickerId : null));
    var defaultWeeklySvg = (storage && storage.SVGs && storage.SVGs.ILUSTRACAO_SEMANA) || '';
    var rawSvg;
    if (explicitStickerId === 'none') {
      rawSvg = defaultWeeklySvg || item.svg || '';
    } else if (resolvedSticker && resolvedSticker.svg) {
      rawSvg = resolvedSticker.svg;
    } else {
      rawSvg = item.svg || defaultWeeklySvg || '';
    }
    var svg = normalizarSvgResponsivo(rawSvg);

    return {
      id: itemIdStr || ('WEEKLY_' + index + '_' + plain),
      word: rawWord,
      plain: plain,
      syllables: syllables,
      intruders: intruders,
      emoji: '',
      clue: clue,
      clues: clues,
      dicaOriginal: dicaOriginal,
      fraseOriginal: fraseOriginal,
      p3Mode: p3Mode,
      silabaInicial: silabaInicial,
      sentence: sentence,
      sentences: sentences,
      sentenceBefore: '',
      sentenceAfter: '',
      svg: svg,
      stickerId: finalStickerId,
      hasSticker: hasSticker,
      isWeeklyWord: true
    };
  }

  /**
   * Retorna metadados unificados do banco ativo no momento (Palavras da Semana ou Padrao).
   */
  function getActiveBankInfo() {
    var storage = getSaudeModule('Storage');
    if (storage && typeof storage.isPalavrasSemanaAtivo === 'function' && storage.isPalavrasSemanaAtivo()) {
      var weeklyBank = typeof storage.getBancoPalavrasSemanaParaJogo === 'function'
        ? storage.getBancoPalavrasSemanaParaJogo()
        : null;
      if (Array.isArray(weeklyBank) && weeklyBank.length >= 4) {
        var rawWeeklyById = Object.create(null);
        var rawWeeklyByPlain = Object.create(null);
        if (typeof storage.listarPalavrasSemana === 'function') {
          var rawLista = storage.listarPalavrasSemana() || [];
          for (var r = 0; r < rawLista.length; r += 1) {
            var rItem = rawLista[r];
            if (!rItem) continue;
            if (rItem.id) rawWeeklyById[String(rItem.id)] = rItem;
            if (rItem.plain) rawWeeklyByPlain[String(rItem.plain).toUpperCase()] = rItem;
          }
        }

        var normalized = [];
        for (var i = 0; i < weeklyBank.length; i += 1) {
          var normItem = normalizeWeeklyItem(weeklyBank[i], i, storage, rawWeeklyById, rawWeeklyByPlain);
          if (normItem) {
            normalized.push(normItem);
          }
        }
        if (normalized.length >= 4) {
          return {
            isWeekly: true,
            words: normalized,
            count: normalized.length
          };
        }
      }
    }

    return {
      isWeekly: false,
      words: DEFAULT_WORDS,
      count: DEFAULT_WORDS.length
    };
  }

  /**
   * Indica se o modo personalizado "Palavras da Semana" esta ativo no Storage.
   */
  function isWeeklyWordsActive() {
    return getActiveBankInfo().isWeekly;
  }

  /**
   * Retorna o banco de palavras ativo no momento (semana da professora ou padrao).
   */
  function getActiveWordBank() {
    return getActiveBankInfo().words;
  }

  /* ----------------------------------------------------------------------
     5. Filas persistentes de dicas (Fase 2) e frases (Fase 3)
     ---------------------------------------------------------------------- */
  var queueMemoryCache = Object.create(null);

  function loadQueueState(storageKey, poolVersion) {
    if (queueMemoryCache[storageKey]) {
      return queueMemoryCache[storageKey];
    }
    try {
      if (global.localStorage) {
        var raw = global.localStorage.getItem(storageKey);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed._version === poolVersion) {
            queueMemoryCache[storageKey] = parsed;
            return parsed;
          }
        }
      }
    } catch (e) {}

    var initial = { _version: poolVersion };
    queueMemoryCache[storageKey] = initial;
    saveQueueState(storageKey);
    return initial;
  }

  function saveQueueState(storageKey) {
    var state = queueMemoryCache[storageKey];
    if (!state) return;
    try {
      if (global.localStorage) {
        global.localStorage.setItem(storageKey, JSON.stringify(state));
      }
    } catch (e) {}
  }

  /**
   * Seleciona o proximo indice da fila persistente usando Fisher-Yates,
   * garantindo que toda a lista seja percorrida antes de repetir e evitando
   * repetir imediatamente o ultimo item exibido ao reiniciar o ciclo.
   */
  function pickNextQueueIndex(storageKey, poolVersion, wordKey, total) {
    var state = loadQueueState(storageKey, poolVersion);

    if (!state[wordKey] || !Array.isArray(state[wordKey].queue)) {
      state[wordKey] = { queue: [], lastIndex: -1 };
    }

    var entry = state[wordKey];
    entry.queue = entry.queue.filter(function (idx) {
      return typeof idx === 'number' && idx >= 0 && idx < total;
    });

    if (entry.queue.length === 0) {
      var indices = [];
      for (var i = 0; i < total; i++) {
        indices.push(i);
      }
      // Embaralhamento Fisher-Yates
      for (var k = indices.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var temp = indices[k];
        indices[k] = indices[j];
        indices[j] = temp;
      }
      // Evita que o primeiro item da nova fila seja identico ao ultimo exibido
      if (total > 1 && indices[0] === entry.lastIndex) {
        var swapIdx = 1 + Math.floor(Math.random() * (total - 1));
        var first = indices[0];
        indices[0] = indices[swapIdx];
        indices[swapIdx] = first;
      }
      entry.queue = indices;
    }

    var nextIndex = entry.queue.shift();
    entry.lastIndex = nextIndex;
    saveQueueState(storageKey);
    return nextIndex;
  }

  /**
   * Retorna a proxima dica pedagogica da fila persistente para a palavra na Fase 2.
   * Palavras customizadas da semana ou com dica unica retornam direto sem alterar filas padrao.
   */
  function getNextClueForWord(wordItem) {
    if (!wordItem) return '';
    if (wordItem.isWeeklyWord || !Array.isArray(wordItem.clues) || wordItem.clues.length <= 1) {
      return (Array.isArray(wordItem.clues) && wordItem.clues[0]) || wordItem.clue || '';
    }

    var nextIndex = pickNextQueueIndex(
      CLUE_QUEUES_STORAGE_KEY,
      CLUE_POOL_VERSION,
      wordItem.word,
      wordItem.clues.length
    );

    return wordItem.clues[nextIndex] || wordItem.clue;
  }

  /**
   * Retorna a proxima frase da fila persistente para a palavra na Fase 3.
   * Palavras customizadas da semana ou com frase unica retornam direto sem alterar filas padrao.
   */
  function getNextSentenceForWord(wordItem) {
    if (!wordItem) return '';
    if (wordItem.isWeeklyWord || !Array.isArray(wordItem.sentences) || wordItem.sentences.length <= 1) {
      return (Array.isArray(wordItem.sentences) && wordItem.sentences[0]) ||
        wordItem.sentence ||
        (String(wordItem.sentenceBefore || '') + '___' + String(wordItem.sentenceAfter || ''));
    }

    var nextIndex = pickNextQueueIndex(
      SENTENCE_QUEUES_STORAGE_KEY,
      SENTENCE_POOL_VERSION,
      wordItem.word,
      wordItem.sentences.length
    );

    return wordItem.sentences[nextIndex] || wordItem.sentence;
  }

  /* ----------------------------------------------------------------------
     6. Exportacao publica sob o namespace global window.SaudeEscola.WordBank
     ---------------------------------------------------------------------- */
  SaudeEscola.WordBank = {
    CLUE_QUEUES_STORAGE_KEY: CLUE_QUEUES_STORAGE_KEY,
    CLUE_POOL_VERSION: CLUE_POOL_VERSION,
    SENTENCE_QUEUES_STORAGE_KEY: SENTENCE_QUEUES_STORAGE_KEY,
    SENTENCE_POOL_VERSION: SENTENCE_POOL_VERSION,
    DEFAULT_WORDS: DEFAULT_WORDS,
    SVGS: SVGS,
    getMedalSvg: getMedalSvg,
    getActiveBankInfo: getActiveBankInfo,
    isWeeklyWordsActive: isWeeklyWordsActive,
    getActiveWordBank: getActiveWordBank,
    getNextClueForWord: getNextClueForWord,
    getNextSentenceForWord: getNextSentenceForWord
  };
})(typeof window !== 'undefined' ? window : globalThis);
