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
     * Escapa caracteres especiais HTML para evitar XSS ao renderizar nomes.
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
     * Monta o mini-teclado A-Z + botão APAGAR no modal de registro (uma única vez).
     */
    function buildMiniKeyboard() {
        var grid = document.getElementById('miniKeyboardGrid');
        if (!grid || grid.children.length > 0) return;

        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (var i = 0; i < letters.length; i += 1) {
            (function (ch) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'mini-key';
                btn.textContent = ch;
                btn.onclick = function () {
                    onPressChar(ch);
                };
                grid.appendChild(btn);
            })(letters[i]);
        }

        // Usa o ícone SVG do WordBank quando carregado, com fallback textual seguro
        var wordBank = getModule('WordBank');
        var backSvg = (wordBank && wordBank.SVGS && wordBank.SVGS.MINI_BACKSPACE)
            ? String(wordBank.SVGS.MINI_BACKSPACE)
            : '';

        var backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'mini-key mini-key-back';
        if (backSvg) {
            backBtn.innerHTML = backSvg.indexOf('<span') !== -1
                ? backSvg
                : backSvg + '<span>APAGAR</span>';
        } else {
            backBtn.innerHTML = '<span>APAGAR</span>';
        }
        backBtn.onclick = function () {
            onBackspace();
        };
        grid.appendChild(backBtn);
    }

    /**
     * Atualiza as pílulas de sugestão de alunos da turma (Modo Aula).
     */
    function renderSuggestions() {
        var rowEl = document.getElementById('rankingSuggestionsRow');
        if (!rowEl) return;

        var panel = getModule('TeacherPanel');
        if (!panel || typeof panel.renderizarSugestoesRanking !== 'function') {
            rowEl.style.display = 'none';
            rowEl.innerHTML = '';
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
                rowEl.style.display = 'none';
                rowEl.innerHTML = '';
            }
        }
    }

    /**
     * Adiciona um caractere ao nome do aluno respeitando o limite máximo.
     */
    function onPressChar(ch) {
        if (studentName.length >= MAX_NAME_LENGTH) return;
        playAudio('playClick');
        selectedAlunoId = null;
        studentName += String(ch == null ? '' : ch);
        updateNameDisplay();
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
        if (!container) return;
        container.innerHTML = '';

        var list = getList();
        list.sort(function (a, b) {
            return ((Number(b && b.stars) || 0) - (Number(a && a.stars) || 0)) ||
                   ((Number(b && b.date) || 0) - (Number(a && a.date) || 0));
        });

        if (list.length === 0) {
            container.innerHTML =
                '<div class="ranking-empty-msg">' +
                'AINDA NÃO HÁ NOMES NO RANKING.<br>JOGUE UMA PARTIDA E SALVE SUA PONTUAÇÃO!' +
                '</div>';
            return;
        }

        var wordBank = getModule('WordBank');
        var smallStarSvg = (wordBank && wordBank.SVGS && wordBank.SVGS.SMALL_STAR)
            ? wordBank.SVGS.SMALL_STAR
            : '';

        for (var idx = 0; idx < list.length; idx += 1) {
            var entry = list[idx] && typeof list[idx] === 'object' ? list[idx] : {};
            var pos = idx + 1;
            var starsNum = Number(entry.stars) || 0;
            var visualCount = Math.max(0, Math.min(starsNum, 15));

            var row = document.createElement('div');
            var isHighlighted = lastSavedTimestamp !== null && entry.date === lastSavedTimestamp;
            row.className = 'ranking-row' + (isHighlighted ? ' highlight-new' : '');

            var medalSvg = (wordBank && typeof wordBank.getMedalSvg === 'function')
                ? (wordBank.getMedalSvg(pos) || '')
                : '';

            var starsHtml = '';
            for (var s = 0; s < visualCount; s += 1) {
                starsHtml += smallStarSvg;
            }

            row.innerHTML =
                '<div class="rank-pos-badge">' +
                    medalSvg +
                    '<span>' + pos + 'º</span>' +
                '</div>' +
                '<div class="rank-student-name">' + escapeHtmlSafe(entry.name) + '</div>' +
                '<div class="rank-stars-visual">' + starsHtml + '</div>' +
                '<div class="rank-numeral-pill">' + starsNum + '</div>';

            container.appendChild(row);
        }
    }

    /**
     * Abre o modal do Ranking da Turma e atualiza a listagem exibida.
     */
    function openModal() {
        playAudio('playPop');
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
        var modal = document.getElementById('rankingModal');
        if (modal) {
            modal.classList.remove('active');
        }

        if (typeof goHomeCallback === 'function') {
            goHomeCallback();
            return;
        }

        var game = getModule('Game');
        if (game && typeof game.goHome === 'function') {
            game.goHome();
            return;
        }

        if (typeof global.goHome === 'function') {
            global.goHome();
            return;
        }

        playAudio('playClick');
    }

    /**
     * Apaga todos os dados do Ranking, zera a pontuação atual e atualiza a lista.
     */
    function clearData() {
        playAudio('playClick');
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
        onBackspace: onBackspace,
        handleKeydown: handleKeydown,
        saveStudent: saveStudent,
        openModal: openModal,
        closeModal: closeModal,
        clearData: clearData,
        renderList: renderList
    };

})(window);
