/* ==========================================================================
   Painel de Evolução Pedagógica (Visualização HTML/CSS + SVG)
   Projeto: Saúde na Escola: Saúde Bucal
   Compatível com execução offline (file://) e GitHub Pages (sem ES Modules).
   ========================================================================== */
(function (global) {
    'use strict';

    var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

    // Estado local dos filtros preservado entre re-renderizações enquanto válido
    var modoVisualizacao = 'DIA';
    var filtroAlunoId = 'TODOS';
    var filtroDataRef = null;
    var filtroPeriodoId = null;
    var configPeriodosAberta = false;
    var configPeriodosFeedback = '';
    var configPeriodosFeedbackTipo = '';
    var rascunhoConfigPeriodos = null;
    var limparConfirmTimer = null;
    var escopoAlunos = 'GERAL';
    var editandoAnotacaoId = null;
    var rascunhoAnotacaoTexto = '';
    var rascunhoAnotacaoAlunoId = '';
    var confirmarExcluirAnotacaoId = null;
    var confirmarExcluirAnotacaoTimer = null;

    // Configuração visual e rótulos das 3 fases exibidas no painel de evolução
    var FASES_CONFIG = [
        { key: 'fase1', titulo: 'Fase 1: Memória', curto: 'Memória', sigla: 'F1', classe: 'ev-phase-1', fillClasse: 'is-f1' },
        { key: 'fase2', titulo: 'Fase 2: Sílabas', curto: 'Sílabas', sigla: 'F2', classe: 'ev-phase-2', fillClasse: 'is-f2' },
        { key: 'fase3', titulo: 'Fase 3: Escrita', curto: 'Escrita', sigla: 'F3', classe: 'ev-phase-3', fillClasse: 'is-f3' }
    ];

    /**
     * Formata tempo em segundos de maneira legível (ex.: 34s ou 1m 12s).
     */
    function formatarTempoSegundos(seg) {
        var s = Math.max(0, Math.round(Number(seg) || 0));
        if (s < 60) return s + 's';
        var min = Math.floor(s / 60);
        var resto = s % 60;
        return resto > 0 ? (min + 'm ' + resto + 's') : (min + 'm');
    }

    /**
     * Formata tempo curto para caber sobre mini-barras do gráfico (ex.: 34s ou 1m12).
     */
    function formatarTempoCurto(seg) {
        var s = Math.max(0, Math.round(Number(seg) || 0));
        if (s < 60) return s + 's';
        var min = Math.floor(s / 60);
        var resto = s % 60;
        if (resto === 0) return min + 'm';
        return min + 'm' + (resto < 10 ? ('0' + resto) : resto);
    }

    /**
     * Lê de forma segura os indicadores de uma fase (sem gerar NaN em registros antigos).
     */
    function obterMetricasFase(porFase, chave) {
        var f = (porFase && typeof porFase === 'object' && porFase[chave]) ? porFase[chave] : null;
        var tentativas = f && isFinite(Number(f.tentativas)) ? Math.max(0, Number(f.tentativas)) : 0;
        var acertos = f && isFinite(Number(f.acertos)) ? Math.max(0, Number(f.acertos)) : 0;
        var tempoTotalSegundos = f && isFinite(Number(f.tempoTotalSegundos)) ? Math.max(0, Number(f.tempoTotalSegundos)) : 0;
        var rodadas = f && isFinite(Number(f.rodadas)) ? Math.max(0, Number(f.rodadas)) : 0;
        var tempoMedioSegundos = null;
        var taxaAcerto = null;
        var modoMetrica = 'vazio';
        var temDados = false;

        if (chave === 'fase1' && ((f && f.modoMetrica === 'tempo') || rodadas > 0)) {
            modoMetrica = 'tempo';
            temDados = true;
            if (f && f.tempoMedioSegundos !== null && f.tempoMedioSegundos !== undefined && isFinite(Number(f.tempoMedioSegundos))) {
                tempoMedioSegundos = Math.max(1, Math.round(Number(f.tempoMedioSegundos)));
            } else if (rodadas > 0) {
                tempoMedioSegundos = Math.max(1, Math.round(tempoTotalSegundos / rodadas));
            } else {
                tempoMedioSegundos = 1;
            }
        } else if (Boolean(f && (f.temDados || tentativas > 0)) && tentativas > 0) {
            temDados = true;
            modoMetrica = chave === 'fase1' ? 'legado_taxa' : 'taxa';
            if (f.taxaAcerto !== null && f.taxaAcerto !== undefined && isFinite(Number(f.taxaAcerto))) {
                taxaAcerto = Math.max(0, Math.min(100, Math.round(Number(f.taxaAcerto))));
            } else {
                taxaAcerto = Math.round((acertos / tentativas) * 100);
            }
        }

        return {
            tentativas: tentativas,
            acertos: acertos,
            tempoTotalSegundos: tempoTotalSegundos,
            rodadas: rodadas,
            tempoMedioSegundos: tempoMedioSegundos,
            modoMetrica: modoMetrica,
            temDados: temDados,
            taxaAcerto: taxaAcerto
        };
    }

    /**
     * Obtém dinamicamente o módulo Storage.
     */
    function getStorage() {
        return (global.SaudeEscola && global.SaudeEscola.Storage) ? global.SaudeEscola.Storage : null;
    }

    /**
     * Obtém dinamicamente o módulo DomSafe para construção segura de nós.
     */
    function getDomSafe() {
        return (global.SaudeEscola && global.SaudeEscola.DomSafe) ? global.SaudeEscola.DomSafe : null;
    }

    /**
     * Anexa um ícone SVG sanitizado via DomSafe sem usar innerHTML.
     */
    function appendSvgIcon(parent, svgMarkup) {
        var domSafe = getDomSafe();
        if (parent && domSafe && typeof domSafe.appendSvg === 'function') {
            domSafe.appendSvg(parent, svgMarkup);
        }
    }

    /**
     * Obtém dinamicamente o módulo Analytics.
     */
    function getAnalytics() {
        return (global.SaudeEscola && global.SaudeEscola.Analytics) ? global.SaudeEscola.Analytics : null;
    }

    /**
     * Obtém dinamicamente o módulo Periods.
     */
    function getPeriods() {
        return (global.SaudeEscola && global.SaudeEscola.Periods) ? global.SaudeEscola.Periods : null;
    }

    /**
     * Converte data YYYY-MM-DD para DD/MM/YYYY.
     */
    function formatarDataBR(dataISO) {
        var partes = String(dataISO || '').split('-');
        if (partes.length !== 3) return String(dataISO || '');
        return partes[2] + '/' + partes[1] + '/' + partes[0];
    }

    /**
     * Ajusta largura e altura de um SVG que possua viewBox para caber no espaço do painel.
     */
    function ajustarDimensaoSvg(svgTexto, tamanhoPx) {
        var limpo = String(svgTexto || '').trim();
        if (limpo.indexOf('<svg') !== 0 || limpo.indexOf('viewBox') === -1) {
            return '';
        }
        return limpo.replace(/<svg\b([^>]*)>/i, function (match, attrs) {
            var semDimensoes = attrs
                .replace(/\swidth\s*=\s*(['"]).*?\1/gi, '')
                .replace(/\sheight\s*=\s*(['"]).*?\1/gi, '')
                .replace(/\saria-hidden\s*=\s*(['"]).*?\1/gi, '');
            return '<svg' + semDimensoes + ' width="' + tamanhoPx + '" height="' + tamanhoPx + '" aria-hidden="true">';
        });
    }

    /**
     * Reutiliza ícones de window.SaudeEscola.SVGs quando disponíveis, com fallback vetorial seguro.
     */
    function obterSvg(nomesCandidatos, tamanhoPx, fallbackSvg) {
        var biblioteca = global.SaudeEscola && global.SaudeEscola.SVGs;
        if (biblioteca && typeof biblioteca === 'object' && Array.isArray(nomesCandidatos)) {
            for (var i = 0; i < nomesCandidatos.length; i++) {
                var chave = nomesCandidatos[i];
                if (typeof biblioteca[chave] === 'string' && biblioteca[chave].indexOf('<svg') !== -1) {
                    var adaptado = ajustarDimensaoSvg(biblioteca[chave], tamanhoPx);
                    if (adaptado) return adaptado;
                }
            }
        }
        return fallbackSvg;
    }

    // Ícones vetoriais fallback infantis e leves (zero emojis nativos)
    function svgEstrela(tamanho) {
        var t = tamanho || 20;
        return obterSvg(['estrela', 'star', 'trofeu', 'trophy'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" aria-hidden="true">' +
                '<path d="M12 2.5l2.85 5.78 6.38.93-4.61 4.5 1.09 6.35L12 17.06l-5.71 3 1.09-6.35-4.61-4.5 6.38-.93L12 2.5z" fill="#FBBF24" stroke="#D97706" stroke-width="1.6" stroke-linejoin="round"/>' +
            '</svg>'
        );
    }

    function svgAlerta(tamanho) {
        var t = tamanho || 20;
        return obterSvg(['alerta', 'alert', 'atencao'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" aria-hidden="true">' +
                '<path d="M12 3L2.5 19.5h19L12 3z" fill="#FDE68A" stroke="#D97706" stroke-width="1.7" stroke-linejoin="round"/>' +
                '<path d="M12 9.5v4.5" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>' +
                '<circle cx="12" cy="16.8" r="1.1" fill="#B45309"/>' +
            '</svg>'
        );
    }

    function svgComparativo(tamanho) {
        var t = tamanho || 20;
        return obterSvg(['tendencia', 'comparativo', 'graficoLinha'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" aria-hidden="true">' +
                '<rect x="3" y="3" width="18" height="18" rx="5" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>' +
                '<path d="M7 14.5l3.5-3.5 3 2.5L17.5 9" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<path d="M14.8 9h2.7v2.7" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>'
        );
    }

    function svgSetaDelta(tendencia) {
        if (tendencia === 'up') {
            return '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">' +
                '<path d="M10 15V5M10 5l-4.5 4.5M10 5l4.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
        }
        if (tendencia === 'down') {
            return '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">' +
                '<path d="M10 5v10M10 15l-4.5-4.5M10 15l4.5-4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
        }
        return '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">' +
            '<path d="M4.5 10h11M12.5 7l3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';
    }

    function svgGraficoBarras(tamanho) {
        var t = tamanho || 20;
        return obterSvg(['grafico', 'chart', 'barras'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" aria-hidden="true">' +
                '<rect x="4" y="13" width="4" height="7" rx="1.2" fill="#38BDF8"/>' +
                '<rect x="10" y="9" width="4" height="11" rx="1.2" fill="#0EA5E9"/>' +
                '<rect x="16" y="5" width="4" height="15" rx="1.2" fill="#0284C7"/>' +
            '</svg>'
        );
    }

    function svgLupa(tamanho) {
        var t = tamanho || 20;
        return obterSvg(['lupa', 'search', 'alvo'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" aria-hidden="true">' +
                '<circle cx="10.5" cy="10.5" r="6" fill="#FEF3C7" stroke="#D97706" stroke-width="1.8"/>' +
                '<path d="M15.2 15.2L20 20" stroke="#B45309" stroke-width="2.2" stroke-linecap="round"/>' +
            '</svg>'
        );
    }

    function svgDenteFeliz(tamanho) {
        var t = tamanho || 44;
        return obterSvg(['denteFeliz', 'dente', 'tooth', 'sorriso'], t,
            '<svg viewBox="0 0 64 64" width="' + t + '" height="' + t + '" fill="none" aria-hidden="true">' +
                '<path d="M20 12c-6 0-11 5.2-11 12.2 0 7.5 3.6 15.2 6.8 26.8 1.2 4.3 5.5 5 7.5 1.1l3.6-7.4c2-4.1 8.2-4.1 10.2 0l3.6 7.4c2 3.9 6.3 3.2 7.5-1.1C51.4 39.4 55 31.7 55 24.2 55 17.2 50 12 44 12c-4.5 0-8.2 2.2-12 2.2S24.5 12 20 12z" fill="#FFFFFF" stroke="#0EA5E9" stroke-width="3" stroke-linejoin="round"/>' +
                '<circle cx="24.5" cy="26" r="2.5" fill="#1E293B"/>' +
                '<circle cx="39.5" cy="26" r="2.5" fill="#1E293B"/>' +
                '<path d="M25.5 33.5c3.5 3.6 9.5 3.6 13 0" stroke="#0EA5E9" stroke-width="2.8" stroke-linecap="round"/>' +
                '<circle cx="49" cy="12" r="3" fill="#FBBF24"/>' +
                '<circle cx="14" cy="15" r="2.2" fill="#34D399"/>' +
            '</svg>'
        );
    }

    function svgEstadoVazio(tamanho) {
        var t = tamanho || 48;
        return obterSvg(['prancheta', 'graficoVazio', 'dente'], t,
            '<svg viewBox="0 0 64 64" width="' + t + '" height="' + t + '" fill="none" aria-hidden="true">' +
                '<rect x="12" y="10" width="40" height="46" rx="8" fill="#F0F9FF" stroke="#38BDF8" stroke-width="2.6"/>' +
                '<rect x="23" y="6" width="18" height="8" rx="4" fill="#BAE6FD" stroke="#0284C7" stroke-width="2"/>' +
                '<rect x="20" y="34" width="6" height="14" rx="2" fill="#7DD3FC"/>' +
                '<rect x="29" y="27" width="6" height="21" rx="2" fill="#38BDF8"/>' +
                '<rect x="38" y="21" width="6" height="27" rx="2" fill="#0284C7"/>' +
            '</svg>'
        );
    }

    function svgImpressora(tamanho) {
        var t = tamanho || 18;
        return obterSvg(['PRINTER', 'impressora'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<polyline points="6 9 6 2 18 2 18 9"></polyline>' +
                '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>' +
                '<rect x="6" y="14" width="12" height="8" rx="1"></rect>' +
            '</svg>'
        );
    }

    function svgUsuarios(tamanho) {
        var t = tamanho || 18;
        return obterSvg(['USERS', 'turma'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>' +
                '<circle cx="9" cy="7" r="4"></circle>' +
                '<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>' +
                '<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' +
            '</svg>'
        );
    }

    function svgAnotacao(tamanho) {
        var t = tamanho || 18;
        return obterSvg(['NOTE', 'EDIT', 'anotacao'], t,
            '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>' +
                '<polyline points="14 2 14 8 20 8"></polyline>' +
                '<line x1="8" y1="13" x2="16" y2="13"></line>' +
                '<line x1="8" y1="17" x2="13" y2="17"></line>' +
            '</svg>'
        );
    }

    function svgCalendario(tamanho) {
        var t = tamanho || 17;
        return '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="3" y="4" width="18" height="18" rx="3"></rect>' +
            '<line x1="16" y1="2" x2="16" y2="6"></line>' +
            '<line x1="8" y1="2" x2="8" y2="6"></line>' +
            '<line x1="3" y1="10" x2="21" y2="10"></line>' +
        '</svg>';
    }

    /**
     * Monta a lista deduplicada de opções de alunos (cadastrados + histórico).
     */
    function montarOpcoesAlunos(storage) {
        var opcoes = [];
        var mapaIds = Object.create(null);
        var mapaChaves = Object.create(null);

        var alunosCadastrados = (storage && typeof storage.listarAlunos === 'function')
            ? storage.listarAlunos()
            : [];
        if (!Array.isArray(alunosCadastrados)) alunosCadastrados = [];

        var listaAlunos = [];
        for (var i = 0; i < alunosCadastrados.length; i++) {
            var a = alunosCadastrados[i];
            if (!a) continue;

            var valorId = typeof a === 'string' ? a : (a.id || a.chave || a.nome);
            var nome = typeof a === 'string' ? a : (a.nome || a.id || 'Aluno');
            var chave = typeof a === 'object' && a.chave ? String(a.chave) : '';

            if (!valorId) continue;
            var idStr = String(valorId);
            if (mapaIds[idStr]) continue;

            mapaIds[idStr] = true;
            if (chave) mapaChaves[chave] = true;
            listaAlunos.push({ value: idStr, label: String(nome) });
        }

        // Inclui eventuais alunos que já têm registros no histórico mas não estão no cadastro atual
        var sessoes = (storage && typeof storage.listarSessoes === 'function')
            ? storage.listarSessoes()
            : [];
        if (!Array.isArray(sessoes)) sessoes = [];

        for (var j = 0; j < sessoes.length; j++) {
            var s = sessoes[j];
            if (!s || typeof s !== 'object') continue;

            if (s.alunoId) {
                var sId = String(s.alunoId);
                if (!mapaIds[sId]) {
                    mapaIds[sId] = true;
                    if (s.alunoChave) mapaChaves[String(s.alunoChave)] = true;
                    listaAlunos.push({
                        value: sId,
                        label: s.alunoNome || ('Aluno ' + sId)
                    });
                }
            } else if (s.alunoChave && s.alunoChave !== 'turma') {
                var sChave = String(s.alunoChave);
                if (!mapaChaves[sChave]) {
                    mapaChaves[sChave] = true;
                    var chaveValor = 'chave:' + sChave;
                    if (!mapaIds[chaveValor]) {
                        mapaIds[chaveValor] = true;
                        listaAlunos.push({
                            value: chaveValor,
                            label: s.alunoNome || sChave
                        });
                    }
                }
            }
        }

        listaAlunos.sort(function (x, y) {
            return x.label.localeCompare(y.label, 'pt-BR');
        });

        opcoes.push({ value: 'TODOS', label: 'Toda a turma' });
        for (var k = 0; k < listaAlunos.length; k++) {
            opcoes.push(listaAlunos[k]);
        }

        return opcoes;
    }

    /**
     * Constrói o DOM da seção de filtros com alternância Por Dia vs. Por Período Letivo.
     */
    function renderFiltrosDom(opcoesAlunos, contexto) {
        var domSafe = getDomSafe();
        var ctx = contexto && typeof contexto === 'object' ? contexto : {};
        var ehPeriodo = modoVisualizacao === 'PERIODO';
        var datasDisponiveis = Array.isArray(ctx.datasDisponiveis) ? ctx.datasDisponiveis : [];
        var dataSelecionada = ctx.dataSelecionada || null;
        var seriePeriodos = Array.isArray(ctx.seriePeriodos) ? ctx.seriePeriodos : [];
        var periodoAtualId = ctx.periodoAtual ? ctx.periodoAtual.id : null;

        var modeDiaBtn = domSafe.el('button', {
            type: 'button',
            id: 'evModeDiaBtn',
            className: 'ev-mode-btn' + (!ehPeriodo ? ' active' : ''),
            text: 'Por Dia'
        });

        var modePeriodoBtn = domSafe.el('button', {
            type: 'button',
            id: 'evModePeriodoBtn',
            className: 'ev-mode-btn' + (ehPeriodo ? ' active' : '')
        });
        appendSvgIcon(modePeriodoBtn, svgCalendario(15));
        modePeriodoBtn.appendChild(domSafe.el('span', { text: 'Por Período Letivo' }));

        var modeBar = domSafe.el('div', { className: 'ev-mode-bar' }, [
            domSafe.el('span', { className: 'ev-mode-label', text: 'Agrupamento:' }),
            domSafe.el('div', {
                className: 'ev-mode-switch',
                role: 'group',
                'aria-label': 'Modo de visualização dos gráficos'
            }, [modeDiaBtn, modePeriodoBtn])
        ]);

        var selectAluno = domSafe.el('select', { className: 'ev-select', id: 'evFilterAluno' });
        for (var i = 0; i < opcoesAlunos.length; i++) {
            var opt = opcoesAlunos[i];
            selectAluno.appendChild(domSafe.el('option', {
                value: String(opt.value || ''),
                selected: opt.value === filtroAlunoId,
                text: String(opt.label || '')
            }));
        }
        selectAluno.value = filtroAlunoId;

        var segundoFiltroNode;
        if (ehPeriodo) {
            var selectPeriodo = domSafe.el('select', {
                className: 'ev-select',
                id: 'evFilterPeriodo',
                disabled: seriePeriodos.length === 0
            });

            if (seriePeriodos.length === 0) {
                selectPeriodo.appendChild(domSafe.el('option', { value: '', text: 'Nenhum ciclo configurado' }));
            } else {
                for (var p = 0; p < seriePeriodos.length; p++) {
                    var itemPer = seriePeriodos[p];
                    var sesTxt = itemPer.sessoesCount + ' ses.';
                    var nomeCurto = itemPer.sigla || itemPer.nome;
                    var intervaloCurto = String(itemPer.intervaloBR || '').replace(/\s+a\s+/g, '–');
                    var labelPer = nomeCurto + ' (' + intervaloCurto + ') • ' + sesTxt;
                    var sesCompleto = itemPer.sessoesCount === 1 ? '1 sessão' : (itemPer.sessoesCount + ' sessões');
                    selectPeriodo.appendChild(domSafe.el('option', {
                        value: String(itemPer.periodoId || ''),
                        selected: itemPer.periodoId === periodoAtualId,
                        title: itemPer.nome + ' (' + itemPer.intervaloBR + ') — ' + sesCompleto,
                        text: labelPer
                    }));
                }
                if (periodoAtualId) {
                    selectPeriodo.value = periodoAtualId;
                }
            }

            var btnConfig = domSafe.el('button', {
                type: 'button',
                id: 'evBtnConfigPeriodos',
                className: 'tp-btn tp-btn-outline tp-btn-sm ev-btn-config-periodos',
                'aria-expanded': configPeriodosAberta ? 'true' : 'false'
            });
            appendSvgIcon(btnConfig, svgCalendario(15));
            btnConfig.appendChild(domSafe.el('span', { text: 'Configurar ciclos' }));

            segundoFiltroNode = domSafe.el('div', { className: 'ev-filter-group ev-filter-period-wrap' }, [
                domSafe.el('label', { className: 'ev-label', for: 'evFilterPeriodo', text: 'Período letivo' }),
                domSafe.el('div', { className: 'ev-period-select-row' }, [
                    selectPeriodo,
                    btnConfig
                ])
            ]);
        } else {
            var desabilitarData = datasDisponiveis.length === 0;
            var selectData = domSafe.el('select', {
                className: 'ev-select',
                id: 'evFilterData',
                disabled: desabilitarData
            });

            if (desabilitarData) {
                selectData.appendChild(domSafe.el('option', { value: '', text: 'Nenhum registro' }));
            } else {
                for (var j = 0; j < datasDisponiveis.length; j++) {
                    var d = datasDisponiveis[j];
                    selectData.appendChild(domSafe.el('option', {
                        value: String(d || ''),
                        selected: d === dataSelecionada,
                        text: formatarDataBR(d)
                    }));
                }
                if (dataSelecionada) {
                    selectData.value = dataSelecionada;
                }
            }

            segundoFiltroNode = domSafe.el('div', { className: 'ev-filter-group' }, [
                domSafe.el('label', { className: 'ev-label', for: 'evFilterData', text: 'Dia analisado' }),
                selectData
            ]);
        }

        var btnPrint = domSafe.el('button', {
            type: 'button',
            className: 'tp-btn tp-btn-primary ev-btn-print',
            id: 'evBtnExportarPdf'
        });
        appendSvgIcon(btnPrint, svgImpressora(17));
        btnPrint.appendChild(domSafe.el('span', { text: 'Exportar Relatório (PDF)' }));

        return domSafe.el('div', { className: 'ev-filters-shell' }, [
            modeBar,
            domSafe.el('div', { className: 'ev-filters' }, [
                domSafe.el('div', { className: 'ev-filter-group' }, [
                    domSafe.el('label', { className: 'ev-label', for: 'evFilterAluno', text: 'Aluno / Visão' }),
                    selectAluno
                ]),
                segundoFiltroNode,
                domSafe.el('div', { className: 'ev-filter-actions' }, [btnPrint])
            ])
        ]);
    }

    /**
     * Constrói o painel expansível de configuração dos períodos letivos (Bimestres / Trimestres).
     */
    function renderConfigPeriodosDom(storage, rootContainer) {
        var domSafe = getDomSafe();
        var periods = getPeriods();
        if (!domSafe || !periods) return null;

        if (!rascunhoConfigPeriodos) {
            rascunhoConfigPeriodos = (storage && typeof storage.getPeriodosLetivos === 'function')
                ? storage.getPeriodosLetivos()
                : periods.gerarConfiguracaoPadrao('bimestre');
        }
        var cfg = periods.clonarConfiguracao(rascunhoConfigPeriodos);

        var btnBim = domSafe.el('button', {
            type: 'button',
            id: 'evCfgModelBim',
            className: 'ev-scope-btn' + (cfg.modelo === 'bimestre' ? ' active' : ''),
            text: 'Bimestres (4 ciclos)'
        });
        var btnTri = domSafe.el('button', {
            type: 'button',
            id: 'evCfgModelTri',
            className: 'ev-scope-btn' + (cfg.modelo === 'trimestre' ? ' active' : ''),
            text: 'Trimestres (3 ciclos)'
        });

        var inputAno = domSafe.el('input', {
            type: 'number',
            id: 'evCfgAnoInput',
            className: 'ev-period-year-input',
            min: '2000',
            max: '2100',
            value: String(cfg.ano || new Date().getFullYear())
        });

        var btnRestaurar = domSafe.el('button', {
            type: 'button',
            id: 'evCfgRestaurarBtn',
            className: 'tp-btn tp-btn-outline tp-btn-sm',
            text: 'Restaurar padrão'
        });

        var cyclesList = domSafe.el('div', { className: 'ev-period-cycles-list' });
        for (var i = 0; i < cfg.ciclos.length; i++) {
            (function (ciclo, idx) {
                var iniId = 'evPeriodIni_' + String(idx);
                var fimId = 'evPeriodFim_' + String(idx);
                var iniInput = domSafe.el('input', {
                    type: 'date',
                    id: iniId,
                    className: 'ev-period-date-input',
                    value: ciclo.inicio,
                    'data-cycle-index': String(idx),
                    'data-field': 'inicio',
                    'aria-label': 'Início de ' + ciclo.nome
                });
                var fimInput = domSafe.el('input', {
                    type: 'date',
                    id: fimId,
                    className: 'ev-period-date-input',
                    value: ciclo.fim,
                    'data-cycle-index': String(idx),
                    'data-field': 'fim',
                    'aria-label': 'Fim de ' + ciclo.nome
                });

                cyclesList.appendChild(domSafe.el('div', { className: 'ev-period-cycle-row' }, [
                    domSafe.el('span', { className: 'ev-period-cycle-name', text: ciclo.nome }),
                    domSafe.el('div', { className: 'ev-period-date-pair' }, [
                        domSafe.el('label', { className: 'ev-period-date-label', for: iniId, text: 'Início' }),
                        iniInput,
                        domSafe.el('label', { className: 'ev-period-date-label', for: fimId, text: 'Fim' }),
                        fimInput
                    ])
                ]));
            })(cfg.ciclos[i], i);
        }

        var feedbackNode = configPeriodosFeedback
            ? domSafe.el('div', {
                className: 'ev-period-config-feedback ' + (configPeriodosFeedbackTipo === 'error' ? 'is-error' : 'is-success'),
                text: configPeriodosFeedback
            })
            : null;

        var titleHead = domSafe.el('h4', { className: 'ev-chart-title' });
        appendSvgIcon(titleHead, svgCalendario(17));
        titleHead.appendChild(domSafe.text(' '));
        titleHead.appendChild(domSafe.el('span', { text: 'Configurar Períodos Letivos' }));

        var panel = domSafe.el('div', { className: 'ev-period-config', id: 'evPeriodConfigPanel' }, [
            domSafe.el('div', { className: 'ev-period-config-head' }, [
                titleHead,
                domSafe.el('div', { className: 'ev-period-model-row' }, [
                    domSafe.el('div', { className: 'ev-scope-toggle', role: 'group', 'aria-label': 'Modelo de divisão letiva' }, [
                        btnBim,
                        btnTri
                    ]),
                    domSafe.el('div', { className: 'ev-period-year-wrap' }, [
                        domSafe.el('label', { className: 'ev-label', for: 'evCfgAnoInput', text: 'Ano letivo' }),
                        inputAno,
                        btnRestaurar
                    ])
                ])
            ]),
            cyclesList,
            feedbackNode,
            domSafe.el('div', { className: 'ev-period-config-footer' }, [
                domSafe.el('p', {
                    className: 'ev-period-config-note',
                    text: 'Alterar o modelo ou as datas reorganiza apenas o agrupamento dos gráficos — nenhuma sessão salva é apagada.'
                }),
                domSafe.el('div', { className: 'ev-period-config-actions' }, [
                    domSafe.el('button', { type: 'button', id: 'evBtnFecharConfigPeriodos', className: 'tp-btn tp-btn-outline tp-btn-sm', text: 'Fechar' }),
                    domSafe.el('button', { type: 'button', id: 'evBtnSalvarPeriodos', className: 'tp-btn tp-btn-primary tp-btn-sm', text: 'Salvar períodos' })
                ])
            ])
        ]);

        function atualizarDatasDoFormulario() {
            var inputs = panel.querySelectorAll('.ev-period-date-input');
            for (var k = 0; k < inputs.length; k++) {
                var inp = inputs[k];
                var idxC = Number(inp.getAttribute('data-cycle-index'));
                var campo = inp.getAttribute('data-field');
                if (cfg.ciclos[idxC] && (campo === 'inicio' || campo === 'fim')) {
                    cfg.ciclos[idxC][campo] = inp.value || '';
                }
            }
            rascunhoConfigPeriodos = cfg;
        }

        btnBim.addEventListener('click', function () {
            var anoVal = Number(inputAno.value) || cfg.ano;
            rascunhoConfigPeriodos = periods.gerarConfiguracaoPadrao('bimestre', anoVal);
            configPeriodosFeedback = '';
            render(rootContainer);
        });

        btnTri.addEventListener('click', function () {
            var anoVal = Number(inputAno.value) || cfg.ano;
            rascunhoConfigPeriodos = periods.gerarConfiguracaoPadrao('trimestre', anoVal);
            configPeriodosFeedback = '';
            render(rootContainer);
        });

        btnRestaurar.addEventListener('click', function () {
            var anoVal = Number(inputAno.value) || cfg.ano;
            rascunhoConfigPeriodos = periods.gerarConfiguracaoPadrao(cfg.modelo, anoVal);
            configPeriodosFeedback = 'Datas restauradas para o padrão de ' + anoVal + '. Toque em "Salvar períodos" para aplicar.';
            configPeriodosFeedbackTipo = 'success';
            render(rootContainer);
        });

        var btnFechar = panel.querySelector('#evBtnFecharConfigPeriodos');
        if (btnFechar) {
            btnFechar.addEventListener('click', function () {
                configPeriodosAberta = false;
                configPeriodosFeedback = '';
                rascunhoConfigPeriodos = null;
                render(rootContainer);
            });
        }

        var btnSalvar = panel.querySelector('#evBtnSalvarPeriodos');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', function () {
                atualizarDatasDoFormulario();
                var anoVal = Number(inputAno.value) || cfg.ano;
                var payload = {
                    modelo: cfg.modelo,
                    ano: Math.max(2000, Math.min(2100, Math.floor(anoVal))),
                    ciclos: cfg.ciclos
                };
                if (!storage || typeof storage.salvarPeriodosLetivos !== 'function') {
                    return;
                }
                var res = storage.salvarPeriodosLetivos(payload);
                if (!res || !res.ok) {
                    configPeriodosFeedback = (res && res.erro) ? res.erro : 'Não foi possível salvar os períodos letivos.';
                    configPeriodosFeedbackTipo = 'error';
                    render(rootContainer);
                    return;
                }

                rascunhoConfigPeriodos = res.periodosLetivos;
                if (filtroPeriodoId && !periods.obterCicloPorId(res.periodosLetivos, filtroPeriodoId)) {
                    filtroPeriodoId = null;
                }
                configPeriodosFeedback = 'Períodos letivos salvos! Os gráficos já refletem o novo agrupamento.';
                configPeriodosFeedbackTipo = 'success';
                render(rootContainer);
            });
        }

        return panel;
    }

    /**
     * Constrói o DOM do estado vazio para seleção sem sessões ou período letivo sem registros.
     */
    function renderEstadoVazioDom(periodoVazio) {
        var domSafe = getDomSafe();
        var iconWrap = domSafe.el('div', { className: 'ev-empty-icon' });
        appendSvgIcon(iconWrap, svgEstadoVazio(52));

        if (periodoVazio) {
            return domSafe.el('div', { className: 'ev-empty' }, [
                iconWrap,
                domSafe.el('p', {
                    className: 'ev-empty-title',
                    text: 'Ainda não há sessões registradas no ' + periodoVazio.nome + '.'
                }),
                domSafe.el('p', {
                    className: 'ev-empty-desc',
                    text: 'Escolha outro ciclo acima ou ajuste as datas em "Configurar ciclos" para agrupar suas sessões.'
                })
            ]);
        }

        return domSafe.el('div', { className: 'ev-empty' }, [
            iconWrap,
            domSafe.el('p', { className: 'ev-empty-title', text: 'Ainda não há registros de evolução para esta seleção.' }),
            domSafe.el('p', { className: 'ev-empty-desc' }, [
                'Os registros aparecem automaticamente após concluir atividades nas Fases 1, 2 ou 3 com o ',
                domSafe.el('strong', { text: 'Modo Aula' }),
                ' ativado.'
            ])
        ]);
    }

    /**
     * Constrói o DOM dos 3 cards de resumo (Pontos fortes, Comparativo, Pontos de atenção).
     */
    function renderCardsResumoDom(resumo, modo) {
        var domSafe = getDomSafe();
        var ehPeriodo = modo === 'PERIODO';
        var comp = resumo.comparativo || {};
        var metDia = (ehPeriodo ? resumo.metricasPeriodo : resumo.metricasDia) || { taxaAcerto: 0, acertos: 0, tentativas: 0 };
        var metAnt = resumo.metricasAnterior || null;

        // Card 1: Pontos fortes
        var listaFortes = domSafe.el('ul', { className: 'ev-card-list' });
        var fortes = Array.isArray(resumo.pontosFortes) ? resumo.pontosFortes : [];
        for (var i = 0; i < fortes.length; i++) {
            listaFortes.appendChild(domSafe.el('li', { text: fortes[i] }));
        }

        // Card 2: Em relação ao dia/período anterior
        var f1Dia = obterMetricasFase(metDia.porFase, 'fase1');
        var f1Ant = metAnt ? obterMetricasFase(metAnt.porFase, 'fase1') : null;
        var deltaTextoBig = ehPeriodo ? '1º ciclo' : '1º dia';
        var deltaClasse = 'ev-delta-flat';
        var deltaLabel = 'Início';
        var labelAtual = ehPeriodo
            ? (resumo.periodoAtual ? resumo.periodoAtual.sigla : 'Período')
            : 'Dia analisado';
        var labelAnterior = ehPeriodo
            ? (resumo.periodoAnterior ? resumo.periodoAnterior.sigla : 'Anterior')
            : formatarDataBR(resumo.dataAnterior);
        var labelAtualCurto = ehPeriodo
            ? (resumo.periodoAtual ? resumo.periodoAtual.sigla : 'Atual')
            : formatarDataBR(resumo.dataReferencia);

        var deltaSub = metDia.tentativas > 0
            ? (labelAtual + ': ' + metDia.taxaAcerto + '% (' + metDia.acertos + ' de ' + metDia.tentativas + (metDia.tentativas === 1 ? ' tentativa)' : ' tentativas)'))
            : (f1Dia.modoMetrica === 'tempo'
                ? ('Fase 1 (Memória): média de ' + formatarTempoSegundos(f1Dia.tempoMedioSegundos) + ' (' + f1Dia.rodadas + (f1Dia.rodadas === 1 ? ' rodada' : ' rodadas') + ')')
                : (labelAtual + ' registrado.'));

        if (comp.temDiaAnterior && metAnt) {
            if (comp.tipoComparativo === 'tempo_fase1' && f1Dia.modoMetrica === 'tempo' && f1Ant && f1Ant.modoMetrica === 'tempo') {
                var diffSeg = comp.variacaoTempoFase1 || 0;
                deltaTextoBig = (diffSeg > 0 ? '+' : '') + diffSeg + 's';
                if (comp.tendencia === 'up') {
                    deltaClasse = 'ev-delta-up';
                    deltaLabel = 'Mais ágil';
                } else if (comp.tendencia === 'down') {
                    deltaClasse = 'ev-delta-down';
                    deltaLabel = 'Atenção';
                } else {
                    deltaClasse = 'ev-delta-flat';
                    deltaLabel = 'Estável';
                }
                deltaSub = (ehPeriodo ? 'No período (F1): ' : 'No dia (F1): ') + formatarTempoSegundos(f1Dia.tempoMedioSegundos) +
                    ' | Anterior (' + labelAnterior + '): ' + formatarTempoSegundos(f1Ant.tempoMedioSegundos);
            } else if (comp.tipoComparativo === 'sem_base_comum') {
                deltaTextoBig = '—';
                deltaClasse = 'ev-delta-flat';
                deltaLabel = 'Fases distintas';
                deltaSub = 'Fases diferentes entre ' + labelAtualCurto + ' e ' + labelAnterior;
            } else {
                var diff = comp.variacaoTaxaAcerto || 0;
                deltaTextoBig = (diff > 0 ? '+' : '') + diff + '%';
                if (comp.tendencia === 'up') {
                    deltaClasse = 'ev-delta-up';
                    deltaLabel = 'Melhora';
                } else if (comp.tendencia === 'down') {
                    deltaClasse = 'ev-delta-down';
                    deltaLabel = 'Atenção';
                } else {
                    deltaClasse = 'ev-delta-flat';
                    deltaLabel = 'Estável';
                }
                deltaSub = (ehPeriodo ? 'No período: ' : 'No dia: ') + metDia.taxaAcerto + '% | Anterior (' +
                    labelAnterior + '): ' + metAnt.taxaAcerto + '%';
            }
        }

        var msgsMelhoria = domSafe.el('ul', { className: 'ev-card-list' });
        var msgs = Array.isArray(comp.mensagensMelhoria) ? comp.mensagensMelhoria : [];
        for (var m = 0; m < msgs.length; m++) {
            msgsMelhoria.appendChild(domSafe.el('li', { text: msgs[m] }));
        }

        // Card 3: Pontos de atenção para revisar
        var listaAtencao = domSafe.el('ul', { className: 'ev-card-list' });
        var atencao = Array.isArray(resumo.pontosAtencao) ? resumo.pontosAtencao : [];
        for (var a = 0; a < atencao.length; a++) {
            listaAtencao.appendChild(domSafe.el('li', { text: atencao[a] }));
        }

        var titleStrong = domSafe.el('h4', { className: 'ev-card-title' });
        appendSvgIcon(titleStrong, svgEstrela(18));
        titleStrong.appendChild(domSafe.text(' '));
        titleStrong.appendChild(domSafe.el('span', { text: 'Pontos fortes' }));

        var titleDelta = domSafe.el('h4', { className: 'ev-card-title' });
        appendSvgIcon(titleDelta, svgComparativo(18));
        titleDelta.appendChild(domSafe.text(' '));
        titleDelta.appendChild(domSafe.el('span', {
            text: ehPeriodo ? 'Em relação ao período anterior' : 'Em relação ao dia anterior'
        }));

        var deltaBadge = domSafe.el('span', { className: 'ev-delta-badge ' + deltaClasse });
        appendSvgIcon(deltaBadge, svgSetaDelta(comp.tendencia));
        deltaBadge.appendChild(domSafe.text(' ' + deltaLabel));

        var titleAlert = domSafe.el('h4', { className: 'ev-card-title' });
        appendSvgIcon(titleAlert, svgAlerta(18));
        titleAlert.appendChild(domSafe.text(' '));
        titleAlert.appendChild(domSafe.el('span', { text: 'Pontos de atenção para revisar' }));

        return domSafe.el('div', { className: 'ev-summary-grid' }, [
            domSafe.el('div', { className: 'ev-card ev-card-strong' }, [titleStrong, listaFortes]),
            domSafe.el('div', { className: 'ev-card ev-card-delta' }, [
                titleDelta,
                domSafe.el('div', { className: 'ev-delta-row' }, [
                    domSafe.el('span', { className: 'ev-delta-big', text: deltaTextoBig }),
                    deltaBadge
                ]),
                domSafe.el('p', { className: 'ev-delta-sub', text: deltaSub }),
                msgsMelhoria
            ]),
            domSafe.el('div', { className: 'ev-card ev-card-alert' }, [titleAlert, listaAtencao])
        ]);
    }

    /**
     * Constrói o DOM do painel de desempenho quebrado por fase no dia ou período selecionado.
     */
    function renderDesempenhoPorFaseDom(resumo, modo) {
        var domSafe = getDomSafe();
        var ehPeriodo = modo === 'PERIODO';
        var metDia = (ehPeriodo ? resumo.metricasPeriodo : resumo.metricasDia) || {};
        var metAnt = resumo.metricasAnterior || null;
        var porFaseDia = metDia.porFase || null;
        var porFaseAnt = (metAnt && metAnt.porFase) ? metAnt.porFase : null;

        var grid = domSafe.el('div', { className: 'ev-phases-grid' });
        for (var i = 0; i < FASES_CONFIG.length; i++) {
            var cfg = FASES_CONFIG[i];
            var met = obterMetricasFase(porFaseDia, cfg.key);
            var ant = porFaseAnt ? obterMetricasFase(porFaseAnt, cfg.key) : null;

            var deltaBadgeNode = null;
            var pctTexto = '—';
            var largura = 0;
            var countTexto = 'Sem registros nesta fase';

            if (cfg.key === 'fase1' && met.modoMetrica === 'tempo') {
                if (ant && ant.modoMetrica === 'tempo') {
                    var diffSegF1 = met.tempoMedioSegundos - ant.tempoMedioSegundos;
                    var deltaClasseF1 = diffSegF1 < 0 ? 'is-up' : (diffSegF1 > 0 ? 'is-down' : 'is-flat');
                    var deltaTextoF1 = diffSegF1 === 0 ? '=' : ((diffSegF1 > 0 ? '+' : '') + diffSegF1 + 's');
                    deltaBadgeNode = domSafe.el('span', { className: 'ev-phase-delta ' + deltaClasseF1, text: deltaTextoF1 });
                }
                pctTexto = formatarTempoSegundos(met.tempoMedioSegundos);
                countTexto = 'Média em ' + met.rodadas + (met.rodadas === 1 ? ' rodada concluída' : ' rodadas concluídas');
                largura = Math.max(20, Math.min(100, Math.round(100 - Math.max(0, met.tempoMedioSegundos - 15) * (80 / 75))));
            } else {
                if (met.temDados && ant && ant.temDados && ant.taxaAcerto !== null && met.taxaAcerto !== null) {
                    var diff = met.taxaAcerto - ant.taxaAcerto;
                    var deltaClasse = diff > 0 ? 'is-up' : (diff < 0 ? 'is-down' : 'is-flat');
                    var deltaTexto = diff === 0 ? '=' : ((diff > 0 ? '+' : '') + diff + '%');
                    deltaBadgeNode = domSafe.el('span', { className: 'ev-phase-delta ' + deltaClasse, text: deltaTexto });
                }

                pctTexto = met.temDados ? (String(met.taxaAcerto) + '%') : '—';
                largura = met.temDados ? Math.max(0, Math.min(100, met.taxaAcerto)) : 0;
                if (met.temDados) {
                    countTexto = met.acertos + ' de ' + met.tentativas + (met.tentativas === 1 ? ' tentativa' : ' tentativas');
                    if (cfg.key === 'fase1' && met.modoMetrica === 'legado_taxa') {
                        countTexto += ' (registro antigo)';
                    }
                }
            }

            var fillEl = domSafe.el('div', { className: 'ev-phase-progress-fill ' + cfg.fillClasse });
            fillEl.style.width = largura + '%';

            grid.appendChild(domSafe.el('div', {
                className: 'ev-phase-card ' + cfg.classe + (met.temDados ? '' : ' is-empty')
            }, [
                domSafe.el('div', { className: 'ev-phase-top' }, [
                    domSafe.el('span', { className: 'ev-phase-tag', text: cfg.titulo }),
                    deltaBadgeNode
                ]),
                domSafe.el('div', { className: 'ev-phase-metrics' }, [
                    domSafe.el('span', { className: 'ev-phase-pct', text: pctTexto }),
                    domSafe.el('span', { className: 'ev-phase-count', text: countTexto })
                ]),
                domSafe.el('div', { className: 'ev-phase-progress-track' }, [fillEl])
            ]));
        }

        var headerTitle = domSafe.el('h4', { className: 'ev-chart-title' });
        appendSvgIcon(headerTitle, svgGraficoBarras(18));
        headerTitle.appendChild(domSafe.text(' '));
        headerTitle.appendChild(domSafe.el('span', {
            text: ehPeriodo ? 'Desempenho por fase no período' : 'Desempenho por fase no dia'
        }));

        var badgeTexto = ehPeriodo && resumo.periodoAtual
            ? (resumo.periodoAtual.nome + ' (' + formatarDataBR(resumo.periodoAtual.inicio) + ' a ' + formatarDataBR(resumo.periodoAtual.fim) + ')')
            : formatarDataBR(resumo.dataReferencia);

        var notaLegadoNode = metDia.temDadosLegadosSemFase
            ? domSafe.el('p', {
                className: 'ev-legacy-note',
                text: 'Registros antigos de Jornada Completa anteriores a esta atualização aparecem no consolidado geral.'
            })
            : null;

        return domSafe.el('div', { className: 'ev-phases-panel' }, [
            domSafe.el('div', { className: 'ev-phases-header' }, [
                headerTitle,
                domSafe.el('span', { className: 'ev-phases-date-badge', text: badgeTexto })
            ]),
            grid,
            notaLegadoNode
        ]);
    }

    /**
     * Constrói o DOM dos dois gráficos em HTML/CSS puro (evolução diária ou por período + dificuldades).
     */
    function renderGraficosDom(resumo, modo) {
        var domSafe = getDomSafe();
        var ehPeriodo = modo === 'PERIODO';
        // Gráfico 1: Barras verticais agrupadas por fase (diária ou por período letivo)
        var serie = ehPeriodo
            ? (Array.isArray(resumo.seriePeriodos) ? resumo.seriePeriodos : [])
            : (Array.isArray(resumo.serieDiaria) ? resumo.serieDiaria : []);
        var usaLegado = false;
        var maxTempoF1 = 30;

        for (var u = 0; u < serie.length; u++) {
            var pCheck = serie[u] || {};
            var chk1 = obterMetricasFase(pCheck.porFase, 'fase1');
            var chk2 = obterMetricasFase(pCheck.porFase, 'fase2');
            var chk3 = obterMetricasFase(pCheck.porFase, 'fase3');
            if (chk1.modoMetrica === 'tempo' && chk1.tempoMedioSegundos > maxTempoF1) {
                maxTempoF1 = chk1.tempoMedioSegundos;
            }
            if (!chk1.temDados && !chk2.temDados && !chk3.temDados && Number(pCheck.tentativas) > 0) {
                usaLegado = true;
            }
        }

        var legendaEl = domSafe.el('div', { className: 'ev-phase-legend' });
        for (var lg = 0; lg < FASES_CONFIG.length; lg++) {
            var lCfg = FASES_CONFIG[lg];
            var legendaTexto = lCfg.key === 'fase1'
                ? 'Fase 1: Memória (tempo médio)'
                : (lCfg.titulo + ' (% acertos)');
            legendaEl.appendChild(domSafe.el('span', { className: 'ev-legend-item' }, [
                domSafe.el('span', { className: 'ev-legend-dot ' + lCfg.fillClasse }),
                domSafe.el('span', { text: legendaTexto })
            ]));
        }
        if (usaLegado) {
            legendaEl.appendChild(domSafe.el('span', { className: 'ev-legend-item' }, [
                domSafe.el('span', { className: 'ev-legend-dot is-legacy' }),
                domSafe.el('span', { text: 'Geral (registro antigo)' })
            ]));
        }

        var colunasWrap = domSafe.el('div', { className: 'ev-vbars-grouped' });
        for (var i = 0; i < serie.length; i++) {
            var ponto = serie[i] || {};
            var classeCol = '';
            if (ponto.isReferencia) {
                classeCol = ' is-ref';
            } else if (ponto.isAnterior) {
                classeCol = ' is-prev';
            }

            var eixoLabel = ehPeriodo
                ? String(ponto.sigla || ponto.nome || '')
                : String(ponto.dataCurta || '');
            var prefixoTooltip = ehPeriodo
                ? ((ponto.nome || eixoLabel) + (ponto.intervaloBR ? ' (' + ponto.intervaloBR + ')' : ''))
                : String(ponto.dataCurta || '');

            var f1 = obterMetricasFase(ponto.porFase, 'fase1');
            var f2 = obterMetricasFase(ponto.porFase, 'fase2');
            var f3 = obterMetricasFase(ponto.porFase, 'fase3');
            var temAlgumaFase = f1.temDados || f2.temDados || f3.temDados;

            var miniGroup = domSafe.el('div', { className: 'ev-vbar-mini-group' });
            if (temAlgumaFase) {
                var fasesDoDia = [f1, f2, f3];
                for (var fi = 0; fi < FASES_CONFIG.length; fi++) {
                    var cfgF = FASES_CONFIG[fi];
                    var mf = fasesDoDia[fi];
                    var valTexto = '—';
                    var altura = 0;
                    var tooltip = prefixoTooltip + ' - ' + cfgF.titulo + ': Sem registros';

                    if (cfgF.key === 'fase1' && mf.modoMetrica === 'tempo') {
                        valTexto = formatarTempoCurto(mf.tempoMedioSegundos);
                        altura = Math.max(18, Math.min(100, Math.round((mf.tempoMedioSegundos / maxTempoF1) * 100)));
                        tooltip = prefixoTooltip + ' - ' + cfgF.titulo + ': média de ' +
                            formatarTempoSegundos(mf.tempoMedioSegundos) + ' (' + mf.rodadas +
                            (mf.rodadas === 1 ? ' rodada)' : ' rodadas)');
                    } else if (mf.temDados) {
                        valTexto = String(mf.taxaAcerto) + '%';
                        altura = Math.max(0, Math.min(100, mf.taxaAcerto));
                        tooltip = prefixoTooltip + ' - ' + cfgF.titulo + ': ' + mf.taxaAcerto + '% (' +
                            mf.acertos + ' de ' + mf.tentativas + ')' +
                            (cfgF.key === 'fase1' && mf.modoMetrica === 'legado_taxa' ? ' [registro antigo]' : '');
                    }

                    var miniFill = domSafe.el('div', { className: 'ev-mini-fill ' + cfgF.fillClasse });
                    miniFill.style.height = altura + '%';

                    miniGroup.appendChild(domSafe.el('div', {
                        className: 'ev-mini-bar' + (mf.temDados ? '' : ' is-empty'),
                        title: tooltip
                    }, [
                        domSafe.el('span', { className: 'ev-mini-val', text: valTexto }),
                        domSafe.el('div', { className: 'ev-mini-track' }, [miniFill])
                    ]));
                }
            } else if (Number(ponto.tentativas) > 0) {
                var taxaGeral = Math.max(0, Math.min(100, Number(ponto.taxaAcerto) || 0));
                var tooltipLegado = prefixoTooltip + ' - Geral (registro antigo): ' + taxaGeral + '% (' + ponto.acertos + ' de ' + ponto.tentativas + ')';
                var legacyFill = domSafe.el('div', { className: 'ev-mini-fill is-legacy' });
                legacyFill.style.height = taxaGeral + '%';

                miniGroup.appendChild(domSafe.el('div', {
                    className: 'ev-mini-bar is-legacy-bar',
                    title: tooltipLegado
                }, [
                    domSafe.el('span', { className: 'ev-mini-val', text: String(taxaGeral) + '%' }),
                    domSafe.el('div', { className: 'ev-mini-track' }, [legacyFill])
                ]));
            } else {
                var emptyFill = domSafe.el('div', { className: 'ev-mini-fill is-legacy' });
                emptyFill.style.height = '0%';

                miniGroup.appendChild(domSafe.el('div', {
                    className: 'ev-mini-bar is-empty',
                    title: prefixoTooltip + ': Sem registros'
                }, [
                    domSafe.el('span', { className: 'ev-mini-val', text: '—' }),
                    domSafe.el('div', { className: 'ev-mini-track' }, [emptyFill])
                ]));
            }

            colunasWrap.appendChild(domSafe.el('div', { className: 'ev-vbar-group-col' + classeCol }, [
                miniGroup,
                domSafe.el('span', { className: 'ev-vbar-label', text: eixoLabel })
            ]));
        }

        // Gráfico 2: Barras horizontais de dificuldades observadas
        var ranking = Array.isArray(resumo.rankingDificuldades) ? resumo.rankingDificuldades : [];
        var dificuldadesNode;

        if (ehPeriodo && resumo.periodoSemRegistros) {
            dificuldadesNode = domSafe.el('div', { className: 'ev-positive-msg' }, [
                domSafe.el('p', {
                    className: 'ev-positive-title',
                    text: 'Sem registros no período selecionado.'
                }),
                domSafe.el('p', {
                    className: 'ev-positive-desc',
                    text: 'Compare os demais ciclos no gráfico ao lado ou selecione outro período letivo acima.'
                })
            ]);
        } else if (ranking.length === 0) {
            var posIcon = domSafe.el('div', { className: 'ev-positive-icon' });
            appendSvgIcon(posIcon, svgDenteFeliz(44));
            dificuldadesNode = domSafe.el('div', { className: 'ev-positive-msg' }, [
                posIcon,
                domSafe.el('p', {
                    className: 'ev-positive-title',
                    text: ehPeriodo ? 'Nenhuma dificuldade registrada neste período!' : 'Nenhuma dificuldade registrada neste dia!'
                }),
                domSafe.el('p', {
                    className: 'ev-positive-desc',
                    text: 'Excelente desempenho: todas as tentativas analisadas foram concluídas sem trocas ou travas.'
                })
            ]);
        } else {
            var hbarsWrap = domSafe.el('div', { className: 'ev-hbars' });
            for (var j = 0; j < ranking.length; j++) {
                var item = ranking[j];
                var isSilaba = item.tipo === 'silaba';
                var tagClass = isSilaba ? 'ev-hbar-tag-syl' : 'ev-hbar-tag-ort';
                var tagTexto = isSilaba ? 'Sílaba' : 'Ortografia';
                var fillClass = isSilaba ? ' is-syl' : '';
                var largura = Math.max(12, Math.min(100, Number(item.percentualBarra) || 12));
                var countTexto = item.count + (item.count === 1 ? ' vez' : ' vezes');
                var exemplosNode = (Array.isArray(item.exemplos) && item.exemplos.length > 0)
                    ? domSafe.el('div', { className: 'ev-hbar-examples', text: 'Ex.: ' + item.exemplos.join(', ') })
                    : null;

                var hbarFill = domSafe.el('div', { className: 'ev-hbar-fill' + fillClass });
                hbarFill.style.width = largura + '%';

                hbarsWrap.appendChild(domSafe.el('div', { className: 'ev-hbar-row' }, [
                    domSafe.el('div', { className: 'ev-hbar-meta' }, [
                        domSafe.el('span', { className: 'ev-hbar-name', text: String(item.nome || '') }),
                        domSafe.el('span', { className: 'ev-hbar-tag ' + tagClass, text: tagTexto }),
                        domSafe.el('span', { className: 'ev-hbar-count', text: countTexto })
                    ]),
                    domSafe.el('div', { className: 'ev-hbar-track' }, [hbarFill]),
                    exemplosNode
                ]));
            }
            dificuldadesNode = hbarsWrap;
        }

        var chartTitle1 = domSafe.el('h4', { className: 'ev-chart-title' });
        appendSvgIcon(chartTitle1, svgGraficoBarras(18));
        chartTitle1.appendChild(domSafe.text(' '));
        chartTitle1.appendChild(domSafe.el('span', {
            text: ehPeriodo
                ? 'Comparativo por período letivo (F1 tempo | F2 e F3 % acertos)'
                : 'Evolução diária por fase (F1 tempo | F2 e F3 % acertos)'
        }));

        var chartTitle2 = domSafe.el('h4', { className: 'ev-chart-title' });
        appendSvgIcon(chartTitle2, svgLupa(18));
        chartTitle2.appendChild(domSafe.text(' '));
        chartTitle2.appendChild(domSafe.el('span', { text: 'Principais dificuldades observadas' }));

        var foraNota = (ehPeriodo && resumo.sessoesForaDosCiclosCount > 0)
            ? domSafe.el('p', {
                className: 'ev-period-out-note',
                text: 'Obs.: ' + resumo.sessoesForaDosCiclosCount +
                    (resumo.sessoesForaDosCiclosCount === 1
                        ? ' sessão registrada está fora das datas dos períodos configurados.'
                        : ' sessões registradas estão fora das datas dos períodos configurados.')
            })
            : null;

        return domSafe.el('div', { className: 'ev-charts-grid' }, [
            domSafe.el('div', { className: 'ev-chart-box' }, [
                chartTitle1,
                legendaEl,
                colunasWrap,
                foraNota
            ]),
            domSafe.el('div', { className: 'ev-chart-box' }, [
                chartTitle2,
                dificuldadesNode
            ])
        ]);
    }

    /**
     * Constrói o DOM do rodapé com botão de limpeza segura em 2 toques.
     */
    function renderRodapeDom() {
        var domSafe = getDomSafe();
        return domSafe.el('div', { className: 'ev-footer' }, [
            domSafe.el('button', {
                type: 'button',
                className: 'ev-btn-danger',
                id: 'evBtnLimparHistorico',
                text: 'Limpar histórico de evolução'
            })
        ]);
    }

    /**
     * Cria um elemento DOM com classe e textContent seguros (prevencao XSS).
     */
    function criarEl(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) {
            node.textContent = String(text);
        }
        return node;
    }

    /**
     * Formata resumo compacto da Fase 1 para a tabela Aluno por Aluno.
     */
    function formatarCelulaAlunoFase1(f1) {
        if (!f1 || !f1.temDados) return '—';
        if (f1.modoMetrica === 'tempo' && f1.tempoMedioSegundos !== null && f1.tempoMedioSegundos !== undefined) {
            var rod = Number(f1.rodadas) || 1;
            return formatarTempoSegundos(f1.tempoMedioSegundos) + ' (' + rod + ' rod.)';
        }
        if (f1.taxaAcerto !== null && f1.taxaAcerto !== undefined) {
            return f1.taxaAcerto + '% (ant.)';
        }
        return '—';
    }

    /**
     * Formata resumo compacto das Fases 2 e 3 para a tabela Aluno por Aluno.
     */
    function formatarCelulaAlunoFaseTaxa(f) {
        if (!f || !f.temDados || f.taxaAcerto === null || f.taxaAcerto === undefined) {
            return '—';
        }
        return f.taxaAcerto + '% (' + (f.acertos || 0) + '/' + (f.tentativas || 0) + ')';
    }

    /**
     * Renderiza a visao panoramica Aluno por Aluno usando 100% DOM seguro.
     */
    function renderVisaoAlunosDom(mountEl, storage, analytics, contextoAlunos, rootContainer) {
        if (!mountEl) return;
        mountEl.textContent = '';

        var ctxAl = (contextoAlunos && typeof contextoAlunos === 'object')
            ? contextoAlunos
            : { dataRef: contextoAlunos || null, periodoAtual: null };
        var dataRef = ctxAl.dataRef || null;
        var periodoAtual = ctxAl.periodoAtual || null;

        var temDataRef = Boolean(dataRef);
        var temPeriodo = Boolean(periodoAtual && periodoAtual.id);
        if (escopoAlunos === 'DIA' && !temDataRef) {
            escopoAlunos = 'GERAL';
        }
        if (escopoAlunos === 'PERIODO' && !temPeriodo) {
            escopoAlunos = 'GERAL';
        }

        var panel = criarEl('div', 'ev-students-panel');
        var header = criarEl('div', 'ev-students-header');

        var titleEl = criarEl('h4', 'ev-chart-title');
        var iconSpan = criarEl('span', 'ev-title-icon');
        appendSvgIcon(iconSpan, svgUsuarios(18));
        titleEl.appendChild(iconSpan);
        titleEl.appendChild(criarEl('span', '', 'Desempenho aluno por aluno'));
        header.appendChild(titleEl);

        var scopeWrap = criarEl('div', 'ev-scope-toggle');
        scopeWrap.setAttribute('role', 'group');
        scopeWrap.setAttribute('aria-label', 'Período da lista de alunos');

        var btnGeral = criarEl('button', 'ev-scope-btn' + (escopoAlunos === 'GERAL' ? ' active' : ''), 'Acumulado geral');
        btnGeral.type = 'button';
        btnGeral.addEventListener('click', function () {
            if (escopoAlunos !== 'GERAL') {
                escopoAlunos = 'GERAL';
                renderVisaoAlunosDom(mountEl, storage, analytics, ctxAl, rootContainer);
            }
        });

        var btnPeriodoLabel = temPeriodo ? ('Período (' + periodoAtual.sigla + ')') : 'Período letivo';
        var btnPeriodo = criarEl('button', 'ev-scope-btn' + (escopoAlunos === 'PERIODO' ? ' active' : ''), btnPeriodoLabel);
        btnPeriodo.type = 'button';
        btnPeriodo.disabled = !temPeriodo;
        btnPeriodo.addEventListener('click', function () {
            if (temPeriodo && escopoAlunos !== 'PERIODO') {
                escopoAlunos = 'PERIODO';
                renderVisaoAlunosDom(mountEl, storage, analytics, ctxAl, rootContainer);
            }
        });

        var btnDiaLabel = temDataRef ? ('Dia (' + formatarDataBR(dataRef) + ')') : 'Dia analisado';
        var btnDia = criarEl('button', 'ev-scope-btn' + (escopoAlunos === 'DIA' ? ' active' : ''), btnDiaLabel);
        btnDia.type = 'button';
        btnDia.disabled = !temDataRef;
        btnDia.addEventListener('click', function () {
            if (temDataRef && escopoAlunos !== 'DIA') {
                escopoAlunos = 'DIA';
                renderVisaoAlunosDom(mountEl, storage, analytics, ctxAl, rootContainer);
            }
        });

        scopeWrap.appendChild(btnGeral);
        scopeWrap.appendChild(btnPeriodo);
        scopeWrap.appendChild(btnDia);
        header.appendChild(scopeWrap);
        panel.appendChild(header);

        var lista = (analytics && typeof analytics.gerarResumoPorAluno === 'function')
            ? analytics.gerarResumoPorAluno({
                escopo: escopoAlunos,
                dataReferencia: dataRef,
                periodoId: periodoAtual ? periodoAtual.id : null,
                dataInicio: periodoAtual ? periodoAtual.inicio : null,
                dataFim: periodoAtual ? periodoAtual.fim : null
            })
            : [];

        if (!Array.isArray(lista) || lista.length === 0) {
            var emptyBox = criarEl('p', 'ev-students-empty',
                'Nenhum aluno cadastrado ainda. Adicione os alunos na aba "Turma e Modo" para acompanhar o desempenho individual nas 3 fases.'
            );
            panel.appendChild(emptyBox);
            mountEl.appendChild(panel);
            return;
        }

        var tableWrap = criarEl('div', 'ev-students-table-wrap');
        var table = criarEl('table', 'ev-students-table');
        var thead = document.createElement('thead');
        var trHead = document.createElement('tr');
        var colunas = ['Aluno', 'Sessões', 'Fase 1 (Memória)', 'Fase 2 (Sílabas)', 'Fase 3 (Escrita)', 'Gráficos'];
        for (var c = 0; c < colunas.length; c++) {
            trHead.appendChild(criarEl('th', '', colunas[c]));
        }
        thead.appendChild(trHead);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        for (var i = 0; i < lista.length; i++) {
            (function (al) {
                var selecionado = filtroAlunoId === al.id;
                var tr = document.createElement('tr');
                if (selecionado) tr.className = 'is-selected';

                var tdNome = criarEl('td', 'ev-st-name');
                tdNome.setAttribute('data-label', 'Aluno');
                tdNome.appendChild(criarEl('span', 'ev-st-name-text', al.nome));
                if (!al.cadastrado) {
                    tdNome.appendChild(criarEl('span', 'ev-st-legacy-tag', 'histórico'));
                }
                tr.appendChild(tdNome);

                var tdSes = criarEl('td', 'ev-st-center', String(al.sessoesCount || 0));
                tdSes.setAttribute('data-label', 'Sessões');
                tr.appendChild(tdSes);

                var f1Txt = formatarCelulaAlunoFase1(al.fase1);
                var tdF1 = criarEl('td', '');
                tdF1.setAttribute('data-label', 'Fase 1');
                tdF1.appendChild(criarEl('span', 'ev-st-pill' + (f1Txt === '—' ? ' is-empty' : ' is-f1'), f1Txt));
                tr.appendChild(tdF1);

                var f2Txt = formatarCelulaAlunoFaseTaxa(al.fase2);
                var tdF2 = criarEl('td', '');
                tdF2.setAttribute('data-label', 'Fase 2');
                tdF2.appendChild(criarEl('span', 'ev-st-pill' + (f2Txt === '—' ? ' is-empty' : ' is-f2'), f2Txt));
                tr.appendChild(tdF2);

                var f3Txt = formatarCelulaAlunoFaseTaxa(al.fase3);
                var tdF3 = criarEl('td', '');
                tdF3.setAttribute('data-label', 'Fase 3');
                tdF3.appendChild(criarEl('span', 'ev-st-pill' + (f3Txt === '—' ? ' is-empty' : ' is-f3'), f3Txt));
                tr.appendChild(tdF3);

                var tdAcao = criarEl('td', 'ev-st-action');
                tdAcao.setAttribute('data-label', 'Gráficos');
                var btnVer = criarEl(
                    'button',
                    'ev-student-detail-btn' + (selecionado ? ' is-selected' : ''),
                    selecionado ? 'Mostrando' : 'Ver detalhes'
                );
                btnVer.type = 'button';
                btnVer.disabled = al.sessoesCount === 0 && !selecionado;
                btnVer.addEventListener('click', function () {
                    filtroAlunoId = selecionado ? 'TODOS' : al.id;
                    filtroDataRef = null;
                    render(rootContainer);
                    var tpBody = document.getElementById('tpBody');
                    if (tpBody) tpBody.scrollTop = 0;
                });
                tdAcao.appendChild(btnVer);
                tr.appendChild(tdAcao);

                tbody.appendChild(tr);
            })(lista[i]);
        }

        table.appendChild(tbody);
        tableWrap.appendChild(table);
        panel.appendChild(tableWrap);
        mountEl.appendChild(panel);
    }

    /**
     * Renderiza o card de Anotacoes Pedagogicas da Professora usando 100% DOM seguro.
     */
    function renderAnotacoesDom(mountEl, storage, rootContainer, mensagemFeedback, tipoFeedback) {
        if (!mountEl) return;
        mountEl.textContent = '';

        var anotacoes = (storage && typeof storage.listarAnotacoes === 'function')
            ? (storage.listarAnotacoes() || [])
            : [];
        var alunos = (storage && typeof storage.listarAlunos === 'function')
            ? (storage.listarAlunos() || [])
            : [];

        var panel = criarEl('div', 'ev-notes-panel');
        var header = criarEl('div', 'ev-notes-header');

        var titleEl = criarEl('h4', 'ev-chart-title');
        var iconSpan = criarEl('span', 'ev-title-icon');
        appendSvgIcon(iconSpan, svgAnotacao(18));
        titleEl.appendChild(iconSpan);
        titleEl.appendChild(criarEl('span', '', 'Anotações da professora'));
        header.appendChild(titleEl);

        var countLabel = anotacoes.length + (anotacoes.length === 1 ? ' anotação' : ' anotações');
        header.appendChild(criarEl('span', 'tp-count-badge', countLabel));
        panel.appendChild(header);

        // Formulario de criacao/edicao
        var form = criarEl('div', 'ev-notes-form');
        var rowSelect = criarEl('div', 'ev-note-field');
        var lblAluno = criarEl('label', 'ev-label', 'Vincular a (opcional)');
        lblAluno.setAttribute('for', 'evNoteAlunoSelect');

        var selectAluno = criarEl('select', 'ev-select');
        selectAluno.id = 'evNoteAlunoSelect';
        selectAluno.appendChild(criarEl('option', '', 'Turma geral'));
        selectAluno.options[0].value = '';

        var achouAlunoSelecionado = (rascunhoAnotacaoAlunoId === '');
        for (var a = 0; a < alunos.length; a++) {
            var alu = alunos[a];
            if (!alu || !alu.id) continue;
            var opt = criarEl('option', '', alu.nome);
            opt.value = String(alu.id);
            if (String(alu.id) === String(rascunhoAnotacaoAlunoId)) {
                achouAlunoSelecionado = true;
            }
            selectAluno.appendChild(opt);
        }
        if (!achouAlunoSelecionado && rascunhoAnotacaoAlunoId) {
            var optExtra = criarEl('option', '', 'Aluno do registro');
            optExtra.value = String(rascunhoAnotacaoAlunoId);
            selectAluno.appendChild(optExtra);
        }
        selectAluno.value = rascunhoAnotacaoAlunoId || '';
        selectAluno.addEventListener('change', function () {
            rascunhoAnotacaoAlunoId = selectAluno.value || '';
        });

        rowSelect.appendChild(lblAluno);
        rowSelect.appendChild(selectAluno);
        form.appendChild(rowSelect);

        var rowText = criarEl('div', 'ev-note-field');
        var lblTexto = criarEl('label', 'ev-label', editandoAnotacaoId ? 'Editando anotação pedagógica' : 'Nova observação pedagógica');
        lblTexto.setAttribute('for', 'evNoteTextInput');

        var textarea = criarEl('textarea', 'tp-textarea');
        textarea.id = 'evNoteTextInput';
        textarea.rows = 3;
        textarea.maxLength = 1000;
        textarea.placeholder = 'Registre avanços, trocas de letras observadas ou combinados para a turma...';
        textarea.value = rascunhoAnotacaoTexto || '';
        textarea.addEventListener('input', function () {
            rascunhoAnotacaoTexto = textarea.value;
        });

        rowText.appendChild(lblTexto);
        rowText.appendChild(textarea);
        form.appendChild(rowText);

        var actionsRow = criarEl('div', 'ev-notes-actions');
        var btnSalvar = criarEl(
            'button',
            'tp-btn tp-btn-primary',
            editandoAnotacaoId ? 'Atualizar anotação' : 'Salvar anotação'
        );
        btnSalvar.type = 'button';
        btnSalvar.id = 'evNoteSaveBtn';

        btnSalvar.addEventListener('click', function () {
            if (!storage) return;
            var texto = textarea.value || '';
            var alunoIdSel = selectAluno.value || '';
            var alunoNomeSel = '';
            if (alunoIdSel && selectAluno.selectedIndex >= 0) {
                alunoNomeSel = selectAluno.options[selectAluno.selectedIndex].textContent || '';
            }

            var res;
            if (editandoAnotacaoId && typeof storage.atualizarAnotacao === 'function') {
                res = storage.atualizarAnotacao(editandoAnotacaoId, {
                    texto: texto,
                    alunoId: alunoIdSel || null,
                    alunoNome: alunoIdSel ? alunoNomeSel : ''
                });
            } else if (typeof storage.adicionarAnotacao === 'function') {
                res = storage.adicionarAnotacao({
                    texto: texto,
                    alunoId: alunoIdSel || null,
                    alunoNome: alunoIdSel ? alunoNomeSel : ''
                });
            }

            if (!res || !res.ok) {
                renderAnotacoesDom(
                    mountEl,
                    storage,
                    rootContainer,
                    (res && res.erro) ? res.erro : 'Não foi possível salvar a anotação.',
                    'error'
                );
                var foc = mountEl.querySelector('#evNoteTextInput');
                if (foc) foc.focus();
                return;
            }

            var foiEdicao = Boolean(editandoAnotacaoId);
            editandoAnotacaoId = null;
            rascunhoAnotacaoTexto = '';
            rascunhoAnotacaoAlunoId = '';
            confirmarExcluirAnotacaoId = null;
            renderAnotacoesDom(
                mountEl,
                storage,
                rootContainer,
                foiEdicao ? 'Anotação atualizada com sucesso!' : 'Anotação salva com sucesso!',
                'success'
            );
        });
        actionsRow.appendChild(btnSalvar);

        if (editandoAnotacaoId) {
            var btnCancelar = criarEl('button', 'tp-btn tp-btn-outline', 'Cancelar edição');
            btnCancelar.type = 'button';
            btnCancelar.id = 'evNoteCancelBtn';
            btnCancelar.addEventListener('click', function () {
                editandoAnotacaoId = null;
                rascunhoAnotacaoTexto = '';
                rascunhoAnotacaoAlunoId = '';
                renderAnotacoesDom(mountEl, storage, rootContainer);
            });
            actionsRow.appendChild(btnCancelar);
        }

        if (mensagemFeedback) {
            var fb = criarEl('span', 'ev-note-feedback' + (tipoFeedback === 'error' ? ' is-error' : ' is-success'), mensagemFeedback);
            actionsRow.appendChild(fb);
        }

        form.appendChild(actionsRow);
        panel.appendChild(form);

        // Lista de anotacoes salvas
        if (anotacoes.length === 0) {
            panel.appendChild(
                criarEl('p', 'ev-notes-empty',
                    'Nenhuma anotação registrada ainda. As anotações são salvas localmente, incluídas no Backup JSON e exibidas no Relatório PDF.'
                )
            );
        } else {
            var listEl = criarEl('div', 'ev-notes-list');
            for (var n = 0; n < anotacoes.length; n++) {
                (function (nota) {
                    var itemEl = criarEl('article', 'ev-note-item');
                    var metaEl = criarEl('div', 'ev-note-meta');

                    var infoLeft = criarEl('div', 'ev-note-meta-left');
                    var vinculoTxt = nota.alunoNome ? nota.alunoNome : 'Turma geral';
                    infoLeft.appendChild(criarEl('span', 'ev-note-badge' + (nota.alunoNome ? ' is-student' : ''), vinculoTxt));
                    infoLeft.appendChild(criarEl('span', 'ev-note-date', formatarDataBR(nota.dataISO)));
                    metaEl.appendChild(infoLeft);

                    var itemActions = criarEl('div', 'ev-note-item-actions');
                    var btnEditar = criarEl('button', 'tp-btn tp-btn-outline tp-btn-sm', 'Editar');
                    btnEditar.type = 'button';
                    btnEditar.addEventListener('click', function () {
                        editandoAnotacaoId = nota.id;
                        rascunhoAnotacaoTexto = nota.texto || '';
                        rascunhoAnotacaoAlunoId = nota.alunoId ? String(nota.alunoId) : '';
                        confirmarExcluirAnotacaoId = null;
                        renderAnotacoesDom(mountEl, storage, rootContainer);
                        var campoTexto = mountEl.querySelector('#evNoteTextInput');
                        if (campoTexto) {
                            campoTexto.focus();
                        }
                    });
                    itemActions.appendChild(btnEditar);

                    var isConfirming = confirmarExcluirAnotacaoId === nota.id;
                    var btnRemover = criarEl(
                        'button',
                        'tp-btn tp-btn-danger tp-btn-sm' + (isConfirming ? ' confirming' : ''),
                        isConfirming ? 'Confirmar?' : 'Remover'
                    );
                    btnRemover.type = 'button';
                    btnRemover.addEventListener('click', function () {
                        if (confirmarExcluirAnotacaoId !== nota.id) {
                            if (confirmarExcluirAnotacaoTimer) {
                                clearTimeout(confirmarExcluirAnotacaoTimer);
                                confirmarExcluirAnotacaoTimer = null;
                            }
                            confirmarExcluirAnotacaoId = nota.id;
                            confirmarExcluirAnotacaoTimer = setTimeout(function () {
                                confirmarExcluirAnotacaoId = null;
                                confirmarExcluirAnotacaoTimer = null;
                                renderAnotacoesDom(mountEl, storage, rootContainer);
                            }, 3500);
                            renderAnotacoesDom(mountEl, storage, rootContainer);
                            return;
                        }

                        if (confirmarExcluirAnotacaoTimer) {
                            clearTimeout(confirmarExcluirAnotacaoTimer);
                            confirmarExcluirAnotacaoTimer = null;
                        }
                        confirmarExcluirAnotacaoId = null;
                        if (editandoAnotacaoId === nota.id) {
                            editandoAnotacaoId = null;
                            rascunhoAnotacaoTexto = '';
                            rascunhoAnotacaoAlunoId = '';
                        }
                        if (storage && typeof storage.removerAnotacao === 'function') {
                            storage.removerAnotacao(nota.id);
                        }
                        renderAnotacoesDom(mountEl, storage, rootContainer, 'Anotação removida.');
                    });
                    itemActions.appendChild(btnRemover);

                    metaEl.appendChild(itemActions);
                    itemEl.appendChild(metaEl);
                    itemEl.appendChild(criarEl('p', 'ev-note-text', nota.texto));
                    listEl.appendChild(itemEl);
                })(anotacoes[n]);
            }
            panel.appendChild(listEl);
        }

        mountEl.appendChild(panel);
    }

    /**
     * Renderiza o painel completo de evolução dentro do elemento container informado.
     */
    function render(containerEl) {
        if (!containerEl) return;

        if (limparConfirmTimer) {
            clearTimeout(limparConfirmTimer);
            limparConfirmTimer = null;
        }
        if (confirmarExcluirAnotacaoTimer) {
            clearTimeout(confirmarExcluirAnotacaoTimer);
            confirmarExcluirAnotacaoTimer = null;
        }
        confirmarExcluirAnotacaoId = null;

        var storage = getStorage();
        var analytics = getAnalytics();

        var opcoesAlunos = montarOpcoesAlunos(storage);

        // Valida se o aluno atualmente selecionado ainda existe nas opções
        var alunoAindaValido = false;
        for (var i = 0; i < opcoesAlunos.length; i++) {
            if (opcoesAlunos[i].value === filtroAlunoId) {
                alunoAindaValido = true;
                break;
            }
        }
        if (!alunoAindaValido) {
            filtroAlunoId = 'TODOS';
            filtroDataRef = null;
        }

        var domSafe = getDomSafe();
        if (!domSafe) return;

        var resumoDia = (analytics && typeof analytics.gerarResumoEvolucao === 'function')
            ? analytics.gerarResumoEvolucao({
                alunoId: filtroAlunoId,
                dataReferencia: filtroDataRef
            })
            : { vazio: true, datasDisponiveis: [] };

        if (!resumoDia || resumoDia.vazio) {
            filtroDataRef = null;
        } else {
            filtroDataRef = resumoDia.dataReferencia;
        }

        var resumoPeriodo = (modoVisualizacao === 'PERIODO' && analytics && typeof analytics.gerarResumoPorPeriodo === 'function')
            ? analytics.gerarResumoPorPeriodo({
                alunoId: filtroAlunoId,
                periodoId: filtroPeriodoId
            })
            : null;

        if (resumoPeriodo && resumoPeriodo.periodoAtual) {
            filtroPeriodoId = resumoPeriodo.periodoAtual.id;
        }

        var periodoAtivo = (resumoPeriodo && resumoPeriodo.periodoAtual) ? resumoPeriodo.periodoAtual : null;
        if (!periodoAtivo) {
            var periodsMod = getPeriods();
            var cfgPerFallback = (storage && typeof storage.getPeriodosLetivos === 'function')
                ? storage.getPeriodosLetivos()
                : null;
            if (cfgPerFallback && periodsMod && typeof periodsMod.sugerirCicloAtivo === 'function') {
                var todasSes = (storage && typeof storage.listarSessoes === 'function') ? storage.listarSessoes() : [];
                periodoAtivo = periodsMod.sugerirCicloAtivo(todasSes, cfgPerFallback);
            }
        }

        var datasDisponiveis = (resumoDia && Array.isArray(resumoDia.datasDisponiveis))
            ? resumoDia.datasDisponiveis
            : [];

        domSafe.clear(containerEl);

        var studentsSection = domSafe.el('div', { id: 'evStudentsSection' });
        var notesSection = domSafe.el('div', { id: 'evNotesSection' });

        var rootChildren = [
            renderFiltrosDom(opcoesAlunos, {
                datasDisponiveis: datasDisponiveis,
                dataSelecionada: filtroDataRef,
                seriePeriodos: resumoPeriodo ? resumoPeriodo.seriePeriodos : [],
                periodoAtual: periodoAtivo
            })
        ];

        if (modoVisualizacao === 'PERIODO' && configPeriodosAberta) {
            var cfgPanel = renderConfigPeriodosDom(storage, containerEl);
            if (cfgPanel) rootChildren.push(cfgPanel);
        }

        if (modoVisualizacao === 'PERIODO' && resumoPeriodo) {
            if (resumoPeriodo.vazio) {
                rootChildren.push(renderEstadoVazioDom(null));
                rootChildren.push(studentsSection);
                rootChildren.push(notesSection);
            } else if (resumoPeriodo.periodoSemRegistros) {
                rootChildren.push(renderEstadoVazioDom(resumoPeriodo.periodoAtual));
                rootChildren.push(renderGraficosDom(resumoPeriodo, 'PERIODO'));
                rootChildren.push(studentsSection);
                rootChildren.push(notesSection);
                rootChildren.push(renderRodapeDom());
            } else {
                rootChildren.push(renderCardsResumoDom(resumoPeriodo, 'PERIODO'));
                rootChildren.push(renderDesempenhoPorFaseDom(resumoPeriodo, 'PERIODO'));
                rootChildren.push(renderGraficosDom(resumoPeriodo, 'PERIODO'));
                rootChildren.push(studentsSection);
                rootChildren.push(notesSection);
                rootChildren.push(renderRodapeDom());
            }
        } else {
            if (!resumoDia || resumoDia.vazio) {
                rootChildren.push(renderEstadoVazioDom(null));
                rootChildren.push(studentsSection);
                rootChildren.push(notesSection);
            } else {
                rootChildren.push(renderCardsResumoDom(resumoDia, 'DIA'));
                rootChildren.push(renderDesempenhoPorFaseDom(resumoDia, 'DIA'));
                rootChildren.push(renderGraficosDom(resumoDia, 'DIA'));
                rootChildren.push(studentsSection);
                rootChildren.push(notesSection);
                rootChildren.push(renderRodapeDom());
            }
        }

        containerEl.appendChild(domSafe.el('div', { className: 'ev-root' }, rootChildren));

        // Monta as secoes Aluno por Aluno e Anotacoes 100% via DOM seguro (textContent)
        renderVisaoAlunosDom(
            studentsSection,
            storage,
            analytics,
            { dataRef: filtroDataRef, periodoAtual: periodoAtivo },
            containerEl
        );
        renderAnotacoesDom(
            notesSection,
            storage,
            containerEl
        );

        // Vincula eventos de alternância Por Dia vs. Por Período Letivo
        var btnModeDia = containerEl.querySelector('#evModeDiaBtn');
        if (btnModeDia) {
            btnModeDia.addEventListener('click', function () {
                if (modoVisualizacao !== 'DIA') {
                    modoVisualizacao = 'DIA';
                    configPeriodosAberta = false;
                    if (escopoAlunos === 'PERIODO') {
                        escopoAlunos = 'GERAL';
                    }
                    render(containerEl);
                }
            });
        }

        var btnModePeriodo = containerEl.querySelector('#evModePeriodoBtn');
        if (btnModePeriodo) {
            btnModePeriodo.addEventListener('click', function () {
                if (modoVisualizacao !== 'PERIODO') {
                    modoVisualizacao = 'PERIODO';
                    escopoAlunos = 'PERIODO';
                    render(containerEl);
                }
            });
        }

        // Vincula eventos dos filtros, configuração de ciclos, exportação PDF e confirmação em 2 toques
        var selectAluno = containerEl.querySelector('#evFilterAluno');
        if (selectAluno) {
            selectAluno.addEventListener('change', function () {
                filtroAlunoId = selectAluno.value || 'TODOS';
                filtroDataRef = null;
                render(containerEl);
            });
        }

        var selectData = containerEl.querySelector('#evFilterData');
        if (selectData) {
            selectData.addEventListener('change', function () {
                filtroDataRef = selectData.value || null;
                render(containerEl);
            });
        }

        var selectPeriodo = containerEl.querySelector('#evFilterPeriodo');
        if (selectPeriodo) {
            selectPeriodo.addEventListener('change', function () {
                filtroPeriodoId = selectPeriodo.value || null;
                render(containerEl);
            });
        }

        var btnConfigPeriodos = containerEl.querySelector('#evBtnConfigPeriodos');
        if (btnConfigPeriodos) {
            btnConfigPeriodos.addEventListener('click', function () {
                configPeriodosAberta = !configPeriodosAberta;
                configPeriodosFeedback = '';
                rascunhoConfigPeriodos = configPeriodosAberta && storage && typeof storage.getPeriodosLetivos === 'function'
                    ? storage.getPeriodosLetivos()
                    : null;
                render(containerEl);
            });
        }

        var btnExportarPdf = containerEl.querySelector('#evBtnExportarPdf');
        if (btnExportarPdf) {
            btnExportarPdf.addEventListener('click', function () {
                var rp = SaudeEscola.ReportPrint;
                if (rp && typeof rp.print === 'function') {
                    if (modoVisualizacao === 'PERIODO') {
                        rp.print({
                            modo: 'PERIODO',
                            periodoId: filtroPeriodoId || (periodoAtivo ? periodoAtivo.id : null),
                            alunoId: filtroAlunoId
                        });
                    } else {
                        rp.print({
                            dataReferencia: filtroDataRef,
                            alunoId: filtroAlunoId
                        });
                    }
                }
            });
        }

        var btnLimpar = containerEl.querySelector('#evBtnLimparHistorico');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', function () {
                if (!btnLimpar.classList.contains('confirming')) {
                    btnLimpar.classList.add('confirming');
                    btnLimpar.textContent = 'Toque novamente para confirmar';
                    btnLimpar.setAttribute('aria-pressed', 'true');

                    limparConfirmTimer = setTimeout(function () {
                        limparConfirmTimer = null;
                        btnLimpar.classList.remove('confirming');
                        btnLimpar.textContent = 'Limpar histórico de evolução';
                        btnLimpar.removeAttribute('aria-pressed');
                    }, 4000);
                    return;
                }

                if (limparConfirmTimer) {
                    clearTimeout(limparConfirmTimer);
                    limparConfirmTimer = null;
                }

                if (storage && typeof storage.limparHistoricoSessoes === 'function') {
                    storage.limparHistoricoSessoes();
                }

                filtroDataRef = null;
                render(containerEl);
            });
        }
    }

    SaudeEscola.EvolutionView = {
        render: render
    };
})(window);
