(function (global) {
  'use strict';

  /**
   * Servico de persistencia offline da aplicacao (v2).
   * Isolado na chave 'saudeEscola_v2_dados' para nao interferir nas chaves da v1.x.
   */
  var STORAGE_KEY = 'saudeEscola_v2_dados';
  var MAX_PALAVRAS_SEMANA = 12;
  var MAX_SESSOES = 500;
  var MAX_ANOTACOES = 200;
  var MAX_ANOTACAO_TEXTO = 1000;
  var MAX_ANOTACAO_ALUNO_NOME = 60;

  var POOL_SILABAS_AUXILIAR = [
    'PA', 'TO', 'LA', 'MI', 'BO', 'CA', 'RE', 'SU',
    'NA', 'DE', 'FI', 'LU', 'GO', 'VA', 'ME', 'RO',
    'CHU', 'LHA', 'NHA', 'SO', 'PE', 'BI'
  ];

  var POOL_SILABAS_RESERVA = ['ZA', 'KI', 'VU', 'TE', 'PO', 'RI'];

  // Fallback em memoria caso o navegador bloqueie acesso ao localStorage
  var memoriaFallback = null;
  var contadorId = 0;

  /**
   * Ilustracoes vetoriais infantis usadas no modo Palavras da Semana.
   */
  var SVGs = {
    CARD_BACK_SEMANA: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">',
      '  <circle cx="60" cy="60" r="54" fill="#E0F2FE" stroke="#7DD3FC" stroke-width="2.5" stroke-dasharray="6 4" />',
      '  <polygon points="60,11 62.7,17.7 69.8,18.2 64.4,22.9 66.1,29.9 60,26.2 53.9,29.9 55.6,22.9 50.2,18.2 57.3,17.7" fill="#FACC15" stroke="#D97706" stroke-width="2" stroke-linejoin="round" />',
      '  <path d="M35 24 L37 28 L41 30 L37 32 L35 36 L33 32 L29 30 L33 28 Z" fill="#FB7185" />',
      '  <path d="M87 26 L88.8 29.5 L92.5 31 L88.8 32.5 L87 36 L85.2 32.5 L81.5 31 L85.2 29.5 Z" fill="#34D399" />',
      '  <rect x="17" y="45" width="86" height="52" rx="10" fill="#0284C7" stroke="#1E3A5F" stroke-width="2.5" />',
      '  <path d="M56 93 L64 93 L64 108 L60 103 L56 108 Z" fill="#F43F5E" stroke="#1E3A5F" stroke-width="2" stroke-linejoin="round" />',
      '  <path d="M22 44 Q41 38 60 47 Q79 38 98 44 L98 89 Q79 83 60 91 Q41 83 22 89 Z" fill="#FFFDF7" stroke="#1E3A5F" stroke-width="2.5" stroke-linejoin="round" />',
      '  <line x1="60" y1="47" x2="60" y2="91" stroke="#BAE6FD" stroke-width="2.5" stroke-linecap="round" />',
      '  <path d="M29 54 Q39 51 50 55" fill="none" stroke="#BAE6FD" stroke-width="2.2" stroke-linecap="round" />',
      '  <path d="M70 55 Q81 51 91 54" fill="none" stroke="#BAE6FD" stroke-width="2.2" stroke-linecap="round" />',
      '  <circle cx="43" cy="66" r="3.4" fill="#1E293B" />',
      '  <circle cx="44.2" cy="64.8" r="1.1" fill="#FFFFFF" />',
      '  <circle cx="77" cy="66" r="3.4" fill="#1E293B" />',
      '  <circle cx="78.2" cy="64.8" r="1.1" fill="#FFFFFF" />',
      '  <ellipse cx="36" cy="72" rx="4.2" ry="2.6" fill="#FDA4AF" />',
      '  <ellipse cx="84" cy="72" rx="4.2" ry="2.6" fill="#FDA4AF" />',
      '  <path d="M52 74 Q60 82 68 74" fill="none" stroke="#1E293B" stroke-width="2.6" stroke-linecap="round" />',
      '</svg>'
    ].join('\n'),

    ILUSTRACAO_SEMANA: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">',
      '  <circle cx="60" cy="60" r="54" fill="#FEF9C3" stroke="#FDE047" stroke-width="2.5" />',
      '  <polygon points="94,16 95.8,20.3 100.4,20.6 96.9,23.6 98,28.1 94,25.7 90,28.1 91.1,23.6 87.6,20.6 92.2,20.3" fill="#FACC15" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round" />',
      '  <path d="M22 22 L23.8 25.6 L27.5 27.2 L23.8 28.8 L22 32.4 L20.2 28.8 L16.5 27.2 L20.2 25.6 Z" fill="#38BDF8" />',
      '  <rect x="24" y="25" width="58" height="72" rx="9" fill="#38BDF8" stroke="#1E3A5F" stroke-width="2.5" />',
      '  <rect x="33" y="29" width="44" height="64" rx="5" fill="#FFFFFF" stroke="#1E3A5F" stroke-width="2" />',
      '  <line x1="41" y1="29" x2="41" y2="93" stroke="#FDA4AF" stroke-width="1.8" />',
      '  <line x1="35" y1="42" x2="75" y2="42" stroke="#DBEAFE" stroke-width="1.8" />',
      '  <line x1="35" y1="53" x2="75" y2="53" stroke="#DBEAFE" stroke-width="1.8" />',
      '  <line x1="35" y1="80" x2="75" y2="80" stroke="#DBEAFE" stroke-width="1.8" />',
      '  <rect x="19" y="36" width="11" height="6" rx="3" fill="#F43F5E" stroke="#1E3A5F" stroke-width="1.8" />',
      '  <rect x="19" y="50" width="11" height="6" rx="3" fill="#FACC15" stroke="#1E3A5F" stroke-width="1.8" />',
      '  <rect x="19" y="64" width="11" height="6" rx="3" fill="#34D399" stroke="#1E3A5F" stroke-width="1.8" />',
      '  <rect x="19" y="78" width="11" height="6" rx="3" fill="#A78BFA" stroke="#1E3A5F" stroke-width="1.8" />',
      '  <circle cx="49" cy="60" r="2.8" fill="#1E293B" />',
      '  <circle cx="49.9" cy="59" r="0.9" fill="#FFFFFF" />',
      '  <circle cx="65" cy="60" r="2.8" fill="#1E293B" />',
      '  <circle cx="65.9" cy="59" r="0.9" fill="#FFFFFF" />',
      '  <ellipse cx="44" cy="65" rx="3.4" ry="2" fill="#FDA4AF" />',
      '  <ellipse cx="70" cy="65" rx="3.4" ry="2" fill="#FDA4AF" />',
      '  <path d="M52 67 Q57 73 62 67" fill="none" stroke="#1E293B" stroke-width="2.2" stroke-linecap="round" />',
      '  <g transform="rotate(24 91 66)">',
      '    <rect x="84" y="34" width="14" height="9" rx="3" fill="#FB7185" stroke="#1E3A5F" stroke-width="2" />',
      '    <rect x="84" y="42" width="14" height="6" fill="#CBD5E1" stroke="#1E3A5F" stroke-width="2" />',
      '    <rect x="84" y="48" width="14" height="34" fill="#FACC15" stroke="#1E3A5F" stroke-width="2" />',
      '    <line x1="89" y1="49" x2="89" y2="81" stroke="#EAB308" stroke-width="2" />',
      '    <polygon points="84,82 98,82 91,96" fill="#FDE68A" stroke="#1E3A5F" stroke-width="2" stroke-linejoin="round" />',
      '    <polygon points="88.5,91 93.5,91 91,96" fill="#334155" />',
      '  </g>',
      '  <path d="M104 88 L105.5 91.5 L109 93 L105.5 94.5 L104 98 L102.5 94.5 L99 93 L102.5 91.5 Z" fill="#A78BFA" />',
      '</svg>'
    ].join('\n'),

    MINI_ESTRELA_DICA: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">',
      '  <circle cx="20" cy="21" r="17" fill="#FEF3C7" />',
      '  <line x1="20" y1="2.5" x2="20" y2="5.5" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" />',
      '  <line x1="9" y1="6.5" x2="11.2" y2="8.8" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" />',
      '  <line x1="31" y1="6.5" x2="28.8" y2="8.8" stroke="#FB7185" stroke-width="2" stroke-linecap="round" />',
      '  <polygon points="20,7.5 23.6,16 32.8,16.8 25.9,22.9 27.9,31.9 20,27.2 12.1,31.9 14.1,22.9 7.2,16.8 16.4,16" fill="#FACC15" stroke="#D97706" stroke-width="2" stroke-linejoin="round" />',
      '  <circle cx="16.8" cy="20" r="1.4" fill="#1E293B" />',
      '  <circle cx="23.2" cy="20" r="1.4" fill="#1E293B" />',
      '  <ellipse cx="14.5" cy="22.5" rx="1.6" ry="1" fill="#FDA4AF" />',
      '  <ellipse cx="25.5" cy="22.5" rx="1.6" ry="1" fill="#FDA4AF" />',
      '  <path d="M17.5 23 Q20 25.5 22.5 23" fill="none" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round" />',
      '</svg>'
    ].join('\n')
  };

  /**
   * Gera identificadores unicos mesmo em insercoes em lote no mesmo milissegundo.
   */
  function gerarId(prefixo) {
    contadorId += 1;
    var tempo = Date.now().toString(36);
    var aleatorio = Math.random().toString(36).slice(2, 6);
    return prefixo + '_' + tempo + '_' + contadorId.toString(36) + aleatorio;
  }

  /**
   * Cria uma nova copia da estrutura padrao do banco local.
   */
  function criarEstruturaPadrao() {
    return {
      versao: 2,
      config: {
        modo: 'aula',
        palavrasSemanaAtivo: false,
        fase1ModoSemana: 'dica'
      },
      turma: [],
      palavrasSemana: [],
      sessoes: [],
      anotacoes: []
    };
  }

  /**
   * Remove scripts, tags HTML e caracteres de controle para sanitizacao contra XSS.
   */
  function sanitizarTextoSeguro(valor, maxLen, preservarQuebras) {
    var limite = typeof maxLen === 'number' && maxLen > 0 ? Math.floor(maxLen) : 1000;
    var texto = String(valor == null ? '' : valor)
      .replace(/\r\n?/g, '\n')
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

    if (preservarQuebras) {
      var linhas = texto.split('\n').map(function (linha) {
        return linha.replace(/[ \t]+/g, ' ').trim();
      });
      texto = linhas.join('\n').replace(/\n{3,}/g, '\n\n');
    } else {
      texto = texto.replace(/\s+/g, ' ');
    }

    return texto.trim().slice(0, limite);
  }

  /**
   * Normaliza texto para comparacao de chaves (minusculo, sem acento e espacos limpos).
   */
  function normalizarChave(texto) {
    return String(texto == null ? '' : texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normaliza texto para forma pura em maiusculas apenas com letras [A-Z].
   */
  function normalizarPlain(texto) {
    return String(texto == null ? '' : texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
  }

  /**
   * Retorna data local no formato 'YYYY-MM-DD'.
   */
  function getDataLocalISO(dateObj) {
    var ehDateValido = Object.prototype.toString.call(dateObj) === '[object Date]' &&
      !isNaN(dateObj.getTime());
    var d = ehDateValido ? dateObj : new Date();
    var ano = String(d.getFullYear());
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return ano + '-' + mes + '-' + dia;
  }

  function clonarAluno(aluno) {
    return {
      id: aluno.id,
      nome: aluno.nome,
      chave: aluno.chave
    };
  }

  function clonarPalavra(item) {
    return {
      id: item.id,
      palavra: item.palavra,
      plain: item.plain,
      silabasRaw: item.silabasRaw,
      silabas: item.silabas.slice(),
      dica: item.dica,
      frase: item.frase
    };
  }

  function sanitizarNumeroNaoNegativo(valor) {
    var num = Number(valor);
    if (!isFinite(num) || num < 0) {
      return 0;
    }
    return Math.floor(num);
  }

  function sanitizarListaTextos(lista, limite) {
    var limpa = [];
    if (!Array.isArray(lista)) {
      return limpa;
    }
    var max = typeof limite === 'number' && limite > 0 ? limite : 10;
    for (var i = 0; i < lista.length && limpa.length < max; i += 1) {
      var item = String(lista[i] == null ? '' : lista[i]).trim();
      if (item && limpa.indexOf(item) === -1) {
        limpa.push(item);
      }
    }
    return limpa;
  }

  function sanitizarMapaContagem(mapa) {
    var limpo = {};
    if (!mapa || typeof mapa !== 'object' || Array.isArray(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    for (var i = 0; i < chaves.length; i += 1) {
      var k = chaves[i];
      var bruto = mapa[k];
      if (!k || bruto === null || bruto === undefined || bruto === '') {
        continue;
      }
      var num = Number(bruto);
      if (isFinite(num) && num >= 0) {
        limpo[k] = Math.floor(num);
      }
    }
    return limpo;
  }

  /**
   * Preserva tanto objetos detalhados do Analytics quanto mapas numericos simples.
   */
  function sanitizarErrosSilabas(mapa) {
    var limpo = {};
    if (!mapa || typeof mapa !== 'object' || Array.isArray(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    for (var i = 0; i < chaves.length; i += 1) {
      var k = chaves[i];
      var bruto = mapa[k];
      if (!k || bruto === null || bruto === undefined || bruto === '') {
        continue;
      }
      if (typeof bruto === 'object' && !Array.isArray(bruto)) {
        limpo[k] = {
          count: sanitizarNumeroNaoNegativo(bruto.count),
          palavras: sanitizarListaTextos(bruto.palavras, 5),
          confusoes: sanitizarMapaContagem(bruto.confusoes)
        };
      } else {
        var num = Number(bruto);
        if (isFinite(num) && num >= 0) {
          limpo[k] = {
            count: Math.floor(num),
            palavras: [],
            confusoes: {}
          };
        }
      }
    }
    return limpo;
  }

  function sanitizarErrosOrtograficos(mapa) {
    var limpo = {};
    if (!mapa || typeof mapa !== 'object' || Array.isArray(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    for (var i = 0; i < chaves.length; i += 1) {
      var k = chaves[i];
      var bruto = mapa[k];
      if (!k || bruto === null || bruto === undefined || bruto === '') {
        continue;
      }
      if (typeof bruto === 'object' && !Array.isArray(bruto)) {
        limpo[k] = {
          codigo: String(bruto.codigo || k),
          label: String(bruto.label || k),
          count: sanitizarNumeroNaoNegativo(bruto.count),
          exemplos: sanitizarListaTextos(bruto.exemplos, 5)
        };
      } else {
        var num = Number(bruto);
        if (isFinite(num) && num >= 0) {
          limpo[k] = {
            codigo: String(k),
            label: String(k),
            count: Math.floor(num),
            exemplos: []
          };
        }
      }
    }
    return limpo;
  }

  function sanitizarPalavrasStats(mapa) {
    var limpo = {};
    if (!mapa || typeof mapa !== 'object' || Array.isArray(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    for (var i = 0; i < chaves.length; i += 1) {
      var k = chaves[i];
      var bruto = mapa[k];
      if (!k || !bruto || typeof bruto !== 'object' || Array.isArray(bruto)) {
        continue;
      }
      limpo[k] = {
        tentativas: sanitizarNumeroNaoNegativo(bruto.tentativas),
        acertos: sanitizarNumeroNaoNegativo(bruto.acertos),
        erros: sanitizarNumeroNaoNegativo(bruto.erros)
      };
    }
    return limpo;
  }

  function clonarAnotacao(item) {
    return {
      id: item.id,
      dataISO: item.dataISO,
      alunoId: item.alunoId || null,
      alunoNome: item.alunoNome || '',
      texto: item.texto,
      criadaEm: item.criadaEm,
      atualizadaEm: item.atualizadaEm
    };
  }

  function sanitizarAnotacao(entrada) {
    var raw = entrada && typeof entrada === 'object' ? entrada : {};
    var textoLimpo = sanitizarTextoSeguro(raw.texto, MAX_ANOTACAO_TEXTO, true);
    if (!textoLimpo) {
      return null;
    }

    var criadaEm = typeof raw.criadaEm === 'number' && isFinite(raw.criadaEm) && raw.criadaEm > 0
      ? Math.floor(raw.criadaEm)
      : Date.now();
    var atualizadaEm = typeof raw.atualizadaEm === 'number' && isFinite(raw.atualizadaEm) && raw.atualizadaEm > 0
      ? Math.floor(raw.atualizadaEm)
      : criadaEm;

    var dataValida = typeof raw.dataISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.dataISO.trim())
      ? raw.dataISO.trim()
      : getDataLocalISO(new Date(criadaEm));

    var alunoIdBruto = raw.alunoId !== undefined && raw.alunoId !== null
      ? sanitizarTextoSeguro(raw.alunoId, 60, false)
      : '';
    var alunoIdLimpo = (alunoIdBruto && alunoIdBruto !== 'TURMA' && alunoIdBruto !== 'TODOS')
      ? alunoIdBruto
      : null;

    var alunoNomeLimpo = alunoIdLimpo || raw.alunoNome
      ? sanitizarTextoSeguro(raw.alunoNome, MAX_ANOTACAO_ALUNO_NOME, false)
      : '';
    if (!alunoIdLimpo && alunoNomeLimpo === 'Turma geral') {
      alunoNomeLimpo = '';
    }

    var idLimpo = raw.id ? sanitizarTextoSeguro(raw.id, 60, false) : '';

    return {
      id: idLimpo || gerarId('ano'),
      dataISO: dataValida,
      alunoId: alunoIdLimpo,
      alunoNome: alunoNomeLimpo,
      texto: textoLimpo,
      criadaEm: criadaEm,
      atualizadaEm: atualizadaEm
    };
  }

  function sanitizarAnotacoes(lista) {
    var limpas = [];
    var idsVistos = {};

    if (typeof lista === 'string') {
      var unica = sanitizarAnotacao({ texto: lista });
      if (unica) {
        limpas.push(unica);
      }
      return limpas;
    }

    if (!Array.isArray(lista)) {
      return limpas;
    }

    for (var i = 0; i < lista.length && limpas.length < MAX_ANOTACOES; i += 1) {
      var item = sanitizarAnotacao(lista[i]);
      if (!item) {
        continue;
      }
      if (idsVistos[item.id]) {
        item.id = gerarId('ano');
      }
      idsVistos[item.id] = true;
      limpas.push(item);
    }

    return limpas;
  }

  /**
   * Sanitiza estatisticas por fase preservando null para sessoes antigas sem esse campo.
   * Na Fase 1, preserva metricas de tempo (v2.1.3+) e contadores legados (v2.1.x).
   */
  function sanitizarFasesStats(mapa) {
    if (!mapa || typeof mapa !== 'object' || Array.isArray(mapa)) {
      return null;
    }
    var chaves = ['fase1', 'fase2', 'fase3'];
    var temAlguma = false;
    var limpo = {};

    for (var i = 0; i < chaves.length; i += 1) {
      var chave = chaves[i];
      var bruto = mapa[chave];
      if (bruto && typeof bruto === 'object' && !Array.isArray(bruto)) {
        temAlguma = true;
        limpo[chave] = {
          tentativas: sanitizarNumeroNaoNegativo(bruto.tentativas),
          acertos: sanitizarNumeroNaoNegativo(bruto.acertos),
          acertosPrimeira: sanitizarNumeroNaoNegativo(bruto.acertosPrimeira)
        };
        if (chave === 'fase1') {
          limpo[chave].tempoSegundos = sanitizarNumeroNaoNegativo(bruto.tempoSegundos);
          limpo[chave].rodadas = sanitizarNumeroNaoNegativo(bruto.rodadas);
        }
      } else {
        limpo[chave] = {
          tentativas: 0,
          acertos: 0,
          acertosPrimeira: 0
        };
        if (chave === 'fase1') {
          limpo[chave].tempoSegundos = 0;
          limpo[chave].rodadas = 0;
        }
      }
    }

    return temAlguma ? limpo : null;
  }

  function clonarSessao(sessao) {
    return {
      id: sessao.id,
      dataISO: sessao.dataISO,
      timestamp: sessao.timestamp,
      finalizadaEm: sessao.finalizadaEm || sessao.timestamp,
      alunoId: sessao.alunoId,
      alunoNome: sessao.alunoNome,
      alunoChave: sessao.alunoChave,
      modoJogo: sessao.modoJogo,
      fontePalavras: sessao.fontePalavras,
      tentativas: sessao.tentativas,
      acertos: sessao.acertos,
      acertosPrimeira: sessao.acertosPrimeira,
      atividadesRegistradas: sanitizarNumeroNaoNegativo(sessao.atividadesRegistradas || sessao.tentativas),
      errosSilabas: sanitizarErrosSilabas(sessao.errosSilabas),
      errosOrtograficos: sanitizarErrosOrtograficos(sessao.errosOrtograficos),
      palavrasStats: sanitizarPalavrasStats(sessao.palavrasStats),
      fasesStats: sanitizarFasesStats(sessao.fasesStats),
      palavrasTrabalhadas: Array.isArray(sessao.palavrasTrabalhadas)
        ? sessao.palavrasTrabalhadas.slice()
        : []
    };
  }

  function sanitizarSessao(entrada) {
    var raw = entrada && typeof entrada === 'object' ? entrada : {};
    var ts = typeof raw.timestamp === 'number' && isFinite(raw.timestamp) && raw.timestamp > 0
      ? raw.timestamp
      : Date.now();
    var fin = typeof raw.finalizadaEm === 'number' && isFinite(raw.finalizadaEm) && raw.finalizadaEm > 0
      ? raw.finalizadaEm
      : ts;

    var dataValida = typeof raw.dataISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.dataISO.trim())
      ? raw.dataISO.trim()
      : getDataLocalISO(new Date(ts));

    var alunoNome = String(raw.alunoNome == null ? '' : raw.alunoNome).replace(/\s+/g, ' ').trim();
    var alunoChave = raw.alunoChave ? normalizarChave(raw.alunoChave) : normalizarChave(alunoNome);
    var palavrasStats = sanitizarPalavrasStats(raw.palavrasStats);

    var palavras = [];
    if (Array.isArray(raw.palavrasTrabalhadas)) {
      for (var i = 0; i < raw.palavrasTrabalhadas.length; i += 1) {
        var pal = String(raw.palavrasTrabalhadas[i] == null ? '' : raw.palavrasTrabalhadas[i]).trim();
        if (pal && palavras.indexOf(pal) === -1) {
          palavras.push(pal);
        }
      }
    } else {
      palavras = Object.keys(palavrasStats);
    }

    var tentativas = sanitizarNumeroNaoNegativo(raw.tentativas);

    return {
      id: raw.id ? String(raw.id) : gerarId('ses'),
      dataISO: dataValida,
      timestamp: ts,
      finalizadaEm: fin,
      alunoId: raw.alunoId ? String(raw.alunoId) : null,
      alunoNome: alunoNome,
      alunoChave: alunoChave,
      modoJogo: String(raw.modoJogo || ''),
      fontePalavras: String(raw.fontePalavras || 'padrao'),
      tentativas: tentativas,
      acertos: sanitizarNumeroNaoNegativo(raw.acertos),
      acertosPrimeira: sanitizarNumeroNaoNegativo(raw.acertosPrimeira),
      atividadesRegistradas: sanitizarNumeroNaoNegativo(
        raw.atividadesRegistradas !== undefined ? raw.atividadesRegistradas : tentativas
      ),
      errosSilabas: sanitizarErrosSilabas(raw.errosSilabas),
      errosOrtograficos: sanitizarErrosOrtograficos(raw.errosOrtograficos),
      palavrasStats: palavrasStats,
      fasesStats: sanitizarFasesStats(raw.fasesStats),
      palavrasTrabalhadas: palavras
    };
  }

  /**
   * Garante schema valido mesmo que o JSON armazenado esteja incompleto ou corrompido.
   */
  function sanitizarDados(bruto) {
    var base = criarEstruturaPadrao();
    if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) {
      return base;
    }

    // Turma
    if (Array.isArray(bruto.turma)) {
      var chavesVistas = {};
      for (var i = 0; i < bruto.turma.length; i += 1) {
        var itemAluno = bruto.turma[i];
        if (!itemAluno || typeof itemAluno !== 'object') {
          continue;
        }
        var nomeLimpo = String(itemAluno.nome == null ? '' : itemAluno.nome).replace(/\s+/g, ' ').trim();
        var chave = normalizarChave(itemAluno.chave || nomeLimpo);
        if (!nomeLimpo || !chave || chavesVistas[chave]) {
          continue;
        }
        chavesVistas[chave] = true;
        base.turma.push({
          id: itemAluno.id ? String(itemAluno.id) : gerarId('alu'),
          nome: nomeLimpo,
          chave: chave
        });
      }
    }

    // Palavras da semana
    if (Array.isArray(bruto.palavrasSemana)) {
      var plainsVistos = {};
      for (var j = 0; j < bruto.palavrasSemana.length && base.palavrasSemana.length < MAX_PALAVRAS_SEMANA; j += 1) {
        var itemPal = bruto.palavrasSemana[j];
        if (!itemPal || typeof itemPal !== 'object') {
          continue;
        }
        var rawSilabas = Array.isArray(itemPal.silabas) && itemPal.silabas.length > 0
          ? itemPal.silabas.join('-')
          : itemPal.silabasRaw;
        var validada = validarDadosPalavra({
          silabasRaw: rawSilabas,
          dica: itemPal.dica,
          frase: itemPal.frase
        });
        if (!validada.ok || plainsVistos[validada.dados.plain]) {
          continue;
        }
        plainsVistos[validada.dados.plain] = true;
        base.palavrasSemana.push({
          id: itemPal.id ? String(itemPal.id) : gerarId('pal'),
          palavra: validada.dados.palavra,
          plain: validada.dados.plain,
          silabasRaw: validada.dados.silabasRaw,
          silabas: validada.dados.silabas,
          dica: validada.dados.dica,
          frase: validada.dados.frase
        });
      }
    }

    // Sessoes (limita aos ultimos 500 registros)
    if (Array.isArray(bruto.sessoes)) {
      var inicio = bruto.sessoes.length > MAX_SESSOES ? bruto.sessoes.length - MAX_SESSOES : 0;
      for (var k = inicio; k < bruto.sessoes.length; k += 1) {
        if (bruto.sessoes[k] && typeof bruto.sessoes[k] === 'object') {
          base.sessoes.push(sanitizarSessao(bruto.sessoes[k]));
        }
      }
    }

    // Anotacoes pedagogicas da professora (retrocompativel com backups sem este campo)
    base.anotacoes = sanitizarAnotacoes(bruto.anotacoes);

    // Configuracao
    if (bruto.config && typeof bruto.config === 'object') {
      base.config.modo = bruto.config.modo === 'livre' ? 'livre' : 'aula';
      base.config.fase1ModoSemana = bruto.config.fase1ModoSemana === 'silaba' ? 'silaba' : 'dica';
      base.config.palavrasSemanaAtivo = Boolean(
        bruto.config.palavrasSemanaAtivo && base.palavrasSemana.length >= 4
      );
    }

    return base;
  }

  /**
   * Lê e valida os dados persistidos no localStorage.
   */
  function carregarDados() {
    var raw = null;
    var storageDisponivel = false;

    try {
      if (global.localStorage) {
        raw = global.localStorage.getItem(STORAGE_KEY);
        storageDisponivel = true;
      }
    } catch (erroStorage) {
      storageDisponivel = false;
    }

    if (storageDisponivel) {
      if (!raw) {
        return criarEstruturaPadrao();
      }
      try {
        var parsed = JSON.parse(raw);
        return sanitizarDados(parsed);
      } catch (erroJson) {
        // Retorna estrutura limpa caso o JSON armazenado esteja corrompido
        return criarEstruturaPadrao();
      }
    }

    if (memoriaFallback) {
      return sanitizarDados(memoriaFallback);
    }
    return criarEstruturaPadrao();
  }

  /**
   * Persiste os dados validados no localStorage.
   */
  function salvarDados(dados) {
    var limpo = sanitizarDados(dados);
    memoriaFallback = limpo;

    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(limpo));
        return true;
      }
    } catch (erro) {
      // Mantem fallback em memoria se localStorage estiver cheio ou bloqueado
    }
    return false;
  }

  // =========================================================================
  // CONFIGURACAO
  // =========================================================================

  function getConfig() {
    var dados = carregarDados();
    return {
      modo: dados.config.modo,
      palavrasSemanaAtivo: dados.config.palavrasSemanaAtivo,
      fase1ModoSemana: dados.config.fase1ModoSemana
    };
  }

  function setModo(modo) {
    var dados = carregarDados();
    if (modo === 'aula' || modo === 'livre') {
      dados.config.modo = modo;
      salvarDados(dados);
    }
    return {
      modo: dados.config.modo,
      palavrasSemanaAtivo: dados.config.palavrasSemanaAtivo,
      fase1ModoSemana: dados.config.fase1ModoSemana
    };
  }

  function isModoAula() {
    return carregarDados().config.modo === 'aula';
  }

  function setPalavrasSemanaAtivo(ativo) {
    var dados = carregarDados();
    var querAtivar = Boolean(ativo);

    if (querAtivar && dados.palavrasSemana.length < 4) {
      return {
        ok: false,
        motivo: 'Cadastre pelo menos 4 palavras da semana para ativar este modo.'
      };
    }

    dados.config.palavrasSemanaAtivo = querAtivar;
    salvarDados(dados);

    return {
      ok: true,
      ativo: querAtivar
    };
  }

  function isPalavrasSemanaAtivo() {
    var dados = carregarDados();
    return Boolean(dados.config.palavrasSemanaAtivo && dados.palavrasSemana.length >= 4);
  }

  function setFase1ModoSemana(modoFase1) {
    var dados = carregarDados();
    if (modoFase1 === 'dica' || modoFase1 === 'silaba') {
      dados.config.fase1ModoSemana = modoFase1;
      salvarDados(dados);
    }
    return {
      modo: dados.config.modo,
      palavrasSemanaAtivo: dados.config.palavrasSemanaAtivo,
      fase1ModoSemana: dados.config.fase1ModoSemana
    };
  }

  // =========================================================================
  // TURMA
  // =========================================================================

  /**
   * Valida e prepara objeto de aluno sem persistir (reaproveitado em lote).
   */
  function validarNovoAluno(nomeOriginal, listaAtual) {
    var nomeLimpo = String(nomeOriginal == null ? '' : nomeOriginal)
      .replace(/\s+/g, ' ')
      .trim();

    var chave = normalizarChave(nomeLimpo);
    var caracteresUteis = chave.replace(/[^a-z0-9]/g, '');

    if (nomeLimpo.length < 2 || caracteresUteis.length < 2) {
      return {
        ok: false,
        motivo: 'invalido',
        erro: 'Informe um nome com pelo menos 2 caracteres válidos.'
      };
    }

    for (var i = 0; i < listaAtual.length; i += 1) {
      if (listaAtual[i].chave === chave) {
        return {
          ok: false,
          motivo: 'duplicado',
          erro: 'Este aluno já está cadastrado na turma.'
        };
      }
    }

    return {
      ok: true,
      aluno: {
        id: gerarId('alu'),
        nome: nomeLimpo,
        chave: chave
      }
    };
  }

  function listarAlunos() {
    var dados = carregarDados();
    var lista = dados.turma.map(clonarAluno);
    lista.sort(function (a, b) {
      return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
    });
    return lista;
  }

  function adicionarAluno(nomeOriginal) {
    var dados = carregarDados();
    var resultado = validarNovoAluno(nomeOriginal, dados.turma);

    if (!resultado.ok) {
      return { ok: false, erro: resultado.erro };
    }

    dados.turma.push(resultado.aluno);
    salvarDados(dados);

    return {
      ok: true,
      aluno: clonarAluno(resultado.aluno)
    };
  }

  function adicionarAlunosEmLote(texto) {
    var partes = String(texto == null ? '' : texto).split(/[\n,;]+/);
    var dados = carregarDados();
    var adicionados = 0;
    var duplicados = 0;
    var invalidos = 0;

    for (var i = 0; i < partes.length; i += 1) {
      var textoLimpo = partes[i].replace(/\s+/g, ' ').trim();
      if (!textoLimpo) {
        continue;
      }

      var validacao = validarNovoAluno(textoLimpo, dados.turma);
      if (validacao.ok) {
        dados.turma.push(validacao.aluno);
        adicionados += 1;
      } else if (validacao.motivo === 'duplicado') {
        duplicados += 1;
      } else {
        invalidos += 1;
      }
    }

    if (adicionados > 0) {
      salvarDados(dados);
    }

    return {
      adicionados: adicionados,
      duplicados: duplicados,
      invalidos: invalidos
    };
  }

  function removerAluno(id) {
    var dados = carregarDados();
    var tamanhoInicial = dados.turma.length;

    dados.turma = dados.turma.filter(function (aluno) {
      return aluno.id !== id;
    });

    if (dados.turma.length === tamanhoInicial) {
      return false;
    }

    salvarDados(dados);
    return true;
  }

  function buscarSugestoesAlunos(textoDigitado, limite) {
    var max = typeof limite === 'number' && isFinite(limite) && limite > 0
      ? Math.floor(limite)
      : 6;

    var alunos = listarAlunos();
    var busca = normalizarChave(textoDigitado);

    if (!busca) {
      return alunos.slice(0, max);
    }

    var comeca = [];
    var contem = [];

    for (var i = 0; i < alunos.length; i += 1) {
      var aluno = alunos[i];
      var primeiroNome = aluno.chave.split(' ')[0] || '';

      if (aluno.chave.indexOf(busca) === 0 || primeiroNome.indexOf(busca) === 0) {
        comeca.push(aluno);
      } else if (aluno.chave.indexOf(busca) !== -1) {
        contem.push(aluno);
      }
    }

    return comeca.concat(contem).slice(0, max);
  }

  function resolverAlunoPorTexto(textoDigitado) {
    var chaveBusca = normalizarChave(textoDigitado);
    if (!chaveBusca) {
      return null;
    }

    var turma = carregarDados().turma;

    // Prioridade 1: correspondencia exata pela chave completa
    for (var i = 0; i < turma.length; i += 1) {
      if (turma[i].chave === chaveBusca) {
        return clonarAluno(turma[i]);
      }
    }

    // Prioridade 2: palavra unica correspondendo exclusivamente a um primeiro nome
    if (chaveBusca.indexOf(' ') === -1) {
      var correspondencias = [];
      for (var j = 0; j < turma.length; j += 1) {
        var primeiroToken = turma[j].chave.split(' ')[0] || '';
        if (primeiroToken === chaveBusca) {
          correspondencias.push(turma[j]);
        }
      }
      if (correspondencias.length === 1) {
        return clonarAluno(correspondencias[0]);
      }

      // Prioridade 3: digitacao no mini-teclado virtual sem espacos para nome composto unico
      var semEspacos = [];
      for (var k = 0; k < turma.length; k += 1) {
        if (turma[k].chave.replace(/\s+/g, '') === chaveBusca) {
          semEspacos.push(turma[k]);
        }
      }
      if (semEspacos.length === 1) {
        return clonarAluno(semEspacos[0]);
      }
    }

    return null;
  }

  // =========================================================================
  // PALAVRAS DA SEMANA
  // =========================================================================

  /**
   * Processa a frase opcional garantindo exibicao da lacuna '___' na Fase 3.
   */
  function processarFraseSemana(fraseBruta, plainPalavra) {
    var fraseLimpa = String(fraseBruta == null ? '' : fraseBruta)
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();

    if (!fraseLimpa) {
      return '';
    }

    // Se a professora ja inseriu 2 ou mais underscores, padroniza para '___'
    if (/_{2,}/.test(fraseLimpa)) {
      return fraseLimpa.replace(/_{2,}/g, '___');
    }

    // Procura a palavra inteira ignorando acentos para preservar os demais acentos da frase
    var regexTokens = /[A-Za-z\u00C0-\u024F]+/g;
    var match;
    while ((match = regexTokens.exec(fraseLimpa)) !== null) {
      if (normalizarPlain(match[0]) === plainPalavra) {
        return (
          fraseLimpa.slice(0, match.index) +
          '___' +
          fraseLimpa.slice(match.index + match[0].length)
        );
      }
    }

    // Se a palavra nao apareceu literalmente na frase, anexa a lacuna ao final
    return fraseLimpa + ' (___)';
  }

  /**
   * Valida e normaliza os campos de uma palavra da semana.
   */
  function validarDadosPalavra(entrada) {
    var obj = entrada && typeof entrada === 'object' ? entrada : {};
    var partes = String(obj.silabasRaw == null ? '' : obj.silabasRaw).split('-');
    var silabas = [];

    for (var i = 0; i < partes.length; i += 1) {
      var silaba = partes[i].replace(/\s+/g, '').trim().toUpperCase();
      if (!silaba) {
        continue;
      }
      if (normalizarPlain(silaba).length === 0) {
        return {
          ok: false,
          erro: 'Cada sílaba precisa conter ao menos uma letra válida.'
        };
      }
      silabas.push(silaba);
    }

    if (silabas.length === 0) {
      return {
        ok: false,
        erro: 'Informe as sílabas separadas por hífen (ex.: ES-CO-VA).'
      };
    }

    var palavra = silabas.join('');
    var plain = normalizarPlain(palavra);

    if (plain.length < 2) {
      return {
        ok: false,
        erro: 'A palavra precisa ter pelo menos 2 letras válidas.'
      };
    }

    if (palavra.length !== plain.length) {
      return {
        ok: false,
        erro: 'Use apenas letras e hífens para separar as sílabas (ex.: PA-LHA-ÇO).'
      };
    }

    var dicaLimpa = String(obj.dica == null ? '' : obj.dica)
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();

    var fraseProcessada = processarFraseSemana(obj.frase, plain);

    return {
      ok: true,
      dados: {
        palavra: palavra,
        plain: plain,
        silabasRaw: silabas.join('-'),
        silabas: silabas,
        dica: dicaLimpa,
        frase: fraseProcessada
      }
    };
  }

  function listarPalavrasSemana() {
    return carregarDados().palavrasSemana.map(clonarPalavra);
  }

  function adicionarPalavraSemana(entrada) {
    var dados = carregarDados();

    if (dados.palavrasSemana.length >= MAX_PALAVRAS_SEMANA) {
      return {
        ok: false,
        erro: 'Limite máximo de 12 palavras da semana atingido.'
      };
    }

    var validacao = validarDadosPalavra(entrada);
    if (!validacao.ok) {
      return { ok: false, erro: validacao.erro };
    }

    for (var i = 0; i < dados.palavrasSemana.length; i += 1) {
      if (dados.palavrasSemana[i].plain === validacao.dados.plain) {
        return {
          ok: false,
          erro: 'Esta palavra já está cadastrada na semana.'
        };
      }
    }

    var item = {
      id: gerarId('pal'),
      palavra: validacao.dados.palavra,
      plain: validacao.dados.plain,
      silabasRaw: validacao.dados.silabasRaw,
      silabas: validacao.dados.silabas,
      dica: validacao.dados.dica,
      frase: validacao.dados.frase
    };

    dados.palavrasSemana.push(item);
    salvarDados(dados);

    return {
      ok: true,
      item: clonarPalavra(item)
    };
  }

  function atualizarPalavraSemana(id, entrada) {
    var dados = carregarDados();
    var idx = -1;

    for (var i = 0; i < dados.palavrasSemana.length; i += 1) {
      if (dados.palavrasSemana[i].id === id) {
        idx = i;
        break;
      }
    }

    if (idx === -1) {
      return { ok: false, erro: 'Palavra da semana não encontrada.' };
    }

    var validacao = validarDadosPalavra(entrada);
    if (!validacao.ok) {
      return { ok: false, erro: validacao.erro };
    }

    for (var j = 0; j < dados.palavrasSemana.length; j += 1) {
      if (j !== idx && dados.palavrasSemana[j].plain === validacao.dados.plain) {
        return {
          ok: false,
          erro: 'Já existe outra palavra cadastrada com essa grafia.'
        };
      }
    }

    var atualizado = {
      id: id,
      palavra: validacao.dados.palavra,
      plain: validacao.dados.plain,
      silabasRaw: validacao.dados.silabasRaw,
      silabas: validacao.dados.silabas,
      dica: validacao.dados.dica,
      frase: validacao.dados.frase
    };

    dados.palavrasSemana[idx] = atualizado;
    salvarDados(dados);

    return {
      ok: true,
      item: clonarPalavra(atualizado)
    };
  }

  function removerPalavraSemana(id) {
    var dados = carregarDados();
    var tamanhoInicial = dados.palavrasSemana.length;
    var estavaAtivo = Boolean(dados.config.palavrasSemanaAtivo);

    dados.palavrasSemana = dados.palavrasSemana.filter(function (item) {
      return item.id !== id;
    });

    if (dados.palavrasSemana.length === tamanhoInicial) {
      return { ok: false, desativadoAuto: false };
    }

    var desativadoAuto = false;
    if (dados.palavrasSemana.length < 4 && estavaAtivo) {
      dados.config.palavrasSemanaAtivo = false;
      desativadoAuto = true;
    }

    salvarDados(dados);
    return {
      ok: true,
      desativadoAuto: desativadoAuto
    };
  }

  function limparPalavrasSemana() {
    var dados = carregarDados();
    dados.palavrasSemana = [];
    dados.config.palavrasSemanaAtivo = false;
    salvarDados(dados);
  }

  function embaralharCopia(lista) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copia[i];
      copia[i] = copia[j];
      copia[j] = tmp;
    }
    return copia;
  }

  function gerarSilabasIntrusas(itemAlvo, todasPalavras) {
    var proibidas = {};
    for (var i = 0; i < itemAlvo.silabas.length; i += 1) {
      proibidas[itemAlvo.silabas[i]] = true;
    }

    var candidatasOutras = [];
    for (var j = 0; j < todasPalavras.length; j += 1) {
      var outro = todasPalavras[j];
      if (outro.id === itemAlvo.id) {
        continue;
      }
      for (var k = 0; k < outro.silabas.length; k += 1) {
        var sil = outro.silabas[k];
        if (!proibidas[sil]) {
          candidatasOutras.push(sil);
        }
      }
    }

    var intrusas = [];
    var escolhidas = {};

    function tentarAdicionarDe(origem) {
      var embaralhada = embaralharCopia(origem);
      for (var m = 0; m < embaralhada.length && intrusas.length < 4; m += 1) {
        var cand = embaralhada[m];
        if (!proibidas[cand] && !escolhidas[cand]) {
          escolhidas[cand] = true;
          intrusas.push(cand);
        }
      }
    }

    tentarAdicionarDe(candidatasOutras);
    if (intrusas.length < 4) {
      tentarAdicionarDe(POOL_SILABAS_AUXILIAR);
    }
    if (intrusas.length < 4) {
      tentarAdicionarDe(POOL_SILABAS_RESERVA);
    }

    return intrusas;
  }

  function getBancoPalavrasSemanaParaJogo() {
    var palavras = carregarDados().palavrasSemana;
    var banco = [];

    for (var i = 0; i < palavras.length; i += 1) {
      var item = palavras[i];
      var intruders = gerarSilabasIntrusas(item, palavras);
      var dicaParaFase2 = item.dica
        ? item.dica
        : 'JUNTE OS PEDACINHOS PARA FORMAR A PALAVRA!';

      var fraseParaFase3;
      if (item.frase) {
        fraseParaFase3 = item.frase;
      } else if (item.dica) {
        fraseParaFase3 = 'DICA: ' + item.dica + ' — ESCREVA A PALAVRA: ___!';
      } else {
        fraseParaFase3 = 'PALAVRA DA SEMANA! ESCREVA NO TECLADO: ___!';
      }

      banco.push({
        id: item.id,
        word: item.palavra,
        plain: item.plain,
        syllables: item.silabas.slice(),
        intruders: intruders,
        clue: dicaParaFase2,
        clues: [dicaParaFase2],
        dicaOriginal: item.dica || '',
        silabaInicial: item.silabas[0] || item.palavra.slice(0, 2),
        sentence: fraseParaFase3,
        sentences: [fraseParaFase3],
        sentenceBefore: '',
        sentenceAfter: '',
        svg: SVGs.ILUSTRACAO_SEMANA,
        isWeeklyWord: true
      });
    }

    return banco;
  }

  // =========================================================================
  // SESSOES E HISTORICO PEDAGOGICO
  // =========================================================================

  function salvarSessao(sessao) {
    var dados = carregarDados();
    var registro = sanitizarSessao(sessao);

    dados.sessoes.push(registro);
    if (dados.sessoes.length > MAX_SESSOES) {
      dados.sessoes = dados.sessoes.slice(dados.sessoes.length - MAX_SESSOES);
    }

    salvarDados(dados);
    return clonarSessao(registro);
  }

  function listarSessoes() {
    return carregarDados().sessoes.map(clonarSessao);
  }

  function limparHistoricoSessoes() {
    var dados = carregarDados();
    dados.sessoes = [];
    salvarDados(dados);
  }

  // =========================================================================
  // ANOTACOES PEDAGOGICAS DA PROFESSORA
  // =========================================================================

  function resolverNomeAlunoParaAnotacao(dados, alunoId, alunoNomeInformado) {
    var idLimpo = alunoId !== undefined && alunoId !== null
      ? sanitizarTextoSeguro(alunoId, 60, false)
      : '';
    if (!idLimpo || idLimpo === 'TURMA' || idLimpo === 'TODOS') {
      return { alunoId: null, alunoNome: '' };
    }

    var nomeLimpo = sanitizarTextoSeguro(alunoNomeInformado, MAX_ANOTACAO_ALUNO_NOME, false);
    if (!nomeLimpo && dados && Array.isArray(dados.turma)) {
      for (var i = 0; i < dados.turma.length; i += 1) {
        if (String(dados.turma[i].id) === String(idLimpo)) {
          nomeLimpo = dados.turma[i].nome;
          break;
        }
      }
    }

    return {
      alunoId: idLimpo,
      alunoNome: nomeLimpo
    };
  }

  function listarAnotacoes() {
    var lista = carregarDados().anotacoes.map(clonarAnotacao);
    lista.sort(function (a, b) {
      return ((b.atualizadaEm || b.criadaEm || 0) - (a.atualizadaEm || a.criadaEm || 0));
    });
    return lista;
  }

  function adicionarAnotacao(entrada) {
    var dados = carregarDados();
    var bruto = typeof entrada === 'string'
      ? { texto: entrada }
      : (entrada && typeof entrada === 'object' ? entrada : {});

    var textoLimpo = sanitizarTextoSeguro(bruto.texto, MAX_ANOTACAO_TEXTO, true);
    if (!textoLimpo) {
      return {
        ok: false,
        erro: 'Escreva uma anotação antes de salvar.'
      };
    }

    var vinculo = resolverNomeAlunoParaAnotacao(dados, bruto.alunoId, bruto.alunoNome);
    var agora = Date.now();
    var item = sanitizarAnotacao({
      id: gerarId('ano'),
      dataISO: bruto.dataISO || getDataLocalISO(new Date(agora)),
      alunoId: vinculo.alunoId,
      alunoNome: vinculo.alunoNome,
      texto: textoLimpo,
      criadaEm: agora,
      atualizadaEm: agora
    });

    if (!item) {
      return {
        ok: false,
        erro: 'Escreva uma anotação antes de salvar.'
      };
    }

    dados.anotacoes.unshift(item);
    if (dados.anotacoes.length > MAX_ANOTACOES) {
      dados.anotacoes.sort(function (a, b) {
        return ((b.atualizadaEm || b.criadaEm || 0) - (a.atualizadaEm || a.criadaEm || 0));
      });
      dados.anotacoes = dados.anotacoes.slice(0, MAX_ANOTACOES);
    }

    salvarDados(dados);
    return {
      ok: true,
      anotacao: clonarAnotacao(item)
    };
  }

  function atualizarAnotacao(id, entrada) {
    var dados = carregarDados();
    var idx = -1;
    for (var i = 0; i < dados.anotacoes.length; i += 1) {
      if (String(dados.anotacoes[i].id) === String(id)) {
        idx = i;
        break;
      }
    }

    if (idx === -1) {
      return {
        ok: false,
        erro: 'Anotação não encontrada.'
      };
    }

    var existente = dados.anotacoes[idx];
    var bruto = typeof entrada === 'string'
      ? { texto: entrada }
      : (entrada && typeof entrada === 'object' ? entrada : {});

    var textoLimpo = sanitizarTextoSeguro(bruto.texto, MAX_ANOTACAO_TEXTO, true);
    if (!textoLimpo) {
      return {
        ok: false,
        erro: 'Escreva uma anotação antes de salvar.'
      };
    }

    var vinculo;
    if (bruto.alunoId !== undefined || bruto.alunoNome !== undefined) {
      vinculo = resolverNomeAlunoParaAnotacao(dados, bruto.alunoId, bruto.alunoNome);
    } else {
      vinculo = {
        alunoId: existente.alunoId || null,
        alunoNome: existente.alunoNome || ''
      };
    }

    var atualizada = sanitizarAnotacao({
      id: existente.id,
      dataISO: bruto.dataISO || existente.dataISO,
      alunoId: vinculo.alunoId,
      alunoNome: vinculo.alunoNome,
      texto: textoLimpo,
      criadaEm: existente.criadaEm,
      atualizadaEm: Date.now()
    });

    dados.anotacoes[idx] = atualizada;
    salvarDados(dados);

    return {
      ok: true,
      anotacao: clonarAnotacao(atualizada)
    };
  }

  function removerAnotacao(id) {
    var dados = carregarDados();
    var tamanhoInicial = dados.anotacoes.length;

    dados.anotacoes = dados.anotacoes.filter(function (item) {
      return String(item.id) !== String(id);
    });

    if (dados.anotacoes.length === tamanhoInicial) {
      return false;
    }

    salvarDados(dados);
    return true;
  }

  // =========================================================================
  // BACKUP COMPLETO EM JSON (EXPORTACAO E IMPORTACAO SANITIZADA)
  // =========================================================================

  var RANKING_STORAGE_KEY = 'saudeBucalRanking';
  var MAX_RANKING_BACKUP_ENTRIES = 30;
  var MAX_RANKING_NAME_LENGTH = 18;
  var rankingFallback = null;

  /**
   * Sanitiza a lista de pontuacoes do Ranking (saudeBucalRanking).
   */
  function sanitizarListaRanking(listaBruta) {
    if (!Array.isArray(listaBruta)) {
      return [];
    }

    var limpa = [];
    for (var i = 0; i < listaBruta.length; i += 1) {
      var item = listaBruta[i];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        continue;
      }

      var rawName = String(item.name == null ? '' : item.name)
        .replace(/\s+/g, ' ')
        .trim();
      var nomeLimpo = rawName
        ? rawName.slice(0, MAX_RANKING_NAME_LENGTH)
        : 'ALUNO';

      var starsNum = sanitizarNumeroNaoNegativo(item.stars);
      var dateNum = typeof item.date === 'number' && isFinite(item.date) && item.date > 0
        ? Math.floor(item.date)
        : Date.now();

      limpa.push({
        name: nomeLimpo,
        stars: starsNum,
        date: dateNum
      });
    }

    limpa.sort(function (a, b) {
      return (b.stars - a.stars) || (b.date - a.date);
    });

    return limpa.slice(0, MAX_RANKING_BACKUP_ENTRIES);
  }

  function carregarRankingSeguro() {
    try {
      if (global.localStorage) {
        var raw = global.localStorage.getItem(RANKING_STORAGE_KEY);
        if (!raw) {
          return [];
        }
        var parsed = JSON.parse(raw);
        return sanitizarListaRanking(parsed);
      }
    } catch (e) {}

    return Array.isArray(rankingFallback) ? sanitizarListaRanking(rankingFallback) : [];
  }

  function salvarRankingSeguro(lista) {
    var limpa = sanitizarListaRanking(lista);
    rankingFallback = limpa;
    try {
      if (global.localStorage) {
        global.localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(limpa));
        return true;
      }
    } catch (e) {}
    return false;
  }

  /**
   * Gera a string JSON formatada do backup completo (saudeEscola_v2_dados + saudeBucalRanking).
   */
  function gerarBackupJSON() {
    var dados = carregarDados();
    var ranking = carregarRankingSeguro();
    var payload = {
      tipo: 'saude_escola_backup',
      versaoBackup: 1,
      exportadoEm: new Date().toISOString(),
      dataISO: getDataLocalISO(new Date()),
      saudeEscola_v2_dados: dados,
      saudeBucalRanking: ranking
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Importa um backup JSON aplicando sanitizarDados() e sanitizacao de Ranking.
   */
  function importarBackupJSON(conteudoBruto) {
    var parsed = null;

    if (typeof conteudoBruto === 'string') {
      var texto = conteudoBruto.trim();
      if (!texto) {
        return {
          ok: false,
          erro: 'O arquivo de backup selecionado está vazio.'
        };
      }
      try {
        parsed = JSON.parse(texto);
      } catch (erroParse) {
        return {
          ok: false,
          erro: 'Arquivo inválido: o conteúdo não é um JSON válido.'
        };
      }
    } else if (conteudoBruto && typeof conteudoBruto === 'object' && !Array.isArray(conteudoBruto)) {
      parsed = conteudoBruto;
    } else {
      return {
        ok: false,
        erro: 'Formato de backup não reconhecido.'
      };
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        ok: false,
        erro: 'Estrutura de backup inválida.'
      };
    }

    // Aceita tanto o envelope completo de backup quanto o objeto direto de saudeEscola_v2_dados
    var possuiEnvelope = Boolean(
      parsed.saudeEscola_v2_dados ||
      parsed.dados ||
      parsed.saudeBucalRanking ||
      parsed.ranking
    );
    var possuiChavesDiretas = Boolean(
      parsed.config ||
      Array.isArray(parsed.turma) ||
      Array.isArray(parsed.palavrasSemana) ||
      Array.isArray(parsed.sessoes) ||
      Array.isArray(parsed.anotacoes)
    );

    if (!possuiEnvelope && !possuiChavesDiretas) {
      return {
        ok: false,
        erro: 'O arquivo JSON não contém dados válidos do jogo Saúde na Escola.'
      };
    }

    var origemDados = parsed.saudeEscola_v2_dados || parsed.dados || (possuiChavesDiretas ? parsed : {});
    if (!origemDados || typeof origemDados !== 'object' || Array.isArray(origemDados)) {
      return {
        ok: false,
        erro: 'A seção de dados pedagógicos do backup está corrompida.'
      };
    }

    var dadosSanitizados = sanitizarDados(origemDados);
    salvarDados(dadosSanitizados);

    var temCampoRanking = Array.isArray(parsed.saudeBucalRanking) || Array.isArray(parsed.ranking);
    var rankingSanitizado = temCampoRanking
      ? sanitizarListaRanking(parsed.saudeBucalRanking || parsed.ranking)
      : carregarRankingSeguro();

    if (temCampoRanking) {
      salvarRankingSeguro(rankingSanitizado);
    }

    return {
      ok: true,
      resumo: {
        alunos: dadosSanitizados.turma.length,
        palavras: dadosSanitizados.palavrasSemana.length,
        sessoes: dadosSanitizados.sessoes.length,
        anotacoes: dadosSanitizados.anotacoes.length,
        ranking: rankingSanitizado.length
      }
    };
  }

  // =========================================================================
  // EXPORTACAO GLOBAL (100% OFFLINE / SEM MODULOS ES)
  // =========================================================================

  global.SaudeEscola = global.SaudeEscola || {};
  global.SaudeEscola.Storage = {
    STORAGE_KEY: STORAGE_KEY,
    RANKING_STORAGE_KEY: RANKING_STORAGE_KEY,
    SVGs: SVGs,

    normalizarChave: normalizarChave,
    normalizarPlain: normalizarPlain,
    sanitizarTextoSeguro: sanitizarTextoSeguro,
    getDataLocalISO: getDataLocalISO,
    sanitizarDados: sanitizarDados,
    carregarDados: carregarDados,
    salvarDados: salvarDados,
    gerarBackupJSON: gerarBackupJSON,
    importarBackupJSON: importarBackupJSON,

    getConfig: getConfig,
    setModo: setModo,
    isModoAula: isModoAula,
    setPalavrasSemanaAtivo: setPalavrasSemanaAtivo,
    isPalavrasSemanaAtivo: isPalavrasSemanaAtivo,
    setFase1ModoSemana: setFase1ModoSemana,

    listarAlunos: listarAlunos,
    adicionarAluno: adicionarAluno,
    adicionarAlunosEmLote: adicionarAlunosEmLote,
    removerAluno: removerAluno,
    buscarSugestoesAlunos: buscarSugestoesAlunos,
    resolverAlunoPorTexto: resolverAlunoPorTexto,

    listarPalavrasSemana: listarPalavrasSemana,
    adicionarPalavraSemana: adicionarPalavraSemana,
    atualizarPalavraSemana: atualizarPalavraSemana,
    removerPalavraSemana: removerPalavraSemana,
    limparPalavrasSemana: limparPalavrasSemana,
    getBancoPalavrasSemanaParaJogo: getBancoPalavrasSemanaParaJogo,

    salvarSessao: salvarSessao,
    listarSessoes: listarSessoes,
    limparHistoricoSessoes: limparHistoricoSessoes,

    listarAnotacoes: listarAnotacoes,
    adicionarAnotacao: adicionarAnotacao,
    atualizarAnotacao: atualizarAnotacao,
    removerAnotacao: removerAnotacao
  };
})(typeof window !== 'undefined' ? window : globalThis);
