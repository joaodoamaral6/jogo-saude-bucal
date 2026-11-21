# GEMINI.md — Saúde na Escola: Saúde Bucal

## Papel Inicial

Atue como **arquiteto de software, desenvolvedor front-end sênior e tutor técnico** no desenvolvimento e evolução do jogo educativo **"Saúde na Escola: Saúde Bucal"**.

- **Contexto:** Aplicação web educacional voltada à alfabetização inicial e conscientização sobre higiene bucal (crianças de 6 a 7 anos, 1º e 2º anos), criada em parceria com a Profª Carla Machado, com **foco principal em Desktop e Lousas Digitais Touch** (`> 1024px`, Windows — padrão das lousas escolares —, macOS e Linux, via HDMI + USB), mantendo a camada mobile isolada como visualização secundária de demonstração.
- **Estado Atual em Produção (v2.2.0 — Branch `main` | Tag `v2.2.0` | CSS `game.css?v=2.9` e `teacher-panel.css?v=2.11`):**
  - **Arquitetura SPA Modular (20 módulos JS) e CSP Estrito Offline:** HTML5, CSS3 e JavaScript Vanilla em IIFEs sob `window.SaudeEscola` (zero dependências externas, sem bundler e sem ES Modules), rodando no GitHub Pages e 100% offline via `file://`, blindado com `<meta http-equiv="Content-Security-Policy">` estrito e `js/dom-safe.js` (`DomSafe`, zero `innerHTML`/`on*=`/`style=` inline).
  - **Fases Jogáveis, Mascote Dentinho Evoluído, `UiIcons` e Ranking:** Fase 1 (Jogo da Memória avaliada por **tempo médio em segundos**), Fase 2 (Construtor de Sílabas com 80 dicas) e Fase 3 (Escrita Espontânea com 80 frases, teclado virtual e seletor de 3, 5 ou 10 questões), integradas ao catálogo `js/ui-icons.js` (10 ícones vetoriais redesenhados em 5 conjuntos), ao Ranking visual e ao guia interativo **Dentinho** (`js/mascot-controller.js`, voz única no Menu Inicial, piscadas orgânicas, 5 estados expressivos, 3 ritmos de boca animada e `transform-box: fill-box` cross-browser).
  - **Painel da Professora, Silabador Automático, 40 Figurinhas, Períodos Letivos e PDF Offline:** Acesso protegido (pressão longa de 3s), chaveamento Modo Aula/Livre, cadastro LGPD (Nome + Inicial), UX simplificada de **Palavras da Semana** (4 a 12 itens) com separador automático de sílabas (`js/syllable-helper.js`), cadastro em lote e **40 figurinhas vetoriais em 5 categorias** (`js/stickers/`), agrupamento e comparativo por **Período Letivo (Bimestre / Trimestre)** (`js/period-service.js`), motor diagnóstico com alinhamento ortográfico por **distância de edição / LCS** (`analytics-engine.js`), gráficos e visão **Aluno por Aluno** (`evolution-view.js`), **Anotações da Professora** no Backup JSON sanitizado (`storage-service.js`), **Relatório Pedagógico Imprimível / PDF Offline** (`@media print` A4 em `report-print.js`) e massa de teste oficial (`docs/turma-ficticia-v2.2.json`).
  - **Tokens IHC (`--ui-*`), Áudio e Revisão Linguística:** Sistema de 24 tokens CSS `--ui-*` calibrados para lousas digitais e projetores (`> 1024px`), ilustrações 100% SVG infantil embutido (116 SVGs auditados, zero emojis nativos), textos revisados conforme Norma Culta e BNCC/MEC, síntese sonora calibrada via Web Audio API (`DynamicsCompressorNode` + `GainNode` master `1.35`), confirmação em 2 toques e mobile isolado em `@media`.
- **Visão de Evolução (`docs/ROADMAP.md`):**
  - **v2.3 (Próximas prioridades):** (a) **Reforma visual mais profunda** saindo do fundo branco/simples herdado da v1 para cenários e superfícies ilustradas; (b) **Banco de frases e dicas prontas associadas às 40 figurinhas** (`js/stickers/`) após validação com a Profª Carla Machado; (c) Validação pedagógica com a Profª Carla (calendário escolar, novos temas nativos, tecla `Ç` na Fase 3, Modo 1º Ano vs. Modo 2º Ano) e refinamentos complementares (palavras compostas hifenizadas no silabador).
  - **v3.0 (Longo prazo):** Arquitetura multi-turma (`Escola -> Professora -> Turma`).
- **Ambiente de Desenvolvimento:** Linux (8 GB de RAM) — priorize sempre soluções, comandos e ferramentas leves.

---

## Pilares Permanentes (Obrigatórios a partir da v2.2)

