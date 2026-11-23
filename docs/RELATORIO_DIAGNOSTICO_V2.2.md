# Relatório Diagnóstico Pré-Release — v2.2 (`feat/v2.2`)

Este relatório consolida os achados da **Auditoria Dupla Pré-Release** realizada sobre os **23 arquivos-alvo** da versão **v2.2** (`index.html`, 14 módulos em `js/*.js`, 6 módulos em `js/stickers/*.js`, `css/game.css` e `css/teacher-panel.css`), abrangendo **116 SVGs**, **160 textos pedagógicos** e mais de **200 palavras** testadas no separador silábico.

| Indicador Consolidado | Resultado da Auditoria |
| :--- | :---: |
| Vulnerabilidades Críticas (XSS / Quebra de CSP / Prototype Pollution) | **0** |
| Handlers `on*=`, `style=` inline, `<script>` inline, `innerHTML` executável, `eval()` | **0** |
| Emojis nativos de sistema no código/interface | **0** |
| SVGs com `<defs>` ou `id=` duplicado | **0** |
| Palavras comuns sem acentuação em textos visíveis ao usuário | **0** |
| Achados de Segurança de prioridade Média | **2** |
| Achados de Português / Pedagógico / IHC com correção indicada para v2.2 | **Detalhados na Categoria 3** |

---

## Status pós-auditoria do Bloco 5B

Os achados abaixo são mantidos neste relatório como histórico da auditoria pré-release. Os itens que já foram aplicados no código receberam a marca `[CORRIGIDO NO BLOCO 5B]`; eles não devem ser tratados como pendências abertas da v2.2.0.

- `[CORRIGIDO NO BLOCO 5B]` Limites superiores em `validarDadosPalavra()` e sanitização de tamanho em `storage-service.js:1430+`.
- `[CORRIGIDO NO BLOCO 5B]` Uso de `Object.create(null)` e chaves próprias em mapas analíticos e de período.
- `[CORRIGIDO NO BLOCO 5B]` Remoção do bloqueio de zoom assistivo em `index.html:5`.
- `[CORRIGIDO NO BLOCO 5B]` Modais principais com `role="dialog"`, `aria-modal="true"` e `aria-labelledby` em `index.html:317` e `363`.
- Os itens do histórico que não possuem a marca permanecem como validação futura, polimento ou evolução planejada.

---

## 1. Não precisa melhorar

Pontos arquiteturais, pedagógicos e de segurança já consolidados e validados nesta versão:

- **Conformidade estrita de CSP e execução 100% offline (`file://`):** `index.html:6` aplica `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';` com funcionamento pleno de `Blob` export, `FileReader` import, Web Audio API e `window.print()`. Zero links para fontes, estilos ou scripts externos (`0` `@import` ou `url(http...)` nos CSS).
- **Blindagem DOM e sanitização SVG (`js/dom-safe.js`):** 473 chamadas a `DomSafe`, criação segura via `createElement`/`textContent`, `parseSvg()` via `DOMParser` com allowlist restrita de tags e remoção de atributos `on*`, `style`, `srcdoc` e URLs perigosas (`javascript:`, `vbscript:`, `data:`).
- **Esquema robusto de Backup JSON e Períodos Letivos:** `parseJsonSeguro()` (`js/storage-service.js:405-427`) descarta `__proto__`, `constructor` e `prototype` no reviver, limita payload a 2 MB UTF-8 reais, valida datas reais de calendário (`ehDataISOValida`, rejeitando datas impossíveis) e impede sobreposição entre ciclos letivos (`js/period-service.js:379-390`).
- **Integridade vetorial e Zero Emojis:** todos os 116 SVGs auditados (incluindo os 10 ícones infantis de `js/ui-icons.js`, as 40 figurinhas de `js/stickers/*.js` e os 10 SVGs padrão de `WordBank`) são XML válidos sem `<defs>` e sem `id=` interno, com suporte a `transform-box: fill-box` e `@media (prefers-reduced-motion: reduce)` em `css/game.css:934`.
- **Alinhamento BNCC/MEC e Ergonomia Touch na Lousa Digital:** scaffolding nas Fases 2 e 3 (letras/sílabas certas permanecem fixas), feedback 100% acolhedor sem áudio punitivo, botões táteis na zona inferior (`.lower-zone`), trava de 3s na engrenagem, confirmações em 2 toques (zero `alert`/`confirm`/`prompt`), foco visível (`:focus-visible`) e privacidade LGPD (*Nome + Inicial*).
- **Separador silábico e alinhador ortográfico LCS:** `js/syllable-helper.js` atingiu **~98%+ de acerto** em mais de 200 palavras do vocabulário de 1º/2º ano; `analisarEscritaFase3()` (`js/analytics-engine.js:343-456`) já implementa alinhamento por distância de edição/LCS isolando omissões em dígrafos (`RR`, `SS`, `CH`, `LH`, `NH`, `QU`, `GU`); os contêineres legados `#p2EmojiCorner` e `#p3EmojiCorner` foram removidos por completo.
- **Acentuação ortográfica geral:** zero palavras comuns sem acento detectadas em toda a varredura de strings visíveis; grafias como `ENXÁGUO`, `COLCHÃOZINHO` e os 40 rótulos das figurinhas estão em plena conformidade com o VOLP/ABL.

