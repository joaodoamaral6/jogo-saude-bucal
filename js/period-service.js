/**
 * ==========================================================================
 * CABEÇALHO ARQUITETURAL — SaudeEscola.Periods
 * ==========================================================================
 * Responsabilidade: períodos letivos, validação de datas ISO e agrupamento
 * de sessões por bimestres/trimestres sem depender de DOM.
 *
 * Dependências: nenhuma obrigatória; pode operar isoladamente em file://.
 *
 * API pública: SaudeEscola.Periods
 * Contrato: gerar/sanitizar períodos, validar datas, localizar ciclos,
 * comparar períodos anteriores e filtrar/agrupar sessões fornecidas por caller.
 *
 * Sumário:
 * 1. Constantes e validação de ano
 * 2. Datas ISO e formatação brasileira
 * 3. Configuração e sanitização de ciclos
 * 4. Filtros, agrupamento e período anterior
 * 5. Exportação pública
 * ==========================================================================
 */
(function (global) {
  'use strict';

  /**
   * Servico de periodos letivos (bimestres, trimestres e intervalos escolares).
   * Modulo puro em JavaScript Vanilla para execucao offline via file://,
   * sem acesso ao DOM e com sanitizacao contra prototype pollution e XSS.
   */
  var MIN_ANO = 2000;
  var MAX_ANO = 2100;
  var MAX_CICLOS = 6;
  var MAX_NOME_LEN = 40;
  var MAX_SIGLA_LEN = 16;
  var MAX_ID_LEN = 32;

  var CHAVES_PROIBIDAS = Object.create(null);
  CHAVES_PROIBIDAS['__proto__'] = true;
  CHAVES_PROIBIDAS['constructor'] = true;
  CHAVES_PROIBIDAS['prototype'] = true;

  /**
   * Verifica se uma chave pertence a propriedades reservadas de prototipo.
   */
  function ehChaveProibida(chave) {
    return Boolean(CHAVES_PROIBIDAS[String(chave)]);
  }

  /**
   * Verifica se o valor e um objeto plano (exclui null e arrays).
   */
  function ehObjetoPlano(valor) {
    return Boolean(valor && typeof valor === 'object' && !Array.isArray(valor));
  }

  /**
   * Remove scripts, estilos, tags HTML, sinais < >, caracteres de controle
   * e normaliza espacos antes de limitar o comprimento maximo do texto.
   */
  function sanitizarTextoLeve(valor, maxLen) {
    var limite = typeof maxLen === 'number' && maxLen > 0 ? Math.floor(maxLen) : MAX_NOME_LEN;
    if (typeof valor !== 'string' && (typeof valor !== 'number' || !isFinite(valor))) {
      return '';
    }

    var texto = String(valor)
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return texto.slice(0, limite).trim();
  }

  /**
   * Normaliza o modelo de periodo letivo aceitando 'trimestre' ou padrao 'bimestre'.
   */
  function normalizarModelo(modelo) {
    return modelo === 'trimestre' ? 'trimestre' : 'bimestre';
  }

  /**
   * Extrai um ano inteiro finito dentro do intervalo permitido [MIN_ANO..MAX_ANO].
   */
  function extrairAnoValido(valor) {
    var num;
    if (typeof valor === 'number') {
      num = valor;
    } else if (typeof valor === 'string' && /^\d{4}$/.test(valor.trim())) {
      num = parseInt(valor.trim(), 10);
    } else {
      return null;
    }

    if (!isFinite(num) || Math.floor(num) !== num) {
      return null;
    }
    if (num < MIN_ANO || num > MAX_ANO) {
      return null;
    }
    return num;
  }

  /**
   * Normaliza o ano letivo usando anoFallback ou o ano atual limitado a [MIN_ANO..MAX_ANO].
   */
  function normalizarAno(ano, anoFallback) {
    var anoDireto = extrairAnoValido(ano);
    if (anoDireto !== null) {
      return anoDireto;
    }

    var fallbackValido = extrairAnoValido(anoFallback);
    if (fallbackValido !== null) {
      return fallbackValido;
    }

    var atual = new Date().getFullYear();
    if (!isFinite(atual)) {
      return MIN_ANO;
    }
    atual = Math.floor(atual);
    if (atual < MIN_ANO) {
      return MIN_ANO;
    }
    if (atual > MAX_ANO) {
      return MAX_ANO;
    }
    return atual;
  }

  /**
   * Retorna a data local atual (ou de um Date valido) no formato 'YYYY-MM-DD'.
   */
  function obterDataLocalISO(dateObj) {
    var ehDateValido = Object.prototype.toString.call(dateObj) === '[object Date]' &&
      !isNaN(dateObj.getTime());
    var d = ehDateValido ? dateObj : new Date();
    var ano = String(d.getFullYear());
    var mes = String(d.getMonth() + 1);
    var dia = String(d.getDate());

    if (mes.length < 2) {
      mes = '0' + mes;
    }
    if (dia.length < 2) {
      dia = '0' + dia;
    }
    return ano + '-' + mes + '-' + dia;
  }

  /**
   * Cria copia isolada de um ciclo letivo sem manter referencias externas.
   */
  function clonarCiclo(ciclo) {
    return {
      id: ciclo.id,
      nome: ciclo.nome,
      sigla: ciclo.sigla,
      inicio: ciclo.inicio,
      fim: ciclo.fim
    };
  }

  /**
   * Valida uma data estrita no formato 'YYYY-MM-DD' conferindo existencia no calendario.
   *
   * Essa validação impede datas impossíveis antes que o filtro ou o agrupamento
   * sejam usados pelo painel, pelos relatórios e pelo PDF.
   */
  function ehDataISOValida(dataISO) {
    if (typeof dataISO !== 'string') {
      return false;
    }

    var trimmed = dataISO.trim();
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (!match) {
      return false;
    }

    var ano = parseInt(match[1], 10);
    var mes = parseInt(match[2], 10);
    var dia = parseInt(match[3], 10);

    if (ano < MIN_ANO || ano > MAX_ANO || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
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
   * Converte 'YYYY-MM-DD' em 'DD/MM/YYYY' ou retorna string sanitizada se invalida.
   */
  function formatarDataBR(dataISO) {
    if (!ehDataISOValida(dataISO)) {
      return sanitizarTextoLeve(dataISO, 32);
    }

    var partes = dataISO.trim().split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }

  /**
   * Converte 'YYYY-MM-DD' em 'DD/MM' para exibicao compacta em graficos e selos.
   */
  function formatarDataCurtaBR(dataISO) {
    if (!ehDataISOValida(dataISO)) {
      return sanitizarTextoLeve(dataISO, 32);
    }

    var partes = dataISO.trim().split('-');
    return partes[2] + '/' + partes[1];
  }

  /**
   * Formata intervalo entre duas datas ISO em padrao brasileiro curto ou completo.
   */
  function formatarIntervaloBR(inicio, fim, curto) {
    var ehCurto = curto === true;
    var iniTxt = ehCurto ? formatarDataCurtaBR(inicio) : formatarDataBR(inicio);
    var fimTxt = ehCurto ? formatarDataCurtaBR(fim) : formatarDataBR(fim);

    if (iniTxt && fimTxt) {
      return iniTxt + ' a ' + fimTxt;
    }
    return iniTxt || fimTxt || '';
  }

  /**
   * Gera a configuracao padrao de bimestres ou trimestres para o ano informado.
   */
  function gerarConfiguracaoPadrao(modelo, ano) {
    var modeloNorm = normalizarModelo(modelo);
    var anoNorm = normalizarAno(ano);
    var prefixoAno = String(anoNorm);
    var ciclos;

    if (modeloNorm === 'trimestre') {
      ciclos = [
        {
          id: 'tri_1',
          nome: '1º Trimestre',
          sigla: '1º Tri',
          inicio: prefixoAno + '-02-01',
          fim: prefixoAno + '-05-15'
        },
        {
          id: 'tri_2',
          nome: '2º Trimestre',
          sigla: '2º Tri',
          inicio: prefixoAno + '-05-16',
          fim: prefixoAno + '-08-31'
        },
        {
          id: 'tri_3',
          nome: '3º Trimestre',
          sigla: '3º Tri',
          inicio: prefixoAno + '-09-01',
          fim: prefixoAno + '-12-31'
        }
      ];
    } else {
      ciclos = [
        {
          id: 'bim_1',
          nome: '1º Bimestre',
          sigla: '1º Bim',
          inicio: prefixoAno + '-02-01',
          fim: prefixoAno + '-04-30'
        },
        {
          id: 'bim_2',
          nome: '2º Bimestre',
          sigla: '2º Bim',
          inicio: prefixoAno + '-05-01',
          fim: prefixoAno + '-07-15'
        },
        {
          id: 'bim_3',
          nome: '3º Bimestre',
          sigla: '3º Bim',
          inicio: prefixoAno + '-08-01',
          fim: prefixoAno + '-10-15'
        },
        {
          id: 'bim_4',
          nome: '4º Bimestre',
          sigla: '4º Bim',
          inicio: prefixoAno + '-10-16',
          fim: prefixoAno + '-12-31'
        }
      ];
    }

    return {
      modelo: modeloNorm,
      ano: anoNorm,
      ciclos: ciclos.map(clonarCiclo)
    };
  }

  /**
   * Valida, sanitiza e ordena uma lista de ciclos letivos garantindo ausencia de sobreposicoes.
   */
  function validarCiclos(ciclos) {
    if (!Array.isArray(ciclos) || ciclos.length < 1 || ciclos.length > MAX_CICLOS) {
      return {
        ok: false,
        erro: 'Informe entre 1 e ' + MAX_CICLOS + ' períodos letivos.'
      };
    }

    var idsVistos = Object.create(null);
    var lista = [];

    for (var i = 0; i < ciclos.length; i += 1) {
      var bruto = ciclos[i];
      if (!ehObjetoPlano(bruto)) {
        return {
          ok: false,
          erro: 'O período #' + (i + 1) + ' possui estrutura inválida.'
        };
      }

      if (typeof bruto.id !== 'string') {
        return {
          ok: false,
          erro: 'Identificador inválido no período #' + (i + 1) + '.'
        };
      }

      var id = bruto.id.trim();
      if (
        !id ||
        id.length > MAX_ID_LEN ||
        !/^[A-Za-z0-9_-]+$/.test(id) ||
        ehChaveProibida(id)
      ) {
        return {
          ok: false,
          erro: 'Identificador inválido no período #' + (i + 1) + '.'
        };
      }

      if (idsVistos[id]) {
        return {
          ok: false,
          erro: 'Há períodos letivos com identificador duplicado ("' + id + '").'
        };
      }
      idsVistos[id] = true;

      var nome = sanitizarTextoLeve(bruto.nome, MAX_NOME_LEN);
      if (!nome) {
        return {
          ok: false,
          erro: 'Informe o nome do período #' + (i + 1) + '.'
        };
      }

      var sigla = sanitizarTextoLeve(bruto.sigla, MAX_SIGLA_LEN);
      if (!sigla) {
        sigla = nome.slice(0, 10).trim();
      }

      if (!ehDataISOValida(bruto.inicio) || !ehDataISOValida(bruto.fim)) {
        return {
          ok: false,
          erro: 'Informe datas válidas para o período "' + nome + '".'
        };
      }

      var inicio = bruto.inicio.trim();
      var fim = bruto.fim.trim();

      if (inicio > fim) {
        return {
          ok: false,
          erro: 'A data inicial deve ser anterior ou igual à data final em "' + nome + '".'
        };
      }

      lista.push({
        id: id,
        nome: nome,
        sigla: sigla,
        inicio: inicio,
        fim: fim
      });
    }

    // Ordenacao cronologica crescente pelo inicio do periodo antes de testar conflitos
    lista.sort(function (a, b) {
      return a.inicio.localeCompare(b.inicio);
    });

    for (var j = 1; j < lista.length; j += 1) {
      if (lista[j - 1].fim >= lista[j].inicio) {
        return {
          ok: false,
          erro: 'Os períodos "' + lista[j - 1].nome + '" e "' + lista[j].nome + '" possuem datas sobrepostas.'
        };
      }
    }

    return {
      ok: true,
      ciclos: lista.map(clonarCiclo)
    };
  }

  /**
   * Sanitiza uma configuracao completa de periodos letivos aplicando fallback seguro.
   *
   * [RETROCOMPATIBILIDADE v2.1.x] Configurações legadas podem não informar modelo,
   * ano ou ciclos completos; o sanitizador gera uma configuração válida sem alterar
   * o dataISO das sessões já persistidas.
   */
  function sanitizarConfiguracao(bruto, anoFallback) {
    if (!ehObjetoPlano(bruto)) {
      return gerarConfiguracaoPadrao('bimestre', anoFallback);
    }

    var modelo = normalizarModelo(bruto.modelo);
    var ano = normalizarAno(bruto.ano, anoFallback);
    var res = validarCiclos(bruto.ciclos);

    if (res.ok) {
      return {
        modelo: modelo,
        ano: ano,
        ciclos: res.ciclos
      };
    }

    return gerarConfiguracaoPadrao(modelo, ano);
  }

  /**
   * Resolve uma configuracao recebida como objeto de configuracao ou lista direta de ciclos.
   */
  function resolverConfiguracao(configuracao) {
    if (Array.isArray(configuracao)) {
      var res = validarCiclos(configuracao);
      if (res.ok) {
        var anoInferido = parseInt(res.ciclos[0].inicio.slice(0, 4), 10);
        return {
          modelo: res.ciclos.length === 3 ? 'trimestre' : 'bimestre',
          ano: normalizarAno(anoInferido),
          ciclos: res.ciclos
        };
      }
      return gerarConfiguracaoPadrao('bimestre');
    }

    return sanitizarConfiguracao(configuracao);
  }

  /**
   * Clona profundamente a configuracao retornando objetos isolados de referencias externas.
   */
  function clonarConfiguracao(config) {
    return sanitizarConfiguracao(config);
  }

  /**
   * Verifica se dataISO esta contida no intervalo fechado [inicio..fim].
   */
  function dataNoIntervalo(dataISO, inicio, fim) {
    if (!ehDataISOValida(dataISO) || !ehDataISOValida(inicio) || !ehDataISOValida(fim)) {
      return false;
    }

    var d = dataISO.trim();
    var ini = inicio.trim();
    var fimNorm = fim.trim();
    return d >= ini && d <= fimNorm;
  }

  /**
   * Encontra e clona o primeiro ciclo da configuracao que contem a dataISO informada.
   */
  function enquadrarDataEmCiclo(dataISO, configuracao) {
    if (!ehDataISOValida(dataISO)) {
      return null;
    }

    var config = resolverConfiguracao(configuracao);
    for (var i = 0; i < config.ciclos.length; i += 1) {
      var ciclo = config.ciclos[i];
      if (dataNoIntervalo(dataISO, ciclo.inicio, ciclo.fim)) {
        return clonarCiclo(ciclo);
      }
    }

    return null;
  }

  /**
   * Procura na configuracao o ciclo com o id informado e retorna uma copia (ou null).
   */
  function obterCicloPorId(configuracao, periodoId) {
    var idAlvo = periodoId == null ? '' : String(periodoId);
    if (!idAlvo) {
      return null;
    }

    var config = resolverConfiguracao(configuracao);
    for (var i = 0; i < config.ciclos.length; i += 1) {
      if (config.ciclos[i].id === idAlvo) {
        return clonarCiclo(config.ciclos[i]);
      }
    }

    return null;
  }

  /**
   * Retorna copia do ciclo imediatamente anterior ao periodoId na ordem cronologica (ou null).
   */
  function obterCicloAnterior(configuracao, periodoId) {
    var idAlvo = periodoId == null ? '' : String(periodoId);
    if (!idAlvo) {
      return null;
    }

    var config = resolverConfiguracao(configuracao);
    var ciclos = config.ciclos;
    for (var i = 0; i < ciclos.length; i += 1) {
      if (ciclos[i].id === idAlvo) {
        return i > 0 ? clonarCiclo(ciclos[i - 1]) : null;
      }
    }

    return null;
  }

  /**
   * Filtra sessoes cuja propriedade dataISO esteja dentro do intervalo de periodoOuIntervalo.
   */
  function filtrarSessoesPorPeriodo(sessoes, periodoOuIntervalo) {
    if (!Array.isArray(sessoes)) {
      return [];
    }
    if (!periodoOuIntervalo) {
      return sessoes.slice();
    }

    var inicio = ehObjetoPlano(periodoOuIntervalo) ? periodoOuIntervalo.inicio : null;
    var fim = ehObjetoPlano(periodoOuIntervalo) ? periodoOuIntervalo.fim : null;

    var filtradas = [];
    for (var i = 0; i < sessoes.length; i += 1) {
      var s = sessoes[i];
      if (s && typeof s === 'object' && !Array.isArray(s) && dataNoIntervalo(s.dataISO, inicio, fim)) {
        filtradas.push(s);
      }
    }

    return filtradas;
  }

  /**
   * Agrupa sessoes pelos ciclos da configuracao e separa as que ficarem fora dos intervalos.
   */
  function agruparSessoesPorCiclo(sessoes, configuracao) {
    var config = resolverConfiguracao(configuracao);
    var grupos = [];
    var foraDosCiclos = [];

    for (var i = 0; i < config.ciclos.length; i += 1) {
      grupos.push({
        ciclo: clonarCiclo(config.ciclos[i]),
        sessoes: []
      });
    }

    if (!Array.isArray(sessoes)) {
      return {
        grupos: grupos,
        foraDosCiclos: foraDosCiclos
      };
    }

    for (var j = 0; j < sessoes.length; j += 1) {
      var s = sessoes[j];
      if (!s || typeof s !== 'object' || Array.isArray(s)) {
        continue;
      }

      var alocada = false;
      for (var k = 0; k < grupos.length; k += 1) {
        var cicloGrupo = grupos[k].ciclo;
        if (dataNoIntervalo(s.dataISO, cicloGrupo.inicio, cicloGrupo.fim)) {
          grupos[k].sessoes.push(s);
          alocada = true;
          break;
        }
      }

      if (!alocada) {
        foraDosCiclos.push(s);
      }
    }

    return {
      grupos: grupos,
      foraDosCiclos: foraDosCiclos
    };
  }

  /**
   * Sugere o ciclo ativo priorizando o ultimo ciclo com sessoes registradas,
   * depois o ciclo que contem dataHojeISO (ou data local atual se omitida)
   * e, por fim, o primeiro ciclo disponivel.
   */
  function sugerirCicloAtivo(sessoes, configuracao, dataHojeISO) {
    var config = resolverConfiguracao(configuracao);
    if (!config.ciclos.length) {
      return null;
    }

    var agrupado = agruparSessoesPorCiclo(sessoes, config);
    for (var i = agrupado.grupos.length - 1; i >= 0; i -= 1) {
      if (agrupado.grupos[i].sessoes.length > 0) {
        return clonarCiclo(agrupado.grupos[i].ciclo);
      }
    }

    var dataReferencia = (dataHojeISO === undefined || dataHojeISO === null)
      ? obterDataLocalISO()
      : dataHojeISO;

    if (ehDataISOValida(dataReferencia)) {
      var cicloAtual = enquadrarDataEmCiclo(dataReferencia, config);
      if (cicloAtual) {
        return cicloAtual;
      }
    }

    return clonarCiclo(config.ciclos[0]);
  }

  global.SaudeEscola = global.SaudeEscola || {};
  /**
   * Contrato público de SaudeEscola.Periods.
   *
   * Recebe configurações e sessões fornecidas pelo chamador e retorna clones,
   * resultados validados ou filtros novos, sem gravar localStorage por conta própria.
   * Caso Storage não esteja disponível, gerarConfiguracaoPadrao continua funcional
   * com bimestres/trimestres calculados localmente.
   */
  global.SaudeEscola.Periods = {
    ehDataISOValida: ehDataISOValida,
    formatarDataBR: formatarDataBR,
    formatarIntervaloBR: formatarIntervaloBR,
    gerarConfiguracaoPadrao: gerarConfiguracaoPadrao,
    validarCiclos: validarCiclos,
    sanitizarConfiguracao: sanitizarConfiguracao,
    clonarConfiguracao: clonarConfiguracao,
    dataNoIntervalo: dataNoIntervalo,
    enquadrarDataEmCiclo: enquadrarDataEmCiclo,
    obterCicloPorId: obterCicloPorId,
    obterCicloAnterior: obterCicloAnterior,
    filtrarSessoesPorPeriodo: filtrarSessoesPorPeriodo,
    agruparSessoesPorCiclo: agruparSessoesPorCiclo,
    sugerirCicloAtivo: sugerirCicloAtivo
  };
})(typeof window !== 'undefined' ? window : globalThis);
