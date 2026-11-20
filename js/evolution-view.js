/* ==========================================================================
   Painel de Evolução Pedagógica (Visualização HTML/CSS + SVG)
   Projeto: Saúde na Escola: Saúde Bucal
   Compatível com execução offline (file://) e GitHub Pages (sem ES Modules).
   ========================================================================== */
(function (global) {
    'use strict';

    var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

    // Estado local dos filtros preservado entre re-renderizações enquanto válido
    var filtroAlunoId = 'TODOS';
    var filtroDataRef = null;
    var limparConfirmTimer = null;

    /**
     * Escapa caracteres especiais HTML para evitar injeção de marcação.
     */
    function escapeHtml(texto) {
        return String(texto === undefined || texto === null ? '' : texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Obtém dinamicamente o módulo Storage.
     */
    function getStorage() {
        return (global.SaudeEscola && global.SaudeEscola.Storage) ? global.SaudeEscola.Storage : null;
    }

    /**
     * Obtém dinamicamente o módulo Analytics.
     */
    function getAnalytics() {
        return (global.SaudeEscola && global.SaudeEscola.Analytics) ? global.SaudeEscola.Analytics : null;
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
                .replace(/\sheight\s*=\s*(['"]).*?\1/gi, '');
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

    /**
     * Monta a lista deduplicada de opções de alunos (cadastrados + histórico).
     */
    function montarOpcoesAlunos(storage) {
        var opcoes = [];
        var mapaIds = {};
        var mapaChaves = {};

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
     * Gera o HTML da seção de filtros (sempre visível para permitir troca de aluno).
     */
    function renderFiltrosHtml(opcoesAlunos, datasDisponiveis, dataSelecionada) {
        var optionsAlunoHtml = '';
        for (var i = 0; i < opcoesAlunos.length; i++) {
            var opt = opcoesAlunos[i];
            var selected = opt.value === filtroAlunoId ? ' selected' : '';
            optionsAlunoHtml += '<option value="' + escapeHtml(opt.value) + '"' + selected + '>' +
                escapeHtml(opt.label) +
            '</option>';
        }

        var optionsDataHtml = '';
        var desabilitarData = datasDisponiveis.length === 0;
        if (desabilitarData) {
            optionsDataHtml = '<option value="">Nenhum registro</option>';
        } else {
            for (var j = 0; j < datasDisponiveis.length; j++) {
                var d = datasDisponiveis[j];
                var selData = d === dataSelecionada ? ' selected' : '';
                optionsDataHtml += '<option value="' + escapeHtml(d) + '"' + selData + '>' +
                    escapeHtml(formatarDataBR(d)) +
                '</option>';
            }
        }

        return '<div class="ev-filters">' +
            '<div class="ev-filter-group">' +
                '<label class="ev-label" for="evFilterAluno">Aluno / Visão</label>' +
                '<select class="ev-select" id="evFilterAluno">' + optionsAlunoHtml + '</select>' +
            '</div>' +
            '<div class="ev-filter-group">' +
                '<label class="ev-label" for="evFilterData">Dia analisado</label>' +
                '<select class="ev-select" id="evFilterData"' + (desabilitarData ? ' disabled' : '') + '>' +
                    optionsDataHtml +
                '</select>' +
            '</div>' +
        '</div>';
    }

    /**
     * Gera o HTML do estado vazio quando ainda não há sessões no histórico.
     */
    function renderEstadoVazioHtml() {
        return '<div class="ev-empty">' +
            '<div class="ev-empty-icon">' + svgEstadoVazio(52) + '</div>' +
            '<p class="ev-empty-title">Ainda não há registros de evolução para esta seleção.</p>' +
            '<p class="ev-empty-desc">' +
                'Os registros aparecem automaticamente após jogar as Fases 2 ou 3 com o <strong>Modo Aula</strong> ativado.' +
            '</p>' +
        '</div>';
    }

    /**
     * Gera o HTML dos 3 cards de resumo (Pontos fortes, Comparativo, Pontos de atenção).
     */
    function renderCardsResumoHtml(resumo) {
        var comp = resumo.comparativo || {};
        var metDia = resumo.metricasDia || { taxaAcerto: 0, acertos: 0, tentativas: 0 };
        var metAnt = resumo.metricasAnterior || null;

        // Card 1: Pontos fortes
        var listaFortesHtml = '';
        var fortes = Array.isArray(resumo.pontosFortes) ? resumo.pontosFortes : [];
        for (var i = 0; i < fortes.length; i++) {
            listaFortesHtml += '<li>' + escapeHtml(fortes[i]) + '</li>';
        }

        // Card 2: Em relação ao dia anterior
        var deltaTextoBig = '1º dia';
        var deltaClasse = 'ev-delta-flat';
        var deltaLabel = 'Início';
        var deltaSub = 'Dia analisado: ' + metDia.taxaAcerto + '% (' +
            metDia.acertos + ' de ' + metDia.tentativas + ' tentativas)';

        if (comp.temDiaAnterior && metAnt) {
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
            deltaSub = 'No dia: ' + metDia.taxaAcerto + '% | Anterior (' +
                formatarDataBR(resumo.dataAnterior) + '): ' + metAnt.taxaAcerto + '%';
        }

        var msgsMelhoriaHtml = '';
        var msgs = Array.isArray(comp.mensagensMelhoria) ? comp.mensagensMelhoria : [];
        for (var m = 0; m < msgs.length; m++) {
            msgsMelhoriaHtml += '<li>' + escapeHtml(msgs[m]) + '</li>';
        }

        // Card 3: Pontos de atenção para revisar
        var listaAtencaoHtml = '';
        var atencao = Array.isArray(resumo.pontosAtencao) ? resumo.pontosAtencao : [];
        for (var a = 0; a < atencao.length; a++) {
            listaAtencaoHtml += '<li>' + escapeHtml(atencao[a]) + '</li>';
        }

        return '<div class="ev-summary-grid">' +
            '<div class="ev-card ev-card-strong">' +
                '<h4 class="ev-card-title">' + svgEstrela(18) + ' <span>Pontos fortes</span></h4>' +
                '<ul class="ev-card-list">' + listaFortesHtml + '</ul>' +
            '</div>' +
            '<div class="ev-card ev-card-delta">' +
                '<h4 class="ev-card-title">' + svgComparativo(18) + ' <span>Em relação ao dia anterior</span></h4>' +
                '<div class="ev-delta-row">' +
                    '<span class="ev-delta-big">' + escapeHtml(deltaTextoBig) + '</span>' +
                    '<span class="ev-delta-badge ' + deltaClasse + '">' +
                        svgSetaDelta(comp.tendencia) + ' ' + escapeHtml(deltaLabel) +
                    '</span>' +
                '</div>' +
                '<p class="ev-delta-sub">' + escapeHtml(deltaSub) + '</p>' +
                '<ul class="ev-card-list">' + msgsMelhoriaHtml + '</ul>' +
            '</div>' +
            '<div class="ev-card ev-card-alert">' +
                '<h4 class="ev-card-title">' + svgAlerta(18) + ' <span>Pontos de atenção para revisar</span></h4>' +
                '<ul class="ev-card-list">' + listaAtencaoHtml + '</ul>' +
            '</div>' +
        '</div>';
    }

    /**
     * Gera o HTML dos dois gráficos em HTML/CSS puro (evolução diária e ranking de dificuldades).
     */
    function renderGraficosHtml(resumo) {
        // Gráfico 1: Barras verticais de evolução diária
        var serie = Array.isArray(resumo.serieDiaria) ? resumo.serieDiaria : [];
        var colunasHtml = '';
        for (var i = 0; i < serie.length; i++) {
            var ponto = serie[i];
            var classeFill = '';
            var classeCol = '';
            if (ponto.isReferencia) {
                classeFill = ' is-ref';
                classeCol = ' is-ref';
            } else if (ponto.isAnterior) {
                classeFill = ' is-prev';
                classeCol = ' is-prev';
            }
            var altura = Math.max(0, Math.min(100, Number(ponto.taxaAcerto) || 0));
            var tooltip = ponto.dataCurta + ': ' + altura + '% (' + ponto.acertos + ' de ' + ponto.tentativas + ' acertos)';

            colunasHtml += '<div class="ev-vbar-col' + classeCol + '" title="' + escapeHtml(tooltip) + '">' +
                '<span class="ev-vbar-value">' + escapeHtml(String(altura)) + '%</span>' +
                '<div class="ev-vbar-track">' +
                    '<div class="ev-vbar-fill' + classeFill + '" style="height: ' + altura + '%;"></div>' +
                '</div>' +
                '<span class="ev-vbar-label">' + escapeHtml(ponto.dataCurta) + '</span>' +
            '</div>';
        }

        // Gráfico 2: Barras horizontais de dificuldades observadas
        var ranking = Array.isArray(resumo.rankingDificuldades) ? resumo.rankingDificuldades : [];
        var dificuldadesConteudoHtml = '';

        if (ranking.length === 0) {
            dificuldadesConteudoHtml = '<div class="ev-positive-msg">' +
                '<div class="ev-positive-icon">' + svgDenteFeliz(44) + '</div>' +
                '<p class="ev-positive-title">Nenhuma dificuldade registrada neste dia!</p>' +
                '<p class="ev-positive-desc">Excelente desempenho: todas as tentativas analisadas foram concluídas sem trocas ou travas.</p>' +
            '</div>';
        } else {
            var linhasHtml = '';
            for (var j = 0; j < ranking.length; j++) {
                var item = ranking[j];
                var isSilaba = item.tipo === 'silaba';
                var tagClass = isSilaba ? 'ev-hbar-tag-syl' : 'ev-hbar-tag-ort';
                var tagTexto = isSilaba ? 'Sílaba' : 'Ortografia';
                var fillClass = isSilaba ? ' is-syl' : '';
                var largura = Math.max(12, Math.min(100, Number(item.percentualBarra) || 12));
                var countTexto = item.count + (item.count === 1 ? ' vez' : ' vezes');
                var exemplosTexto = (Array.isArray(item.exemplos) && item.exemplos.length > 0)
                    ? '<div class="ev-hbar-examples">Ex.: ' + escapeHtml(item.exemplos.join(', ')) + '</div>'
                    : '';

                linhasHtml += '<div class="ev-hbar-row">' +
                    '<div class="ev-hbar-meta">' +
                        '<span class="ev-hbar-name">' + escapeHtml(item.nome) + '</span>' +
                        '<span class="ev-hbar-tag ' + tagClass + '">' + tagTexto + '</span>' +
                        '<span class="ev-hbar-count">' + escapeHtml(countTexto) + '</span>' +
                    '</div>' +
                    '<div class="ev-hbar-track">' +
                        '<div class="ev-hbar-fill' + fillClass + '" style="width: ' + largura + '%;"></div>' +
                    '</div>' +
                    exemplosTexto +
                '</div>';
            }
            dificuldadesConteudoHtml = '<div class="ev-hbars">' + linhasHtml + '</div>';
        }

        return '<div class="ev-charts-grid">' +
            '<div class="ev-chart-box">' +
                '<h4 class="ev-chart-title">' + svgGraficoBarras(18) + ' <span>Evolução diária (% de acertos)</span></h4>' +
                '<div class="ev-vbars">' + colunasHtml + '</div>' +
            '</div>' +
            '<div class="ev-chart-box">' +
                '<h4 class="ev-chart-title">' + svgLupa(18) + ' <span>Principais dificuldades observadas</span></h4>' +
                dificuldadesConteudoHtml +
            '</div>' +
        '</div>';
    }

    /**
     * Gera o HTML do rodapé com botão de limpeza segura em 2 toques.
     */
    function renderRodapeHtml() {
        return '<div class="ev-footer">' +
            '<button type="button" class="ev-btn-danger" id="evBtnLimparHistorico">' +
                'Limpar histórico de evolução' +
            '</button>' +
        '</div>';
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

        var resumo = (analytics && typeof analytics.gerarResumoEvolucao === 'function')
            ? analytics.gerarResumoEvolucao({
                alunoId: filtroAlunoId,
                dataReferencia: filtroDataRef
            })
            : { vazio: true, datasDisponiveis: [] };

        if (!resumo || resumo.vazio) {
            filtroDataRef = null;
        } else {
            filtroDataRef = resumo.dataReferencia;
        }

        var datasDisponiveis = (resumo && Array.isArray(resumo.datasDisponiveis))
            ? resumo.datasDisponiveis
            : [];

        var html = '<div class="ev-root">' +
            renderFiltrosHtml(opcoesAlunos, datasDisponiveis, filtroDataRef);

        if (!resumo || resumo.vazio) {
            html += renderEstadoVazioHtml();
        } else {
            html += renderCardsResumoHtml(resumo) +
                renderGraficosHtml(resumo) +
                renderRodapeHtml();
        }

        html += '</div>';

        containerEl.innerHTML = html;

        // Vincula eventos dos filtros e da confirmação em 2 toques
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