---

## 2. Pode ser melhorado

Refinamentos desejáveis de baixa/média prioridade (não bloqueiam o funcionamento atual, mas elevam robustez e polimento):

- **Defesa em profundidade de Segurança e Memória:**
  - Checar `file.size > MAX_BACKUP_BYTES` antes de ler o arquivo via `FileReader.readAsText()` em `js/teacher-panel-ui.js:880-926` para evitar pico de RAM em PCs escolares ao selecionar arquivo grande por engano.
  - Aplicar reviver anti-prototype-pollution em `Ranking.getList()` (`js/ranking-service.js:188`) e `WordBank.loadQueueState()` (`js/word-bank.js:1176`), além de teto numérico superior em `sanitizarNumeroNaoNegativo()` (`js/storage-service.js:521-527`, hoje aceita números como `1e30`). O `queueMemoryCache` já usa `Object.create(null)` e os principais mapas analíticos também estão protegidos.
  - Em `js/dom-safe.js`, reforçar `sanitizeSvgAttributes()` (`L187-221`) contra `url(...)` em atributos de apresentação (`fill`, `stroke`, `clip-path`, `mask`, `filter`) e adicionar denylist explícita (`script`, `style`, `iframe`, `object`, `embed`) em `DomSafe.el()` (`L406-411`).
  - *(Nota informativa CSP)* As 5 atribuições CSSOM (`fillEl.style.width` / `.style.height`) em `js/evolution-view.js:956, 1092, 1106, 1117, 1178` são **100% compatíveis com `style-src 'self'` (CSP3)** por manipularem apenas percentuais limitados entre `0` e `100` via CSSOM; a seta Unicode `'→'` em `js/teacher-panel-ui.js:1395` pode opcionalmente virar SVG se desejarem uniformidade absoluta.
- **Suavização de jargão técnico e consistência touch no Painel da Professora:**
  - Trocar `"ciclos"` por `"períodos"` em rótulos voltados à professora (`js/evolution-view.js:461, 489, 568, 574, 762, 798, 1146` e `js/analytics-engine.js:1007`), pois na terminologia do MEC/BNCC "Ciclo" remete ao *Ciclo de Alfabetização*.
  - Suavizar termos de TI como `Exportar JSON`/`Importar JSON` (`js/teacher-panel-ui.js:669, 672-673, 863, 865, 898`; `js/evolution-view.js:1620`; `js/storage-service.js:2054, 2147`), `'Ocultar importação em lote'` (`js/teacher-panel-ui.js:659`), `'BANCO CUSTOMIZADO ATIVO'` (`js/game-engine.js:308`), `'Módulo de armazenamento não encontrado'` (`js/teacher-panel-ui.js:515, 1441`) e `'2 caracteres válidos'` (`js/storage-service.js:1222`).
  - Substituir `'sugestões clicáveis'` (`js/teacher-panel-ui.js:527`) e `'em 1 clique'` (`js/teacher-panel-ui.js:1247`) por linguagem coerente com toque na lousa.
- **Polimento linguístico, tipográfico e de separação silábica:**
  - Eliminar pequenas redundâncias e ajustes tipográficos: `js/teacher-panel-ui.js:1055-1056, 1160+1171` (`pronta`/`prontas`), `L1536` (`Ativo`/`Desativado`), `L1188` (`No modo edição`), `L1417, 1422-1423`, `L669`, `L306` (`Fechar Painel da Professora`), `L2757` e `index.html:67`/`L404` (`-` -> `—`); `js/evolution-view.js:1142` (`neste período selecionado`) e tooltips `L1075, 1080, 1086, 1104`; `js/game-engine.js:1027` (`OPS,`); `js/period-service.js:307, 314, 327, 343` (`#` -> `nº`); `js/analytics-engine.js:1258` (`80%+`).
  - Tratar palavras compostas com hífen (`ARCO-ÍRIS`, `BEIJA-FLOR`, `GUARDA-CHUVA`) e a exceção rara `PROIBIR` (`PRO-I-BIR`) em `js/syllable-helper.js:356, 391`.
  - Validar com a Profª Carla a divisão silábica de `CÁRIE` (`CÁ-RI-E` em `js/word-bank.js:418` vs. `CÁ-RIE` no `SyllableHelper`).
