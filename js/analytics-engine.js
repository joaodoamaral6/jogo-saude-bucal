/* ==========================================================================
   Motor Silencioso de Análise Pedagógica (Analytics)
   Projeto: Saúde na Escola: Saúde Bucal
   Compatível com execução offline (file://) e GitHub Pages (sem ES Modules).
   ========================================================================== */
(function (global) {
    'use strict';

    var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

    // Sessão ativa em memória (descartada automaticamente fora do Modo Aula)
    var sessaoAtual = null;

    // Tabela de pares de letras frequentemente confundidos na alfabetização.
    // As chaves são ordenadas alfabeticamente para reconhecer trocas em qualquer direção.
    var MAPA_TROCAS_ORTOGRAFICAS = {
        'G_J': { codigo: 'TROCA_G_J', label: 'Troca G / J' },
        'M_N': { codigo: 'TROCA_M_N', label: 'Troca M / N (e M antes de P/B)' },
        'S_Z': { codigo: 'TROCA_S_Z', label: 'Troca S / Z' },
        'C_S': { codigo: 'TROCA_C_S', label: 'Troca C / S / Ç' },
        'B_P': { codigo: 'TROCA_P_B', label: 'Troca P / B' },
        'D_T': { codigo: 'TROCA_T_D', label: 'Troca T / D' },
        'F_V': { codigo: 'TROCA_F_V', label: 'Troca F / V' },
        'L_U': { codigo: 'TROCA_L_U', label: 'Troca L / U' },
        'C_G': { codigo: 'TROCA_C_G', label: 'Troca C / G' }
    };

    var DIGRAFOS_ALFABETIZACAO = ['RR', 'SS', 'CH', 'LH', 'NH', 'QU', 'GU'];

    /**
     * Obtém dinamicamente a referência ao módulo Storage.
     */
    function getStorage() {
        return (global.SaudeEscola && global.SaudeEscola.Storage) ? global.SaudeEscola.Storage : null;
    }

    /**
     * Obtém dinamicamente a referência ao módulo Periods.
     */
    function getPeriods() {
        return (global.SaudeEscola && global.SaudeEscola.Periods) ? global.SaudeEscola.Periods : null;
    }

    /**
     * Gera a data local no formato YYYY-MM-DD usando o Storage quando disponível.
     */
    function getDataLocalISO(date) {
        var storage = getStorage();
        if (storage && typeof storage.getDataLocalISO === 'function') {
            return storage.getDataLocalISO(date);
        }
        var d = date instanceof Date ? date : new Date();
        var ano = d.getFullYear();
        var mes = String(d.getMonth() + 1);
        var dia = String(d.getDate());
        if (mes.length < 2) mes = '0' + mes;
        if (dia.length < 2) dia = '0' + dia;
        return ano + '-' + mes + '-' + dia;
    }

    /**
     * Formata uma data YYYY-MM-DD para o formato curto DD/MM.
     */
    function formatarDataCurta(dataISO) {
        var partes = String(dataISO || '').split('-');
        if (partes.length !== 3) return String(dataISO || '');
        return partes[2] + '/' + partes[1];
    }

    /**
     * Remove acentos e retorna apenas o primeiro caractere em maiúscula.
     */
    function normalizarChar(ch) {
        if (ch === undefined || ch === null) return '';
        var str = String(ch).trim();
        if (!str) return '';

        var storage = getStorage();
        if (storage && typeof storage.normalizarPlain === 'function') {
            str = storage.normalizarPlain(str);
        } else if (typeof str.normalize === 'function') {
            str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        str = String(str).trim().toUpperCase();
        return str ? str.charAt(0) : '';
    }

    /**
     * Converte texto para forma sem acentos em maiúsculas (fallback para plain).
     */
    function normalizarTextoPlain(texto) {
        var str = String(texto || '').trim();
        var storage = getStorage();
        if (storage && typeof storage.normalizarPlain === 'function') {
            return String(storage.normalizarPlain(str) || '').toUpperCase();
        }
        if (typeof str.normalize === 'function') {
            str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        return str.toUpperCase();
    }

    /**
     * Normaliza o texto de uma palavra para chave de estatística.
     */
    function normalizarPalavra(palavra) {
        var texto = String(palavra || '').trim().toUpperCase();
        return texto || 'PALAVRA';
    }

    /**
     * Copia objetos simples de estatísticas de forma segura para persistência.
     */
    function clonarObjeto(obj) {
        try {
            return JSON.parse(JSON.stringify(obj || {}));
        } catch (err) {
            return {};
        }
    }

    /**
     * Garante a existência de uma sessão ativa não consolidada antes de registrar tentativas.
     */
    function garantirSessaoAtiva(modoFallback) {
        if (!sessaoAtual || sessaoAtual.consolidada) {
            iniciarSessao({
                modoJogo: modoFallback || 'INDEFINIDO',
                fontePalavras: 'PADRAO'
            });
        }
        return sessaoAtual;
    }

    /**
     * Atualiza as estatísticas agregadas por palavra dentro da sessão atual.
     */
    function atualizarStatsPalavra(palavraLimpa, acertou) {
        if (!sessaoAtual.palavrasStats[palavraLimpa]) {
            sessaoAtual.palavrasStats[palavraLimpa] = {
                tentativas: 0,
                acertos: 0,
                erros: 0
            };
        }
        var stat = sessaoAtual.palavrasStats[palavraLimpa];
        stat.tentativas += 1;
        if (acertou) {
            stat.acertos += 1;
        } else {
            stat.erros += 1;
        }
    }

    /**
     * Formata tempo em segundos para exibição legível (ex.: 34s ou 1m 12s).
     */
    function formatarTempoSegundosSimples(seg) {
        var s = Math.max(0, Math.round(Number(seg) || 0));
        if (s < 60) return s + 's';
        var min = Math.floor(s / 60);
        var resto = s % 60;
        return resto > 0 ? (min + 'm ' + resto + 's') : (min + 'm');
    }

    /**
     * Cria a estrutura vazia de estatísticas por fase para uma sessão.
     */
    function criarFasesStatsVazio() {
        return {
            fase1: { tentativas: 0, acertos: 0, acertosPrimeira: 0, tempoSegundos: 0, rodadas: 0 },
            fase2: { tentativas: 0, acertos: 0, acertosPrimeira: 0 },
            fase3: { tentativas: 0, acertos: 0, acertosPrimeira: 0 }
        };
    }

    /**
     * Atualiza os contadores da fase informada ('fase1', 'fase2' ou 'fase3') na sessão atual.
     */
    function atualizarStatsFase(chaveFase, acertou, primeiraTentativa) {
        if (!sessaoAtual.fasesStats || typeof sessaoAtual.fasesStats !== 'object') {
            sessaoAtual.fasesStats = criarFasesStatsVazio();
        }
        if (!sessaoAtual.fasesStats[chaveFase]) {
            sessaoAtual.fasesStats[chaveFase] = chaveFase === 'fase1'
                ? { tentativas: 0, acertos: 0, acertosPrimeira: 0, tempoSegundos: 0, rodadas: 0 }
                : { tentativas: 0, acertos: 0, acertosPrimeira: 0 };
        }
        var faseStat = sessaoAtual.fasesStats[chaveFase];
        faseStat.tentativas += 1;
        if (acertou) {
            faseStat.acertos += 1;
            if (primeiraTentativa) {
                faseStat.acertosPrimeira += 1;
            }
        }
    }

    /**
     * Classifica o desvio ortográfico entre letra esperada (e) e digitada (u).
     */
    function classificarErroOrtografico(e, u) {
        if (!u) {
            return {
                codigo: 'LETRAS_FALTANDO',
                label: 'Letras faltando'
            };
        }
        var parOrdenado = [e, u].sort().join('_');
        if (MAPA_TROCAS_ORTOGRAFICAS[parOrdenado]) {
            return MAPA_TROCAS_ORTOGRAFICAS[parOrdenado];
        }
        return {
            codigo: 'OUTRAS_TROCAS',
            label: 'Outras trocas de letras'
        };
    }

    /**
     * Verifica se o par de letras confusas pertence ao mapa fonético conhecido.
     */
    function ehTrocaFoneticaConhecida(e, u) {
        if (!e || !u) return false;
        var parOrdenado = [e, u].sort().join('_');
        return Boolean(MAPA_TROCAS_ORTOGRAFICAS[parOrdenado]);
    }

    /**
     * Verifica se o índice faz parte de um dígrafo comum da alfabetização.
     */
    function encontrarDigrafoNaPosicao(palavraPlain, idx) {
        if (!palavraPlain || idx < 0 || idx >= palavraPlain.length) {
            return null;
        }
        if (idx - 1 >= 0) {
            var parEsq = palavraPlain.slice(idx - 1, idx + 1);
            if (DIGRAFOS_ALFABETIZACAO.indexOf(parEsq) !== -1) {
                return parEsq;
            }
        }
        if (idx + 1 < palavraPlain.length) {
            var parDir = palavraPlain.slice(idx, idx + 2);
            if (DIGRAFOS_ALFABETIZACAO.indexOf(parDir) !== -1) {
                return parDir;
            }
        }
        return null;
    }

    /**
     * Alinha sequência esperada e digitada por programação dinâmica (LCS ponderada)
     * com custos inteiros para evitar deslocamento de índices em omissões/inserções.
     */
    function alinharSegmentoEscrita(expStr, digStr) {
        var n = expStr.length;
        var m = digStr.length;
        var CUSTO_MATCH = 0;
        var CUSTO_SUB_FONETICA = 10;
        var CUSTO_SUB_GERAL = 12;
        var CUSTO_DEL = 10;
        var CUSTO_INS = 10;

        var dp = [];
        for (var i = 0; i <= n; i++) {
            dp[i] = new Array(m + 1);
            dp[i][0] = i * CUSTO_DEL;
        }
        for (var j = 0; j <= m; j++) {
            dp[0][j] = j * CUSTO_INS;
        }

        for (var row = 1; row <= n; row++) {
            var e = expStr.charAt(row - 1);
            for (var col = 1; col <= m; col++) {
                var u = digStr.charAt(col - 1);
                var custoDia = (e === u)
                    ? CUSTO_MATCH
                    : (ehTrocaFoneticaConhecida(e, u) ? CUSTO_SUB_FONETICA : CUSTO_SUB_GERAL);

                var optDia = dp[row - 1][col - 1] + custoDia;
                var optDel = dp[row - 1][col] + CUSTO_DEL;
                var optIns = dp[row][col - 1] + CUSTO_INS;

                var melhor = optDia;
                if (optDel < melhor) melhor = optDel;
                if (optIns < melhor) melhor = optIns;
                dp[row][col] = melhor;
            }
        }

        var ops = [];
        var r = n;
        var c = m;
        while (r > 0 || c > 0) {
            if (r > 0 && c > 0) {
                var ec = expStr.charAt(r - 1);
                var uc = digStr.charAt(c - 1);
                var custoStep = (ec === uc)
                    ? CUSTO_MATCH
                    : (ehTrocaFoneticaConhecida(ec, uc) ? CUSTO_SUB_FONETICA : CUSTO_SUB_GERAL);
                if (dp[r][c] === dp[r - 1][c - 1] + custoStep) {
                    ops.push({
                        tipo: ec === uc ? 'MATCH' : 'SUB',
                        expIdx: r - 1,
                        digIdx: c - 1,
                        e: ec,
                        u: uc
                    });
                    r -= 1;
                    c -= 1;
                    continue;
                }
            }

            if (r > 0 && dp[r][c] === dp[r - 1][c] + CUSTO_DEL) {
                ops.push({
                    tipo: 'DEL',
                    expIdx: r - 1,
                    e: expStr.charAt(r - 1)
                });
                r -= 1;
                continue;
            }

            ops.push({
                tipo: 'INS',
                expIdxRef: r,
                digIdx: c - 1,
                u: digStr.charAt(c - 1)
            });
            c -= 1;
        }

        ops.reverse();
        return ops;
    }

    /**
     * Analisa desvios ortográficos na Fase 3 por segmentos abertos respeitando letras travadas,
     * isolando omissão de dígrafos (RR, SS, CH, LH, NH, QU, GU) e duplicações sem deslocar o resto.
     */
    function analisarEscritaFase3(plainStr, digitadoArrOuStr, travadosAntes) {
        var plain = normalizarTextoPlain(plainStr);
        if (!plain) return [];

        var travados = Array.isArray(travadosAntes) ? travadosAntes : [];
        var rawChars = Array.isArray(digitadoArrOuStr)
            ? digitadoArrOuStr
            : (typeof digitadoArrOuStr === 'string' ? digitadoArrOuStr.split('') : []);

        var digitadoNorm = [];
        for (var idx = 0; idx < rawChars.length; idx++) {
            digitadoNorm.push(normalizarChar(rawChars[idx] || ''));
        }

        // Particiona os espaços abertos em segmentos contíguos separados por letras já travadas
        var segmentos = [];
        var segAtual = null;
        for (var pos = 0; pos < plain.length; pos++) {
            if (travados[pos]) {
                segAtual = null;
                continue;
            }
            if (!segAtual) {
                segAtual = { start: pos, end: pos, digChars: [] };
                segmentos.push(segAtual);
            } else {
                segAtual.end = pos;
            }
            if (digitadoNorm[pos]) {
                segAtual.digChars.push(digitadoNorm[pos]);
            }
        }

        if (segmentos.length === 0) {
            return [];
        }

        // Anexa eventuais caracteres extras além de plain.length ao último segmento aberto
        if (digitadoNorm.length > plain.length) {
            var ultimoSeg = segmentos[segmentos.length - 1];
            for (var extra = plain.length; extra < digitadoNorm.length; extra++) {
                if (digitadoNorm[extra]) {
                    ultimoSeg.digChars.push(digitadoNorm[extra]);
                }
            }
        }

        var desvios = [];
        for (var s = 0; s < segmentos.length; s++) {
            var seg = segmentos[s];
            var segExp = plain.slice(seg.start, seg.end + 1);
            var segDig = seg.digChars.join('');
            var ops = alinharSegmentoEscrita(segExp, segDig);

            for (var o = 0; o < ops.length; o++) {
                var op = ops[o];
                if (op.tipo === 'MATCH') continue;

                if (op.tipo === 'SUB') {
                    var clSub = classificarErroOrtografico(op.e, op.u);
                    desvios.push({
                        codigo: clSub.codigo,
                        label: clSub.label,
                        esperado: op.e,
                        digitado: op.u,
                        exemploCustom: null
                    });
                } else if (op.tipo === 'DEL') {
                    var idxGlobalDel = seg.start + op.expIdx;
                    var digrafo = encontrarDigrafoNaPosicao(plain, idxGlobalDel);
                    if (digrafo) {
                        desvios.push({
                            codigo: 'OMISSAO_DIGRAFO_' + digrafo,
                            label: 'Omissão no dígrafo ' + digrafo,
                            esperado: op.e,
                            digitado: '',
                            exemploCustom: 'omitiu ' + op.e + ' em ' + digrafo
                        });
                    } else {
                        desvios.push({
                            codigo: 'LETRAS_FALTANDO',
                            label: 'Letras faltando',
                            esperado: op.e,
                            digitado: '',
                            exemploCustom: null
                        });
                    }
                } else if (op.tipo === 'INS') {
                    var idxGlobalIns = seg.start + op.expIdxRef;
                    var vizinhoAnt = idxGlobalIns - 1 >= 0 ? plain.charAt(idxGlobalIns - 1) : '';
                    var vizinhoAtual = idxGlobalIns < plain.length ? plain.charAt(idxGlobalIns) : '';
                    if (op.u === vizinhoAnt || op.u === vizinhoAtual) {
                        desvios.push({
                            codigo: 'DUPLICACAO_LETRA',
                            label: 'Duplicação de letra',
                            esperado: op.u,
                            digitado: op.u + op.u,
                            exemploCustom: 'duplicou ' + op.u
                        });
                    } else {
                        desvios.push({
                            codigo: 'LETRAS_EXTRAS',
                            label: 'Letras a mais',
                            esperado: '',
                            digitado: op.u,
                            exemploCustom: op.u + ' a mais'
                        });
                    }
                }
            }
        }

        return desvios;
    }

    /**
     * Registra uma ocorrência de erro ortográfico na sessão atual com até 5 exemplos únicos.
     */
    function registrarErroOrtografico(codigo, label, palavraLimpa, esperado, digitado, exemploCustom) {
        if (!sessaoAtual.errosOrtograficos[codigo]) {
            sessaoAtual.errosOrtograficos[codigo] = {
                codigo: codigo,
                label: label,
                count: 0,
                exemplos: []
            };
        }
        var entry = sessaoAtual.errosOrtograficos[codigo];
        entry.count += 1;

        var exemplo = exemploCustom
            ? (palavraLimpa + ' (' + exemploCustom + ')')
            : (digitado
                ? (palavraLimpa + ' (' + digitado + ' no lugar de ' + esperado + ')')
                : (palavraLimpa + ' (faltou ' + esperado + ')'));
        if (entry.exemplos.indexOf(exemplo) === -1 && entry.exemplos.length < 5) {
            entry.exemplos.push(exemplo);
        }
    }

    /**
     * Inicializa uma nova sessão silenciosa de acompanhamento em memória.
     */
    function iniciarSessao(opcoes) {
        var cfg = opcoes && typeof opcoes === 'object' ? opcoes : {};
        var agora = Date.now();
        var sufixo = Math.random().toString(36).slice(2, 7);

        sessaoAtual = {
            id: 'sessao_' + agora + '_' + sufixo,
            dataISO: getDataLocalISO(),
            timestamp: agora,
            modoJogo: cfg.modoJogo || 'INDEFINIDO',
            fontePalavras: cfg.fontePalavras || 'PADRAO',
            tentativas: 0,
            acertos: 0,
            acertosPrimeira: 0,
            errosSilabas: {},
            errosOrtograficos: {},
            palavrasStats: {},
            fasesStats: criarFasesStatsVazio(),
            atividadesRegistradas: 0,
            consolidada: false
        };

        return sessaoAtual;
    }

    /**
     * Registra a conclusão de uma rodada da Fase 1 (Jogo da Memória) pelo tempo de execução.
     * Não contabiliza erros por cartas viradas nem altera a taxa ortográfica geral.
     */
    function registrarConclusaoFase1(dados) {
        var info = dados && typeof dados === 'object' ? dados : {};
        garantirSessaoAtiva('FASE_1');

        var brutoSeg = Number(info.tempoSegundos);
        var seg = (isFinite(brutoSeg) && brutoSeg > 0) ? Math.max(1, Math.round(brutoSeg)) : 1;

        if (!sessaoAtual.fasesStats || typeof sessaoAtual.fasesStats !== 'object') {
            sessaoAtual.fasesStats = criarFasesStatsVazio();
        }
        if (!sessaoAtual.fasesStats.fase1 || typeof sessaoAtual.fasesStats.fase1 !== 'object') {
            sessaoAtual.fasesStats.fase1 = { tentativas: 0, acertos: 0, acertosPrimeira: 0, tempoSegundos: 0, rodadas: 0 };
        }

        var f1 = sessaoAtual.fasesStats.fase1;
        f1.tempoSegundos = (Number(f1.tempoSegundos) || 0) + seg;
        f1.rodadas = (Number(f1.rodadas) || 0) + 1;
        sessaoAtual.atividadesRegistradas += 1;
    }

    /**
     * Mantida por compatibilidade de contrato: na v2.1.3+ a Fase 1 é avaliada pelo
     * tempo de conclusão via registrarConclusaoFase1(), sem registrar erros de cartas viradas.
     */
    function registrarTentativaFase1() {
        return;
    }

    /**
     * Registra uma tentativa da Fase 2 (Construtor de Sílabas), identificando travas silábicas.
     */
    function registrarTentativaFase2(dados) {
        var info = dados && typeof dados === 'object' ? dados : {};
        garantirSessaoAtiva('FASE_2');

        var palavraLimpa = normalizarPalavra(info.palavra);
        var silabasEsperadas = Array.isArray(info.silabasEsperadas) ? info.silabasEsperadas : [];
        var silabasEscolhidas = Array.isArray(info.silabasEscolhidas) ? info.silabasEscolhidas : [];
        var acertou = Boolean(info.acertou);
        var primeiraTentativa = Boolean(info.primeiraTentativa);

        sessaoAtual.tentativas += 1;
        sessaoAtual.atividadesRegistradas += 1;
        atualizarStatsPalavra(palavraLimpa, acertou);
        atualizarStatsFase('fase2', acertou, primeiraTentativa);

        if (acertou) {
            sessaoAtual.acertos += 1;
            if (primeiraTentativa) {
                sessaoAtual.acertosPrimeira += 1;
            }
            return;
        }

        // Compara posição por posição para mapear exatamente em qual sílaba houve trava
        for (var i = 0; i < silabasEsperadas.length; i++) {
            var esp = String(silabasEsperadas[i] || '').trim().toUpperCase();
            var esc = String(silabasEscolhidas[i] || '').trim().toUpperCase();

            if (!esp) continue;

            if (esc !== esp) {
                if (!sessaoAtual.errosSilabas[esp]) {
                    sessaoAtual.errosSilabas[esp] = {
                        count: 0,
                        palavras: [],
                        confusoes: {}
                    };
                }
                var registro = sessaoAtual.errosSilabas[esp];
                registro.count += 1;

                if (palavraLimpa && registro.palavras.indexOf(palavraLimpa) === -1 && registro.palavras.length < 5) {
                    registro.palavras.push(palavraLimpa);
                }

                var chaveConfusao = esc || '?';
                registro.confusoes[chaveConfusao] = (registro.confusoes[chaveConfusao] || 0) + 1;
            }
        }
    }

    /**
     * Registra uma tentativa da Fase 3 (Escrita Espontânea), classificando trocas fonéticas/ortográficas.
     */
    function registrarTentativaFase3(dados) {
        var info = dados && typeof dados === 'object' ? dados : {};
        var palavraLimpa = normalizarPalavra(info.palavra);
        var plainStr = String(info.plain !== undefined && info.plain !== null ? info.plain : normalizarTextoPlain(palavraLimpa));
        var digitado = Array.isArray(info.digitado)
            ? info.digitado
            : (typeof info.digitado === 'string' ? info.digitado.split('') : []);
        var travadosAntes = Array.isArray(info.travadosAntes) ? info.travadosAntes : [];
        var acertou = Boolean(info.acertou);
        var primeiraTentativa = Boolean(info.primeiraTentativa);

        // Proteção contra clique acidental em VERIFICAR sem digitar nenhuma letra nas lacunas abertas
        if (!acertou) {
            var digitouAlgumaLetra = false;
            for (var checkIdx = 0; checkIdx < plainStr.length; checkIdx++) {
                if (!travadosAntes[checkIdx] && String(digitado[checkIdx] || '').trim() !== '') {
                    digitouAlgumaLetra = true;
                    break;
                }
            }
            if (!digitouAlgumaLetra) {
                return;
            }
        }

        garantirSessaoAtiva('FASE_3');

        sessaoAtual.tentativas += 1;
        sessaoAtual.atividadesRegistradas += 1;
        atualizarStatsPalavra(palavraLimpa, acertou);
        atualizarStatsFase('fase3', acertou, primeiraTentativa);

        if (acertou) {
            sessaoAtual.acertos += 1;
            if (primeiraTentativa) {
                sessaoAtual.acertosPrimeira += 1;
            }
            return;
        }

        var desvios = analisarEscritaFase3(plainStr, digitado, travadosAntes);
        for (var dIdx = 0; dIdx < desvios.length; dIdx++) {
            var d = desvios[dIdx];
            registrarErroOrtografico(d.codigo, d.label, palavraLimpa, d.esperado, d.digitado, d.exemploCustom);
        }
    }

    /**
     * Consolida e persiste a sessão atual no Storage quando o Modo Aula estiver ativo.
     */
    function finalizarESalvarSessao(opcoes) {
        if (!sessaoAtual || sessaoAtual.consolidada || sessaoAtual.atividadesRegistradas === 0) {
            return { salvo: false, motivo: 'vazio' };
        }

        sessaoAtual.consolidada = true;

        var storage = getStorage();
        var modoAulaAtivo = Boolean(storage && typeof storage.isModoAula === 'function' && storage.isModoAula());

        if (!modoAulaAtivo) {
            sessaoAtual = null;
            return { salvo: false, motivo: 'modo_livre' };
        }

        var infoAluno = opcoes && typeof opcoes === 'object' ? opcoes : {};
        var alunoNome = String(infoAluno.alunoNome || '').trim();
        if (!alunoNome && !infoAluno.alunoId) {
            // Descarta sessões órfãs sem identificação de aluno (ex.: saída antecipada pelo Menu Inicial)
            sessaoAtual = null;
            return { salvo: false, motivo: 'sem_identificacao' };
        }
        var alunoChave = infoAluno.alunoChave;
        if (!alunoChave) {
            if (storage && typeof storage.normalizarChave === 'function') {
                alunoChave = storage.normalizarChave(alunoNome) || 'turma';
            } else {
                alunoChave = 'turma';
            }
        }

        var sessaoLimpa = {
            id: sessaoAtual.id,
            dataISO: sessaoAtual.dataISO,
            timestamp: sessaoAtual.timestamp,
            finalizadaEm: Date.now(),
            modoJogo: sessaoAtual.modoJogo,
            fontePalavras: sessaoAtual.fontePalavras,
            alunoId: infoAluno.alunoId || null,
            alunoNome: alunoNome,
            alunoChave: alunoChave,
            tentativas: sessaoAtual.tentativas,
            acertos: sessaoAtual.acertos,
            acertosPrimeira: sessaoAtual.acertosPrimeira,
            atividadesRegistradas: sessaoAtual.atividadesRegistradas,
            errosSilabas: clonarObjeto(sessaoAtual.errosSilabas),
            errosOrtograficos: clonarObjeto(sessaoAtual.errosOrtograficos),
            palavrasStats: clonarObjeto(sessaoAtual.palavrasStats),
            fasesStats: clonarObjeto(sessaoAtual.fasesStats || criarFasesStatsVazio())
        };

        if (storage && typeof storage.salvarSessao === 'function') {
            storage.salvarSessao(sessaoLimpa);
        }

        sessaoAtual = null;
        return { salvo: true, sessao: sessaoLimpa };
    }

    /**
     * Descarta imediatamente a sessão em memória sem salvar.
     */
    function descartarSessao() {
        sessaoAtual = null;
    }

    /**
     * Indica se há atividades acumuladas aguardando consolidação.
     */
    function temSessaoPendente() {
        return Boolean(sessaoAtual && !sessaoAtual.consolidada && sessaoAtual.atividadesRegistradas > 0);
    }

    /**
     * Lê todas as sessões armazenadas de forma segura.
     */
    function obterSessoesArmazenadas() {
        var storage = getStorage();
        if (!storage || typeof storage.listarSessoes !== 'function') {
            return [];
        }
        var lista = storage.listarSessoes();
        return Array.isArray(lista) ? lista : [];
    }

    /**
     * Resolve a chave normalizada associada a um alunoId cadastrado, quando existir.
     */
    function obterChaveAlunoCadastrado(alunoId) {
        if (!alunoId || alunoId === 'TODOS' || alunoId === '__TURMA_SEM_ID__') return null;
        var storage = getStorage();
        if (!storage || typeof storage.listarAlunos !== 'function') return null;
        var lista = storage.listarAlunos();
        if (!Array.isArray(lista)) return null;
        for (var i = 0; i < lista.length; i++) {
            var a = lista[i];
            if (a && a.id !== undefined && String(a.id) === String(alunoId)) {
                return a.chave ? String(a.chave) : null;
            }
        }
        return null;
    }

    /**
     * Verifica se uma sessão pertence ao filtro de aluno selecionado.
     */
    function sessaoPertenceAoAluno(sessao, alunoId, chaveAlunoFiltro) {
        if (!sessao || typeof sessao !== 'object') return false;
        if (!alunoId || alunoId === 'TODOS') return true;

        if (alunoId === '__TURMA_SEM_ID__') {
            return !sessao.alunoId && (!sessao.alunoChave || sessao.alunoChave === 'turma');
        }

        if (sessao.alunoId !== null && sessao.alunoId !== undefined && String(sessao.alunoId) === String(alunoId)) {
            return true;
        }

        if (sessao.alunoChave) {
            if (String(sessao.alunoChave) === String(alunoId)) return true;
            if ('chave:' + String(sessao.alunoChave) === String(alunoId)) return true;
            if (chaveAlunoFiltro && String(sessao.alunoChave) === String(chaveAlunoFiltro)) return true;
        }

        return false;
    }

    /**
     * Retorna datas únicas (YYYY-MM-DD) presentes no histórico, da mais recente para a mais antiga.
     */
    function listarDatasDisponiveis(alunoId) {
        var filtro = alunoId || 'TODOS';
        var chaveFiltro = obterChaveAlunoCadastrado(filtro);
        var sessoes = obterSessoesArmazenadas();
        var mapaDatas = Object.create(null);

        for (var i = 0; i < sessoes.length; i++) {
            var s = sessoes[i];
            if (!sessaoPertenceAoAluno(s, filtro, chaveFiltro)) continue;
            if (s.dataISO && typeof s.dataISO === 'string') {
                mapaDatas[s.dataISO] = true;
            }
        }

        return Object.keys(mapaDatas).sort(function (a, b) {
            return b.localeCompare(a);
        });
    }

    /**
     * Consolida todas as sessões de um único dia em métricas agregadas.
     */
    function consolidarDia(sessoesDoDia) {
        var lista = Array.isArray(sessoesDoDia) ? sessoesDoDia : [];
        var tentativas = 0;
        var acertos = 0;
        var acertosPrimeira = 0;
        var palavras = Object.create(null);
        var errosOrtograficos = Object.create(null);
        var errosSilabas = Object.create(null);
        var porFase = {
            fase1: {
                tentativas: 0,
                acertos: 0,
                acertosPrimeira: 0,
                tempoTotalSegundos: 0,
                rodadas: 0,
                tempoMedioSegundos: null,
                taxaAcerto: null,
                taxaPrimeira: null,
                temDados: false,
                modoMetrica: 'vazio'
            },
            fase2: { tentativas: 0, acertos: 0, acertosPrimeira: 0, taxaAcerto: null, taxaPrimeira: null, temDados: false },
            fase3: { tentativas: 0, acertos: 0, acertosPrimeira: 0, taxaAcerto: null, taxaPrimeira: null, temDados: false }
        };
        var temDadosLegadosSemFase = false;

        for (var i = 0; i < lista.length; i++) {
            var s = lista[i];
            var sTentativas = Number(s.tentativas) || 0;
            var sAcertos = Number(s.acertos) || 0;
            var sPrimeira = Number(s.acertosPrimeira) || 0;
            tentativas += sTentativas;
            acertos += sAcertos;
            acertosPrimeira += sPrimeira;

            // Consolida estatísticas por fase (com fallback retrocompatível para sessões antigas)
            if (s.fasesStats && typeof s.fasesStats === 'object') {
                var chavesFases = ['fase1', 'fase2', 'fase3'];
                for (var fk = 0; fk < chavesFases.length; fk++) {
                    var chaveF = chavesFases[fk];
                    var fItem = s.fasesStats[chaveF];
                    if (fItem && typeof fItem === 'object') {
                        porFase[chaveF].tentativas += Number(fItem.tentativas) || 0;
                        porFase[chaveF].acertos += Number(fItem.acertos) || 0;
                        porFase[chaveF].acertosPrimeira += Number(fItem.acertosPrimeira) || 0;
                        if (chaveF === 'fase1') {
                            porFase.fase1.tempoTotalSegundos += Number(fItem.tempoSegundos) || 0;
                            porFase.fase1.rodadas += Number(fItem.rodadas) || 0;
                        }
                    }
                }
            } else if (sTentativas > 0) {
                var modoNorm = String(s.modoJogo || '').trim().toUpperCase();
                if (modoNorm === 'PHASE1' || modoNorm === 'FASE_1' || modoNorm === 'FASE1') {
                    porFase.fase1.tentativas += sTentativas;
                    porFase.fase1.acertos += sAcertos;
                    porFase.fase1.acertosPrimeira += sPrimeira;
                } else if (modoNorm === 'PHASE2' || modoNorm === 'FASE_2' || modoNorm === 'FASE2') {
                    porFase.fase2.tentativas += sTentativas;
                    porFase.fase2.acertos += sAcertos;
                    porFase.fase2.acertosPrimeira += sPrimeira;
                } else if (modoNorm === 'PHASE3' || modoNorm === 'FASE_3' || modoNorm === 'FASE3') {
                    porFase.fase3.tentativas += sTentativas;
                    porFase.fase3.acertos += sAcertos;
                    porFase.fase3.acertosPrimeira += sPrimeira;
                } else {
                    temDadosLegadosSemFase = true;
                }
            }

            // Consolida estatísticas por palavra
            var pStats = s.palavrasStats && typeof s.palavrasStats === 'object' ? s.palavrasStats : {};
            var pKeys = Object.keys(pStats);
            for (var pk = 0; pk < pKeys.length; pk++) {
                var palavra = pKeys[pk];
                var itemP = pStats[palavra] || {};
                if (!palavras[palavra]) {
                    palavras[palavra] = { tentativas: 0, acertos: 0, erros: 0, taxa: 0 };
                }
                palavras[palavra].tentativas += Number(itemP.tentativas) || 0;
                palavras[palavra].acertos += Number(itemP.acertos) || 0;
                palavras[palavra].erros += Number(itemP.erros) || 0;
            }

            // Consolida erros ortográficos
            var eOrt = s.errosOrtograficos && typeof s.errosOrtograficos === 'object' ? s.errosOrtograficos : {};
            var oKeys = Object.keys(eOrt);
            for (var ok = 0; ok < oKeys.length; ok++) {
                var codigo = oKeys[ok];
                var itemO = eOrt[codigo] || {};
                if (!errosOrtograficos[codigo]) {
                    errosOrtograficos[codigo] = {
                        codigo: itemO.codigo || codigo,
                        label: itemO.label || codigo,
                        count: 0,
                        exemplos: []
                    };
                }
                errosOrtograficos[codigo].count += Number(itemO.count) || 0;
                var exList = Array.isArray(itemO.exemplos) ? itemO.exemplos : [];
                for (var ei = 0; ei < exList.length; ei++) {
                    if (errosOrtograficos[codigo].exemplos.indexOf(exList[ei]) === -1 &&
                        errosOrtograficos[codigo].exemplos.length < 5) {
                        errosOrtograficos[codigo].exemplos.push(exList[ei]);
                    }
                }
            }

            // Consolida travas em sílabas
            var eSil = s.errosSilabas && typeof s.errosSilabas === 'object' ? s.errosSilabas : {};
            var sKeys = Object.keys(eSil);
            for (var sk = 0; sk < sKeys.length; sk++) {
                var silaba = sKeys[sk];
                var itemS = eSil[silaba] || {};
                if (!errosSilabas[silaba]) {
                    errosSilabas[silaba] = {
                        silaba: silaba,
                        count: 0,
                        palavras: []
                    };
                }
                errosSilabas[silaba].count += Number(itemS.count) || 0;
                var palList = Array.isArray(itemS.palavras) ? itemS.palavras : [];
                for (var pi = 0; pi < palList.length; pi++) {
                    if (errosSilabas[silaba].palavras.indexOf(palList[pi]) === -1 &&
                        errosSilabas[silaba].palavras.length < 5) {
                        errosSilabas[silaba].palavras.push(palList[pi]);
                    }
                }
            }
        }

        // Calcula taxa de acerto individual de cada palavra
        var todasPalavras = Object.keys(palavras);
        for (var idx = 0; idx < todasPalavras.length; idx++) {
            var pNome = todasPalavras[idx];
            var pObj = palavras[pNome];
            pObj.taxa = pObj.tentativas > 0 ? Math.round((pObj.acertos / pObj.tentativas) * 100) : 0;
        }

        var taxaAcerto = tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 0;
        var taxaPrimeira = tentativas > 0 ? Math.round((acertosPrimeira / tentativas) * 100) : 0;

        // Fase 1 prioriza tempo médio (v2.1.3+), mantendo fallback retrocompatível para sessões antigas
        var f1 = porFase.fase1;
        if (f1.rodadas > 0) {
            f1.modoMetrica = 'tempo';
            f1.tempoMedioSegundos = Math.max(1, Math.round(f1.tempoTotalSegundos / f1.rodadas));
            f1.temDados = true;
            f1.taxaAcerto = null;
            f1.taxaPrimeira = null;
        } else if (f1.tentativas > 0) {
            f1.modoMetrica = 'legado_taxa';
            f1.tempoMedioSegundos = null;
            f1.temDados = true;
            f1.taxaAcerto = Math.round((f1.acertos / f1.tentativas) * 100);
            f1.taxaPrimeira = Math.round((f1.acertosPrimeira / f1.tentativas) * 100);
        } else {
            f1.modoMetrica = 'vazio';
            f1.tempoMedioSegundos = null;
            f1.temDados = false;
            f1.taxaAcerto = null;
            f1.taxaPrimeira = null;
        }

        var chavesCalc = ['fase2', 'fase3'];
        for (var fc = 0; fc < chavesCalc.length; fc++) {
            var pf = porFase[chavesCalc[fc]];
            pf.temDados = pf.tentativas > 0;
            pf.taxaAcerto = pf.temDados ? Math.round((pf.acertos / pf.tentativas) * 100) : null;
            pf.taxaPrimeira = pf.temDados ? Math.round((pf.acertosPrimeira / pf.tentativas) * 100) : null;
        }

        return {
            tentativas: tentativas,
            acertos: acertos,
            acertosPrimeira: acertosPrimeira,
            taxaAcerto: taxaAcerto,
            taxaPrimeira: taxaPrimeira,
            sessoesCount: lista.length,
            porFase: porFase,
            temDadosLegadosSemFase: temDadosLegadosSemFase,
            palavras: palavras,
            errosOrtograficos: errosOrtograficos,
            errosSilabas: errosSilabas
        };
    }

    /**
     * Gera comparativo detalhado entre o dia/período de referência e o anterior disponível.
     */
    function gerarComparativo(metricasDia, metricasAnterior, dataAnterior, rotuloUnidade) {
        var ehPeriodo = rotuloUnidade === 'periodo';
        var refAnteriorLabel = ehPeriodo ? 'ao período anterior' : 'ao dia anterior';
        var noAnteriorLabel = ehPeriodo ? 'no período anterior' : 'no dia anterior';
        var doAnteriorLabel = ehPeriodo ? 'do período anterior' : 'do dia anterior';
        var nestaUnidadeLabel = ehPeriodo ? 'neste período' : 'nesta data';

        if (!dataAnterior || !metricasAnterior) {
            return {
                temDiaAnterior: false,
                tipoComparativo: ehPeriodo ? 'primeiro_periodo' : 'primeiro_dia',
                variacaoTaxaAcerto: null,
                variacaoTempoFase1: null,
                tendencia: 'first',
                mensagensMelhoria: [
                    ehPeriodo
                        ? 'Primeiro período com registros para esta seleção. Continue praticando para comparar entre períodos.'
                        : 'Primeiro dia registrado para esta seleção. Continue praticando para comparar a evolução.'
                ]
            };
        }

        var f1Dia = (metricasDia.porFase && metricasDia.porFase.fase1) ? metricasDia.porFase.fase1 : null;
        var f1Ant = (metricasAnterior.porFase && metricasAnterior.porFase.fase1) ? metricasAnterior.porFase.fase1 : null;
        var f1AmbosTempo = Boolean(
            f1Dia && f1Dia.modoMetrica === 'tempo' &&
            f1Ant && f1Ant.modoMetrica === 'tempo'
        );

        // Quando uma das unidades possui apenas registros por tempo na Fase 1 (sem tentativas de F2/F3)
        if (metricasDia.tentativas === 0 || metricasAnterior.tentativas === 0) {
            if (f1AmbosTempo) {
                var diffSeg = f1Dia.tempoMedioSegundos - f1Ant.tempoMedioSegundos;
                var tendTempo = 'flat';
                if (diffSeg <= -3) {
                    tendTempo = 'up';
                } else if (diffSeg >= 3) {
                    tendTempo = 'down';
                }

                var msgsTempo = [];
                if (diffSeg <= -3) {
                    msgsTempo.push(
                        'Mais agilidade na Fase 1 (Memória): tempo médio caiu ' + Math.abs(diffSeg) +
                        's (de ' + formatarTempoSegundosSimples(f1Ant.tempoMedioSegundos) +
                        ' para ' + formatarTempoSegundosSimples(f1Dia.tempoMedioSegundos) + ').'
                    );
                } else if (diffSeg < 0) {
                    msgsTempo.push(
                        'Leve melhora de tempo na Fase 1 (Memória): -' + Math.abs(diffSeg) +
                        's em relação ' + refAnteriorLabel + '.'
                    );
                } else if (diffSeg === 0) {
                    msgsTempo.push(
                        'Manteve o tempo médio da Fase 1 (Memória) em ' +
                        formatarTempoSegundosSimples(f1Dia.tempoMedioSegundos) + '.'
                    );
                } else if (diffSeg < 3) {
                    msgsTempo.push(
                        'Tempo médio estável na Fase 1 (Memória): ' +
                        formatarTempoSegundosSimples(f1Dia.tempoMedioSegundos) + '.'
                    );
                } else {
                    msgsTempo.push(
                        'A Fase 1 (Memória) levou ' + diffSeg +
                        's a mais em média (' + formatarTempoSegundosSimples(f1Dia.tempoMedioSegundos) +
                        ' contra ' + formatarTempoSegundosSimples(f1Ant.tempoMedioSegundos) + ').'
                    );
                }

                return {
                    temDiaAnterior: true,
                    tipoComparativo: 'tempo_fase1',
                    variacaoTaxaAcerto: null,
                    variacaoTempoFase1: diffSeg,
                    tendencia: tendTempo,
                    mensagensMelhoria: msgsTempo
                };
            }

            return {
                temDiaAnterior: true,
                tipoComparativo: 'sem_base_comum',
                variacaoTaxaAcerto: null,
                variacaoTempoFase1: null,
                tendencia: 'flat',
                mensagensMelhoria: [
                    'As atividades registradas ' + nestaUnidadeLabel + ' usaram fases ou métricas diferentes das ' + doAnteriorLabel + '.'
                ]
            };
        }

        var variacao = metricasDia.taxaAcerto - metricasAnterior.taxaAcerto;
        var tendencia = 'flat';
        if (variacao >= 3) {
            tendencia = 'up';
        } else if (variacao <= -3) {
            tendencia = 'down';
        }

        var mensagens = [];

        if (variacao >= 3) {
            mensagens.push(
                'A taxa de acerto subiu ' + variacao + ' pontos percentuais (de ' +
                metricasAnterior.taxaAcerto + '% para ' + metricasDia.taxaAcerto + '%).'
            );
        } else if (variacao > 0) {
            mensagens.push(
                'Leve ganho na taxa de acerto (+' + variacao +
                (variacao === 1 ? ' ponto percentual' : ' pontos percentuais') + ' em relação ' + refAnteriorLabel + ').'
            );
        } else if (variacao === 0) {
            mensagens.push(
                'Manteve a taxa de acerto em ' + metricasDia.taxaAcerto + '% em relação ' + refAnteriorLabel + '.'
            );
        } else if (variacao > -3) {
            mensagens.push(
                'Desempenho estável em relação ' + refAnteriorLabel + ' (' + metricasDia.taxaAcerto + '%).'
            );
        } else {
            mensagens.push(
                'A taxa de acerto ficou ' + Math.abs(variacao) +
                (Math.abs(variacao) === 1 ? ' ponto percentual' : ' pontos percentuais') +
                ' abaixo em relação ' + refAnteriorLabel + ' (bom momento para retomar as palavras).'
            );
        }

        var difPrimeira = metricasDia.taxaPrimeira - metricasAnterior.taxaPrimeira;
        if (difPrimeira >= 5) {
            mensagens.push(
                'Mais respostas corretas logo na 1ª tentativa (' +
                metricasDia.taxaPrimeira + '% contra ' + metricasAnterior.taxaPrimeira + '% antes).'
            );
        }

        if (mensagens.length < 3 && f1AmbosTempo) {
            var diffF1 = f1Dia.tempoMedioSegundos - f1Ant.tempoMedioSegundos;
            if (diffF1 <= -3) {
                mensagens.push(
                    'Mais agilidade na Fase 1 (Memória): tempo médio caiu de ' +
                    formatarTempoSegundosSimples(f1Ant.tempoMedioSegundos) + ' para ' +
                    formatarTempoSegundosSimples(f1Dia.tempoMedioSegundos) + '.'
                );
            }
        }

        // Destaca reduções em erros ortográficos específicos
        var ortPrevKeys = Object.keys(metricasAnterior.errosOrtograficos);
        var reducoesOrt = [];
        for (var i = 0; i < ortPrevKeys.length; i++) {
            var cod = ortPrevKeys[i];
            var prevOrt = metricasAnterior.errosOrtograficos[cod];
            var currOrt = metricasDia.errosOrtograficos[cod];
            var currCount = currOrt ? currOrt.count : 0;
            if (prevOrt.count > 0 && currCount < prevOrt.count) {
                reducoesOrt.push({
                    label: prevOrt.label,
                    antes: prevOrt.count,
                    depois: currCount,
                    queda: prevOrt.count - currCount
                });
            }
        }
        reducoesOrt.sort(function (a, b) { return b.queda - a.queda; });

        for (var r = 0; r < reducoesOrt.length && mensagens.length < 3; r++) {
            var red = reducoesOrt[r];
            if (red.depois === 0) {
                mensagens.push(
                    'Nenhuma ocorrência de "' + red.label + '" (' +
                    (red.antes === 1 ? 'foi 1 ' + noAnteriorLabel : 'foram ' + red.antes + ' ' + noAnteriorLabel) + ').'
                );
            } else {
                mensagens.push(
                    'Redução em "' + red.label + '" de ' + red.antes + ' para ' + red.depois +
                    (red.depois === 1 ? ' ocorrência.' : ' ocorrências.')
                );
            }
        }

        // Se ainda houver espaço, destaca melhora em sílabas específicas
        if (mensagens.length < 3) {
            var silPrevKeys = Object.keys(metricasAnterior.errosSilabas);
            var reducoesSil = [];
            for (var j = 0; j < silPrevKeys.length; j++) {
                var sil = silPrevKeys[j];
                var prevSil = metricasAnterior.errosSilabas[sil];
                var currSil = metricasDia.errosSilabas[sil];
                var currSilCount = currSil ? currSil.count : 0;
                if (prevSil.count > 0 && currSilCount < prevSil.count) {
                    reducoesSil.push({
                        silaba: sil,
                        antes: prevSil.count,
                        depois: currSilCount,
                        queda: prevSil.count - currSilCount
                    });
                }
            }
            reducoesSil.sort(function (a, b) { return b.queda - a.queda; });
            if (reducoesSil.length > 0) {
                var topSil = reducoesSil[0];
                mensagens.push(
                    'Menos dificuldade na sílaba ' + topSil.silaba +
                    ' (caiu de ' + topSil.antes + ' para ' + topSil.depois + ').'
                );
            }
        }

        return {
            temDiaAnterior: true,
            tipoComparativo: 'taxa',
            variacaoTaxaAcerto: variacao,
            variacaoTempoFase1: f1AmbosTempo ? (f1Dia.tempoMedioSegundos - f1Ant.tempoMedioSegundos) : null,
            tendencia: tendencia,
            mensagensMelhoria: mensagens
        };
    }

    /**
     * Identifica os pontos fortes observados no dia ou período selecionado.
     */
    function gerarPontosFortes(metricasDia, rotuloUnidade) {
        var ehPeriodo = rotuloUnidade === 'periodo';
        var noLocalLabel = ehPeriodo ? 'no período' : 'no dia';
        var nestaDataLabel = ehPeriodo ? 'neste período' : 'nesta data';
        var fortes = [];
        var f1 = (metricasDia.porFase && metricasDia.porFase.fase1) ? metricasDia.porFase.fase1 : null;
        var f3 = (metricasDia.porFase && metricasDia.porFase.fase3) ? metricasDia.porFase.fase3 : null;
        var temFase3 = Boolean(f3 && f3.temDados);

        if (metricasDia.tentativas > 0) {
            if (metricasDia.taxaAcerto >= 80) {
                fortes.push('Ótimo aproveitamento geral: ' + metricasDia.taxaAcerto + '% de acertos ' + noLocalLabel + '.');
            }

            if (metricasDia.taxaPrimeira >= 70) {
                fortes.push(
                    (temFase3 ? 'Boa segurança na escrita: ' : 'Boa segurança nas atividades: ') +
                    metricasDia.taxaPrimeira + '% de acertos na 1ª tentativa.'
                );
            }
        }

        if (f1 && f1.modoMetrica === 'tempo') {
            fortes.push(
                'Fase 1 (Memória) concluída com média de ' +
                formatarTempoSegundosSimples(f1.tempoMedioSegundos) +
                ' em ' + f1.rodadas + (f1.rodadas === 1 ? ' rodada.' : ' rodadas.')
            );
        }

        // Seleciona palavras com >= 80% de acerto
        var palavrasBoas = [];
        var pKeys = Object.keys(metricasDia.palavras);
        for (var i = 0; i < pKeys.length; i++) {
            var nome = pKeys[i];
            var p = metricasDia.palavras[nome];
            if (p.tentativas > 0 && p.acertos > 0 && p.taxa >= 80) {
                palavrasBoas.push({ nome: nome, taxa: p.taxa, acertos: p.acertos });
            }
        }
        palavrasBoas.sort(function (a, b) {
            if (b.taxa !== a.taxa) return b.taxa - a.taxa;
            return b.acertos - a.acertos;
        });

        if (palavrasBoas.length > 0) {
            var nomesBoas = [];
            for (var k = 0; k < palavrasBoas.length && k < 4; k++) {
                nomesBoas.push(palavrasBoas[k].nome);
            }
            fortes.push('Palavras com ótimo domínio (80% ou mais): ' + nomesBoas.join(', ') + '.');
        }

        var qtdOrt = Object.keys(metricasDia.errosOrtograficos).length;
        var qtdSil = Object.keys(metricasDia.errosSilabas).length;

        if (metricasDia.tentativas > 0) {
            if (qtdOrt === 0 && qtdSil === 0) {
                fortes.push(
                    temFase3
                        ? ('Ausência de trocas ortográficas e travas silábicas ' + nestaDataLabel + '.')
                        : ('Ausência de travas silábicas registradas ' + nestaDataLabel + '.')
                );
            } else if (qtdOrt === 0 && temFase3) {
                fortes.push('Nenhuma troca ortográfica frequente registrada na escrita.');
            }
        }

        if (fortes.length === 0) {
            if (metricasDia.tentativas > 0) {
                fortes.push(
                    'Participação registrada com ' + metricasDia.tentativas +
                    (metricasDia.tentativas === 1 ? ' tentativa e ' : ' tentativas e ') +
                    metricasDia.acertos + (metricasDia.acertos === 1 ? ' acerto ' : ' acertos ') + nestaDataLabel + '.'
                );
            } else {
                fortes.push('Participação registrada na Fase 1 (Jogo da Memória) ' + nestaDataLabel + '.');
            }
        }

        return fortes.slice(0, 4);
    }

    /**
     * Identifica os pontos de atenção para trabalhar em sala a partir dos dados do dia ou período.
     */
    function gerarPontosAtencao(metricasDia, rotuloUnidade) {
        var ehPeriodo = rotuloUnidade === 'periodo';
        var nestaDataLabel = ehPeriodo ? 'neste período' : 'nesta data';
        var atencao = [];

        // Top trocas ortográficas
        var listaOrt = [];
        var oKeys = Object.keys(metricasDia.errosOrtograficos);
        for (var i = 0; i < oKeys.length; i++) {
            listaOrt.push(metricasDia.errosOrtograficos[oKeys[i]]);
        }
        listaOrt.sort(function (a, b) { return b.count - a.count; });

        for (var oi = 0; oi < listaOrt.length && oi < 2; oi++) {
            var ort = listaOrt[oi];
            atencao.push(
                'Trabalhar ' + ort.label + ' (' + ort.count +
                (ort.count === 1 ? ' registro' : ' registros') + ').'
            );
        }

        // Top sílabas com trava
        var listaSil = [];
        var sKeys = Object.keys(metricasDia.errosSilabas);
        for (var j = 0; j < sKeys.length; j++) {
            listaSil.push(metricasDia.errosSilabas[sKeys[j]]);
        }
        listaSil.sort(function (a, b) { return b.count - a.count; });

        for (var si = 0; si < listaSil.length && si < 2; si++) {
            var sil = listaSil[si];
            atencao.push(
                'Praticar a sílaba ' + sil.silaba + ' (' + sil.count +
                (sil.count === 1 ? ' dificuldade' : ' dificuldades') + ').'
            );
        }

        // Palavras com mais erros
        var palavrasErro = [];
        var pKeys = Object.keys(metricasDia.palavras);
        for (var k = 0; k < pKeys.length; k++) {
            var pNome = pKeys[k];
            var pStat = metricasDia.palavras[pNome];
            if (pStat.erros > 0) {
                palavrasErro.push({
                    palavra: pNome,
                    erros: pStat.erros,
                    taxa: pStat.taxa
                });
            }
        }
        palavrasErro.sort(function (a, b) {
            if (b.erros !== a.erros) return b.erros - a.erros;
            return a.taxa - b.taxa;
        });

        if (palavrasErro.length > 0) {
            var nomesErro = [];
            for (var pe = 0; pe < palavrasErro.length && pe < 3; pe++) {
                nomesErro.push(palavrasErro[pe].palavra + ' (' + palavrasErro[pe].erros + ')');
            }
            atencao.push('Revisar palavras com mais erros: ' + nomesErro.join(', ') + '.');
        }

        if (atencao.length === 0) {
            atencao.push('Nenhum ponto de atenção crítico identificado ' + nestaDataLabel + '.');
        }

        return atencao.slice(0, 5);
    }

    /**
     * Combina erros ortográficos e sílabas com trava no ranking top 6 de dificuldades.
     */
    function gerarRankingDificuldades(metricasDia) {
        var itens = [];

        var oKeys = Object.keys(metricasDia.errosOrtograficos);
        for (var i = 0; i < oKeys.length; i++) {
            var ort = metricasDia.errosOrtograficos[oKeys[i]];
            if (ort.count > 0) {
                itens.push({
                    tipo: 'ortografia',
                    nome: ort.label,
                    count: ort.count,
                    exemplos: Array.isArray(ort.exemplos) ? ort.exemplos.slice(0, 5) : []
                });
            }
        }

        var sKeys = Object.keys(metricasDia.errosSilabas);
        for (var j = 0; j < sKeys.length; j++) {
            var sil = metricasDia.errosSilabas[sKeys[j]];
            if (sil.count > 0) {
                itens.push({
                    tipo: 'silaba',
                    nome: 'Sílaba ' + sil.silaba,
                    count: sil.count,
                    exemplos: Array.isArray(sil.palavras) ? sil.palavras.slice(0, 5) : []
                });
            }
        }

        itens.sort(function (a, b) {
            if (b.count !== a.count) return b.count - a.count;
            return a.nome.localeCompare(b.nome);
        });

        var top6 = itens.slice(0, 6);
        var maxCount = top6.length > 0 ? top6[0].count : 1;

        for (var k = 0; k < top6.length; k++) {
            var perc = Math.round((top6[k].count / maxCount) * 100);
            top6[k].percentualBarra = Math.max(12, Math.min(100, perc));
        }

        return top6;
    }

    /**
     * Copia de maneira segura os indicadores de uma fase para séries comparativas.
     */
    function copiarFaseResumo(porFaseDia, chave) {
        var f = (porFaseDia && porFaseDia[chave]) ? porFaseDia[chave] : null;
        if (!f || !f.temDados) {
            return chave === 'fase1'
                ? {
                    tentativas: 0,
                    acertos: 0,
                    taxaAcerto: null,
                    tempoTotalSegundos: 0,
                    rodadas: 0,
                    tempoMedioSegundos: null,
                    modoMetrica: 'vazio',
                    temDados: false
                }
                : { tentativas: 0, acertos: 0, taxaAcerto: null, temDados: false };
        }
        if (chave === 'fase1') {
            return {
                tentativas: f.tentativas,
                acertos: f.acertos,
                taxaAcerto: f.taxaAcerto,
                tempoTotalSegundos: f.tempoTotalSegundos || 0,
                rodadas: f.rodadas || 0,
                tempoMedioSegundos: f.tempoMedioSegundos !== undefined ? f.tempoMedioSegundos : null,
                modoMetrica: f.modoMetrica || 'vazio',
                temDados: true
            };
        }
        return {
            tentativas: f.tentativas,
            acertos: f.acertos,
            taxaAcerto: f.taxaAcerto,
            temDados: true
        };
    }

    /**
     * Gera o resumo completo de evolução pedagógica para um aluno (ou turma) e data de referência.
     */
    function gerarResumoEvolucao(filtros) {
        var cfg = filtros && typeof filtros === 'object' ? filtros : {};
        var alunoId = cfg.alunoId || 'TODOS';
        var chaveAlunoFiltro = obterChaveAlunoCadastrado(alunoId);
        var dataSolicitada = cfg.dataReferencia || null;

        var todasSessoes = obterSessoesArmazenadas();
        var sessoesPorData = Object.create(null);
        var mapaDatas = Object.create(null);

        for (var i = 0; i < todasSessoes.length; i++) {
            var s = todasSessoes[i];
            if (!sessaoPertenceAoAluno(s, alunoId, chaveAlunoFiltro)) continue;
            if (!s.dataISO || typeof s.dataISO !== 'string') continue;

            if (!sessoesPorData[s.dataISO]) {
                sessoesPorData[s.dataISO] = [];
            }
            sessoesPorData[s.dataISO].push(s);
            mapaDatas[s.dataISO] = true;
        }

        var datasDisponiveis = Object.keys(mapaDatas).sort(function (a, b) {
            return b.localeCompare(a);
        });

        if (datasDisponiveis.length === 0) {
            return {
                vazio: true,
                datasDisponiveis: []
            };
        }

        var dataRef = (dataSolicitada && mapaDatas[dataSolicitada]) ? dataSolicitada : datasDisponiveis[0];
        var idxRef = datasDisponiveis.indexOf(dataRef);
        var dataAnterior = (idxRef >= 0 && idxRef + 1 < datasDisponiveis.length)
            ? datasDisponiveis[idxRef + 1]
            : null;

        var consolidadoPorData = Object.create(null);
        function obterMetricasData(dataISO) {
            if (!dataISO) return null;
            if (!consolidadoPorData[dataISO]) {
                consolidadoPorData[dataISO] = consolidarDia(sessoesPorData[dataISO]);
            }
            return consolidadoPorData[dataISO];
        }

        var metricasDia = obterMetricasData(dataRef);
        var metricasAnterior = obterMetricasData(dataAnterior);

        var comparativo = gerarComparativo(metricasDia, metricasAnterior, dataAnterior, 'dia');
        var pontosFortes = gerarPontosFortes(metricasDia, 'dia');
        var pontosAtencao = gerarPontosAtencao(metricasDia, 'dia');
        var rankingDificuldades = gerarRankingDificuldades(metricasDia);

        // Até 7 datas mais recentes (terminando em dataRef), em ordem cronológica crescente
        var datasJanelaDesc = datasDisponiveis.slice(idxRef, idxRef + 7);
        var datasJanelaAsc = datasJanelaDesc.slice().reverse();
        var serieDiaria = [];

        for (var d = 0; d < datasJanelaAsc.length; d++) {
            var dataItem = datasJanelaAsc[d];
            var met = obterMetricasData(dataItem);
            serieDiaria.push({
                dataISO: dataItem,
                dataCurta: formatarDataCurta(dataItem),
                taxaAcerto: met.taxaAcerto,
                tentativas: met.tentativas,
                acertos: met.acertos,
                porFase: {
                    fase1: copiarFaseResumo(met.porFase, 'fase1'),
                    fase2: copiarFaseResumo(met.porFase, 'fase2'),
                    fase3: copiarFaseResumo(met.porFase, 'fase3')
                },
                temDadosLegadosSemFase: Boolean(met.temDadosLegadosSemFase),
                isReferencia: dataItem === dataRef,
                isAnterior: dataItem === dataAnterior
            });
        }

        return {
            vazio: false,
            alunoId: alunoId,
            dataReferencia: dataRef,
            dataAnterior: dataAnterior,
            datasDisponiveis: datasDisponiveis,
            metricasDia: metricasDia,
            metricasAnterior: metricasAnterior,
            comparativo: comparativo,
            pontosFortes: pontosFortes,
            pontosAtencao: pontosAtencao,
            serieDiaria: serieDiaria,
            rankingDificuldades: rankingDificuldades
        };
    }

    /**
     * Gera o resumo consolidado e o comparativo entre períodos letivos (Bimestre/Trimestre)
     * para a turma completa ou para um aluno individual, sem apagar o histórico acumulado.
     */
    function gerarResumoPorPeriodo(filtros) {
        var cfg = filtros && typeof filtros === 'object' ? filtros : {};
        var alunoId = cfg.alunoId || 'TODOS';
        var chaveAlunoFiltro = obterChaveAlunoCadastrado(alunoId);
        var storage = getStorage();
        var periods = getPeriods();

        var configPeriodos = null;
        if (cfg.configuracaoPeriodos && typeof cfg.configuracaoPeriodos === 'object') {
            configPeriodos = (periods && typeof periods.sanitizarConfiguracao === 'function')
                ? periods.sanitizarConfiguracao(cfg.configuracaoPeriodos)
                : cfg.configuracaoPeriodos;
        } else if (storage && typeof storage.getPeriodosLetivos === 'function') {
            configPeriodos = storage.getPeriodosLetivos();
        }
        if (!configPeriodos && periods && typeof periods.gerarConfiguracaoPadrao === 'function') {
            configPeriodos = periods.gerarConfiguracaoPadrao('bimestre');
        }

        var todasSessoes = obterSessoesArmazenadas();
        var sessoesAluno = [];
        for (var i = 0; i < todasSessoes.length; i++) {
            var s = todasSessoes[i];
            if (!sessaoPertenceAoAluno(s, alunoId, chaveAlunoFiltro)) continue;
            if (!s.dataISO || typeof s.dataISO !== 'string') continue;
            sessoesAluno.push(s);
        }

        var agrupamento;
        if (periods && typeof periods.agruparSessoesPorCiclo === 'function') {
            agrupamento = periods.agruparSessoesPorCiclo(sessoesAluno, configPeriodos);
        } else {
            var ciclosFallback = (configPeriodos && Array.isArray(configPeriodos.ciclos)) ? configPeriodos.ciclos : [];
            agrupamento = { grupos: [], foraDosCiclos: sessoesAluno.slice() };
            for (var cIdx = 0; cIdx < ciclosFallback.length; cIdx++) {
                agrupamento.grupos.push({ ciclo: ciclosFallback[cIdx], sessoes: [] });
            }
        }

        var periodoAtual = null;
        if (cfg.periodoId && periods && typeof periods.obterCicloPorId === 'function') {
            periodoAtual = periods.obterCicloPorId(configPeriodos, cfg.periodoId);
        }
        if (!periodoAtual && periods && typeof periods.sugerirCicloAtivo === 'function') {
            periodoAtual = periods.sugerirCicloAtivo(sessoesAluno, configPeriodos, getDataLocalISO());
        }
        if (!periodoAtual && agrupamento.grupos.length > 0) {
            periodoAtual = agrupamento.grupos[0].ciclo;
        }

        var sessoesPorId = Object.create(null);
        for (var g = 0; g < agrupamento.grupos.length; g++) {
            var grp = agrupamento.grupos[g];
            if (grp && grp.ciclo && grp.ciclo.id) {
                sessoesPorId[grp.ciclo.id] = grp.sessoes || [];
            }
        }

        var sessoesDoPeriodo = (periodoAtual && sessoesPorId[periodoAtual.id]) ? sessoesPorId[periodoAtual.id] : [];
        var metricasAtual = consolidarDia(sessoesDoPeriodo);

        var cicloAnteriorBruto = (periodoAtual && periods && typeof periods.obterCicloAnterior === 'function')
            ? periods.obterCicloAnterior(configPeriodos, periodoAtual.id)
            : null;
        var sessoesAnterior = (cicloAnteriorBruto && sessoesPorId[cicloAnteriorBruto.id])
            ? sessoesPorId[cicloAnteriorBruto.id]
            : [];
        var periodoAnteriorComDados = sessoesAnterior.length > 0 ? cicloAnteriorBruto : null;
        var metricasAnterior = periodoAnteriorComDados ? consolidarDia(sessoesAnterior) : null;

        var comparativo = gerarComparativo(
            metricasAtual,
            metricasAnterior,
            periodoAnteriorComDados ? periodoAnteriorComDados.id : null,
            'periodo'
        );
        var pontosFortes = sessoesDoPeriodo.length > 0 ? gerarPontosFortes(metricasAtual, 'periodo') : [];
        var pontosAtencao = sessoesDoPeriodo.length > 0 ? gerarPontosAtencao(metricasAtual, 'periodo') : [];
        var rankingDificuldades = sessoesDoPeriodo.length > 0 ? gerarRankingDificuldades(metricasAtual) : [];

        var seriePeriodos = [];
        for (var p = 0; p < agrupamento.grupos.length; p++) {
            var gp = agrupamento.grupos[p];
            var cicloG = gp.ciclo;
            var metG = consolidarDia(gp.sessoes);
            var intervaloBR = (periods && typeof periods.formatarIntervaloBR === 'function')
                ? periods.formatarIntervaloBR(cicloG.inicio, cicloG.fim, true)
                : (formatarDataCurta(cicloG.inicio) + ' a ' + formatarDataCurta(cicloG.fim));

            seriePeriodos.push({
                periodoId: cicloG.id,
                nome: cicloG.nome,
                sigla: cicloG.sigla,
                inicio: cicloG.inicio,
                fim: cicloG.fim,
                intervaloBR: intervaloBR,
                sessoesCount: metG.sessoesCount,
                taxaAcerto: metG.taxaAcerto,
                tentativas: metG.tentativas,
                acertos: metG.acertos,
                porFase: {
                    fase1: copiarFaseResumo(metG.porFase, 'fase1'),
                    fase2: copiarFaseResumo(metG.porFase, 'fase2'),
                    fase3: copiarFaseResumo(metG.porFase, 'fase3')
                },
                temDadosLegadosSemFase: Boolean(metG.temDadosLegadosSemFase),
                isReferencia: Boolean(periodoAtual && cicloG.id === periodoAtual.id),
                isAnterior: Boolean(periodoAnteriorComDados && cicloG.id === periodoAnteriorComDados.id)
            });
        }

        return {
            vazio: sessoesAluno.length === 0,
            periodoSemRegistros: sessoesDoPeriodo.length === 0,
            alunoId: alunoId,
            configuracaoPeriodos: configPeriodos,
            periodoAtual: periodoAtual,
            periodoAnterior: periodoAnteriorComDados,
            metricasPeriodo: metricasAtual,
            metricasAnterior: metricasAnterior,
            comparativo: comparativo,
            pontosFortes: pontosFortes,
            pontosAtencao: pontosAtencao,
            seriePeriodos: seriePeriodos,
            rankingDificuldades: rankingDificuldades,
            sessoesForaDosCiclosCount: Array.isArray(agrupamento.foraDosCiclos) ? agrupamento.foraDosCiclos.length : 0
        };
    }

    /**
     * Gera resumo individual de desempenho nas 3 fases para todos os alunos cadastrados
     * (e alunos presentes apenas no histórico), ordenado alfabeticamente.
     */
    function gerarResumoPorAluno(opcoes) {
        var cfg = opcoes && typeof opcoes === 'object' ? opcoes : {};
        var escopo = cfg.escopo === 'DIA'
            ? 'DIA'
            : (cfg.escopo === 'PERIODO' ? 'PERIODO' : 'GERAL');
        var dataReferencia = cfg.dataReferencia || null;
        var dataInicio = cfg.dataInicio || null;
        var dataFim = cfg.dataFim || null;

        var storage = getStorage();
        var periods = getPeriods();

        if (escopo === 'PERIODO' && (!dataInicio || !dataFim) && cfg.periodoId) {
            var cfgPer = (storage && typeof storage.getPeriodosLetivos === 'function')
                ? storage.getPeriodosLetivos()
                : null;
            if (cfgPer && periods && typeof periods.obterCicloPorId === 'function') {
                var cicloAlvo = periods.obterCicloPorId(cfgPer, cfg.periodoId);
                if (cicloAlvo) {
                    dataInicio = cicloAlvo.inicio;
                    dataFim = cicloAlvo.fim;
                }
            }
        }

        var alunosCadastrados = (storage && typeof storage.listarAlunos === 'function')
            ? storage.listarAlunos()
            : [];
        if (!Array.isArray(alunosCadastrados)) alunosCadastrados = [];

        var todasSessoes = obterSessoesArmazenadas();
        var registros = [];
        var mapaPorId = Object.create(null);
        var mapaPorChave = Object.create(null);

        for (var i = 0; i < alunosCadastrados.length; i++) {
            var a = alunosCadastrados[i];
            if (!a || !a.nome) continue;
            var idStr = a.id ? String(a.id) : ('chave:' + String(a.chave || a.nome));
            var chaveNorm = a.chave
                ? String(a.chave)
                : ((storage && typeof storage.normalizarChave === 'function')
                    ? storage.normalizarChave(a.nome)
                    : String(a.nome).toLowerCase());

            if (mapaPorId[idStr]) continue;

            var entry = {
                id: idStr,
                nome: String(a.nome),
                chave: chaveNorm,
                cadastrado: true,
                sessoes: []
            };
            mapaPorId[idStr] = entry;
            if (chaveNorm) {
                mapaPorChave[chaveNorm] = entry;
            }
            registros.push(entry);
        }

        // Associa sessões filtradas pelo escopo sem duplicar alunos cadastrados
        for (var j = 0; j < todasSessoes.length; j++) {
            var s = todasSessoes[j];
            if (!s || typeof s !== 'object') continue;
            if (escopo === 'DIA') {
                if (!dataReferencia || s.dataISO !== dataReferencia) continue;
            } else if (escopo === 'PERIODO') {
                if (!dataInicio || !dataFim || !s.dataISO || s.dataISO < dataInicio || s.dataISO > dataFim) {
                    continue;
                }
            }

            var sId = (s.alunoId !== null && s.alunoId !== undefined && s.alunoId !== '')
                ? String(s.alunoId)
                : null;
            var sChave = (s.alunoChave && s.alunoChave !== 'turma')
                ? String(s.alunoChave)
                : '';

            var alvo = null;
            if (sId && mapaPorId[sId]) {
                alvo = mapaPorId[sId];
            } else if (sChave && mapaPorChave[sChave]) {
                alvo = mapaPorChave[sChave];
            } else if (sId || sChave) {
                var idFallback = sId || ('chave:' + sChave);
                if (mapaPorId[idFallback]) {
                    alvo = mapaPorId[idFallback];
                } else {
                    alvo = {
                        id: idFallback,
                        nome: s.alunoNome ? String(s.alunoNome) : (sChave || idFallback),
                        chave: sChave,
                        cadastrado: false,
                        sessoes: []
                    };
                    mapaPorId[idFallback] = alvo;
                    if (sChave && !mapaPorChave[sChave]) {
                        mapaPorChave[sChave] = alvo;
                    }
                    registros.push(alvo);
                }
            }

            if (alvo) {
                alvo.sessoes.push(s);
            }
        }

        var resultado = [];
        for (var r = 0; r < registros.length; r++) {
            var reg = registros[r];
            var met = consolidarDia(reg.sessoes);
            var ultimaDataISO = null;
            for (var k = 0; k < reg.sessoes.length; k++) {
                var dISO = reg.sessoes[k].dataISO;
                if (dISO && (!ultimaDataISO || dISO > ultimaDataISO)) {
                    ultimaDataISO = dISO;
                }
            }

            resultado.push({
                id: reg.id,
                nome: reg.nome,
                chave: reg.chave,
                cadastrado: reg.cadastrado,
                sessoesCount: met.sessoesCount,
                ultimaDataISO: ultimaDataISO,
                fase1: met.porFase.fase1,
                fase2: met.porFase.fase2,
                fase3: met.porFase.fase3
            });
        }

        resultado.sort(function (x, y) {
            return x.nome.localeCompare(y.nome, 'pt-BR', { sensitivity: 'base' });
        });

        return resultado;
    }

    SaudeEscola.Analytics = {
        iniciarSessao: iniciarSessao,
        registrarConclusaoFase1: registrarConclusaoFase1,
        registrarTentativaFase1: registrarTentativaFase1,
        registrarTentativaFase2: registrarTentativaFase2,
        registrarTentativaFase3: registrarTentativaFase3,
        finalizarESalvarSessao: finalizarESalvarSessao,
        descartarSessao: descartarSessao,
        temSessaoPendente: temSessaoPendente,
        listarDatasDisponiveis: listarDatasDisponiveis,
        gerarResumoEvolucao: gerarResumoEvolucao,
        gerarResumoPorPeriodo: gerarResumoPorPeriodo,
        gerarResumoPorAluno: gerarResumoPorAluno,
        analisarEscritaFase3: analisarEscritaFase3
    };
})(window);
