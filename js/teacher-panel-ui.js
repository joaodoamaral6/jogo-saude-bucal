/* ==========================================================================
   Painel da Professora (UI) + Icones SVG Infantis + Sugestoes no Ranking
   Compativel 100% offline (file:// e GitHub Pages) sem ES Modules.
   ========================================================================== */

(function (global) {
    'use strict';

    var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

    /* ----------------------------------------------------------------------
       1. Icones SVG vetoriais infantis (zero emojis nativos de sistema)
       ---------------------------------------------------------------------- */
    var SVGs = {
        GEAR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3.2"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        USERS: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        BOOK: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11a2 2 0 0 1 2 2v16.5a1.5 1.5 0 0 0-1.5-1.5H4.5A2.5 2.5 0 0 1 2 16.5V4.5z"></path><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13a2 2 0 0 0-2 2v16.5a1.5 1.5 0 0 1 1.5-1.5h7A2.5 2.5 0 0 0 22 16.5V4.5z"></path></svg>',
        CHART: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3v18h18"></path><rect x="7" y="12" width="3" height="5" rx="1"></rect><rect x="12.5" y="8" width="3" height="9" rx="1"></rect><rect x="18" y="5" width="3" height="12" rx="1"></rect></svg>',
        TREND_UP: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>',
        TREND_DOWN: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>',
        TREND_FLAT: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="4" y1="12" x2="20" y2="12"></line><polyline points="15 7 20 12 15 17"></polyline></svg>',
        TRASH: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>',
        EDIT: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>',
        CHECK: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        CLOSE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        ALERT: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><circle cx="12" cy="17" r="0.8" fill="currentColor"></circle></svg>',
        SPARKLE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l1.9 4.7L18.6 9.6l-4.7 1.9L12 16.2l-1.9-4.7-4.7-1.9 4.7-1.9L12 3z"></path><path d="M5 18l.8 1.7L7.5 20.5l-1.7.8L5 23l-.8-1.7-1.7-.8 1.7-.8L5 18z"></path><path d="M19 15l.7 1.3 1.3.7-1.3.7-.7 1.3-.7-1.3-1.3-.7 1.3-.7.7-1.3z"></path></svg>'
    };

    SaudeEscola.SVGs = SVGs;

    /* ----------------------------------------------------------------------
       2. Helpers internos de seguranca, dados e feedback
       ---------------------------------------------------------------------- */
    var HOLD_DURATION_MS = 3000;

    var state = {
        initialized: false,
        onConfigChanged: null,
        activeTab: 'turma',
        hasConfigChanges: false,
        batchBoxOpen: false,
        editingWordId: null,
        draftSilabasRaw: '',
        draftDica: '',
        draftFrase: '',
        holdTimer: null,
        activePointerId: null,
        toastTimer: null,
        clearWordsTimer: null,
        clearWordsConfirming: false,
        backdropPressStarted: false,
        lastFocusedEl: null
    };

    function getStorage() {
        return SaudeEscola.Storage || null;
    }

    /**
     * Escapa caracteres especiais para prevenir XSS em qualquer HTML dinamico.
     */
    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Divide string com hifens em blocos de silabas nao vazios.
     */
    function parseSilabas(raw) {
        return String(raw || '')
            .split('-')
            .map(function (part) { return part.trim(); })
            .filter(function (part) { return part.length > 0; });
    }

    /**
     * Extrai array de silabas de um objeto palavra salvo no Storage.
     */
    function getPalavraSilabas(item) {
        if (item && Array.isArray(item.silabas) && item.silabas.length > 0) {
            return item.silabas;
        }
        return parseSilabas(item ? (item.silabasRaw || item.palavra || '') : '');
    }

    /**
     * Interpreta retorno de metodos do Storage de forma defensiva.
     */
    function extrairResultado(res) {
        if (res === false) {
            return { ok: false, erro: 'Não foi possível concluir a operação.' };
        }
        if (res && typeof res === 'object') {
            if (res.ok === false) {
                return { ok: false, erro: res.erro || res.mensagem || res.message || 'Não foi possível concluir a operação.' };
            }
            if (res.erro) {
                return { ok: false, erro: String(res.erro) };
            }
        }
        return { ok: true, data: res };
    }

    function showToast(msg, tipo) {
        var toastEl = document.getElementById('tpToast');
        if (!toastEl) return;

        if (state.toastTimer) {
            global.clearTimeout(state.toastTimer);
            state.toastTimer = null;
        }

        toastEl.textContent = String(msg || '');
        toastEl.className = 'tp-toast is-visible';
        if (tipo === 'error') {
            toastEl.classList.add('is-error');
        } else if (tipo === 'success') {
            toastEl.classList.add('is-success');
        }

        state.toastTimer = global.setTimeout(function () {
            toastEl.classList.remove('is-visible');
            state.toastTimer = null;
        }, 3200);
    }

    function resetClearWordsConfirmation() {
        if (state.clearWordsTimer) {
            global.clearTimeout(state.clearWordsTimer);
            state.clearWordsTimer = null;
        }
        state.clearWordsConfirming = false;
        var clearBtn = document.getElementById('tpClearWordsBtn');
        if (clearBtn) {
            clearBtn.classList.remove('confirming');
            clearBtn.innerHTML = SVGs.TRASH + '<span>Limpar todas as palavras</span>';
        }
    }

    /* ----------------------------------------------------------------------
       3. Construcao do modal e controle do botao de engrenagem (segurar 3s)
       ---------------------------------------------------------------------- */
    function ensureModalStructure() {
        var overlay = document.getElementById('teacherPanelOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'teacherPanelOverlay';
        overlay.className = 'tp-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'tpHeaderMain');

        overlay.innerHTML = [
            '<div class="tp-modal">',
            '  <header class="tp-header">',
            '    <div class="tp-header-title">',
            '      <span class="tp-header-icon">' + SVGs.GEAR + '</span>',
            '      <div class="tp-header-text">',
            '        <span id="tpHeaderMain" class="tp-header-main">Painel da Professora</span>',
            '        <span class="tp-header-sub">Configurações da turma, palavras da semana e evolução</span>',
            '      </div>',
            '    </div>',
            '    <button type="button" id="tpCloseBtn" class="tp-close-btn" aria-label="Fechar painel da professora">' + SVGs.CLOSE + '</button>',
            '  </header>',
            '  <nav class="tp-tabs" role="tablist" aria-label="Abas do Painel da Professora">',
            '    <button type="button" class="tp-tab" role="tab" data-tab="turma" aria-selected="true">' + SVGs.USERS + '<span>Turma e Modo</span></button>',
            '    <button type="button" class="tp-tab" role="tab" data-tab="palavras" aria-selected="false">' + SVGs.BOOK + '<span>Palavras da Semana</span></button>',
            '    <button type="button" class="tp-tab" role="tab" data-tab="evolucao" aria-selected="false">' + SVGs.CHART + '<span>Evolução e Dificuldades</span></button>',
            '  </nav>',
            '  <div id="tpBody" class="tp-body"></div>',
            '  <div id="tpToast" class="tp-toast" role="status" aria-live="polite"></div>',
            '</div>'
        ].join('');

        document.body.appendChild(overlay);

        var closeBtn = overlay.querySelector('#tpCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                TeacherPanel.close();
            });
        }

        var tabButtons = overlay.querySelectorAll('.tp-tab[data-tab]');
        for (var i = 0; i < tabButtons.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var targetTab = btn.getAttribute('data-tab');
                    selecionarAba(targetTab);
                });
            })(tabButtons[i]);
        }

        overlay.addEventListener('pointerdown', function (e) {
            state.backdropPressStarted = (e.target === overlay);
        });

        overlay.addEventListener('click', function (e) {
            if (state.backdropPressStarted && e.target === overlay) {
                TeacherPanel.close();
            }
            state.backdropPressStarted = false;
        });

        return overlay;
    }

    function cancelGearHold(btn) {
        if (state.holdTimer) {
            global.clearTimeout(state.holdTimer);
            state.holdTimer = null;
        }
        state.activePointerId = null;
        if (btn) {
            btn.classList.remove('tp-holding');
        }
    }

    function setupGearButton() {
        var btn = document.getElementById('btnTeacherPanel');

        /* Fallback caso o botao ainda nao esteja no DOM */
        if (!btn) {
            var hero = document.querySelector('.menu-hero');
            if (!hero) return;
            btn = document.createElement('button');
            btn.id = 'btnTeacherPanel';
            btn.type = 'button';
            btn.className = 'tp-gear-btn';
            hero.appendChild(btn);
        } else {
            btn.classList.add('tp-gear-btn');
        }

        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Painel da Professora - Segure por 3 segundos para abrir');
        }

        if (!btn.querySelector('.tp-gear-ring-progress')) {
            btn.innerHTML = [
                '<svg class="tp-gear-ring" viewBox="0 0 52 52" aria-hidden="true" focusable="false">',
                '  <circle class="tp-gear-ring-track" cx="26" cy="26" r="22"></circle>',
                '  <circle class="tp-gear-ring-progress" cx="26" cy="26" r="22"></circle>',
                '</svg>',
                '<span class="tp-gear-icon">' + SVGs.GEAR + '</span>',
                '<span class="tp-gear-hint">Segure 3s</span>'
            ].join('');
        }

        if (btn.dataset.tpBound === '1') return;
        btn.dataset.tpBound = '1';

        btn.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (TeacherPanel.isOpen()) return;

            e.preventDefault();
            cancelGearHold(btn);
            state.activePointerId = e.pointerId;

            /* Reflow garante que o anel sempre comece cheio do inicio */
            void btn.offsetWidth;
            btn.classList.add('tp-holding');

            state.holdTimer = global.setTimeout(function () {
                cancelGearHold(btn);
                TeacherPanel.open('turma');
            }, HOLD_DURATION_MS);
        });

        function handleRelease(e) {
            if (state.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== state.activePointerId) {
                return;
            }
            cancelGearHold(btn);
        }

        btn.addEventListener('pointerup', handleRelease);
        btn.addEventListener('pointerleave', handleRelease);
        btn.addEventListener('pointercancel', handleRelease);

        /* Previne abertura acidental por clique curto ou toque rapido */
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        btn.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
    }

    /* ----------------------------------------------------------------------
       4. Renderizacao das 3 abas do Painel
       ---------------------------------------------------------------------- */
    function selecionarAba(aba) {
        if (aba !== 'turma' && aba !== 'palavras' && aba !== 'evolucao') {
            aba = 'turma';
        }
        state.activeTab = aba;
        resetClearWordsConfirmation();

        var overlay = document.getElementById('teacherPanelOverlay');
        if (!overlay) return;

        var tabButtons = overlay.querySelectorAll('.tp-tab[data-tab]');
        for (var i = 0; i < tabButtons.length; i++) {
            var btn = tabButtons[i];
            var isTarget = btn.getAttribute('data-tab') === aba;
            btn.classList.toggle('active', isTarget);
            btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        }

        var bodyEl = overlay.querySelector('#tpBody');
        if (!bodyEl) return;

        if (aba === 'turma') {
            renderAbaTurma(bodyEl);
        } else if (aba === 'palavras') {
            renderAbaPalavras(bodyEl);
        } else {
            renderAbaEvolucao(bodyEl);
        }

        bodyEl.scrollTop = 0;
    }

    /* --- Aba 1: Turma e Modo --- */
    function renderAbaTurma(containerEl) {
        var Storage = getStorage();
        if (!Storage) {
            containerEl.innerHTML = '<div class="tp-alert">' + SVGs.ALERT + '<span>Módulo de armazenamento não encontrado.</span></div>';
            return;
        }

        var isAula = !!Storage.isModoAula();
        var alunos = Storage.listarAlunos() || [];

        var alunosHtml = '';
        if (alunos.length === 0) {
            alunosHtml = '<div class="tp-alert tp-alert-info">' + SVGs.ALERT + '<span>Nenhum aluno cadastrado ainda. Adicione os nomes abaixo para exibir sugestões clicáveis no Ranking durante o Modo Aula.</span></div>';
        } else {
            alunosHtml = '<div class="tp-pill-list">' + alunos.map(function (aluno) {
                var id = escapeHtml(aluno && aluno.id !== undefined ? aluno.id : '');
                var nome = escapeHtml(aluno && aluno.nome !== undefined ? aluno.nome : String(aluno || ''));
                return '<span class="tp-student-pill"><span>' + nome + '</span><button type="button" class="tp-pill-remove" data-remove-student="' + id + '" aria-label="Remover ' + nome + '">' + SVGs.CLOSE + '</button></span>';
            }).join('') + '</div>';
        }

        var batchHtml = state.batchBoxOpen ? [
            '<div class="tp-batch-box">',
            '  <label class="tp-label" for="tpBatchStudentsInput">Adicionar vários alunos de uma vez (separe por vírgula ou uma linha por aluno):</label>',
            '  <textarea id="tpBatchStudentsInput" class="tp-textarea" rows="4" placeholder="Ana Júlia&#10;João Pedro&#10;Maria Clara, Lucas"></textarea>',
            '  <div class="tp-inline-actions">',
            '    <button type="button" id="tpSaveBatchBtn" class="tp-btn tp-btn-secondary">' + SVGs.CHECK + '<span>Importar lista</span></button>',
            '    <button type="button" id="tpCancelBatchBtn" class="tp-btn tp-btn-outline tp-btn-sm">Recolher</button>',
            '  </div>',
            '</div>'
        ].join('') : '';

        containerEl.innerHTML = [
            '<div class="tp-section">',
            '  <div class="tp-card">',
            '    <h3 class="tp-card-title">' + SVGs.SPARKLE + '<span>Modo de Uso do Jogo</span></h3>',
            '    <div class="tp-mode-grid">',
            '      <button type="button" class="tp-mode-option' + (isAula ? ' active' : '') + '" data-set-modo="aula">',
            '        <div class="tp-mode-option-head"><span>Modo Aula</span><span class="tp-mode-check">' + (isAula ? SVGs.CHECK : '') + '</span></div>',
            '        <span class="tp-mode-option-desc">Exibe sugestões da turma no Ranking e grava o desempenho nos gráficos de evolução.</span>',
            '      </button>',
            '      <button type="button" class="tp-mode-option' + (!isAula ? ' active' : '') + '" data-set-modo="livre">',
            '        <div class="tp-mode-option-head"><span>Modo Livre</span><span class="tp-mode-check">' + (!isAula ? SVGs.CHECK : '') + '</span></div>',
            '        <span class="tp-mode-option-desc">Permite digitação livre de nomes no Ranking, sem gravar nos gráficos da turma.</span>',
            '      </button>',
            '    </div>',
            '  </div>',
            '  <div class="tp-card">',
            '    <div class="tp-card-header-row">',
            '      <h3 class="tp-card-title">' + SVGs.USERS + '<span>Alunos da Turma</span></h3>',
            '      <span class="tp-count-badge">' + alunos.length + ' ' + (alunos.length === 1 ? 'aluno' : 'alunos') + '</span>',
            '    </div>',
            '    <div class="tp-field">',
            '      <label class="tp-label" for="tpStudentNameInput">Cadastro rápido de aluno</label>',
            '      <div class="tp-input-row">',
            '        <input id="tpStudentNameInput" class="tp-input" type="text" placeholder="Ex.: Ana Júlia" maxlength="60" autocomplete="off">',
            '        <button type="button" id="tpAddStudentBtn" class="tp-btn tp-btn-primary">' + SVGs.CHECK + '<span>Adicionar aluno</span></button>',
            '      </div>',
            '    </div>',
            '    <div class="tp-inline-actions">',
            '      <button type="button" id="tpToggleBatchBtn" class="tp-btn tp-btn-outline tp-btn-sm">' + (state.batchBoxOpen ? 'Ocultar importação em lote' : 'Adicionar vários alunos de uma vez') + '</button>',
            '    </div>',
            batchHtml,
            alunosHtml,
            '  </div>',
            '</div>'
        ].join('');

        /* Eventos de troca de modo */
        var modeBtns = containerEl.querySelectorAll('.tp-mode-option[data-set-modo]');
        for (var i = 0; i < modeBtns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var modo = btn.getAttribute('data-set-modo');
                    Storage.setModo(modo);
                    state.hasConfigChanges = true;
                    TeacherPanel.atualizarIndicadoresMenu();
                    showToast(modo === 'aula' ? 'Modo Aula ativado!' : 'Modo Livre ativado!', 'success');
                    renderAbaTurma(containerEl);
                });
            })(modeBtns[i]);
        }

        /* Cadastro individual */
        var studentInput = containerEl.querySelector('#tpStudentNameInput');
        var addStudentBtn = containerEl.querySelector('#tpAddStudentBtn');

        function handleAddStudent() {
            if (!studentInput) return;
            var nome = studentInput.value.trim();
            if (!nome) {
                showToast('Digite o nome do aluno antes de adicionar.', 'error');
                studentInput.focus();
                return;
            }

            var res = extrairResultado(Storage.adicionarAluno(nome));
            if (!res.ok) {
                showToast(res.erro, 'error');
                studentInput.focus();
                return;
            }

            state.hasConfigChanges = true;
            TeacherPanel.atualizarIndicadoresMenu();
            showToast('Aluno adicionado à turma!', 'success');
            renderAbaTurma(containerEl);

            var newInput = containerEl.querySelector('#tpStudentNameInput');
            if (newInput) newInput.focus();
        }

        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', handleAddStudent);
        }
        if (studentInput) {
            studentInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStudent();
                }
            });
        }

        /* Importacao em lote */
        var toggleBatchBtn = containerEl.querySelector('#tpToggleBatchBtn');
        if (toggleBatchBtn) {
            toggleBatchBtn.addEventListener('click', function () {
                state.batchBoxOpen = !state.batchBoxOpen;
                renderAbaTurma(containerEl);
                if (state.batchBoxOpen) {
                    var batchArea = containerEl.querySelector('#tpBatchStudentsInput');
                    if (batchArea) batchArea.focus();
                }
            });
        }

        var cancelBatchBtn = containerEl.querySelector('#tpCancelBatchBtn');
        if (cancelBatchBtn) {
            cancelBatchBtn.addEventListener('click', function () {
                state.batchBoxOpen = false;
                renderAbaTurma(containerEl);
            });
        }

        var saveBatchBtn = containerEl.querySelector('#tpSaveBatchBtn');
        if (saveBatchBtn) {
            saveBatchBtn.addEventListener('click', function () {
                var batchArea = containerEl.querySelector('#tpBatchStudentsInput');
                var texto = batchArea ? batchArea.value.trim() : '';
                if (!texto) {
                    showToast('Digite ou cole pelo menos um nome para importar.', 'error');
                    if (batchArea) batchArea.focus();
                    return;
                }

                var rawRes = Storage.adicionarAlunosEmLote(texto);
                var parsed = extrairResultado(rawRes);
                if (!parsed.ok) {
                    showToast(parsed.erro, 'error');
                    return;
                }

                var qtd = 0;
                if (typeof rawRes === 'number') {
                    qtd = rawRes;
                } else if (rawRes && typeof rawRes === 'object') {
                    if (typeof rawRes.adicionados === 'number') qtd = rawRes.adicionados;
                    else if (typeof rawRes.added === 'number') qtd = rawRes.added;
                    else if (typeof rawRes.inseridos === 'number') qtd = rawRes.inseridos;
                    else if (typeof rawRes.total === 'number') qtd = rawRes.total;
                    else if (Array.isArray(rawRes.adicionados)) qtd = rawRes.adicionados.length;
                    else qtd = 1;
                }

                if (qtd <= 0) {
                    showToast('Nenhum aluno novo foi adicionado (verifique nomes duplicados).', 'error');
                    return;
                }

                state.hasConfigChanges = true;
                state.batchBoxOpen = false;
                TeacherPanel.atualizarIndicadoresMenu();
                showToast(qtd + (qtd === 1 ? ' aluno importado com sucesso!' : ' alunos importados com sucesso!'), 'success');
                renderAbaTurma(containerEl);
            });
        }

        /* Remocao de alunos */
        var removeBtns = containerEl.querySelectorAll('.tp-pill-remove[data-remove-student]');
        for (var j = 0; j < removeBtns.length; j++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var id = btn.getAttribute('data-remove-student');
                    Storage.removerAluno(id);
                    state.hasConfigChanges = true;
                    TeacherPanel.atualizarIndicadoresMenu();
                    showToast('Aluno removido da turma.');
                    renderAbaTurma(containerEl);
                });
            })(removeBtns[j]);
        }
    }

    /* --- Aba 2: Palavras da Semana --- */
    function renderPreviewSilabas(previewEl, rawText) {
        if (!previewEl) return;
        var silabas = parseSilabas(rawText);
        if (silabas.length === 0) {
            previewEl.innerHTML = '<span class="tp-preview-placeholder">Digite separando com hífens (ex.: CA-VA-LO) para conferir os blocos.</span>';
            return;
        }

        var letrasTotal = silabas.join('').length;
        var chips = silabas.map(function (syl) {
            return '<span class="tp-syl-chip">' + escapeHtml(syl.toUpperCase()) + '</span>';
        }).join('');

        previewEl.innerHTML = chips + '<span class="tp-preview-meta">' + silabas.length + ' ' + (silabas.length === 1 ? 'sílaba' : 'sílabas') + ' / ' + letrasTotal + ' letras</span>';
    }

    function renderAbaPalavras(containerEl) {
        var Storage = getStorage();
        if (!Storage) {
            containerEl.innerHTML = '<div class="tp-alert">' + SVGs.ALERT + '<span>Módulo de armazenamento não encontrado.</span></div>';
            return;
        }

        var palavras = Storage.listarPalavrasSemana() || [];
        var ativo = !!Storage.isPalavrasSemanaAtivo();
        var config = Storage.getConfig() || {};
        var fase1Atual = String(config.fase1ModoSemana || 'dica').toLowerCase();
        var fase1Selected = fase1Atual.indexOf('silaba') !== -1 ? 'silaba' : 'dica';

        var avisoHtml = '';
        if (palavras.length < 4) {
            avisoHtml = '<div class="tp-alert">' + SVGs.ALERT + '<span>Cadastre pelo menos <strong>4 palavras</strong> para ativar este modo nas 3 fases. Recomendamos de <strong>6 a 8 palavras</strong> para variar bem as rodadas.</span></div>';
        } else if (palavras.length < 6) {
            avisoHtml = '<div class="tp-alert tp-alert-info">' + SVGs.SPARKLE + '<span>Tudo pronto para ativar! Dica pedagógica: cadastrar de 6 a 8 palavras deixa os jogos ainda mais ricos.</span></div>';
        }

        var listaHtml = '';
        if (palavras.length === 0) {
            listaHtml = '<div class="tp-alert tp-alert-info">' + SVGs.BOOK + '<span>Nenhuma palavra semanal cadastrada ainda. Use o formulário acima para montar sua lista.</span></div>';
        } else {
            listaHtml = '<div class="tp-word-list">' + palavras.map(function (item) {
                var id = escapeHtml(item.id);
                var silabas = getPalavraSilabas(item);
                var chipsHtml = silabas.map(function (s) {
                    return '<span class="tp-syl-chip">' + escapeHtml(s.toUpperCase()) + '</span>';
                }).join('');

                var dicaTexto = item.dica && String(item.dica).trim()
                    ? escapeHtml(String(item.dica).trim())
                    : 'Sem dica curta (usará sílaba inicial na Fase 1)';

                var fraseTexto = item.frase && String(item.frase).trim()
                    ? escapeHtml(String(item.frase).trim())
                    : 'Enunciado padrão na Fase 3';

                return [
                    '<div class="tp-word-item">',
                    '  <div class="tp-word-main">',
                    '    <div class="tp-word-syllables">' + chipsHtml + '</div>',
                    '    <div class="tp-word-meta">',
                    '      <span><strong>Dica:</strong> ' + dicaTexto + '</span>',
                    '      <span><strong>Frase:</strong> ' + fraseTexto + '</span>',
                    '    </div>',
                    '  </div>',
                    '  <div class="tp-inline-actions">',
                    '    <button type="button" class="tp-btn tp-btn-outline tp-btn-sm" data-edit-word="' + id + '">' + SVGs.EDIT + '<span>Editar</span></button>',
                    '    <button type="button" class="tp-btn tp-btn-danger tp-btn-sm" data-remove-word="' + id + '">' + SVGs.TRASH + '<span>Remover</span></button>',
                    '  </div>',
                    '</div>'
                ].join('');
            }).join('') + '</div>';
        }

        var isEditing = state.editingWordId !== null && state.editingWordId !== undefined;

        containerEl.innerHTML = [
            '<div class="tp-section">',
            '  <div class="tp-card">',
            '    <h3 class="tp-card-title">' + SVGs.BOOK + '<span>Ativação nas 3 Fases</span></h3>',
            '    <div class="tp-switch-row">',
            '      <div class="tp-switch-info">',
            '        <span class="tp-switch-title">Ativar Palavras da Semana nas 3 Fases</span>',
            '        <span class="tp-switch-desc">Substitui temporariamente as palavras de saúde bucal pelas palavras cadastradas pela professora.</span>',
            '      </div>',
            '      <button type="button" id="tpToggleWeeklyBtn" class="tp-toggle-btn' + (ativo ? ' is-on' : '') + '" aria-pressed="' + (ativo ? 'true' : 'false') + '">',
            '        <span class="tp-toggle-track"><span class="tp-toggle-thumb"></span></span>',
            '        <span>' + (ativo ? 'Ativo' : 'Desativado') + '</span>',
            '      </button>',
            '    </div>',
            avisoHtml,
            '    <div class="tp-field">',
            '      <label class="tp-label" for="tpFase1ModeSelect">Par da carta na Fase 1 (Memória) quando ativo</label>',
            '      <select id="tpFase1ModeSelect" class="tp-select">',
            '        <option value="dica"' + (fase1Selected === 'dica' ? ' selected' : '') + '>Dica curta (ou sílaba inicial se sem dica)</option>',
            '        <option value="silaba"' + (fase1Selected === 'silaba' ? ' selected' : '') + '>Sempre sílaba inicial</option>',
            '      </select>',
            '    </div>',
            '  </div>',
            '  <div id="tpWordFormCard" class="tp-card">',
            '    <h3 class="tp-card-title">' + (isEditing ? SVGs.EDIT : SVGs.SPARKLE) + '<span>' + (isEditing ? 'Editando Palavra da Semana' : 'Adicionar Palavra da Semana') + '</span></h3>',
            '    <div class="tp-form-grid">',
            '      <div class="tp-field tp-field-full">',
            '        <label class="tp-label" for="tpWordSyllablesInput">Palavra separada por hífen (ex.: CA-VA-LO)</label>',
            '        <input id="tpWordSyllablesInput" class="tp-input tp-upper" type="text" value="' + escapeHtml(state.draftSilabasRaw) + '" placeholder="Ex.: CA-VA-LO ou ES-CO-VA" maxlength="50" autocomplete="off">',
            '        <div id="tpSyllablePreview" class="tp-syllable-preview"></div>',
            '      </div>',
            '      <div class="tp-field tp-field-full">',
            '        <label class="tp-label" for="tpWordHintInput">Dica curta (opcional — usada na Fase 1 e Fase 2)</label>',
            '        <input id="tpWordHintInput" class="tp-input" type="text" value="' + escapeHtml(state.draftDica) + '" placeholder="Ex.: Animal que corre no campo" maxlength="90" autocomplete="off">',
            '      </div>',
            '      <div class="tp-field tp-field-full">',
            '        <label class="tp-label" for="tpWordPhraseInput">Frase com lacuna (opcional — usada na Fase 3)</label>',
            '        <div class="tp-input-row">',
            '          <input id="tpWordPhraseInput" class="tp-input" type="text" value="' + escapeHtml(state.draftFrase) + '" placeholder="Ex.: O ___ galopa na fazenda." maxlength="140" autocomplete="off">',
            '          <button type="button" id="tpInsertBlankBtn" class="tp-btn tp-btn-outline tp-btn-sm">Inserir ___</button>',
            '        </div>',
            '      </div>',
            '    </div>',
            '    <div class="tp-inline-actions">',
            '      <button type="button" id="tpSaveWordBtn" class="tp-btn tp-btn-primary">' + SVGs.CHECK + '<span>' + (isEditing ? 'Salvar alterações' : 'Salvar palavra') + '</span></button>',
            (isEditing ? '<button type="button" id="tpCancelEditWordBtn" class="tp-btn tp-btn-outline">Cancelar edição</button>' : ''),
            '    </div>',
            '  </div>',
            '  <div class="tp-card">',
            '    <div class="tp-card-header-row">',
            '      <h3 class="tp-card-title">' + SVGs.BOOK + '<span>Palavras Cadastradas</span> <span class="tp-count-badge">' + palavras.length + '</span></h3>',
            (palavras.length > 0 ? '<button type="button" id="tpClearWordsBtn" class="tp-btn tp-btn-danger tp-btn-sm">' + SVGs.TRASH + '<span>Limpar todas as palavras</span></button>' : ''),
            '    </div>',
            listaHtml,
            '  </div>',
            '</div>'
        ].join('');

        /* Atualiza preview inicial */
        var sylInput = containerEl.querySelector('#tpWordSyllablesInput');
        var hintInput = containerEl.querySelector('#tpWordHintInput');
        var phraseInput = containerEl.querySelector('#tpWordPhraseInput');
        var previewEl = containerEl.querySelector('#tpSyllablePreview');

        renderPreviewSilabas(previewEl, sylInput ? sylInput.value : '');

        if (sylInput) {
            sylInput.addEventListener('input', function () {
                state.draftSilabasRaw = sylInput.value;
                renderPreviewSilabas(previewEl, sylInput.value);
            });
        }

        if (hintInput) {
            hintInput.addEventListener('input', function () {
                state.draftDica = hintInput.value;
            });
        }

        if (phraseInput) {
            phraseInput.addEventListener('input', function () {
                state.draftFrase = phraseInput.value;
            });
        }

        /* Botao auxiliar "Inserir ___" */
        var insertBlankBtn = containerEl.querySelector('#tpInsertBlankBtn');
        if (insertBlankBtn && phraseInput) {
            insertBlankBtn.addEventListener('click', function () {
                var val = phraseInput.value;
                var start = typeof phraseInput.selectionStart === 'number' ? phraseInput.selectionStart : val.length;
                var end = typeof phraseInput.selectionEnd === 'number' ? phraseInput.selectionEnd : val.length;
                var before = val.slice(0, start);
                var after = val.slice(end);
                var needLeftSpace = before.length > 0 && !/\s$/.test(before);
                var needRightSpace = after.length > 0 && !/^\s/.test(after);
                var token = (needLeftSpace ? ' ' : '') + '___' + (needRightSpace ? ' ' : '');

                phraseInput.value = before + token + after;
                state.draftFrase = phraseInput.value;

                var cursorPos = (before + token).length;
                phraseInput.focus();
                if (typeof phraseInput.setSelectionRange === 'function') {
                    phraseInput.setSelectionRange(cursorPos, cursorPos);
                }
            });
        }

        /* Toggle ativar/desativar Palavras da Semana */
        var toggleWeeklyBtn = containerEl.querySelector('#tpToggleWeeklyBtn');
        if (toggleWeeklyBtn) {
            toggleWeeklyBtn.addEventListener('click', function () {
                var atualmenteAtivo = !!Storage.isPalavrasSemanaAtivo();
                var listaAtual = Storage.listarPalavrasSemana() || [];

                if (!atualmenteAtivo && listaAtual.length < 4) {
                    showToast('Cadastre pelo menos 4 palavras antes de ativar (recomendado: 6 a 8).', 'error');
                    return;
                }

                var res = extrairResultado(Storage.setPalavrasSemanaAtivo(!atualmenteAtivo));
                if (!res.ok) {
                    showToast(res.erro, 'error');
                    return;
                }

                state.hasConfigChanges = true;
                TeacherPanel.atualizarIndicadoresMenu();
                showToast(!atualmenteAtivo ? 'Palavras da Semana ativadas!' : 'Palavras da Semana desativadas.', 'success');
                renderAbaPalavras(containerEl);
            });
        }

        /* Seletor da Fase 1 */
        var fase1Select = containerEl.querySelector('#tpFase1ModeSelect');
        if (fase1Select) {
            fase1Select.addEventListener('change', function () {
                Storage.setFase1ModoSemana(fase1Select.value);
                state.hasConfigChanges = true;
                TeacherPanel.atualizarIndicadoresMenu();
                showToast('Modo da Fase 1 atualizado!', 'success');
            });
        }

        /* Salvar / Atualizar palavra */
        var saveWordBtn = containerEl.querySelector('#tpSaveWordBtn');
        if (saveWordBtn) {
            saveWordBtn.addEventListener('click', function () {
                var silabasRaw = sylInput ? sylInput.value.trim() : '';
                var dica = hintInput ? hintInput.value.trim() : '';
                var frase = phraseInput ? phraseInput.value.trim() : '';

                var silabas = parseSilabas(silabasRaw);
                if (silabas.length === 0) {
                    showToast('Digite a palavra separada por hífen (ex.: CA-VA-LO).', 'error');
                    if (sylInput) sylInput.focus();
                    return;
                }

                var payload = {
                    silabasRaw: silabasRaw,
                    dica: dica,
                    frase: frase
                };

                var wasEditing = state.editingWordId !== null && state.editingWordId !== undefined;
                var rawRes = wasEditing
                    ? Storage.atualizarPalavraSemana(state.editingWordId, payload)
                    : Storage.adicionarPalavraSemana(payload);

                var parsed = extrairResultado(rawRes);
                if (!parsed.ok) {
                    showToast(parsed.erro, 'error');
                    if (sylInput) sylInput.focus();
                    return;
                }

                state.editingWordId = null;
                state.draftSilabasRaw = '';
                state.draftDica = '';
                state.draftFrase = '';
                state.hasConfigChanges = true;
                TeacherPanel.atualizarIndicadoresMenu();

                showToast(wasEditing ? 'Palavra atualizada!' : 'Palavra cadastrada com sucesso!', 'success');
                renderAbaPalavras(containerEl);
            });
        }

        /* Cancelar edicao */
        var cancelEditBtn = containerEl.querySelector('#tpCancelEditWordBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function () {
                state.editingWordId = null;
                state.draftSilabasRaw = '';
                state.draftDica = '';
                state.draftFrase = '';
                renderAbaPalavras(containerEl);
            });
        }

        /* Botoes Editar */
        var editBtns = containerEl.querySelectorAll('[data-edit-word]');
        for (var k = 0; k < editBtns.length; k++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var targetId = btn.getAttribute('data-edit-word');
                    var lista = Storage.listarPalavrasSemana() || [];
                    var found = null;
                    for (var idx = 0; idx < lista.length; idx++) {
                        if (String(lista[idx].id) === String(targetId)) {
                            found = lista[idx];
                            break;
                        }
                    }
                    if (!found) return;

                    state.editingWordId = found.id;
                    state.draftSilabasRaw = found.silabasRaw || getPalavraSilabas(found).join('-');
                    state.draftDica = found.dica || '';
                    state.draftFrase = found.frase || '';
                    renderAbaPalavras(containerEl);

                    var formCard = containerEl.querySelector('#tpWordFormCard');
                    if (formCard && typeof formCard.scrollIntoView === 'function') {
                        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    var inputFocus = containerEl.querySelector('#tpWordSyllablesInput');
                    if (inputFocus) inputFocus.focus();
                });
            })(editBtns[k]);
        }

        /* Botoes Remover palavra */
        var removeBtns = containerEl.querySelectorAll('[data-remove-word]');
        for (var m = 0; m < removeBtns.length; m++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var targetId = btn.getAttribute('data-remove-word');
                    var remRes = Storage.removerPalavraSemana(targetId);

                    if (String(state.editingWordId) === String(targetId)) {
                        state.editingWordId = null;
                        state.draftSilabasRaw = '';
                        state.draftDica = '';
                        state.draftFrase = '';
                    }

                    var desativou = Boolean(remRes && remRes.desativadoAuto);

                    state.hasConfigChanges = true;
                    TeacherPanel.atualizarIndicadoresMenu();
                    showToast(desativou
                        ? 'Palavra removida. Modo desativado por ter menos de 4 palavras.'
                        : 'Palavra removida.');
                    renderAbaPalavras(containerEl);
                });
            })(removeBtns[m]);
        }

        /* Botao Limpar todas as palavras (confirmacao em 2 toques) */
        var clearWordsBtn = containerEl.querySelector('#tpClearWordsBtn');
        if (clearWordsBtn) {
            clearWordsBtn.addEventListener('click', function () {
                if (!state.clearWordsConfirming) {
                    state.clearWordsConfirming = true;
                    clearWordsBtn.classList.add('confirming');
                    clearWordsBtn.innerHTML = SVGs.ALERT + '<span>Toque novamente para confirmar</span>';

                    if (state.clearWordsTimer) {
                        global.clearTimeout(state.clearWordsTimer);
                    }
                    state.clearWordsTimer = global.setTimeout(function () {
                        resetClearWordsConfirmation();
                    }, 4000);
                    return;
                }

                resetClearWordsConfirmation();
                Storage.limparPalavrasSemana();
                if (Storage.isPalavrasSemanaAtivo()) {
                    Storage.setPalavrasSemanaAtivo(false);
                }
                state.editingWordId = null;
                state.draftSilabasRaw = '';
                state.draftDica = '';
                state.draftFrase = '';
                state.hasConfigChanges = true;
                TeacherPanel.atualizarIndicadoresMenu();
                showToast('Todas as palavras da semana foram removidas.');
                renderAbaPalavras(containerEl);
            });
        }
    }

    /* --- Aba 3: Evolucao e Dificuldades --- */
    function renderAbaEvolucao(containerEl) {
        containerEl.innerHTML = '<div class="tp-section"><div id="tpEvolutionMount"></div></div>';
        var mountEl = containerEl.querySelector('#tpEvolutionMount');
        if (!mountEl) return;

        if (SaudeEscola.EvolutionView && typeof SaudeEscola.EvolutionView.render === 'function') {
            SaudeEscola.EvolutionView.render(mountEl);
        } else {
            mountEl.innerHTML = '<div class="tp-alert">' + SVGs.ALERT + '<span>Visualização de evolução indisponível no momento.</span></div>';
        }
    }

    /* ----------------------------------------------------------------------
       5. API Publica: window.SaudeEscola.TeacherPanel
       ---------------------------------------------------------------------- */
    var TeacherPanel = {
        /**
         * Inicializa o painel, eventos de segurar 3s no botao de engrenagem e indicadores.
         */
        init: function (options) {
            options = options || {};
            if (typeof options.onConfigChanged === 'function') {
                state.onConfigChanged = options.onConfigChanged;
            }

            ensureModalStructure();
            setupGearButton();
            this.atualizarIndicadoresMenu();

            if (!state.initialized) {
                state.initialized = true;
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape' && TeacherPanel.isOpen()) {
                        TeacherPanel.close();
                    }
                });
            }
        },

        /**
         * Abre o modal do Painel da Professora na aba especificada.
         */
        open: function (abaInicial) {
            var overlay = ensureModalStructure();
            var wasOpen = this.isOpen();

            if (!wasOpen) {
                state.hasConfigChanges = false;
                state.lastFocusedEl = document.activeElement;
            }

            overlay.classList.add('is-open', 'active');
            document.body.classList.add('tp-modal-open');

            selecionarAba(abaInicial || 'turma');

            var closeBtn = overlay.querySelector('#tpCloseBtn');
            if (closeBtn && typeof closeBtn.focus === 'function') {
                closeBtn.focus();
            }
        },

        /**
         * Fecha o modal e notifica onConfigChanged se houve alteracoes.
         */
        close: function () {
            var overlay = document.getElementById('teacherPanelOverlay');
            if (!overlay) return;

            resetClearWordsConfirmation();
            overlay.classList.remove('is-open', 'active');
            document.body.classList.remove('tp-modal-open');

            this.atualizarIndicadoresMenu();

            if (state.hasConfigChanges && typeof state.onConfigChanged === 'function') {
                state.hasConfigChanges = false;
                var Storage = getStorage();
                state.onConfigChanged(Storage && typeof Storage.getConfig === 'function' ? Storage.getConfig() : undefined);
            } else {
                state.hasConfigChanges = false;
            }

            if (state.lastFocusedEl && document.contains(state.lastFocusedEl) && typeof state.lastFocusedEl.focus === 'function') {
                state.lastFocusedEl.focus();
            }
            state.lastFocusedEl = null;
        },

        /**
         * Informa se o painel esta aberto no momento.
         */
        isOpen: function () {
            var overlay = document.getElementById('teacherPanelOverlay');
            return !!(overlay && (overlay.classList.contains('is-open') || overlay.classList.contains('active')));
        },

        /**
         * Atualiza o selo discreto no menu principal conforme estado de Palavras da Semana.
         */
        atualizarIndicadoresMenu: function () {
            var Storage = getStorage();
            var badgeEl = document.getElementById('weeklyModeBadge');

            if (!badgeEl) {
                var hero = document.querySelector('.menu-hero');
                if (!hero) return;
                badgeEl = document.createElement('div');
                badgeEl.id = 'weeklyModeBadge';
                badgeEl.className = 'tp-weekly-badge';
                badgeEl.style.display = 'none';
                var subtitle = hero.querySelector('.hero-subtitle, .menu-subtitle');
                if (subtitle && subtitle.parentNode) {
                    subtitle.parentNode.insertBefore(badgeEl, subtitle.nextSibling);
                } else {
                    hero.appendChild(badgeEl);
                }
            }

            if (!Storage || !Storage.isPalavrasSemanaAtivo()) {
                badgeEl.style.display = 'none';
                badgeEl.innerHTML = '';
                return;
            }

            var palavras = Storage.listarPalavrasSemana() || [];
            var modoLabel = Storage.isModoAula() ? 'Modo Aula' : 'Modo Livre';
            var texto = 'Palavras da Semana ativas (' + palavras.length + ') - ' + modoLabel;

            badgeEl.className = 'tp-weekly-badge';
            badgeEl.style.display = 'inline-flex';
            badgeEl.innerHTML = SVGs.BOOK + '<span>' + escapeHtml(texto) + '</span>';
        },

        /**
         * Renderiza pilulas clicaveis de sugestao de alunos da turma no Ranking.
         */
        renderizarSugestoesRanking: function (containerEl, textoDigitado, onSelectAluno) {
            if (!containerEl) return;

            containerEl.innerHTML = '';
            containerEl.classList.add('ranking-suggestions-row');

            var Storage = getStorage();
            if (!Storage || !Storage.isModoAula()) {
                containerEl.style.display = 'none';
                return;
            }

            var alunosTurma = Storage.listarAlunos() || [];
            if (alunosTurma.length === 0) {
                containerEl.style.display = 'none';
                return;
            }

            var sugestoes = Storage.buscarSugestoesAlunos(textoDigitado || '', 6) || [];
            if (sugestoes.length === 0) {
                containerEl.style.display = 'none';
                return;
            }

            containerEl.style.display = 'flex';

            for (var i = 0; i < sugestoes.length; i++) {
                (function (aluno) {
                    var nome = aluno && aluno.nome !== undefined ? String(aluno.nome) : String(aluno || '');
                    var chipBtn = document.createElement('button');
                    chipBtn.type = 'button';
                    chipBtn.className = 'ranking-suggestion-chip';
                    chipBtn.textContent = nome;
                    chipBtn.addEventListener('click', function () {
                        if (typeof onSelectAluno === 'function') {
                            onSelectAluno(aluno);
                        }
                    });
                    containerEl.appendChild(chipBtn);
                })(sugestoes[i]);
            }
        }
    };

    SaudeEscola.TeacherPanel = TeacherPanel;

})(window);