- **Acessibilidade complementar e sinalização no Menu Inicial:**
  - Esclarecer no Menu Inicial (`index.html:79-95, 156`) que o seletor `3 / 5 / 10` vale para as Fases 2 e 3, e refletir o modo ativo da Fase 1 no subtítulo do card.
  - Adicionar `@media (prefers-reduced-motion: reduce)` em `css/teacher-panel.css` (complementando `css/game.css:934`). Esta melhoria ainda não foi aplicada.

---

## 3. Tem que melhorar

Correções recomendadas com alta/média prioridade (bugs silenciosos, desvios claros de Norma Culta, colas ortográficas e lacunas de IHC/acessibilidade), além da evolução estrutural planejada após a v2.2:

1. **Segurança — Colisão com propriedades herdadas de `Object.prototype` em dicionários analíticos (`[MÉDIA]`) — `[CORRIGIDO NO BLOCO 5B]`:**
   - `js/analytics-engine.js:805-807, 876, 890, 914` (e `L782, 1458-1459, 1490, 1717-1718`; `js/evolution-view.js:331-332`): mapas literais `{}` permitem que chaves como `"toString"` ou `"valueOf"` em sessões importadas disparem `TypeError` em `errosSilabas[silaba].palavras.indexOf(...)`. **Correção:** usar `Object.create(null)` e `Object.prototype.hasOwnProperty.call(...)`.
2. **Segurança — Limite máximo em `validarDadosPalavra()` (`[MÉDIA]`) — `[CORRIGIDO NO BLOCO 5B]`:**
   - `js/storage-service.js:1434-1494`: falta limite superior de tamanho da palavra e número de sílabas (em teste em memória, um JSON com 5.001 sílabas foi aceito). **Correção:** limitar `palavra.length` (ex.: máx. 30 letras) e `silabas.length` (ex.: máx. 12 sílabas).
3. **Pedagógico — 4 colas ortográficas no banco nativo e 1 imprecisão de saúde bucal:**
   - `js/word-bank.js:217` (`ESCOVA` Fase 3): `'...PARA ESCOVAR NA ESCOLA!'` entrega literalmente `ESCOVA`; alterar para `'...PARA LIMPAR OS DENTES NA ESCOLA!'`.
   - `js/word-bank.js:201` (`ESCOVA` Fase 2): `'...PARA ESCOVAR.'` entrega `ESCOVA`; alterar para `'...PARA LIMPAR OS DENTES.'`.
   - `js/word-bank.js:103` (`DENTE` Fase 3): `'O DENTISTA CUIDA DE CADA ___...'` exibe `DENT-`; alterar para `'CUIDAMOS DE CADA ___ COM MUITO CAPRICHO TODOS OS DIAS.'`.
   - `js/word-bank.js:92` (`DENTE` Fase 2): `'O DENTISTA OLHA UM POR UM PARA VER SE ESTÃO FORTES.'` entrega `DENT-`; alterar para `'CADA UM PRECISA FICAR BEM LIMPINHO E FORTE NA BOCA!'`.
   - `js/word-bank.js:51` (`BOCA` Fase 3): `'DEPOIS DO LANCHE, LAVO E ESCOVO A MINHA ___!'` é impreciso para educação bucal (EF01CI03); alterar para `'DEPOIS DO LANCHE, ENXÁGUO E DEIXO A MINHA ___ LIMPINHA!'`.
4. **Português (Norma Culta / Ortografia / Concordância / Regência):**
   - `js/game-engine.js:1065`: `'SUPER MEMÓRIA!'` -> `'SUPERMEMÓRIA!'` ou `'SHOW DE MEMÓRIA!'` (hífen indevido antes de *m* pela Base XVI do Acordo Ortográfico).
   - `js/analytics-engine.js:1078`: `'...métricas diferentes ' + doAnteriorLabel` -> `'...métricas diferentes das ' + doAnteriorLabel` (erro de paralelismo).
   - `js/analytics-engine.js:1113-1115`: `'...abaixo ' + doAnteriorLabel` -> `'...abaixo em relação ' + refAnteriorLabel` (ou `'...abaixo da registrada ' + noAnteriorLabel`).
   - `js/evolution-view.js:758` e `js/report-print.js:294`: `'...em 1º Bimestre.'` -> `'...no 1º Bimestre.'` (falta de artigo definido antes de ordinal masculino).
   - `js/teacher-panel-ui.js:1996`: `'Usará o caderninho padrão ou escolha uma figurinha na galeria.'` -> ajustar paralelismo de pessoa verbal (`'Usará o caderninho padrão, ou você pode escolher uma figurinha na galeria.'`).
   - `js/teacher-panel-ui.js:563`: vírgula ligando duas orações imperativas (`'...por privacidade, separe...'` -> usar ponto e vírgula `;`).
   - `js/word-bank.js:88` (`'CHAMADO DE LEITE'` -> `'DE LEITE E DEPOIS TROCA'`), `L202` (`'DE VAI E VEM'` -> `'DE VAIVÉM'`), `L423` (`'SE NÃO ESCOVAR'` -> `'SE NÃO ESCOVARMOS'`), `L486` (`'É ROSINHA, SE MEXE...'` -> `'É ROSINHA, ELA SE MEXE...'`).
