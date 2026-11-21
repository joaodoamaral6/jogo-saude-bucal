# Changelog e Registro de Decisões de Arquitetura (ADR) — Saúde na Escola: Saúde Bucal

Todas as alterações notáveis, evoluções pedagógicas e decisões técnicas de engenharia do projeto **"Saúde na Escola: Saúde Bucal"** são documentadas neste arquivo.

---

## [v2.2.0 / CSS game v2.9 | teacher-panel v2.11] — CSP Estrito Offline, Períodos Letivos, Silabador Automático + 40 Figurinhas, Novos Ícones/Expressões do Dentinho e Redesign de Tokens IHC

### 1. Resumo Executivo
A versão **v2.2.0** consolida os três pilares permanentes de engenharia e pedagogia do projeto para **Desktop e Lousas Digitais Touch (`> 1024px`)**:
1. **Segurança e Blindagem Offline (`file://`):** adoção de `Content-Security-Policy` estrito em `<meta>`, criação do módulo `js/dom-safe.js` (473 chamadas, zero `innerHTML`/`on*=`/`style=` inline), proteção contra colisão de protótipo (`Object.create(null)`), validação prévia de `file.size` no importador de backup e refinamento do comparador ortográfico por **distância de edição / LCS** (`analisarEscritaFase3`) com remoção dos contêineres legados `#p2EmojiCorner` e `#p3EmojiCorner`.
2. **Evolução Pedagógica e UX Docente:** agrupamento e comparativo gráfico longitudinal por **Período Letivo (Bimestre / Trimestre)** sem apagar histórico (`js/period-service.js`), simplificação completa da aba **Palavras da Semana** com **separador automático de sílabas em Português (`js/syllable-helper.js`)**, cadastro ágil em lote e biblioteca de **40 figurinhas vetoriais infantis em 5 categorias (`js/stickers/`)**.
3. **Unidade Vetorial, Mascote Dentinho e IHC Infantil:** catálogo `js/ui-icons.js` com **10 ícones vetoriais redesenhados** em 5 conjuntos, evolução expressiva do **Dentinho** (5 estados de humor, piscadas orgânicas e 3 ritmos de fala), sistema de **24 tokens CSS `--ui-*`** calibrados para projetores/lousas e auditoria dupla pré-release com documentação completa e massa de teste (`docs/turma-ficticia-v2.2.json`).

### 2. Registro de Decisões de Arquitetura (Mini-ADRs da v2.2.0)

#### ADR-12: Content-Security-Policy (CSP) Estrito Compatível com `file://`, Módulo `DomSafe` e Alinhamento Ortográfico LCS
- **Contexto:** Era prioritário eliminar qualquer superfície de XSS na importação de backups ou manipulação de SVGs, remover handlers `onclick=` e estilos inline de `index.html`, remover os elementos ociosos `#p2EmojiCorner`/`#p3EmojiCorner` e resolver o deslocamento de índice quando o aluno omitia uma letra de dígrafo na Fase 3 (ex.: `SORISO` em vez de `SORRISO`).
- **Decisão:**
  - Criar `js/dom-safe.js` (`window.SaudeEscola.DomSafe`) centralizando criação segura de elementos (`el`, `text`, `clear`, `setChildren`) e sanitização estrita de SVGs via `DOMParser` (`image/svg+xml`) com allowlist de tags/atributos e bloqueio de `on*`, `style`, `srcdoc` e URLs externas.
  - Declarar `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';">` em `index.html` e migrar todos os 16 botões estáticos para delegação via `data-action`.
  - Implementar `analisarEscritaFase3()` em `js/analytics-engine.js` particionando segmentos abertos entre letras já travadas e aplicando programação dinâmica (distância de edição / LCS) para isolar `OMISSAO_DIGRAFO_*` (`RR`, `SS`, `CH`, `LH`, `NH`, `QU`, `GU`), `DUPLICACAO_LETRA`, `LETRAS_FALTANDO`, `LETRAS_EXTRAS` e os 9 pares fonéticos/ortográficos.
- **Consequência:** Zero sinks HTML inseguros em todo o código, CSP estrito funcional tanto online quanto via `file://`, e diagnóstico ortográfico cirúrgico para o 1º e 2º anos.

