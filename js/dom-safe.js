/* ==========================================================================
   Utilitarios Seguros de DOM e Sanitizacao SVG (Zero Parsing HTML Direto)
   Projeto: Saude na Escola: Saude Bucal
   100% offline (file:// e GitHub Pages), sem ES Modules e sem emojis nativos.
   ========================================================================== */

(function (global) {
  'use strict';

  /* ----------------------------------------------------------------------
     1. Constantes internas de seguranca e namespaces XML/SVG
     ---------------------------------------------------------------------- */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var XLINK_NS = 'http://www.w3.org/1999/xlink';

  /* Chaves protegidas contra poluicao de prototipo ao iterar objetos de atributos */
  var CHAVES_PROIBIDAS = Object.create(null);
  CHAVES_PROIBIDAS['__proto__'] = true;
  CHAVES_PROIBIDAS['constructor'] = true;
  CHAVES_PROIBIDAS['prototype'] = true;

  /* Lista restrita de elementos SVG seguros aceitos na criacao e sanitizacao */
  var SVG_ALLOWED_TAGS = Object.create(null);
  SVG_ALLOWED_TAGS['svg'] = true;
  SVG_ALLOWED_TAGS['g'] = true;
  SVG_ALLOWED_TAGS['path'] = true;
  SVG_ALLOWED_TAGS['circle'] = true;
  SVG_ALLOWED_TAGS['ellipse'] = true;
  SVG_ALLOWED_TAGS['rect'] = true;
  SVG_ALLOWED_TAGS['line'] = true;
  SVG_ALLOWED_TAGS['polyline'] = true;
  SVG_ALLOWED_TAGS['polygon'] = true;
  SVG_ALLOWED_TAGS['defs'] = true;
  SVG_ALLOWED_TAGS['lineargradient'] = true;
  SVG_ALLOWED_TAGS['radialgradient'] = true;
  SVG_ALLOWED_TAGS['stop'] = true;
  SVG_ALLOWED_TAGS['clippath'] = true;
  SVG_ALLOWED_TAGS['mask'] = true;
  SVG_ALLOWED_TAGS['pattern'] = true;
  SVG_ALLOWED_TAGS['title'] = true;
  SVG_ALLOWED_TAGS['desc'] = true;
  SVG_ALLOWED_TAGS['text'] = true;
  SVG_ALLOWED_TAGS['tspan'] = true;
  SVG_ALLOWED_TAGS['use'] = true;

  /* Atributos que carregam URLs ou referencias e exigem validacao de esquema */
  var URL_ATTRS = Object.create(null);
  URL_ATTRS['href'] = true;
  URL_ATTRS['src'] = true;
  URL_ATTRS['xlink:href'] = true;
  URL_ATTRS['formaction'] = true;
  URL_ATTRS['action'] = true;

  /* Propriedades booleanas aplicadas diretamente no objeto DOM em elementos HTML */
  var BOOLEAN_PROPS = Object.create(null);
  BOOLEAN_PROPS['disabled'] = true;
  BOOLEAN_PROPS['checked'] = true;
  BOOLEAN_PROPS['selected'] = true;
  BOOLEAN_PROPS['readOnly'] = true;
  BOOLEAN_PROPS['required'] = true;
  BOOLEAN_PROPS['hidden'] = true;
  BOOLEAN_PROPS['multiple'] = true;

  /* ----------------------------------------------------------------------
     2. Funcoes auxiliares internas de validacao e sanitizacao
     ---------------------------------------------------------------------- */

  /**
   * Verifica se um valor e um objeto plano adequado para mapa de atributos.
   */
  function isPlainObject(obj) {
    return (
      Boolean(obj) &&
      typeof obj === 'object' &&
      !Array.isArray(obj) &&
      typeof obj.nodeType !== 'number'
    );
  }

  /**
   * Verifica se o nome do atributo contem apenas caracteres validos de XML/HTML
   * e nao pertence a lista de chaves proibidas.
   */
  function isValidAttrName(attrName) {
    if (typeof attrName !== 'string' || !attrName) {
      return false;
    }
    var lower = attrName.toLowerCase();
    if (CHAVES_PROIBIDAS[attrName] === true || CHAVES_PROIBIDAS[lower] === true) {
      return false;
    }
    return /^[a-zA-Z_:][a-zA-Z0-9._:-]*$/.test(attrName);
  }

  /**
   * Verifica se um atributo e explicitamente bloqueado por seguranca (handlers on*,
   * style inline ou srcdoc).
   */
  function isBlockedAttrName(lowerName) {
    return /^on/i.test(lowerName) || lowerName === 'style' || lowerName === 'srcdoc';
  }

  /**
   * Valida URLs usadas em atributos HTML como href, src, action e formaction.
   * Bloqueia esquemas ativos (javascript:, vbscript:, data:) mesmo com espacos ou
   * caracteres de controle, alem de caminhos protocol-relative ("//").
   */
  function isSafeHtmlUrl(val) {
    var raw = String(val == null ? '' : val).trim();
    if (!raw) {
      return true;
    }

    /* Normaliza removendo espacos e caracteres de controle ASCII (0x00-0x1F, 0x7F) */
    var normalized = raw.replace(/[\u0000-\u001F\u007F\s]+/g, '');

    /* Bloqueia URLs protocol-relative ("//", "/\", "\\") */
    if (/^[\\/]{2}/.test(normalized)) {
      return false;
    }

    /* Bloqueia esquemas perigosos explicitamente */
    if (/^(?:javascript|vbscript|data):/i.test(normalized)) {
      return false;
    }

    /* Aceita fragmentos internos da propria pagina */
    if (normalized.charAt(0) === '#') {
      return true;
    }

    /* Se houver ':' antes de '/', '?' ou '#', exige esquema seguro conhecido */
    var colonIndex = normalized.indexOf(':');
    if (colonIndex !== -1) {
      var firstSep = normalized.search(/[/?#]/);
      if (firstSep === -1 || colonIndex < firstSep) {
        return /^(?:https?|mailto|tel):/i.test(normalized);
      }
    }

    /* Caminho relativo seguro */
    return true;
  }

  /**
   * Em SVG, aceita exclusivamente referencias internas por ID (ex.: "#gradiente-1").
   */
  function isSafeSvgRef(val) {
    var trimmed = String(val == null ? '' : val).trim();
    return /^#[A-Za-z0-9_-]+$/.test(trimmed);
  }

  /**
   * Aplica atributos data-* de forma segura no elemento, com fallback para
   * setAttribute caso node.dataset nao esteja disponivel ou a chave possua hifen.
   */
  function applyDataset(node, datasetObj) {
    if (!isPlainObject(datasetObj)) {
      return;
    }
    var dataKeys = Object.keys(datasetObj);
    var i;
    for (i = 0; i < dataKeys.length; i++) {
      var dk = dataKeys[i];
      if (CHAVES_PROIBIDAS[dk] === true) {
        continue;
      }
      var dv = datasetObj[dk];
      if (dv === undefined || dv === null) {
        continue;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(dk)) {
        continue;
      }
      if (node.dataset && dk.indexOf('-') === -1) {
        node.dataset[dk] = String(dv);
      } else {
        var kebab = dk.replace(/([A-Z])/g, '-$1').toLowerCase();
        node.setAttribute('data-' + kebab, String(dv));
      }
    }
  }

  /**
   * Sanitiza todos os atributos de um elemento SVG ja parseado pelo DOMParser.
   */
  function sanitizeSvgAttributes(elNode) {
    if (!elNode || !elNode.attributes) {
      return;
    }
    var i;
    for (i = elNode.attributes.length - 1; i >= 0; i--) {
      var attr = elNode.attributes[i];
      var attrName = attr.name || '';
      var localName = attr.localName || attrName;
      var lowerName = attrName.toLowerCase();
      var lowerLocal = localName.toLowerCase();

      if (
        isBlockedAttrName(lowerName) ||
        isBlockedAttrName(lowerLocal) ||
        CHAVES_PROIBIDAS[lowerName] === true ||
        CHAVES_PROIBIDAS[lowerLocal] === true
      ) {
        elNode.removeAttributeNode(attr);
        continue;
      }

      if (URL_ATTRS[lowerName] === true || URL_ATTRS[lowerLocal] === true) {
        var isHrefAttr = (
          lowerName === 'href' ||
          lowerName === 'xlink:href' ||
          (attr.namespaceURI === XLINK_NS && lowerLocal === 'href') ||
          lowerLocal === 'href'
        );
        if (!isHrefAttr || !isSafeSvgRef(attr.value)) {
          elNode.removeAttributeNode(attr);
        }
      }
    }
  }

  /**
   * Percorre recursivamente a arvore SVG removendo comentarios, processing
   * instructions, elementos fora da allowlist e atributos perigosos.
   */
  function sanitizeSvgTree(node) {
    if (!node) {
      return;
    }
    sanitizeSvgAttributes(node);

    var child = node.firstChild;
    while (child) {
      var next = child.nextSibling;

      if (child.nodeType === 8 || child.nodeType === 7) {
        /* Remove comentarios e processing instructions */
        node.removeChild(child);
      } else if (child.nodeType === 1) {
        var childTag = (child.localName || child.nodeName || '').toLowerCase();
        var invalidNamespace = Boolean(child.namespaceURI) && child.namespaceURI !== SVG_NS;
        if (SVG_ALLOWED_TAGS[childTag] !== true || invalidNamespace) {
          node.removeChild(child);
        } else {
          sanitizeSvgTree(child);
        }
      }

      child = next;
    }
  }

  /* ----------------------------------------------------------------------
     3. API Publica de Manipulacao Segura do DOM
     ---------------------------------------------------------------------- */

  /**
   * Remove todos os nos filhos de um container de forma segura.
   */
  function clear(container) {
    if (!container) {
      return;
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  /**
   * Cria um TextNode puro, convertendo null/undefined para string vazia.
   */
  function text(value) {
    return global.document.createTextNode(String(value == null ? '' : value));
  }

  /**
   * Anexa filhos (Node, string, number ou arrays aninhados) a um elemento pai.
   * Ignora null, undefined e booleanos.
   */
  function appendChildren(parent, children) {
    if (!parent || children == null || typeof children === 'boolean') {
      return parent;
    }

    if (Array.isArray(children)) {
      var i;
      for (i = 0; i < children.length; i++) {
        appendChildren(parent, children[i]);
      }
      return parent;
    }

    if (typeof children === 'object' && typeof children.nodeType === 'number') {
      parent.appendChild(children);
      return parent;
    }

    parent.appendChild(text(children));
    return parent;
  }

  /**
   * Limpa o container e anexa os novos filhos de forma segura.
   */
  function setChildren(container, children) {
    clear(container);
    return appendChildren(container, children);
  }

  /**
   * Aplica mapa de atributos em elementos HTML ou SVG com blindagem anti-XSS.
   */
  function applySafeAttributes(node, attrs, isSvg) {
    if (!isPlainObject(attrs)) {
      return;
    }

    var keys = Object.keys(attrs);
    var i;
    for (i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (CHAVES_PROIBIDAS[key] === true) {
        continue;
      }

      var val = attrs[key];
      if (val === undefined || val === null) {
        continue;
      }

      if (key === 'className' || key === 'class') {
        if (isSvg) {
          node.setAttribute('class', String(val));
        } else {
          node.className = String(val);
        }
        continue;
      }

      if (key === 'text' || key === 'textContent') {
        node.textContent = String(val);
        continue;
      }

      if (key === 'dataset') {
        applyDataset(node, val);
        continue;
      }

      if (!isSvg && BOOLEAN_PROPS[key] === true) {
        node[key] = Boolean(val);
        continue;
      }

      if (!isSvg && key === 'value') {
        node.value = String(val);
        continue;
      }

      if (key === 'tabIndex') {
        if (
          (typeof val === 'number' && !isNaN(val)) ||
          (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)))
        ) {
          if (isSvg) {
            node.setAttribute('tabindex', String(Number(val)));
          } else {
            node.tabIndex = Number(val);
          }
        }
        continue;
      }

      var attrName = String(key);
      var lowerName = attrName.toLowerCase();

      if (!isValidAttrName(attrName) || isBlockedAttrName(lowerName)) {
        continue;
      }

      if (URL_ATTRS[lowerName] === true) {
        if (isSvg) {
          if ((lowerName === 'href' || lowerName === 'xlink:href') && isSafeSvgRef(val)) {
            var refVal = String(val).trim();
            if (lowerName === 'xlink:href') {
              node.setAttributeNS(XLINK_NS, 'xlink:href', refVal);
            } else {
              node.setAttribute('href', refVal);
            }
          }
          continue;
        }
        if (!isSafeHtmlUrl(val)) {
          continue;
        }
      }

      node.setAttribute(attrName, String(val));
    }
  }

  /**
   * Cria um elemento HTML aplicando atributos e filhos com blindagem anti-XSS.
   */
  function el(tag, attrs, children) {
    var node = global.document.createElement(String(tag));
    applySafeAttributes(node, attrs, false);
    appendChildren(node, children);
    return node;
  }

  /**
   * Cria um elemento SVG no namespace correto, validando a tag contra a
   * allowlist e protegendo todos os atributos contra injecao.
   */
  function svgEl(tag, attrs, children) {
    var tagName = String(tag == null ? '' : tag).trim();
    var tagLower = tagName.toLowerCase();

    if (!tagName || SVG_ALLOWED_TAGS[tagLower] !== true) {
      return null;
    }

    var node = global.document.createElementNS(SVG_NS, tagName);
    applySafeAttributes(node, attrs, true);
    appendChildren(node, children);
    return node;
  }

  /**
   * Converte uma string SVG em no DOM sanitizado via DOMParser (image/svg+xml),
   * retornando null caso o markup seja invalido ou contenha erros de XML.
   */
  function parseSvg(svgMarkup) {
    if (typeof svgMarkup !== 'string') {
      return null;
    }

    var trimmed = svgMarkup.trim();
    if (!trimmed || !/^<svg\b/i.test(trimmed)) {
      return null;
    }

    /* Garante xmlns SVG padrao na tag de abertura para parser XML estrito */
    var normalized = trimmed.replace(
      /^<svg\b(?![^>]*\bxmlns\s*=)/i,
      '<svg xmlns="' + SVG_NS + '"'
    );

    if (typeof global.DOMParser !== 'function') {
      return null;
    }

    var doc = null;
    try {
      doc = new global.DOMParser().parseFromString(normalized, 'image/svg+xml');
    } catch (err) {
      return null;
    }

    if (!doc || !doc.documentElement) {
      return null;
    }

    if (doc.getElementsByTagName('parsererror').length > 0) {
      return null;
    }

    var root = doc.documentElement;
    var rootName = root.localName ? root.localName.toLowerCase() : '';
    if (rootName !== 'svg') {
      return null;
    }

    if (root.namespaceURI && root.namespaceURI !== SVG_NS) {
      return null;
    }

    sanitizeSvgTree(root);

    return global.document && typeof global.document.importNode === 'function'
      ? global.document.importNode(root, true)
      : root.cloneNode(true);
  }

  /**
   * Limpa o container e insere um SVG sanitizado a partir de markup XML.
   */
  function setSvg(container, svgMarkup) {
    clear(container);
    var svgNode = parseSvg(svgMarkup);
    if (svgNode && container) {
      container.appendChild(svgNode);
      return svgNode;
    }
    return null;
  }

  /**
   * Anexa um SVG sanitizado ao container sem apagar os filhos existentes.
   */
  function appendSvg(container, svgMarkup) {
    var svgNode = parseSvg(svgMarkup);
    if (svgNode && container) {
      container.appendChild(svgNode);
      return svgNode;
    }
    return null;
  }

  /**
   * Cria um elemento <span> contendo um icone SVG sanitizado e classe opcional.
   */
  function createIconSpan(svgMarkup, className) {
    var span = el('span', className ? { className: className } : null);
    appendSvg(span, svgMarkup);
    return span;
  }

  /**
   * Registra um ouvinte de evento de forma segura e devolve funcao para remocao.
   */
  function on(target, eventName, handler, options) {
    if (
      !target ||
      typeof target.addEventListener !== 'function' ||
      typeof eventName !== 'string' ||
      !eventName ||
      typeof handler !== 'function'
    ) {
      return function () {};
    }

    target.addEventListener(eventName, handler, options);

    return function off() {
      if (target && typeof target.removeEventListener === 'function') {
        target.removeEventListener(eventName, handler, options);
      }
    };
  }

  /* ----------------------------------------------------------------------
     4. Exposicao sob o namespace global window.SaudeEscola.DomSafe
     ---------------------------------------------------------------------- */
  global.SaudeEscola = global.SaudeEscola || {};
  global.SaudeEscola.DomSafe = {
    clear: clear,
    text: text,
    appendChildren: appendChildren,
    setChildren: setChildren,
    el: el,
    svgEl: svgEl,
    parseSvg: parseSvg,
    setSvg: setSvg,
    appendSvg: appendSvg,
    createIconSpan: createIconSpan,
    on: on
  };
})(typeof window !== 'undefined' ? window : globalThis);
