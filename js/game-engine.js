/* ==========================================================================
   CABEÇALHO ARQUITETURAL — SaudeEscola.Game
   ==========================================================================
   Responsabilidade: motor das três fases, jornada completa, estados das
   partidas, navegação, feedback visual/sonoro e suporte ao teclado físico.

   Dependências: Storage, Analytics, WordBank, Ranking, Audio, TeacherPanel,
   DomSafe, UiIcons e Mascot; os auxiliares são consultados com fallbacks.

   API pública: SaudeEscola.Game
   Contrato: inicialização, seleção de quantidade, início das fases, navegação,
   confirmação da saída e continuação do modal; getState retorna o estado interno.

   Sumário:
   1. Estado central e integrações modulares
   2. Menu e seleção de modo
   3. Fase 1 — memória avaliada por tempo
   4. Fase 2 — construção silábica
   5. Fase 3 — escrita espontânea
   6. Ranking, feedback e navegação final
   ==========================================================================
*/
(function (global) {
  'use strict';

  const SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

  // Flag para garantir que listeners e componentes sejam inicializados uma unica vez
  let initialized = false;
  let homeConfirming = false;
  let homeConfirmTimer = null;
  let feedbackPopTimer = null;
  const feedbackRotation = {};

  /**************************************************************
   * 1. ESTADO CENTRAL DO JOGO
   **************************************************************/
  const gameState = {
    mode: 'MENU', // 'MENU', 'JOURNEY', 'PHASE1', 'PHASE2', 'PHASE3'
    questionCount: 10, // 3, 5 ou 10 questoes para as Fases 2 e 3
    currentPhase: 0,
    stars: 0,
    currentP3Sentence: '',
    // Estado da Fase 1 (Jogo da Memoria)
    p1Cards: [],
    p1Flipped: [],
    p1MatchedCount: 0,
    p1Mistakes: 0,
    p1PairMistakes: {},
    p1StartTime: null,
    p1Lock: false,
    // Estado da Fase 2 (Construtor de Silabas)
    p2Queue: [],
    p2Index: 0,
    p2CurrentWord: null,
    p2Slots: [],
    p2Pool: [],
    p2FirstTry: true,
    p2Lock: false,
    // Estado da Fase 3 (Escrita Espontanea)
    p3Queue: [],
    p3Index: 0,
    p3CurrentWord: null,
    p3Typed: [],
    p3Locked: [],
    p3FirstTry: true,
    p3Lock: false
  };

  /**************************************************************
   * 2. HELPERS DE INTEGRACAO MODULAR E UTILITARIOS
   **************************************************************/
  /**
   * Obtem um modulo registrado em window.SaudeEscola de forma segura.
   */
  function getSaudeModule(name) {
    return (global.SaudeEscola && global.SaudeEscola[name]) ? global.SaudeEscola[name] : null;
  }

  /**
   * Obtem o utilitario seguro de manipulacao de DOM/SVG.
   */
  function getDomSafe() {
    return getSaudeModule('DomSafe');
  }

  /**
   * Atualiza um botao com icone SVG do WordBank e texto usando apenas DOM seguro.
   */
  function setButtonIconLabel(btn, svgKey, labelText) {
    const domSafe = getDomSafe();
    if (!btn || !domSafe) return;
    domSafe.clear(btn);
    const resolvedKey = svgKey === 'REPLAY_ICON' ? 'NEXT_CYCLE' : svgKey;
    const svg = getUiIconSvg(resolvedKey) || getWordBankSvg(svgKey);
    if (svg) {
      btn.appendChild(domSafe.createIconSpan(svg, 'u-icon-wrap'));
    }
    btn.appendChild(domSafe.el('span', { text: labelText }));
  }

  /**
   * Renderiza a frase da Fase 3 com lacuna destacada usando nos de texto e span seguros.
   */
  function renderPhase3SentenceDom(sentenceEl, sentenceTemplate, blankText, isFilled) {
    const domSafe = getDomSafe();
    if (!sentenceEl || !domSafe) return;
    domSafe.clear(sentenceEl);

    const tpl = String(sentenceTemplate || '');
    const marker = '___';
    const idx = tpl.indexOf(marker);
    if (idx === -1) {
      sentenceEl.textContent = tpl;
      return;
    }

    const before = tpl.slice(0, idx);
    const after = tpl.slice(idx + marker.length);
    if (before) {
      sentenceEl.appendChild(domSafe.text(before));
    }
    sentenceEl.appendChild(domSafe.el('span', {
      className: isFilled ? 'p3-blank-highlight is-filled' : 'p3-blank-highlight',
      text: blankText
    }));
    if (after) {
      sentenceEl.appendChild(domSafe.text(after));
    }
  }

  /**
   * Resolve a hierarquia de pista ou ditado na Fase 3:
   * 1) Frase cadastrada com lacuna; 2) Dica; 3) Orientacao para ditado da professora.
   *
   * [RETROCOMPATIBILIDADE v2.1.x] Itens antigos podem chegar sem isWeeklyWord,
   * p3Mode ou campos *_Original; nesse caso é usada a frase nativa existente,
   * evitando lacunas vazias ou prompts sem contexto.
   */
  function resolverPromptFase3(item, sentenceTemplate) {
    if (!item || !item.isWeeklyWord) {
      return {
        mode: 'FRASE',
        tag: '',
        template: sentenceTemplate || (item ? item.sentence : '')
      };
    }

    var fraseOrig = item.fraseOriginal ? String(item.fraseOriginal).trim() : '';
    var dicaOrig = item.dicaOriginal ? String(item.dicaOriginal).trim() : '';

    if (item.p3Mode === 'FRASE' || fraseOrig) {
      return {
        mode: 'FRASE',
        tag: '',
        template: sentenceTemplate || fraseOrig || item.sentence || ''
      };
    }

    if (item.p3Mode === 'DICA' || dicaOrig) {
      return {
        mode: 'DICA',
        tag: 'PISTA DA PALAVRA',
        text: dicaOrig || String(sentenceTemplate || '').replace(/^DICA:\s*/i, '')
      };
    }

    return {
      mode: 'DITADO',
      tag: 'DITADO EM SALA',
      text: 'DITADO DA PROFESSORA! ESCREVA A PALAVRA:'
    };
  }

  /**
   * Renderiza na Fase 3 a frase com lacuna, a pista ou o modo ditado usando DomSafe.
   */
  function renderPhase3PromptDom(sentenceEl, item, sentenceTemplate, blankText, isFilled) {
    const domSafe = getDomSafe();
    if (!sentenceEl || !domSafe) return;

    const prompt = resolverPromptFase3(item, sentenceTemplate);
    if (prompt.mode === 'FRASE') {
      renderPhase3SentenceDom(sentenceEl, prompt.template, blankText, isFilled);
      return;
    }

    domSafe.clear(sentenceEl);
    sentenceEl.appendChild(domSafe.el('span', {
      className: 'p3-prompt-tag ' + (prompt.mode === 'DICA' ? 'is-clue' : 'is-dictation'),
      text: prompt.tag
    }));
    sentenceEl.appendChild(domSafe.el('span', {
      className: 'p3-prompt-text',
      text: prompt.text
    }));
    if (isFilled) {
      sentenceEl.appendChild(domSafe.text(' '));
      sentenceEl.appendChild(domSafe.el('span', {
        className: 'p3-blank-highlight is-filled',
        text: blankText
      }));
    }
  }

  /**
   * Executa um efeito sonoro no modulo Audio sem quebrar caso ele ainda nao esteja carregado.
   *
   * [RETROCOMPATIBILIDADE v2.1.x] Quando o método moderno play* não existe,
   * consulta-se o nome legado playSound*; se o módulo Audio não estiver presente,
   * o jogo continua visualmente sem áudio.
   */
  function playAudio(methodName) {
    const audio = getSaudeModule('Audio');
    if (!audio) return;

    if (typeof audio[methodName] === 'function') {
      audio[methodName]();
      return;
    }

    // Fallback defensivo caso o modulo exponha nomenclatura legada playSound*
    if (typeof methodName === 'string' && methodName.indexOf('play') === 0) {
      const legacyMethod = 'playSound' + methodName.slice(4);
      if (typeof audio[legacyMethod] === 'function') {
        audio[legacyMethod]();
      }
    }
  }

  /**
   * Retorna um SVG cadastrado no modulo WordBank de forma segura.
   */
  function getWordBankSvg(svgKey) {
    const wordBank = getSaudeModule('WordBank');
    return (wordBank && wordBank.SVGS && wordBank.SVGS[svgKey]) ? wordBank.SVGS[svgKey] : '';
  }

  /**
   * Retorna um SVG de interface consultando UiIcons com fallback para WordBank.SVGS.
   */
  function getUiIconSvg(svgKey) {
    const uiIcons = getSaudeModule('UiIcons');
    if (uiIcons && typeof uiIcons[svgKey] === 'string' && uiIcons[svgKey]) {
      return uiIcons[svgKey];
    }
    return getWordBankSvg(svgKey);
  }

  const WEEKLY_BADGE_BOOK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11a2 2 0 0 1 2 2v16.5a1.5 1.5 0 0 0-1.5-1.5H4.5A2.5 2.5 0 0 1 2 16.5V4.5z"></path><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13a2 2 0 0 0-2 2v16.5a1.5 1.5 0 0 1 1.5-1.5h7A2.5 2.5 0 0 0 22 16.5V4.5z"></path></svg>';

  /**
   * Obtem metadados unificados do banco ativo (Palavras da Semana ou Banco Padrao).
   */
  function getActiveBankInfoSafe() {
    const wordBank = getSaudeModule('WordBank');
    if (wordBank && typeof wordBank.getActiveBankInfo === 'function') {
      const info = wordBank.getActiveBankInfo();
      if (info && Array.isArray(info.words)) {
        return {
          isWeekly: Boolean(info.isWeekly),
          words: info.words,
          count: typeof info.count === 'number' ? info.count : info.words.length
        };
      }
    }

    const storage = getSaudeModule('Storage');
    const weeklyActive = Boolean(
      storage &&
      typeof storage.isPalavrasSemanaAtivo === 'function' &&
      storage.isPalavrasSemanaAtivo()
    );
    if (weeklyActive && storage && typeof storage.getBancoPalavrasSemanaParaJogo === 'function') {
      const weeklyBank = storage.getBancoPalavrasSemanaParaJogo();
      if (Array.isArray(weeklyBank) && weeklyBank.length >= 4) {
        return {
          isWeekly: true,
          words: weeklyBank,
          count: weeklyBank.length
        };
      }
    }

    const defaultWords = (wordBank && Array.isArray(wordBank.DEFAULT_WORDS))
      ? wordBank.DEFAULT_WORDS
      : [];
    return {
      isWeekly: false,
      words: defaultWords,
      count: defaultWords.length
    };
  }

  /**
   * Informa se o modo Palavras da Semana esta ativo com banco valido.
   */
  function isWeeklyWordsActive() {
    return getActiveBankInfoSafe().isWeekly;
  }

  /**
   * Obtem o banco de palavras ativo (Palavras da Semana ou Banco Padrao).
   */
  function getActiveWordBankSafe() {
    return getActiveBankInfoSafe().words;
  }

  /**
   * Atualiza os badges discretos de "Palavras da Semana" no topo das Fases 1, 2 e 3.
   */
  function updatePhaseWeeklyBadges(bankInfoOpt) {
    const info = bankInfoOpt || getActiveBankInfoSafe();
    const domSafe = getDomSafe();
    const badgeIds = ['p1WeeklyBadge', 'p2WeeklyBadge', 'p3WeeklyBadge'];
    const staticBookSvg = (global.SaudeEscola && global.SaudeEscola.SVGs && global.SaudeEscola.SVGs.BOOK)
      ? global.SaudeEscola.SVGs.BOOK
      : WEEKLY_BADGE_BOOK_SVG;

    badgeIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;

      if (!info.isWeekly) {
        el.classList.add('u-hidden');
        if (domSafe) domSafe.clear(el);
        else el.textContent = '';
        el.removeAttribute('title');
        return;
      }

      el.classList.remove('u-hidden');
      el.title = 'LISTA PERSONALIZADA ATIVA: PALAVRAS DA SEMANA';
      if (domSafe) {
        domSafe.clear(el);
        el.appendChild(domSafe.createIconSpan(staticBookSvg, 'phase-weekly-badge-icon'));
        el.appendChild(domSafe.el('span', { text: 'PALAVRAS DA SEMANA (' + info.count + ')' }));
      }
    });
  }

  /**
   * Controla a exibicao da caixa de registro de nome no modal de celebracao.
   */
  function toggleRankingRegisterBox(show) {
    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.toggleRegisterBox === 'function') {
      ranking.toggleRegisterBox(show);
    }
  }

  /**
   * Embaralha uma copia do array usando o algoritmo Fisher-Yates.
   */
  function shuffleArray(arr) {
    const copy = Array.isArray(arr) ? arr.slice() : [];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /**
   * Normaliza letra ou texto para comparacao ignorando acentos (ex.: A == A com acento).
   */
  function normalizeChar(ch) {
    return String(ch == null ? '' : ch)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  /**
   * Escapa caracteres HTML especiais para prevenir XSS ao montar trechos dinamicos.
   */
  function escapeHtmlSafe(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Soma estrelas ao placar atual e atualiza o indicador no cabecalho.
   */
  function addStars(amount) {
    gameState.stars += amount;
    const starEl = document.getElementById('starCount');
    if (starEl) {
      starEl.textContent = String(gameState.stars);
    }
  }

  /**
   * Zera o placar de estrelas da partida atual na memoria e na interface.
   */
  function resetStars() {
    gameState.stars = 0;
    const starEl = document.getElementById('starCount');
    if (starEl) {
      starEl.textContent = '0';
    }
  }

  /**
   * Seleciona mensagens encorajadoras ou comemorativas de forma rotativa.
   */
  function pickRotatingMessage(list, key) {
    if (!Array.isArray(list) || list.length === 0) return '';
    const idx = feedbackRotation[key] || 0;
    feedbackRotation[key] = (idx + 1) % list.length;
    return list[idx];
  }

  /**
   * Formata o plural correto de estrelas conquistadas nas mensagens finais.
   */
  function formatarEstrelas(total) {
    const qtd = Math.max(0, Number(total) || 0);
    return qtd === 1 ? '1 ESTRELA' : (qtd + ' ESTRELAS');
  }

  /**
   * Atualiza o banner inferior de feedback pedagogico (sempre via textContent).
   */
  function setFeedback(text, styleType) {
    if (feedbackPopTimer) {
      global.clearTimeout(feedbackPopTimer);
      feedbackPopTimer = null;
    }

    const msg = String(text == null ? '' : text).trim();
    const banner = document.getElementById('feedbackBanner');
    if (banner) {
      banner.textContent = text;
      banner.className = 'feedback-banner';
      if (styleType === 'success' || styleType === 'encourage') {
        banner.classList.add(styleType);
      }
      if (msg) {
        if (typeof banner.getBoundingClientRect === 'function') {
          banner.getBoundingClientRect();
        }
        banner.classList.add('is-popping');
        feedbackPopTimer = global.setTimeout(function () {
          feedbackPopTimer = null;
          if (banner.classList) {
            banner.classList.remove('is-popping');
          }
        }, 520);
      }
    }

    const mascot = getSaudeModule('Mascot');
    if (mascot && typeof mascot.onFeedback === 'function') {
      mascot.onFeedback(text, styleType, gameState.currentPhase);
    }
  }

  /**
   * Alterna a tela visivel, o rotulo da barra superior e os botoes de navegacao do rodape.
   */
  function showScreen(screenId, phaseTitle, showNavButtons) {
    const showNav = showNavButtons !== false;
    const isMenu = screenId === 'screenMenu';
    const screens = document.querySelectorAll('.screen');
    for (let i = 0; i < screens.length; i++) {
      screens[i].classList.remove('active');
    }

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    const headerLabel = document.getElementById('headerPhaseLabel');
    if (headerLabel) {
      headerLabel.textContent = phaseTitle;
      headerLabel.classList.toggle('u-hidden', isMenu);
    }

    const dockEl = document.querySelector('footer.bottom-dock');
    if (dockEl) {
      dockEl.classList.toggle('is-menu', isMenu);
    }

    const btnBack = document.getElementById('btnBackMenu');
    if (btnBack) {
      btnBack.classList.toggle('u-hidden', !showNav);
    }
    resetHomeConfirmation();

    const btnNext = document.getElementById('btnNextWord');
    if (btnNext) {
      btnNext.classList.toggle('u-hidden', !showNav);
    }

    const mascot = getSaudeModule('Mascot');
    if (mascot && typeof mascot.onScreenChange === 'function') {
      mascot.onScreenChange(screenId);
    }
  }

  /**
   * Reseta o estado de confirmacao em 2 toques do botao MENU INICIAL na barra inferior.
   */
  function resetHomeConfirmation() {
    if (homeConfirmTimer) {
      global.clearTimeout(homeConfirmTimer);
      homeConfirmTimer = null;
    }
    homeConfirming = false;
    const btnBack = document.getElementById('btnBackMenu');
    if (!btnBack) return;
    btnBack.classList.remove('confirming');
    const spans = btnBack.querySelectorAll('span');
    const labelSpan = spans.length > 0 ? spans[spans.length - 1] : null;
    if (labelSpan) {
      labelSpan.textContent = 'MENU INICIAL';
    }
  }

  /**
   * Descarta qualquer sessao pendente nao identificada (evita gravar sessoes orfas ao sair no meio).
   */
  function discardPendingAnalyticsIfNeeded() {
    const analytics = getSaudeModule('Analytics');
    if (analytics && typeof analytics.descartarSessao === 'function') {
      analytics.descartarSessao();
    }
  }

  /**
   * Inicia uma nova sessao silenciosa de acompanhamento pedagogico.
   */
  function startAnalyticsSession(mode) {
    const analytics = getSaudeModule('Analytics');
    if (analytics && typeof analytics.iniciarSessao === 'function') {
      analytics.iniciarSessao({
        modoJogo: mode || 'INDEFINIDO',
        fontePalavras: isWeeklyWordsActive() ? 'PALAVRAS_SEMANA' : 'PADRAO'
      });
    }
  }

  /**************************************************************
   * 3. NAVEGACAO E CONTROLE DE MODO
   **************************************************************/
  /**
   * Define a quantidade de questoes (3, 5 ou 10) usada nas Fases 2 e 3.
   */
  function setQuestionCount(count) {
    playAudio('playClick');
    gameState.questionCount = count;
    [3, 5, 10].forEach(function (n) {
      const btn = document.getElementById('qCountBtn' + n);
      if (btn) {
        btn.classList.toggle('active', n === count);
      }
    });
  }

  /**
   * Retorna para o Menu Inicial descartando sessao pendente nao identificada e limpando rascunho do Ranking.
   * Quando acionado na barra inferior durante uma fase ativa, exige confirmacao em 2 toques.
   */
  function goHome(forceImmediate) {
    playAudio('playClick');

    const celebModal = document.getElementById('celebrationModal');
    const rankingModal = document.getElementById('rankingModal');
    const anyModalOpen = Boolean(
      (celebModal && celebModal.classList.contains('active')) ||
      (rankingModal && rankingModal.classList.contains('active'))
    );

    if (!forceImmediate && gameState.currentPhase > 0 && !anyModalOpen) {
      if (!homeConfirming) {
        homeConfirming = true;
        const btnBack = document.getElementById('btnBackMenu');
        if (btnBack) {
          btnBack.classList.add('confirming');
          const spans = btnBack.querySelectorAll('span');
          const labelSpan = spans.length > 0 ? spans[spans.length - 1] : null;
          if (labelSpan) {
            labelSpan.textContent = 'TOQUE NOVAMENTE PARA SAIR';
          }
        }
        if (homeConfirmTimer) {
          global.clearTimeout(homeConfirmTimer);
        }
        homeConfirmTimer = global.setTimeout(function () {
          resetHomeConfirmation();
        }, 3500);
        return false;
      }
    }

    resetHomeConfirmation();
    discardPendingAnalyticsIfNeeded();

    if (celebModal) celebModal.classList.remove('active');
    if (rankingModal) rankingModal.classList.remove('active');

    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.resetDraft === 'function') {
      ranking.resetDraft();
    }

    gameState.mode = 'MENU';
    gameState.currentPhase = 0;
    showScreen('screenMenu', 'MENU INICIAL', false);

    const bannerEl = document.getElementById('feedbackBanner');
    if (bannerEl) {
      if (feedbackPopTimer) {
        global.clearTimeout(feedbackPopTimer);
        feedbackPopTimer = null;
      }
      bannerEl.textContent = '';
      bannerEl.className = 'feedback-banner';
    }

    const teacherPanel = getSaudeModule('TeacherPanel');
    if (teacherPanel && typeof teacherPanel.atualizarIndicadoresMenu === 'function') {
      teacherPanel.atualizarIndicadoresMenu();
    }
    updatePhaseWeeklyBadges();
    return true;
  }

  /**
   * Inicia a Jornada Completa ou uma fase isolada zerando estrelas e rascunho do Ranking.
   */
  function startGameMode(mode) {
    playAudio('playPop');
    resetHomeConfirmation();
    discardPendingAnalyticsIfNeeded();

    gameState.mode = mode;
    resetStars();

    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.resetDraft === 'function') {
      ranking.resetDraft();
    }

    startAnalyticsSession(mode);

    if (mode === 'JOURNEY' || mode === 'PHASE1') {
      startPhase1();
    } else if (mode === 'PHASE2') {
      startPhase2();
    } else if (mode === 'PHASE3') {
      startPhase3();
    }
  }

  /**
   * Pula para novos pares (Fase 1) ou para a proxima palavra da fila (Fases 2 e 3).
   */
  function skipOrNextItem() {
    playAudio('playClick');
    if (gameState.currentPhase === 1) {
      initPhase1Round();
    } else if (gameState.currentPhase === 2) {
      if (gameState.p2Queue.length > 0) {
        gameState.p2Index = (gameState.p2Index + 1) % gameState.p2Queue.length;
        loadPhase2Word();
      }
    } else if (gameState.currentPhase === 3) {
      if (gameState.p3Queue.length > 0) {
        gameState.p3Index = (gameState.p3Index + 1) % gameState.p3Queue.length;
        loadPhase3Word();
      }
    }
  }

  /**************************************************************
   * 4. FASE 1: JOGO DA MEMORIA (FIGURA / DICA + PALAVRA)
   **************************************************************/
  function startPhase1() {
    gameState.currentPhase = 1;
    showScreen('screenPhase1', 'FASE 1: JOGO DA MEMÓRIA', true);
    const nextLabel = document.getElementById('btnNextWordLabel');
    if (nextLabel) nextLabel.textContent = 'NOVOS PARES';
    initPhase1Round();
  }

  function initPhase1Round() {
    const bankInfo = getActiveBankInfoSafe();
    const weeklyActive = bankInfo.isWeekly;
    const storage = getSaudeModule('Storage');
    const bank = bankInfo.words;
    const deck = [];

    updatePhaseWeeklyBadges(bankInfo);

    const instrEl = document.getElementById('p1InstructionText');
    let fase1Modo = 'dica';

    if (weeklyActive && storage) {
      const cfg = typeof storage.getConfig === 'function' ? storage.getConfig() : null;
      fase1Modo = cfg && cfg.fase1ModoSemana === 'silaba' ? 'silaba' : 'dica';
    } else if (instrEl) {
      instrEl.textContent = 'ENCONTRE OS PARES: 1 FIGURA + 1 PALAVRA ESCRITA!';
    }

    const shuffledBank = shuffleArray(bank);
    let selectedWords = [];
    if (weeklyActive) {
      // Prioriza 4 palavras com figuras, dicas ou silabas iniciais distintas na rodada
      const usedClueKeys = {};
      const pickedIndices = {};
      for (let i = 0; i < shuffledBank.length && selectedWords.length < 4; i++) {
        const cand = shuffledBank[i];
        const candUsaFigura = fase1Modo !== 'silaba' && Boolean(cand.hasSticker && cand.svg);
        const candUsaDica = fase1Modo === 'dica' && Boolean(cand.dicaOriginal && cand.dicaOriginal.trim());
        const candKey = candUsaFigura
          ? ('F:' + String(cand.stickerId || cand.id || cand.plain || '').trim().toUpperCase())
          : (candUsaDica
            ? ('D:' + cand.dicaOriginal.trim().toUpperCase())
            : ('S:' + String(cand.silabaInicial || (cand.syllables && cand.syllables[0]) || '').trim().toUpperCase()));
        if (!usedClueKeys[candKey]) {
          usedClueKeys[candKey] = true;
          pickedIndices[i] = true;
          selectedWords.push(cand);
        }
      }
      for (let j = 0; j < shuffledBank.length && selectedWords.length < 4; j++) {
        if (!pickedIndices[j]) {
          selectedWords.push(shuffledBank[j]);
        }
      }
    } else {
      selectedWords = shuffledBank.slice(0, 4);
    }

    let qtdFigurasSemana = 0;
    selectedWords.forEach(function (item) {
      if (weeklyActive) {
        const usaFigura = fase1Modo !== 'silaba' && Boolean(item.hasSticker && item.svg);
        const silabaIni = String(item.silabaInicial || (item.syllables && item.syllables[0]) || '').trim().toUpperCase();
        if (usaFigura) {
          qtdFigurasSemana += 1;
          deck.push({
            uid: item.id + '_FIG',
            pairId: item.id,
            type: 'FIGURE',
            word: item.word,
            emoji: item.emoji,
            svg: item.svg,
            stickerId: item.stickerId || null,
            silabaInicial: silabaIni,
            isWeeklyWord: true,
            matched: false
          });
        } else {
          const usaDica = fase1Modo === 'dica' && Boolean(item.dicaOriginal && item.dicaOriginal.trim());
          deck.push({
            uid: item.id + '_CLUE',
            pairId: item.id,
            type: 'CLUE_OR_SYL',
            clueKind: usaDica ? 'DICA' : 'SILABA',
            clueValue: usaDica ? item.dicaOriginal : silabaIni,
            word: item.word,
            isWeeklyWord: true,
            matched: false
          });
        }
        deck.push({
          uid: item.id + '_WORD',
          pairId: item.id,
          type: 'WORD',
          word: item.word,
          silabaInicial: silabaIni,
          isWeeklyWord: true,
          matched: false
        });
      } else {
        // Card A: Figura + SVG (modo padrao Saude Bucal preservado)
        deck.push({
          uid: item.id + '_FIG',
          pairId: item.id,
          type: 'FIGURE',
          word: item.word,
          emoji: item.emoji,
          svg: item.svg,
          matched: false
        });
        // Card B: Apenas a Palavra Escrita
        deck.push({
          uid: item.id + '_WORD',
          pairId: item.id,
          type: 'WORD',
          word: item.word,
          matched: false
        });
      }
    });

    if (weeklyActive && instrEl) {
      if (fase1Modo === 'silaba') {
        instrEl.textContent = 'ENCONTRE OS PARES DA SEMANA: PALAVRA + SÍLABA INICIAL!';
      } else if (qtdFigurasSemana === selectedWords.length && selectedWords.length > 0) {
        instrEl.textContent = 'ENCONTRE OS PARES DA SEMANA: 1 FIGURA + 1 PALAVRA ESCRITA!';
      } else if (qtdFigurasSemana > 0) {
        instrEl.textContent = 'ENCONTRE OS PARES DA SEMANA: PALAVRA + FIGURA OU DICA!';
      } else {
        instrEl.textContent = 'ENCONTRE OS PARES DA SEMANA: PALAVRA + DICA OU SÍLABA!';
      }
    }

    gameState.p1Cards = shuffleArray(deck);
    gameState.p1Flipped = [];
    gameState.p1MatchedCount = 0;
    gameState.p1Mistakes = 0;
    gameState.p1PairMistakes = {};
    gameState.p1StartTime = null;
    gameState.p1Lock = false;

    updateP1Counter();
    let feedbackInicialP1 = 'VIRE DUAS CARTAS PARA ENCONTRAR A FIGURA E A PALAVRA!';
    if (weeklyActive) {
      if (fase1Modo === 'silaba') {
        feedbackInicialP1 = 'VIRE DUAS CARTAS PARA ENCONTRAR A PALAVRA E SUA SÍLABA!';
      } else if (qtdFigurasSemana === selectedWords.length && selectedWords.length > 0) {
        feedbackInicialP1 = 'VIRE DUAS CARTAS PARA ENCONTRAR A FIGURA E A PALAVRA!';
      } else if (qtdFigurasSemana > 0) {
        feedbackInicialP1 = 'VIRE DUAS CARTAS PARA ENCONTRAR A PALAVRA E SUA FIGURA OU DICA!';
      } else {
        feedbackInicialP1 = 'VIRE DUAS CARTAS PARA ENCONTRAR A PALAVRA E SUA DICA OU SÍLABA!';
      }
    }
    setFeedback(feedbackInicialP1);
    renderMemoryGrid();
  }

  function updateP1Counter() {
    const counterEl = document.getElementById('p1PairsCounter');
    if (counterEl) {
      counterEl.textContent = 'PARES: ' + gameState.p1MatchedCount + ' / 4';
    }
  }

  function renderMemoryGrid() {
    const grid = document.getElementById('memoryGrid');
    const domSafe = getDomSafe();
    if (!grid || !domSafe) return;

    const storage = getSaudeModule('Storage');
    const cardToothSvg = getWordBankSvg('CARD_TOOTH');
    const svgWeeklyBack = (storage && storage.SVGs && storage.SVGs.CARD_BACK_SEMANA)
      ? storage.SVGs.CARD_BACK_SEMANA
      : cardToothSvg;
    const svgMiniDica = (storage && storage.SVGs && storage.SVGs.MINI_ESTRELA_DICA)
      ? storage.SVGs.MINI_ESTRELA_DICA
      : '';

    domSafe.clear(grid);

    gameState.p1Cards.forEach(function (card, index) {
      const btn = domSafe.el('button', {
        type: 'button',
        className: 'mem-card',
        id: 'memCard_' + index
      });
      domSafe.on(btn, 'click', function () { onMemoryCardTap(index); });

      const frontSvg = card.isWeeklyWord ? svgWeeklyBack : cardToothSvg;
      const frontIconEl = domSafe.el('div', { className: 'mem-front-icon' });
      if (frontSvg) {
        domSafe.setSvg(frontIconEl, frontSvg);
      }

      const frontFace = domSafe.el('div', { className: 'mem-face mem-front' }, [
        frontIconEl,
        domSafe.el('div', { className: 'mem-front-label', text: 'TOQUE AQUI' })
      ]);

      const backFace = domSafe.el('div', { className: 'mem-face mem-back' });

      if (card.type === 'FIGURE') {
        const illustEl = domSafe.el('div', { className: 'mem-illustration' });
        if (card.svg) {
          domSafe.setSvg(illustEl, card.svg);
        }
        backFace.appendChild(illustEl);
      } else if (card.type === 'CLUE_OR_SYL') {
        const isDica = card.clueKind === 'DICA';
        const tagLabel = isDica ? 'DICA CURTA' : 'SÍLABA INICIAL';
        const clueStr = card.clueValue != null ? String(card.clueValue).trim() : '';
        let clueCardClass = 'mem-clue-card ' + (isDica ? 'is-dica-card' : 'is-syl-card');
        if (isDica) {
          if (clueStr.length >= 70) {
            clueCardClass += ' is-long-clue is-very-long-clue';
          } else if (clueStr.length >= 42) {
            clueCardClass += ' is-long-clue';
          }
        }
        const clueCardEl = domSafe.el('div', { className: clueCardClass }, [
          domSafe.el('span', { className: 'mem-clue-tag', text: tagLabel })
        ]);
        if (svgMiniDica) {
          const iconSpan = domSafe.el('span', { className: 'mem-clue-icon' });
          domSafe.setSvg(iconSpan, svgMiniDica);
          clueCardEl.appendChild(iconSpan);
        }
        clueCardEl.appendChild(domSafe.el('div', {
          className: isDica ? 'mem-clue-text' : 'mem-clue-syllable',
          text: clueStr
        }));
        backFace.appendChild(clueCardEl);
      } else {
        let wordClasses = 'mem-word-text';
        if (card.isWeeklyWord) {
          const wLen = card.word ? card.word.length : 0;
          wordClasses += ' is-weekly-word';
          if (wLen >= 10) {
            wordClasses += ' is-long is-xlong';
          } else if (wLen >= 7) {
            wordClasses += ' is-long';
          }
        } else if (card.word && card.word.length >= 8) {
          wordClasses += ' is-long';
        }
        backFace.appendChild(domSafe.el('div', {
          className: wordClasses,
          text: card.word != null ? String(card.word) : ''
        }));
      }

      const inner = domSafe.el('div', { className: 'mem-card-inner' }, [frontFace, backFace]);
      btn.appendChild(inner);
      grid.appendChild(btn);
    });
  }

  function onMemoryCardTap(index) {
    if (gameState.p1Lock) return;
    const card = gameState.p1Cards[index];
    if (!card || card.matched) return;
    if (gameState.p1Flipped.indexOf(index) !== -1) return;

    if (!gameState.p1StartTime) {
      gameState.p1StartTime = Date.now();
    }

    playAudio('playPop');
    gameState.p1Flipped.push(index);

    const cardEl = document.getElementById('memCard_' + index);
    if (cardEl) cardEl.classList.add('flipped');

    if (gameState.p1Flipped.length === 2) {
      gameState.p1Lock = true;
      const roundCards = gameState.p1Cards;
      const idx1 = gameState.p1Flipped[0];
      const idx2 = gameState.p1Flipped[1];
      const card1 = roundCards[idx1];
      const card2 = roundCards[idx2];

      let isMatch = (card1.pairId === card2.pairId);

      // Se duas palavras da semana na rodada compartilharem a mesma silaba inicial, aceita o par valido
      if (!isMatch && card1.isWeeklyWord && card2.isWeeklyWord && card1.type !== card2.type) {
        const clueCard = card1.type === 'CLUE_OR_SYL' ? card1 : card2;
        const wordCard = card1.type === 'WORD' ? card1 : card2;
        if (clueCard && wordCard &&
            clueCard.clueKind === 'SILABA' &&
            clueCard.clueValue &&
            clueCard.clueValue === wordCard.silabaInicial) {
          for (let k = 0; k < roundCards.length; k++) {
            const other = roundCards[k];
            if (other !== clueCard && !other.matched &&
                other.type === 'CLUE_OR_SYL' && other.pairId === wordCard.pairId) {
              other.pairId = clueCard.pairId;
              other.word = clueCard.word;
              break;
            }
          }
          clueCard.pairId = wordCard.pairId;
          clueCard.word = wordCard.word;
          isMatch = true;
        }
      }

      if (isMatch) {
        // Par correto!
        const matchedWord = card1.type === 'WORD' ? card1.word : card2.word;
        global.setTimeout(function () {
          if (gameState.currentPhase !== 1 || gameState.p1Cards !== roundCards) return;

          playAudio('playSuccess');
          card1.matched = true;
          card2.matched = true;

          const el1 = document.getElementById('memCard_' + idx1);
          const el2 = document.getElementById('memCard_' + idx2);
          if (el1) el1.classList.add('matched');
          if (el2) el2.classList.add('matched');

          gameState.p1Flipped = [];
          gameState.p1MatchedCount++;
          addStars(1);
          updateP1Counter();
          const msgAcertoP1 = pickRotatingMessage([
            'MUITO BEM! VOCÊ ENCONTROU O PAR DE "' + matchedWord + '"!',
            'ISSO MESMO! QUE BOA MEMÓRIA COM "' + matchedWord + '"!',
            'PARABÉNS! VOCÊ ACERTOU O PAR DE "' + matchedWord + '"!'
          ], 'p1Success');
          setFeedback(msgAcertoP1, 'success');
          gameState.p1Lock = false;

          if (gameState.p1MatchedCount === 4) {
            if (gameState.p1Mistakes <= 2) {
              addStars(1);
            }
            const elapsedSec = gameState.p1StartTime
              ? Math.max(1, Math.round((Date.now() - gameState.p1StartTime) / 1000))
              : 1;
            gameState.p1StartTime = null;
            const analytics = getSaudeModule('Analytics');
            if (analytics && typeof analytics.registrarConclusaoFase1 === 'function') {
              analytics.registrarConclusaoFase1({
                tempoSegundos: elapsedSec,
                pares: 4
              });
            }
            global.setTimeout(function () {
              if (gameState.currentPhase !== 1 || gameState.p1Cards !== roundCards) return;
              onPhase1Complete();
            }, 800);
          }
        }, 450);
      } else {
        // Nao formou par
        gameState.p1Mistakes++;
        gameState.p1PairMistakes[card1.pairId] = true;
        gameState.p1PairMistakes[card2.pairId] = true;

        global.setTimeout(function () {
          if (gameState.currentPhase !== 1 || gameState.p1Cards !== roundCards) return;
          playAudio('playEncourage');
          const msgErroP1 = pickRotatingMessage([
            'QUASE LÁ! OBSERVE BEM AS CARTAS E TENTE DE NOVO!',
            'OPS! ESSAS SÃO DIFERENTES! GUARDE NA MEMÓRIA E VAMOS LÁ!',
            'BOA TENTATIVA! VOCÊ CONSEGUE ENCONTRAR O PAR CERTINHO!'
          ], 'p1Encourage');
          setFeedback(msgErroP1, 'encourage');
        }, 220);

        global.setTimeout(function () {
          if (gameState.currentPhase !== 1 || gameState.p1Cards !== roundCards) return;
          const el1 = document.getElementById('memCard_' + idx1);
          const el2 = document.getElementById('memCard_' + idx2);
          if (el1) el1.classList.remove('flipped');
          if (el2) el2.classList.remove('flipped');
          gameState.p1Flipped = [];
          gameState.p1Lock = false;
        }, 1250);
      }
    }
  }

  function onPhase1Complete() {
    playAudio('playFanfare');
    const mascot = getSaudeModule('Mascot');
    if (mascot && typeof mascot.celebrateAchievement === 'function') {
      mascot.celebrateAchievement('', true);
    } else if (mascot && typeof mascot.celebrate === 'function') {
      mascot.celebrate('', true);
    }
    const modal = document.getElementById('celebrationModal');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    const btn = document.getElementById('modalPrimaryBtn');

    if (gameState.mode === 'JOURNEY') {
      if (title) title.textContent = 'FASE 1 CONCLUÍDA!';
      if (msg) msg.textContent = 'PARABÉNS! AGORA VAMOS PARA A FASE 2: CONSTRUTOR DE SÍLABAS!';
      if (btn) setButtonIconLabel(btn, 'PLAY_ICON', 'IR PARA A FASE 2');
      toggleRankingRegisterBox(false);
    } else {
      if (title) title.textContent = 'SHOW DE MEMÓRIA!';
      if (msg) {
        msg.textContent = isWeeklyWordsActive()
          ? 'VOCÊ CONQUISTOU ' + formatarEstrelas(gameState.stars) + ' NAS PALAVRAS DA SEMANA!'
          : 'VOCÊ CONQUISTOU ' + formatarEstrelas(gameState.stars) + ' EM SAÚDE BUCAL!';
      }
      if (btn) setButtonIconLabel(btn, 'REPLAY_ICON', 'JOGAR OUTRA RODADA');
      toggleRankingRegisterBox(true);
    }
    if (modal) modal.classList.add('active');
  }

  /**************************************************************
   * 5. FASE 2: CONSTRUTOR DE SILABAS (SIMPLES E COMPLEXAS)
   **************************************************************/
  function startPhase2() {
    gameState.currentPhase = 2;
    const bankInfo = getActiveBankInfoSafe();
    const bank = bankInfo.words;
    const count = Math.min(gameState.questionCount, bank.length);
    gameState.p2Queue = shuffleArray(bank).slice(0, count);
    gameState.p2Index = 0;

    showScreen('screenPhase2', 'FASE 2: CONSTRUTOR DE SÍLABAS', true);
    updatePhaseWeeklyBadges(bankInfo);
    const nextLabel = document.getElementById('btnNextWordLabel');
    if (nextLabel) nextLabel.textContent = 'OUTRA PALAVRA';
    loadPhase2Word();
  }

  function loadPhase2Word() {
    gameState.p2Lock = false;
    gameState.p2FirstTry = true;

    const item = gameState.p2Queue[gameState.p2Index];
    if (!item) return;
    gameState.p2CurrentWord = item;

    const totalWords = gameState.p2Queue.length;
    const progressEl = document.getElementById('p2ProgressTag');
    if (progressEl) progressEl.textContent = 'PALAVRA ' + (gameState.p2Index + 1) + ' DE ' + totalWords;

    const svgEl = document.getElementById('p2SvgContainer');
    const domSafe = getDomSafe();
    if (svgEl && domSafe) domSafe.setSvg(svgEl, item.svg || '');

    const wordBank = getSaudeModule('WordBank');
    const clueText = (wordBank && typeof wordBank.getNextClueForWord === 'function')
      ? wordBank.getNextClueForWord(item)
      : (item.clue || '');
    const clueEl = document.getElementById('p2ClueText');
    if (clueEl) clueEl.textContent = clueText;

    // Inicializa espacos vazios
    const syllables = Array.isArray(item.syllables) ? item.syllables : [];
    gameState.p2Slots = new Array(syllables.length).fill(null);

    // Sorteia 2 silabas intrusas e embaralha com as silabas da palavra
    const chosenIntruders = shuffleArray(item.intruders || []).slice(0, 2);
    const combinedPool = syllables.concat(chosenIntruders).map(function (syl, idx) {
      return {
        id: idx,
        text: syl,
        used: false
      };
    });

    gameState.p2Pool = shuffleArray(combinedPool);
    setFeedback('TOQUE NAS SÍLABAS ABAIXO PARA MONTAR A PALAVRA!');
    renderPhase2();
  }

  function renderPhase2() {
    const slotsRow = document.getElementById('p2SlotsRow');
    const poolRow = document.getElementById('p2PoolRow');
    const domSafe = getDomSafe();
    if (!slotsRow || !poolRow || !domSafe) return;

    const manySyls = Boolean(
      gameState.p2CurrentWord &&
      Array.isArray(gameState.p2CurrentWord.syllables) &&
      gameState.p2CurrentWord.syllables.length >= 4
    );
    slotsRow.classList.toggle('many-syls', manySyls);
    poolRow.classList.toggle('many-syls', manySyls);
    domSafe.clear(slotsRow);
    domSafe.clear(poolRow);

    // Renderiza espacos das silabas
    gameState.p2Slots.forEach(function (slotItem, slotIdx) {
      const slotBtn = domSafe.el('button', {
        type: 'button',
        className: 'syl-slot' + (slotItem ? ' filled' : ''),
        id: 'p2Slot_' + slotIdx,
        text: slotItem ? slotItem.text : ''
      });
      domSafe.on(slotBtn, 'click', function () { onTapFilledSlot(slotIdx); });
      slotsRow.appendChild(slotBtn);
    });

    // Renderiza botoes do banco de silabas na parte inferior
    gameState.p2Pool.forEach(function (poolItem, poolIdx) {
      const btn = domSafe.el('button', {
        type: 'button',
        className: 'syl-btn' + (poolItem.used ? ' used' : ''),
        text: poolItem.text
      });
      domSafe.on(btn, 'click', function () { onTapPoolSyllable(poolIdx); });
      poolRow.appendChild(btn);
    });
  }

  function onTapPoolSyllable(poolIdx) {
    if (gameState.p2Lock) return;
    const poolItem = gameState.p2Pool[poolIdx];
    if (!poolItem || poolItem.used) return;

    // Encontra o primeiro espaco vazio
    const emptySlotIdx = gameState.p2Slots.indexOf(null);
    if (emptySlotIdx === -1) return;

    playAudio('playPop');
    poolItem.used = true;
    gameState.p2Slots[emptySlotIdx] = poolItem;
    renderPhase2();

    // Verifica se todos os espacos foram preenchidos
    if (gameState.p2Slots.every(function (s) { return s !== null; })) {
      checkPhase2Answer();
    }
  }

  function onTapFilledSlot(slotIdx) {
    if (gameState.p2Lock) return;
    const slotItem = gameState.p2Slots[slotIdx];
    if (!slotItem) return;

    playAudio('playClick');
    slotItem.used = false;
    gameState.p2Slots[slotIdx] = null;
    renderPhase2();
  }

  function checkPhase2Answer() {
    gameState.p2Lock = true;
    const currentItem = gameState.p2CurrentWord;
    if (!currentItem) {
      gameState.p2Lock = false;
      return;
    }

    const targetSyllables = Array.isArray(currentItem.syllables) ? currentItem.syllables : [];
    const chosenSyllables = gameState.p2Slots.map(function (s) { return s ? s.text : ''; });
    const isCorrect = gameState.p2Slots.every(function (s, idx) {
      return Boolean(s && s.text === targetSyllables[idx]);
    });

    const analytics = getSaudeModule('Analytics');
    if (analytics && typeof analytics.registrarTentativaFase2 === 'function') {
      analytics.registrarTentativaFase2({
        palavra: currentItem.word,
        silabasEsperadas: targetSyllables,
        silabasEscolhidas: chosenSyllables,
        acertou: isCorrect,
        primeiraTentativa: gameState.p2FirstTry
      });
    }

    if (isCorrect) {
      playAudio('playSuccess');
      if (gameState.p2FirstTry) {
        addStars(1);
      }
      document.querySelectorAll('.syl-slot').forEach(function (el) {
        el.classList.add('correct');
      });
      const msgAcertoP2 = pickRotatingMessage([
        'PARABÉNS! VOCÊ FORMOU A PALAVRA "' + currentItem.word + '"!',
        'MUITO BEM! VOCÊ JUNTOU AS SÍLABAS DE "' + currentItem.word + '"!',
        'ISSO AÍ! A PALAVRA "' + currentItem.word + '" FICOU CERTINHA!'
      ], 'p2Success');
      setFeedback(msgAcertoP2, 'success');

      global.setTimeout(function () {
        if (gameState.currentPhase !== 2 || gameState.p2CurrentWord !== currentItem) return;
        const targetTotal = gameState.p2Queue.length;
        if (gameState.p2Index + 1 < targetTotal) {
          gameState.p2Index++;
          loadPhase2Word();
        } else {
          onPhase2Complete();
        }
      }, 1300);
    } else {
      gameState.p2FirstTry = false;
      playAudio('playEncourage');
      document.querySelectorAll('.syl-slot').forEach(function (el) {
        el.classList.add('wrong');
      });
      const temFiguraP2 = !currentItem.isWeeklyWord || Boolean(currentItem.hasSticker);
      const msgErroP2 = pickRotatingMessage([
        'QUASE LÁ! OBSERVE AS SÍLABAS QUE VOLTARAM E TENTE DE NOVO!',
        'BOA TENTATIVA! FALE A PALAVRA DEVAGAR PARA OUVIR OS PEDACINHOS!',
        temFiguraP2
          ? 'VOCÊ ESTÁ PERTO! OBSERVE A FIGURA E TESTE OUTRA SÍLABA!'
          : 'VOCÊ ESTÁ PERTO! LEIA A DICA E TESTE OUTRA SÍLABA!'
      ], 'p2Encourage');
      setFeedback(msgErroP2, 'encourage');

      global.setTimeout(function () {
        if (gameState.currentPhase !== 2 || gameState.p2CurrentWord !== currentItem) return;
        // Devolve apenas as silabas erradas para facilitar a tentativa da crianca
        gameState.p2Slots.forEach(function (s, idx) {
          if (s && s.text !== targetSyllables[idx]) {
            s.used = false;
            gameState.p2Slots[idx] = null;
          }
        });
        gameState.p2Lock = false;
        renderPhase2();
      }, 1000);
    }
  }

  function onPhase2Complete() {
    playAudio('playFanfare');
    const mascot = getSaudeModule('Mascot');
    if (mascot && typeof mascot.celebrateAchievement === 'function') {
      mascot.celebrateAchievement('', true);
    } else if (mascot && typeof mascot.celebrate === 'function') {
      mascot.celebrate('', true);
    }
    const modal = document.getElementById('celebrationModal');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    const btn = document.getElementById('modalPrimaryBtn');

    if (gameState.mode === 'JOURNEY') {
      if (title) title.textContent = 'FASE 2 CONCLUÍDA!';
      if (msg) msg.textContent = 'VOCÊ É DEMAIS NAS SÍLABAS! VAMOS PARA A FASE 3: ESCRITA ESPONTÂNEA!';
      if (btn) setButtonIconLabel(btn, 'PLAY_ICON', 'IR PARA A FASE 3');
      toggleRankingRegisterBox(false);
    } else {
      if (title) title.textContent = 'SHOW DE SÍLABAS!';
      if (msg) msg.textContent = 'VOCÊ CONQUISTOU ' + formatarEstrelas(gameState.stars) + ' NO CONSTRUTOR DE SÍLABAS!';
      if (btn) setButtonIconLabel(btn, 'REPLAY_ICON', 'JOGAR NOVAMENTE');
      toggleRankingRegisterBox(true);
    }
    if (modal) modal.classList.add('active');
  }

  /**************************************************************
   * 6. FASE 3: ESCRITA ESPONTANEA (COM REGRA ANTI-PREGUICA)
   **************************************************************/
  function startPhase3() {
    gameState.currentPhase = 3;
    const bankInfo = getActiveBankInfoSafe();
    const bank = bankInfo.words;
    const count = Math.min(gameState.questionCount, bank.length);
    gameState.p3Queue = shuffleArray(bank).slice(0, count);
    gameState.p3Index = 0;

    showScreen('screenPhase3', 'FASE 3: ESCRITA ESPONTÂNEA', true);
    updatePhaseWeeklyBadges(bankInfo);
    const nextLabel = document.getElementById('btnNextWordLabel');
    if (nextLabel) nextLabel.textContent = 'OUTRA PALAVRA';
    buildVirtualKeyboard();
    loadPhase3Word();
  }

  function createKeyButton(letter) {
    const domSafe = getDomSafe();
    const btn = domSafe.el('button', {
      type: 'button',
      className: 'key-btn',
      text: letter
    });
    domSafe.on(btn, 'click', function () { onPressLetter(letter); });
    return btn;
  }

  function buildVirtualKeyboard() {
    const kb = document.getElementById('virtualKeyboard');
    const domSafe = getDomSafe();
    if (!kb || !domSafe) return;
    domSafe.clear(kb);

    const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

    // Linha 1
    const r1El = domSafe.el('div', { className: 'kb-row' });
    row1.forEach(function (letter) {
      r1El.appendChild(createKeyButton(letter));
    });
    kb.appendChild(r1El);

    // Linha 2
    const r2El = domSafe.el('div', { className: 'kb-row' });
    row2.forEach(function (letter) {
      r2El.appendChild(createKeyButton(letter));
    });
    kb.appendChild(r2El);

    // Linha 3 + APAGAR + VERIFICAR
    const r3El = domSafe.el('div', { className: 'kb-row' });

    const backBtn = domSafe.el('button', {
      type: 'button',
      className: 'key-btn key-action key-backspace'
    });
    setButtonIconLabel(backBtn, 'KEY_BACKSPACE', 'APAGAR');
    domSafe.on(backBtn, 'click', function () { onPressBackspace(); });
    r3El.appendChild(backBtn);

    row3.forEach(function (letter) {
      r3El.appendChild(createKeyButton(letter));
    });

    const verifyBtn = domSafe.el('button', {
      type: 'button',
      className: 'key-btn key-action key-verify'
    });
    setButtonIconLabel(verifyBtn, 'KEY_VERIFY', 'VERIFICAR');
    domSafe.on(verifyBtn, 'click', function () { onVerifyPhase3(); });
    r3El.appendChild(verifyBtn);

    kb.appendChild(r3El);
  }

  /**
   * Formata a frase da Fase 3 escapando o texto bruto antes de inserir a lacuna HTML (blindagem XSS).
   */
  function formatPhase3SentenceHtml(sentenceTemplate, replacementHtml) {
    const safeTemplate = escapeHtmlSafe(sentenceTemplate || '');
    if (safeTemplate.includes('___')) {
      return safeTemplate.replace('___', replacementHtml);
    }
    return safeTemplate;
  }

  function loadPhase3Word() {
    gameState.p3Lock = false;
    gameState.p3FirstTry = true;

    const item = gameState.p3Queue[gameState.p3Index];
    if (!item) return;
    gameState.p3CurrentWord = item;

    const totalWords = gameState.p3Queue.length;
    const progressEl = document.getElementById('p3ProgressTag');
    if (progressEl) progressEl.textContent = 'DESAFIO ' + (gameState.p3Index + 1) + ' DE ' + totalWords;

    const svgEl = document.getElementById('p3SvgContainer');
    const domSafe = getDomSafe();
    if (svgEl && domSafe) domSafe.setSvg(svgEl, item.svg || '');

    const wordBank = getSaudeModule('WordBank');
    gameState.currentP3Sentence = (wordBank && typeof wordBank.getNextSentenceForWord === 'function')
      ? wordBank.getNextSentenceForWord(item)
      : (item.sentence || '');

    const blanks = '_'.repeat(item.word.length);
    const sentenceEl = document.getElementById('p3SentenceText');
    if (sentenceEl) {
      renderPhase3PromptDom(sentenceEl, item, gameState.currentP3Sentence || item.sentence, blanks, false);
    }

    gameState.p3Typed = new Array(item.word.length).fill('');
    gameState.p3Locked = new Array(item.word.length).fill(false);

    setFeedback('USE O TECLADO PARA ESCREVER A PALAVRA E TOQUE EM VERIFICAR!');
    renderPhase3Boxes();
  }

  function getActiveCursorIndex() {
    for (let i = 0; i < gameState.p3Typed.length; i++) {
      if (!gameState.p3Locked[i] && gameState.p3Typed[i] === '') {
        return i;
      }
    }
    return -1;
  }

  function renderPhase3Boxes() {
    const row = document.getElementById('p3LetterBoxes');
    const domSafe = getDomSafe();
    if (!row || !domSafe) return;

    row.classList.toggle('many-letters', gameState.p3Typed.length >= 8);
    row.classList.toggle('extra-long-letters', gameState.p3Typed.length >= 11);
    domSafe.clear(row);
    const activeIdx = getActiveCursorIndex();

    gameState.p3Typed.forEach(function (char, idx) {
      const box = document.createElement('div');
      box.className = 'letter-box';
      if (gameState.p3Locked[idx]) {
        box.classList.add('locked-correct');
      } else if (idx === activeIdx) {
        box.classList.add('active-cursor');
      }
      box.textContent = char;
      row.appendChild(box);
    });
  }

  function onPressLetter(letter) {
    if (gameState.p3Lock) return;
    const cursorIdx = getActiveCursorIndex();
    if (cursorIdx === -1) return;

    playAudio('playClick');
    gameState.p3Typed[cursorIdx] = letter;
    renderPhase3Boxes();
  }

  function onPressBackspace() {
    if (gameState.p3Lock) return;
    // Apaga a ultima letra digitada que NAO esta bloqueada como verde (correta)
    for (let i = gameState.p3Typed.length - 1; i >= 0; i--) {
      if (!gameState.p3Locked[i] && gameState.p3Typed[i] !== '') {
        playAudio('playClick');
        gameState.p3Typed[i] = '';
        renderPhase3Boxes();
        return;
      }
    }
  }

  function onVerifyPhase3() {
    if (gameState.p3Lock) return;
    const item = gameState.p3CurrentWord;
    if (!item) return;

    const targetDisplayChars = item.word.split('');
    const targetPlainChars = (item.plain || normalizeChar(item.word)).split('');
    const typedBefore = gameState.p3Typed.slice();
    const lockedBefore = gameState.p3Locked.slice();

    let allCorrect = true;
    let anyCorrectHit = false;
    let anyTyped = false;

    for (let i = 0; i < targetPlainChars.length; i++) {
      const userChar = normalizeChar(gameState.p3Typed[i] || '');
      if (userChar !== '') anyTyped = true;

      if (userChar === targetPlainChars[i]) {
        // Letra certa na posicao certa: trava em verde e exibe com acento correto!
        gameState.p3Locked[i] = true;
        gameState.p3Typed[i] = targetDisplayChars[i];
        anyCorrectHit = true;
      } else {
        // Letra errada ou vazia: limpa apenas as erradas
        allCorrect = false;
        gameState.p3Typed[i] = '';
      }
    }

    const analytics = getSaudeModule('Analytics');
    if (analytics && typeof analytics.registrarTentativaFase3 === 'function') {
      analytics.registrarTentativaFase3({
        palavra: item.word,
        plain: item.plain,
        digitado: typedBefore,
        travadosAntes: lockedBefore,
        acertou: allCorrect,
        primeiraTentativa: gameState.p3FirstTry
      });
    }

    renderPhase3Boxes();

    if (allCorrect) {
      gameState.p3Lock = true;
      playAudio('playSuccess');
      if (gameState.p3FirstTry) {
        addStars(1);
      }

      const sentenceEl = document.getElementById('p3SentenceText');
      if (sentenceEl) {
        renderPhase3PromptDom(sentenceEl, item, gameState.currentP3Sentence || item.sentence, item.word, true);
      }
      const promptInfoP3 = resolverPromptFase3(item, gameState.currentP3Sentence || item.sentence);
      const msgComplementoP3 = promptInfoP3.mode === 'FRASE'
        ? ('PARABÉNS! VOCÊ COMPLETOU A FRASE COM "' + item.word + '"!')
        : ('PARABÉNS! VOCÊ DESCOBRIU E ESCREVEU "' + item.word + '"!');
      const msgAcertoP3 = pickRotatingMessage([
        'EXCELENTE! VOCÊ ESCREVEU "' + item.word + '" DIREITINHO!',
        msgComplementoP3,
        'MUITO BEM! A ESCRITA DE "' + item.word + '" FICOU PERFEITA!'
      ], 'p3Success');
      setFeedback(msgAcertoP3, 'success');

      global.setTimeout(function () {
        if (gameState.currentPhase !== 3 || gameState.p3CurrentWord !== item) return;
        const targetTotal = gameState.p3Queue.length;
        if (gameState.p3Index + 1 < targetTotal) {
          gameState.p3Index++;
          loadPhase3Word();
        } else {
          onPhase3Complete();
        }
      }, 1500);
    } else {
      gameState.p3FirstTry = false;
      playAudio('playEncourage');
      if (anyCorrectHit) {
        const msgParcialP3 = pickRotatingMessage([
          'MUITO BEM! VOCÊ JÁ ACERTOU ALGUMAS LETRAS! DESCUBRA AS QUE FALTAM!',
          'QUASE LÁ! AS LETRAS VERDES JÁ TRAVADAS ESTÃO CERTAS! COMPLETE O RESTANTE!'
        ], 'p3Partial');
        setFeedback(msgParcialP3, 'encourage');
      } else if (!anyTyped) {
        setFeedback('DIGITE AS LETRAS NO TECLADO E DEPOIS TOQUE EM VERIFICAR!', 'encourage');
      } else {
        const temFiguraP3 = !item.isWeeklyWord || Boolean(item.hasSticker);
        const msgErroP3 = pickRotatingMessage([
          'BOA TENTATIVA! FALE A PALAVRA DEVAGAR E DESCUBRA AS LETRAS!',
          temFiguraP3
            ? 'QUASE LÁ! OBSERVE A FIGURA E TENTE ESCREVER NOVAMENTE!'
            : 'QUASE LÁ! LEIA A PISTA E TENTE ESCREVER NOVAMENTE!',
          'NÃO DESISTA! CADA TENTATIVA AJUDA A APRENDER A PALAVRA!'
        ], 'p3Encourage');
        setFeedback(msgErroP3, 'encourage');
      }
    }
  }

  function onPhase3Complete() {
    playAudio('playFanfare');
    const mascot = getSaudeModule('Mascot');
    if (mascot && typeof mascot.celebrateAchievement === 'function') {
      mascot.celebrateAchievement('', true);
    } else if (mascot && typeof mascot.celebrate === 'function') {
      mascot.celebrate('', true);
    }
    const modal = document.getElementById('celebrationModal');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    const btn = document.getElementById('modalPrimaryBtn');

    if (gameState.mode === 'JOURNEY') {
      if (title) title.textContent = 'JORNADA COMPLETA!';
      if (msg) msg.textContent = 'PARABÉNS! VOCÊ COMPLETOU AS 3 FASES E CONQUISTOU ' + formatarEstrelas(gameState.stars) + '!';
      if (btn) setButtonIconLabel(btn, 'REPLAY_ICON', 'JOGAR NOVA JORNADA');
    } else {
      if (title) title.textContent = 'SHOW DE ESCRITA!';
      if (msg) msg.textContent = 'VOCÊ CONQUISTOU ' + formatarEstrelas(gameState.stars) + ' NA ESCRITA ESPONTÂNEA!';
      if (btn) setButtonIconLabel(btn, 'REPLAY_ICON', 'JOGAR NOVAMENTE');
    }
    toggleRankingRegisterBox(true);
    if (modal) modal.classList.add('active');
  }

  /**
   * Avanca para a proxima fase na Jornada ou reinicia a fase atual.
   */
  function handleModalContinue() {
    playAudio('playPop');
    const modal = document.getElementById('celebrationModal');
    if (modal) modal.classList.remove('active');

    if (gameState.mode === 'JOURNEY') {
      if (gameState.currentPhase === 1) {
        startPhase2();
      } else if (gameState.currentPhase === 2) {
        startPhase3();
      } else {
        startGameMode('JOURNEY');
      }
    } else {
      discardPendingAnalyticsIfNeeded();
      const ranking = getSaudeModule('Ranking');
      if (ranking && typeof ranking.resetDraft === 'function') {
        ranking.resetDraft();
      }
      startAnalyticsSession(gameState.mode);
      if (gameState.currentPhase === 1) startPhase1();
      else if (gameState.currentPhase === 2) startPhase2();
      else if (gameState.currentPhase === 3) startPhase3();
    }
  }

  /**************************************************************
   * 7. INICIALIZACAO E EVENTOS GLOBAIS
   **************************************************************/
  /**
   * Hidrata os icones estaticos marcados com [data-ui-icon] usando UiIcons e DomSafe.
   */
  function initUiIcons() {
    const domSafe = getDomSafe();
    if (!domSafe || typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;

    const audio = getSaudeModule('Audio');
    const nodes = document.querySelectorAll('[data-ui-icon]');
    for (let i = 0; i < nodes.length; i += 1) {
      const el = nodes[i];
      let iconKey = el.getAttribute('data-ui-icon');
      if (!iconKey) continue;
      if ((iconKey === 'SOUND_ON' || iconKey === 'SOUND_OFF') && audio && typeof audio.isEnabled === 'function') {
        iconKey = audio.isEnabled() ? 'SOUND_ON' : 'SOUND_OFF';
      }
      const svgMarkup = getUiIconSvg(iconKey);
      if (svgMarkup) {
        domSafe.setSvg(el, svgMarkup);
      }
    }
  }

  /**
   * Preenche o mascote SVG da tela inicial usando o modulo WordBank.
   */
  function initMascotSvg() {
    const mascotEl = document.getElementById('mascotHeroSvg');
    const mascotSvg = getWordBankSvg('MASCOT_HERO');
    const domSafe = getDomSafe();
    if (mascotEl && mascotSvg && domSafe) {
      domSafe.setSvg(mascotEl, mascotSvg);
    }
  }

  /**
   * Vincula os botoes estaticos do index.html via data-action (zero onclick inline para CSP).
   */
  function bindUiActions() {
    const domSafe = getDomSafe();
    if (!domSafe || typeof document === 'undefined') return;

    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(function (btn) {
      if (btn.dataset && btn.dataset.actionBound === '1') return;
      if (btn.dataset) btn.dataset.actionBound = '1';

      domSafe.on(btn, 'click', function () {
        const action = btn.getAttribute('data-action');
        if (action === 'open-ranking') {
          const ranking = getSaudeModule('Ranking');
          if (ranking && typeof ranking.openModal === 'function') {
            ranking.openModal();
          }
        } else if (action === 'set-question-count') {
          setQuestionCount(Number(btn.getAttribute('data-count')));
        } else if (action === 'start-mode') {
          startGameMode(btn.getAttribute('data-mode'));
        } else if (action === 'go-home') {
          goHome();
        } else if (action === 'toggle-sound') {
          const audio = getSaudeModule('Audio');
          if (audio && typeof audio.toggle === 'function') {
            audio.toggle();
          }
        } else if (action === 'skip-next') {
          skipOrNextItem();
        } else if (action === 'save-ranking') {
          const ranking = getSaudeModule('Ranking');
          if (ranking && typeof ranking.saveStudent === 'function') {
            ranking.saveStudent();
          }
        } else if (action === 'modal-continue') {
          handleModalContinue();
        } else if (action === 'close-ranking') {
          const ranking = getSaudeModule('Ranking');
          if (ranking && typeof ranking.closeModal === 'function') {
            ranking.closeModal();
          }
        } else if (action === 'clear-ranking') {
          const ranking = getSaudeModule('Ranking');
          if (ranking && typeof ranking.clearData === 'function') {
            ranking.clearData();
          }
        }
      });
    });
  }

  /**
   * Trata atalhos de teclado fisico respeitando painel da professora, inputs, Ranking e Fase 3.
   */
  function handleGlobalKeydown(e) {
    const teacherPanel = getSaudeModule('TeacherPanel');
    if (teacherPanel && typeof teacherPanel.isOpen === 'function' && teacherPanel.isOpen()) {
      return;
    }

    const activeTag = document.activeElement && document.activeElement.tagName
      ? document.activeElement.tagName.toUpperCase()
      : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
      return;
    }

    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.handleKeydown === 'function' && ranking.handleKeydown(e)) {
      return;
    }

    if (gameState.currentPhase !== 3 || gameState.p3Lock) return;

    const celebModal = document.getElementById('celebrationModal');
    const celebModalActive = Boolean(celebModal && celebModal.classList.contains('active'));
    const rankingModal = document.getElementById('rankingModal');
    const rankingModalActive = Boolean(
      (ranking && typeof ranking.isModalActive === 'function' && ranking.isModalActive()) ||
      (rankingModal && rankingModal.classList.contains('active'))
    );
    if (celebModalActive || rankingModalActive) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      onPressBackspace();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onVerifyPhase3();
    } else if (/^[a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]$/.test(e.key)) {
      e.preventDefault();
      const normalized = normalizeChar(e.key);
      if (/^[A-Z]$/.test(normalized)) {
        onPressLetter(normalized);
      }
    }
  }

  /**
   * Inicializa configuracoes do Ranking, listeners globais, mascote e Painel da Professora.
   */
  function init() {
    if (initialized) return;
    initialized = true;

    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.configure === 'function') {
      ranking.configure({
        getStars: function () { return gameState.stars; },
        resetStars: resetStars,
        goHome: goHome
      });
    }

    // Suporte ao teclado fisico para o Registro do Ranking e a Fase 3
    global.addEventListener('keydown', handleGlobalKeydown);

    // Bloqueia menu de contexto (toque longo na lousa digital)
    global.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    bindUiActions();
    initUiIcons();

    const mascot = getSaudeModule('Mascot');
    if (mascot && typeof mascot.init === 'function') {
      mascot.init();
    } else {
      initMascotSvg();
    }
    updatePhaseWeeklyBadges();

    const headerLabel = document.getElementById('headerPhaseLabel');
    if (headerLabel) {
      headerLabel.classList.add('u-hidden');
    }
    const dockEl = document.querySelector('footer.bottom-dock');
    if (dockEl) {
      dockEl.classList.add('is-menu');
    }

    const teacherPanelInstance = getSaudeModule('TeacherPanel');
    if (teacherPanelInstance && typeof teacherPanelInstance.init === 'function') {
      teacherPanelInstance.init({
        onConfigChanged: function () {
          if (typeof teacherPanelInstance.atualizarIndicadoresMenu === 'function') {
            teacherPanelInstance.atualizarIndicadoresMenu();
          }
          updatePhaseWeeklyBadges();
        }
      });
    }
  }

  /**************************************************************
   * 8. PONTES GLOBAIS E EXPORTACAO DO MODULO
   **************************************************************/
  // Pontes globais minimas para os handlers onclick preservados no index.html
  global.setQuestionCount = setQuestionCount;
  global.startGameMode = startGameMode;
  global.goHome = goHome;
  global.toggleSound = function () {
    const audio = getSaudeModule('Audio');
    if (audio && typeof audio.toggle === 'function') {
      audio.toggle();
    }
  };
  global.skipOrNextItem = skipOrNextItem;
  global.handleModalContinue = handleModalContinue;
  global.openRankingModal = function () {
    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.openModal === 'function') {
      ranking.openModal();
    }
  };
  global.closeRankingModal = function () {
    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.closeModal === 'function') {
      ranking.closeModal();
    }
  };
  global.saveStudentToRanking = function () {
    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.saveStudent === 'function') {
      ranking.saveStudent();
    }
  };
  global.clearRankingData = function () {
    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.clearData === 'function') {
      ranking.clearData();
    }
  };

  /**
   * Contrato público de SaudeEscola.Game.
   *
   * init() liga os eventos principais e pode ser chamado automaticamente pelo
   * DOMContentLoaded. startGameMode(), startPhase1/2/3() iniciam fluxos a partir
   * dos bancos disponíveis. goHome(), skipOrNextItem() e handleModalContinue()
   * governam navegação e não exigem resposta direta do chamador.
   *
   * Se módulos auxiliares não estiverem carregados, o motor segue com fallbacks
   * seguros: som visualmente desativado, ranking preservado quando disponível e
   * banco nativo quando Palavras da Semana não puder ser consultado.
   */
  SaudeEscola.Game = {
    init: init,
    getState: function () { return gameState; },
    setQuestionCount: setQuestionCount,
    startGameMode: startGameMode,
    goHome: goHome,
    skipOrNextItem: skipOrNextItem,
    handleModalContinue: handleModalContinue,
    startPhase1: startPhase1,
    startPhase2: startPhase2,
    startPhase3: startPhase3,
    formatPhase3SentenceHtml: formatPhase3SentenceHtml
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