5. **Diagnóstico Pedagógico (`js/analytics-engine.js`):**
   - `L1226`: `'Boa segurança na escrita: ...'` é disparado mesmo quando o aluno jogou **apenas Fase 2 (Sílabas)**; restringir o termo `"escrita"` a `porFase.fase3.temDados` ou usar `"nas atividades"`.
   - `L1268`: `'Nenhuma troca ortográfica frequente registrada na escrita.'` dispara mesmo sem Fase 3 jogada; condicionar a `porFase.fase3.temDados`.
   - `L475`: trocar `(_ no lugar de C)` por `(faltou C)` para clareza imediata da professora.
6. **Consistência de IHC, Palavras da Semana, PDF e Acessibilidade:**
   - `js/game-engine.js:1267, 1550, 1579`: ajustar mensagens quando a palavra semanal não tiver figurinha associada (`'OBSERVE A FIGURA'` diante do caderninho genérico) ou estiver em Modo Dica/Ditado sem frase (`'VOCÊ COMPLETOU A FRASE...'`).
   - `js/teacher-panel-ui.js:1499, 1717, 1744, 1780, 1784, 2009`: atualizar textos da aba Palavras da Semana para mencionar explicitamente a prioridade das **Figurinhas**, o **Modo Ditado** e renomear `'Usar combinada'` para um rótulo autoexplicativo (`'Usar automática'`).
   - **`[CORRIGIDO NO BLOCO 5B]`** `js/evolution-view.js:1923` vs. `js/report-print.js:182, 211`: o filtro individual já é propagado ao PDF, exibindo resumo individual e filtrando a tabela e as anotações.
   - **`[CORRIGIDO NO BLOCO 5B]`** `index.html:71, 303, 317, 363`: modais e estados ARIA já foram inseridos nos pontos principais; a associação semântica completa dos rótulos de data permanece como refinamento futuro.
   - **`[CORRIGIDO NO BLOCO 5B]`** `index.html:5`: bloqueio de zoom assistivo removido no estado atual.
   - `js/game-engine.js:1571`: não depender apenas da cor verde no feedback da Fase 3 (complementar para daltônicos: `'AS LETRAS TRAVADAS ESTÃO CERTAS!'`).
7. **Reforma Visual Profunda (Registrada para a Próxima Versão pós-v2.2):**
   - Evoluir de forma estrutural o layout base, **saindo do fundo branco/simples herdado da v1** para um ambiente visual mais rico e imersivo por cenários/temas infantis, mantendo alto contraste para projetores/lousas e desempenho 100% offline.

---

## 4. Ainda falta

Funcionalidades e evoluções planejadas para próximos ciclos (não implementadas na v2.2):

1. **Itens pendentes de validação pedagógica com a Profª Carla Machado:**
   - **Calendário Escolar:** definição do fluxo diário/mensal (se exclusivo da professora ou com visualização infantil) e datas comemorativas pré-configuradas.
   - **Expansão de bancos nativos temáticos:** pacotes completos além de Saúde Bucal (Meio Ambiente, Alimentação Saudável, datas comemorativas/culturais) com SVGs, dicas e frases.
   - **Inclusão da tecla `Ç` no teclado virtual da Fase 3:** definição pedagógica entre 1º e 2º ano (exigência explícita vs. aceitação automática de `C` para `Ç`).
   - **Chaveamento "Modo 1º Ano" vs. "Modo 2º Ano":** progressão de desafios para dígrafos, regra de `M` antes de `P`/`B`, dupla lacuna e acentuação estrita.
2. **Banco de frases e dicas prontas associadas às 40 figurinhas de `js/stickers/`:**
   - Preenchimento assistido de dica (Fase 2) e frase com lacuna (Fase 3) já revisadas pedagogicamente sempre que a professora selecionar ou casar uma das 40 figurinhas no cadastro de *Palavras da Semana*.
3. **Visão `v3.0` (Longo Prazo):**
   - **Arquitetura Multi-Turma (`Escola -> Professora -> Turma -> Temas/Relatórios`):** isolamento completo de dados para múltiplos turnos e professoras compartilhando a mesma lousa digital.