#### ADR-13: Agrupamento e Comparativo Longitudinal por Período Letivo (`js/period-service.js`)
- **Contexto:** A professora precisava acompanhar e comparar o avanço da turma e de cada aluno entre bimestres ou trimestres para conselhos de classe sem apagar o histórico acumulado no `localStorage`.
- **Decisão:** Criar `js/period-service.js` (`window.SaudeEscola.Periods`) com suporte a **Bimestres (4 períodos)** e **Trimestres (3 períodos)**, validação estrita de datas ISO reais, ordenação cronológica sem sobreposição e persistência em `config.periodosLetivos`, integrando `Analytics.gerarResumoPorPeriodo()`, o painel configurável em `js/evolution-view.js` e a tabela comparativa no Relatório PDF (`js/report-print.js`).
- **Consequência:** Comparação gráfica imediata entre períodos letivos com preservação integral da série histórica e suporte a filtro por aluno individual ou turma no PDF.

#### ADR-14: Simplificação da UX de "Palavras da Semana", Separador Silábico (`js/syllable-helper.js`) e Biblioteca de 40 Figurinhas (`js/stickers/`)
- **Contexto:** O cadastro manual de sílabas com hífen gerava atrito para docentes no preparo rápido das aulas, e palavras personalizadas não contavam com ilustrações temáticas variadas nas Fases 1, 2 e 3.
- **Decisão:**
  - Reformular a Aba 2 em `js/teacher-panel-ui.js` com cartão de progresso visual rumo ao mínimo de 4 palavras (até 12), chave de ativação imediata e pré-visualização em blocos táteis.
  - Criar `js/syllable-helper.js` (`window.SaudeEscola.SyllableHelper`) para separação automática de sílabas em Português do Brasil (~98%+ de precisão no vocabulário de 1º/2º ano) e detecção de entrada em lote (vírgula, ponto e vírgula ou quebra de linha).
  - Criar a biblioteca modular `js/stickers/` (`animais.js`, `frutas.js`, `natureza.js`, `escola.js`, `brinquedos.js` e `index.js`) com **40 figurinhas vetoriais infantis** (`viewBox="0 0 120 120"`, zero `<defs>`, zero `id=` interno), matching automático em tempo real (incluindo plural/singular) e galeria manual com fallback para o caderninho vetorial (`ILUSTRACAO_SEMANA`).
- **Consequência:** Cadastro de uma semana inteira de palavras ilustradas em poucos segundos, mantendo 100% de execução offline.

#### ADR-15: Catálogo `js/ui-icons.js` e Evolução Expressiva do Mascote Dentinho
- **Contexto:** Os ícones de interface restantes precisavam acompanhar o traço infantil moderno das ilustrações principais, e o mascote Dentinho podia oferecer feedback emocional mais rico durante a jornada.
- **Decisão:**
  - Criar `js/ui-icons.js` (`window.SaudeEscola.UiIcons`) com 10 SVGs redesenhados em 5 conjuntos (`SOUND_ON`/`SOUND_OFF`, `MEDAL_1`/`2`/`3`, `TROPHY_HEADER`/`MODAL`/`RANKING`, `HOME` e `NEXT_CYCLE`).
  - Expandir `js/mascot-controller.js` e `MASCOT_HERO` com piscadas naturais (`BLINK_INTERVALS`), 5 estados expressivos (`is-waving`, `is-celebrating`, `is-triumph`, `is-encouraging`, `is-curious`) e 3 cadências de fala (`.is-talking`, `.is-talking-excited`, `.is-talking-calm`).
- **Consequência:** Coesão estética em toda a interface e maior engajamento afetivo das crianças, preservando `@media (prefers-reduced-motion: reduce)`.

