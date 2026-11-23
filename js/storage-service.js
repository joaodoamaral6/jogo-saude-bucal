/**
 * ==========================================================================
 * CABEÇALHO ARQUITETURAL — SaudeEscola.Storage
 * ==========================================================================
 * Responsabilidade: persistência local, sanitização de dados, Backup JSON,
 * turma, Palavras da Semana, sessões, anotações e limites de integridade.
 *
 * Dependências: SaudeEscola.Periods e SaudeEscola.DomSafe quando disponíveis;
 * o módulo preserva fallbacks próprios para continuar funcional offline.
 *
 * API pública: SaudeEscola.Storage
 * Contrato: leitura/escrita de localStorage, exportação/importação JSON,
 * consultas CRUD e normalização de dados já usados pelos módulos de interface.
 *
 * Sumário:
 * 1. Constantes e ilustrações
 * 2. Sanitização e normalização
 * 3. Turma e Palavras da Semana
 * 4. Sessões e compatibilidade de métricas
 * 5. Anotações pedagógicas
 * 6. Backup, ranking auxiliar e exportação pública
 * ==========================================================================
 */
(function (global) {
  'use strict';

  /**
   * Servico de persistencia offline da aplicacao (v2).
   * Isolado na chave 'saudeEscola_v2_dados' para nao interferir nas chaves da v1.x.
   */
  var STORAGE_KEY = 'saudeEscola_v2_dados';
  var MAX_ALUNOS = 100;
  var MAX_ALUNO_NOME = 60;
  var MAX_PALAVRAS_SEMANA = 12;
  var MAX_SESSOES = 500;
  var MAX_ANOTACOES = 200;
  var MAX_ANOTACAO_TEXTO = 1000;
  var MAX_ANOTACAO_ALUNO_NOME = 60;
  var MAX_BACKUP_BYTES = 2 * 1024 * 1024;
  var MAX_ID_LENGTH = 64;
  var MAX_MAP_KEYS = 80;
  var MAX_PALAVRAS_TRABALHADAS_SESSAO = 50;

  var CHAVES_PROIBIDAS = Object.create(null);
  CHAVES_PROIBIDAS['__proto__'] = true;
  CHAVES_PROIBIDAS['constructor'] = true;
  CHAVES_PROIBIDAS['prototype'] = true;

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
   * Obtem dinamicamente o modulo de periodos letivos quando disponivel.
   */
  function getPeriodsModule() {
    return (global.SaudeEscola && global.SaudeEscola.Periods) ? global.SaudeEscola.Periods : null;
  }

  /**
   * Gera a configuracao padrao de periodos letivos com fallback autonomo.
   */
  function criarPeriodosPadrao(modelo, ano) {
    var periods = getPeriodsModule();
    var modeloNorm = modelo === 'trimestre' ? 'trimestre' : 'bimestre';
    if (periods && typeof periods.gerarConfiguracaoPadrao === 'function') {
      return periods.gerarConfiguracaoPadrao(modeloNorm, ano);
    }

    var anoNum = Number(ano);
    if (!isFinite(anoNum) || Math.floor(anoNum) !== anoNum || anoNum < 2000 || anoNum > 2100) {
      anoNum = new Date().getFullYear();
      if (!isFinite(anoNum) || anoNum < 2000 || anoNum > 2100) anoNum = 2026;
    }
    var pAno = String(anoNum);
    if (modeloNorm === 'trimestre') {
      return {
        modelo: 'trimestre',
        ano: anoNum,
        ciclos: [
          { id: 'tri_1', nome: '1º Trimestre', sigla: '1º Tri', inicio: pAno + '-02-01', fim: pAno + '-05-15' },
          { id: 'tri_2', nome: '2º Trimestre', sigla: '2º Tri', inicio: pAno + '-05-16', fim: pAno + '-08-31' },
          { id: 'tri_3', nome: '3º Trimestre', sigla: '3º Tri', inicio: pAno + '-09-01', fim: pAno + '-12-31' }
        ]
      };
    }
    return {
      modelo: 'bimestre',
      ano: anoNum,
      ciclos: [
        { id: 'bim_1', nome: '1º Bimestre', sigla: '1º Bim', inicio: pAno + '-02-01', fim: pAno + '-04-30' },
        { id: 'bim_2', nome: '2º Bimestre', sigla: '2º Bim', inicio: pAno + '-05-01', fim: pAno + '-07-15' },
        { id: 'bim_3', nome: '3º Bimestre', sigla: '3º Bim', inicio: pAno + '-08-01', fim: pAno + '-10-15' },
        { id: 'bim_4', nome: '4º Bimestre', sigla: '4º Bim', inicio: pAno + '-10-16', fim: pAno + '-12-31' }
      ]
    };
  }

  /**
   * Sanitiza configuracao de periodos letivos com blindagem anti-XSS e fallback seguro.
   */
  function sanitizarPeriodosLetivos(bruto) {
    if (!ehObjetoPlano(bruto)) {
      return criarPeriodosPadrao('bimestre');
    }

    var periods = getPeriodsModule();
    var baseCfg;
    if (periods && typeof periods.sanitizarConfiguracao === 'function') {
      baseCfg = periods.sanitizarConfiguracao(bruto);
    } else {
      var modeloFallback = bruto.modelo === 'trimestre' ? 'trimestre' : 'bimestre';
      var anoFallback = bruto.ano;
      if (Array.isArray(bruto.ciclos) && bruto.ciclos.length >= 1 && bruto.ciclos.length <= 6) {
        var ciclosFallback = [];
        var idsVistosFb = Object.create(null);
        var valido = true;
        for (var i = 0; i < bruto.ciclos.length; i += 1) {
          var cFb = bruto.ciclos[i];
          if (!ehObjetoPlano(cFb) || !ehDataISOValida(cFb.inicio) || !ehDataISOValida(cFb.fim) || cFb.inicio > cFb.fim) {
            valido = false;
            break;
          }
          var idFb = sanitizarIdSeguro(cFb.id, null);
          var nomeFb = sanitizarTextoSeguro(cFb.nome, 40, false);
          if (!idFb || idsVistosFb[idFb] || !nomeFb) {
            valido = false;
            break;
          }
          idsVistosFb[idFb] = true;
          ciclosFallback.push({
            id: idFb,
            nome: nomeFb,
            sigla: sanitizarTextoSeguro(cFb.sigla, 16, false) || nomeFb.slice(0, 10),
            inicio: cFb.inicio.trim(),
            fim: cFb.fim.trim()
          });
        }
        if (valido) {
          ciclosFallback.sort(function (a, b) { return a.inicio.localeCompare(b.inicio); });
          for (var j = 1; j < ciclosFallback.length; j += 1) {
            if (ciclosFallback[j - 1].fim >= ciclosFallback[j].inicio) {
              valido = false;
              break;
            }
          }
        }
        if (valido) {
          var padraoFb = criarPeriodosPadrao(modeloFallback, anoFallback);
          baseCfg = { modelo: modeloFallback, ano: padraoFb.ano, ciclos: ciclosFallback };
        } else {
          baseCfg = criarPeriodosPadrao(modeloFallback, anoFallback);
        }
      } else {
        baseCfg = criarPeriodosPadrao(modeloFallback, anoFallback);
      }
    }

    var ciclosSeguros = [];
    var idsVistos = Object.create(null);
    var listaOrigem = Array.isArray(baseCfg && baseCfg.ciclos) ? baseCfg.ciclos : [];
    for (var k = 0; k < listaOrigem.length; k += 1) {
      var c = listaOrigem[k];
      if (!ehObjetoPlano(c)) continue;
      var idLimpo = sanitizarIdSeguro(c.id, 'cic');
      if (idsVistos[idLimpo]) idLimpo = gerarId('cic');
      idsVistos[idLimpo] = true;
      var nomeLimpo = sanitizarTextoSeguro(c.nome, 40, false);
      var siglaLimpa = sanitizarTextoSeguro(c.sigla, 16, false) || nomeLimpo.slice(0, 10);
      if (!nomeLimpo || !ehDataISOValida(c.inicio) || !ehDataISOValida(c.fim)) continue;
      ciclosSeguros.push({
        id: idLimpo,
        nome: nomeLimpo,
        sigla: siglaLimpa,
        inicio: String(c.inicio).trim(),
        fim: String(c.fim).trim()
      });
    }

    if (ciclosSeguros.length === 0) {
      return criarPeriodosPadrao(baseCfg && baseCfg.modelo, baseCfg && baseCfg.ano);
    }

    return {
      modelo: baseCfg.modelo === 'trimestre' ? 'trimestre' : 'bimestre',
      ano: baseCfg.ano,
      ciclos: ciclosSeguros
    };
  }

  /**
   * Clona a configuracao de periodos letivos sem expor referencias mutaveis.
   */
  function clonarPeriodosLetivos(cfg) {
    var limpo = sanitizarPeriodosLetivos(cfg);
    return {
      modelo: limpo.modelo,
      ano: limpo.ano,
      ciclos: limpo.ciclos.map(function (c) {
        return {
          id: c.id,
          nome: c.nome,
          sigla: c.sigla,
          inicio: c.inicio,
          fim: c.fim
        };
      })
    };
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
        fase1ModoSemana: 'dica',
        periodosLetivos: criarPeriodosPadrao('bimestre')
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

  /**
   * Identifica chaves reservadas que nao devem ser copiadas em objetos/mapas.
   */
  function ehChaveProibida(chave) {
    return Boolean(CHAVES_PROIBIDAS[String(chave)]);
  }

  /**
   * Verifica se um valor e um objeto plano (exclui null e arrays).
   */
  function ehObjetoPlano(valor) {
    return Boolean(valor && typeof valor === 'object' && !Array.isArray(valor));
  }

  /**
   * Calcula o tamanho aproximado/exato em bytes UTF-8 sem depender de TextEncoder.
   */
  function calcularBytesUTF8(texto) {
    var bytes = 0;
    for (var i = 0; i < texto.length; i += 1) {
      var code = texto.charCodeAt(i);
      if (code <= 0x7F) {
        bytes += 1;
      } else if (code <= 0x7FF) {
        bytes += 2;
      } else if (code >= 0xD800 && code <= 0xDBFF && i + 1 < texto.length) {
        var nextCode = texto.charCodeAt(i + 1);
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          bytes += 4;
          i += 1;
        } else {
          bytes += 3;
        }
      } else {
        bytes += 3;
      }
    }
    return bytes;
  }

  /**
   * Faz parse seguro de JSON com limite de payload e filtro anti-prototype pollution.
   */
  function parseJsonSeguro(textoJson, maxBytes) {
    if (typeof textoJson !== 'string') {
      return { ok: false, motivo: 'tipo' };
    }

    if (typeof maxBytes === 'number' && maxBytes > 0) {
      if (textoJson.length > maxBytes || calcularBytesUTF8(textoJson) > maxBytes) {
        return { ok: false, motivo: 'tamanho' };
      }
    }

    try {
      var parsed = JSON.parse(textoJson, function (chave, valor) {
        if (ehChaveProibida(chave)) {
          return undefined;
        }
        return valor;
      });
      return { ok: true, valor: parsed };
    } catch (erroParse) {
      return { ok: false, motivo: 'sintaxe' };
    }
  }

  /**
   * Valida identificadores alfanumericos (letras, numeros, '_' e '-') ate MAX_ID_LENGTH.
   */
  function sanitizarIdSeguro(valor, prefixoFallback) {
    if (valor == null) {
      return prefixoFallback ? gerarId(prefixoFallback) : null;
    }

    var str = String(valor).trim();
    if (
      str &&
      str.length <= MAX_ID_LENGTH &&
      !ehChaveProibida(str) &&
      /^[A-Za-z0-9_-]+$/.test(str)
    ) {
      return str;
    }

    return prefixoFallback ? gerarId(prefixoFallback) : null;
  }

  /**
   * Valida data no formato estrito 'YYYY-MM-DD' conferindo calendario real.
   */
  function ehDataISOValida(valor) {
    if (typeof valor !== 'string') {
      return false;
    }

    var trimmed = valor.trim();
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (!match) {
      return false;
    }

    var ano = parseInt(match[1], 10);
    var mes = parseInt(match[2], 10);
    var dia = parseInt(match[3], 10);

    if (ano < 2000 || ano > 2100 || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      return false;
    }

    var dt = new Date(ano, mes - 1, dia);
    return (
      dt.getFullYear() === ano &&
      (dt.getMonth() + 1) === mes &&
      dt.getDate() === dia
    );
  }

  /**
   * Retorna dataISO validada ou fallback local seguro.
   */
  function sanitizarDataISOSegura(valor, fallbackDateObj) {
    return ehDataISOValida(valor)
      ? String(valor).trim()
      : getDataLocalISO(fallbackDateObj);
  }

  function clonarAluno(aluno) {
    return {
      id: aluno.id,
      nome: aluno.nome,
      chave: aluno.chave
    };
  }

  function sanitizarStickerId(valor) {
    if (typeof valor !== 'string') return null;
    var limpo = valor.trim().toLowerCase();
    if (!limpo) return null;
    if (limpo === '__proto__' || limpo === 'constructor' || limpo === 'prototype') {
      return null;
    }
    if (limpo === 'none') return 'none';
    return /^[a-z0-9_-]{1,48}$/.test(limpo) ? limpo : null;
  }

  function clonarPalavra(item) {
    return {
      id: item.id,
      palavra: item.palavra,
      plain: item.plain,
      silabasRaw: item.silabasRaw,
      silabas: item.silabas.slice(),
      dica: item.dica,
      frase: item.frase,
      stickerId: sanitizarStickerId(item && item.stickerId)
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
      var item = sanitizarTextoSeguro(lista[i], 60, false);
      if (item && limpa.indexOf(item) === -1) {
        limpa.push(item);
      }
    }
    return limpa;
  }

  function sanitizarMapaContagem(mapa) {
    var limpo = {};
    if (!ehObjetoPlano(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    var inseridas = 0;
    for (var i = 0; i < chaves.length && inseridas < MAX_MAP_KEYS; i += 1) {
      var k = chaves[i];
      if (ehChaveProibida(k)) {
        continue;
      }
      var kLimpa = sanitizarTextoSeguro(k, 60, false);
      var bruto = mapa[k];
      if (!kLimpa || ehChaveProibida(kLimpa) || bruto === null || bruto === undefined || bruto === '') {
        continue;
      }
      var num = Number(bruto);
      if (isFinite(num) && num >= 0) {
        if (!Object.prototype.hasOwnProperty.call(limpo, kLimpa)) {
          inseridas += 1;
        }
        limpo[kLimpa] = Math.floor(num);
      }
    }
    return limpo;
  }

  /**
   * Preserva tanto objetos detalhados do Analytics quanto mapas numericos simples.
   */
  function sanitizarErrosSilabas(mapa) {
    var limpo = {};
    if (!ehObjetoPlano(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    var inseridas = 0;
    for (var i = 0; i < chaves.length && inseridas < MAX_MAP_KEYS; i += 1) {
      var k = chaves[i];
      if (ehChaveProibida(k)) {
        continue;
      }
      var kLimpa = sanitizarTextoSeguro(k, 60, false);
      var bruto = mapa[k];
      if (!kLimpa || ehChaveProibida(kLimpa) || bruto === null || bruto === undefined || bruto === '') {
        continue;
      }
      if (ehObjetoPlano(bruto)) {
        if (!Object.prototype.hasOwnProperty.call(limpo, kLimpa)) {
          inseridas += 1;
        }
        limpo[kLimpa] = {
          count: sanitizarNumeroNaoNegativo(bruto.count),
          palavras: sanitizarListaTextos(bruto.palavras, 5),
          confusoes: sanitizarMapaContagem(bruto.confusoes)
        };
      } else {
        var num = Number(bruto);
        if (isFinite(num) && num >= 0) {
          if (!Object.prototype.hasOwnProperty.call(limpo, kLimpa)) {
            inseridas += 1;
          }
          limpo[kLimpa] = {
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
    if (!ehObjetoPlano(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    var inseridas = 0;
    for (var i = 0; i < chaves.length && inseridas < MAX_MAP_KEYS; i += 1) {
      var k = chaves[i];
      if (ehChaveProibida(k)) {
        continue;
      }
      var kLimpa = sanitizarTextoSeguro(k, 60, false);
      var bruto = mapa[k];
      if (!kLimpa || ehChaveProibida(kLimpa) || bruto === null || bruto === undefined || bruto === '') {
        continue;
      }
      if (ehObjetoPlano(bruto)) {
        if (!Object.prototype.hasOwnProperty.call(limpo, kLimpa)) {
          inseridas += 1;
        }
        limpo[kLimpa] = {
          codigo: sanitizarTextoSeguro(bruto.codigo || kLimpa, 80, false) || kLimpa,
          label: sanitizarTextoSeguro(bruto.label || kLimpa, 80, false) || kLimpa,
          count: sanitizarNumeroNaoNegativo(bruto.count),
          exemplos: sanitizarListaTextos(bruto.exemplos, 5)
        };
      } else {
        var num = Number(bruto);
        if (isFinite(num) && num >= 0) {
          if (!Object.prototype.hasOwnProperty.call(limpo, kLimpa)) {
            inseridas += 1;
          }
          limpo[kLimpa] = {
            codigo: kLimpa,
            label: kLimpa,
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
    if (!ehObjetoPlano(mapa)) {
      return limpo;
    }
    var chaves = Object.keys(mapa);
    var inseridas = 0;
    for (var i = 0; i < chaves.length && inseridas < MAX_MAP_KEYS; i += 1) {
      var k = chaves[i];
      if (ehChaveProibida(k)) {
        continue;
      }
      var kLimpa = sanitizarTextoSeguro(k, 60, false);
      var bruto = mapa[k];
      if (!kLimpa || ehChaveProibida(kLimpa) || !ehObjetoPlano(bruto)) {
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(limpo, kLimpa)) {
        inseridas += 1;
      }
      limpo[kLimpa] = {
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
    var raw = ehObjetoPlano(entrada) ? entrada : {};
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

    var dataValida = sanitizarDataISOSegura(raw.dataISO, new Date(criadaEm));

    var alunoIdBruto = raw.alunoId !== undefined && raw.alunoId !== null
      ? sanitizarTextoSeguro(raw.alunoId, MAX_ID_LENGTH, false)
      : '';
    var alunoIdLimpo = (alunoIdBruto && alunoIdBruto !== 'TURMA' && alunoIdBruto !== 'TODOS')
      ? sanitizarIdSeguro(alunoIdBruto, null)
      : null;

    var alunoNomeLimpo = alunoIdLimpo || raw.alunoNome
      ? sanitizarTextoSeguro(raw.alunoNome, MAX_ANOTACAO_ALUNO_NOME, false)
      : '';
    if (!alunoIdLimpo && alunoNomeLimpo === 'Turma geral') {
      alunoNomeLimpo = '';
    }

    var idLimpo = sanitizarIdSeguro(raw.id, 'ano');

    return {
      id: idLimpo,
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
    var idsVistos = Object.create(null);

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
   *
   * [RETROCOMPATIBILIDADE v2.1.x] Aceita sessões com fasesStats ausente ou incompleto,
   * preservando métricas antigas sem inventar dados das fases não registradas.
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
    var raw = ehObjetoPlano(entrada) ? entrada : {};
    var ts = typeof raw.timestamp === 'number' && isFinite(raw.timestamp) && raw.timestamp > 0
      ? raw.timestamp
      : Date.now();
    var fin = typeof raw.finalizadaEm === 'number' && isFinite(raw.finalizadaEm) && raw.finalizadaEm > 0
      ? raw.finalizadaEm
      : ts;

    var dataValida = sanitizarDataISOSegura(raw.dataISO, new Date(ts));

    var alunoNome = sanitizarTextoSeguro(raw.alunoNome, MAX_ALUNO_NOME, false);
    var alunoChave = raw.alunoChave
      ? normalizarChave(sanitizarTextoSeguro(raw.alunoChave, MAX_ALUNO_NOME, false))
      : normalizarChave(alunoNome);
    var palavrasStats = sanitizarPalavrasStats(raw.palavrasStats);

    var palavras = [];
    if (Array.isArray(raw.palavrasTrabalhadas)) {
      for (var i = 0; i < raw.palavrasTrabalhadas.length && palavras.length < MAX_PALAVRAS_TRABALHADAS_SESSAO; i += 1) {
        var pal = sanitizarTextoSeguro(raw.palavrasTrabalhadas[i], 60, false);
        if (pal && palavras.indexOf(pal) === -1) {
          palavras.push(pal);
        }
      }
    } else {
      palavras = Object.keys(palavrasStats).slice(0, MAX_PALAVRAS_TRABALHADAS_SESSAO);
    }

    var tentativas = sanitizarNumeroNaoNegativo(raw.tentativas);
    var fonteLimpa = sanitizarTextoSeguro(raw.fontePalavras || 'padrao', 32, false) || 'padrao';

    return {
      id: sanitizarIdSeguro(raw.id, 'ses'),
      dataISO: dataValida,
      timestamp: ts,
      finalizadaEm: fin,
      alunoId: raw.alunoId ? sanitizarIdSeguro(raw.alunoId, null) : null,
      alunoNome: alunoNome,
      alunoChave: alunoChave,
      modoJogo: sanitizarTextoSeguro(raw.modoJogo, 32, false),
      fontePalavras: fonteLimpa,
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
    if (!ehObjetoPlano(bruto)) {
      return base;
    }

    // Turma (protegida contra chaves reservadas e limitada a MAX_ALUNOS)
    if (Array.isArray(bruto.turma)) {
      var chavesVistas = Object.create(null);
      var idsAlunosVistos = Object.create(null);
      for (var i = 0; i < bruto.turma.length && base.turma.length < MAX_ALUNOS; i += 1) {
        var itemAluno = bruto.turma[i];
        if (!ehObjetoPlano(itemAluno)) {
          continue;
        }
        var nomeLimpo = sanitizarTextoSeguro(itemAluno.nome, MAX_ALUNO_NOME, false);
        var chave = normalizarChave(
          itemAluno.chave
            ? sanitizarTextoSeguro(itemAluno.chave, MAX_ALUNO_NOME, false)
            : nomeLimpo
        ) || normalizarChave(nomeLimpo);
        if (!nomeLimpo || !chave || chavesVistas[chave]) {
          continue;
        }
        chavesVistas[chave] = true;
        var idAluno = sanitizarIdSeguro(itemAluno.id, 'alu');
        if (idsAlunosVistos[idAluno]) {
          idAluno = gerarId('alu');
        }
        idsAlunosVistos[idAluno] = true;
        base.turma.push({
          id: idAluno,
          nome: nomeLimpo,
          chave: chave
        });
      }
    }

    // Palavras da semana
    if (Array.isArray(bruto.palavrasSemana)) {
      var plainsVistos = Object.create(null);
      var idsPalavrasVistos = Object.create(null);
      for (var j = 0; j < bruto.palavrasSemana.length && base.palavrasSemana.length < MAX_PALAVRAS_SEMANA; j += 1) {
        var itemPal = bruto.palavrasSemana[j];
        if (!ehObjetoPlano(itemPal)) {
          continue;
        }
        var rawSilabas = Array.isArray(itemPal.silabas) && itemPal.silabas.length > 0
          ? itemPal.silabas.join('-')
          : itemPal.silabasRaw;
        var validada = validarDadosPalavra({
          silabasRaw: rawSilabas,
          dica: itemPal.dica,
          frase: itemPal.frase,
          stickerId: itemPal.stickerId
        });
        if (!validada.ok || plainsVistos[validada.dados.plain]) {
          continue;
        }
        plainsVistos[validada.dados.plain] = true;
        var idPal = sanitizarIdSeguro(itemPal.id, 'pal');
        if (idsPalavrasVistos[idPal]) {
          idPal = gerarId('pal');
        }
        idsPalavrasVistos[idPal] = true;
        base.palavrasSemana.push({
          id: idPal,
          palavra: validada.dados.palavra,
          plain: validada.dados.plain,
          silabasRaw: validada.dados.silabasRaw,
          silabas: validada.dados.silabas,
          dica: validada.dados.dica,
          frase: validada.dados.frase,
          stickerId: validada.dados.stickerId
        });
      }
    }

    // Sessoes (limita aos ultimos 500 registros e garante unicidade de ID)
    if (Array.isArray(bruto.sessoes)) {
      var inicio = bruto.sessoes.length > MAX_SESSOES ? bruto.sessoes.length - MAX_SESSOES : 0;
      var idsSessoesVistos = Object.create(null);
      for (var k = inicio; k < bruto.sessoes.length; k += 1) {
        if (ehObjetoPlano(bruto.sessoes[k])) {
          var sesLimpa = sanitizarSessao(bruto.sessoes[k]);
          if (idsSessoesVistos[sesLimpa.id]) {
            sesLimpa.id = gerarId('ses');
          }
          idsSessoesVistos[sesLimpa.id] = true;
          base.sessoes.push(sesLimpa);
        }
      }
    }

    // [RETROCOMPATIBILIDADE v2.1.x] Backups sem anotacoes recebem lista vazia segura.
    base.anotacoes = sanitizarAnotacoes(bruto.anotacoes);

    // Configuracao
    if (ehObjetoPlano(bruto.config)) {
      base.config.modo = bruto.config.modo === 'livre' ? 'livre' : 'aula';
      base.config.fase1ModoSemana = bruto.config.fase1ModoSemana === 'silaba' ? 'silaba' : 'dica';
      base.config.palavrasSemanaAtivo = Boolean(
        bruto.config.palavrasSemanaAtivo && base.palavrasSemana.length >= 4
      );
      base.config.periodosLetivos = sanitizarPeriodosLetivos(bruto.config.periodosLetivos);
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
      var resParse = parseJsonSeguro(raw, null);
      if (!resParse.ok) {
        // Retorna estrutura limpa caso o JSON armazenado esteja corrompido
        return criarEstruturaPadrao();
      }
      return sanitizarDados(resParse.valor);
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
      // Fallback operacional: mantém dados em memória se localStorage estiver cheio ou bloqueado.
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
      fase1ModoSemana: dados.config.fase1ModoSemana,
      periodosLetivos: clonarPeriodosLetivos(dados.config.periodosLetivos)
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
      fase1ModoSemana: dados.config.fase1ModoSemana,
      periodosLetivos: clonarPeriodosLetivos(dados.config.periodosLetivos)
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
      fase1ModoSemana: dados.config.fase1ModoSemana,
      periodosLetivos: clonarPeriodosLetivos(dados.config.periodosLetivos)
    };
  }

  function getPeriodosLetivos() {
    var dados = carregarDados();
    return clonarPeriodosLetivos(dados.config.periodosLetivos);
  }

  function validarEstruturaPeriodos(cfgPeriodos) {
    if (!ehObjetoPlano(cfgPeriodos)) {
      return {
        ok: false,
        erro: 'Configuração de períodos letivos inválida.'
      };
    }

    var periods = getPeriodsModule();
    if (periods && typeof periods.validarCiclos === 'function') {
      var validacao = periods.validarCiclos(cfgPeriodos.ciclos);
      if (!validacao.ok) {
        return {
          ok: false,
          erro: validacao.erro || 'Os intervalos de datas dos períodos letivos são inválidos.'
        };
      }
    } else if (!Array.isArray(cfgPeriodos.ciclos) || cfgPeriodos.ciclos.length === 0) {
      return {
        ok: false,
        erro: 'Os intervalos de datas dos períodos letivos são inválidos.'
      };
    }

    return { ok: true };
  }

  function salvarPeriodosLetivos(novaConfig) {
    var validacao = validarEstruturaPeriodos(novaConfig);
    if (!validacao.ok) {
      return validacao;
    }

    var dados = carregarDados();
    dados.config.periodosLetivos = sanitizarPeriodosLetivos(novaConfig);
    salvarDados(dados);

    return {
      ok: true,
      periodosLetivos: clonarPeriodosLetivos(dados.config.periodosLetivos)
    };
  }

  function definirModeloPeriodos(modelo, ano) {
    var modeloNorm = modelo === 'trimestre' ? 'trimestre' : 'bimestre';
    var dados = carregarDados();
    dados.config.periodosLetivos = criarPeriodosPadrao(modeloNorm, ano);
    salvarDados(dados);

    return {
      ok: true,
      periodosLetivos: clonarPeriodosLetivos(dados.config.periodosLetivos)
    };
  }

  // =========================================================================
  // TURMA
  // =========================================================================

  /**
   * Valida e prepara objeto de aluno sem persistir (reaproveitado em lote).
   */
  function validarNovoAluno(nomeOriginal, listaAtual) {
    if (Array.isArray(listaAtual) && listaAtual.length >= MAX_ALUNOS) {
      return {
        ok: false,
        motivo: 'limite',
        erro: 'Limite máximo de ' + MAX_ALUNOS + ' alunos cadastrados na turma atingido.'
      };
    }

    var nomeLimpo = sanitizarTextoSeguro(nomeOriginal, MAX_ALUNO_NOME, false);

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
    var fraseLimpa = sanitizarTextoSeguro(fraseBruta, 400, false).toUpperCase();

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
  var MAX_PALAVRA_LETRAS = 30;
  var MAX_PALAVRA_SILABAS = 12;

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

    if (silabas.length > MAX_PALAVRA_SILABAS) {
      return {
        ok: false,
        erro: 'A palavra pode ter no máximo ' + MAX_PALAVRA_SILABAS + ' sílabas.'
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

    if (plain.length > MAX_PALAVRA_LETRAS) {
      return {
        ok: false,
        erro: 'A palavra pode ter no máximo ' + MAX_PALAVRA_LETRAS + ' letras.'
      };
    }

    if (palavra.length !== plain.length) {
      return {
        ok: false,
        erro: 'Use apenas letras e hífens para separar as sílabas (ex.: PA-LHA-ÇO).'
      };
    }

    var dicaLimpa = sanitizarTextoSeguro(obj.dica, 400, false).toUpperCase();

    var fraseProcessada = processarFraseSemana(obj.frase, plain);
    var stickerIdLimpo = sanitizarStickerId(obj.stickerId);

    return {
      ok: true,
      dados: {
        palavra: palavra,
        plain: plain,
        silabasRaw: silabas.join('-'),
        silabas: silabas,
        dica: dicaLimpa,
        frase: fraseProcessada,
        stickerId: stickerIdLimpo
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
      frase: validacao.dados.frase,
      stickerId: validacao.dados.stickerId
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

    var temStickerNaEntrada = entrada && typeof entrada === 'object' &&
      Object.prototype.hasOwnProperty.call(entrada, 'stickerId');

    var atualizado = {
      id: id,
      palavra: validacao.dados.palavra,
      plain: validacao.dados.plain,
      silabasRaw: validacao.dados.silabasRaw,
      silabas: validacao.dados.silabas,
      dica: validacao.dados.dica,
      frase: validacao.dados.frase,
      stickerId: temStickerNaEntrada
        ? validacao.dados.stickerId
        : sanitizarStickerId(dados.palavrasSemana[idx].stickerId)
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
    var proibidas = Object.create(null);
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
    var escolhidas = Object.create(null);

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

      var stickersMod = global.SaudeEscola && global.SaudeEscola.Stickers;
      var stickerExplicit = sanitizarStickerId(item.stickerId);
      var stickerResolvido = null;
      if (stickerExplicit === 'none') {
        stickerResolvido = null;
      } else if (stickerExplicit && stickersMod && typeof stickersMod.getById === 'function') {
        stickerResolvido = stickersMod.getById(stickerExplicit);
      } else if (!stickerExplicit && stickersMod && typeof stickersMod.matchByWord === 'function') {
        stickerResolvido = stickersMod.matchByWord(item.plain || item.palavra);
      }
      var temSticker = Boolean(stickerResolvido && stickerResolvido.svg);

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
        svg: temSticker ? stickerResolvido.svg : SVGs.ILUSTRACAO_SEMANA,
        stickerId: stickerExplicit === 'none'
          ? 'none'
          : (stickerResolvido ? stickerResolvido.id : null),
        hasSticker: temSticker,
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
    var idBruto = alunoId !== undefined && alunoId !== null
      ? sanitizarTextoSeguro(alunoId, MAX_ID_LENGTH, false)
      : '';
    if (!idBruto || idBruto === 'TURMA' || idBruto === 'TODOS') {
      return { alunoId: null, alunoNome: '' };
    }

    var idLimpo = sanitizarIdSeguro(idBruto, null);
    if (!idLimpo) {
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
      if (!ehObjetoPlano(item)) {
        continue;
      }

      var rawName = sanitizarTextoSeguro(item.name, MAX_RANKING_NAME_LENGTH, false);
      var nomeLimpo = rawName || 'ALUNO';

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
        var resParse = parseJsonSeguro(raw, null);
        if (!resParse.ok) {
          return [];
        }
        return sanitizarListaRanking(resParse.valor);
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
   * Importa um backup JSON aplicando validacao estrita de esquema, limites,
   * protecao anti-prototype pollution, sanitizarDados() e sanitizacao de Ranking.
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
      var resParse = parseJsonSeguro(texto, MAX_BACKUP_BYTES);
      if (!resParse.ok) {
        if (resParse.motivo === 'tamanho') {
          return {
            ok: false,
            erro: 'O arquivo de backup excede o limite máximo permitido de 2 MB.'
          };
        }
        return {
          ok: false,
          erro: 'Arquivo inválido: o conteúdo não é um JSON válido.'
        };
      }
      parsed = resParse.valor;
    } else if (ehObjetoPlano(conteudoBruto)) {
      parsed = conteudoBruto;
    } else {
      return {
        ok: false,
        erro: 'Formato de backup não reconhecido.'
      };
    }

    if (!ehObjetoPlano(parsed)) {
      return {
        ok: false,
        erro: 'Estrutura de backup inválida.'
      };
    }

    // Validacao estrita dos metadados opcionais do envelope (retrocompativel)
    if (parsed.tipo !== undefined && parsed.tipo !== 'saude_escola_backup') {
      return {
        ok: false,
        erro: 'Tipo de arquivo de backup não reconhecido.'
      };
    }

    if (
      parsed.versaoBackup !== undefined &&
      (
        typeof parsed.versaoBackup !== 'number' ||
        !isFinite(parsed.versaoBackup) ||
        Math.floor(parsed.versaoBackup) !== parsed.versaoBackup ||
        parsed.versaoBackup < 1 ||
        parsed.versaoBackup > 10
      )
    ) {
      return {
        ok: false,
        erro: 'Versão de backup não suportada.'
      };
    }

    if (parsed.dataISO !== undefined && !ehDataISOValida(parsed.dataISO)) {
      return {
        ok: false,
        erro: 'A data registrada no arquivo de backup é inválida.'
      };
    }

    if (parsed.saudeEscola_v2_dados !== undefined && !ehObjetoPlano(parsed.saudeEscola_v2_dados)) {
      return {
        ok: false,
        erro: 'A seção de dados pedagógicos do backup está corrompida.'
      };
    }

    if (parsed.dados !== undefined && !ehObjetoPlano(parsed.dados)) {
      return {
        ok: false,
        erro: 'A seção de dados pedagógicos do backup está corrompida.'
      };
    }

    if (
      (parsed.saudeBucalRanking !== undefined && !Array.isArray(parsed.saudeBucalRanking)) ||
      (parsed.ranking !== undefined && !Array.isArray(parsed.ranking))
    ) {
      return {
        ok: false,
        erro: 'A seção de Ranking do backup está corrompida.'
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
    if (!ehObjetoPlano(origemDados)) {
      return {
        ok: false,
        erro: 'A seção de dados pedagógicos do backup está corrompida.'
      };
    }

    if (
      (origemDados.config !== undefined && !ehObjetoPlano(origemDados.config)) ||
      (origemDados.turma !== undefined && !Array.isArray(origemDados.turma)) ||
      (origemDados.palavrasSemana !== undefined && !Array.isArray(origemDados.palavrasSemana)) ||
      (origemDados.sessoes !== undefined && !Array.isArray(origemDados.sessoes)) ||
      (origemDados.anotacoes !== undefined && !Array.isArray(origemDados.anotacoes) && typeof origemDados.anotacoes !== 'string')
    ) {
      return {
        ok: false,
        erro: 'A seção de dados pedagógicos do backup contém campos com formato inválido.'
      };
    }

    if (
      origemDados.config &&
      origemDados.config.periodosLetivos !== undefined
    ) {
      var valPeriodosBackup = validarEstruturaPeriodos(origemDados.config.periodosLetivos);
      if (!valPeriodosBackup.ok) {
        return {
          ok: false,
          erro: 'A configuração de períodos letivos do backup está corrompida.'
        };
      }
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
  /**
   * Contrato público de SaudeEscola.Storage.
   *
   * API de leitura: carregarDados(), listarAlunos(), listarPalavrasSemana(),
   * listarSessoes(), listarAnotacoes(), getConfig() e getPeriodosLetivos().
   *
   * API de escrita: adicionar/atualizar/remover os registros, salvarDados(),
   * salvarSessao(), salvarPeriodosLetivos() e gerarBackupJSON().
   *
   * Efeitos colaterais: métodos de gravação usam as chaves saudeEscola_v2_dados
   * e saudeBucalRanking no localStorage. Se o navegador bloqueia ou impede
   * persistência, o módulo mantém o fallback próprio em memória.
   *
   * Importação: importarBackupJSON(texto) exige texto JSON, respeita limite de
   * tamanho, valida o envelope e retorna resultado estruturado. O chamador não
   * precisa interpretar dados brutos: todos os dados retornados são sanitizados.
   */
  global.SaudeEscola.Storage = {
    STORAGE_KEY: STORAGE_KEY,
    RANKING_STORAGE_KEY: RANKING_STORAGE_KEY,
    MAX_ALUNOS: MAX_ALUNOS,
    MAX_BACKUP_BYTES: MAX_BACKUP_BYTES,
    SVGs: SVGs,

    normalizarChave: normalizarChave,
    normalizarPlain: normalizarPlain,
    sanitizarTextoSeguro: sanitizarTextoSeguro,
    sanitizarIdSeguro: sanitizarIdSeguro,
    ehDataISOValida: ehDataISOValida,
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
    getPeriodosLetivos: getPeriodosLetivos,
    salvarPeriodosLetivos: salvarPeriodosLetivos,
    definirModeloPeriodos: definirModeloPeriodos,

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
