/* ==========================================================================
   Motor Principal do Jogo (Fases 1, 2 e 3 + Navegacao + Teclado Fisico)
   Projeto: Saude na Escola: Saude Bucal
   Compativel 100% offline (file://) e GitHub Pages (sem ES Modules).
   ========================================================================== */
(function (global) {
  'use strict';

  const SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

  // Flag para garantir que listeners e componentes sejam inicializados uma unica vez
  let initialized = false;

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
   * Executa um efeito sonoro no modulo Audio sem quebrar caso ele ainda nao esteja carregado.
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
    const badgeIds = ['p1WeeklyBadge', 'p2WeeklyBadge', 'p3WeeklyBadge'];
    const staticBookSvg = (global.SaudeEscola && global.SaudeEscola.SVGs && global.SaudeEscola.SVGs.BOOK)
      ? global.SaudeEscola.SVGs.BOOK
      : WEEKLY_BADGE_BOOK_SVG;

    badgeIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;

      if (!info.isWeekly) {
        el.style.display = 'none';
        el.textContent = '';
        el.removeAttribute('title');
        return;
      }

      el.style.display = 'inline-flex';
      el.title = 'BANCO CUSTOMIZADO ATIVO: PALAVRAS DA SEMANA';
      el.innerHTML = '';

      const iconWrap = document.createElement('span');
      iconWrap.className = 'phase-weekly-badge-icon';
      iconWrap.innerHTML = staticBookSvg;

      const textWrap = document.createElement('span');
      textWrap.textContent = 'PALAVRAS DA SEMANA (' + info.count + ')';

      el.appendChild(iconWrap);
      el.appendChild(textWrap);
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
   * Atualiza o banner inferior de feedback pedagogico (sempre via textContent).
   */
  function setFeedback(text, styleType) {
    const banner = document.getElementById('feedbackBanner');
    if (!banner) return;
    banner.textContent = text;
    banner.className = 'feedback-banner';
    if (styleType === 'success') banner.classList.add('success');
    if (styleType === 'encourage') banner.classList.add('encourage');
  }

  /**
   * Alterna a tela visivel, o rotulo da barra superior e os botoes de navegacao do rodape.
   */
  function showScreen(screenId, phaseTitle, showNavButtons) {
    const showNav = showNavButtons !== false;
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
    }

    const btnBack = document.getElementById('btnBackMenu');
    if (btnBack) {
      btnBack.style.display = showNav ? 'inline-flex' : 'none';
    }

    const btnNext = document.getElementById('btnNextWord');
    if (btnNext) {
      btnNext.style.display = showNav ? 'inline-flex' : 'none';
    }
  }

  /**
   * Salva silenciosamente a sessao pendente no Analytics antes de trocar ou encerrar atividade.
   */
  function flushPendingAnalyticsIfNeeded() {
    const analytics = getSaudeModule('Analytics');
    if (analytics && typeof analytics.temSessaoPendente === 'function' && analytics.temSessaoPendente()) {
      analytics.finalizarESalvarSessao();
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
   * Retorna para o Menu Inicial encerrando sessao pendente e limpando rascunho do Ranking.
   */
  function goHome() {
    playAudio('playClick');
    flushPendingAnalyticsIfNeeded();

    const celebModal = document.getElementById('celebrationModal');
    if (celebModal) celebModal.classList.remove('active');

    const rankingModal = document.getElementById('rankingModal');
    if (rankingModal) rankingModal.classList.remove('active');

    const ranking = getSaudeModule('Ranking');
    if (ranking && typeof ranking.resetDraft === 'function') {
      ranking.resetDraft();
    }

    gameState.mode = 'MENU';
    gameState.currentPhase = 0;
    showScreen('screenMenu', 'MENU INICIAL', false);
    setFeedback('ESCOLHA UMA ATIVIDADE PARA COMEÇAR!');

    const teacherPanel = getSaudeModule('TeacherPanel');
    if (teacherPanel && typeof teacherPanel.atualizarIndicadoresMenu === 'function') {
      teacherPanel.atualizarIndicadoresMenu();
    }
    updatePhaseWeeklyBadges();
  }

  /**
   * Inicia a Jornada Completa ou uma fase isolada zerando estrelas e rascunho do Ranking.
   */
  function startGameMode(mode) {
    playAudio('playPop');
    flushPendingAnalyticsIfNeeded();

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
      if (instrEl) {
        instrEl.textContent = fase1Modo === 'silaba'
          ? 'ENCONTRE OS PARES DA SEMANA: PALAVRA + SÍLABA INICIAL!'
          : 'ENCONTRE OS PARES DA SEMANA: PALAVRA + DICA OU SÍLABA!';
      }
    } else if (instrEl) {
      instrEl.textContent = 'ENCONTRE OS PARES: 1 FIGURA + 1 PALAVRA ESCRITA!';
    }

    const shuffledBank = shuffleArray(bank);
    let selectedWords = [];
    if (weeklyActive) {
      // Prioriza 4 palavras com dicas/silabas iniciais distintas na mesma rodada
      const usedClueKeys = {};
      const pickedIndices = {};
      for (let i = 0; i < shuffledBank.length && selectedWords.length < 4; i++) {
        const cand = shuffledBank[i];
        const candUsaDica = fase1Modo === 'dica' && Boolean(cand.dicaOriginal && cand.dicaOriginal.trim());
        const candKey = candUsaDica
          ? ('D:' + cand.dicaOriginal.trim().toUpperCase())
          : ('S:' + String(cand.silabaInicial || (cand.syllables && cand.syllables[0]) || '').trim().toUpperCase());
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

    selectedWords.forEach(function (item) {
      if (weeklyActive) {
        const usaDica = fase1Modo === 'dica' && Boolean(item.dicaOriginal && item.dicaOriginal.trim());
        const silabaIni = String(item.silabaInicial || (item.syllables && item.syllables[0]) || '').trim().toUpperCase();
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

    gameState.p1Cards = shuffleArray(deck);
    gameState.p1Flipped = [];
    gameState.p1MatchedCount = 0;
    gameState.p1Mistakes = 0;
    gameState.p1PairMistakes = {};
    gameState.p1Lock = false;

    updateP1Counter();
    setFeedback(
      weeklyActive
        ? 'VIRE DUAS CARTAS PARA ACHAR A PALAVRA E SUA DICA OU SÍLABA!'
        : 'VIRE DUAS CARTAS PARA ACHAR A FIGURA E SUA PALAVRA!'
    );
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
    if (!grid) return;

    const storage = getSaudeModule('Storage');
    const cardToothSvg = getWordBankSvg('CARD_TOOTH');
    const svgWeeklyBack = (storage && storage.SVGs && storage.SVGs.CARD_BACK_SEMANA)
      ? storage.SVGs.CARD_BACK_SEMANA
      : cardToothSvg;
    const svgMiniDica = (storage && storage.SVGs && storage.SVGs.MINI_ESTRELA_DICA)
      ? storage.SVGs.MINI_ESTRELA_DICA
      : '';

    grid.innerHTML = '';

    gameState.p1Cards.forEach(function (card, index) {
      const btn = document.createElement('button');
      btn.className = 'mem-card';
      btn.id = 'memCard_' + index;
      btn.onclick = function () { onMemoryCardTap(index); };

      const frontSvg = card.isWeeklyWord ? svgWeeklyBack : cardToothSvg;
      let backContent = '';

      if (card.type === 'FIGURE') {
        backContent = '<div class="mem-illustration">' + (card.svg || '') + '</div>';
      } else if (card.type === 'CLUE_OR_SYL') {
        const isDica = card.clueKind === 'DICA';
        const tagLabel = isDica ? 'DICA CURTA' : 'SÍLABA INICIAL';
        const valueHtml = isDica
          ? '<div class="mem-clue-text">' + escapeHtmlSafe(card.clueValue) + '</div>'
          : '<div class="mem-clue-syllable">' + escapeHtmlSafe(card.clueValue) + '</div>';
        backContent = [
          '<div class="mem-clue-card">',
          '  <span class="mem-clue-tag">' + tagLabel + '</span>',
          svgMiniDica ? '  <span class="mem-clue-icon">' + svgMiniDica + '</span>' : '',
          '  ' + valueHtml,
          '</div>'
        ].join('');
      } else {
        const longClass = card.word && card.word.length >= 8 ? ' is-long' : '';
        backContent = '<div class="mem-word-text' + longClass + '">' + escapeHtmlSafe(card.word) + '</div>';
      }

      btn.innerHTML = [
        '<div class="mem-card-inner">',
        '  <div class="mem-face mem-front">',
        '    <div class="mem-front-icon">' + frontSvg + '</div>',
        '    <div class="mem-front-label">TOQUE AQUI</div>',
        '  </div>',
        '  <div class="mem-face mem-back">',
        '    ' + backContent,
        '  </div>',
        '</div>'
      ].join('');

      grid.appendChild(btn);
    });
  }

  function onMemoryCardTap(index) {
    if (gameState.p1Lock) return;
    const card = gameState.p1Cards[index];
    if (!card || card.matched) return;
    if (gameState.p1Flipped.indexOf(index) !== -1) return;

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
        const firstTryForPair = !gameState.p1PairMistakes[card1.pairId];
        const analytics = getSaudeModule('Analytics');
        if (analytics && typeof analytics.registrarTentativaFase1 === 'function') {
          analytics.registrarTentativaFase1({
            palavra: matchedWord,
            acertou: true,
            primeiraTentativa: firstTryForPair
          });
        }
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
          setFeedback('MUITO BEM! VOCÊ ENCONTROU O PAR DE "' + matchedWord + '"!', 'success');
          gameState.p1Lock = false;

          if (gameState.p1MatchedCount === 4) {
            if (gameState.p1Mistakes <= 2) {
              addStars(1);
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

        const analytics = getSaudeModule('Analytics');
        if (analytics && typeof analytics.registrarTentativaFase1 === 'function') {
          analytics.registrarTentativaFase1({
            palavra: card1.word || card2.word,
            palavraComparada: card2.word || '',
            acertou: false,
            primeiraTentativa: false
          });
        }
        global.setTimeout(function () {
          if (gameState.currentPhase !== 1 || gameState.p1Cards !== roundCards) return;
          playAudio('playEncourage');
          setFeedback('QUASE LÁ! OBSERVE BEM E TENTE NOVAMENTE!', 'encourage');
        }, 350);

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
    const modal = document.getElementById('celebrationModal');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    const btn = document.getElementById('modalPrimaryBtn');

    if (gameState.mode === 'JOURNEY') {
      if (title) title.textContent = 'FASE 1 CONCLUÍDA!';
      if (msg) msg.textContent = 'PARABÉNS! AGORA VAMOS PARA A FASE 2: CONSTRUTOR DE SÍLABAS!';
      if (btn) btn.innerHTML = getWordBankSvg('PLAY_ICON') + '<span>IR PARA A FASE 2</span>';
      toggleRankingRegisterBox(false);
    } else {
      if (title) title.textContent = 'MEMÓRIA DE CAMPEÃO!';
      if (msg) {
        msg.textContent = isWeeklyWordsActive()
          ? 'VOCÊ FEZ ' + gameState.stars + ' ESTRELAS NAS PALAVRAS DA SEMANA!'
          : 'VOCÊ FEZ ' + gameState.stars + ' ESTRELAS NA SAÚDE BUCAL!';
      }
      if (btn) btn.innerHTML = getWordBankSvg('REPLAY_ICON') + '<span>JOGAR OUTRA RODADA</span>';
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
    if (svgEl) svgEl.innerHTML = item.svg || '';

    const emojiEl = document.getElementById('p2EmojiCorner');
    if (emojiEl) emojiEl.textContent = item.emoji || '';

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
    if (!slotsRow || !poolRow) return;

    const manySyls = Boolean(
      gameState.p2CurrentWord &&
      Array.isArray(gameState.p2CurrentWord.syllables) &&
      gameState.p2CurrentWord.syllables.length >= 4
    );
    slotsRow.classList.toggle('many-syls', manySyls);
    poolRow.classList.toggle('many-syls', manySyls);
    slotsRow.innerHTML = '';
    poolRow.innerHTML = '';

    // Renderiza espacos das silabas
    gameState.p2Slots.forEach(function (slotItem, slotIdx) {
      const slotBtn = document.createElement('button');
      slotBtn.className = 'syl-slot' + (slotItem ? ' filled' : '');
      slotBtn.id = 'p2Slot_' + slotIdx;
      slotBtn.textContent = slotItem ? slotItem.text : '';
      slotBtn.onclick = function () { onTapFilledSlot(slotIdx); };
      slotsRow.appendChild(slotBtn);
    });

    // Renderiza botoes do banco de silabas na parte inferior
    gameState.p2Pool.forEach(function (poolItem, poolIdx) {
      const btn = document.createElement('button');
      btn.className = 'syl-btn' + (poolItem.used ? ' used' : '');
      btn.textContent = poolItem.text;
      btn.onclick = function () { onTapPoolSyllable(poolIdx); };
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
      setFeedback('PARABÉNS! VOCÊ FORMOU A PALAVRA "' + currentItem.word + '"!', 'success');

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
      setFeedback('QUASE! TOQUE EM UMA SÍLABA PARA TROCAR OU TENTE DE NOVO!', 'encourage');

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
    const modal = document.getElementById('celebrationModal');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    const btn = document.getElementById('modalPrimaryBtn');

    if (gameState.mode === 'JOURNEY') {
      if (title) title.textContent = 'FASE 2 CONCLUÍDA!';
      if (msg) msg.textContent = 'VOCÊ É DEMAIS NAS SÍLABAS! VAMOS PARA A FASE 3: ESCRITA ESPONTÂNEA!';
      if (btn) btn.innerHTML = getWordBankSvg('PLAY_ICON') + '<span>IR PARA A FASE 3</span>';
      toggleRankingRegisterBox(false);
    } else {
      if (title) title.textContent = 'MESTRE DAS SÍLABAS!';
      if (msg) msg.textContent = 'VOCÊ CONQUISTOU ' + gameState.stars + ' ESTRELAS NAS SÍLABAS!';
      if (btn) btn.innerHTML = getWordBankSvg('REPLAY_ICON') + '<span>JOGAR NOVAMENTE</span>';
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
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    btn.textContent = letter;
    btn.onclick = function () { onPressLetter(letter); };
    return btn;
  }

  function buildVirtualKeyboard() {
    const kb = document.getElementById('virtualKeyboard');
    if (!kb) return;
    kb.innerHTML = '';

    const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

    // Linha 1
    const r1El = document.createElement('div');
    r1El.className = 'kb-row';
    row1.forEach(function (letter) {
      r1El.appendChild(createKeyButton(letter));
    });
    kb.appendChild(r1El);

    // Linha 2
    const r2El = document.createElement('div');
    r2El.className = 'kb-row';
    row2.forEach(function (letter) {
      r2El.appendChild(createKeyButton(letter));
    });
    kb.appendChild(r2El);

    // Linha 3 + APAGAR + VERIFICAR
    const r3El = document.createElement('div');
    r3El.className = 'kb-row';

    const keyBackHtml = getWordBankSvg('KEY_BACKSPACE');
    const backBtn = document.createElement('button');
    backBtn.className = 'key-btn key-action key-backspace';
    backBtn.innerHTML = keyBackHtml
      ? (keyBackHtml.indexOf('APAGAR') !== -1 ? keyBackHtml : keyBackHtml + '<span>APAGAR</span>')
      : '<span>APAGAR</span>';
    backBtn.onclick = function () { onPressBackspace(); };
    r3El.appendChild(backBtn);

    row3.forEach(function (letter) {
      r3El.appendChild(createKeyButton(letter));
    });

    const keyVerifyHtml = getWordBankSvg('KEY_VERIFY');
    const verifyBtn = document.createElement('button');
    verifyBtn.className = 'key-btn key-action key-verify';
    verifyBtn.innerHTML = keyVerifyHtml
      ? (keyVerifyHtml.indexOf('VERIFICAR') !== -1 ? keyVerifyHtml : keyVerifyHtml + '<span>VERIFICAR</span>')
      : '<span>VERIFICAR</span>';
    verifyBtn.onclick = function () { onVerifyPhase3(); };
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
    if (svgEl) svgEl.innerHTML = item.svg || '';

    const emojiEl = document.getElementById('p3EmojiCorner');
    if (emojiEl) emojiEl.textContent = item.emoji || '';

    const wordBank = getSaudeModule('WordBank');
    gameState.currentP3Sentence = (wordBank && typeof wordBank.getNextSentenceForWord === 'function')
      ? wordBank.getNextSentenceForWord(item)
      : (item.sentence || '');

    const blanks = '_'.repeat(item.word.length);
    const blankSpan = '<span class="p3-blank-highlight">' + blanks + '</span>';
    const sentenceEl = document.getElementById('p3SentenceText');
    if (sentenceEl) {
      sentenceEl.innerHTML = formatPhase3SentenceHtml(gameState.currentP3Sentence || item.sentence, blankSpan);
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
    if (!row) return;

    row.classList.toggle('many-letters', gameState.p3Typed.length >= 8);
    row.innerHTML = '';
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

      const filledSpan = '<span class="p3-blank-highlight" style="background:#C8E6C9; border-color:#2E7D32; color:#1B5E20;">' + escapeHtmlSafe(item.word) + '</span>';
      const sentenceEl = document.getElementById('p3SentenceText');
      if (sentenceEl) {
        sentenceEl.innerHTML = formatPhase3SentenceHtml(gameState.currentP3Sentence || item.sentence, filledSpan);
      }
      setFeedback('EXCELENTE! VOCÊ ESCREVEU "' + item.word + '" DIREITINHO!', 'success');

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
        setFeedback('MUITO BEM! VOCÊ JÁ ACERTOU ALGUMAS LETRAS, TENTE DESCOBRIR AS QUE FALTAM!', 'encourage');
      } else if (!anyTyped) {
        setFeedback('DIGITE AS LETRAS DA PALAVRA NO TECLADO E DEPOIS TOQUE EM VERIFICAR!', 'encourage');
      } else {
        setFeedback('BOA TENTATIVA! OBSERVE A FIGURA E TENTE DESCOBRIR AS LETRAS DA PALAVRA!', 'encourage');
      }
    }
  }

  function onPhase3Complete() {
    playAudio('playFanfare');
    const modal = document.getElementById('celebrationModal');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    const btn = document.getElementById('modalPrimaryBtn');

    if (gameState.mode === 'JOURNEY') {
      if (title) title.textContent = 'JORNADA COMPLETA!';
      if (msg) msg.textContent = 'PARABÉNS! VOCÊ COMPLETOU AS 3 FASES E CONQUISTOU ' + gameState.stars + ' ESTRELAS!';
      if (btn) btn.innerHTML = getWordBankSvg('REPLAY_ICON') + '<span>JOGAR NOVA JORNADA</span>';
    } else {
      if (title) title.textContent = 'CAMPEÃO DA ESCRITA!';
      if (msg) msg.textContent = 'VOCÊ CONQUISTOU ' + gameState.stars + ' ESTRELAS NA ESCRITA!';
      if (btn) btn.innerHTML = getWordBankSvg('REPLAY_ICON') + '<span>JOGAR NOVAMENTE</span>';
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
      flushPendingAnalyticsIfNeeded();
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
   * Preenche o mascote SVG da tela inicial usando o modulo WordBank.
   */
  function initMascotSvg() {
    const mascotEl = document.getElementById('mascotHeroSvg');
    const mascotSvg = getWordBankSvg('MASCOT_HERO');
    if (mascotEl && mascotSvg) {
      mascotEl.innerHTML = mascotSvg;
    }
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

    initMascotSvg();
    updatePhaseWeeklyBadges();

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