#### ADR-16: Sistema de Tokens CSS (`--ui-*`) para Lousas Digitais e Auditoria Dupla Pré-Release (Segurança + BNCC/IHC)
- **Contexto:** Salas de aula iluminadas e projetores exigem contraste controlado (evitando branco estourado) e foco visível para acessibilidade, além de revisão rigorosa de Segurança e Norma Culta/BNCC antes do fechamento da release.
- **Decisão:**
  - Organizar 24 tokens `--ui-*` em `:root` de `css/game.css` (`?v=2.9`) e harmonizar `css/teacher-panel.css` (`?v=2.11`) com bloco exclusivo `@media (min-width: 1025px) and (min-height: 600px)` sem afetar o mobile isolado.
  - Executar auditoria dupla pré-release (`research-seguranca` e `research-ihc-bncc`), documentar o sistema em `docs/FUNCIONALIDADES_V2.2.md` e `docs/RELATORIO_DIAGNOSTICO_V2.2.md`, gerar a massa `docs/turma-ficticia-v2.2.json` e aplicar os ajustes finais de defesa em profundidade (`Object.create(null)`, tetos de palavra/arquivo, eliminação de 4 colas ortográficas em `js/word-bank.js`, ajustes de Norma Culta e atributos ARIA em `index.html`).
- **Consequência:** Release `v2.2.0` auditada, documentada e testável instantaneamente via `file://`.

---

## [v2.1.3 / CSS v2.3] — Métrica de Tempo na Fase 1, Visão Aluno por Aluno, Anotações, Relatório PDF Offline, Mascote Falante e Revisão Linguística

### 1. Resumo Executivo
Esta atualização evolui o software em torno do seu **foco principal em Desktop e Lousas Digitais Interativas** (Windows — padrão das lousas escolares —, macOS e Linux, em telas grandes e widescreen), mantendo a responsividade mobile como visualização secundária de demonstração. A versão **v2.1.3** torna a avaliação da Fase 1 (Memória) mais justa por tempo médio de conclusão, adiciona painel panorâmico **Aluno por Aluno**, cria o CRUD de **Anotações Pedagógicas da Professora** integrado ao Backup JSON e ao **Relatório Pedagógico PDF Offline (`@media print`)**, introduz o **Mascote Dentinho falante** com boca animada e balão brotando sincronizado, corrige o rodapé das fases e executa uma revisão linguística e pedagógica completa de toda a interface.

### 2. Registro de Decisões de Arquitetura (Mini-ADRs)

#### ADR-08: Avaliação da Fase 1 por Tempo Médio, Visão Aluno por Aluno e Anotações no Backup JSON
- **Contexto:** Na Fase 1 (Jogo da Memória), contar cartas viradas que ainda não formavam par penalizava artificialmente a taxa de acerto ortográfica geral, já que o jogo depende de exploração visual da memória. Além disso, a professora precisava comparar rapidamente o progresso entre todos os alunos da turma e registrar observações qualitativas preservadas nos backups locais.
- **Decisão:**
  - Introduzir `Analytics.registrarConclusaoFase1({ tempoSegundos, pares })` para registrar o tempo entre a primeira carta virada e a conclusão da rodada, mantendo leitura retrocompatível de sessões antigas com `modoMetrica: 'tempo' | 'legado_taxa'` e sem contaminar a taxa ortográfica das Fases 2 e 3.
  - Criar `Analytics.gerarResumoPorAluno({ escopo, dataReferencia })` e renderizar a tabela panorâmica **Aluno por Aluno** em `js/evolution-view.js` 100% via DOM seguro (`textContent`), com alternância entre *Acumulado geral* e *Dia analisado*.
  - Implementar CRUD completo de **Anotações da Professora** (`listarAnotacoes`, `adicionarAnotacao`, `atualizarAnotacao`, `removerAnotacao`) em `js/storage-service.js` com sanitização estrita contra XSS (`sanitizarTextoSeguro`), limite de 200 registros, confirmação em 2 toques na exclusão e inclusão automática em `gerarBackupJSON()` / `importarBackupJSON()`.
- **Consequência:** Diagnóstico pedagógico fiel por fase e por aluno, preservando 100% dos backups v2.1.x anteriores.