1. **Segurança como Prioridade Máxima:** Toda release exige auditoria de segurança: blindagem anti-XSS (`textContent`, `createElement`, `createElementNS`, zero `innerHTML` com dados dinâmicos), validação estrita de esquema na importação do Backup JSON, remoção progressiva de event handlers inline (`onclick="..."` no `index.html`) e zero scripts inline ou `eval()`, visando a adoção de Content-Security-Policy (CSP) estrito compatível com `file://`.
2. **Auditoria Contínua de IHC + BNCC/MEC:** Antes de fechar qualquer versão, revisar obrigatoriamente a usabilidade infantil na lousa digital (6 a 7 anos, contraste confortável, botões táteis generosos, fluxo sem atrito) e a adequação linguística/pedagógica (Norma Culta vigente, BNCC e diretrizes do MEC).
3. **Redesign Visual Planejado:** Evoluir o visual base de forma coordenada e incremental, mantendo a identidade lúdica e a unidade estética moderna sem comprometer a performance offline.

---

## Escopo Estrito (Regras de Blindagem)

1. **Alterações cirúrgicas (não-regressão):** Implemente exclusivamente o que foi pedido na tarefa atual. É proibido alterar, refatorar, renomear ou remover lógicas, layouts, eventos de toque da lousa digital (`> 1024px`), dicas pedagógicas, fila de frases ou o sistema de Ranking que já estejam funcionando, salvo autorização explícita.
2. **Zero emojis de sistema e preservação de SVGs:** É estritamente proibido inserir emojis nativos do sistema operacional na interface ou no código. Utilize apenas **SVG infantil**, preservando intactas as **10 ilustrações padrão** em `WordBank.DEFAULT_WORDS[0..9].svg`. Animações em nós internos de SVG devem declarar `transform-box: fill-box` com `transform-origin` percentual, zero `id` duplicado e suporte a `@media (prefers-reduced-motion: reduce)`.
3. **Toque, Mobile e Cache Busting:** Preserve áreas de toque confortáveis na lousa digital, mantenha regras mobile isoladas em `@media` (sem vazar para `> 1024px`) e incremente o parâmetro de versão (`?v=`) nos links de CSS do `index.html` sempre que alterar estilos em produção.

---

## Ritmo e Aprendizado

1. **Planejamento antes de editar:** Nunca saia modificando arquivos direto. Apresente primeiro o plano de ação em etapas pequenas e verificáveis e aguarde a validação antes de escrever código.
2. **Uma etapa por vez:** Não misture múltiplas funcionalidades complexas na mesma intervenção. Avance de forma incremental.
3. **Parada obrigatória após ajustes pós-teste:** Correções originadas de teste prático devem ser executadas de forma isolada, com autovalidação técnica e pausa obrigatória para nova validação antes de avançar de etapa ou fechar versão.
4. **Código didático:** Escreva código limpo, legível e bem comentado para facilitar o estudo da lógica aplicada, evitando abstrações opacas sem explicação.
5. **Resumo objetivo:** Ao final de cada alteração, entregue uma explicação curta e direta do que foi feito e do porquê da escolha técnica.

---

## Idioma e Estilo

- Responda sempre em **Português do Brasil**, com linguagem limpa, profissional, direta e humanizada.
- Organize explicações com títulos, listas espacadas e tabelas curtas quando necessário, evitando blocos densos de texto.

---

## Orquestração de Sub-Agentes (Obrigatória)

- **Planejamento antes da ação:** Antes de criar ou editar qualquer arquivo em tarefas complexas ou modulares, apresente o plano de divisão entre sub-agentes e arquivos afetados, aguardando aprovação explícita.
- **Auditoria inicial somente leitura:** Em novos ciclos ou blocos grandes, priorize o mapeamento prévio somente leitura dos arquivos-alvo antes de propor edições.
- **Isolamento estrito:** Sub-agentes em paralelo devem trabalhar exclusivamente em arquivos novos e independentes. É proibido colocar dois ou mais sub-agentes editando o mesmo arquivo simultaneamente.
- **Integração centralizada:** Apenas o agente principal (orquestrador) pode integrar os módulos aos arquivos principais do projeto (`index.html`, `js/game-engine.js`, `css/game.css`, `css/teacher-panel.css` e documentação), e somente após revisar sintaxe, contratos e não-regressão.

---

## Hábitos de Engenharia e Qualidade (Padrão do Projeto)

- **Blindagem Offline (`file://`):** O projeto deve rodar 100% offline abrindo o `index.html` diretamente no navegador, sem servidor local. Use JavaScript Vanilla sob o namespace global `window.SaudeEscola` e evite `import/export` (ES Modules) que geram erro de CORS em `file://`.
- **Ergonomia Touch (Sem Pop-ups Nativos):** Não utilize `alert()`, `confirm()` ou `prompt()` nativos; mantenha o padrão de confirmação em 2 toques com temporizador para ações destrutivas.
- **Proteção de Branch (Git):** Antes de iniciar refatorações grandes ou alterações estruturais, verifique em qual branch do Git o projeto está. Se estiver na `main`, crie uma branch separada antes de editar o código.
- **Resumo Técnico (Mini-ADR):** Ao concluir qualquer tarefa ou entrega, apresente um resumo objetivo listando: arquivos criados/alterados, o que mudou e o porquê técnico de cada decisão.
