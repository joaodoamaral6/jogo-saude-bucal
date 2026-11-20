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
        'NÓS USAMOS ELA PARA FALAR, COMER E SORRIR!',
        'DEPOIS DE COMER, PRECISAMOS DEIXAR ELA BEM LIMPINHA.',
        'É POR ONDE A COMIDA ENTRA QUANDO VAMOS ALMOÇAR.',
        'O DENTISTA CUIDA MUITO BEM DA SAÚDE DELA!',
        'QUANDO BOCEJAMOS DE SONO, ABRIMOS ELA BEM GRANDE!',
        'LUGAR ONDE GUARDAMOS O NOSSO SORRISO.',
        'USAMOS ÁGUA PARA ENXAGUAR ELA DEPOIS DA ESCOVAÇÃO.'
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
        'DEPOIS DO LANCHE, LAVO E ESCOVO A MINHA ___!'
      ],
      sentenceBefore: 'ABRO BEM A ',
      sentenceAfter: ' PARA ESCOVAR OS DENTES.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <path d="M12 60 Q60 20 108 60 Q60 110 12 60 Z" fill="#EF5350" stroke="#B71C1C" stroke-width="5"/>',
        '          <path d="M22 60 Q60 36 98 60 Q60 92 22 60 Z" fill="#880E4F"/>',
        '          <path d="M28 53 Q60 44 92 53 L88 62 Q60 56 32 62 Z" fill="#FFFFFF"/>',
        '          <path d="M36 74 Q60 62 84 74 Q60 90 36 74 Z" fill="#FF80AB"/>',
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
        'QUANDO SOMOS CRIANÇAS, ELE É CHAMADO DE LEITE!',
        'PRECISAMOS ESCOVAR ELE TODOS OS DIAS PARA BRILHAR.',
        'ELE CORTA E TRITURA OS ALIMENTOS QUE COMEMOS.',
        'QUANDO ELE CAI NA INFÂNCIA, A FADA VEM VISITAR!',
        'O DENTISTA OLHA UM POR UM PARA VER SE ESTÃO FORTES.',
        'FICAM TODOS JUNTINHOS FORMANDO O NOSSO SORRISO.'
      ],
      sentence: 'QUANDO O ___ DE LEITE CAI, NASCE OUTRO NO LUGAR!',
      sentences: [
        'QUANDO O ___ DE LEITE CAI, NASCE OUTRO NO LUGAR!',
        'CADA ___ DA NOSSA BOCA PRECISA SER BEM ESCOVADO.',
        'O ___ BRANQUINHO E FORTE AJUDA A MORDER A MAÇÃ!',
        'PASSO A ESCOVA COM CARINHO EM CIMA DE CADA ___.',
        'SE A GENTE NÃO CUIDAR, O ___ PODE FICAR DOENTE.',
        'MEU ___ BRILHA QUANDO TERMINO A ESCOVAÇÃO!',
        'O DENTISTA CUIDA DE CADA ___ COM MUITO CAPRICHO.',
        'USAMOS O ___ PARA MASTIGAR TODA A COMIDA.'
      ],
      sentenceBefore: 'MEU ',
      sentenceAfter: ' FICA BRANQUINHO E FORTE!',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <path d="M30 25 C18 25 16 55 25 75 C30 88 32 105 42 105 C50 105 52 85 60 85 C68 85 70 105 78 105 C88 105 90 88 95 75 C104 55 102 25 90 25 C75 25 70 33 60 33 C50 33 45 25 30 25 Z" fill="#FFFFFF" stroke="#0288D1" stroke-width="5"/>',
        '          <circle cx="45" cy="52" r="5" fill="#01579B"/>',
        '          <circle cx="75" cy="52" r="5" fill="#01579B"/>',
        '          <path d="M48 65 Q60 76 72 65" fill="none" stroke="#01579B" stroke-width="5" stroke-linecap="round"/>',
        '          <path d="M95 18 L100 8 M104 24 L114 20 M90 12 L86 4" stroke="#FFD54F" stroke-width="4" stroke-linecap="round"/>',
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
        'VEM DENTRO DE UM TUBINHO E A GENTE APERTA PARA SAIR.',
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
        '          <rect x="18" y="46" width="66" height="36" rx="10" fill="#29B6F6" stroke="#01579B" stroke-width="4"/>',
        '          <polygon points="18,46 8,38 8,90 18,82" fill="#0288D1" stroke="#01579B" stroke-width="4"/>',
        '          <rect x="84" y="55" width="12" height="18" rx="3" fill="#ECEFF1" stroke="#455A64" stroke-width="3"/>',
        '          <path d="M96 64 Q112 50 112 66 Q112 78 96 68 Z" fill="#80DEEA" stroke="#00838F" stroke-width="3"/>',
        '          <rect x="30" y="56" width="42" height="16" rx="6" fill="#FFFFFF"/>',
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
        'COLOCAMOS A PASTA EM CIMA DELA PARA ESCOVAR.',
        'FAZ MOVIMENTOS DE VAI E VEM PARA LIMPAR O SORRISO!',
        'CADA PESSOA TEM A SUA E NÃO PODE EMPRESTAR!',
        'USAMOS ELA DEPOIS DO CAFÉ, DO ALMOÇO E DO JANTAR.',
        'QUANDO AS CERDAS FICAM VELHINHAS, PRECISAMOS TROCAR ELA.',
        'ELA TAMBÉM AJUDA A LIMPAR A NOSSA LÍNGUA DE LEVE!',
        'GUARDAMOS ELA BEM LIMPINHA NO BANHEIRO DEPOIS DE USAR.'
      ],
      sentence: 'A MINHA ___ TEM CERDAS BEM MACIAS!',
      sentences: [
        'A MINHA ___ TEM CERDAS BEM MACIAS!',
        'PASSO A ___ EM TODOS OS DENTES DEPOIS DE COMER.',
        'LAVO A MINHA ___ COM ÁGUA DEPOIS DE TERMINAR.',
        'CADA CRIANÇA TEM A SUA PRÓPRIA ___ DE DENTE!',
        'MOVIMENTO A ___ PARA LÁ E PARA CÁ COM CUIDADO.',
        'QUANDO A ___ FICA VELHINHA, TROCAMOS POR UMA NOVA.',
        'LEVO A MINHA ___ NA MOCHILA PARA ESCOVAR NA ESCOLA!',
        'COLOCO O CREME DENTAL EM CIMA DA ___!'
      ],
      sentenceBefore: 'EU USO A ',
      sentenceAfter: ' PARA LIMPAR OS DENTES.',
      svg: [
        '<svg viewBox="0 0 120 120" width="100%" height="100%">',
        '          <rect x="12" y="64" width="96" height="16" rx="8" fill="#FF7043" stroke="#BF360C" stroke-width="4"/>',
        '          <rect x="18" y="42" width="36" height="22" rx="4" fill="#E0F7FA" stroke="#00838F" stroke-width="4"/>',
        '          <line x1="26" y1="42" x2="26" y2="64" stroke="#00838F" stroke-width="3"/>',
        '          <line x1="36" y1="42" x2="36" y2="64" stroke="#00838F" stroke-width="3"/>',
        '          <line x1="46" y1="42" x2="46" y2="64" stroke="#00838F" stroke-width="3"/>',
        '          <path d="M20 40 Q36 24 52 40 Z" fill="#4DD0E1" stroke="#00838F" stroke-width="3"/>',
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
        'MOSTRAMOS ELE QUANDO TIRAMOS UMA FOTO BEM BONITA!',
        'QUANDO CONTAMOS UMA PIADA ENGRAÇADA, ELE APARECE NA HORA!',
        'DENTES BEM ESCOVADOS DEIXAM ELE SUPER SAUDÁVEL.',
        'É UM JEITO CARINHOSO DE CUMPRIMENTAR OS NOSSOS AMIGOS.',
        'QUANDO ESTAMOS ALEGRES, NOSSA BOCA ABRE UM BEM GRANDE!',
        'O DENTISTA FICA ORGULHOSO QUANDO VÊ ELE BEM CUIDADO!'
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
        '          <circle cx="60" cy="60" r="46" fill="#FFD54F" stroke="#F57F17" stroke-width="5"/>',
        '          <circle cx="42" cy="46" r="6" fill="#3E2723"/>',
        '          <circle cx="78" cy="46" r="6" fill="#3E2723"/>',
        '          <path d="M30 64 Q60 98 90 64 Z" fill="#FFFFFF" stroke="#D84315" stroke-width="4"/>',
        '          <line x1="34" y1="74" x2="86" y2="74" stroke="#B0BEC5" stroke-width="3"/>',
        '          <line x1="60" y1="64" x2="60" y2="82" stroke="#B0BEC5" stroke-width="3"/>',
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
        'O DENTISTA ENSINA A PASSAR ELE ENTRE CADA DENTE.',
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
        '          <rect x="28" y="28" width="56" height="68" rx="14" fill="#66BB6A" stroke="#1B5E20" stroke-width="5"/>',
        '          <circle cx="56" cy="64" r="16" fill="#FFFFFF" stroke="#1B5E20" stroke-width="4"/>',
        '          <path d="M72 34 C95 20 108 48 92 68 C82 80 96 96 110 90" fill="none" stroke="#00ACC1" stroke-width="5" stroke-linecap="round"/>',
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
      clue: 'USAMOS ELA PARA ENXAGUAR A BOCA DEPOIS DE ESCOVAR.',
      clues: [
        'USAMOS ELA PARA ENXAGUAR A BOCA DEPOIS DE ESCOVAR.',
        'NÃO TEM COR, NÃO TEM CHEIRO E FAZ PASSAR A NOSSA SEDE!',
        'SAI DA TORNEIRA DA PIA PARA LAVAR A NOSSA ESCOVA.',
        'FAZEMOS BOCHECHO COM ELA PARA TIRAR A ESPUMA DA PASTA.',
        'BEBER ELA TODOS OS DIAS FAZ MUITO BEM PARA A SAÚDE!',
        'FECHAMOS A TORNEIRA ENQUANTO ESCOVAMOS PARA ECONOMIZAR ELA.',
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
        '          <path d="M60 14 C60 14 24 60 24 82 C24 102 40 110 60 110 C80 110 96 102 96 82 C96 60 60 14 60 14 Z" fill="#29B6F6" stroke="#01579B" stroke-width="5"/>',
        '          <path d="M40 78 Q38 62 50 50" fill="none" stroke="#E1F5FE" stroke-width="6" stroke-linecap="round"/>',
        '          <circle cx="50" cy="80" r="4" fill="#01579B"/>',
        '          <circle cx="70" cy="80" r="4" fill="#01579B"/>',
        '          <path d="M52 90 Q60 96 68 90" fill="none" stroke="#01579B" stroke-width="4" stroke-linecap="round"/>',
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
      clue: 'BICHINHO QUE APARECE NOS DENTES SE NÃO ESCOVAR APÓS COMER.',
      clues: [
        'BICHINHO QUE APARECE NOS DENTES SE NÃO ESCOVAR APÓS COMER.',
        'GOSTA DE RESTINHOS DE DOCE QUE FICAM ESQUECIDOS NO DENTE.',
        'PODE FAZER UM BURAQUINHO NO DENTE SE A GENTE NÃO CUIDAR.',
        'VAI EMBORA CORRENDO QUANDO USAMOS A ESCOVA, A PASTA E O FIO!',
        'FAZ O DENTE DOER QUANDO ESQUECEMOS DA HIGIENE BUCAL.',
        'O DENTISTA AJUDA A TIRAR ELA PARA O DENTE FICAR BOM DE NOVO.',
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
        '          <circle cx="60" cy="62" r="34" fill="#AB47BC" stroke="#4A148C" stroke-width="5"/>',
        '          <circle cx="48" cy="54" r="7" fill="#FFFFFF"/>',
        '          <circle cx="72" cy="54" r="7" fill="#FFFFFF"/>',
        '          <circle cx="48" cy="54" r="3" fill="#000000"/>',
        '          <circle cx="72" cy="54" r="3" fill="#000000"/>',
        '          <path d="M44 76 Q60 66 76 76" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>',
        '          <path d="M60 16 L60 28 M24 36 L34 44 M96 36 L86 44 M18 70 L30 68 M102 70 L90 68" stroke="#7B1FA2" stroke-width="6" stroke-linecap="round"/>',
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
        'MORA DENTRO DA BOCA E AJUDA A GENTE A FALAR E ENGOLIR.',
        'É ROSINHA, SE MEXE BASTANTE E TAMBÉM PRECISA SER ESCOVADA!',
        'SENTE SE A COMIDA ESTÁ QUENTE OU SE O SORVETE ESTÁ GELADO.',
        'NO FINAL DA ESCOVAÇÃO, PASSAMOS A ESCOVA NELA DE LEVE.',
        'AJUDA A MISTURAR A COMIDA ENQUANTO ESTAMOS MASTIGANDO.',
        'QUANDO TOMAMOS SORVETE COLORIDO, ELA FICA PINTADA!',
        'FICA BEM LIMPINHA QUANDO ESCOVAMOS ELA ATÉ O FINAL.'
      ],
      sentence: 'SENTIMOS O SABOR DOS ALIMENTOS COM A ___!',
      sentences: [
        'SENTIMOS O SABOR DOS ALIMENTOS COM A ___!',
        'NO FINAL DA ESCOVAÇÃO, TAMBÉM LIMPAMOS A NOSSA ___.',
        'A ___ AJUDA A GENTE A FALAR TODAS AS PALAVRAS!',
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
        '          <path d="M22 36 Q60 28 98 36" fill="none" stroke="#B71C1C" stroke-width="8" stroke-linecap="round"/>',
        '          <path d="M32 36 L32 68 C32 94 88 94 88 68 L88 36 Z" fill="#FF80AB" stroke="#C2185B" stroke-width="5"/>',
        '          <line x1="60" y1="40" x2="60" y2="76" stroke="#C2185B" stroke-width="4" stroke-linecap="round"/>',
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
        'PODE FICAR VERMELHA E DOER SE A GENTE NÃO USAR O FIO DENTAL.',
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
        '          <path d="M14 58 C14 30 106 30 106 58 L106 72 C92 60 80 60 72 72 C64 60 56 60 48 72 C40 60 28 60 14 72 Z" fill="#F48FB1" stroke="#AD1457" stroke-width="5"/>',
        '          <rect x="24" y="64" width="20" height="26" rx="8" fill="#FFFFFF" stroke="#0288D1" stroke-width="4"/>',
        '          <rect x="50" y="64" width="20" height="26" rx="8" fill="#FFFFFF" stroke="#0288D1" stroke-width="4"/>',
        '          <rect x="76" y="64" width="20" height="26" rx="8" fill="#FFFFFF" stroke="#0288D1" stroke-width="4"/>',
        '        </svg>'
      ].join('\n')
    }
  ];

  /* ----------------------------------------------------------------------
     3. SVGs base da interface (mantidos separados de SaudeEscola.SVGs)
     ---------------------------------------------------------------------- */
  var SVGS = {
    SOUND_ON: [
      '',
      '      <svg viewBox="0 0 40 40" aria-hidden="true">',
      '        <rect x="4" y="14" width="9" height="12" rx="3" fill="#FFB300" stroke="#E65100" stroke-width="2.8"/>',
      '        <polygon points="13,14 24,6 24,34 13,26" fill="#FFD54F" stroke="#E65100" stroke-width="2.8" stroke-linejoin="round"/>',
      '        <path d="M29 13 Q34 20 29 27" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>',
      '        <path d="M33 8 Q40 20 33 32" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>',
      '      </svg>',
      '    '
    ].join('\n'),

    SOUND_OFF: [
      '',
      '      <svg viewBox="0 0 40 40" aria-hidden="true">',
      '        <rect x="4" y="14" width="9" height="12" rx="3" fill="#B0BEC5" stroke="#455A64" stroke-width="2.8"/>',
      '        <polygon points="13,14 24,6 24,34 13,26" fill="#CFD8DC" stroke="#455A64" stroke-width="2.8" stroke-linejoin="round"/>',
      '        <path d="M29 14 L37 26 M37 14 L29 26" fill="none" stroke="#FF5252" stroke-width="4" stroke-linecap="round"/>',
      '      </svg>',
      '    '
    ].join('\n'),

    PLAY_ICON: [
      '',
      '      <span style="display:inline-flex;align-items:center;">',
      '        <svg viewBox="0 0 40 40" aria-hidden="true">',
      '          <circle cx="20" cy="20" r="16" fill="#FFF176" stroke="#F57F17" stroke-width="3"/>',
      '          <polygon points="16,12 29,20 16,28" fill="#2E7D32" stroke="#1B5E20" stroke-width="2" stroke-linejoin="round"/>',
      '        </svg>',
      '      </span>',
      '    '
    ].join('\n'),

    REPLAY_ICON: [
      '',
      '      <span style="display:inline-flex;align-items:center;">',
      '        <svg viewBox="0 0 40 40" aria-hidden="true">',
      '          <path d="M9 17 A12 12 0 0 1 30 12" fill="none" stroke="#FFF176" stroke-width="4.5" stroke-linecap="round"/>',
      '          <polygon points="32,5 35,16 24,15" fill="#FFF176" stroke="#F57F17" stroke-width="1.8" stroke-linejoin="round"/>',
      '          <path d="M31 23 A12 12 0 0 1 10 28" fill="none" stroke="#80DEEA" stroke-width="4.5" stroke-linecap="round"/>',
      '          <polygon points="8,35 5,24 16,25" fill="#80DEEA" stroke="#00838F" stroke-width="1.8" stroke-linecap="round"/>',
      '        </svg>',
      '      </span>',
      '    '
    ].join('\n'),

    CARD_TOOTH: [
      '',
      '      <svg viewBox="0 0 60 60" aria-hidden="true">',
      '        <path d="M16 10 C8 10 7 28 12 39 C15 46 16 54 22 54 C26 54 27 43 30 43 C33 43 34 54 38 54 C44 54 45 46 48 39 C53 28 52 10 44 10 C37 10 34 15 30 15 C26 15 23 10 16 10 Z" fill="#FFFFFF" stroke="#01579B" stroke-width="3.5"/>',
      '        <circle cx="23" cy="26" r="3" fill="#01579B"/>',
      '        <circle cx="37" cy="26" r="3" fill="#01579B"/>',
      '        <ellipse cx="18" cy="31" rx="3" ry="1.8" fill="#FF80AB"/>',
      '        <ellipse cx="42" cy="31" rx="3" ry="1.8" fill="#FF80AB"/>',
      '        <path d="M24 33 Q30 39 36 33" fill="none" stroke="#01579B" stroke-width="3" stroke-linecap="round"/>',
      '      </svg>',
      '    '
    ].join('\n'),

    SMALL_STAR: [
      '',
      '      <svg viewBox="0 0 36 36" aria-hidden="true">',
      '        <polygon points="18,2 23,12 34,13.5 26,21 28,32 18,26.5 8,32 10,21 2,13.5 13,12" fill="#FFD54F" stroke="#F57F17" stroke-width="2.5" stroke-linejoin="round"/>',
      '        <polygon points="18,6 21.5,13.5 29.5,14.5 23.5,20 25,28 18,24" fill="#FFF59D"/>',
      '      </svg>',
      '    '
    ].join('\n'),

    MASCOT_HERO: [
      '',
      '        <svg viewBox="0 0 140 140" width="100%" height="100%">',
      '          <!-- Capa de Super-Herói do Dentinho -->',
      '          <path d="M26 55 L10 118 L130 118 L114 55 Z" fill="#FF7043" stroke="#D84315" stroke-width="4"/>',
      '          <!-- Corpo do Dente -->',
      '          <path d="M38 26 C22 26 20 62 30 86 C36 102 38 122 50 122 C58 122 62 98 70 98 C78 98 82 122 90 122 C102 122 104 102 110 86 C120 62 118 26 102 26 C86 26 80 36 70 36 C60 36 54 26 38 26 Z" fill="#FFFFFF" stroke="#0288D1" stroke-width="5"/>',
      '          <!-- Olhos Alegres -->',
      '          <circle cx="52" cy="58" r="6.5" fill="#01579B"/>',
      '          <circle cx="88" cy="58" r="6.5" fill="#01579B"/>',
      '          <circle cx="50" cy="56" r="2.2" fill="#FFFFFF"/>',
      '          <circle cx="86" cy="56" r="2.2" fill="#FFFFFF"/>',
      '          <!-- Bochechas Rosadas -->',
      '          <ellipse cx="40" cy="68" rx="6" ry="3.5" fill="#FF80AB"/>',
      '          <ellipse cx="100" cy="68" rx="6" ry="3.5" fill="#FF80AB"/>',
      '          <!-- Sorriso -->',
      '          <path d="M54 72 Q70 88 86 72" fill="none" stroke="#01579B" stroke-width="5" stroke-linecap="round"/>',
      '          <!-- Brilhos -->',
      '          <path d="M112 18 L118 6 M122 26 L134 22 M104 12 L100 2" stroke="#FFD54F" stroke-width="4.5" stroke-linecap="round"/>',
      '        </svg>',
      '      '
    ].join('\n'),

    KEY_BACKSPACE: [
      '',
      '        <span style="display:inline-flex;align-items:center;">',
      '          <svg viewBox="0 0 40 40" aria-hidden="true">',
      '            <path d="M14 10 L5 20 L14 30 L34 30 C35.5 30 37 28.5 37 27 L37 13 C37 11.5 35.5 10 34 10 Z" fill="#FFCDD2" stroke="#FFFFFF" stroke-width="2.8" stroke-linejoin="round"/>',
      '            <path d="M19 15 L29 25 M29 15 L19 25" stroke="#B71C1C" stroke-width="3.5" stroke-linecap="round"/>',
      '          </svg>',
      '        </span>',
      '        <span>APAGAR</span>',
      '      '
    ].join('\n'),

    KEY_VERIFY: [
      '',
      '        <span style="display:inline-flex;align-items:center;">',
      '          <svg viewBox="0 0 40 40" aria-hidden="true">',
      '            <circle cx="20" cy="20" r="16" fill="#C8E6C9" stroke="#FFFFFF" stroke-width="2.8"/>',
      '            <path d="M12 20.5 L18 26.5 L29 14.5" fill="none" stroke="#1B5E20" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
      '          </svg>',
      '        </span>',
      '        <span>VERIFICAR</span>',
      '      '
    ].join('\n'),

    MINI_BACKSPACE: [
      '',
      '        <svg viewBox="0 0 40 40" aria-hidden="true">',
      '          <path d="M14 10 L5 20 L14 30 L34 30 C35.5 30 37 28.5 37 27 L37 13 C37 11.5 35.5 10 34 10 Z" fill="#FFCDD2" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>',
      '          <path d="M19 15 L29 25 M29 15 L19 25" stroke="#B71C1C" stroke-width="3.5" stroke-linecap="round"/>',
      '        </svg>',
      '        <span>APAGAR</span>',
      '      '
    ].join('\n')
  };

  /**
   * Retorna o SVG da medalha de podio para o ranking (1o, 2o ou 3o lugar).
   */
  function getMedalSvg(position) {
    if (position === 1) {
      return [
        '',
        '          <svg viewBox="0 0 44 44" aria-hidden="true">',
        '            <polygon points="13,3 22,18 16,18 8,3" fill="#EF5350"/>',
        '            <polygon points="31,3 22,18 28,18 36,3" fill="#E53935"/>',
        '            <circle cx="22" cy="27" r="13" fill="#FFEE58" stroke="#F57F17" stroke-width="3"/>',
        '            <polygon points="22,18 24.8,23.5 31,24.4 26.5,28.6 27.6,34.6 22,31.7 16.4,34.6 17.5,28.6 13,24.4 19.2,23.5" fill="#FFFDE7" stroke="#F57F17" stroke-width="1.5" stroke-linejoin="round"/>',
        '          </svg>',
        '        '
      ].join('\n');
    } else if (position === 2) {
      return [
        '',
        '          <svg viewBox="0 0 44 44" aria-hidden="true">',
        '            <polygon points="13,3 22,18 16,18 8,3" fill="#42A5F5"/>',
        '            <polygon points="31,3 22,18 28,18 36,3" fill="#1E88E5"/>',
        '            <circle cx="22" cy="27" r="13" fill="#ECEFF1" stroke="#546E7A" stroke-width="3"/>',
        '            <polygon points="22,18 24.8,23.5 31,24.4 26.5,28.6 27.6,34.6 22,31.7 16.4,34.6 17.5,28.6 13,24.4 19.2,23.5" fill="#FFFFFF" stroke="#546E7A" stroke-width="1.5" stroke-linejoin="round"/>',
        '          </svg>',
        '        '
      ].join('\n');
    } else if (position === 3) {
      return [
        '',
        '          <svg viewBox="0 0 44 44" aria-hidden="true">',
        '            <polygon points="13,3 22,18 16,18 8,3" fill="#66BB6A"/>',
        '            <polygon points="31,3 22,18 28,18 36,3" fill="#43A047"/>',
        '            <circle cx="22" cy="27" r="13" fill="#FFCC80" stroke="#BF360C" stroke-width="3"/>',
        '            <polygon points="22,18 24.8,23.5 31,24.4 26.5,28.6 27.6,34.6 22,31.7 16.4,34.6 17.5,28.6 13,24.4 19.2,23.5" fill="#FFF3E0" stroke="#BF360C" stroke-width="1.5" stroke-linejoin="round"/>',
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
   * Normaliza defensivamente uma palavra da semana para uso uniforme nas Fases 1, 2 e 3.
   */
  function normalizeWeeklyItem(item, index, storage) {
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

    var dicaOriginal = String(
      item.dicaOriginal !== undefined ? item.dicaOriginal : (item.dica || '')
    ).trim().toUpperCase();

    var clue = String(
      item.clue || dicaOriginal || 'JUNTE OS PEDACINHOS PARA FORMAR A PALAVRA!'
    ).trim().toUpperCase();

    var clues = Array.isArray(item.clues) && item.clues.length > 0
      ? item.clues.slice()
      : [clue];

    var silabaInicial = String(
      item.silabaInicial || syllables[0] || rawWord.slice(0, 2)
    ).trim().toUpperCase();

    var sentence = String(item.sentence || item.frase || '').trim().toUpperCase();
    if (!sentence) {
      sentence = dicaOriginal
        ? ('DICA: ' + dicaOriginal + ' — ESCREVA A PALAVRA: ___!')
        : 'PALAVRA DA SEMANA! ESCREVA NO TECLADO: ___!';
    } else if (sentence.indexOf('___') === -1) {
      sentence = sentence + ' (___)';
    }

    var sentences = Array.isArray(item.sentences) && item.sentences.length > 0
      ? item.sentences.slice()
      : [sentence];

    var svg = item.svg || (storage && storage.SVGs && storage.SVGs.ILUSTRACAO_SEMANA) || '';

    return {
      id: item.id ? String(item.id) : ('WEEKLY_' + index + '_' + plain),
      word: rawWord,
      plain: plain,
      syllables: syllables,
      intruders: intruders,
      emoji: '',
      clue: clue,
      clues: clues,
      dicaOriginal: dicaOriginal,
      silabaInicial: silabaInicial,
      sentence: sentence,
      sentences: sentences,
      sentenceBefore: '',
      sentenceAfter: '',
      svg: svg,
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
        var normalized = [];
        for (var i = 0; i < weeklyBank.length; i += 1) {
          var normItem = normalizeWeeklyItem(weeklyBank[i], i, storage);
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
  var queueMemoryCache = {};

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