#### ADR-09: Relatório Pedagógico Imprimível / PDF 100% Offline (`@media print`)
- **Contexto:** A docente precisava gerar documento imprimível ou PDF da turma e das anotações para reuniões pedagógicas e portfólios escolares em computadores sem internet.
- **Decisão:** Criar o módulo isolado `js/report-print.js` (`window.SaudeEscola.ReportPrint`) e regras `@page` + `@media print` em `css/teacher-panel.css` para construir em `#tpPrintReport` um documento A4 limpo, construído 100% via `document.createElement` / `textContent` / `createElementNS` (zero `innerHTML` e zero bibliotecas externas), disparando `window.print()`.
- **Consequência:** Impressão e exportação nativa para PDF em qualquer navegador moderno (Windows/macOS/Linux), mesmo operando via `file://`.

#### ADR-10: Mascote Interativo Falante (`Dentinho`), Voz Única no Menu e Compatibilidade SVG Cross-Browser
- **Contexto:** Era necessário dar mais vida ao guia infantil **Dentinho**, eliminar elementos sem ação ou repetidos no Menu Inicial (`#headerPhaseLabel` e texto duplicado no rodapé), impedir sobreposição do balão com os botões do rodapé em resoluções de desktop/lousa e sincronizar o movimento real da boca com o brotar do balão de fala.
- **Decisão:**
  - Ocultar `#headerPhaseLabel` e `.feedback-wrap` quando `screenMenu` estiver ativa (`footer.bottom-dock.is-menu`), concentrando a voz do Dentinho no balão principal e centralizando **"SOM LIGADO"** no rodapé.
  - Criar `js/mascot-controller.js` (`window.SaudeEscola.Mascot`) coordenando a classe temporária `.is-talking` (`1400ms`–`1800ms` conforme extensão da frase), camada vetorial `.mascot-mouth-talking` / `.mascot-mouth-talk-jaw`, expressões completas para comemoração (`.is-celebrating`) e incentivo acolhedor em erros (`.is-encouraging` com `.mascot-eyes-encourage`, `.mascot-mouth-encourage` e `.mascot-encourage-badge`), além da animação `.is-popping` (`speechBubbleSprout` com `transform-origin: left center`).
  - Reestruturar o flexbox do rodapé (`.feedback-wrap { flex: 1 1 0; max-width: 52vw; }` e remoção de `min-width: 44vw` rígido em `.feedback-banner`), manter zero atributos `id` internos em `MASCOT_HERO` e aplicar `transform-box: fill-box` com `transform-origin` percentual em todas as camadas SVG animadas, preservando `@media (prefers-reduced-motion: reduce)`.
- **Consequência:** Comportamento visual consistente em Chrome, Edge, Firefox e Safari (Windows/Lousas, macOS e Linux), com fala expressiva, sem cortes nem sobreposição no rodapé.

#### ADR-11: Revisão Linguística/Pedagógica (BNCC/MEC) e Governança de Releases em ZIP
- **Contexto:** Pequenas inconsistências coloquiais em pistas e rótulos (`"1a tentativa"`, `"usamos ela"`, concordância singular/plural em `"1 ESTRELAS"`) precisavam ser adequadas à Norma Culta vigente e à alfabetização no 1º/2º Ano, além de formalizar um fluxo leve de histórico local em `.zip`.
- **Decisão:** Revisar todos os textos visíveis de interface, dicas e frases em `index.html`, `js/word-bank.js`, `js/game-engine.js`, `js/analytics-engine.js`, `js/evolution-view.js`, `js/teacher-panel-ui.js` e `js/report-print.js`, atualizar cache busting CSS para `?v=2.3`, configurar `.gitignore` para ignorar `releases/` e `*.zip`, e arquivar snapshots limpos por versão em `releases/saude-na-escola-vX.Y.Z.zip`.
- **Consequência:** Interface linguística rigorosa e acolhedora para alfabetização inicial e histórico organizado de pacotes offline prontos para uso escolar.

