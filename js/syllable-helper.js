/* ==========================================================================
   Separador Automatico de Silabas em Portugues (1o e 2o anos)
   Modulo 100% offline (file:// e GitHub Pages), sem ES Modules e sem emojis.
   Exporta: window.SaudeEscola.SyllableHelper
   ========================================================================== */

(function (global) {
    'use strict';

    var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

    /* ----------------------------------------------------------------------
       1. Conjuntos fonologicos para separacao silabica em Portugues (BR)
       ---------------------------------------------------------------------- */
    var ATAQUES_INSEPARAVEIS = Object.create(null);
    [
        'CH', 'LH', 'NH',
        'BL', 'BR', 'CL', 'CR', 'DR', 'FL', 'FR',
        'GL', 'GR', 'PL', 'PR', 'TL', 'TR', 'VR'
    ].forEach(function (par) {
        ATAQUES_INSEPARAVEIS[par] = true;
    });

    /* Consoantes que, ao fechar a silaba, costumam manter hiato antes de I/U */
    var CODA_HIATO_SEGUINTE = Object.create(null);
    ['L', 'R', 'Z', 'M', 'N'].forEach(function (letra) {
        CODA_HIATO_SEGUINTE[letra] = true;
    });

    /**
     * Remove acentos/cedilha e mantem apenas letras A-Z maiusculas.
     */
    function normalizarPlain(texto) {
        return String(texto == null ? '' : texto)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[^A-Z]/g, '');
    }

    /**
     * Retorna a letra base sem diacriticos de um caractere unico.
     */
    function baseLetra(ch) {
        var norm = String(ch || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
        return norm.charAt(0) || '';
    }

    function ehVogal(ch) {
        var base = baseLetra(ch);
        return base === 'A' || base === 'E' || base === 'I' || base === 'O' || base === 'U';
    }

    function ehVogalAcentuada(ch) {
        return /[ÁÉÍÓÚÂÊÔÀ]/.test(String(ch || ''));
    }

    function ehVogalNasalTil(ch) {
        return /[ÃÕ]/.test(String(ch || ''));
    }

    /**
     * Verifica se um bloco de unidades consonantais e apenas ['S'] ou vazio.
     */
    function blocoEhApenasSOuVazio(unidades) {
        if (!Array.isArray(unidades) || unidades.length === 0) return true;
        return unidades.length === 1 && baseLetra(unidades[0]) === 'S';
    }

    /**
     * Tokeniza a palavra limpa em sequencia alternada de blocos consonantais ('C')
     * e blocos vocalicos ('V'), tratando QU/GU antes de vogal como ataque atomico.
     */
    function tokenizarBlocosCV(palavraLimpa) {
        var blocos = [];
        var i = 0;
        var n = palavraLimpa.length;

        function pushUnidadeConsoante(unidade) {
            var ultimo = blocos[blocos.length - 1];
            if (ultimo && ultimo.tipo === 'C') {
                ultimo.unidades.push(unidade);
            } else {
                blocos.push({ tipo: 'C', unidades: [unidade] });
            }
        }

        function pushVogal(ch) {
            var ultimo = blocos[blocos.length - 1];
            if (ultimo && ultimo.tipo === 'V') {
                ultimo.chars += ch;
            } else {
                blocos.push({ tipo: 'V', chars: ch });
            }
        }

        while (i < n) {
            var ch = palavraLimpa.charAt(i);
            var next = i + 1 < n ? palavraLimpa.charAt(i + 1) : '';
            var afterNext = i + 2 < n ? palavraLimpa.charAt(i + 2) : '';

            if ((ch === 'Q' || ch === 'G') && next === 'U' && afterNext && ehVogal(afterNext)) {
                pushUnidadeConsoante(ch + next);
                i += 2;
                continue;
            }

            if (ehVogal(ch)) {
                pushVogal(ch);
            } else {
                pushUnidadeConsoante(ch);
            }
            i += 1;
        }

        return blocos;
    }

    /**
     * Divide um bloco vocalico em nucleos silabicos distinguindo ditongos e hiatos.
     */
    function dividirNucleosVocalicos(vStr, proxC, ehUltimoBlocoVocalico, ehFimComOuSemS, temAcentoAntes) {
        var nucleos = [];
        var proxUnidades = (proxC && Array.isArray(proxC.unidades)) ? proxC.unidades : [];
        var temProximoC = proxUnidades.length > 0;

        var ehSeguinteNH = proxUnidades.length >= 2 &&
            proxUnidades[0] === 'N' &&
            proxUnidades[1] === 'H';

        var primeiraProxC = temProximoC ? baseLetra(proxUnidades[0]) : '';
        var parProxC = proxUnidades.length >= 2 &&
            proxUnidades[0].length === 1 &&
            proxUnidades[1].length === 1
            ? (proxUnidades[0] + proxUnidades[1])
            : '';

        /* Coda com L, R, Z, M ou N fechando a silaba seguinte favorece hiato (RA-IZ, SA-IR, A-IN-DA) */
        var proxFechaSilabaComLRZMN = Boolean(
            temProximoC &&
            CODA_HIATO_SEGUINTE[primeiraProxC] &&
            (
                ehUltimoBlocoVocalico ||
                (proxUnidades.length >= 2 && !ATAQUES_INSEPARAVEIS[parProxC])
            )
        );

        for (var k = 0; k < vStr.length; k++) {
            var ch = vStr.charAt(k);
            if (nucleos.length === 0) {
                nucleos.push(ch);
                continue;
            }

            var atual = nucleos[nucleos.length - 1];
            var ant = atual.charAt(atual.length - 1);
            var baseAnt = baseLetra(ant);
            var baseCh = baseLetra(ch);
            var ehUltimaDoBloco = (k === vStr.length - 1);
            var unir = false;

            if (atual.length >= 2) {
                unir = false;
            } else if (ehVogalNasalTil(ant) && (ch === 'E' || ch === 'O')) {
                unir = true;
            } else if (ehVogalAcentuada(ch) || ehVogalNasalTil(ch)) {
                unir = false;
            } else if (ant === 'Í' || ant === 'Ú') {
                unir = false;
            } else if ((baseAnt === 'A' || baseAnt === 'E' || baseAnt === 'O') && (ch === 'I' || ch === 'U')) {
                if (!ehUltimaDoBloco && ch === 'I' && vStr.charAt(k + 1) === 'U') {
                    unir = false;
                } else if (ehUltimaDoBloco && (ehSeguinteNH || proxFechaSilabaComLRZMN)) {
                    unir = false;
                } else {
                    unir = true;
                }
            } else if ((ant === 'I' && ch === 'U') || (ant === 'U' && ch === 'I')) {
                if (ehUltimaDoBloco && (ehSeguinteNH || proxFechaSilabaComLRZMN)) {
                    unir = false;
                } else {
                    unir = true;
                }
            } else if ((ant === 'I' || ant === 'U') && (baseCh === 'A' || baseCh === 'E' || baseCh === 'O')) {
                unir = Boolean(ehFimComOuSemS && temAcentoAntes);
            } else {
                unir = false;
            }

            if (unir) {
                nucleos[nucleos.length - 1] = atual + ch;
            } else {
                nucleos.push(ch);
            }
        }

        return nucleos;
    }

    /**
     * Verifica se duas unidades consonantais formam um ataque inseparavel (CH, BR, etc.).
     */
    function ehParInseparavel(u1, u2) {
        if (!u1 || !u2 || u1.length !== 1 || u2.length !== 1) {
            return false;
        }
        return Boolean(ATAQUES_INSEPARAVEIS[u1 + u2]);
    }

    /**
     * Separa automaticamente uma palavra em silabas seguindo regras do Portugues (BR).
     */
    function separarSilabasAutomatico(palavraBruta) {
        var limpa = String(palavraBruta == null ? '' : palavraBruta)
            .normalize('NFC')
            .replace(/[\s-]+/g, '')
            .trim()
            .toUpperCase();

        if (!limpa) return [];

        var temVogal = false;
        for (var v = 0; v < limpa.length; v++) {
            if (ehVogal(limpa.charAt(v))) {
                temVogal = true;
                break;
            }
        }
        if (!temVogal || limpa.length <= 1) {
            return [limpa];
        }

        var blocos = tokenizarBlocosCV(limpa);

        /* Mapeia indices dos blocos vocalicos para saber onde fica o final da palavra */
        var indicesV = [];
        for (var b = 0; b < blocos.length; b++) {
            if (blocos[b].tipo === 'V') {
                indicesV.push(b);
            }
        }
        if (indicesV.length === 0) {
            return [limpa];
        }

        var ultimoIdxV = indicesV[indicesV.length - 1];
        var temAcentoAntes = false;
        var sequencia = [];

        for (var idx = 0; idx < blocos.length; idx++) {
            var bloco = blocos[idx];
            if (bloco.tipo === 'C') {
                sequencia.push({ tipo: 'C', unidades: bloco.unidades });
                continue;
            }

            var ehUltimoV = (idx === ultimoIdxV);
            var proxBloco = (idx + 1 < blocos.length && blocos[idx + 1].tipo === 'C') ? blocos[idx + 1] : null;
            var ehFimComOuSemS = ehUltimoV && (!proxBloco || blocoEhApenasSOuVazio(proxBloco.unidades));

            var nucleos = dividirNucleosVocalicos(
                bloco.chars,
                proxBloco,
                ehUltimoV,
                ehFimComOuSemS,
                temAcentoAntes
            );

            for (var nIdx = 0; nIdx < nucleos.length; nIdx++) {
                sequencia.push({ tipo: 'N', texto: nucleos[nIdx] });
                if (nIdx < nucleos.length - 1) {
                    sequencia.push({ tipo: 'C', unidades: [] });
                }
            }

            for (var cIdx = 0; cIdx < bloco.chars.length; cIdx++) {
                var chAtual = bloco.chars.charAt(cIdx);
                if (ehVogalAcentuada(chAtual) || ehVogalNasalTil(chAtual)) {
                    temAcentoAntes = true;
                }
            }
        }

        /* Etapa C: distribui as consoantes ao redor de cada nucleo */
        var silabas = [];
        var ataqueInicial = '';
        var posInicio = 0;

        if (sequencia.length > 0 && sequencia[0].tipo === 'C') {
            ataqueInicial = sequencia[0].unidades.join('');
            posInicio = 1;
        }

        for (var s = posInicio; s < sequencia.length; s++) {
            var item = sequencia[s];
            if (item.tipo === 'N') {
                silabas.push((silabas.length === 0 ? ataqueInicial : '') + item.texto);
                continue;
            }

            var unidades = item.unidades;
            var ehCodaFinal = (s === sequencia.length - 1);
            if (ehCodaFinal) {
                if (silabas.length > 0) {
                    silabas[silabas.length - 1] += unidades.join('');
                } else {
                    silabas.push(unidades.join(''));
                }
                continue;
            }

            var proxNucleo = sequencia[s + 1];
            var m = unidades.length;
            var coda = '';
            var ataque = '';

            if (m === 1) {
                ataque = unidades[0];
            } else if (m === 2) {
                if (ehParInseparavel(unidades[0], unidades[1])) {
                    ataque = unidades[0] + unidades[1];
                } else {
                    coda = unidades[0];
                    ataque = unidades[1];
                }
            } else if (m >= 3) {
                if (ehParInseparavel(unidades[m - 2], unidades[m - 1])) {
                    coda = unidades.slice(0, m - 2).join('');
                    ataque = unidades[m - 2] + unidades[m - 1];
                } else {
                    coda = unidades.slice(0, m - 1).join('');
                    ataque = unidades[m - 1];
                }
            }

            if (coda && silabas.length > 0) {
                silabas[silabas.length - 1] += coda;
            }
            silabas.push(ataque + proxNucleo.texto);
            s += 1;
        }

        return silabas;
    }

    /**
     * Separa uma unica palavra respeitando hifen manual explicito se presente.
     */
    function separarSilabas(palavra) {
        var texto = String(palavra == null ? '' : palavra).normalize('NFC').trim();
        if (!texto) return [];

        if (texto.indexOf('-') !== -1) {
            return texto
                .split('-')
                .map(function (part) { return part.replace(/\s+/g, '').trim().toUpperCase(); })
                .filter(function (part) { return part.length > 0; });
        }

        return separarSilabasAutomatico(texto);
    }

    function formatarComHifens(palavra) {
        return separarSilabas(palavra).join('-');
    }

    /**
     * Extrai e valida uma ou varias palavras separadas por virgula, ponto e virgula,
     * quebra de linha ou espaco (nunca concatenando palavras distintas).
     */
    function extrairPalavras(entradaBruta) {
        var normalizada = String(entradaBruta == null ? '' : entradaBruta)
            .normalize('NFC')
            .replace(/\s*-\s*/g, '-')
            .trim();

        if (!normalizada) {
            return { ehLote: false, totalTokens: 0, itens: [] };
        }

        var tokens = normalizada.split(/[,;\r\n\s]+/).filter(function (t) {
            return t.length > 0;
        });

        var itens = [];
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i].toUpperCase();
            var usouHifenManual = token.indexOf('-') !== -1;
            var silabas = usouHifenManual
                ? token.split('-').map(function (p) { return p.trim(); }).filter(function (p) { return p.length > 0; })
                : separarSilabasAutomatico(token);

            var silabaVaziaDeLetras = false;
            for (var k = 0; k < silabas.length; k++) {
                if (normalizarPlain(silabas[k]).length === 0) {
                    silabaVaziaDeLetras = true;
                    break;
                }
            }

            var palavra = silabas.join('');
            var plain = normalizarPlain(palavra);

            var valido = true;
            var erroCodigo = null;
            var erroMsg = '';

            if (silabas.length === 0 || silabaVaziaDeLetras || palavra.length !== plain.length) {
                valido = false;
                erroCodigo = 'invalid_char';
                erroMsg = 'Use apenas letras (ou hífen para ajuste manual).';
            } else if (plain.length < 2) {
                valido = false;
                erroCodigo = 'too_short';
                erroMsg = 'Mínimo de 2 letras.';
            }

            itens.push({
                bruto: token,
                palavra: palavra,
                plain: plain,
                silabas: silabas,
                silabasRaw: silabas.join('-'),
                usouHifenManual: usouHifenManual,
                valido: valido,
                erroCodigo: erroCodigo,
                erroMsg: erroMsg
            });
        }

        return {
            ehLote: itens.length > 1,
            totalTokens: itens.length,
            itens: itens
        };
    }

    SaudeEscola.SyllableHelper = {
        normalizarPlain: normalizarPlain,
        separarSilabasAutomatico: separarSilabasAutomatico,
        separarSilabas: separarSilabas,
        formatarComHifens: formatarComHifens,
        extrairPalavras: extrairPalavras
    };

})(window);
