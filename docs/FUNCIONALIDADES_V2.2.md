# Documentação Funcional e Pedagógica — Saúde na Escola: Saúde Bucal (v2.2)

Este documento mapeia o funcionamento real completo da versão **v2.2** (`feat/v2.2`) do software educacional **Saúde na Escola: Saúde Bucal**, articulando sua arquitetura offline (`file://`) aos fundamentos de **Interação Humano-Computador (IHC) Infantil**, **Base Nacional Comum Curricular (BNCC)** e diretrizes do **MEC** para alfabetização inicial (1º e 2º anos do Ensino Fundamental).

---

## 1. Visão Geral, Público-Alvo e Arquitetura Técnica (`v2.2`)

| Aspecto | Especificação Real na v2.2 |
| :--- | :--- |
| **Público Principal** | Crianças de **6 a 7 anos** (1º e 2º anos do Ensino Fundamental — alfabetização inicial) e professora regente da turma. |
| **Plataforma Prioritária** | **Desktop e Lousas Digitais Touch** (`> 1024px`, Windows, macOS e Linux via HDMI + USB), preservando o layout mobile isolado em `@media` para visualização secundária. |
| **Execução e Distribuição** | **100% offline via `file://`** e compatível com GitHub Pages; JavaScript Vanilla sob namespace único `window.SaudeEscola` (zero bundler, zero ES Modules e zero dependências externas/CDNs). |
| **Segurança e CSP (`index.html:6`)** | Política `<meta http-equiv="Content-Security-Policy">` estrita: `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';`. |
| **Blindagem Anti-XSS (`js/dom-safe.js`)** | **473 chamadas** a `window.SaudeEscola.DomSafe` no projeto, `0` usos executáveis de `innerHTML`/`outerHTML`/`eval`, criação DOM via `createElement` + `textContent` e sanitização SVG via `DOMParser` + allowlist (`parseSvg`). |
| **Estilos e Tokens (`css/`)** | [css/game.css](file:///home/joyboy/%C3%81rea%20de%20trabalho/jogo-escola/css/game.css) (`?v=2.9`) com **24 tokens `--ui-*`** calibrados para salas iluminadas/projetores e [css/teacher-panel.css](file:///home/joyboy/%C3%81rea%20de%20trabalho/jogo-escola/css/teacher-panel.css) (`?v=2.11`) com tokens harmônicos e `@media print` A4. |
| **Persistência Local (`localStorage`)** | 4 chaves exclusivas: `saudeEscola_v2_dados`, `saudeBucalRanking`, `saudeBucalClueQueues` e `saudeBucalSentenceQueues`. |

### Ordem Exata de Carregamento dos 20 Módulos JS (`index.html:392-411`)

1. `js/dom-safe.js` — utilitários seguros de DOM e parser/sanitizador SVG (`DomSafe`).
2. `js/period-service.js` — gestão e validação de bimestres/trimestres sem sobreposições (`Periods`).
3. `js/stickers/animais.js` — 8 figurinhas vetoriais da categoria **Animais**.
4. `js/stickers/frutas.js` — 8 figurinhas vetoriais da categoria **Frutas e Alimentos**.
5. `js/stickers/natureza.js` — 8 figurinhas vetoriais da categoria **Natureza**.
6. `js/stickers/escola.js` — 8 figurinhas vetoriais da categoria **Escola e Objetos**.
7. `js/stickers/brinquedos.js` — 8 figurinhas vetoriais da categoria **Casa e Brinquedos**.
8. `js/stickers/index.js` — índice central, matching por palavra-chave e singularização automática (`Stickers`).
9. `js/storage-service.js` — camada offline de persistência, sanitização LGPD/XSS e Backup JSON (`Storage`).
10. `js/analytics-engine.js` — motor silencioso de coleta diagnóstica e alinhamento ortográfico LCS (`Analytics`).
11. `js/evolution-view.js` — renderização de gráficos, comparativos por período e tabela Aluno por Aluno (`EvolutionView`).
12. `js/report-print.js` — gerador do Relatório Pedagógico Imprimível / PDF Offline (`ReportPrint`).
13. `js/syllable-helper.js` — separador automático de sílabas em Português e extrator em lote (`SyllableHelper`).
14. `js/teacher-panel-ui.js` — interface do Painel da Professora em 3 abas (`TeacherPanel`).
15. `js/ui-icons.js` — 10 ícones vetoriais redesenhados em 5 conjuntos de interface (`UiIcons`).
16. `js/word-bank.js` — banco nativo de Saúde Bucal (10 palavras, 80 dicas, 80 frases e SVGs padrão `WordBank`).
17. `js/mascot-controller.js` — controlador expressivo e animações do mascote Dentinho (`Mascot`).
18. `js/audio-engine.js` — sintetizador sonoro offline via Web Audio API (`Audio`).
19. `js/ranking-service.js` — gestão visual e ordenação do Ranking da turma (`Ranking`).
20. `js/game-engine.js` — motor principal de estado, navegação, teclado virtual e Fases 1–3 (`GameEngine`).

---

## 2. Funcionalidades da Experiência Infantil

### 2.1. Menu Inicial e Controles de Entrada
- **Seletor de quantidade de questões:** opções táteis de **`3`**, **`5`** (padrão) ou **`10` questões** aplicadas às Fases 2 e 3 (quando o modo *Palavras da Semana* possui menos de 10 palavras cadastradas, o sistema ajusta o total ao número disponível).
- **Modos de acesso:** cards independentes para jogar **Fase 1 (Jogo da Memória)**, **Fase 2 (Construtor de Sílabas)**, **Fase 3 (Escrita Espontânea)** ou a **Jornada Completa** (encadeia as 3 fases com soma acumulada de estrelas).
- **Indicador de conteúdo personalizado:** selo visual no Menu Inicial e barra informativa no topo das fases sempre que *Palavras da Semana* está ativo.
- **Trava docente:** botão discreto de engrenagem no canto superior direito que exige **pressão contínua por 3 segundos** (`3000ms`), impedindo acesso acidental dos alunos na lousa digital.

### 2.2. Fase 1 — Jogo da Memória (Associação Leitura <-> Significado)
- **Mecânica pedagógica:** sorteia **4 palavras por rodada** (8 cartas na grade). Diferente de jogos de memória puramente visuais, cada par une **1 carta de estímulo** e **1 carta com a palavra escrita exclusivamente em CAIXA ALTA**, exigindo leitura e decodificação ativa.
- **Avaliação por tempo médio:** na v2.1.3+ e v2.2, a Fase 1 é mensurada pelo **tempo de conclusão da rodada em segundos** (`tempoSegundos`, `rodadas`) no motor analítico — evitando atribuir "erro" ao processo natural de exploração espacial das cartas viradas — e contabiliza estrela ao completar os 4 pares.
- **Modo Palavras da Semana na Fase 1:** oferece dois comportamentos configuráveis pela professora:
  1. **Prioridade visual/textual:** exibe a **Figurinha associada** (quando selecionada), caso contrário a **Dica curta**, ou a **1ª Sílaba** como fallback se não houver dica.
  2. **Sempre a 1ª sílaba:** exibe a sílaba inicial em destaque (com reconciliação automática quando palavras distintas compartilham a mesma sílaba inicial).
- **Renovação rápida:** botão roxo **`NOVOS PARES`** com ícone vetorial atualizado para iniciar outra rodada imediata.

### 2.3. Fase 2 — Construtor de Sílabas
- **Banco nativo e filas anti-repetição:** 10 conceitos de Saúde Bucal (`BOCA`, `DENTE`, `PASTA`, `ESCOVA`, `SORRISO`, `FIO`, `ÁGUA`, `CÁRIE`, `LÍNGUA`, `GENGIVA`), acompanhados de **80 dicas descritivas** (8 por palavra) gerenciadas por fila embaralhada (*Fisher-Yates*) persistida em `saudeBucalClueQueues`.
- **Consciência silábica com distratores:** exibe a ilustração SVG (ou figurinha / caderninho padrão em *Palavras da Semana*), a dica descritiva, espaços numerados para as sílabas-alvo e um conjunto embaralhado na zona inferior (`.lower-zone`) contendo as sílabas corretas mais **2 sílabas intrusas** foneticamente próximas.
- **Scaffolding (apoio sem frustração):** tocar em um espaço preenchido devolve a sílaba para a bandeja; ao verificar uma tentativa incorreta, **as sílabas na posição certa permanecem fixas** e apenas as divergentes retornam para nova tentativa. Botão **`OUTRA PALAVRA`** permite avançar quando necessário.

### 2.4. Fase 3 — Escrita Espontânea
- **80 frases contextualizadas (`saudeBucalSentenceQueues`):** cada item apresenta uma frase educativa em caixa alta com lacuna destacada (`___`) e ilustração correspondente.
- **Teclado virtual ergonômico:** posicionado na metade inferior da lousa digital (`.lower-zone`), com teclas `A–Z`, `APAGAR` e `VERIFICAR` (além de suporte a teclado físico em Desktop).
- **Regra Anti-Preguiça:** durante a correção, a normalização Unicode (`NFD`) aceita vogais sem necessidade de digitar acento agudo/circunflexo/til e devolve o caractere devidamente acentuado na palavra correta; letras acertadas na posição certa **travam em verde** e apenas as letras incorretas são limpas para que a criança reanalise os fonemas faltantes.
- **Fallbacks no modo Palavras da Semana:** usa a frase com lacuna (convertendo automaticamente a palavra inteira em `___` se a professora não digitou os underscores); se a frase estiver em branco, exibe a dica; se ambos estiverem em branco, entra em **Modo Ditado** ocultando o texto e mantendo a leitura mediada pela professora.

### 2.5. Mascote Dentinho (`js/mascot-controller.js`)
- **Identidade e presença:** voz/balão de diálogo centralizado exclusivamente no Menu Inicial (evitando ruído visual durante as fases de concentração) e presença companheira no rodapé das atividades.
- **Comportamento expressivo:** piscadas orgânicas em intervalos irregulares (`3,4s`, `5,2s`, `2,9s`, `4,6s`, `6,1s`), 5 estados expressivos (`is-waving`, `is-celebrating`, `is-triumph`, `is-encouraging`, `is-curious`) e 3 ritmos de fala animada (`.is-talking`, `.is-talking-excited`, `.is-talking-calm`) com `transform-box: fill-box`.
- **Acessibilidade de movimento:** respeita `@media (prefers-reduced-motion: reduce)` em `css/game.css`, desligando animações contínuas sem perder a troca estática das expressões.

### 2.6. Áudio Sintetizado, Ícones Vetoriais e Ranking Visual
- **Áudio (`js/audio-engine.js`):** síntese 100% offline via **Web Audio API** (cadeia com `DynamicsCompressorNode` e `GainNode` master em `1.35`, zero arquivos `.mp3` externos) com botões tátil de ativar/silenciar no cabeçalho e sons acolhedores (`playEncourage` em erros, arpejo alegre em acertos e celebrações).
- **Ícones de interface (`js/ui-icons.js`) e Política Zero Emojis:** 5 conjuntos redesenhados com traço infantil arredondado (**10 SVGs** ao todo: `SOUND_ON`/`SOUND_OFF`, medalhas de 1º/2º/3º lugar, troféus de cabeçalho/modal/ranking, casinha de retorno e ícone do botão roxo `NOVOS PARES` / `OUTRA PALAVRA`). Todo o sistema possui **0 emojis nativos do sistema operacional** e **116 SVGs auditados** sem `<defs>` ou `id=` duplicado.
- **Ranking visual (`js/ranking-service.js`):** exibe as pontuações em escala baixa com estrelas desenhadas lado a lado e ordenação explícita **DO MAIOR PARA O MENOR**, pódio com medalhas vetoriais, chips clicáveis com os nomes da turma no Modo Aula e mini-teclado alfabético com tecla `ESPAÇO`.

---

## 3. Funcionalidades do Painel da Professora

### 3.1. Aba 1 — Turma e Modo (`js/teacher-panel-ui.js` e `js/storage-service.js`)
- **Chaveamento Modo Aula vs. Modo Livre:**
  - *Modo Aula:* grava sessões analíticas silenciosas e exibe chips rápidos da turma no Ranking.
  - *Modo Livre:* ideal para recreação ou Mostra Escolar, mantendo o histórico pedagógico limpo.
- **Gestão da turma com foco LGPD:** cadastro orientado para **Nome + Inicial** (até `100` alunos, limite de `60` caracteres), com inserção individual ou em lote (separação por vírgula, ponto e vírgula ou quebra de linha) e exclusão protegida por **confirmação em 2 toques** (3 segundos).
- **Backup completo sanitizado (`.json`):** exporta e importa em um único arquivo todas as 4 estruturas de `saudeEscola_v2_dados` (configuração, períodos letivos, turma, Palavras da Semana, até 500 sessões e até 200 anotações) e `saudeBucalRanking` (até 30 entradas), com limite de **2 MB**, bloqueio contra prototype pollution (`__proto__`, `constructor`, `prototype`), validação estrita de datas reais e remoção de tags HTML.

### 3.2. Aba 2 — Palavras da Semana (UX Simplificada da v2.2)
- **Cartão de progresso guiado:** acompanha o preenchimento rumo ao mínimo de **4 palavras** (até o teto de **12 palavras**), liberando chave evidente de ativação imediata assim que a 4ª palavra é salva.
- **Separação silábica automática (`js/syllable-helper.js`):** analisa palavras digitadas em Português do Brasil (vogais acentuadas, encontros consonantais `BL..VR`, dígrafos inseparáveis `CH/LH/NH/QU/GU` e separáveis `RR/SS/SC/SÇ/XC`, ditongos e hiatos comuns), preenche a separação com hífens em tempo real e exibe **pré-visualização ao vivo em blocos táteis**, permitindo ajuste manual pela professora.
- **Cadastro em lote:** caixa para digitar ou colar múltiplas palavras separadas por vírgula, ponto e vírgula ou quebra de linha com silabação automática e seleção individual de figurinhas antes de salvar tudo de uma vez.
- **Catálogo de 40 Figurinhas Vetoriais em 5 Categorias (`js/stickers/`):**

| Categoria (`id`) | Rótulo no Painel | 8 Figurinhas Reais (`id` / Rótulo) |
| :--- | :--- | :--- |
| `animais` | **Animais** | `cavalo` (Cavalo), `gato` (Gato), `pato` (Pato), `vaca` (Vaca), `macaco` (Macaco), `coelho` (Coelho), `peixe` (Peixe), `coruja` (Coruja) |
| `frutas` | **Frutas e Alimentos** | `banana` (Banana), `maca` (Maçã), `melancia` (Melancia), `morango` (Morango), `laranja` (Laranja), `pessego` (Pêssego), `bolo` (Bolo), `queijo` (Queijo) |
| `natureza` | **Natureza** | `sol` (Sol), `lua` (Lua), `estrela` (Estrela), `arvore` (Árvore), `flor` (Flor), `nuvem` (Nuvem), `chuva` (Chuva), `folha` (Folha) |
| `escola` | **Escola e Objetos** | `escola` (Escola), `lapis` (Lápis), `livro` (Livro), `caderno` (Caderno), `mochila` (Mochila), `tesoura` (Tesoura), `cola` (Cola), `relogio` (Relógio) |
| `brinquedos` | **Casa e Brinquedos** | `casa` (Casa), `palhaco` (Palhaço), `bola` (Bola), `boneca` (Boneca), `pipa` (Pipa), `balao` (Balão), `carro` (Carro), `barco` (Barco) |

- **Correspondência inteligente e fallback:** `Stickers.matchByWord()` sugere automaticamente a figurinha ao digitar (incluindo flexões de plural/singular em Português como `CAVALOS -> cavalo`, `FLORES -> flor`, `MAÇÃS -> maca`); caso não deseje figurinha, o sistema utiliza a ilustração SVG vetorial do caderninho (`Storage.SVGs.ILUSTRACAO_SEMANA`).

### 3.3. Aba 3 — Evolução, Períodos Letivos, Anotações e Relatório PDF
- **Motor silencioso de diagnóstico (`js/analytics-engine.js`):** registra desempenho sem que a criança perceba estar sendo testada:
  - *Fase 1:* tempo total em segundos e rodadas concluídas.
  - *Fase 2:* acertos totais, acertos de primeira tentativa e mapa exato de sílabas com confusão.
  - *Fase 3:* **alinhamento por distância de edição / LCS (`analisarEscritaFase3`)** respeitando letras já travadas em verde para detectar **9 trocas fonéticas/ortográficas** (`G/J`, `M/N` incluindo M antes de P/B, `S/Z`, `C/S/Ç`, `P/B`, `T/D`, `F/V`, `L/U`, `C/G`), além de **`OMISSAO_DIGRAFO_*`** (`RR`, `SS`, `CH`, `LH`, `NH`, `QU`, `GU`), `LETRAS_FALTANDO`, `DUPLICACAO_LETRA` e `LETRAS_EXTRAS`.
- **Agrupamento por Período Letivo (`js/period-service.js` e `js/evolution-view.js`):** permite alternar entre visualização **Por Dia** e **Por Período Letivo**, configurando modelos de **Bimestre (4 períodos)** ou **Trimestre (3 períodos)** com datas editáveis (validação de calendário real e bloqueio de datas sobrepostas) sem apagar histórico anterior.
- **Comparativos longitudinais e visão Aluno por Aluno:** gera barras comparativas entre períodos/dias, cards de **Pontos Fortes**, **Pontos de Atenção**, **Ranking de Dificuldades** com exemplos reais e a tabela **Desempenho Aluno por Aluno** (ordenável alfabeticamente, cobrindo alunos da turma e sessões legadas).
- **Anotações da Professora:** diário pedagógico integrado ao backup JSON (vinculado à turma geral ou a um aluno específico, até 200 registros de 1.000 caracteres).
- **Relatório Pedagógico Imprimível / PDF Offline (`js/report-print.js`):** gera documento formatado em `@media print` (A4) contendo cabeçalho institucional, resumo geral e por período, tabela Aluno por Aluno, principais dificuldades ortográficas/silábicas, anotações da docente e selo LGPD.

---

## 4. Fundamentação Pedagógica e de IHC (BNCC, MEC e Lousa Digital)

### 4.1. Alinhamento Oficial à BNCC (Verificado na Auditoria `research-ihc-bncc`)

| Código BNCC | Componente / Ano | Habilidade / Competência | Evidência no Sistema (v2.2) | Situação |
| :--- | :--- | :--- | :--- | :--- |
| **EF01LP05** | Língua Portuguesa (1º ano) | Reconhecer o sistema de escrita alfabética como representação dos sons da fala. | Fase 1 (carta ilustrativa/dica <-> palavra escrita em caixa alta) e Fase 3 (escrita espontânea mediada). | **Plena** |
| **EF01LP06** | Língua Portuguesa (1º ano) | Segmentar oralmente palavras em sílabas. | Fase 2 (montagem por blocos silábicos com instrução de fala pausada) + `SyllableHelper` nas Palavras da Semana. | **Plena** |
| **EF01LP07** | Língua Portuguesa (1º ano) | Identificar fonemas e sua representação por letras. | Fase 3 (`game-engine.js`) + diagnóstico de trocas sonoras (`P/B`, `T/D`, `F/V`, `C/G`, `S/Z`, `G/J`, `L/U`). | **Parcial** *(tecla `Ç` ainda ausente no teclado da Fase 3)* |
| **EF01LP08** | Língua Portuguesa (1º ano) | Relacionar elementos sonoros a sua representação escrita. | Fase 1 no modo *1ª sílaba* e Fase 2 com 2 sílabas intrusas fonologicamente contrastivas. | **Plena** |
| **EF01LP09** | Língua Portuguesa (1º ano) | Comparar palavras identificando semelhanças e diferenças em sílabas iniciais. | Fase 1 personalizada no modo *Sempre a 1ª sílaba*, com tratamento de sílabas iniciais repetidas. | **Plena** |
| **EF01LP13** | Língua Portuguesa (1º ano) | Comparar sons e grafias em sílabas mediais e finais. | Distratores contrastivos da Fase 2 (`PAS/POS`, `TA/TE`, `SOR/SAR`, `GEN/GAN`, `GI/GE`, `GUA/GUE`). | **Plena** |
| **EF02LP02** | Língua Portuguesa (2º ano) | Segmentar palavras em sílabas e remover/substituir sílabas iniciais, mediais ou finais. | Toque no slot na Fase 2 devolve a sílaba para substituição ativa + silabador cobrindo sílabas simples e complexas. | **Plena** |
| **EF02LP03 / EF02LP04** | Língua Portuguesa (2º ano) | Escrever corretamente palavras com correspondências regulares diretas/contextuais e sílabas complexas. | Palavras padrão (`DENTE`, `PASTA`, `ESCOVA`, `SORRISO`, `ÁGUA`, `LÍNGUA`, `GENGIVA`) + análise LCS de dígrafos (`RR/SS/CH/LH/NH/QU/GU`) e regra `M` antes de `P/B`. | **Parcial** *(acentos e `Ç` são autopreenchidos — calibrado para o 1º ano; Modo 2º Ano planejado)* |
| **EF01CI03** | Ciências (1º ano) | Discutir razões pelas quais hábitos de higiene corporal mantêm a saúde. | 10 conceitos + 160 textos sobre escovação, flúor, quantidade de pasta, fio dental, língua, gengiva e consumo consciente de água. | **Plena** *(com 1 ajuste pontual de texto em `word-bank.js:51`)* |
| **EF01MA01 / EF01MA05** | Matemática (1º ano) | Utilizar números naturais como indicadores de quantidade e ordem; compará-los. | Ranking com estrelas visuais em correspondência um-a-um e ordenação explícita *DO MAIOR PARA O MENOR*. | **Plena** |
| **Comp. Geral 5** | Cultura Digital | Utilizar tecnologias digitais de forma significativa, reflexiva e ética. | Operação tátil em lousa digital, 100% offline sem rastreadores e proteção LGPD infantil. | **Plena** |
| **Comp. Geral 8** | Autoconhecimento e Autocuidado | Cuidar da saúde física e emocional no contexto escolar. | Educação bucal contínua associada a reforço positivo não punitivo diante do erro. | **Plena** |

### 4.2. Diretrizes do MEC e Psicogênese da Alfabetização
- **Progressão didática da leitura global à análise alfabética:** a sequência **Fase 1 -> Fase 2 -> Fase 3** acompanha a passagem descrita nas diretrizes do MEC/PNAIC e estudos de alfabetização inicial: reconhecimento de palavra estável (Fase 1), segmentação e consciência silábica (Fase 2) e hipótese silábico-alfabética/alfabética com reflexão fonema-grafema letra a letra (Fase 3).
- **Avaliação formativa e diagnóstica contínua:** o `AnalyticsEngine` opera de forma transparente à criança para orientar intervenções da professora no quadro (revisando exatamente os pares fonéticos ou sílabas que geraram hesitação), evitando expor notas ou rankings de erro aos colegas.

### 4.3. Princípios de IHC Infantil Aplicados à Lousa Digital
1. **Alcance físico adequado (6–7 anos):** botões de ação, sílabas e teclado virtual concentrados na **metade inferior da tela** (`.lower-zone`), enquanto dicas, frases e ilustrações ficam na área superior visível a toda a turma.
2. **Prevenção de erros e saídas acidentais:** ausência total de `alert()`, `confirm()` e `prompt()` nativos; confirmações destrutivas em **2 toques**; trava de 3s na engrenagem docente; bloqueio de seleção textual e `contextmenu` no toque longo da lousa HDMI.
3. **Linguagem acolhedora:** nenhum feedback usa termos negativos ou sons de buzina; erros trazem pistas construtivas (*"QUASE LÁ!"*, *"BOA TENTATIVA!"*).
4. **Legibilidade em projetores escolares:** tipografia arredondada em caixa alta nas telas infantis, sistema de tokens `--ui-*` evitando branco estourado ou baixo contraste em salas claras, e foco visível (`:focus-visible`) para navegação por teclado/controle.