### 3. Histórico de Entregas desta Atualização (`feat/v2.1.3-melhorias`)
- **Bloco 1 (Lógica Pedagógica, Painel e PDF):** Métrica de tempo em segundos na Fase 1, tabela **Aluno por Aluno**, CRUD de **Anotações da Professora** no Backup JSON, módulo `js/report-print.js` (`@media print` A4) e ocultação de `#headerPhaseLabel` no Menu Inicial.
- **Bloco 2 (Mascote Interativo, SVGs e Upgrade Visual):** Criação de `js/mascot-controller.js`, upgrade visual de cards/menus/botões, `#mobileMascotToast` isolado e polimento de SVGs sem alterar as 10 ilustrações padrão.
- **Ajustes Pós-Teste e Fala Real do Mascote:** Correção de espaçamento flexbox no rodapé das fases, voz única no Menu Inicial, reação visual e rotativa completa nos erros das Fases 1/2/3, refinamento dos SVGs de troféu/estrela/medalhas/som/casinha, revisão linguística integral e animação real de boca falando (`.is-talking`) com balão brotando (`speechBubbleSprout`, `transform-box: fill-box`).
- **Bloco 3 (Fechamento v2.1.3):** Cache busting `?v=2.3` em `index.html`, atualização de `README.md`, `CHANGELOG.md`, `docs/REQUISITOS.md`, `docs/ROADMAP.md` e `GEMINI.md`, autovalidação completa e geração de `releases/saude-na-escola-v2.1.3.zip`.

---

## [v2.1.2 / CSS v2.2] — Responsividade Fluida Mobile (iOS Safari e Android Chrome)

### 1. Resumo Executivo
Esta entrega consolida o suporte responsivo fluido para smartphones **iOS (Safari)** e **Android (Chrome)** em larguras de **360px a 430px+** (retrato e paisagem), preservando **0% de alteração** no layout validado de lousa digital e desktop (`> 1024px`).

### 2. Registro de Decisão de Arquitetura (Mini-ADR)

#### ADR-07: Responsividade Mobile Fluida com Isolamento Estrito da Lousa Digital
- **Contexto:** Em testes reais em celulares (360px–430px), regras de altura fixa em `vh` e larguras mínimas rígidas causavam quebra/corte na barra superior, estouro horizontal do botão de ação na barra inferior, sobreposição da engrenagem no Menu Inicial, teclas estreitas/cortadas na Fase 3, ocultação da 3ª aba no Painel da Professora e risco de zoom automático em inputs no iOS Safari.
- **Decisão:**
  - **Safe Area & Viewport:** Adicionado `viewport-fit=cover` no `index.html` e aplicado `env(safe-area-inset-*)` nas barras superior/inferior e overlays de modais para proteção contra notch, Dynamic Island e barras de gestos.
  - **Prevenção de Zoom no iOS:** Definido `font-size: max(16px, 1rem)` em `.tp-input`, `.tp-textarea`, `.tp-select` e `.ev-select` nas media queries mobile.
  - **Barra Superior e Inferior:** Conversão de `header.top-bar` para altura fluida (`min-height` + `overflow: hidden`) com pílulas em `white-space: nowrap`; em retrato (`<= 600px`), ocultado o `.feedback-banner` e aplicado `.dock-group { display: contents; }` com `footer.bottom-dock { justify-content: space-evenly; }` para distribuir uniformemente os botões sem cortes nem espaços vazios.
  - **Menu Inicial e Teclado Virtual (Fase 3):** Espaço reservado à direita no `.hero-text` para a engrenagem, `flex-wrap` no seletor de questões, cards fluidos via `clamp()`/`flex: 1` com folga inferior e redução ergonômica de `.keyboard-container` com folga dedicada nos botões `APAGAR` e `VERIFICAR`.
  - **Painel da Professora e Modais:** `.tp-tab` com `flex: 1 1 0; min-width: 0;` mantendo as **3 abas visíveis simultaneamente** sem rolagem horizontal; `.modal-card` e `.ranking-modal-card` com `max-height: 92dvh; overflow-y: auto;` e mini-teclado ajustado para `ESPAÇO` e `APAGAR`.
  - **Cache Busting:** Adicionado `?v=2.2` nos links de `css/game.css` e `css/teacher-panel.css` no `index.html` para forçar atualização imediata em navegadores móveis.
- **Consequência:** Experiência fluida e confortável em smartphones iOS e Android (retrato e paisagem) mantendo **100% intacto** o layout de lousa digital e desktop (`> 1024px`).

