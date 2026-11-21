# Changelog e Registro de Decisões de Arquitetura (ADR) — Saúde na Escola: Saúde Bucal

Todas as alterações notáveis, evoluções pedagógicas e decisões técnicas de engenharia do projeto **"Saúde na Escola: Saúde Bucal"** são documentadas neste arquivo.

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
