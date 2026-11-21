/**
 * stickers/index.js — Registro Central e Motor de Correspondência de Figurinhas
 * Agrega as categorias registradas em `window.SaudeEscola.StickersData`,
 * normaliza identificadores/palavras-chave em Português e expõe a API
 * pública `window.SaudeEscola.Stickers` (100% Vanilla JS / offline).
 */
(function (global) {
  'use strict';

  global.SaudeEscola = global.SaudeEscola || {};
  global.SaudeEscola.StickersData = global.SaudeEscola.StickersData || {};

  // Ordem preferencial de exibição das categorias no Painel da Professora
  var ORDEM_CATEGORIAS = ['animais', 'frutas', 'natureza', 'escola', 'brinquedos'];
  var CHAVES_PROIBIDAS = Object.create(null);
  CHAVES_PROIBIDAS.__proto__ = true;
  CHAVES_PROIBIDAS.constructor = true;
  CHAVES_PROIBIDAS.prototype = true;

  var cacheAssinatura = '';
  var cacheCategorias = [];
  var cacheTodos = [];
  var cachePorId = Object.create(null);
  var cachePorCategoria = Object.create(null);
  var cachePorPalavra = Object.create(null);

  /**
   * Normaliza uma palavra para comparação sem acentos, hífens ou pontuação.
   * Ex.: "Ma-çã!" -> "MACA".
   */
  function normalizarChave(texto) {
    if (typeof texto !== 'string') return '';
    return texto
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Gera variantes candidatas (exata + singularizações simples do Português)
   * em ordem de prioridade para matching automático sem falsos positivos.
   */
  function gerarCandidatosBusca(chaveNormalizada) {
    var lista = [];
    var vistos = Object.create(null);

    function adicionar(cand) {
      if (cand && cand.length >= 2 && !vistos[cand]) {
        vistos[cand] = true;
        lista.push(cand);
      }
    }

    adicionar(chaveNormalizada);

    if (chaveNormalizada.length <= 3) {
      return lista;
    }

    // 1. Plurais terminados em -ÕES / -ÃES (ex.: LIMÕES -> LIMAO, PÃES -> PAO)
    if (chaveNormalizada.slice(-3) === 'OES' || chaveNormalizada.slice(-3) === 'AES') {
      adicionar(chaveNormalizada.slice(0, -3) + 'AO');
    }

    // 2. Plurais em vogal + IS (ex.: ANIMAIS -> ANIMAL, PAPÉIS -> PAPEL, FARÓIS -> FAROL, AZUIS -> AZUL)
    if (chaveNormalizada.slice(-3) === 'AIS') {
      adicionar(chaveNormalizada.slice(0, -3) + 'AL');
    } else if (chaveNormalizada.slice(-3) === 'EIS') {
      adicionar(chaveNormalizada.slice(0, -3) + 'EL');
    } else if (chaveNormalizada.slice(-3) === 'OIS') {
      adicionar(chaveNormalizada.slice(0, -3) + 'OL');
    } else if (chaveNormalizada.slice(-3) === 'UIS') {
      adicionar(chaveNormalizada.slice(0, -3) + 'UL');
    } else if (chaveNormalizada.slice(-2) === 'IS' && chaveNormalizada.length >= 4) {
      // Ex.: FUNIS -> FUNIL
      adicionar(chaveNormalizada.slice(0, -2) + 'IL');
    }

    // 3. Plural simples em -S (ex.: PEIXES -> PEIXE, CAVALOS -> CAVALO, MAÇÃS -> MACA)
    if (chaveNormalizada.slice(-1) === 'S') {
      adicionar(chaveNormalizada.slice(0, -1));
    }

    // 4. Plural em -ES (ex.: FLORES -> FLOR, COLHERES -> COLHER, NOZES -> NOZ)
    if (chaveNormalizada.slice(-2) === 'ES' && chaveNormalizada.length >= 5) {
      adicionar(chaveNormalizada.slice(0, -2));
    }

    return lista;
  }

  function clonarSticker(item) {
    if (!item) return null;
    return {
      id: item.id,
      label: item.label,
      category: item.category,
      keywords: item.keywords.slice(),
      svg: item.svg
    };
  }

  /**
   * Calcula assinatura leve das categorias carregadas em StickersData para
   * reconstruir o índice apenas quando alguma categoria nova for registrada.
   */
  function calcularAssinaturaDados(data) {
    if (!data || typeof data !== 'object') return '';
    var keys = Object.keys(data);
    var partes = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (CHAVES_PROIBIDAS[k]) continue;
      var cat = data[k];
      var len = cat && Array.isArray(cat.items) ? cat.items.length : 0;
      partes.push(k + ':' + len);
    }
    return partes.join('|');
  }

  /**
   * Reconstrói índices em memória (categorias, mapa por ID e mapa por palavra-chave).
   */
  function garantirIndice() {
    var data = global.SaudeEscola && global.SaudeEscola.StickersData;
    var assinatura = calcularAssinaturaDados(data);
    if (assinatura === cacheAssinatura && cacheCategorias.length > 0) {
      return;
    }

    cacheAssinatura = assinatura;
    cacheCategorias = [];
    cacheTodos = [];
    cachePorId = Object.create(null);
    cachePorCategoria = Object.create(null);
    cachePorPalavra = Object.create(null);

    if (!data || typeof data !== 'object') return;

    var chavesBrutas = Object.keys(data);
    var chavesOrdenadas = [];
    var incluidas = Object.create(null);

    for (var i = 0; i < ORDEM_CATEGORIAS.length; i++) {
      var pref = ORDEM_CATEGORIAS[i];
      if (!CHAVES_PROIBIDAS[pref] && Object.prototype.hasOwnProperty.call(data, pref)) {
        chavesOrdenadas.push(pref);
        incluidas[pref] = true;
      }
    }

    for (var j = 0; j < chavesBrutas.length; j++) {
      var k = chavesBrutas[j];
      if (!CHAVES_PROIBIDAS[k] && !incluidas[k]) {
        chavesOrdenadas.push(k);
        incluidas[k] = true;
      }
    }

    for (var c = 0; c < chavesOrdenadas.length; c++) {
      var catKey = chavesOrdenadas[c];
      var rawCat = data[catKey];
      if (!rawCat || !Array.isArray(rawCat.items)) continue;

      var catId = typeof rawCat.id === 'string' && rawCat.id.trim()
        ? rawCat.id.trim().toLowerCase()
        : catKey.toLowerCase();
      var catLabel = typeof rawCat.label === 'string' && rawCat.label.trim()
        ? rawCat.label.trim()
        : catId;

      var itensDaCategoria = [];

      for (var n = 0; n < rawCat.items.length; n++) {
        var rawItem = rawCat.items[n];
        if (!rawItem || typeof rawItem !== 'object') continue;

        var itemId = typeof rawItem.id === 'string' ? rawItem.id.trim().toLowerCase() : '';
        var itemSvg = typeof rawItem.svg === 'string' ? rawItem.svg.trim() : '';
        if (!itemId || !itemSvg || CHAVES_PROIBIDAS[itemId]) continue;

        var itemLabel = typeof rawItem.label === 'string' && rawItem.label.trim()
          ? rawItem.label.trim()
          : itemId;

        var kws = [];
        if (Array.isArray(rawItem.keywords)) {
          for (var kwIdx = 0; kwIdx < rawItem.keywords.length; kwIdx++) {
            var kwNorm = normalizarChave(String(rawItem.keywords[kwIdx] || ''));
            if (kwNorm && kws.indexOf(kwNorm) === -1) {
              kws.push(kwNorm);
            }
          }
        }

        var sticker = {
          id: itemId,
          label: itemLabel,
          category: catId,
          keywords: kws,
          svg: itemSvg
        };

        itensDaCategoria.push(sticker);
        cacheTodos.push(sticker);
        cachePorId[itemId] = sticker;

        // Indexa ID, rótulo normalizado e todas as palavras-chave no dicionário
        var chavesIndex = [normalizarChave(itemId), normalizarChave(itemLabel)].concat(kws);
        for (var idxKey = 0; idxKey < chavesIndex.length; idxKey++) {
          var chave = chavesIndex[idxKey];
          if (chave && !cachePorPalavra[chave]) {
            cachePorPalavra[chave] = sticker;
          }
        }
      }

      if (itensDaCategoria.length > 0) {
        var categoriaFinal = {
          id: catId,
          label: catLabel,
          count: itensDaCategoria.length,
          items: itensDaCategoria
        };
        cacheCategorias.push(categoriaFinal);
        cachePorCategoria[catId] = itensDaCategoria;
      }
    }
  }

  function getCategories() {
    garantirIndice();
    return cacheCategorias.map(function (cat) {
      return {
        id: cat.id,
        label: cat.label,
        count: cat.count,
        items: cat.items.map(clonarSticker)
      };
    });
  }

  function getByCategory(categoryId) {
    garantirIndice();
    if (typeof categoryId !== 'string') return [];
    var key = categoryId.trim().toLowerCase();
    if (!key || CHAVES_PROIBIDAS[key]) return [];
    var lista = cachePorCategoria[key];
    return Array.isArray(lista) ? lista.map(clonarSticker) : [];
  }

  function getAll() {
    garantirIndice();
    return cacheTodos.map(clonarSticker);
  }

  function getById(id) {
    garantirIndice();
    if (typeof id !== 'string') return null;
    var key = id.trim().toLowerCase();
    if (!key || CHAVES_PROIBIDAS[key]) return null;
    return clonarSticker(cachePorId[key] || null);
  }

  function matchByWord(palavra) {
    garantirIndice();
    var chave = normalizarChave(palavra);
    if (!chave) return null;

    var candidatos = gerarCandidatosBusca(chave);
    for (var i = 0; i < candidatos.length; i++) {
      var encontrado = cachePorPalavra[candidatos[i]];
      if (encontrado) {
        return clonarSticker(encontrado);
      }
    }
    return null;
  }

  global.SaudeEscola.Stickers = {
    getCategories: getCategories,
    getByCategory: getByCategory,
    getAll: getAll,
    getById: getById,
    matchByWord: matchByWord
  };
}(window));