### 3. Histórico de Entregas desta Atualização
- **`3b80dec`**: Centralização uniforme dos botões do rodapé (`display: contents` + `space-evenly`), folga adicional em `APAGAR`/`VERIFICAR` na Fase 3 e atualização do cache busting para `?v=2.2`.
- **`c5d67ab`**: Ajuste de largura dos botões do rodapé em telas `<= 480px` e introdução do cache busting nos links de CSS.
- **`21acfc5` (`feat/responsividade-mobile`)**: Implementação das 3 etapas de responsividade fluida mobile em `index.html`, `css/game.css` e `css/teacher-panel.css`.

---

## [v2.1.1] — Auditoria de Segurança, IHC para Lousa Digital, Evolução por Fase e Refinamento Visual

### 1. Resumo Executivo
Esta versão consolida a arquitetura modular da **v2.1**, aprimora as ilustrações vetoriais infantis, adiciona o acompanhamento diagnóstico separado por fase (**Memória, Sílabas e Escrita**) e aplica as melhorias da **Auditoria de Qualidade (Segurança, LGPD Escolar, Resiliência de Dados e IHC para Lousa Digital)**.

---

### 2. Registro de Decisões de Arquitetura (Mini-ADRs da Evolução v2.1)

#### ADR-01: Modularização 100% Offline sem ES Modules (`window.SaudeEscola`)
- **Contexto:** O arquivo `index.html` concentrava estilos, banco de palavras, áudio, ranking e motor de jogo, dificultando a manutenção. Contudo, o uso de `<script type="module">` (`import`/`export`) gera bloqueio de CORS quando o jogo é aberto diretamente via protocolo `file://` nos computadores da escola sem internet.
- **Decisão:** Extrair estilos e scripts para módulos independentes encapsulados em IIFEs sob o namespace global `window.SaudeEscola`:
  - `css/game.css` e `css/teacher-panel.css`
  - `js/storage-service.js` (`SaudeEscola.Storage`)
  - `js/analytics-engine.js` (`SaudeEscola.Analytics`)
  - `js/evolution-view.js` (`SaudeEscola.EvolutionView`)
  - `js/teacher-panel-ui.js` (`SaudeEscola.TeacherPanel`)
  - `js/word-bank.js` (`SaudeEscola.WordBank`)
  - `js/audio-engine.js` (`SaudeEscola.Audio`)
  - `js/ranking-service.js` (`SaudeEscola.Ranking`)
  - `js/game-engine.js` (`SaudeEscola.Game`)
- **Consequência:** Código limpo, desacoplado e auditável, mantendo funcionamento 100% offline com duplo clique no `index.html` e no GitHub Pages.

#### ADR-02: Diagnóstico e Gráfico Diário Quebrado por Fase (Retrocompatível)
- **Contexto:** Na Jornada Completa, a professora precisava identificar se a dificuldade da criança ou da turma ocorria na associação visual/leitura (Fase 1), na consciência silábica (Fase 2) ou na escrita alfabética (Fase 3).
- **Decisão:** Adicionar o objeto `fasesStats` (`fase1`, `fase2`, `fase3`) em cada sessão do Analytics e renderizar cards de desempenho por fase + gráfico de barras verticais agrupadas em `js/evolution-view.js`.
- **Consequência:** Visão diagnóstica precisa por habilidade da BNCC, preservando retrocompatibilidade total com sessões antigas salvas no `localStorage`.

#### ADR-03: Resiliência de Dados com Backup JSON Sanitizado (`Blob` + `FileReader`)
- **Contexto:** Como todos os dados ficam no `localStorage` do navegador da lousa digital, limpezas de cache ou trocas de equipamento poderiam causar perda do cadastro da turma, das Palavras da Semana e do histórico de evolução.
- **Decisão:** Implementar `Storage.gerarBackupJSON()` e `Storage.importarBackupJSON()` na Aba 1 do Painel da Professora, exportando e restaurando `saudeEscola_v2_dados` e `saudeBucalRanking` com passagem obrigatória por `sanitizarDados()` e `sanitizarListaRanking()`.
- **Consequência:** Portabilidade completa entre computadores sem necessidade de servidor ou banco em nuvem, com proteção estrita contra JSON malformado ou XSS.

