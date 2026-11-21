/* ==========================================================================
   Serviço de Ranking Pedagógico e Registro de Alunos
   Projeto: Saúde na Escola: Saúde Bucal
   Compatível 100% offline (file:// e GitHub Pages) sem ES Modules.
   ========================================================================== */

(function (global) {
    'use strict';

    var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

    /**
     * Chave de armazenamento da lista de pontuação no localStorage.
     */
    var STORAGE_KEY = 'saudeBucalRanking';
    var MAX_RANKING_ENTRIES = 30;
    var MAX_NAME_LENGTH = 18;

    /* ----------------------------------------------------------------------
       Estado interno encapsulado do Ranking
       ---------------------------------------------------------------------- */
    var studentName = '';
    var selectedAlunoId = null;
    var lastSavedTimestamp = null;
    var clearConfirming = false;
    var clearConfirmTimer = null;
    var getStarsCallback = function () { return 0; };
    var resetStarsCallback = function () {};
    var goHomeCallback = null;

    /* ----------------------------------------------------------------------
       Helpers internos
       ---------------------------------------------------------------------- */

    /**
     * Obtém um submódulo registrado em window.SaudeEscola de forma segura.
     */
    function getModule(name) {
        return (global.SaudeEscola && global.SaudeEscola[name])
            ? global.SaudeEscola[name]
            : null;
    }

    /**
     * Retorna o utilitario seguro de DOM para evitar innerHTML.
     */
    function getDomSafe() {
        return getModule('DomSafe');
    }

    /**
     * Remove acentos diacríticos e converte o caractere para maiúscula.
     */
    function normalizeChar(ch) {
        var str = String(ch == null ? '' : ch);
        if (typeof str.normalize === 'function') {
            str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        return str.toUpperCase();
    }

    /**
     * Reproduz um efeito sonoro pelo módulo SaudeEscola.Audio, se disponível.
     */
    function playAudio(method) {
        var audio = getModule('Audio');
        if (audio && typeof audio[method] === 'function') {
            audio[method]();
        }
    }

    /**
     * Monta o mini-teclado A-Z + botões ESPAÇO e APAGAR no modal de registro (uma única vez).
     */
    function buildMiniKeyboard() {
        var grid = document.getElementById('miniKeyboardGrid');
        var domSafe = getDomSafe();
        if (!grid || !domSafe || grid.children.length > 0) return;

        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (var i = 0; i < letters.length; i += 1) {
            (function (ch) {
                var btn = domSafe.el('button', {
                    type: 'button',
                    className: 'mini-key',
                    text: ch
                });
                domSafe.on(btn, 'click', function () {
                    onPressChar(ch);
                });
                grid.appendChild(btn);
            })(letters[i]);
        }

        // Tecla ESPAÇO para permitir nomes compostos (ex.: ANA J) direto na lousa digital
        var spaceBtn = domSafe.el('button', {
            type: 'button',
            className: 'mini-key mini-key-space'
        }, [
            domSafe.el('span', { text: 'ESPAÇO' })
        ]);
        domSafe.on(spaceBtn, 'click', function () {
            onPressSpace();
        });
        grid.appendChild(spaceBtn);

        // Usa o ícone SVG do WordBank quando carregado, com fallback textual seguro
        var wordBank = getModule('WordBank');
        var backSvg = (wordBank && wordBank.SVGS && wordBank.SVGS.MINI_BACKSPACE)
            ? String(wordBank.SVGS.MINI_BACKSPACE)
            : '';

        var backBtn = domSafe.el('button', {
            type: 'button',
            className: 'mini-key mini-key-back'
        });
        if (backSvg) {
            domSafe.appendSvg(backBtn, backSvg);
        }
        backBtn.appendChild(domSafe.el('span', { text: 'APAGAR' }));
        domSafe.on(backBtn, 'click', function () {
            onBackspace();
        });
        grid.appendChild(backBtn);
    }

    /**
     * Atualiza as pílulas de sugestão de alunos da turma (Modo Aula).
     */
    function renderSuggestions() {
        var rowEl = document.getElementById('rankingSuggestionsRow');
        if (!rowEl) return;

        var domSafe = getDomSafe();
        var panel = getModule('TeacherPanel');
        if (!panel || typeof panel.renderizarSugestoesRanking !== 'function') {
            rowEl.classList.add('u-hidden');
            if (domSafe) domSafe.clear(rowEl);
            return;
        }

        panel.renderizarSugestoesRanking(rowEl, studentName, function (aluno) {
            playAudio('playPop');
            studentName = (aluno && aluno.nome) ? String(aluno.nome) : '';
            selectedAlunoId = (aluno && aluno.id) ? aluno.id : null;
            updateNameDisplay();
        });
    }

    /**
     * Atualiza o visor do nome em digitação e recarrega as sugestões.
     */
    function updateNameDisplay() {
        var disp = document.getElementById('rankingNameDisplay');
        if (disp) {
            disp.textContent = studentName.length > 0 ? studentName : '_';
        }
        renderSuggestions();
    }

    /* ----------------------------------------------------------------------
       API pública do módulo SaudeEscola.Ranking
       ---------------------------------------------------------------------- */

    /**
     * Configura os callbacks externos de leitura, limpeza de estrelas e retorno ao menu.
     */
    function configure(options) {
        if (!options || typeof options !== 'object') return;
        if (typeof options.getStars === 'function') {
            getStarsCallback = options.getStars;
        }
        if (typeof options.resetStars === 'function') {
            resetStarsCallback = options.resetStars;
        }
        if (typeof options.goHome === 'function') {
            goHomeCallback = options.goHome;
        }
    }

    /**
     * Lê a lista de registros salvos no localStorage com proteção contra falhas.
     */
    function getList() {
        try {
            var raw = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
            if (!raw) return [];
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Retorna o texto atual digitado para o nome do aluno.
     */
    function getStudentName() {
        return studentName;
    }

    /**
     * Limpa o rascunho atual de nome digitado e aluno selecionado.
     */
    function resetDraft() {
        studentName = '';
        selectedAlunoId = null;
    }

    /**
     * Informa se o modal de exibição do Ranking está aberto.
     */
    function isModalActive() {
        var modal = document.getElementById('rankingModal');
        return Boolean(modal && modal.classList.contains('active'));
    }

    /**
     * Informa se a caixa de registro de nome no modal de celebração está ativa.
     */
    function isRegisterBoxActive() {
        var box = document.getElementById('rankingRegisterBox');
        return Boolean(box && box.classList.contains('active'));
    }

    /**
     * Exibe ou oculta o bloco de registro de nome dentro do modal de celebração.
     */
    function toggleRegisterBox(show) {
        var box = document.getElementById('rankingRegisterBox');
        if (!box) return;

        if (show) {
            buildMiniKeyboard();
            resetDraft();
            updateNameDisplay();
            box.classList.add('active');
        } else {
            box.classList.remove('active');
            var rowEl = document.getElementById('rankingSuggestionsRow');
            if (rowEl) {
                var domSafe = getDomSafe();
                rowEl.classList.add('u-hidden');
                if (domSafe) domSafe.clear(rowEl);
            }
        }
    }

    /**
     * Adiciona um caractere ao nome do aluno respeitando o limite máximo.
     */
    function onPressChar(ch) {
        if (studentName.length >= MAX_NAME_LENGTH) return;
        var val = String(ch == null ? '' : ch);
        if (val === ' ' && (studentName.length === 0 || studentName.slice(-1) === ' ')) {
            return;
        }
        playAudio('playClick');
        selectedAlunoId = null;
        studentName += val;
        updateNameDisplay();
    }

    /**
     * Adiciona um espaço simples para nomes compostos (sem permitir espaço inicial ou duplo).
     */
    function onPressSpace() {
        if (studentName.length === 0 || studentName.slice(-1) === ' ') return;
        onPressChar(' ');
    }

    /**
     * Remove o último caractere digitado no campo de nome do Ranking.
     */
    function onBackspace() {
        if (studentName.length === 0) return;
        playAudio('playClick');
        selectedAlunoId = null;
        studentName = studentName.slice(0, -1);
        updateNameDisplay();
    }

    /**
     * Trata atalhos de teclado físico quando o registro de nome está ativo.
     * Retorna true se o modal de registro consumiu o evento; false caso contrário.
     */
    function handleKeydown(e) {
        if (!e) return false;
        var celebModal = document.getElementById('celebrationModal');
        var celebModalActive = Boolean(celebModal && celebModal.classList.contains('active'));

        if (celebModalActive && isRegisterBoxActive()) {
            if (e.key === 'Backspace') {
                e.preventDefault();
                onBackspace();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                saveStudent();
            } else if (e.key === ' ') {
                if (studentName.length > 0 && studentName.slice(-1) !== ' ') {
                    e.preventDefault();
                    onPressChar(' ');
                }
            } else if (/^[a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]$/.test(e.key)) {
                e.preventDefault();
                var normalized = normalizeChar(e.key);
                if (/^[A-Z]$/.test(normalized)) {
                    onPressChar(normalized);
                }
            }
            return true;
        }

        return false;
    }

    /**
     * Salva o aluno no Ranking, consolida a sessão de Analytics (no Modo Aula)
     * e abre o modal do Ranking destacando a entrada recém-salva.
     */
    function saveStudent() {
        var trimmed = studentName.trim();
        var storage = getModule('Storage');
        var analytics = getModule('Analytics');
        var modoAula = Boolean(storage && typeof storage.isModoAula === 'function' && storage.isModoAula());

        var finalName = trimmed.length > 0 ? trimmed : 'ALUNO';
        var alunoVinculado = null;

        // No Modo Aula, tenta vincular o nome ao cadastro oficial da turma
        if (modoAula && storage) {
            if (selectedAlunoId && typeof storage.listarAlunos === 'function') {
                var alunos = storage.listarAlunos() || [];
                for (var i = 0; i < alunos.length; i += 1) {
                    if (alunos[i] && String(alunos[i].id) === String(selectedAlunoId)) {
                        alunoVinculado = alunos[i];
                        break;
                    }
                }
            }
            if (!alunoVinculado && trimmed.length > 0 && typeof storage.resolverAlunoPorTexto === 'function') {
                alunoVinculado = storage.resolverAlunoPorTexto(trimmed);
            }
            if (alunoVinculado && alunoVinculado.nome) {
                finalName = alunoVinculado.nome;
            }
        }

        var currentStars = Number(getStarsCallback());
        if (isNaN(currentStars) || currentStars < 0) {
            currentStars = 0;
        }

        var nowTs = Date.now();
        var newEntry = {
            name: finalName,
            stars: currentStars,
            date: nowTs
        };

        var list = getList();
        list.push(newEntry);
        list.sort(function (a, b) {
            return ((Number(b && b.stars) || 0) - (Number(a && a.stars) || 0)) ||
                   ((Number(b && b.date) || 0) - (Number(a && a.date) || 0));
        });
        var topList = list.slice(0, MAX_RANKING_ENTRIES);

        try {
            if (global.localStorage) {
                global.localStorage.setItem(STORAGE_KEY, JSON.stringify(topList));
            }
        } catch (e) {}

        // Consolida sessão diagnóstica vinculada ao aluno apenas no Modo Aula
        if (analytics) {
            if (modoAula && typeof analytics.finalizarESalvarSessao === 'function') {
                analytics.finalizarESalvarSessao(
                    alunoVinculado
                        ? {
                            alunoId: alunoVinculado.id,
                            alunoNome: alunoVinculado.nome,
                            alunoChave: alunoVinculado.chave
                        }
                        : {
                            alunoId: null,
                            alunoNome: finalName,
                            alunoChave: (storage && typeof storage.normalizarChave === 'function')
                                ? storage.normalizarChave(finalName)
                                : finalName.toLowerCase()
                        }
                );
            } else if (!modoAula && typeof analytics.descartarSessao === 'function') {
                analytics.descartarSessao();
            }
        }

        lastSavedTimestamp = nowTs;
        resetDraft();
        updateNameDisplay();
        playAudio('playSuccess');

        var celebModal = document.getElementById('celebrationModal');
        if (celebModal) {
            celebModal.classList.remove('active');
        }
        openModal();
    }

    /**
     * Renderiza a lista ordenada do Ranking da Turma no container do modal.
     */
    function renderList() {
        var container = document.getElementById('rankingListContainer');
        var domSafe = getDomSafe();
        if (!container || !domSafe) return;
        domSafe.clear(container);

        var list = getList();
        list.sort(function (a, b) {
            return ((Number(b && b.stars) || 0) - (Number(a && a.stars) || 0)) ||
                   ((Number(b && b.date) || 0) - (Number(a && a.date) || 0));
        });

        if (list.length === 0) {
            container.appendChild(
                domSafe.el('div', { className: 'ranking-empty-msg' }, [
                    'AINDA NÃO HÁ NOMES NO RANKING.',
                    domSafe.el('br'),
                    'JOGUE UMA PARTIDA E SALVE SUA PONTUAÇÃO!'
                ])
            );
            return;
        }

        var uiIcons = getModule('UiIcons');
        var wordBank = getModule('WordBank');
        var smallStarSvg = (wordBank && wordBank.SVGS && wordBank.SVGS.SMALL_STAR)
            ? wordBank.SVGS.SMALL_STAR
            : '';

        for (var idx = 0; idx < list.length; idx += 1) {
            var entry = list[idx] && typeof list[idx] === 'object' ? list[idx] : {};
            var pos = idx + 1;
            var starsNum = Number(entry.stars) || 0;
            var visualCount = Math.max(0, Math.min(starsNum, 15));

            var isHighlighted = lastSavedTimestamp !== null && entry.date === lastSavedTimestamp;
            var medalSvg = (uiIcons && typeof uiIcons.getMedalSvg === 'function')
                ? (uiIcons.getMedalSvg(pos) || '')
                : '';
            if (!medalSvg && wordBank && typeof wordBank.getMedalSvg === 'function') {
                medalSvg = wordBank.getMedalSvg(pos) || '';
            }

            var posBadge = domSafe.el('div', { className: 'rank-pos-badge' });
            if (medalSvg) {
                domSafe.appendSvg(posBadge, medalSvg);
            }
            posBadge.appendChild(domSafe.el('span', { text: pos + 'º' }));

            var nameEl = domSafe.el('div', {
                className: 'rank-student-name',
                text: entry.name != null ? String(entry.name) : ''
            });

            var starsWrap = domSafe.el('div', { className: 'rank-stars-visual' });
            if (smallStarSvg) {
                for (var s = 0; s < visualCount; s += 1) {
                    domSafe.appendSvg(starsWrap, smallStarSvg);
                }
            }

            var numeralEl = domSafe.el('div', {
                className: 'rank-numeral-pill',
                text: String(starsNum)
            });

            var row = domSafe.el('div', {
                className: 'ranking-row' + (isHighlighted ? ' highlight-new' : '')
            }, [posBadge, nameEl, starsWrap, numeralEl]);

            container.appendChild(row);
        }
    }

    /**
     * Reseta o estado de confirmação em 2 toques do botão ZERAR RANKING.
     */
    function resetClearConfirmation() {
        if (clearConfirmTimer) {
            global.clearTimeout(clearConfirmTimer);
            clearConfirmTimer = null;
        }
        clearConfirming = false;

        if (typeof document === 'undefined') return;
        var btn = document.querySelector('#rankingModal .btn-clear-ranking');
        if (!btn) return;
        btn.classList.remove('confirming');
        var spans = btn.querySelectorAll('span');
        var labelSpan = spans.length > 0 ? spans[spans.length - 1] : null;
        if (labelSpan) {
            labelSpan.textContent = 'ZERAR RANKING';
        }
    }

    /**
     * Abre o modal do Ranking da Turma e atualiza a listagem exibida.
     */
    function openModal() {
        playAudio('playPop');
        resetClearConfirmation();
        renderList();
        var modal = document.getElementById('rankingModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Fecha o modal do Ranking da Turma e retorna diretamente ao Menu Inicial.
     */
    function closeModal() {
        resetClearConfirmation();
        var modal = document.getElementById('rankingModal');
        if (modal) {
            modal.classList.remove('active');
        }

        if (typeof goHomeCallback === 'function') {
            goHomeCallback(true);
            return;
        }

        var game = getModule('Game');
        if (game && typeof game.goHome === 'function') {
            game.goHome(true);
            return;
        }

        if (typeof global.goHome === 'function') {
            global.goHome(true);
            return;
        }

        playAudio('playClick');
    }

    /**
     * Apaga todos os dados do Ranking após confirmação em 2 toques rápidos.
     */
    function clearData(forceImmediate) {
        playAudio('playClick');

        if (!forceImmediate && !clearConfirming) {
            clearConfirming = true;
            if (typeof document !== 'undefined') {
                var btn = document.querySelector('#rankingModal .btn-clear-ranking');
                if (btn) {
                    btn.classList.add('confirming');
                    var spans = btn.querySelectorAll('span');
                    var labelSpan = spans.length > 0 ? spans[spans.length - 1] : null;
                    if (labelSpan) {
                        labelSpan.textContent = 'TOQUE NOVAMENTE PARA ZERAR';
                    }
                }
            }
            if (clearConfirmTimer) {
                global.clearTimeout(clearConfirmTimer);
            }
            clearConfirmTimer = global.setTimeout(function () {
                resetClearConfirmation();
            }, 4000);
            return false;
        }

        resetClearConfirmation();

        try {
            if (global.localStorage) {
                global.localStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {}

        lastSavedTimestamp = null;
        if (typeof resetStarsCallback === 'function') {
            resetStarsCallback();
        }
        renderList();
        return true;
    }

    SaudeEscola.Ranking = {
        STORAGE_KEY: STORAGE_KEY,
        configure: configure,
        getList: getList,
        getStudentName: getStudentName,
        resetDraft: resetDraft,
        isModalActive: isModalActive,
        isRegisterBoxActive: isRegisterBoxActive,
        toggleRegisterBox: toggleRegisterBox,
        onPressChar: onPressChar,
        onPressSpace: onPressSpace,
        onBackspace: onBackspace,
        handleKeydown: handleKeydown,
        saveStudent: saveStudent,
        openModal: openModal,
        closeModal: closeModal,
        clearData: clearData,
        resetClearConfirmation: resetClearConfirmation,
        renderList: renderList
    };

})(window);
