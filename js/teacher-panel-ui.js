/* ==========================================================================
   CABEÇALHO ARQUITETURAL — SaudeEscola.TeacherPanel
   ==========================================================================
   Responsabilidade: interface da professora, três abas, turma, Palavras da
   Semana, períodos, evolução, backup, galeria de figurinhas e confirmações.

   Dependências: Storage, Periods, EvolutionView, ReportPrint, SyllableHelper,
   Stickers, UiIcons e DomSafe; recursos indisponíveis recebem fallback seguro.

   API pública: SaudeEscola.TeacherPanel
   Contrato: inicialização, abertura/fechamento, seleção de aba, indicadores
   do menu e renderização de sugestões no Ranking.

   Sumário:
   1. Estado e ícones vetoriais
   2. Abertura por pressão prolongada
   3. Aba Turma, Modo e Backup
   4. Aba Palavras da Semana e figurinhas
   5. Aba Evolução e períodos
   6. API pública e integração com o jogo
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
        SPARKLE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l1.9 4.7L18.6 9.6l-4.7 1.9L12 16.2l-1.9-4.7-4.7-1.9 4.7-1.9L12 3z"></path><path d="M5 18l.8 1.7L7.5 20.5l-1.7.8L5 23l-.8-1.7-1.7-.8 1.7-.8L5 18z"></path><path d="M19 15l.7 1.3 1.3.7-1.3.7-.7 1.3-.7-1.3-1.3-.7 1.3-.7.7-1.3z"></path></svg>',
        DOWNLOAD: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
        UPLOAD: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
        PRINTER: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg>',
        NOTE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="13" y2="17"></line></svg>'
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
        draftEntrada: '',
        draftSilabasRaw: '',
        draftDica: '',
        draftFrase: '',
        manualSyllablesOpen: false,
        manualSyllablesEdited: false,
        optionalFieldsOpen: false,
        draftStickerId: null,
        stickerManuallyChosen: false,
        stickerGalleryOpen: false,
        stickerActiveCategory: 'animais',
        holdTimer: null,
        activePointerId: null,
        toastTimer: null,
        clearWordsTimer: null,
        clearWordsConfirming: false,
        removeStudentConfirmId: null,
        removeStudentTimer: null,
        removeWordConfirmId: null,
        removeWordTimer: null,
        backdropPressStarted: false,
        lastFocusedEl: null
    };

    function getStorage() {
        return SaudeEscola.Storage || null;
    }

    function getDomSafe() {
        return SaudeEscola.DomSafe || null;
    }

    function getSyllableHelper() {
        return SaudeEscola.SyllableHelper || null;
    }

    function getStickers() {
        return SaudeEscola.Stickers || null;
    }

    /**
     * Resolve figurinha (explicita ou automatica pela palavra) ou fallback do caderninho.
     *
     * [RETROCOMPATIBILIDADE v2.1.x] Palavras antigas podem não possuir stickerId;
     * neste caso o painel resolve uma figurinha pela palavra ou usa o caderninho,
     * mantendo compatibilidade visual sem alterar o cadastro original.
     */
    function resolverStickerVisual(palavraOuPlain, stickerIdExplicito) {
        var Stickers = getStickers();
        var Storage = getStorage();
        var fallbackSvg = (Storage && Storage.SVGs && Storage.SVGs.ILUSTRACAO_SEMANA)
            ? Storage.SVGs.ILUSTRACAO_SEMANA
            : SVGs.BOOK;

        if (stickerIdExplicito === 'none') {
            return {
                temSticker: false,
                stickerId: 'none',
                label: 'Padrão (caderninho)',
                category: null,
                svg: fallbackSvg,
                automatico: false
            };
        }

        var found = null;
        var automatico = false;
        if (typeof stickerIdExplicito === 'string' && stickerIdExplicito.trim()) {
            found = Stickers && typeof Stickers.getById === 'function'
                ? Stickers.getById(stickerIdExplicito)
                : null;
        }
        if (!found && !stickerIdExplicito && palavraOuPlain && Stickers && typeof Stickers.matchByWord === 'function') {
            found = Stickers.matchByWord(palavraOuPlain);
            if (found) automatico = true;
        }

        if (found && found.svg) {
            return {
                temSticker: true,
                stickerId: found.id,
                label: found.label,
                category: found.category,
                svg: found.svg,
                automatico: automatico
            };
        }

        return {
            temSticker: false,
            stickerId: null,
            label: 'Padrão (caderninho)',
            category: null,
            svg: fallbackSvg,
            automatico: false
        };
    }

    /**
     * Normaliza letras removendo acentos para comparar grafias sem alterar Storage.
     */
    function normalizarPlainTexto(texto) {
        var Storage = getStorage();
        if (Storage && typeof Storage.normalizarPlain === 'function') {
            return Storage.normalizarPlain(texto);
        }
        return String(texto == null ? '' : texto)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[^A-Z]/g, '');
    }

    /**
     * Atualiza um botao com icone SVG e rotulo usando apenas nos DOM seguros.
     */
    function setBtnIconText(btn, svgMarkup, label) {
        var domSafe = getDomSafe();
        if (!btn || !domSafe) return;
        domSafe.clear(btn);
        if (svgMarkup) {
            domSafe.appendSvg(btn, svgMarkup);
        }
        if (label !== undefined && label !== null && label !== '') {
            btn.appendChild(domSafe.el('span', { text: String(label) }));
        }
    }

    /**
     * Cria um elemento de botao com icone SVG e rotulo usando DomSafe.
     */
    function createIconButton(attrs, svgMarkup, label) {
        var domSafe = getDomSafe();
        var btn = domSafe.el('button', attrs);
        if (svgMarkup) {
            domSafe.appendSvg(btn, svgMarkup);
        }
        if (label !== undefined && label !== null && label !== '') {
            btn.appendChild(domSafe.el('span', { text: String(label) }));
        }
        return btn;
    }

    /**
     * Cria um alerta padronizado do painel com icone SVG e conteudo seguro.
     */
    function createAlertBox(svgMarkup, contentNodes, extraClass) {
        var domSafe = getDomSafe();
        var box = domSafe.el('div', {
            className: 'tp-alert' + (extraClass ? ' ' + extraClass : '')
        });
        if (svgMarkup) {
            domSafe.appendSvg(box, svgMarkup);
        }
        domSafe.appendChildren(box, contentNodes);
        return box;
    }

    /**
     * Divide string com hifens em blocos de silabas nao vazios.
     */
    function parseSilabas(raw) {
        return String(raw || '')
            .split('-')
            .map(function (part) { return part.replace(/\s+/g, '').trim().toUpperCase(); })
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
            setBtnIconText(clearBtn, SVGs.TRASH, 'Limpar todas as palavras');
        }
    }

    function resetRemoveStudentConfirmation() {
        if (state.removeStudentTimer) {
            global.clearTimeout(state.removeStudentTimer);
            state.removeStudentTimer = null;
        }
        state.removeStudentConfirmId = null;
    }

    function resetRemoveWordConfirmation() {
        if (state.removeWordTimer) {
            global.clearTimeout(state.removeWordTimer);
            state.removeWordTimer = null;
        }
        state.removeWordConfirmId = null;
    }

    /* ----------------------------------------------------------------------
       3. Construcao do modal e controle do botao de engrenagem (segurar 3s)
       ---------------------------------------------------------------------- */
    function ensureModalStructure() {
        var overlay = document.getElementById('teacherPanelOverlay');
        if (overlay) return overlay;

        var domSafe = getDomSafe();
        if (!domSafe) return null;

        var closeBtn = domSafe.el('button', {
            type: 'button',
            id: 'tpCloseBtn',
            className: 'tp-close-btn',
            'aria-label': 'Fechar painel da professora'
        });
        domSafe.appendSvg(closeBtn, SVGs.CLOSE);

        var headerEl = domSafe.el('header', { className: 'tp-header' }, [
            domSafe.el('div', { className: 'tp-header-title' }, [
                domSafe.createIconSpan(SVGs.GEAR, 'tp-header-icon'),
                domSafe.el('div', { className: 'tp-header-text' }, [
                    domSafe.el('span', { id: 'tpHeaderMain', className: 'tp-header-main', text: 'Painel da Professora' }),
                    domSafe.el('span', { className: 'tp-header-sub', text: 'Configurações da turma, palavras da semana e evolução' })
                ])
            ]),
            closeBtn
        ]);

        var tabsNav = domSafe.el('nav', {
            className: 'tp-tabs',
            role: 'tablist',
            'aria-label': 'Abas do Painel da Professora'
        }, [
            createIconButton({ type: 'button', className: 'tp-tab', role: 'tab', 'data-tab': 'turma', 'aria-selected': 'true' }, SVGs.USERS, 'Turma e Modo'),
            createIconButton({ type: 'button', className: 'tp-tab', role: 'tab', 'data-tab': 'palavras', 'aria-selected': 'false' }, SVGs.BOOK, 'Palavras da Semana'),
            createIconButton({ type: 'button', className: 'tp-tab', role: 'tab', 'data-tab': 'evolucao', 'aria-selected': 'false' }, SVGs.CHART, 'Evolução e Dificuldades')
        ]);

        var modalEl = domSafe.el('div', { className: 'tp-modal' }, [
            headerEl,
            tabsNav,
            domSafe.el('div', { id: 'tpBody', className: 'tp-body' }),
            domSafe.el('div', { id: 'tpToast', className: 'tp-toast', role: 'status', 'aria-live': 'polite' })
        ]);

        overlay = domSafe.el('div', {
            id: 'teacherPanelOverlay',
            className: 'tp-overlay',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'tpHeaderMain'
        }, [modalEl]);

        document.body.appendChild(overlay);

        closeBtn.addEventListener('click', function () {
            TeacherPanel.close();
        });

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

        var domSafe = getDomSafe();
        if (!btn.querySelector('.tp-gear-ring-progress') && domSafe) {
            var ringSvg = domSafe.svgEl('svg', {
                className: 'tp-gear-ring',
                viewBox: '0 0 52 52',
                'aria-hidden': 'true',
                focusable: 'false'
            }, [
                domSafe.svgEl('circle', { className: 'tp-gear-ring-track', cx: '26', cy: '26', r: '22' }),
                domSafe.svgEl('circle', { className: 'tp-gear-ring-progress', cx: '26', cy: '26', r: '22' })
            ]);
            domSafe.setChildren(btn, [
                ringSvg,
                domSafe.createIconSpan(SVGs.GEAR, 'tp-gear-icon'),
                domSafe.el('span', { className: 'tp-gear-hint', text: 'Segure 3s' })
            ]);
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
        state.manualSyllablesOpen = false;
        state.manualSyllablesEdited = false;
        resetClearWordsConfirmation();
        resetRemoveStudentConfirmation();
        resetRemoveWordConfirmation();

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
        var domSafe = getDomSafe();
        if (!domSafe) return;

        if (!Storage) {
            domSafe.setChildren(containerEl, [
                createAlertBox(SVGs.ALERT, domSafe.el('span', { text: 'Módulo de armazenamento não encontrado.' }))
            ]);
            return;
        }

        var isAula = !!Storage.isModoAula();
        var alunos = Storage.listarAlunos() || [];

        var alunosNode;
        if (alunos.length === 0) {
            alunosNode = createAlertBox(
                SVGs.ALERT,
                domSafe.el('span', { text: 'Nenhum aluno cadastrado ainda. Adicione os nomes abaixo para exibir sugestões clicáveis no Ranking durante o Modo Aula.' }),
                'tp-alert-info'
            );
        } else {
            var pillNodes = alunos.map(function (aluno) {
                var rawId = aluno && aluno.id !== undefined ? String(aluno.id) : '';
                var nome = aluno && aluno.nome !== undefined ? String(aluno.nome) : String(aluno || '');
                var isConfirming = state.removeStudentConfirmId !== null && String(state.removeStudentConfirmId) === rawId;
                var pillClass = 'tp-student-pill' + (isConfirming ? ' is-confirming' : '');
                var btnClass = 'tp-pill-remove' + (isConfirming ? ' confirming' : '');
                var ariaLabel = isConfirming
                    ? ('Toque novamente para remover ' + nome)
                    : ('Remover ' + nome);
                var removeBtn = domSafe.el('button', {
                    type: 'button',
                    className: btnClass,
                    'data-remove-student': rawId,
                    'aria-label': ariaLabel
                });
                if (isConfirming) {
                    removeBtn.appendChild(domSafe.el('span', { text: 'Confirmar?' }));
                } else {
                    domSafe.appendSvg(removeBtn, SVGs.CLOSE);
                }
                return domSafe.el('span', { className: pillClass }, [
                    domSafe.el('span', { text: nome }),
                    removeBtn
                ]);
            });
            alunosNode = domSafe.el('div', { className: 'tp-pill-list' }, pillNodes);
        }

        var batchNode = state.batchBoxOpen ? domSafe.el('div', { className: 'tp-batch-box' }, [
            domSafe.el('label', {
                className: 'tp-label',
                for: 'tpBatchStudentsInput',
                text: 'Adicionar vários alunos de uma vez (prefira Nome + Inicial por privacidade; separe por vírgula ou linha):'
            }),
            domSafe.el('textarea', {
                id: 'tpBatchStudentsInput',
                className: 'tp-textarea',
                rows: '4',
                placeholder: 'Ana J.\nPedro M.\nMaria C., Lucas S.'
            }),
            domSafe.el('div', { className: 'tp-inline-actions' }, [
                createIconButton({ type: 'button', id: 'tpSaveBatchBtn', className: 'tp-btn tp-btn-secondary' }, SVGs.CHECK, 'Importar lista'),
                domSafe.el('button', { type: 'button', id: 'tpCancelBatchBtn', className: 'tp-btn tp-btn-outline tp-btn-sm', text: 'Recolher' })
            ])
        ]) : null;

        var modeAulaCheck = domSafe.el('span', { className: 'tp-mode-check' });
        if (isAula) domSafe.appendSvg(modeAulaCheck, SVGs.CHECK);
        var modeLivreCheck = domSafe.el('span', { className: 'tp-mode-check' });
        if (!isAula) domSafe.appendSvg(modeLivreCheck, SVGs.CHECK);

        var titleMode = domSafe.el('h3', { className: 'tp-card-title' });
        domSafe.appendSvg(titleMode, SVGs.SPARKLE);
        titleMode.appendChild(domSafe.el('span', { text: 'Modo de Uso do Jogo' }));

        var titleTurma = domSafe.el('h3', { className: 'tp-card-title' });
        domSafe.appendSvg(titleTurma, SVGs.USERS);
        titleTurma.appendChild(domSafe.el('span', { text: 'Alunos da Turma' }));

        var titleBackup = domSafe.el('h3', { className: 'tp-card-title' });
        domSafe.appendSvg(titleBackup, SVGs.DOWNLOAD);
        titleBackup.appendChild(domSafe.el('span', { text: 'Backup e Relatório' }));

        var section = domSafe.el('div', { className: 'tp-section' }, [
            domSafe.el('div', { className: 'tp-card' }, [
                titleMode,
                domSafe.el('div', { className: 'tp-mode-grid' }, [
                    domSafe.el('button', {
                        type: 'button',
                        className: 'tp-mode-option' + (isAula ? ' active' : ''),
                        'data-set-modo': 'aula'
                    }, [
                        domSafe.el('div', { className: 'tp-mode-option-head' }, [
                            domSafe.el('span', { text: 'Modo Aula' }),
                            modeAulaCheck
                        ]),
                        domSafe.el('span', {
                            className: 'tp-mode-option-desc',
                            text: 'Exibe sugestões da turma no Ranking e grava o desempenho nos gráficos de evolução.'
                        })
                    ]),
                    domSafe.el('button', {
                        type: 'button',
                        className: 'tp-mode-option' + (!isAula ? ' active' : ''),
                        'data-set-modo': 'livre'
                    }, [
                        domSafe.el('div', { className: 'tp-mode-option-head' }, [
                            domSafe.el('span', { text: 'Modo Livre' }),
                            modeLivreCheck
                        ]),
                        domSafe.el('span', {
                            className: 'tp-mode-option-desc',
                            text: 'Permite digitação livre de nomes no Ranking, sem gravar nos gráficos da turma.'
                        })
                    ])
                ])
            ]),
            domSafe.el('div', { className: 'tp-card' }, [
                domSafe.el('div', { className: 'tp-card-header-row' }, [
                    titleTurma,
                    domSafe.el('span', {
                        className: 'tp-count-badge',
                        text: alunos.length + ' ' + (alunos.length === 1 ? 'aluno' : 'alunos')
                    })
                ]),
                domSafe.el('div', { className: 'tp-field' }, [
                    domSafe.el('label', {
                        className: 'tp-label',
                        for: 'tpStudentNameInput',
                        text: 'Cadastro rápido de aluno (recomendado Nome + Inicial para privacidade na lousa)'
                    }),
                    domSafe.el('div', { className: 'tp-input-row' }, [
                        domSafe.el('input', {
                            id: 'tpStudentNameInput',
                            className: 'tp-input',
                            type: 'text',
                            placeholder: 'Ex.: Ana J., Pedro M.',
                            maxlength: '60',
                            autocomplete: 'off'
                        }),
                        createIconButton({ type: 'button', id: 'tpAddStudentBtn', className: 'tp-btn tp-btn-primary' }, SVGs.CHECK, 'Adicionar aluno')
                    ])
                ]),
                domSafe.el('div', { className: 'tp-inline-actions' }, [
                    domSafe.el('button', {
                        type: 'button',
                        id: 'tpToggleBatchBtn',
                        className: 'tp-btn tp-btn-outline tp-btn-sm',
                        text: state.batchBoxOpen ? 'Ocultar importação em lote' : 'Adicionar vários alunos de uma vez'
                    })
                ]),
                batchNode,
                alunosNode
            ]),
            domSafe.el('div', { className: 'tp-card tp-backup-card' }, [
                domSafe.el('div', { className: 'tp-card-header-row' }, [titleBackup]),
                domSafe.el('p', {
                    className: 'tp-backup-desc',
                    text: 'Salve uma cópia da turma, palavras da semana, evolução, anotações e ranking em arquivo JSON, restaure um backup anterior ou imprima o relatório pedagógico em PDF.'
                }),
                domSafe.el('div', { className: 'tp-inline-actions' }, [
                    createIconButton({ type: 'button', id: 'tpExportBackupBtn', className: 'tp-btn tp-btn-outline' }, SVGs.DOWNLOAD, 'Exportar JSON'),
                    createIconButton({ type: 'button', id: 'tpImportBackupBtn', className: 'tp-btn tp-btn-outline' }, SVGs.UPLOAD, 'Importar JSON'),
                    createIconButton({ type: 'button', id: 'tpExportPdfBtn', className: 'tp-btn tp-btn-primary' }, SVGs.PRINTER, 'Exportar Relatório (PDF)'),
                    domSafe.el('input', {
                        type: 'file',
                        id: 'tpImportBackupInput',
                        className: 'u-hidden',
                        accept: '.json,application/json',
                        'aria-hidden': 'true'
                    })
                ])
            ])
        ]);

        domSafe.setChildren(containerEl, section);

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

        /* Remocao de alunos com confirmacao em 2 toques */
        var removeBtns = containerEl.querySelectorAll('.tp-pill-remove[data-remove-student]');
        for (var j = 0; j < removeBtns.length; j++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var id = btn.getAttribute('data-remove-student');
                    if (state.removeStudentConfirmId !== id) {
                        resetRemoveStudentConfirmation();
                        state.removeStudentConfirmId = id;
                        state.removeStudentTimer = global.setTimeout(function () {
                            state.removeStudentConfirmId = null;
                            state.removeStudentTimer = null;
                            if (state.activeTab === 'turma' && TeacherPanel.isOpen()) {
                                renderAbaTurma(containerEl);
                            }
                        }, 3500);
                        renderAbaTurma(containerEl);
                        return;
                    }

                    resetRemoveStudentConfirmation();
                    Storage.removerAluno(id);
                    state.hasConfigChanges = true;
                    TeacherPanel.atualizarIndicadoresMenu();
                    showToast('Aluno removido da turma.');
                    renderAbaTurma(containerEl);
                });
            })(removeBtns[j]);
        }

        /* Exportar Backup JSON via Blob + download */
        var exportBtn = containerEl.querySelector('#tpExportBackupBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function () {
                if (typeof Storage.gerarBackupJSON !== 'function') {
                    showToast('Função de exportação não disponível.', 'error');
                    return;
                }
                try {
                    var jsonStr = Storage.gerarBackupJSON();
                    var dataStr = typeof Storage.getDataLocalISO === 'function'
                        ? Storage.getDataLocalISO(new Date())
                        : 'backup';
                    var filename = 'backup-saude-escola-' + dataStr + '.json';
                    var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
                    var url = URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    global.setTimeout(function () {
                        URL.revokeObjectURL(url);
                    }, 1500);
                    showToast('Backup JSON exportado com sucesso!', 'success');
                } catch (errExport) {
                    showToast('Não foi possível exportar o arquivo JSON.', 'error');
                }
            });
        }

        /* Importar Backup JSON via FileReader */
        var importBtn = containerEl.querySelector('#tpImportBackupBtn');
        var importInput = containerEl.querySelector('#tpImportBackupInput');
        if (importBtn && importInput) {
            importBtn.addEventListener('click', function () {
                importInput.value = '';
                importInput.click();
            });

            importInput.addEventListener('change', function () {
                var file = importInput.files && importInput.files[0];
                if (!file) return;

                var maxBytes = (Storage && typeof Storage.MAX_BACKUP_BYTES === 'number')
                    ? Storage.MAX_BACKUP_BYTES
                    : (2 * 1024 * 1024);
                if (typeof file.size === 'number' && file.size > maxBytes) {
                    showToast('O arquivo de backup excede o limite máximo permitido de 2 MB.', 'error');
                    return;
                }

                if (typeof FileReader !== 'function') {
                    showToast('Leitor de arquivos não suportado neste navegador.', 'error');
                    return;
                }

                var reader = new FileReader();
                reader.onload = function (ev) {
                    var content = ev && ev.target ? ev.target.result : '';
                    if (typeof Storage.importarBackupJSON !== 'function') {
                        showToast('Função de importação não disponível.', 'error');
                        return;
                    }

                    var res = Storage.importarBackupJSON(content);
                    if (!res || !res.ok) {
                        showToast((res && res.erro) ? res.erro : 'Não foi possível importar o backup JSON.', 'error');
                        return;
                    }

                    state.hasConfigChanges = true;
                    TeacherPanel.atualizarIndicadoresMenu();
                    if (SaudeEscola.Ranking && typeof SaudeEscola.Ranking.renderList === 'function') {
                        SaudeEscola.Ranking.renderList();
                    }

                    var r = res.resumo || {};
                    var qtdAlunos = r.alunos || 0;
                    var qtdPalavras = r.palavras || 0;
                    var qtdSessoes = r.sessoes || 0;
                    var extraNotas = r.anotacoes ? (', ' + r.anotacoes + (r.anotacoes === 1 ? ' anotação' : ' anotações')) : '';
                    showToast(
                        'Backup restaurado (' +
                        qtdAlunos + (qtdAlunos === 1 ? ' aluno, ' : ' alunos, ') +
                        qtdPalavras + (qtdPalavras === 1 ? ' palavra, ' : ' palavras, ') +
                        qtdSessoes + (qtdSessoes === 1 ? ' sessão' : ' sessões') +
                        extraNotas + ')!',
                        'success'
                    );
                    renderAbaTurma(containerEl);
                };
                reader.onerror = function () {
                    showToast('Erro ao ler o arquivo selecionado.', 'error');
                };
                reader.readAsText(file, 'utf-8');
            });
        }

        /* Exportar Relatorio Pedagogico em PDF (@media print) */
        var exportPdfBtn = containerEl.querySelector('#tpExportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', function () {
                var rp = SaudeEscola.ReportPrint;
                if (!rp || typeof rp.print !== 'function') {
                    showToast('Módulo de relatório PDF não disponível.', 'error');
                    return;
                }
                var resPrint = rp.print();
                if (resPrint && resPrint.ok === false) {
                    showToast(resPrint.erro || 'Não foi possível gerar o relatório PDF.', 'error');
                }
            });
        }
    }

    /* --- Aba 2: Palavras da Semana --- */

    /**
     * Valida rascunho digitado manualmente com hifens no painel de ajuste fino.
     */
    function validarRascunhoManual(manualRaw, palavrasExistentes, editingWordId) {
        var partes = String(manualRaw || '').split('-');
        for (var i = 0; i < partes.length; i++) {
            var parteLimpa = partes[i].replace(/\s+/g, '').trim().toUpperCase();
            if (!parteLimpa) continue;
            if (normalizarPlainTexto(parteLimpa).length === 0) {
                return {
                    tipo: 'single',
                    status: 'invalid_char',
                    ehLote: false,
                    pronto: false,
                    manual: true,
                    silabas: [],
                    palavra: '',
                    plain: '',
                    silabasRaw: '',
                    msg: 'Use apenas letras e hífen (-) no ajuste manual (ex.: CA-VA-LO).'
                };
            }
        }

        var silabas = parseSilabas(manualRaw);
        if (silabas.length === 0) {
            return {
                tipo: 'single',
                status: 'too_short',
                ehLote: false,
                pronto: false,
                manual: true,
                silabas: [],
                palavra: '',
                plain: '',
                silabasRaw: '',
                msg: 'Digite as sílabas separadas por hífen ou toque em "Usar automático".'
            };
        }

        var palavra = silabas.join('');
        var plain = normalizarPlainTexto(palavra);
        if (palavra.length !== plain.length) {
            return {
                tipo: 'single',
                status: 'invalid_char',
                ehLote: false,
                pronto: false,
                manual: true,
                silabas: silabas,
                palavra: palavra,
                plain: plain,
                silabasRaw: silabas.join('-'),
                msg: 'Use apenas letras e hífen (-) para separar as sílabas.'
            };
        }

        if (plain.length < 2) {
            return {
                tipo: 'single',
                status: 'too_short',
                ehLote: false,
                pronto: false,
                manual: true,
                silabas: silabas,
                palavra: palavra,
                plain: plain,
                silabasRaw: silabas.join('-'),
                msg: 'Digite uma palavra com pelo menos 2 letras.'
            };
        }

        var lista = Array.isArray(palavrasExistentes) ? palavrasExistentes : [];
        for (var j = 0; j < lista.length; j++) {
            var item = lista[j];
            if (!item) continue;
            if (editingWordId !== null && editingWordId !== undefined && String(item.id) === String(editingWordId)) {
                continue;
            }
            if (item.plain === plain) {
                return {
                    tipo: 'single',
                    status: 'duplicate',
                    ehLote: false,
                    pronto: false,
                    manual: true,
                    silabas: silabas,
                    palavra: palavra,
                    plain: plain,
                    silabasRaw: silabas.join('-'),
                    msg: 'Essa palavra já está na lista da semana. Escolha outra ou edite a existente.'
                };
            }
        }

        return {
            tipo: 'single',
            status: 'ok',
            ehLote: false,
            pronto: true,
            manual: true,
            silabas: silabas,
            palavra: palavra,
            plain: plain,
            silabasRaw: silabas.join('-'),
            msg: silabas.length === 1
                ? 'Separação manual pronta! 1 sílaba para salvar.'
                : ('Separação manual pronta! ' + silabas.length + ' sílabas para salvar.')
        };
    }

    /**
     * Analisa a entrada do campo principal (palavra unica com separacao automatica ou lote).
     */
    function analisarEntradaPalavras(rawInput, manualRaw, palavrasExistentes, editingWordId) {
        var helper = getSyllableHelper();
        var lista = Array.isArray(palavrasExistentes) ? palavrasExistentes : [];
        var isEditing = editingWordId !== null && editingWordId !== undefined;

        var extracao;
        if (helper && typeof helper.extrairPalavras === 'function') {
            extracao = helper.extrairPalavras(rawInput);
        } else {
            var tokensFallback = String(rawInput || '').trim()
                ? String(rawInput || '').trim().split(/[,;\r\n\s]+/).filter(Boolean)
                : [];
            extracao = {
                ehLote: tokensFallback.length > 1,
                totalTokens: tokensFallback.length,
                itens: tokensFallback.map(function (tok) {
                    var sils = parseSilabas(tok);
                    var pal = sils.join('');
                    var pl = normalizarPlainTexto(pal);
                    var ok = sils.length > 0 && pal.length === pl.length && pl.length >= 2;
                    return {
                        bruto: tok,
                        palavra: pal,
                        plain: pl,
                        silabas: sils,
                        silabasRaw: sils.join('-'),
                        usouHifenManual: tok.indexOf('-') !== -1,
                        valido: ok,
                        erroCodigo: ok ? null : 'invalid_char',
                        erroMsg: ok ? '' : 'Use apenas letras.'
                    };
                })
            };
        }

        if (!extracao || extracao.itens.length === 0) {
            return {
                tipo: 'empty',
                status: 'empty',
                ehLote: false,
                pronto: false,
                silabas: [],
                palavra: '',
                plain: '',
                silabasRaw: '',
                msg: 'As sílabas aparecem separadas automaticamente aqui.'
            };
        }

        /* Palavra unica */
        if (!extracao.ehLote && extracao.itens.length === 1) {
            var itemUnico = extracao.itens[0];

            if (state.manualSyllablesEdited && String(manualRaw || '').trim()) {
                return validarRascunhoManual(manualRaw, lista, editingWordId);
            }

            if (!itemUnico.valido) {
                return {
                    tipo: 'single',
                    status: itemUnico.erroCodigo || 'invalid_char',
                    ehLote: false,
                    pronto: false,
                    manual: Boolean(itemUnico.usouHifenManual),
                    silabas: itemUnico.silabas,
                    palavra: itemUnico.palavra,
                    plain: itemUnico.plain,
                    silabasRaw: itemUnico.silabasRaw,
                    msg: itemUnico.erroCodigo === 'too_short'
                        ? 'Digite uma palavra com pelo menos 2 letras.'
                        : 'Use apenas letras (sem números ou pontuação) para cadastrar a palavra.'
                };
            }

            for (var j = 0; j < lista.length; j++) {
                var existente = lista[j];
                if (!existente) continue;
                if (isEditing && String(existente.id) === String(editingWordId)) {
                    continue;
                }
                if (existente.plain === itemUnico.plain) {
                    return {
                        tipo: 'single',
                        status: 'duplicate',
                        ehLote: false,
                        pronto: false,
                        manual: Boolean(itemUnico.usouHifenManual),
                        silabas: itemUnico.silabas,
                        palavra: itemUnico.palavra,
                        plain: itemUnico.plain,
                        silabasRaw: itemUnico.silabasRaw,
                        msg: 'Essa palavra já está na lista da semana. Escolha outra ou edite a existente.'
                    };
                }
            }

            var qtdSil = itemUnico.silabas.length;
            var prefixo = itemUnico.usouHifenManual ? 'Separação manual concluída! ' : 'Separação automática concluída! ';
            return {
                tipo: 'single',
                status: 'ok',
                ehLote: false,
                pronto: true,
                manual: Boolean(itemUnico.usouHifenManual),
                silabas: itemUnico.silabas,
                palavra: itemUnico.palavra,
                plain: itemUnico.plain,
                silabasRaw: itemUnico.silabasRaw,
                msg: prefixo + qtdSil + (qtdSil === 1 ? ' sílaba pronta.' : ' sílabas prontas para as crianças montarem.')
            };
        }

        /* Multiplas palavras (lote) */
        if (isEditing) {
            return {
                tipo: 'batch_blocked_editing',
                status: 'warn',
                ehLote: true,
                pronto: false,
                itensLote: [],
                prontasParaSalvar: [],
                prontasCount: 0,
                duplicadasCount: 0,
                invalidasCount: 0,
                excedentesCount: 0,
                msg: 'No modo de edição, altere uma palavra por vez. Cancele a edição para cadastrar várias de uma vez.'
            };
        }

        var vagas = Math.max(0, 12 - lista.length);
        var plainsExistentes = Object.create(null);
        for (var e = 0; e < lista.length; e++) {
            if (lista[e] && lista[e].plain) {
                plainsExistentes[lista[e].plain] = true;
            }
        }

        var plainsLote = Object.create(null);
        var itensLote = [];
        var prontasParaSalvar = [];
        var duplicadasCount = 0;
        var invalidasCount = 0;
        var excedentesCount = 0;

        for (var k = 0; k < extracao.itens.length; k++) {
            var tok = extracao.itens[k];
            var statusItem = 'ready';
            var statusBadge = 'Pronta';

            if (!tok.valido) {
                statusItem = 'invalid';
                statusBadge = tok.erroCodigo === 'too_short' ? 'Muito curta' : 'Inválida';
                invalidasCount += 1;
            } else if (plainsExistentes[tok.plain]) {
                statusItem = 'duplicate_existing';
                statusBadge = 'Já cadastrada';
                duplicadasCount += 1;
            } else if (plainsLote[tok.plain]) {
                statusItem = 'duplicate_batch';
                statusBadge = 'Repetida';
                duplicadasCount += 1;
            } else if (prontasParaSalvar.length >= vagas) {
                statusItem = 'over_limit';
                statusBadge = 'Limite 12';
                excedentesCount += 1;
            } else {
                plainsLote[tok.plain] = true;
                prontasParaSalvar.push(tok);
            }

            itensLote.push({
                bruto: tok.bruto,
                palavra: tok.palavra,
                plain: tok.plain,
                silabas: tok.silabas,
                silabasRaw: tok.silabasRaw,
                statusItem: statusItem,
                statusBadge: statusBadge
            });
        }

        var prontasCount = prontasParaSalvar.length;
        var partesResumo = [];
        if (prontasCount > 0) {
            partesResumo.push(prontasCount + (prontasCount === 1 ? ' pronta' : ' prontas') + ' para cadastrar em 1 clique');
        }
        if (duplicadasCount > 0) {
            partesResumo.push(duplicadasCount + (duplicadasCount === 1 ? ' repetida ignorada' : ' repetidas ignoradas'));
        }
        if (excedentesCount > 0) {
            partesResumo.push(excedentesCount + ' além do limite de 12');
        }
        if (invalidasCount > 0) {
            partesResumo.push(invalidasCount + (invalidasCount === 1 ? ' inválida' : ' inválidas'));
        }

        var statusBatch = prontasCount > 0
            ? (duplicadasCount > 0 || excedentesCount > 0 || invalidasCount > 0 ? 'tip' : 'ok')
            : 'warn';

        return {
            tipo: 'batch',
            status: statusBatch,
            ehLote: true,
            pronto: prontasCount > 0,
            itensLote: itensLote,
            prontasParaSalvar: prontasParaSalvar,
            prontasCount: prontasCount,
            duplicadasCount: duplicadasCount,
            invalidasCount: invalidasCount,
            excedentesCount: excedentesCount,
            vagas: vagas,
            msg: extracao.itens.length + ' palavras detectadas: ' + partesResumo.join(' • ') + '.'
        };
    }

    /**
     * Renderiza o preview (blocos tateis de palavra unica ou lista em lote) e o feedback.
     */
    function renderPreviewEntrada(previewEl, feedbackEl, analise) {
        var domSafe = getDomSafe();
        if (!previewEl || !domSafe || !analise) return;

        if (analise.tipo === 'empty') {
            domSafe.setChildren(previewEl, [
                domSafe.el('span', {
                    className: 'tp-preview-placeholder',
                    text: 'As sílabas aparecem separadas automaticamente aqui.'
                })
            ]);
        } else if (analise.ehLote) {
            if (!analise.itensLote || analise.itensLote.length === 0) {
                domSafe.setChildren(previewEl, [
                    domSafe.el('span', {
                        className: 'tp-preview-placeholder',
                        text: 'Finalize ou cancele a edição atual antes de colar várias palavras.'
                    })
                ]);
            } else {
                var linhasLote = analise.itensLote.map(function (item) {
                    var statusClass = 'tp-batch-word-status ';
                    if (item.statusItem === 'ready') statusClass += 'is-ready';
                    else if (item.statusItem === 'over_limit') statusClass += 'is-over';
                    else if (item.statusItem === 'invalid') statusClass += 'is-invalid';
                    else statusClass += 'is-dup';

                    var blocosItem = (item.silabas && item.silabas.length > 0)
                        ? item.silabas.map(function (syl) {
                            return domSafe.el('span', { className: 'tp-batch-word-chip', text: syl.toUpperCase() });
                        })
                        : [domSafe.el('span', { className: 'tp-batch-word-chip', text: item.bruto })];

                    var stkBatch = resolverStickerVisual(item.plain || item.palavra || item.bruto, null);
                    var batchThumbEl = domSafe.el('span', {
                        className: 'tp-batch-sticker-thumb ' + (stkBatch.temSticker ? 'has-sticker' : 'is-default'),
                        title: stkBatch.temSticker ? ('Figurinha: ' + stkBatch.label) : 'Ícone padrão (caderninho)'
                    });
                    if (stkBatch.svg) {
                        domSafe.setSvg(batchThumbEl, stkBatch.svg);
                    }

                    return domSafe.el('div', { className: 'tp-batch-word-row' }, [
                        batchThumbEl,
                        domSafe.el('div', { className: 'tp-batch-word-blocks' }, blocosItem),
                        domSafe.el('span', { className: statusClass, text: item.statusBadge })
                    ]);
                });

                domSafe.setChildren(previewEl, [
                    domSafe.el('div', { className: 'tp-batch-preview-list' }, linhasLote)
                ]);
            }
        } else if (!analise.silabas || analise.silabas.length === 0) {
            domSafe.setChildren(previewEl, [
                domSafe.el('span', {
                    className: 'tp-preview-placeholder',
                    text: 'Confira a mensagem abaixo para ajustar a palavra.'
                })
            ]);
        } else {
            var blocksWrap = domSafe.el(
                'div',
                { className: 'tp-syl-preview-blocks' },
                analise.silabas.map(function (syl) {
                    return domSafe.el('span', { className: 'tp-syl-block', text: syl.toUpperCase() });
                })
            );
            var resumoTexto = analise.palavra.toUpperCase() + ' • ' +
                analise.silabas.length + (analise.silabas.length === 1 ? ' sílaba' : ' sílabas');

            domSafe.setChildren(previewEl, [
                blocksWrap,
                domSafe.el('span', { className: 'tp-preview-meta', text: resumoTexto })
            ]);
        }

        if (feedbackEl) {
            var modClass = 'is-idle';
            var iconSvg = SVGs.BOOK;

            if (analise.status === 'ok') {
                modClass = 'is-ok';
                iconSvg = SVGs.CHECK;
            } else if (analise.status === 'tip') {
                modClass = 'is-tip';
                iconSvg = SVGs.SPARKLE;
            } else if (analise.status !== 'empty') {
                modClass = 'is-warn';
                iconSvg = SVGs.ALERT;
            }

            feedbackEl.className = 'tp-syllable-feedback ' + modClass;
            domSafe.clear(feedbackEl);
            domSafe.appendSvg(feedbackEl, iconSvg);
            feedbackEl.appendChild(domSafe.el('span', { text: analise.msg }));
        }
    }

    /**
     * Constroi a faixa de ajuda visual rapida com exemplos de separacao por hifen.
     */
    function construirGuiaHifensDom() {
        var domSafe = getDomSafe();
        var exemplos = [
            { raw: 'CA-VA-LO', silabas: ['CA', 'VA', 'LO'] },
            { raw: 'PA-LHA-ÇO', silabas: ['PA', 'LHA', 'ÇO'] },
            { raw: 'SOR-RI-SO', silabas: ['SOR', 'RI', 'SO'] }
        ];

        var chipsExemplos = exemplos.map(function (ex) {
            var pedacos = [
                domSafe.el('span', { className: 'tp-hyphen-ex-raw', text: ex.raw }),
                domSafe.el('span', { className: 'tp-hyphen-ex-arrow', text: '→' })
            ];
            for (var i = 0; i < ex.silabas.length; i++) {
                pedacos.push(domSafe.el('span', { className: 'tp-hyphen-ex-chip', text: ex.silabas[i] }));
            }
            return domSafe.el('span', { className: 'tp-hyphen-ex' }, pedacos);
        });

        return domSafe.el('div', { className: 'tp-hyphen-guide' }, [
            domSafe.el('span', { className: 'tp-hyphen-guide-label', text: 'Exemplos com hífen:' }),
            domSafe.el('div', { className: 'tp-hyphen-examples' }, chipsExemplos)
        ]);
    }

    /**
     * Retorna mensagem acolhedora e objetiva sobre o progresso de 4 a 12 palavras.
     */
    function construirMensagemProgressoSemana(qtd, ativo) {
        if (ativo) {
            return 'Em uso nas 3 fases! As crianças estão praticando com a sua lista personalizada.';
        }
        if (qtd === 0) {
            return 'Cadastre 4 palavras abaixo para liberar o uso nas 3 fases (limite de 12).';
        }
        if (qtd < 4) {
            var faltam = 4 - qtd;
            return faltam === 1
                ? 'Falta só 1 palavra para liberar o uso nas 3 fases.'
                : ('Faltam ' + faltam + ' palavras para liberar o uso nas 3 fases.');
        }
        if (qtd < 6) {
            return 'Mínimo atingido! Você já pode ativar agora (dica: 6 a 8 palavras variam ainda mais as rodadas).';
        }
        if (qtd < 12) {
            return 'Ótima variedade! Tudo pronto para ativar nas 3 fases.';
        }
        return 'Lista completa (12 de 12)! Ative abaixo para usar nas 3 fases.';
    }

    function renderAbaPalavras(containerEl) {
        var Storage = getStorage();
        var domSafe = getDomSafe();
        if (!domSafe) return;

        if (!Storage) {
            domSafe.setChildren(containerEl, [
                createAlertBox(SVGs.ALERT, domSafe.el('span', { text: 'Módulo de armazenamento não encontrado.' }))
            ]);
            return;
        }

        var palavras = Storage.listarPalavrasSemana() || [];
        var ativo = !!Storage.isPalavrasSemanaAtivo();
        var config = Storage.getConfig() || {};
        var fase1Atual = String(config.fase1ModoSemana || 'dica').toLowerCase();
        var fase1Selected = fase1Atual.indexOf('silaba') !== -1 ? 'silaba' : 'dica';

        var isEditing = state.editingWordId !== null && state.editingWordId !== undefined;
        var limiteAtingido = palavras.length >= 12;
        var bloquearCadastro = !isEditing && limiteAtingido;

        /* --- Cartao 1: Progresso e Ativacao --- */
        var statusCardClass = 'tp-card tp-weekly-status-card ' +
            (ativo ? 'is-active' : (palavras.length >= 4 ? 'is-ready' : 'is-building'));

        var degrausNodes = [];
        for (var d = 1; d <= 4; d++) {
            degrausNodes.push(domSafe.el('span', {
                className: 'tp-weekly-step-dot' + (palavras.length >= d ? ' is-filled' : ''),
                text: String(d),
                'aria-hidden': 'true'
            }));
        }

        var progressBox = domSafe.el('div', { className: 'tp-weekly-progress-box' }, [
            domSafe.el('div', {
                className: 'tp-weekly-steps',
                role: 'img',
                'aria-label': 'Progresso mínimo: ' + Math.min(palavras.length, 4) + ' de 4 palavras'
            }, degrausNodes),
            domSafe.el('p', {
                className: 'tp-weekly-progress-msg',
                text: construirMensagemProgressoSemana(palavras.length, ativo)
            })
        ]);

        var quickActivateRow = (palavras.length >= 4 && !ativo)
            ? domSafe.el('div', { className: 'tp-weekly-quick-row' }, [
                createIconButton({
                    type: 'button',
                    id: 'tpQuickActivateWeeklyBtn',
                    className: 'tp-btn tp-btn-primary tp-weekly-quick-btn'
                }, SVGs.SPARKLE, 'Ativar agora nas 3 fases')
            ])
            : null;

        var titleAtivacao = domSafe.el('h3', { className: 'tp-card-title' });
        domSafe.appendSvg(titleAtivacao, SVGs.BOOK);
        titleAtivacao.appendChild(domSafe.el('span', { text: 'Palavras da Semana' }));

        var fase1SelectEl = domSafe.el('select', { id: 'tpFase1ModeSelect', className: 'tp-select' }, [
            domSafe.el('option', {
                value: 'dica',
                selected: fase1Selected === 'dica',
                text: 'Figurinha ou dica curta (ou 1ª sílaba se ficar em branco)'
            }),
            domSafe.el('option', {
                value: 'silaba',
                selected: fase1Selected === 'silaba',
                text: 'Sempre a 1ª sílaba'
            })
        ]);
        fase1SelectEl.value = fase1Selected;

        var cardProgresso = domSafe.el('div', { className: statusCardClass }, [
            domSafe.el('div', { className: 'tp-card-header-row' }, [
                titleAtivacao,
                domSafe.el('span', {
                    className: 'tp-count-badge',
                    text: palavras.length + ' de 12 ' + (palavras.length === 1 ? 'palavra' : 'palavras')
                })
            ]),
            progressBox,
            quickActivateRow,
            domSafe.el('div', { className: 'tp-switch-row' }, [
                domSafe.el('div', { className: 'tp-switch-info' }, [
                    domSafe.el('span', { className: 'tp-switch-title', text: 'Ativar lista personalizada nas 3 fases' }),
                    domSafe.el('span', {
                        className: 'tp-switch-desc',
                        text: 'Usar minhas palavras no lugar de Saúde Bucal.'
                    })
                ]),
                domSafe.el('button', {
                    type: 'button',
                    id: 'tpToggleWeeklyBtn',
                    className: 'tp-toggle-btn' + (ativo ? ' is-on' : ''),
                    'aria-pressed': ativo ? 'true' : 'false'
                }, [
                    domSafe.el('span', { className: 'tp-toggle-track' }, [
                        domSafe.el('span', { className: 'tp-toggle-thumb' })
                    ]),
                    domSafe.el('span', { text: ativo ? 'Ativado' : 'Desativado' })
                ])
            ]),
            domSafe.el('div', { className: 'tp-field' }, [
                domSafe.el('label', {
                    className: 'tp-label',
                    for: 'tpFase1ModeSelect',
                    text: 'Na Fase 1 (Memória), combinar cada palavra com:'
                }),
                fase1SelectEl
            ])
        ]);

        /* --- Cartao 2: Cadastro Agil e Edicao Rapida --- */
        var titleForm = domSafe.el('h3', { className: 'tp-card-title' });
        domSafe.appendSvg(titleForm, isEditing ? SVGs.EDIT : SVGs.SPARKLE);
        titleForm.appendChild(domSafe.el('span', { text: isEditing ? 'Editando Palavra' : 'Nova Palavra da Semana' }));

        var editingBadge = isEditing
            ? domSafe.el('span', {
                className: 'tp-editing-badge',
                text: 'Em edição: ' + (state.draftSilabasRaw ? state.draftSilabasRaw.toUpperCase() : 'palavra selecionada')
            })
            : null;

        var avisoLimiteNode = bloquearCadastro
            ? createAlertBox(
                SVGs.ALERT,
                domSafe.el('span', { text: 'Você já cadastrou 12 palavras (limite máximo). Edite ou remova uma palavra abaixo para adicionar outra.' }),
                'tp-alert-info'
            )
            : null;

        var analiseInicial = analisarEntradaPalavras(state.draftEntrada, state.draftSilabasRaw, palavras, state.editingWordId);
        if (!state.manualSyllablesEdited && analiseInicial.tipo === 'single' && analiseInicial.silabasRaw) {
            state.draftSilabasRaw = analiseInicial.silabasRaw;
        }

        var ocultarControlesPalavraUnica = Boolean(analiseInicial.ehLote);
        var mostrarManual = Boolean(state.manualSyllablesOpen && !ocultarControlesPalavraUnica);
        var mostrarOpcionais = Boolean((state.optionalFieldsOpen || state.draftDica || state.draftFrase) && !ocultarControlesPalavraUnica);

        var cardFormulario = domSafe.el('div', {
            id: 'tpWordFormCard',
            className: 'tp-card' + (isEditing ? ' is-editing' : '')
        }, [
            domSafe.el('div', { className: 'tp-card-header-row' }, [titleForm, editingBadge]),
            avisoLimiteNode,
            domSafe.el('div', { className: 'tp-form-grid' }, [
                domSafe.el('div', { className: 'tp-field tp-field-full' }, [
                    domSafe.el('label', {
                        className: 'tp-label',
                        for: 'tpWordSyllablesInput',
                        text: isEditing
                            ? 'Palavra em edição'
                            : 'Digite uma palavra (ou várias separadas por espaço, vírgula ou linha)'
                    }),
                    domSafe.el('textarea', {
                        id: 'tpWordSyllablesInput',
                        className: 'tp-input tp-upper tp-word-entry-input',
                        rows: '1',
                        value: String(state.draftEntrada || ''),
                        placeholder: isEditing
                            ? 'Ex.: CAVALO'
                            : 'Ex.: CAVALO ou CAVALO, MORANGO, PÊSSEGO',
                        maxlength: '320',
                        autocomplete: 'off',
                        disabled: bloquearCadastro
                    }),
                    domSafe.el('div', { id: 'tpSyllablePreview', className: 'tp-syllable-preview' }),
                    domSafe.el('div', { id: 'tpSyllableFeedback', className: 'tp-syllable-feedback is-idle', role: 'status', 'aria-live': 'polite' })
                ]),
                domSafe.el('div', {
                    id: 'tpStickerFieldWrap',
                    className: 'tp-field tp-field-full tp-sticker-field-wrap' + (ocultarControlesPalavraUnica ? ' u-hidden' : '')
                }, [
                    domSafe.el('div', { className: 'tp-sticker-preview-bar' }, [
                        domSafe.el('div', { id: 'tpStickerPreviewThumb', className: 'tp-sticker-thumb-lg is-default' }),
                        domSafe.el('div', { className: 'tp-sticker-preview-info' }, [
                            domSafe.el('strong', { id: 'tpStickerPreviewTitle', className: 'tp-sticker-preview-title', text: 'Ilustração da palavra' }),
                            domSafe.el('span', { id: 'tpStickerPreviewSubtitle', className: 'tp-field-hint', text: 'Digite uma palavra para combinar automaticamente ou escolha na galeria.' })
                        ]),
                        domSafe.el('div', { className: 'tp-sticker-preview-actions' }, [
                            domSafe.el('button', {
                                type: 'button',
                                id: 'tpToggleStickerGalleryBtn',
                                className: 'tp-btn tp-btn-outline tp-btn-sm',
                                'aria-expanded': state.stickerGalleryOpen ? 'true' : 'false',
                                text: state.stickerGalleryOpen ? 'Fechar galeria' : 'Escolher figurinha',
                                disabled: bloquearCadastro
                            }),
                            domSafe.el('button', {
                                type: 'button',
                                id: 'tpResetStickerAutoBtn',
                                className: 'tp-btn tp-btn-outline tp-btn-sm u-hidden',
                                text: 'Sem figurinha',
                                disabled: bloquearCadastro
                            })
                        ])
                    ]),
                    domSafe.el('div', {
                        id: 'tpStickerGalleryBox',
                        className: 'tp-sticker-gallery' + (state.stickerGalleryOpen && !ocultarControlesPalavraUnica ? '' : ' u-hidden')
                    })
                ]),
                domSafe.el('div', {
                    id: 'tpFormSecondaryToggles',
                    className: 'tp-field tp-field-full tp-form-secondary-toggles' + (ocultarControlesPalavraUnica ? ' u-hidden' : '')
                }, [
                    domSafe.el('button', {
                        type: 'button',
                        id: 'tpToggleManualSyllablesBtn',
                        className: 'tp-btn tp-btn-outline tp-btn-sm tp-optional-toggle',
                        'aria-expanded': mostrarManual ? 'true' : 'false',
                        text: mostrarManual ? 'Ocultar ajuste de sílabas' : 'Ajustar sílabas'
                    }),
                    domSafe.el('button', {
                        type: 'button',
                        id: 'tpToggleOptionalFieldsBtn',
                        className: 'tp-btn tp-btn-outline tp-btn-sm tp-optional-toggle',
                        'aria-expanded': mostrarOpcionais ? 'true' : 'false',
                        text: mostrarOpcionais ? 'Ocultar dica e frase (opcional)' : 'Adicionar dica ou frase (opcional)'
                    })
                ]),
                domSafe.el('div', {
                    id: 'tpManualSyllablesBox',
                    className: 'tp-field tp-field-full tp-manual-syllables-box' + (mostrarManual ? '' : ' u-hidden')
                }, [
                    domSafe.el('label', {
                        className: 'tp-label',
                        for: 'tpManualSyllablesInput',
                        text: 'Separação manual com hífen (opcional — só use se quiser corrigir alguma exceção)'
                    }),
                    domSafe.el('div', { className: 'tp-input-row' }, [
                        domSafe.el('input', {
                            id: 'tpManualSyllablesInput',
                            className: 'tp-input tp-upper',
                            type: 'text',
                            value: String(state.draftSilabasRaw || ''),
                            placeholder: 'Ex.: CA-VA-LO',
                            maxlength: '60',
                            autocomplete: 'off',
                            disabled: bloquearCadastro
                        }),
                        domSafe.el('button', {
                            type: 'button',
                            id: 'tpInsertHyphenBtn',
                            className: 'tp-btn tp-btn-outline tp-hyphen-btn',
                            text: '+ Hífen (-)',
                            disabled: bloquearCadastro
                        }),
                        domSafe.el('button', {
                            type: 'button',
                            id: 'tpResetAutoSyllablesBtn',
                            className: 'tp-btn tp-btn-outline tp-btn-sm',
                            text: 'Usar automático',
                            disabled: bloquearCadastro
                        })
                    ]),
                    construirGuiaHifensDom()
                ]),
                domSafe.el('div', {
                    id: 'tpOptionalFieldsBox',
                    className: 'tp-field tp-field-full tp-optional-fields' + (mostrarOpcionais ? '' : ' u-hidden')
                }, [
                    domSafe.el('div', { className: 'tp-field' }, [
                        domSafe.el('label', {
                            className: 'tp-label',
                            for: 'tpWordHintInput',
                            text: 'Dica curta (opcional — ajuda nas Fases 1 e 2)'
                        }),
                        domSafe.el('input', {
                            id: 'tpWordHintInput',
                            className: 'tp-input',
                            type: 'text',
                            value: String(state.draftDica || ''),
                            placeholder: 'Ex.: Animal que corre no campo',
                            maxlength: '90',
                            autocomplete: 'off',
                            disabled: bloquearCadastro
                        }),
                        domSafe.el('span', { className: 'tp-field-hint', text: 'Se deixar em branco, a Fase 1 usa a figurinha ou a 1ª sílaba.' })
                    ]),
                    domSafe.el('div', { className: 'tp-field' }, [
                        domSafe.el('label', {
                            className: 'tp-label',
                            for: 'tpWordPhraseInput',
                            text: 'Frase com espaço em branco (opcional — usada na Fase 3)'
                        }),
                        domSafe.el('div', { className: 'tp-input-row' }, [
                            domSafe.el('input', {
                                id: 'tpWordPhraseInput',
                                className: 'tp-input',
                                type: 'text',
                                value: String(state.draftFrase || ''),
                                placeholder: 'Ex.: O ___ galopa na fazenda.',
                                maxlength: '140',
                                autocomplete: 'off',
                                disabled: bloquearCadastro
                            }),
                            domSafe.el('button', {
                                type: 'button',
                                id: 'tpInsertBlankBtn',
                                className: 'tp-btn tp-btn-outline tp-btn-sm',
                                text: 'Inserir ___',
                                disabled: bloquearCadastro
                            })
                        ]),
                        domSafe.el('span', { className: 'tp-field-hint', text: 'Se deixar em branco, a Fase 3 usa a dica ou entra em modo ditado.' })
                    ])
                ])
            ]),
            domSafe.el('div', { className: 'tp-inline-actions' }, [
                createIconButton({
                    type: 'button',
                    id: 'tpSaveWordBtn',
                    className: 'tp-btn tp-btn-primary',
                    disabled: bloquearCadastro
                }, SVGs.CHECK, isEditing ? 'Salvar alterações' : 'Salvar palavra'),
                isEditing ? domSafe.el('button', { type: 'button', id: 'tpCancelEditWordBtn', className: 'tp-btn tp-btn-outline', text: 'Cancelar edição' }) : null
            ])
        ]);

        /* --- Cartao 3: Lista de Palavras Cadastradas --- */
        var listaNode;
        if (palavras.length === 0) {
            listaNode = createAlertBox(
                SVGs.BOOK,
                domSafe.el('span', { text: 'Sua lista ainda está vazia. Digite uma ou várias palavras acima para cadastrar.' }),
                'tp-alert-info'
            );
        } else {
            var wordNodes = palavras.map(function (item) {
                var id = item && item.id !== undefined ? String(item.id) : '';
                var silabas = getPalavraSilabas(item);
                var isItemEditing = isEditing && String(state.editingWordId) === id;
                var isConfirmingRemove = state.removeWordConfirmId !== null && String(state.removeWordConfirmId) === id;

                var chips = silabas.map(function (s) {
                    return domSafe.el('span', { className: 'tp-syl-chip', text: s.toUpperCase() });
                });

                var dicaTexto = item.dica && String(item.dica).trim()
                    ? String(item.dica).trim()
                    : 'Dica automática (figurinha ou 1ª sílaba)';

                var fraseTexto = item.frase && String(item.frase).trim()
                    ? String(item.frase).trim()
                    : (item.dica && String(item.dica).trim() ? 'Usa a dica na Fase 3' : 'Modo ditado na Fase 3');

                var itemClass = 'tp-word-item' +
                    (isItemEditing ? ' is-editing-item' : '') +
                    (isConfirmingRemove ? ' is-confirming-remove' : '');

                var removeBtn = createIconButton({
                    type: 'button',
                    className: 'tp-btn tp-btn-danger tp-btn-sm' + (isConfirmingRemove ? ' confirming' : ''),
                    'data-remove-word': id,
                    'aria-label': isConfirmingRemove ? 'Toque novamente para confirmar exclusão' : 'Remover palavra'
                }, isConfirmingRemove ? SVGs.ALERT : SVGs.TRASH, isConfirmingRemove ? 'Confirmar?' : 'Remover');

                var stkLista = resolverStickerVisual(item.plain || item.palavra || silabas.join(''), item.stickerId);
                var wordThumbEl = domSafe.el('div', {
                    className: 'tp-word-sticker-thumb ' + (stkLista.temSticker ? 'has-sticker' : 'is-default'),
                    title: stkLista.temSticker ? ('Figurinha: ' + stkLista.label) : 'Ícone padrão (caderninho)'
                });
                if (stkLista.svg) {
                    domSafe.setSvg(wordThumbEl, stkLista.svg);
                }

                return domSafe.el('div', { className: itemClass }, [
                    wordThumbEl,
                    domSafe.el('div', { className: 'tp-word-main' }, [
                        domSafe.el('div', { className: 'tp-word-syllables' }, chips),
                        domSafe.el('div', { className: 'tp-word-meta' }, [
                            domSafe.el('span', null, [domSafe.el('strong', { text: 'Dica:' }), ' ' + dicaTexto]),
                            domSafe.el('span', null, [domSafe.el('strong', { text: 'Frase:' }), ' ' + fraseTexto])
                        ])
                    ]),
                    domSafe.el('div', { className: 'tp-inline-actions' }, [
                        createIconButton({ type: 'button', className: 'tp-btn tp-btn-outline tp-btn-sm', 'data-edit-word': id }, SVGs.EDIT, 'Editar'),
                        removeBtn
                    ])
                ]);
            });
            listaNode = domSafe.el('div', { className: 'tp-word-list' }, wordNodes);
        }

        var titleLista = domSafe.el('h3', { className: 'tp-card-title' });
        domSafe.appendSvg(titleLista, SVGs.BOOK);
        titleLista.appendChild(domSafe.el('span', { text: 'Palavras Cadastradas' }));
        titleLista.appendChild(domSafe.text(' '));
        titleLista.appendChild(domSafe.el('span', { className: 'tp-count-badge', text: palavras.length + '/12' }));

        var cardLista = domSafe.el('div', { className: 'tp-card' }, [
            domSafe.el('div', { className: 'tp-card-header-row' }, [
                titleLista,
                palavras.length > 0 ? createIconButton({ type: 'button', id: 'tpClearWordsBtn', className: 'tp-btn tp-btn-danger tp-btn-sm' }, SVGs.TRASH, 'Limpar todas as palavras') : null
            ]),
            listaNode
        ]);

        domSafe.setChildren(containerEl, domSafe.el('div', { className: 'tp-section' }, [
            cardProgresso,
            cardFormulario,
            cardLista
        ]));

        /* --- Referencias e eventos da aba --- */
        var sylInput = containerEl.querySelector('#tpWordSyllablesInput');
        var manualInput = containerEl.querySelector('#tpManualSyllablesInput');
        var hintInput = containerEl.querySelector('#tpWordHintInput');
        var phraseInput = containerEl.querySelector('#tpWordPhraseInput');
        var previewEl = containerEl.querySelector('#tpSyllablePreview');
        var feedbackEl = containerEl.querySelector('#tpSyllableFeedback');
        var secondaryTogglesEl = containerEl.querySelector('#tpFormSecondaryToggles');
        var toggleManualBtn = containerEl.querySelector('#tpToggleManualSyllablesBtn');
        var manualBox = containerEl.querySelector('#tpManualSyllablesBox');
        var toggleOptionalBtn = containerEl.querySelector('#tpToggleOptionalFieldsBtn');
        var optionalBox = containerEl.querySelector('#tpOptionalFieldsBox');
        var stickerFieldWrap = containerEl.querySelector('#tpStickerFieldWrap');
        var stickerThumbEl = containerEl.querySelector('#tpStickerPreviewThumb');
        var stickerTitleEl = containerEl.querySelector('#tpStickerPreviewTitle');
        var stickerSubtitleEl = containerEl.querySelector('#tpStickerPreviewSubtitle');
        var toggleStickerGalleryBtn = containerEl.querySelector('#tpToggleStickerGalleryBtn');
        var resetStickerAutoBtn = containerEl.querySelector('#tpResetStickerAutoBtn');
        var stickerGalleryEl = containerEl.querySelector('#tpStickerGalleryBox');
        var saveWordBtn = containerEl.querySelector('#tpSaveWordBtn');

        function obterAnaliseAtualFormulario() {
            var eVal = sylInput ? sylInput.value : state.draftEntrada;
            var mVal = manualInput ? manualInput.value : state.draftSilabasRaw;
            return analisarEntradaPalavras(eVal, mVal, palavras, state.editingWordId);
        }

        function obterInfoStickerFormulario(analiseOpt) {
            var analiseRef = analiseOpt || obterAnaliseAtualFormulario();
            var palavraMatch = '';
            if (analiseRef && (analiseRef.plain || analiseRef.palavra)) {
                palavraMatch = analiseRef.plain || analiseRef.palavra;
            } else if (sylInput && sylInput.value) {
                palavraMatch = sylInput.value.trim();
            }
            var explicito = state.stickerManuallyChosen ? state.draftStickerId : null;
            return resolverStickerVisual(palavraMatch, explicito);
        }

        function renderGaleriaStickers(infoAtual) {
            if (!stickerGalleryEl) return;
            var Stickers = getStickers();
            if (!Stickers || typeof Stickers.getCategories !== 'function') {
                domSafe.setChildren(stickerGalleryEl, [
                    domSafe.el('span', { className: 'tp-field-hint', text: 'Biblioteca de figurinhas indisponível.' })
                ]);
                return;
            }

            var categorias = Stickers.getCategories() || [];
            if (categorias.length === 0) {
                domSafe.setChildren(stickerGalleryEl, [
                    domSafe.el('span', { className: 'tp-field-hint', text: 'Nenhuma categoria carregada.' })
                ]);
                return;
            }

            var catAtiva = null;
            for (var cIdx = 0; cIdx < categorias.length; cIdx++) {
                if (categorias[cIdx].id === state.stickerActiveCategory) {
                    catAtiva = categorias[cIdx];
                    break;
                }
            }
            if (!catAtiva) {
                catAtiva = categorias[0];
                state.stickerActiveCategory = catAtiva.id;
            }

            var tabBtns = categorias.map(function (cat) {
                var ativo = cat.id === catAtiva.id;
                return domSafe.el('button', {
                    type: 'button',
                    className: 'tp-sticker-cat-tab' + (ativo ? ' is-active' : ''),
                    'data-sticker-cat': cat.id,
                    'aria-pressed': ativo ? 'true' : 'false',
                    text: cat.label + ' (' + cat.items.length + ')',
                    disabled: bloquearCadastro
                });
            });

            var semStickerSelecionado = state.stickerManuallyChosen && state.draftStickerId === 'none';
            var noneThumb = domSafe.el('span', { className: 'tp-sticker-none-thumb' });
            var notebookSvg = (Storage && Storage.SVGs && Storage.SVGs.ILUSTRACAO_SEMANA)
                ? Storage.SVGs.ILUSTRACAO_SEMANA
                : SVGs.BOOK;
            domSafe.setSvg(noneThumb, notebookSvg);

            var noneBtn = domSafe.el('button', {
                type: 'button',
                className: 'tp-sticker-none-btn' + (semStickerSelecionado ? ' is-selected' : ''),
                'data-select-sticker': 'none',
                'aria-pressed': semStickerSelecionado ? 'true' : 'false',
                disabled: bloquearCadastro
            }, [
                noneThumb,
                domSafe.el('span', { text: 'Sem figurinha (padrão)' })
            ]);

            var tabsHeader = domSafe.el('div', { className: 'tp-sticker-gallery-head' }, [
                domSafe.el('div', { className: 'tp-sticker-tabs' }, tabBtns),
                noneBtn
            ]);

            var idSelecionadoAtual = infoAtual && infoAtual.temSticker ? infoAtual.stickerId : null;
            var gridCards = catAtiva.items.map(function (stk) {
                var isSelected = idSelecionadoAtual === stk.id;
                var optThumb = domSafe.el('span', { className: 'tp-sticker-option-thumb' });
                domSafe.setSvg(optThumb, stk.svg);
                return domSafe.el('button', {
                    type: 'button',
                    className: 'tp-sticker-option' + (isSelected ? ' is-selected' : ''),
                    'data-select-sticker': stk.id,
                    'aria-pressed': isSelected ? 'true' : 'false',
                    title: stk.label,
                    disabled: bloquearCadastro
                }, [
                    optThumb,
                    domSafe.el('span', { className: 'tp-sticker-option-label', text: stk.label })
                ]);
            });

            var gridEl = domSafe.el('div', { className: 'tp-sticker-grid' }, gridCards);
            domSafe.setChildren(stickerGalleryEl, [tabsHeader, gridEl]);
        }

        function atualizarStickerUI(analiseOpt) {
            var ehLote = Boolean(analiseOpt && analiseOpt.ehLote);
            if (stickerFieldWrap) {
                stickerFieldWrap.classList.toggle('u-hidden', ehLote);
            }
            if (ehLote) return;

            var info = obterInfoStickerFormulario(analiseOpt);
            if (stickerThumbEl) {
                stickerThumbEl.className = 'tp-sticker-thumb-lg ' + (info.temSticker ? 'has-sticker' : 'is-default');
                if (info.svg) {
                    domSafe.setSvg(stickerThumbEl, info.svg);
                }
            }
            if (stickerTitleEl && stickerSubtitleEl) {
                if (info.temSticker && info.automatico) {
                    stickerTitleEl.textContent = 'Figurinha combinada: ' + info.label;
                    stickerSubtitleEl.textContent = 'Encontrada automaticamente! Aparece na Fase 1 (Memória) e nas Fases 2 e 3.';
                } else if (info.temSticker) {
                    stickerTitleEl.textContent = 'Figurinha escolhida: ' + info.label;
                    stickerSubtitleEl.textContent = 'Usada como figura na Fase 1 (se o modo não for Sílaba Inicial) e nas Fases 2 e 3.';
                } else if (state.stickerManuallyChosen && state.draftStickerId === 'none') {
                    stickerTitleEl.textContent = 'Sem figurinha (ícone padrão do caderninho)';
                    stickerSubtitleEl.textContent = 'Esta palavra usará apenas dica ou sílaba inicial na Fase 1.';
                } else {
                    stickerTitleEl.textContent = 'Nenhuma figurinha automática para esta palavra';
                    stickerSubtitleEl.textContent = 'Usará o caderninho padrão, ou você pode escolher uma figurinha na galeria.';
                }
            }
            if (toggleStickerGalleryBtn) {
                toggleStickerGalleryBtn.setAttribute('aria-expanded', state.stickerGalleryOpen ? 'true' : 'false');
                toggleStickerGalleryBtn.textContent = state.stickerGalleryOpen ? 'Fechar galeria' : 'Escolher figurinha';
            }
            if (resetStickerAutoBtn) {
                var analiseWord = analiseOpt && (analiseOpt.plain || analiseOpt.palavra)
                    ? (analiseOpt.plain || analiseOpt.palavra)
                    : '';
                var temAutoParaPalavra = Boolean(analiseWord && resolverStickerVisual(analiseWord, null).temSticker);
                if (state.stickerManuallyChosen && state.draftStickerId === 'none' && temAutoParaPalavra) {
                    resetStickerAutoBtn.textContent = 'Usar automática';
                    resetStickerAutoBtn.classList.remove('u-hidden');
                } else if (info.temSticker) {
                    resetStickerAutoBtn.textContent = 'Sem figurinha';
                    resetStickerAutoBtn.classList.remove('u-hidden');
                } else {
                    resetStickerAutoBtn.classList.add('u-hidden');
                }
            }
            if (stickerGalleryEl) {
                stickerGalleryEl.classList.toggle('u-hidden', !state.stickerGalleryOpen);
                if (state.stickerGalleryOpen) {
                    renderGaleriaStickers(info);
                }
            }
        }

        function atualizarEstadoBotaoSalvar(analise) {
            if (!saveWordBtn) return;
            var labelBtn = isEditing ? 'Salvar alterações' : 'Salvar palavra';
            var desabilitar = bloquearCadastro;

            if (analise && analise.ehLote) {
                var qtdProntas = analise.prontasCount || 0;
                labelBtn = 'Cadastrar ' + qtdProntas + (qtdProntas === 1 ? ' palavra' : ' palavras');
                desabilitar = bloquearCadastro || isEditing || qtdProntas === 0;
            }

            setBtnIconText(saveWordBtn, SVGs.CHECK, labelBtn);
            saveWordBtn.disabled = desabilitar;
        }

        function atualizarPreviewFormulario(sincronizarCampoManual) {
            var entradaAtual = sylInput ? sylInput.value : '';
            var manualAtual = manualInput ? manualInput.value : state.draftSilabasRaw;
            var analise = analisarEntradaPalavras(entradaAtual, manualAtual, palavras, state.editingWordId);

            if (sincronizarCampoManual && !state.manualSyllablesEdited) {
                var novoRaw = (analise.tipo === 'single' && analise.silabasRaw) ? analise.silabasRaw : '';
                state.draftSilabasRaw = novoRaw;
                if (manualInput) {
                    manualInput.value = novoRaw;
                }
            }

            renderPreviewEntrada(previewEl, feedbackEl, analise);

            var ehLoteAtual = Boolean(analise.ehLote);
            if (secondaryTogglesEl) {
                secondaryTogglesEl.classList.toggle('u-hidden', ehLoteAtual);
            }
            if (manualBox) {
                var abrirManual = Boolean(state.manualSyllablesOpen && !ehLoteAtual);
                manualBox.classList.toggle('u-hidden', !abrirManual);
            }
            if (optionalBox) {
                var abrirOpc = Boolean((state.optionalFieldsOpen || state.draftDica || state.draftFrase) && !ehLoteAtual);
                optionalBox.classList.toggle('u-hidden', !abrirOpc);
            }

            atualizarStickerUI(analise);
            atualizarEstadoBotaoSalvar(analise);
            return analise;
        }

        atualizarPreviewFormulario(false);

        function alternarModoSemanal(novoEstado) {
            var listaAtual = Storage.listarPalavrasSemana() || [];
            if (novoEstado && listaAtual.length < 4) {
                showToast('Cadastre pelo menos 4 palavras antes de ativar (recomendado: 6 a 8).', 'error');
                return;
            }

            var res = extrairResultado(Storage.setPalavrasSemanaAtivo(Boolean(novoEstado)));
            if (!res.ok) {
                showToast(res.erro, 'error');
                return;
            }

            state.hasConfigChanges = true;
            TeacherPanel.atualizarIndicadoresMenu();
            showToast(novoEstado ? 'Palavras da Semana ativadas nas 3 fases!' : 'Palavras da Semana desativadas.', 'success');
            renderAbaPalavras(containerEl);
        }

        function limparRascunhoFormulario() {
            state.editingWordId = null;
            state.draftEntrada = '';
            state.draftSilabasRaw = '';
            state.draftDica = '';
            state.draftFrase = '';
            state.manualSyllablesOpen = false;
            state.manualSyllablesEdited = false;
            state.optionalFieldsOpen = false;
            state.draftStickerId = null;
            state.stickerManuallyChosen = false;
            state.stickerGalleryOpen = false;
        }

        function salvarPalavraFormulario() {
            var listaAtual = Storage.listarPalavrasSemana() || [];
            if (!isEditing && listaAtual.length >= 12) {
                showToast('Limite máximo de 12 palavras atingido. Edite ou remova uma palavra abaixo.', 'error');
                return;
            }

            var entradaAtual = sylInput ? sylInput.value : '';
            var manualAtual = manualInput ? manualInput.value : state.draftSilabasRaw;
            var analise = analisarEntradaPalavras(entradaAtual, manualAtual, listaAtual, state.editingWordId);

            if (analise.tipo === 'empty') {
                showToast('Digite pelo menos uma palavra antes de salvar.', 'error');
                if (sylInput) sylInput.focus();
                return;
            }

            /* Fluxo em lote */
            if (analise.ehLote) {
                if (isEditing) {
                    showToast('Conclua ou cancele a edição antes de cadastrar várias palavras de uma vez.', 'error');
                    return;
                }
                if (!analise.prontasParaSalvar || analise.prontasParaSalvar.length === 0) {
                    showToast(analise.msg || 'Nenhuma palavra nova disponível para cadastrar.', 'error');
                    if (sylInput) sylInput.focus();
                    return;
                }

                var qtdAntesLote = listaAtual.length;
                var estavaAtivoAntes = !!Storage.isPalavrasSemanaAtivo();
                var adicionadas = 0;

                for (var idxL = 0; idxL < analise.prontasParaSalvar.length; idxL++) {
                    var itemLote = analise.prontasParaSalvar[idxL];
                    var resLote = extrairResultado(Storage.adicionarPalavraSemana({
                        silabasRaw: itemLote.silabasRaw,
                        dica: '',
                        frase: '',
                        stickerId: null
                    }));
                    if (resLote.ok) {
                        adicionadas += 1;
                    }
                }

                if (adicionadas === 0) {
                    showToast('Não foi possível cadastrar as palavras informadas.', 'error');
                    return;
                }

                limparRascunhoFormulario();
                resetRemoveWordConfirmation();
                state.hasConfigChanges = true;
                TeacherPanel.atualizarIndicadoresMenu();

                var listaAposLote = Storage.listarPalavrasSemana() || [];
                var cruzouQuatro = qtdAntesLote < 4 && listaAposLote.length >= 4 && !estavaAtivoAntes;
                var msgLote = adicionadas + (adicionadas === 1 ? ' palavra cadastrada!' : ' palavras cadastradas!');
                if (cruzouQuatro) {
                    msgLote += ' Agora você já pode ativar nas 3 fases.';
                }
                showToast(msgLote, 'success');

                renderAbaPalavras(containerEl);
                var nextInputLote = containerEl.querySelector('#tpWordSyllablesInput');
                if (nextInputLote && !nextInputLote.disabled) {
                    nextInputLote.focus();
                }
                return;
            }

            /* Fluxo de palavra unica */
            if (!analise.pronto || !analise.silabasRaw) {
                showToast(analise.msg || 'Confira a palavra digitada antes de salvar.', 'error');
                if (state.manualSyllablesEdited && manualInput) {
                    manualInput.focus();
                } else if (sylInput) {
                    sylInput.focus();
                }
                return;
            }

            var dica = hintInput ? hintInput.value.trim() : '';
            var frase = phraseInput ? phraseInput.value.trim() : '';

            var payload = {
                silabasRaw: analise.silabasRaw,
                dica: dica,
                frase: frase,
                stickerId: state.stickerManuallyChosen ? state.draftStickerId : null
            };

            var wasEditing = isEditing;
            var rawRes = wasEditing
                ? Storage.atualizarPalavraSemana(state.editingWordId, payload)
                : Storage.adicionarPalavraSemana(payload);

            var parsed = extrairResultado(rawRes);
            if (!parsed.ok) {
                showToast(parsed.erro, 'error');
                if (sylInput) sylInput.focus();
                return;
            }

            limparRascunhoFormulario();
            resetRemoveWordConfirmation();
            state.hasConfigChanges = true;
            TeacherPanel.atualizarIndicadoresMenu();

            var listaApos = Storage.listarPalavrasSemana() || [];
            if (!wasEditing && listaApos.length === 4 && !Storage.isPalavrasSemanaAtivo()) {
                showToast('4ª palavra salva! Agora você já pode ativar nas 3 fases.', 'success');
            } else {
                showToast(wasEditing ? 'Palavra atualizada!' : 'Palavra cadastrada com sucesso!', 'success');
            }

            renderAbaPalavras(containerEl);
            var nextSylInput = containerEl.querySelector('#tpWordSyllablesInput');
            if (nextSylInput && !nextSylInput.disabled) {
                nextSylInput.focus();
            }
        }

        if (sylInput) {
            sylInput.addEventListener('input', function () {
                var plainAnterior = normalizarPlainTexto(state.draftEntrada);
                state.draftEntrada = sylInput.value;
                var plainNovo = normalizarPlainTexto(state.draftEntrada);

                if (plainAnterior !== plainNovo) {
                    state.manualSyllablesEdited = false;
                    if (!isEditing && !plainNovo) {
                        state.draftStickerId = null;
                        state.stickerManuallyChosen = false;
                    }
                }
                atualizarPreviewFormulario(true);
            });
            sylInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    salvarPalavraFormulario();
                }
            });
        }

        if (manualInput) {
            manualInput.addEventListener('input', function () {
                state.draftSilabasRaw = manualInput.value;
                state.manualSyllablesEdited = manualInput.value.trim().length > 0;
                atualizarPreviewFormulario(false);
            });
            manualInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    salvarPalavraFormulario();
                }
            });
        }

        var insertHyphenBtn = containerEl.querySelector('#tpInsertHyphenBtn');
        if (insertHyphenBtn && manualInput) {
            insertHyphenBtn.addEventListener('click', function () {
                if (manualInput.disabled) return;
                var val = manualInput.value || '';
                var start = typeof manualInput.selectionStart === 'number' ? manualInput.selectionStart : val.length;
                var end = typeof manualInput.selectionEnd === 'number' ? manualInput.selectionEnd : val.length;
                var before = val.slice(0, start);
                var after = val.slice(end);

                if (before.length === 0) {
                    manualInput.focus();
                    return;
                }
                if (before.charAt(before.length - 1) === '-' || after.charAt(0) === '-') {
                    manualInput.focus();
                    if (typeof manualInput.setSelectionRange === 'function') {
                        var pos = before.charAt(before.length - 1) === '-' ? start : start + 1;
                        manualInput.setSelectionRange(pos, pos);
                    }
                    return;
                }

                manualInput.value = before + '-' + after;
                state.draftSilabasRaw = manualInput.value;
                state.manualSyllablesEdited = true;
                atualizarPreviewFormulario(false);

                var nextPos = before.length + 1;
                manualInput.focus();
                if (typeof manualInput.setSelectionRange === 'function') {
                    manualInput.setSelectionRange(nextPos, nextPos);
                }
            });
        }

        var resetAutoBtn = containerEl.querySelector('#tpResetAutoSyllablesBtn');
        if (resetAutoBtn) {
            resetAutoBtn.addEventListener('click', function () {
                state.manualSyllablesEdited = false;
                atualizarPreviewFormulario(true);
                if (manualInput) {
                    manualInput.focus();
                }
            });
        }

        if (toggleManualBtn && manualBox) {
            toggleManualBtn.addEventListener('click', function () {
                var abrir = manualBox.classList.contains('u-hidden');
                state.manualSyllablesOpen = abrir;
                manualBox.classList.toggle('u-hidden', !abrir);
                toggleManualBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
                toggleManualBtn.textContent = abrir ? 'Ocultar ajuste de sílabas' : 'Ajustar sílabas';
                if (abrir && manualInput) {
                    if (!state.manualSyllablesEdited && sylInput) {
                        var analiseSinc = analisarEntradaPalavras(sylInput.value, '', palavras, state.editingWordId);
                        if (analiseSinc.tipo === 'single' && analiseSinc.silabasRaw) {
                            manualInput.value = analiseSinc.silabasRaw;
                            state.draftSilabasRaw = analiseSinc.silabasRaw;
                        }
                    }
                    manualInput.focus();
                }
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

        if (toggleOptionalBtn && optionalBox) {
            toggleOptionalBtn.addEventListener('click', function () {
                var abrir = optionalBox.classList.contains('u-hidden');
                state.optionalFieldsOpen = abrir;
                optionalBox.classList.toggle('u-hidden', !abrir);
                toggleOptionalBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
                toggleOptionalBtn.textContent = abrir
                    ? 'Ocultar dica e frase (opcional)'
                    : 'Adicionar dica ou frase (opcional)';
            });
        }

        if (toggleStickerGalleryBtn && stickerGalleryEl) {
            toggleStickerGalleryBtn.addEventListener('click', function () {
                if (bloquearCadastro) return;
                state.stickerGalleryOpen = !state.stickerGalleryOpen;
                if (state.stickerGalleryOpen) {
                    var infoAtual = obterInfoStickerFormulario();
                    if (infoAtual && infoAtual.category) {
                        state.stickerActiveCategory = infoAtual.category;
                    }
                }
                atualizarStickerUI(obterAnaliseAtualFormulario());
            });
        }

        if (resetStickerAutoBtn) {
            resetStickerAutoBtn.addEventListener('click', function () {
                if (bloquearCadastro) return;
                if (state.stickerManuallyChosen && state.draftStickerId === 'none') {
                    state.draftStickerId = null;
                    state.stickerManuallyChosen = false;
                } else {
                    state.draftStickerId = 'none';
                    state.stickerManuallyChosen = true;
                }
                atualizarStickerUI(obterAnaliseAtualFormulario());
            });
        }

        if (stickerGalleryEl) {
            stickerGalleryEl.addEventListener('click', function (e) {
                if (bloquearCadastro) return;
                var target = e.target && typeof e.target.closest === 'function' ? e.target : null;
                if (!target) return;

                var catBtn = target.closest('[data-sticker-cat]');
                if (catBtn) {
                    var catId = catBtn.getAttribute('data-sticker-cat');
                    if (catId) {
                        state.stickerActiveCategory = catId;
                        renderGaleriaStickers(obterInfoStickerFormulario());
                    }
                    return;
                }

                var optBtn = target.closest('[data-select-sticker]');
                if (optBtn) {
                    var stkId = optBtn.getAttribute('data-select-sticker');
                    if (stkId === 'none') {
                        state.draftStickerId = 'none';
                        state.stickerManuallyChosen = true;
                    } else if (stkId) {
                        state.draftStickerId = stkId;
                        state.stickerManuallyChosen = true;
                    }
                    state.stickerGalleryOpen = false;
                    atualizarStickerUI(obterAnaliseAtualFormulario());
                }
            });
        }

        /* Botao auxiliar "Inserir ___" */
        var insertBlankBtn = containerEl.querySelector('#tpInsertBlankBtn');
        if (insertBlankBtn && phraseInput) {
            insertBlankBtn.addEventListener('click', function () {
                if (phraseInput.disabled) return;
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

        /* Ativacao imediata pelo botao destaque ou switch */
        var quickActivateBtn = containerEl.querySelector('#tpQuickActivateWeeklyBtn');
        if (quickActivateBtn) {
            quickActivateBtn.addEventListener('click', function () {
                alternarModoSemanal(true);
            });
        }

        var toggleWeeklyBtn = containerEl.querySelector('#tpToggleWeeklyBtn');
        if (toggleWeeklyBtn) {
            toggleWeeklyBtn.addEventListener('click', function () {
                alternarModoSemanal(!Storage.isPalavrasSemanaAtivo());
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
        if (saveWordBtn) {
            saveWordBtn.addEventListener('click', salvarPalavraFormulario);
        }

        /* Cancelar edicao */
        var cancelEditBtn = containerEl.querySelector('#tpCancelEditWordBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function () {
                limparRascunhoFormulario();
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

                    resetRemoveWordConfirmation();
                    state.editingWordId = found.id;
                    state.draftEntrada = found.palavra || getPalavraSilabas(found).join('');
                    state.draftSilabasRaw = found.silabasRaw || getPalavraSilabas(found).join('-');
                    state.draftDica = found.dica || '';
                    state.draftFrase = found.frase || '';

                    var helperLocal = getSyllableHelper();
                    var autoFormatada = (helperLocal && typeof helperLocal.formatarComHifens === 'function')
                        ? helperLocal.formatarComHifens(state.draftEntrada)
                        : state.draftSilabasRaw;
                    state.manualSyllablesEdited = Boolean(
                        state.draftSilabasRaw && autoFormatada && state.draftSilabasRaw !== autoFormatada
                    );
                    state.manualSyllablesOpen = false;
                    state.optionalFieldsOpen = Boolean(state.draftDica || state.draftFrase);
                    state.stickerGalleryOpen = false;
                    if (found.stickerId === 'none') {
                        state.draftStickerId = 'none';
                        state.stickerManuallyChosen = true;
                    } else if (typeof found.stickerId === 'string' && found.stickerId.trim()) {
                        state.draftStickerId = found.stickerId.trim().toLowerCase();
                        state.stickerManuallyChosen = true;
                        var StickersEdit = getStickers();
                        var stkEdit = StickersEdit && typeof StickersEdit.getById === 'function'
                            ? StickersEdit.getById(state.draftStickerId)
                            : null;
                        if (stkEdit && stkEdit.category) {
                            state.stickerActiveCategory = stkEdit.category;
                        }
                    } else {
                        state.draftStickerId = null;
                        state.stickerManuallyChosen = false;
                    }
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

        /* Botoes Remover palavra (confirmacao em 2 toques / 3,5s) */
        var removeBtns = containerEl.querySelectorAll('[data-remove-word]');
        for (var m = 0; m < removeBtns.length; m++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var targetId = btn.getAttribute('data-remove-word');
                    if (state.removeWordConfirmId !== targetId) {
                        resetRemoveWordConfirmation();
                        state.removeWordConfirmId = targetId;
                        state.removeWordTimer = global.setTimeout(function () {
                            state.removeWordConfirmId = null;
                            state.removeWordTimer = null;
                            if (state.activeTab === 'palavras' && TeacherPanel.isOpen()) {
                                renderAbaPalavras(containerEl);
                            }
                        }, 3500);
                        renderAbaPalavras(containerEl);
                        return;
                    }

                    resetRemoveWordConfirmation();
                    var remRes = Storage.removerPalavraSemana(targetId);

                    if (String(state.editingWordId) === String(targetId)) {
                        limparRascunhoFormulario();
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
                    setBtnIconText(clearWordsBtn, SVGs.ALERT, 'Toque novamente para confirmar');

                    if (state.clearWordsTimer) {
                        global.clearTimeout(state.clearWordsTimer);
                    }
                    state.clearWordsTimer = global.setTimeout(function () {
                        resetClearWordsConfirmation();
                    }, 4000);
                    return;
                }

                resetClearWordsConfirmation();
                resetRemoveWordConfirmation();
                Storage.limparPalavrasSemana();
                if (Storage.isPalavrasSemanaAtivo()) {
                    Storage.setPalavrasSemanaAtivo(false);
                }
                limparRascunhoFormulario();
                state.hasConfigChanges = true;
                TeacherPanel.atualizarIndicadoresMenu();
                showToast('Todas as palavras da semana foram removidas.');
                renderAbaPalavras(containerEl);
            });
        }
    }

    /* --- Aba 3: Evolucao e Dificuldades --- */
    function renderAbaEvolucao(containerEl) {
        var domSafe = getDomSafe();
        if (!domSafe) return;

        var mountEl = domSafe.el('div', { id: 'tpEvolutionMount' });
        domSafe.setChildren(containerEl, [
            domSafe.el('div', { className: 'tp-section' }, [mountEl])
        ]);

        if (SaudeEscola.EvolutionView && typeof SaudeEscola.EvolutionView.render === 'function') {
            SaudeEscola.EvolutionView.render(mountEl);
        } else {
            domSafe.setChildren(mountEl, [
                createAlertBox(SVGs.ALERT, domSafe.el('span', { text: 'Visualização de evolução indisponível no momento.' }))
            ]);
        }
    }

    /* ----------------------------------------------------------------------
       5. API Publica: window.SaudeEscola.TeacherPanel
       ---------------------------------------------------------------------- */
    /**
     * Contrato público de SaudeEscola.TeacherPanel.
     *
     * init(options) prepara o painel e liga a proteção de três segundos.
     * open(abaInicial) e close() controlam o modal e restauram o foco.
     * atualizarIndicadoresMenu() sincroniza o selo sem alterar dados.
     * renderizarSugestoesRanking(...) prepara sugestões em modo Aula.
     *
     * A persistência é delegada a Storage; gráficos são delegados a EvolutionView;
     * períodos são delegados a Periods; o silabador é delegado a SyllableHelper.
     * Caso um auxiliar não esteja carregado, a função retorna UI segura ou omite
     * o recurso dependente, sem lançar erro ou alterar a sessão em andamento.
     */
    var TeacherPanel = {
        /**
         * Inicializa o painel, eventos de segurar 3s no botao de engrenagem e indicadores.
         *
         * Parâmetros: options.onConfigChanged é callback opcional chamado ao fechar
         * o painel quando houve alteração configurada. Retorno: undefined.
         * Efeito colateral: cria o modal no DOM e liga o gesto de 3 segundos.
         * Caso o módulo Storage esteja indisponível, indicadores usam configurações
         * vazias e a interface evita operação de persistência.
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
            resetRemoveStudentConfirmation();
            resetRemoveWordConfirmation();
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
            var domSafe = getDomSafe();
            var badgeEl = document.getElementById('weeklyModeBadge');

            if (!badgeEl) {
                var hero = document.querySelector('.menu-hero');
                if (!hero || !domSafe) return;
                badgeEl = domSafe.el('div', {
                    id: 'weeklyModeBadge',
                    className: 'tp-weekly-badge u-hidden'
                });
                var subtitle = hero.querySelector('.hero-subtitle, .menu-subtitle');
                if (subtitle && subtitle.parentNode) {
                    subtitle.parentNode.insertBefore(badgeEl, subtitle.nextSibling);
                } else {
                    hero.appendChild(badgeEl);
                }
            }

            if (!Storage || !Storage.isPalavrasSemanaAtivo()) {
                badgeEl.classList.add('u-hidden');
                if (domSafe) domSafe.clear(badgeEl);
                return;
            }

            var palavras = Storage.listarPalavrasSemana() || [];
            var modoLabel = Storage.isModoAula() ? 'Modo Aula' : 'Modo Livre';
            var texto = 'Palavras da Semana ativas (' + palavras.length + ') - ' + modoLabel;

            badgeEl.className = 'tp-weekly-badge';
            if (domSafe) {
                domSafe.clear(badgeEl);
                domSafe.appendSvg(badgeEl, SVGs.BOOK);
                badgeEl.appendChild(domSafe.el('span', { text: texto }));
            }
        },

        /**
         * Renderiza pilulas clicaveis de sugestao de alunos da turma no Ranking.
         */
        renderizarSugestoesRanking: function (containerEl, textoDigitado, onSelectAluno) {
            var domSafe = getDomSafe();
            if (!containerEl || !domSafe) return;

            domSafe.clear(containerEl);
            containerEl.classList.add('ranking-suggestions-row');

            var Storage = getStorage();
            if (!Storage || !Storage.isModoAula()) {
                containerEl.classList.add('u-hidden');
                return;
            }

            var alunosTurma = Storage.listarAlunos() || [];
            if (alunosTurma.length === 0) {
                containerEl.classList.add('u-hidden');
                return;
            }

            var sugestoes = Storage.buscarSugestoesAlunos(textoDigitado || '', 6) || [];
            if (sugestoes.length === 0) {
                containerEl.classList.add('u-hidden');
                return;
            }

            containerEl.classList.remove('u-hidden');

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