#### ADR-04: Prevenção de Toques Acidentais na Lousa Digital (Confirmação em 2 Toques)
- **Contexto:** Crianças apoiando a mão na base da lousa digital podiam tocar acidentalmente em `MENU INICIAL` durante uma partida ou em `ZERAR RANKING` no modal da turma.
- **Decisão:** Exigir confirmação em 2 toques rápidos com reset automático por temporizador em todas as ações destrutivas:
  1. `MENU INICIAL` durante uma fase ativa (`TOQUE NOVAMENTE PARA SAIR`).
  2. `ZERAR RANKING` no modal do Ranking (`TOQUE NOVAMENTE PARA ZERAR`).
  3. Exclusão de aluno no Painel da Professora (`Confirmar?`).
  4. Limpeza de Palavras da Semana e de Histórico de Evolução.
- **Consequência:** Eliminação de perdas acidentais de progresso em sala de aula sem recorrer a caixas `confirm()`/`alert()` nativas que travam a tela touch.

#### ADR-05: Amplificação Segura de Áudio para Sala de Aula (`DynamicsCompressorNode`)
- **Contexto:** Os volumes originais da Web Audio API (`0.14` a `0.22`) ficavam baixos nos alto-falantes de TVs/lousas conectadas via HDMI em salas com 25 alunos.
- **Decisão:** Elevar os ganhos das notas para a faixa `0.34`–`0.48` e rotear toda a saída por um `DynamicsCompressorNode` (`threshold: -18dB`, `ratio: 6`, `knee: 12`) seguido de um `GainNode` master (`1.35`).
- **Consequência:** Efeitos sonoros claros e audíveis em ambiente escolar, sem distorção (*clipping*) nos acordes comemorativos.

#### ADR-06: LGPD Escolar e Fim das Sessões Órfãs
- **Contexto:** Em conformidade com boas práticas de privacidade escolar (LGPD) em telas projetadas para toda a turma, e para evitar que partidas abandonadas no meio gerassem registros sem aluno (`"Turma (sem identificação)"`).
- **Decisão:**
  - Orientar nos placeholders do Painel da Professora o cadastro por **Nome + Inicial** (ex.: `Ana J., Pedro M.`).
  - Adicionar a tecla `ESPAÇO` ao mini-teclado virtual do Ranking para facilitar a digitação de nomes compostos na lousa.
  - Descartar sessões incompletas quando o jogador sai pelo `MENU INICIAL` antes da etapa final de identificação no Ranking.
- **Consequência:** Dados mais limpos e fidedignos nos gráficos de evolução da turma e menor exposição de dados pessoais na lousa.

---

### 3. Histórico de Entregas Recentes

- **`feat/auditoria-v2.1`**:
  - Card **"Backup dos Dados"** (Exportar/Importar JSON sanitizado) na Aba 1 do Painel da Professora.
  - Confirmação em 2 toques em `ZERAR RANKING`, `MENU INICIAL` (em fase ativa) e remoção de aluno.
  - Placeholders orientando `Nome + Inicial` (LGPD escolar).
  - Tecla `ESPAÇO` no mini-teclado virtual do Ranking.
  - Cadeia de áudio amplificada com `DynamicsCompressorNode` e ganho master calibrado.
  - Descarte automático de sessões órfãs não identificadas ao sair no meio da partida.
- **`f6a3d74`**: Refinamento artístico dos SVGs vetoriais infantis das 10 palavras padrão de Saúde Bucal (zero emojis nativos).
- **`d27ed97`**: Ajustes de transição no Ranking, badges visuais de "Palavras da Semana" nas Fases 1, 2 e 3, desambiguação de pares na Fase 1 e gráficos de evolução quebrados por fase.
- **`96084f2` (`v2.1`)**: Refatoração modular completa do CSS e JavaScript mantendo compatibilidade 100% offline (`file://`).
- **`a7f558f` (`v2.0`)**: Lançamento do Painel da Professora ("Palavras da Semana" + "Turma e Modo") e Motor Silencioso de Análise Pedagógica (Analytics + Evolução).
