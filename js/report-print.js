/* ==========================================================================
   Modulo de Relatorio Pedagogico Imprimivel / PDF (@media print)
   Projeto: Saude na Escola: Saude Bucal
   100% offline (file://), sem bibliotecas externas e 100% DOM seguro.
   ========================================================================== */
(function (global) {
    'use strict';

    var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

    function getStorage() {
        return SaudeEscola.Storage || null;
    }

    function getAnalytics() {
        return SaudeEscola.Analytics || null;
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
     * Formata tempo em segundos para leitura natural (ex.: 34s ou 1m 12s).
     */
    function formatarTempo(seg) {
        var s = Math.max(0, Math.round(Number(seg) || 0));
        if (s < 60) return s + 's';
        var min = Math.floor(s / 60);
        var resto = s % 60;
        return resto > 0 ? (min + 'm ' + resto + 's') : (min + 'm');
    }

    /**
     * Cria elemento HTML de forma segura usando textContent (prevencao estrita contra XSS).
     */
    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) {
            node.textContent = String(text);
        }
        return node;
    }

    /**
     * Formata a celula da Fase 1 priorizando tempo medio (v2.1.3+) e mantendo legado.
     */
    function formatarCelulaFase1(f1) {
        if (!f1 || !f1.temDados) return '—';
        if (f1.modoMetrica === 'tempo' && f1.tempoMedioSegundos !== null && f1.tempoMedioSegundos !== undefined) {
            var rod = Number(f1.rodadas) || 1;
            return formatarTempo(f1.tempoMedioSegundos) + ' (' + rod + ' rod.)';
        }
        if (f1.taxaAcerto !== null && f1.taxaAcerto !== undefined) {
            return f1.taxaAcerto + '% (antigo)';
        }
        return '—';
    }

    /**
     * Formata a celula das Fases 2 e 3 com percentual e fracao de acertos.
     */
    function formatarCelulaFasePorcentagem(f) {
        if (!f || !f.temDados || f.taxaAcerto === null || f.taxaAcerto === undefined) {
            return '—';
        }
        return f.taxaAcerto + '% (' + (f.acertos || 0) + '/' + (f.tentativas || 0) + ')';
    }

    /**
     * Cria um pequeno emblema vetorial via createElementNS (zero innerHTML).
     */
    function criarEmblemaVetorial() {
        if (!document || typeof document.createElementNS !== 'function') {
            return null;
        }
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 48 48');
        svg.setAttribute('width', '34');
        svg.setAttribute('height', '34');
        svg.setAttribute('aria-hidden', 'true');

        var tooth = document.createElementNS(ns, 'path');
        tooth.setAttribute('d', 'M12 8 C6 8 5 22 9 31 C11 37 12 44 17 44 C20 44 21 35 24 35 C27 35 28 44 31 44 C36 44 37 37 39 31 C43 22 42 8 36 8 C30 8 28 12 24 12 C20 12 18 8 12 8 Z');
        tooth.setAttribute('fill', '#E0F7FA');
        tooth.setAttribute('stroke', '#00838F');
        tooth.setAttribute('stroke-width', '3');

        var eyeL = document.createElementNS(ns, 'circle');
        eyeL.setAttribute('cx', '18');
        eyeL.setAttribute('cy', '21');
        eyeL.setAttribute('r', '2.3');
        eyeL.setAttribute('fill', '#006064');

        var eyeR = document.createElementNS(ns, 'circle');
        eyeR.setAttribute('cx', '30');
        eyeR.setAttribute('cy', '21');
        eyeR.setAttribute('r', '2.3');
        eyeR.setAttribute('fill', '#006064');

        var smile = document.createElementNS(ns, 'path');
        smile.setAttribute('d', 'M19 26 Q24 31 29 26');
        smile.setAttribute('fill', 'none');
        smile.setAttribute('stroke', '#006064');
        smile.setAttribute('stroke-width', '2.4');
        smile.setAttribute('stroke-linecap', 'round');

        svg.appendChild(tooth);
        svg.appendChild(eyeL);
        svg.appendChild(eyeR);
        svg.appendChild(smile);
        return svg;
    }

    /**
     * Garante existencia e retorna o container exclusivo de impressao (#tpPrintReport).
     */
    function obterOuCriarContainer() {
        var container = document.getElementById('tpPrintReport');
        if (!container) {
            container = document.createElement('section');
            container.id = 'tpPrintReport';
            container.className = 'tp-print-report';
            container.setAttribute('aria-hidden', 'true');
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Monta toda a arvore DOM do relatorio pedagogico pronto para impressao/PDF.
     */
    function buildReport(opcoes) {
        if (typeof document === 'undefined' || !document.body) {
            return null;
        }

        var cfg = opcoes && typeof opcoes === 'object' ? opcoes : {};
        var storage = getStorage();
        var analytics = getAnalytics();
        var container = obterOuCriarContainer();
        container.textContent = '';

        var agora = new Date();
        var dataHojeISO = (storage && typeof storage.getDataLocalISO === 'function')
            ? storage.getDataLocalISO(agora)
            : agora.toISOString().slice(0, 10);
        var horaStr = String(agora.getHours()).padStart(2, '0') + ':' + String(agora.getMinutes()).padStart(2, '0');

        var modoAula = Boolean(storage && typeof storage.isModoAula === 'function' && storage.isModoAula());
        var semanaAtiva = Boolean(storage && typeof storage.isPalavrasSemanaAtivo === 'function' && storage.isPalavrasSemanaAtivo());
        var palavrasSemana = (storage && typeof storage.listarPalavrasSemana === 'function')
            ? (storage.listarPalavrasSemana() || [])
            : [];
        var alunosLista = (storage && typeof storage.listarAlunos === 'function')
            ? (storage.listarAlunos() || [])
            : [];
        var sessoesLista = (storage && typeof storage.listarSessoes === 'function')
            ? (storage.listarSessoes() || [])
            : [];
        var anotacoes = (storage && typeof storage.listarAnotacoes === 'function')
            ? (storage.listarAnotacoes() || [])
            : [];

        var modoPeriodo = Boolean(cfg.modo === 'PERIODO' || cfg.periodoId);
        var alunoFiltro = (cfg.alunoId && String(cfg.alunoId).trim() && String(cfg.alunoId) !== 'TODOS')
            ? String(cfg.alunoId).trim()
            : 'TODOS';
        var nomeAlunoFiltro = '';
        if (alunoFiltro !== 'TODOS') {
            for (var ai = 0; ai < alunosLista.length; ai++) {
                var alItem = alunosLista[ai];
                if (alItem && (String(alItem.id) === alunoFiltro || String(alItem.chave) === alunoFiltro)) {
                    nomeAlunoFiltro = String(alItem.nome || '');
                    break;
                }
            }
            if (!nomeAlunoFiltro) {
                for (var si = 0; si < sessoesLista.length; si++) {
                    var sesItem = sessoesLista[si];
                    if (sesItem && (String(sesItem.alunoId) === alunoFiltro || ('chave:' + String(sesItem.alunoChave)) === alunoFiltro)) {
                        nomeAlunoFiltro = String(sesItem.alunoNome || '');
                        break;
                    }
                }
            }
        }

        var resumo = null;
        var resumoAlunos = [];
        var periodoAtual = null;
        var periodoInicio = '';
        var periodoFim = '';
        var anotacoesFiltradas = [];

        for (var an0 = 0; an0 < anotacoes.length; an0++) {
            var notaBase = anotacoes[an0];
            if (!notaBase) continue;
            if (alunoFiltro !== 'TODOS') {
                var pertenceAlunoNota = (notaBase.alunoId && String(notaBase.alunoId) === alunoFiltro) ||
                    (nomeAlunoFiltro && notaBase.alunoNome && String(notaBase.alunoNome).toLowerCase() === nomeAlunoFiltro.toLowerCase());
                if (!pertenceAlunoNota) continue;
            }
            anotacoesFiltradas.push(notaBase);
        }

        if (modoPeriodo && analytics && typeof analytics.gerarResumoPorPeriodo === 'function') {
            resumo = analytics.gerarResumoPorPeriodo({
                alunoId: alunoFiltro,
                periodoId: cfg.periodoId || null
            });
            periodoAtual = (resumo && resumo.periodoAtual) ? resumo.periodoAtual : null;
            periodoInicio = periodoAtual && periodoAtual.inicio ? String(periodoAtual.inicio) : '';
            periodoFim = periodoAtual && periodoAtual.fim ? String(periodoAtual.fim) : '';

            resumoAlunos = (analytics && typeof analytics.gerarResumoPorAluno === 'function')
                ? analytics.gerarResumoPorAluno({
                    escopo: 'PERIODO',
                    periodoId: periodoAtual ? periodoAtual.id : (cfg.periodoId || null),
                    dataInicio: periodoInicio || null,
                    dataFim: periodoFim || null
                })
                : [];

            if (periodoInicio && periodoFim) {
                var notasPeriodo = [];
                for (var an = 0; an < anotacoesFiltradas.length; an++) {
                    var itemNota = anotacoesFiltradas[an];
                    if (!itemNota || !itemNota.dataISO) continue;
                    if (itemNota.dataISO >= periodoInicio && itemNota.dataISO <= periodoFim) {
                        notasPeriodo.push(itemNota);
                    }
                }
                anotacoesFiltradas = notasPeriodo;
            }
        } else {
            resumo = (analytics && typeof analytics.gerarResumoEvolucao === 'function')
                ? analytics.gerarResumoEvolucao({
                    alunoId: alunoFiltro,
                    dataReferencia: cfg.dataReferencia || null
                })
                : { vazio: true };

            resumoAlunos = (analytics && typeof analytics.gerarResumoPorAluno === 'function')
                ? analytics.gerarResumoPorAluno({ escopo: 'GERAL' })
                : [];
        }

        if (alunoFiltro !== 'TODOS' && Array.isArray(resumoAlunos)) {
            resumoAlunos = resumoAlunos.filter(function (al) {
                if (!al) return false;
                if (String(al.id) === alunoFiltro) return true;
                if (nomeAlunoFiltro && String(al.nome).toLowerCase() === nomeAlunoFiltro.toLowerCase()) return true;
                return false;
            });
        }

        // 1. Cabecalho Institucional
        var header = el('header', 'tp-print-header');
        var headerTop = el('div', 'tp-print-header-top');
        var brandWrap = el('div', 'tp-print-brand');
        var badgeSvg = criarEmblemaVetorial();
        if (badgeSvg) {
            brandWrap.appendChild(badgeSvg);
        }
        var titleWrap = el('div', 'tp-print-title-wrap');
        titleWrap.appendChild(el('h1', 'tp-print-title', 'Relatório Pedagógico — Saúde na Escola: Saúde Bucal'));
        titleWrap.appendChild(el('p', 'tp-print-subtitle', 'Acompanhamento da alfabetização inicial (1º e 2º anos) e desempenho nas fases'));
        brandWrap.appendChild(titleWrap);
        headerTop.appendChild(brandWrap);
        headerTop.appendChild(el('div', 'tp-print-date', 'Emitido em ' + formatarDataBR(dataHojeISO) + ' às ' + horaStr));
        header.appendChild(headerTop);

        var metaGrid = el('div', 'tp-print-meta-grid');
        var sessoesPeriodoCount = (modoPeriodo && resumo && resumo.metricasPeriodo)
            ? (Number(resumo.metricasPeriodo.sessoesCount) || 0)
            : 0;
        var valorSessoes = modoPeriodo
            ? (sessoesPeriodoCount + ' no período (' + sessoesLista.length + ' no total)')
            : String(sessoesLista.length);

        var metaItens = [
            { label: 'Modo ativo', val: modoAula ? 'Modo Aula (com registro)' : 'Modo Livre' },
            { label: 'Banco de palavras', val: semanaAtiva ? ('Palavras da Semana (' + palavrasSemana.length + ')') : 'Saúde Bucal (Padrão)' },
            { label: 'Alunos cadastrados', val: String(alunosLista.length) },
            { label: 'Sessões registradas', val: valorSessoes }
        ];
        if (modoPeriodo) {
            metaItens.push({
                label: 'Recorte analisado',
                val: (periodoAtual && periodoInicio && periodoFim)
                    ? (periodoAtual.nome + ' (' + formatarDataBR(periodoInicio) + ' a ' + formatarDataBR(periodoFim) + ')')
                    : 'Período letivo',
                wide: true
            });
        }
        for (var m = 0; m < metaItens.length; m++) {
            var metaClass = metaItens[m].wide
                ? 'tp-print-meta-item tp-print-meta-item-wide'
                : 'tp-print-meta-item';
            var metaItem = el('div', metaClass);
            metaItem.appendChild(el('span', 'tp-print-meta-label', metaItens[m].label));
            metaItem.appendChild(el('strong', 'tp-print-meta-val', metaItens[m].val));
            metaGrid.appendChild(metaItem);
        }
        header.appendChild(metaGrid);
        container.appendChild(header);

        // 2. Resumo Geral da Turma (ou Individual quando filtrado)
        var secResumo = el('section', 'tp-print-section');
        var tituloResumo = (alunoFiltro !== 'TODOS' && nomeAlunoFiltro)
            ? ('Resumo Individual — ' + nomeAlunoFiltro)
            : 'Resumo Geral da Turma';
        if (modoPeriodo && periodoAtual && periodoAtual.nome) {
            tituloResumo += ' — ' + periodoAtual.nome;
            if (periodoInicio && periodoFim) {
                tituloResumo += ' (' + formatarDataBR(periodoInicio) + ' a ' + formatarDataBR(periodoFim) + ')';
            }
        } else if (resumo && !resumo.vazio && resumo.dataReferencia) {
            tituloResumo += ' — Dia analisado: ' + formatarDataBR(resumo.dataReferencia);
        }
        secResumo.appendChild(el('h2', 'tp-print-section-title', tituloResumo));

        if (!resumo || resumo.vazio) {
            secResumo.appendChild(
                el('p', 'tp-print-empty', 'Ainda não há sessões registradas no Modo Aula para compor indicadores da turma.')
            );
        } else if (modoPeriodo && resumo.periodoSemRegistros) {
            secResumo.appendChild(
                el(
                    'p',
                    'tp-print-empty',
                    'Ainda não há sessões registradas ' + (periodoAtual ? ('no ' + periodoAtual.nome) : 'neste período') + '.'
                )
            );
        } else {
            var metDia = (modoPeriodo ? resumo.metricasPeriodo : resumo.metricasDia) || {};
            var pf = metDia.porFase || {};
            var f1 = pf.fase1 || {};
            var f2 = pf.fase2 || {};
            var f3 = pf.fase3 || {};

            var kpiGrid = el('div', 'tp-print-kpi-grid');
            var f1Valor = (f1.temDados && f1.modoMetrica === 'tempo')
                ? formatarTempo(f1.tempoMedioSegundos)
                : ((f1.temDados && f1.taxaAcerto !== null) ? (f1.taxaAcerto + '%') : '—');
            var f1Sub = (f1.temDados && f1.modoMetrica === 'tempo')
                ? ((f1.rodadas || 0) + ((f1.rodadas === 1) ? ' rodada' : ' rodadas'))
                : (f1.temDados ? 'Registro antigo' : 'Sem registros');

            var kpis = [
                { label: 'Fase 1: Memória', val: f1Valor, sub: f1Sub },
                {
                    label: 'Fase 2: Sílabas',
                    val: (f2.temDados && f2.taxaAcerto !== null) ? (f2.taxaAcerto + '%') : '—',
                    sub: f2.temDados ? (f2.acertos + ' de ' + f2.tentativas + (f2.tentativas === 1 ? ' tentativa' : ' tentativas')) : 'Sem registros'
                },
                {
                    label: 'Fase 3: Escrita',
                    val: (f3.temDados && f3.taxaAcerto !== null) ? (f3.taxaAcerto + '%') : '—',
                    sub: f3.temDados ? (f3.acertos + ' de ' + f3.tentativas + (f3.tentativas === 1 ? ' tentativa' : ' tentativas')) : 'Sem registros'
                },
                {
                    label: 'Geral F2 e F3',
                    val: (metDia.tentativas > 0) ? (metDia.taxaAcerto + '%') : '—',
                    sub: (metDia.tentativas > 0) ? (metDia.acertos + ' de ' + metDia.tentativas + (metDia.tentativas === 1 ? ' tentativa' : ' tentativas')) : 'Apenas Fase 1'
                }
            ];

            for (var k = 0; k < kpis.length; k++) {
                var kpiBox = el('div', 'tp-print-kpi-card');
                kpiBox.appendChild(el('span', 'tp-print-kpi-label', kpis[k].label));
                kpiBox.appendChild(el('strong', 'tp-print-kpi-val', kpis[k].val));
                kpiBox.appendChild(el('span', 'tp-print-kpi-sub', kpis[k].sub));
                kpiGrid.appendChild(kpiBox);
            }
            secResumo.appendChild(kpiGrid);

            var colsDiv = el('div', 'tp-print-two-cols');

            var boxFortes = el('div', 'tp-print-box');
            boxFortes.appendChild(el('h3', 'tp-print-box-title', 'Pontos fortes observados'));
            var ulFortes = el('ul', 'tp-print-list');
            var fortes = Array.isArray(resumo.pontosFortes) ? resumo.pontosFortes : [];
            for (var fi = 0; fi < fortes.length; fi++) {
                ulFortes.appendChild(el('li', '', fortes[fi]));
            }
            boxFortes.appendChild(ulFortes);
            colsDiv.appendChild(boxFortes);

            var boxAtencao = el('div', 'tp-print-box');
            boxAtencao.appendChild(el('h3', 'tp-print-box-title', 'Pontos de atenção para revisar'));
            var ulAtencao = el('ul', 'tp-print-list');
            var atencao = Array.isArray(resumo.pontosAtencao) ? resumo.pontosAtencao : [];
            for (var ai = 0; ai < atencao.length; ai++) {
                ulAtencao.appendChild(el('li', '', atencao[ai]));
            }
            boxAtencao.appendChild(ulAtencao);
            colsDiv.appendChild(boxAtencao);
            secResumo.appendChild(colsDiv);

            var rankingDif = Array.isArray(resumo.rankingDificuldades) ? resumo.rankingDificuldades : [];
            if (rankingDif.length > 0) {
                var boxDif = el('div', 'tp-print-box tp-print-box-full');
                boxDif.appendChild(el('h3', 'tp-print-box-title', 'Principais dificuldades diagnosticadas'));
                var ulDif = el('ul', 'tp-print-list');
                for (var di = 0; di < rankingDif.length; di++) {
                    var itemD = rankingDif[di];
                    var tipoTxt = itemD.tipo === 'silaba' ? 'Sílaba' : 'Ortografia';
                    var textoDif = itemD.nome + ' (' + tipoTxt + ' — ' + itemD.count + (itemD.count === 1 ? ' vez' : ' vezes') + ')';
                    if (Array.isArray(itemD.exemplos) && itemD.exemplos.length > 0) {
                        textoDif += ' — Ex.: ' + itemD.exemplos.join(', ');
                    }
                    ulDif.appendChild(el('li', '', textoDif));
                }
                boxDif.appendChild(ulDif);
                secResumo.appendChild(boxDif);
            }
        }

        if (modoPeriodo && resumo && !resumo.vazio && Array.isArray(resumo.seriePeriodos)) {
            var periodosComSessoes = 0;
            for (var sp = 0; sp < resumo.seriePeriodos.length; sp++) {
                if ((resumo.seriePeriodos[sp].sessoesCount || 0) > 0) {
                    periodosComSessoes++;
                }
            }
            if (periodosComSessoes >= 2) {
                secResumo.appendChild(el('h3', 'tp-print-sub-title', 'Comparativo entre Períodos Letivos'));
                var periodTable = el('table', 'tp-print-table tp-print-period-table');
                var pThead = document.createElement('thead');
                var pTrHead = document.createElement('tr');
                var pCols = ['Período', 'Intervalo', 'Sessões', 'Fase 1 (Memória)', 'Fase 2 (Sílabas)', 'Fase 3 (Escrita)'];
                for (var pc = 0; pc < pCols.length; pc++) {
                    pTrHead.appendChild(el('th', '', pCols[pc]));
                }
                pThead.appendChild(pTrHead);
                periodTable.appendChild(pThead);

                var pTbody = document.createElement('tbody');
                for (var pi = 0; pi < resumo.seriePeriodos.length; pi++) {
                    var itemPer = resumo.seriePeriodos[pi];
                    var trPer = document.createElement('tr');
                    var nomePer = itemPer.nome || itemPer.sigla || ('Período ' + (pi + 1));
                    if (itemPer.isReferencia) {
                        nomePer += ' (selecionado)';
                    }
                    var intervaloPer = (itemPer.inicio && itemPer.fim)
                        ? (formatarDataBR(itemPer.inicio) + ' a ' + formatarDataBR(itemPer.fim))
                        : (itemPer.intervaloBR || '—');
                    var pfPer = itemPer.porFase || {};
                    trPer.appendChild(el('td', 'tp-print-td-name', nomePer));
                    trPer.appendChild(el('td', '', intervaloPer));
                    trPer.appendChild(el('td', 'tp-print-td-center', String(itemPer.sessoesCount || 0)));
                    trPer.appendChild(el('td', '', formatarCelulaFase1(pfPer.fase1)));
                    trPer.appendChild(el('td', '', formatarCelulaFasePorcentagem(pfPer.fase2)));
                    trPer.appendChild(el('td', '', formatarCelulaFasePorcentagem(pfPer.fase3)));
                    pTbody.appendChild(trPer);
                }
                periodTable.appendChild(pTbody);
                secResumo.appendChild(periodTable);
            }
        }
        container.appendChild(secResumo);

        // 3. Desempenho Aluno por Aluno
        var secAlunos = el('section', 'tp-print-section');
        var tituloAlunos = (modoPeriodo && periodoAtual && periodoAtual.nome)
            ? ('Desempenho Aluno por Aluno — ' + periodoAtual.nome)
            : 'Desempenho Aluno por Aluno (Acumulado Geral)';
        secAlunos.appendChild(el('h2', 'tp-print-section-title', tituloAlunos));

        if (!Array.isArray(resumoAlunos) || resumoAlunos.length === 0) {
            secAlunos.appendChild(
                el('p', 'tp-print-empty', 'Nenhum aluno cadastrado na turma até o momento. Cadastre os alunos na aba "Turma e Modo".')
            );
        } else {
            var table = el('table', 'tp-print-table');
            var thead = document.createElement('thead');
            var trHead = document.createElement('tr');
            var colunas = ['Aluno', 'Sessões', 'Fase 1 (Memória)', 'Fase 2 (Sílabas)', 'Fase 3 (Escrita)'];
            for (var c = 0; c < colunas.length; c++) {
                trHead.appendChild(el('th', '', colunas[c]));
            }
            thead.appendChild(trHead);
            table.appendChild(thead);

            var tbody = document.createElement('tbody');
            for (var r = 0; r < resumoAlunos.length; r++) {
                var al = resumoAlunos[r];
                var tr = document.createElement('tr');
                var nomeExibir = al.cadastrado ? al.nome : (al.nome + ' (histórico)');
                tr.appendChild(el('td', 'tp-print-td-name', nomeExibir));
                tr.appendChild(el('td', 'tp-print-td-center', String(al.sessoesCount || 0)));
                tr.appendChild(el('td', '', formatarCelulaFase1(al.fase1)));
                tr.appendChild(el('td', '', formatarCelulaFasePorcentagem(al.fase2)));
                tr.appendChild(el('td', '', formatarCelulaFasePorcentagem(al.fase3)));
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            secAlunos.appendChild(table);
        }
        container.appendChild(secAlunos);

        // 4. Anotacoes Pedagogicas da Professora
        var secNotas = el('section', 'tp-print-section');
        var tituloNotas = (modoPeriodo && periodoAtual && periodoAtual.nome)
            ? ('Anotações Pedagógicas da Professora — ' + periodoAtual.nome)
            : 'Anotações Pedagógicas da Professora';
        secNotas.appendChild(el('h2', 'tp-print-section-title', tituloNotas));

        if (!Array.isArray(anotacoesFiltradas) || anotacoesFiltradas.length === 0) {
            var msgSemNotas = modoPeriodo
                ? 'Sem anotações digitais registradas neste período. Espaço livre para observações após a impressão:'
                : 'Sem anotações digitais registradas. Espaço livre para observações após a impressão:';
            secNotas.appendChild(
                el('p', 'tp-print-empty', msgSemNotas)
            );
            var linhasWrap = el('div', 'tp-print-ruled-wrap');
            for (var l = 0; l < 4; l++) {
                linhasWrap.appendChild(el('div', 'tp-print-ruled-line'));
            }
            secNotas.appendChild(linhasWrap);
        } else {
            var notasList = el('div', 'tp-print-notes-list');
            for (var n = 0; n < anotacoesFiltradas.length; n++) {
                var nota = anotacoesFiltradas[n];
                var notaCard = el('div', 'tp-print-note-card');
                var notaMeta = el('div', 'tp-print-note-meta');
                var vinculoLabel = nota.alunoNome ? nota.alunoNome : 'Turma geral';
                notaMeta.appendChild(el('span', 'tp-print-note-badge', vinculoLabel));
                notaMeta.appendChild(el('span', 'tp-print-note-date', formatarDataBR(nota.dataISO)));
                notaCard.appendChild(notaMeta);
                notaCard.appendChild(el('p', 'tp-print-note-text', nota.texto));
                notasList.appendChild(notaCard);
            }
            secNotas.appendChild(notasList);
        }
        container.appendChild(secNotas);

        // 5. Rodape e Assinatura
        var footer = el('footer', 'tp-print-footer');
        var signRow = el('div', 'tp-print-sign-row');
        var signProf = el('div', 'tp-print-sign-col');
        signProf.appendChild(el('div', 'tp-print-sign-line'));
        signProf.appendChild(el('span', '', 'Professora Responsável'));
        var signData = el('div', 'tp-print-sign-col tp-print-sign-date');
        signData.appendChild(el('div', 'tp-print-sign-line'));
        signData.appendChild(el('span', '', 'Data'));
        signRow.appendChild(signProf);
        signRow.appendChild(signData);
        footer.appendChild(signRow);
        footer.appendChild(
            el('p', 'tp-print-lgpd', 'Relatório gerado localmente para uso pedagógico interno (LGPD escolar: identificação reduzida a Nome + Inicial).')
        );
        container.appendChild(footer);

        return container;
    }

    /**
     * Monta o relatorio atualizado e dispara a janela nativa de impressao/PDF.
     */
    function print(opcoes) {
        try {
            buildReport(opcoes || {});
            if (typeof global.print === 'function') {
                global.print();
            }
            return { ok: true };
        } catch (err) {
            return {
                ok: false,
                erro: 'Não foi possível preparar o relatório para impressão.'
            };
        }
    }

    SaudeEscola.ReportPrint = {
        buildReport: buildReport,
        print: print
    };
})(typeof window !== 'undefined' ? window : globalThis);
