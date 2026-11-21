/* ==========================================================================
   Controlador do Mascote Interativo (SVG + CSS + Balao de Fala)
   Projeto: Saude na Escola: Saude Bucal
   100% offline (file:// e GitHub Pages), sem ES Modules e sem emojis nativos.
   ========================================================================== */
(function (global) {
  'use strict';

  var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

  var INITIAL_GREETING = 'OI! EU SOU O DENTINHO! ESCOLHA UMA ATIVIDADE PARA COMEÇAR!';

  var FRASES_BOAS_VINDAS = [
    'QUE ALEGRIA VER VOCÊ! TOQUE EM UMA FASE PARA BRINCAR E APRENDER!',
    'VAMOS DEIXAR O SORRISO BEM BRILHANTE? ESCOLHA UM JOGO ABAIXO!',
    'A JORNADA COMPLETA TEM AS 3 FASES SEGUIDAS! VAMOS JOGAR?',
    INITIAL_GREETING
  ];

  var fraseIndex = 0;
  var activeScreenId = 'screenMenu';
  var timers = {
    hero: null,
    companion: null,
    toastMascot: null,
    heroTalk: null,
    companionTalk: null,
    toastTalk: null,
    bubblePop: null,
    mobileToast: null
  };

  function getMascotSvgMarkup() {
    var wb = SaudeEscola.WordBank;
    if (wb && wb.SVGS && typeof wb.SVGS.MASCOT_HERO === 'string' && wb.SVGS.MASCOT_HERO.indexOf('<svg') !== -1) {
      return wb.SVGS.MASCOT_HERO;
    }
    return '';
  }

  function playPopSound() {
    var audio = SaudeEscola.Audio;
    if (audio && typeof audio.playPop === 'function') {
      audio.playPop();
    }
  }

  function findSvgInside(container) {
    if (!container) return null;
    if (typeof container.querySelector === 'function') {
      return container.querySelector('.mascot-svg') || container.querySelector('svg');
    }
    return null;
  }

  function clearTimer(key) {
    if (timers[key]) {
      global.clearTimeout(timers[key]);
      timers[key] = null;
    }
  }

  /**
   * Aplica a classe de humor ('wave', 'celebrate', 'encourage' ou 'idle')
   * no container e no SVG interno, retornando automaticamente para 'idle'.
   */
  function applyMoodClass(container, mood, durationMs, timerKey) {
    if (!container) return;
    clearTimer(timerKey);

    var svgEl = findSvgInside(container);
    var classes = ['is-waving', 'is-celebrating', 'is-encouraging'];

    function removerTodas(el) {
      if (!el || !el.classList) return;
      for (var i = 0; i < classes.length; i += 1) {
        el.classList.remove(classes[i]);
      }
    }

    removerTodas(container);
    removerTodas(svgEl);

    if (!mood || mood === 'idle') {
      return;
    }

    var targetClass = '';
    if (mood === 'wave') targetClass = 'is-waving';
    else if (mood === 'celebrate') targetClass = 'is-celebrating';
    else if (mood === 'encourage') targetClass = 'is-encouraging';

    if (!targetClass) return;

    // Forca reflow leve para reiniciar animacoes consecutivas sem falhar no mock Node
    if (typeof container.getBoundingClientRect === 'function') {
      container.getBoundingClientRect();
    }
    if (svgEl && typeof svgEl.getBoundingClientRect === 'function') {
      svgEl.getBoundingClientRect();
    }

    if (container.classList) container.classList.add(targetClass);
    if (svgEl && svgEl.classList) svgEl.classList.add(targetClass);

    var tempo = typeof durationMs === 'number' && durationMs > 0 ? durationMs : 1600;
    timers[timerKey] = global.setTimeout(function () {
      timers[timerKey] = null;
      removerTodas(container);
      removerTodas(svgEl);
    }, tempo);
  }

  function calcTalkDuration(text) {
    var len = String(text == null ? '' : text).trim().length;
    return Math.max(1400, Math.min(1800, 1300 + len * 8));
  }

  function stopTalking(container, timerKey) {
    if (timerKey) {
      clearTimer(timerKey);
    }
    if (!container) return;
    var svgEl = findSvgInside(container);
    if (container.classList) container.classList.remove('is-talking');
    if (svgEl && svgEl.classList) svgEl.classList.remove('is-talking');
  }

  function startTalking(container, durationMs, timerKey) {
    if (!container) return;
    stopTalking(container, timerKey);

    var svgEl = findSvgInside(container);
    if (typeof container.getBoundingClientRect === 'function') {
      container.getBoundingClientRect();
    }
    if (svgEl && typeof svgEl.getBoundingClientRect === 'function') {
      svgEl.getBoundingClientRect();
    }

    if (container.classList) container.classList.add('is-talking');
    if (svgEl && svgEl.classList) svgEl.classList.add('is-talking');

    var tempo = typeof durationMs === 'number' && durationMs > 0 ? durationMs : 1600;
    timers[timerKey] = global.setTimeout(function () {
      timers[timerKey] = null;
      stopTalking(container, timerKey);
    }, tempo);
  }

  /**
   * Atualiza o texto do balao de fala no Menu Inicial sempre via textContent.
   */
  function setHeroBubbleText(text) {
    if (typeof document === 'undefined') return;
    var bubbleEl = document.getElementById('mascotSpeechText');
    if (!bubbleEl) return;

    var msg = String(text == null ? '' : text).trim();
    if (!msg) return;

    bubbleEl.textContent = msg;
    clearTimer('bubblePop');
    if (bubbleEl.classList) {
      bubbleEl.classList.remove('is-popping');
      if (typeof bubbleEl.getBoundingClientRect === 'function') {
        bubbleEl.getBoundingClientRect();
      }
      bubbleEl.classList.add('is-popping');
      timers.bubblePop = global.setTimeout(function () {
        timers.bubblePop = null;
        if (bubbleEl.classList) {
          bubbleEl.classList.remove('is-popping');
        }
      }, 540);
    }
  }

  /**
   * Garante a existencia do balao flutuante do mascote para telas portrait estreitas (<= 600px).
   */
  function ensureMobileToastElement() {
    if (typeof document === 'undefined' || !document.body) return null;
    var toastEl = document.getElementById('mobileMascotToast');
    if (toastEl) return toastEl;

    toastEl = document.createElement('div');
    toastEl.id = 'mobileMascotToast';
    toastEl.className = 'mobile-mascot-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');

    var avatarEl = document.createElement('div');
    avatarEl.className = 'mobile-mascot-toast-avatar';
    avatarEl.setAttribute('aria-hidden', 'true');
    var svgMarkup = getMascotSvgMarkup();
    if (svgMarkup) {
      avatarEl.innerHTML = svgMarkup;
    }

    var textEl = document.createElement('span');
    textEl.className = 'mobile-mascot-toast-text';

    toastEl.appendChild(avatarEl);
    toastEl.appendChild(textEl);
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showMobileToast(text, mood) {
    var msg = String(text == null ? '' : text).trim();
    if (!msg) return;

    var toastEl = ensureMobileToastElement();
    if (!toastEl) return;

    var textEl = toastEl.querySelector('.mobile-mascot-toast-text');
    if (textEl) {
      textEl.textContent = msg;
    }

    var avatarEl = toastEl.querySelector('.mobile-mascot-toast-avatar');
    if (avatarEl && !findSvgInside(avatarEl)) {
      var markup = getMascotSvgMarkup();
      if (markup) avatarEl.innerHTML = markup;
    }

    clearTimer('mobileToast');
    if (toastEl.classList) {
      toastEl.classList.remove('is-success', 'is-encourage');
      if (mood === 'celebrate') toastEl.classList.add('is-success');
      if (mood === 'encourage') toastEl.classList.add('is-encourage');
      toastEl.classList.add('is-visible');
    }

    if (avatarEl) {
      applyMoodClass(avatarEl, mood, mood === 'encourage' ? 2300 : 2200, 'toastMascot');
      startTalking(avatarEl, calcTalkDuration(msg), 'toastTalk');
    }

    timers.mobileToast = global.setTimeout(function () {
      timers.mobileToast = null;
      if (toastEl.classList) {
        toastEl.classList.remove('is-visible');
      }
    }, 2400);
  }

  function hideMobileToast() {
    clearTimer('mobileToast');
    clearTimer('toastMascot');
    clearTimer('toastTalk');
    if (typeof document === 'undefined') return;
    var toastEl = document.getElementById('mobileMascotToast');
    if (toastEl) {
      var avatarEl = toastEl.querySelector('.mobile-mascot-toast-avatar');
      stopTalking(avatarEl, 'toastTalk');
      if (toastEl.classList) {
        toastEl.classList.remove('is-visible', 'is-success', 'is-encourage');
      }
    }
  }

  function talk(isInPhase, durationMs) {
    if (typeof document === 'undefined') return;
    var inPhase = Boolean(isInPhase);
    var targetEl = inPhase
      ? document.getElementById('dockMascotCompanion')
      : document.getElementById('mascotHeroSvg');
    startTalking(targetEl, durationMs, inPhase ? 'companionTalk' : 'heroTalk');
  }

  function wave(message) {
    if (typeof document !== 'undefined') {
      var heroEl = document.getElementById('mascotHeroSvg');
      applyMoodClass(heroEl, 'wave', 2000, 'hero');
      if (message) {
        setHeroBubbleText(message);
        startTalking(heroEl, calcTalkDuration(message), 'heroTalk');
      }
    }
  }

  function celebrate(message, isInPhase) {
    var msg = String(message == null ? '' : message).trim();
    if (typeof document !== 'undefined') {
      var targetEl = isInPhase
        ? document.getElementById('dockMascotCompanion')
        : document.getElementById('mascotHeroSvg');
      applyMoodClass(targetEl, 'celebrate', 2200, isInPhase ? 'companion' : 'hero');
      if (msg) {
        startTalking(targetEl, calcTalkDuration(msg), isInPhase ? 'companionTalk' : 'heroTalk');
      }
    }
    if (msg) {
      if (isInPhase) {
        showMobileToast(msg, 'celebrate');
      } else {
        setHeroBubbleText(msg);
      }
    }
  }

  function encourage(message, isInPhase) {
    var msg = String(message == null ? '' : message).trim();
    if (typeof document !== 'undefined') {
      var targetEl = isInPhase
        ? document.getElementById('dockMascotCompanion')
        : document.getElementById('mascotHeroSvg');
      applyMoodClass(targetEl, 'encourage', 2300, isInPhase ? 'companion' : 'hero');
      if (msg) {
        startTalking(targetEl, calcTalkDuration(msg), isInPhase ? 'companionTalk' : 'heroTalk');
      }
    }
    if (msg) {
      if (isInPhase) {
        showMobileToast(msg, 'encourage');
      } else {
        setHeroBubbleText(msg);
      }
    }
  }

  function onScreenChange(screenId) {
    activeScreenId = screenId || 'screenMenu';
    hideMobileToast();

    if (typeof document !== 'undefined') {
      var companionEl = document.getElementById('dockMascotCompanion');
      var heroEl = document.getElementById('mascotHeroSvg');
      stopTalking(companionEl, 'companionTalk');
      stopTalking(heroEl, 'heroTalk');
      applyMoodClass(companionEl, 'idle', 0, 'companion');
    }

    if (activeScreenId === 'screenMenu') {
      wave(INITIAL_GREETING);
    }
  }

  function onFeedback(text, styleType, currentPhase) {
    var inPhase = typeof currentPhase === 'number'
      ? currentPhase > 0
      : (activeScreenId !== 'screenMenu');
    var trimmed = String(text == null ? '' : text).trim();

    if (!inPhase) {
      if (trimmed) {
        setHeroBubbleText(trimmed);
        if (typeof document !== 'undefined') {
          startTalking(document.getElementById('mascotHeroSvg'), calcTalkDuration(trimmed), 'heroTalk');
        }
      }
      if (styleType === 'success') {
        celebrate('', false);
      } else if (styleType === 'encourage') {
        encourage('', false);
      }
      return;
    }

    if (styleType === 'success') {
      celebrate(trimmed, true);
    } else if (styleType === 'encourage') {
      encourage(trimmed, true);
    } else if (typeof document !== 'undefined') {
      var companionEl = document.getElementById('dockMascotCompanion');
      applyMoodClass(companionEl, 'idle', 0, 'companion');
      if (trimmed) {
        startTalking(companionEl, calcTalkDuration(trimmed), 'companionTalk');
      }
    }
  }

  function onHeroInteract() {
    playPopSound();
    var frase = FRASES_BOAS_VINDAS[fraseIndex % FRASES_BOAS_VINDAS.length];
    fraseIndex = (fraseIndex + 1) % FRASES_BOAS_VINDAS.length;
    wave(frase);
  }

  function init() {
    if (typeof document === 'undefined') return;

    var svgMarkup = getMascotSvgMarkup();
    var heroEl = document.getElementById('mascotHeroSvg');
    if (heroEl) {
      if (svgMarkup) {
        heroEl.innerHTML = svgMarkup;
      }
      if (!heroEl.dataset || heroEl.dataset.mascotBound !== '1') {
        if (heroEl.dataset) heroEl.dataset.mascotBound = '1';
        heroEl.addEventListener('click', function () {
          onHeroInteract();
        });
        heroEl.addEventListener('keydown', function (e) {
          if (e && (e.key === 'Enter' || e.key === ' ')) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            onHeroInteract();
          }
        });
      }
    }

    var companionEl = document.getElementById('dockMascotCompanion');
    if (companionEl && svgMarkup) {
      companionEl.innerHTML = svgMarkup;
    }

    wave(INITIAL_GREETING);
  }

  SaudeEscola.Mascot = {
    init: init,
    talk: talk,
    wave: wave,
    celebrate: celebrate,
    encourage: encourage,
    onScreenChange: onScreenChange,
    onFeedback: onFeedback,
    hideMobileToast: hideMobileToast
  };
})(typeof window !== 'undefined' ? window : globalThis);
