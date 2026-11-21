/* ==========================================================================
   Controlador do Mascote Interativo Dentinho (SVG + CSS + Balao de Fala)
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

  // Intervalos variados para piscadas organicas (evita ritmo robotico)
  var BLINK_INTERVALS = [3400, 5200, 2900, 4600, 6100];
  var MOOD_CLASSES = ['is-waving', 'is-celebrating', 'is-triumph', 'is-encouraging', 'is-curious'];
  var TALK_CLASSES = ['is-talking', 'is-talking-excited', 'is-talking-calm'];

  var fraseIndex = 0;
  var blinkIndex = 0;
  var activeScreenId = 'screenMenu';
  var currentMood = 'idle';
  var isTalking = false;
  var isBlinking = false;

  var timers = {
    hero: null,
    companion: null,
    toastMascot: null,
    heroTalk: null,
    companionTalk: null,
    toastTalk: null,
    bubblePop: null,
    mobileToast: null,
    blinkLoop: null,
    blinkEnd: null
  };

  function getDomSafe() {
    return (global.SaudeEscola && global.SaudeEscola.DomSafe) ? global.SaudeEscola.DomSafe : null;
  }

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

  function removerListaClasses(el, lista) {
    if (!el || !el.classList) return;
    for (var i = 0; i < lista.length; i += 1) {
      el.classList.remove(lista[i]);
    }
  }

  function adicionarClasse(container, svgEl, cls) {
    if (!cls) return;
    if (container && container.classList) container.classList.add(cls);
    if (svgEl && svgEl.classList) svgEl.classList.add(cls);
  }

  function getActiveMascotElement() {
    if (typeof document === 'undefined') return null;
    return activeScreenId === 'screenMenu'
      ? document.getElementById('mascotHeroSvg')
      : document.getElementById('dockMascotCompanion');
  }

  function stopBlinkVisual() {
    clearTimer('blinkEnd');
    isBlinking = false;
    if (typeof document === 'undefined') return;
    var els = [
      document.getElementById('mascotHeroSvg'),
      document.getElementById('dockMascotCompanion')
    ];
    for (var i = 0; i < els.length; i += 1) {
      var c = els[i];
      if (!c) continue;
      var s = findSvgInside(c);
      if (c.classList) c.classList.remove('is-blinking');
      if (s && s.classList) s.classList.remove('is-blinking');
    }
  }

  function triggerBlink() {
    if (typeof document === 'undefined') return false;
    // Olhos normais ficam ocultos nessas expressoes
    if (currentMood === 'celebrate' || currentMood === 'triumph' || currentMood === 'encourage' || currentMood === 'curious') {
      return false;
    }

    var target = getActiveMascotElement();
    if (!target) return false;
    var svgEl = findSvgInside(target);

    stopBlinkVisual();

    if (typeof target.getBoundingClientRect === 'function') {
      target.getBoundingClientRect();
    }
    if (svgEl && typeof svgEl.getBoundingClientRect === 'function') {
      svgEl.getBoundingClientRect();
    }

    adicionarClasse(target, svgEl, 'is-blinking');
    isBlinking = true;

    timers.blinkEnd = global.setTimeout(function () {
      timers.blinkEnd = null;
      isBlinking = false;
      if (target && target.classList) target.classList.remove('is-blinking');
      if (svgEl && svgEl.classList) svgEl.classList.remove('is-blinking');
    }, 190);

    return true;
  }

  function stopBlinkLoop() {
    clearTimer('blinkLoop');
    stopBlinkVisual();
  }

  function scheduleNaturalBlink() {
    clearTimer('blinkLoop');
    if (typeof global.setTimeout !== 'function') return;

    var delay = BLINK_INTERVALS[blinkIndex % BLINK_INTERVALS.length];
    blinkIndex = (blinkIndex + 1) % BLINK_INTERVALS.length;

    timers.blinkLoop = global.setTimeout(function () {
      timers.blinkLoop = null;
      triggerBlink();
      scheduleNaturalBlink();
    }, delay);
  }

  /**
   * Aplica a classe de humor ('wave', 'celebrate', 'triumph', 'encourage', 'curious' ou 'idle')
   * no container e no SVG interno, retornando automaticamente para 'idle'.
   */
  function applyMoodClass(container, mood, durationMs, timerKey) {
    if (!container) return;
    clearTimer(timerKey);

    var svgEl = findSvgInside(container);
    removerListaClasses(container, MOOD_CLASSES);
    removerListaClasses(svgEl, MOOD_CLASSES);

    var atualizaEstadoPrincipal = timerKey === 'hero' || timerKey === 'companion';

    if (!mood || mood === 'idle') {
      if (atualizaEstadoPrincipal) currentMood = 'idle';
      return;
    }

    var targetClass = '';
    if (mood === 'wave') targetClass = 'is-waving';
    else if (mood === 'celebrate') targetClass = 'is-celebrating';
    else if (mood === 'triumph') targetClass = 'is-triumph';
    else if (mood === 'encourage') targetClass = 'is-encouraging';
    else if (mood === 'curious') targetClass = 'is-curious';

    if (!targetClass) {
      if (atualizaEstadoPrincipal) currentMood = 'idle';
      return;
    }

    if (targetClass !== 'is-waving') {
      stopBlinkVisual();
    }

    if (typeof container.getBoundingClientRect === 'function') {
      container.getBoundingClientRect();
    }
    if (svgEl && typeof svgEl.getBoundingClientRect === 'function') {
      svgEl.getBoundingClientRect();
    }

    adicionarClasse(container, svgEl, targetClass);
    if (atualizaEstadoPrincipal) {
      currentMood = mood;
    }

    var tempo = typeof durationMs === 'number' && durationMs > 0 ? durationMs : 1800;
    timers[timerKey] = global.setTimeout(function () {
      timers[timerKey] = null;
      removerListaClasses(container, MOOD_CLASSES);
      removerListaClasses(svgEl, MOOD_CLASSES);
      if (atualizaEstadoPrincipal) {
        currentMood = 'idle';
      }
    }, tempo);
  }

  /**
   * Calcula duracao e ritmo da movimentacao labial proporcionalmente ao texto e humor.
   */
  function calcTalkProfile(text, mood) {
    var msg = String(text == null ? '' : text).trim();
    var len = msg.length;
    var duracao = Math.max(1100, Math.min(2800, 980 + len * 24));
    var rhythmClass = '';

    if (mood === 'celebrate' || mood === 'triumph' || mood === 'wave') {
      rhythmClass = 'is-talking-excited';
    } else if (mood === 'encourage' || mood === 'curious') {
      rhythmClass = 'is-talking-calm';
    } else if (msg.indexOf('!') !== -1) {
      rhythmClass = 'is-talking-excited';
    }

    return {
      durationMs: duracao,
      rhythmClass: rhythmClass
    };
  }

  function stopTalking(container, timerKey) {
    if (timerKey) {
      clearTimer(timerKey);
    }
    if (timerKey === 'heroTalk' || timerKey === 'companionTalk') {
      isTalking = false;
    }
    if (!container) return;
    var svgEl = findSvgInside(container);
    removerListaClasses(container, TALK_CLASSES);
    removerListaClasses(svgEl, TALK_CLASSES);
  }

  function startTalking(container, durationMs, timerKey, rhythmClass) {
    if (!container) return;
    stopTalking(container, timerKey);

    var svgEl = findSvgInside(container);
    if (typeof container.getBoundingClientRect === 'function') {
      container.getBoundingClientRect();
    }
    if (svgEl && typeof svgEl.getBoundingClientRect === 'function') {
      svgEl.getBoundingClientRect();
    }

    adicionarClasse(container, svgEl, 'is-talking');
    if (rhythmClass) {
      adicionarClasse(container, svgEl, rhythmClass);
    }
    if (timerKey === 'heroTalk' || timerKey === 'companionTalk') {
      isTalking = true;
    }

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
    var domSafe = getDomSafe();
    if (svgMarkup && domSafe && typeof domSafe.setSvg === 'function') {
      domSafe.setSvg(avatarEl, svgMarkup);
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
      var domSafe = getDomSafe();
      if (markup && domSafe && typeof domSafe.setSvg === 'function') {
        domSafe.setSvg(avatarEl, markup);
      }
    }

    clearTimer('mobileToast');
    if (toastEl.classList) {
      toastEl.classList.remove('is-success', 'is-encourage');
      if (mood === 'celebrate' || mood === 'triumph') toastEl.classList.add('is-success');
      if (mood === 'encourage') toastEl.classList.add('is-encourage');
      toastEl.classList.add('is-visible');
    }

    if (avatarEl) {
      var durHumor = mood === 'triumph' ? 2600 : (mood === 'encourage' ? 2300 : 2200);
      applyMoodClass(avatarEl, mood, durHumor, 'toastMascot');
      var profileToast = calcTalkProfile(msg, mood);
      startTalking(avatarEl, profileToast.durationMs, 'toastTalk', profileToast.rhythmClass);
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

  function talk(isInPhase, durationMs, rhythmClass) {
    if (typeof document === 'undefined') return;
    var inPhase = Boolean(isInPhase);
    var targetEl = inPhase
      ? document.getElementById('dockMascotCompanion')
      : document.getElementById('mascotHeroSvg');
    startTalking(targetEl, durationMs, inPhase ? 'companionTalk' : 'heroTalk', rhythmClass);
  }

  function wave(message) {
    if (typeof document !== 'undefined') {
      var heroEl = document.getElementById('mascotHeroSvg');
      applyMoodClass(heroEl, 'wave', 2000, 'hero');
      if (message) {
        setHeroBubbleText(message);
        var profile = calcTalkProfile(message, 'wave');
        startTalking(heroEl, profile.durationMs, 'heroTalk', profile.rhythmClass);
      }
    }
  }

  function curious(message, isInPhase) {
    var msg = String(message == null ? '' : message).trim();
    var inPhase = Boolean(isInPhase);
    if (typeof document !== 'undefined') {
      var targetEl = inPhase
        ? document.getElementById('dockMascotCompanion')
        : document.getElementById('mascotHeroSvg');
      applyMoodClass(targetEl, 'curious', 2100, inPhase ? 'companion' : 'hero');
      if (msg) {
        var profile = calcTalkProfile(msg, 'curious');
        startTalking(targetEl, profile.durationMs, inPhase ? 'companionTalk' : 'heroTalk', profile.rhythmClass);
      }
    }
    if (msg) {
      if (inPhase) {
        showMobileToast(msg, 'curious');
      } else {
        setHeroBubbleText(msg);
      }
    }
  }

  function celebrate(message, isInPhase) {
    var msg = String(message == null ? '' : message).trim();
    var inPhase = Boolean(isInPhase);
    if (typeof document !== 'undefined') {
      var targetEl = inPhase
        ? document.getElementById('dockMascotCompanion')
        : document.getElementById('mascotHeroSvg');
      applyMoodClass(targetEl, 'celebrate', 2200, inPhase ? 'companion' : 'hero');
      if (msg) {
        var profile = calcTalkProfile(msg, 'celebrate');
        startTalking(targetEl, profile.durationMs, inPhase ? 'companionTalk' : 'heroTalk', profile.rhythmClass);
      }
    }
    if (msg) {
      if (inPhase) {
        showMobileToast(msg, 'celebrate');
      } else {
        setHeroBubbleText(msg);
      }
    }
  }

  function celebrateAchievement(message, isInPhase) {
    var msg = String(message == null ? '' : message).trim();
    var inPhase = Boolean(isInPhase);
    if (typeof document !== 'undefined') {
      var targetEl = inPhase
        ? document.getElementById('dockMascotCompanion')
        : document.getElementById('mascotHeroSvg');
      applyMoodClass(targetEl, 'triumph', 2600, inPhase ? 'companion' : 'hero');
      if (msg) {
        var profile = calcTalkProfile(msg, 'triumph');
        startTalking(targetEl, profile.durationMs, inPhase ? 'companionTalk' : 'heroTalk', profile.rhythmClass);
      }
    }
    if (msg) {
      if (inPhase) {
        showMobileToast(msg, 'triumph');
      } else {
        setHeroBubbleText(msg);
      }
    }
  }

  function encourage(message, isInPhase) {
    var msg = String(message == null ? '' : message).trim();
    var inPhase = Boolean(isInPhase);
    if (typeof document !== 'undefined') {
      var targetEl = inPhase
        ? document.getElementById('dockMascotCompanion')
        : document.getElementById('mascotHeroSvg');
      applyMoodClass(targetEl, 'encourage', 2300, inPhase ? 'companion' : 'hero');
      if (msg) {
        var profile = calcTalkProfile(msg, 'encourage');
        startTalking(targetEl, profile.durationMs, inPhase ? 'companionTalk' : 'heroTalk', profile.rhythmClass);
      }
    }
    if (msg) {
      if (inPhase) {
        showMobileToast(msg, 'encourage');
      } else {
        setHeroBubbleText(msg);
      }
    }
  }

  function onScreenChange(screenId) {
    activeScreenId = screenId || 'screenMenu';
    hideMobileToast();
    stopBlinkVisual();

    if (typeof document !== 'undefined') {
      var companionEl = document.getElementById('dockMascotCompanion');
      var heroEl = document.getElementById('mascotHeroSvg');
      stopTalking(companionEl, 'companionTalk');
      stopTalking(heroEl, 'heroTalk');
      applyMoodClass(companionEl, 'idle', 0, 'companion');
      applyMoodClass(heroEl, 'idle', 0, 'hero');
    }

    if (activeScreenId === 'screenMenu') {
      wave(INITIAL_GREETING);
    }
  }

  /**
   * Coordena reacoes e fala do Dentinho preservando voz unica no Menu Inicial.
   */
  function onFeedback(text, styleType, currentPhase) {
    var inPhase = typeof currentPhase === 'number'
      ? currentPhase > 0
      : (activeScreenId !== 'screenMenu');
    var trimmed = String(text == null ? '' : text).trim();

    if (!inPhase) {
      if (trimmed) {
        setHeroBubbleText(trimmed);
        if (typeof document !== 'undefined') {
          var heroProfile = calcTalkProfile(trimmed, styleType || 'idle');
          startTalking(document.getElementById('mascotHeroSvg'), heroProfile.durationMs, 'heroTalk', heroProfile.rhythmClass);
        }
      }
      if (styleType === 'success') {
        celebrate('', false);
      } else if (styleType === 'triumph') {
        celebrateAchievement('', false);
      } else if (styleType === 'encourage') {
        encourage('', false);
      } else if (styleType === 'curious') {
        curious('', false);
      }
      return;
    }

    if (styleType === 'success') {
      celebrate(trimmed, true);
    } else if (styleType === 'triumph') {
      celebrateAchievement(trimmed, true);
    } else if (styleType === 'encourage') {
      encourage(trimmed, true);
    } else if (styleType === 'curious') {
      curious(trimmed, true);
    } else if (typeof document !== 'undefined') {
      var companionEl = document.getElementById('dockMascotCompanion');
      if (trimmed) {
        applyMoodClass(companionEl, 'curious', 1700, 'companion');
        var neutralProfile = calcTalkProfile(trimmed, 'curious');
        startTalking(companionEl, neutralProfile.durationMs, 'companionTalk', neutralProfile.rhythmClass);
      } else {
        applyMoodClass(companionEl, 'idle', 0, 'companion');
      }
    }
  }

  function onHeroInteract() {
    playPopSound();
    var frase = FRASES_BOAS_VINDAS[fraseIndex % FRASES_BOAS_VINDAS.length];
    fraseIndex = (fraseIndex + 1) % FRASES_BOAS_VINDAS.length;
    if (frase.indexOf('?') !== -1) {
      curious(frase, false);
    } else {
      wave(frase);
    }
  }

  function getState() {
    return {
      activeScreenId: activeScreenId,
      currentMood: currentMood,
      isTalking: isTalking,
      isBlinking: isBlinking
    };
  }

  function init() {
    if (typeof document === 'undefined') return;

    var svgMarkup = getMascotSvgMarkup();
    var domSafe = getDomSafe();
    var heroEl = document.getElementById('mascotHeroSvg');
    if (heroEl) {
      if (svgMarkup && domSafe && typeof domSafe.setSvg === 'function') {
        domSafe.setSvg(heroEl, svgMarkup);
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
    if (companionEl && svgMarkup && domSafe && typeof domSafe.setSvg === 'function') {
      domSafe.setSvg(companionEl, svgMarkup);
    }

    wave(INITIAL_GREETING);
    scheduleNaturalBlink();
  }

  SaudeEscola.Mascot = {
    init: init,
    talk: talk,
    wave: wave,
    curious: curious,
    celebrate: celebrate,
    celebrateAchievement: celebrateAchievement,
    encourage: encourage,
    triggerBlink: triggerBlink,
    stopBlinkLoop: stopBlinkLoop,
    onScreenChange: onScreenChange,
    onFeedback: onFeedback,
    hideMobileToast: hideMobileToast,
    getState: getState
  };
})(typeof window !== 'undefined' ? window : globalThis);
