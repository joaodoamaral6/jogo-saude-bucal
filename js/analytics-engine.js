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

    /**
     * Obtém dinamicamente a referência ao módulo Storage.
     */
    function getStorage() {
        return (global.SaudeEscola && global.SaudeEscola.Storage) ? global.SaudeEscola.Storage : null;
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
     * Cria a estrutura vazia de estatísticas por fase para uma sessão.
     */
    function criarFasesStatsVazio() {
        return {
            fase1: { tentativas: 0, acertos: 0, acertosPrimeira: 0 },
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
            sessaoAtual.fasesStats[chaveFase] = { tentativas: 0, acertos: 0, acertosPrimeira: 0 };
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
     * Registra uma ocorrência de erro ortográfico na sessão atual com até 5 exemplos únicos.
     */
    function registrarErroOrtografico(codigo, label, palavraLimpa, esperado, digitado) {
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

        var exemplo = palavraLimpa + ' (' + (digitado || '_') + ' no lugar de ' + esperado + ')';
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
     * Registra uma tentativa de par na Fase 1 (Jogo da Memória).
     */
    function registrarTentativaFase1(dados) {
        var info = dados && typeof dados === 'object' ? dados : {};
        garantirSessaoAtiva('FASE_1');

        var palavraLimpa = normalizarPalavra(info.palavra);
        var acertou = Boolean(info.acertou);
        var primeiraTentativa = Boolean(info.primeiraTentativa);

        sessaoAtual.tentativas += 1;
        sessaoAtual.atividadesRegistradas += 1;
        atualizarStatsPalavra(palavraLimpa, acertou);
        atualizarStatsFase('fase1', acertou, primeiraTentativa);

        if (acertou) {
            sessaoAtual.acertos += 1;
            if (primeiraTentativa) {
                sessaoAtual.acertosPrimeira += 1;
            }
        }
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

        for (var i = 0; i < plainStr.length; i++) {
            if (travadosAntes[i]) continue;

            var e = normalizarChar(plainStr.charAt(i));
            if (!e) continue;

            var u = normalizarChar(digitado[i] || '');
            if (u === e) continue;

            var classificacao = classificarErroOrtografico(e, u);
            registrarErroOrtografico(classificacao.codigo, classificacao.label, palavraLimpa, e, u);
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
     * Verifica se uma sessão pertence ao filtro de aluno selecionado.
     */
    function sessaoPertenceAoAluno(sessao, alunoId) {
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
        }

        return false;
    }

    /**
     * Retorna datas únicas (YYYY-MM-DD) presentes no histórico, da mais recente para a mais antiga.
     */
    function listarDatasDisponiveis(alunoId) {
        var filtro = alunoId || 'TODOS';
        var sessoes = obterSessoesArmazenadas();
        var mapaDatas = {};

        for (var i = 0; i < sessoes.length; i++) {
            var s = sessoes[i];
            if (!sessaoPertenceAoAluno(s, filtro)) continue;
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
        var palavras = {};
        var errosOrtograficos = {};
        var errosSilabas = {};
        var porFase = {
            fase1: { tentativas: 0, acertos: 0, acertosPrimeira: 0, taxaAcerto: null, taxaPrimeira: null, temDados: false },
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

        var chavesCalc = ['fase1', 'fase2', 'fase3'];
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
     * Gera comparativo detalhado entre o dia de referência e o dia anterior disponível.
     */
    function gerarComparativo(metricasDia, metricasAnterior, dataAnterior) {
        if (!dataAnterior || !metricasAnterior) {
            return {
                temDiaAnterior: false,
                variacaoTaxaAcerto: null,
                tendencia: 'first',
                mensagensMelhoria: [
                    'Primeiro dia registrado para esta seleção. Continue praticando para comparar a evolução.'
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
                'Leve ganho na taxa de acerto (+' + variacao + '% em comparação ao dia anterior).'
            );
        } else if (variacao === 0) {
            mensagens.push(
                'Manteve a taxa de acerto em ' + metricasDia.taxaAcerto + '% em relação ao dia anterior.'
            );
        } else if (variacao > -3) {
            mensagens.push(
                'Desempenho estável em relação ao dia anterior (' + metricasDia.taxaAcerto + '%).'
            );
        } else {
            mensagens.push(
                'A taxa de acerto ficou ' + Math.abs(variacao) +
                '% abaixo do dia anterior (bom momento para retomar as palavras).'
            );
        }

        var difPrimeira = metricasDia.taxaPrimeira - metricasAnterior.taxaPrimeira;
        if (difPrimeira >= 5) {
            mensagens.push(
                'Mais respostas corretas logo na 1a tentativa (' +
                metricasDia.taxaPrimeira + '% contra ' + metricasAnterior.taxaPrimeira + '% antes).'
            );
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
                mensagens.push('Nenhuma ocorrência de "' + red.label + '" (foram ' + red.antes + ' no dia anterior).');
            } else {
                mensagens.push('Redução em "' + red.label + '" de ' + red.antes + ' para ' + red.depois + ' ocorrência(s).');
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
            variacaoTaxaAcerto: variacao,
            tendencia: tendencia,
            mensagensMelhoria: mensagens
        };
    }

    /**
     * Identifica os pontos fortes observados no dia selecionado.
     */
    function gerarPontosFortes(metricasDia) {
        var fortes = [];

        if (metricasDia.taxaAcerto >= 80) {
            fortes.push('Ótimo aproveitamento geral: ' + metricasDia.taxaAcerto + '% de acertos no dia.');
        }

        if (metricasDia.taxaPrimeira >= 70) {
            fortes.push('Boa segurança na escrita: ' + metricasDia.taxaPrimeira + '% de acertos na 1a tentativa.');
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
            fortes.push('Palavras com ótimo domínio (80%+): ' + nomesBoas.join(', ') + '.');
        }

        var qtdOrt = Object.keys(metricasDia.errosOrtograficos).length;
        var qtdSil = Object.keys(metricasDia.errosSilabas).length;

        if (qtdOrt === 0 && qtdSil === 0) {
            fortes.push('Ausência de trocas ortográficas e travas silábicas nesta data.');
        } else if (qtdOrt === 0) {
            fortes.push('Nenhuma troca ortográfica frequente registrada na escrita.');
        }

        if (fortes.length === 0) {
            fortes.push(
                'Participação registrada com ' + metricasDia.tentativas +
                ' tentativa(s) e ' + metricasDia.acertos + ' acerto(s) nesta data.'
            );
        }

        return fortes.slice(0, 4);
    }

    /**
     * Identifica os pontos de atenção para trabalhar em sala a partir dos dados do dia.
     */
    function gerarPontosAtencao(metricasDia) {
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

        // Palavras com mais erros no dia
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
            atencao.push('Nenhum ponto de atenção crítico identificado nesta data.');
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
     * Gera o resumo completo de evolução pedagógica para um aluno (ou turma) e data de referência.
     */
    function gerarResumoEvolucao(filtros) {
        var cfg = filtros && typeof filtros === 'object' ? filtros : {};
        var alunoId = cfg.alunoId || 'TODOS';
        var dataSolicitada = cfg.dataReferencia || null;

        var todasSessoes = obterSessoesArmazenadas();
        var sessoesPorData = {};
        var mapaDatas = {};

        for (var i = 0; i < todasSessoes.length; i++) {
            var s = todasSessoes[i];
            if (!sessaoPertenceAoAluno(s, alunoId)) continue;
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

        var consolidadoPorData = {};
        function obterMetricasData(dataISO) {
            if (!dataISO) return null;
            if (!consolidadoPorData[dataISO]) {
                consolidadoPorData[dataISO] = consolidarDia(sessoesPorData[dataISO]);
            }
            return consolidadoPorData[dataISO];
        }

        var metricasDia = obterMetricasData(dataRef);
        var metricasAnterior = obterMetricasData(dataAnterior);

        var comparativo = gerarComparativo(metricasDia, metricasAnterior, dataAnterior);
        var pontosFortes = gerarPontosFortes(metricasDia);
        var pontosAtencao = gerarPontosAtencao(metricasDia);
        var rankingDificuldades = gerarRankingDificuldades(metricasDia);

        // Até 7 datas mais recentes (terminando em dataRef), em ordem cronológica crescente
        var datasJanelaDesc = datasDisponiveis.slice(idxRef, idxRef + 7);
        var datasJanelaAsc = datasJanelaDesc.slice().reverse();
        var serieDiaria = [];

        function copiarFaseResumo(porFaseDia, chave) {
            var f = (porFaseDia && porFaseDia[chave]) ? porFaseDia[chave] : null;
            if (!f || !f.temDados) {
                return { tentativas: 0, acertos: 0, taxaAcerto: null, temDados: false };
            }
            return {
                tentativas: f.tentativas,
                acertos: f.acertos,
                taxaAcerto: f.taxaAcerto,
                temDados: true
            };
        }

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

    SaudeEscola.Analytics = {
        iniciarSessao: iniciarSessao,
        registrarTentativaFase1: registrarTentativaFase1,
        registrarTentativaFase2: registrarTentativaFase2,
        registrarTentativaFase3: registrarTentativaFase3,
        finalizarESalvarSessao: finalizarESalvarSessao,
        descartarSessao: descartarSessao,
        temSessaoPendente: temSessaoPendente,
        listarDatasDisponiveis: listarDatasDisponiveis,
        gerarResumoEvolucao: gerarResumoEvolucao
    };
})(window);
