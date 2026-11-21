# Roadmap e Backlog de Evolução (v2.2.0 -> v2.3 / v3.0)

Este documento organiza o histórico de prioridades recém-concluídas na **v2.2.0** e o backlog de evolução pedagógica, visual e técnica do projeto **Saúde na Escola: Saúde Bucal**, mantendo como diretriz de plataforma o **foco principal em Desktop e Lousas Digitais** (`> 1024px`, Windows, macOS e Linux).

Para consultar os detalhes arquiteturais e decisões técnicas (Mini-ADRs) entregues até a **v2.2.0**, acesse [../CHANGELOG.md](../CHANGELOG.md), [FUNCIONALIDADES_V2.2.md](FUNCIONALIDADES_V2.2.md) e [RELATORIO_DIAGNOSTICO_V2.2.md](RELATORIO_DIAGNOSTICO_V2.2.md).

---

## 1. Entregas Concluídas na v2.2.0

Todos os blocos técnicos e de UX planejados para o ciclo **v2.2.0** foram implementados, auditados e validados via `file://`:
- **Pilar 1 (Segurança e CSP Estrito Offline):** `<meta http-equiv="Content-Security-Policy">` estrito compatível com `file://`, módulo `js/dom-safe.js` (zero `innerHTML`/`on*=`/`style=` inline), proteção contra *prototype pollution*, remoção dos legados `#p2EmojiCorner`/`#p3EmojiCorner` e alinhador ortográfico por **distância de edição / LCS** (`analisarEscritaFase3` em `js/analytics-engine.js`) para omissão de dígrafos.
- **Agrupamento e Comparativo por Período Letivo (`js/period-service.js`):** suporte a **Bimestres (4 períodos)** e **Trimestres (3 períodos)** com datas configuráveis, comparativos gráficos e integração ao Relatório PDF sem apagar o histórico acumulado.
- **Simplificação da UX de "Palavras da Semana", Silabador Automático e 40 Figurinhas:** cartão de progresso rumo a 4 palavras, separação silábica automática em Português (`js/syllable-helper.js`), cadastro em lote e biblioteca `js/stickers/` com **40 figurinhas vetoriais infantis em 5 categorias** (*Animais*, *Frutas e Alimentos*, *Natureza*, *Escola e Objetos* e *Casa e Brinquedos*).
- **Redesenho dos SVGs de Interface (`js/ui-icons.js`) e Evolução do Dentinho:** 10 ícones redesenhados em 5 conjuntos (Som, Medalhas 1º–3º, Troféus, Casinha e Botão Roxo) e 5 expressões + piscadas orgânicas + 3 ritmos de fala no mascote Dentinho.
- **Sistema de Tokens `--ui-*` (Pilar 2 — IHC Infantil > 1024px) e Massa Fictícia:** 24 tokens calibrados para projetores e lousas digitais em `css/game.css` (`?v=2.9`) e `css/teacher-panel.css` (`?v=2.11`), além da massa de teste `docs/turma-ficticia-v2.2.json`.

---

## 2. Prioridades Mapeadas para a Próxima Versão (v2.3)

### 2.1. Reforma Visual Mais Profunda (Evolução Estrutural de Cenário e Superfícies)
- **Contexto:** Na `v2.2.0`, o layout recebeu um sistema coordenado de tokens `--ui-*`, sombras táteis e contraste calibrado para projetores, mantendo a estrutura de cartões claros para estabilidade da release.
- **Objetivo para a v2.3:** Realizar uma **reforma visual mais profunda — saindo do fundo branco/simples herdado da v1** — com cenários ilustrados em SVG leves por fase/tema, molduras lúdicas imersivas, maior profundidade cromática e identidade visual escolar contemporânea, preservando a legibilidade a distância na lousa digital (`> 1024px`) e a execução 100% offline.

### 2.2. Banco de Frases e Dicas Prontas Associadas às 40 Figurinhas (`js/stickers/`)
- **Objetivo:** Associar a cada uma das **40 figurinhas vetoriais** já disponíveis em `js/stickers/` (*Animais*, *Frutas e Alimentos*, *Natureza*, *Escola e Objetos* e *Casa e Brinquedos*) sugestões prontas de **dica descritiva (Fase 2)** e **frase contextualizada com lacuna `___` (Fase 3)**, validadas pedagogicamente com a Profª Carla Machado.
- **Benefício Pedagógico:** Quando a professora digitar ou escolher uma palavra que case com qualquer uma das 40 figurinhas (ex.: `CAVALO`, `MAÇÃ`, `ÁRVORE`, `ESCOLA`, `BONECA`), o painel poderá preencher automaticamente sugestão de dica e frase editáveis com 1 toque, reduzindo a zero o tempo de digitação no preparo semanal da aula.

---

## 3. Pendente de Validação e Definição com a Professora Carla Machado

Os itens abaixo dependem de alinhamento pedagógico e validação em sala de aula com a professora regente antes da implementação:

### 3.1. Implementação de Calendário Escolar (Estrutura e Uso Pedagógico)
- **Objetivo:** Definir como um calendário integrado ao jogo ou ao Painel da Professora apoiará a rotina diária da turma (vinculação de listas semanais a datas letivas ou ativação temática em datas comemorativas).
- **Pontos em Aberto:** Definir se a visualização será exclusiva do painel docente ou se haverá quadro didático do dia para as crianças no início da aula.

### 3.2. Expansão de Bancos Nativos Temáticos Além de Saúde Bucal
- **Objetivo:** Expandir `js/word-bank.js` com pacotes temáticos nativos completos (ilustrações SVG, dicas da Fase 2 e frases da Fase 3) selecionáveis pela docente, tais como *Meio Ambiente e Natureza*, *Alimentação Saudável* e *Cultura e Datas Comemorativas*.

### 3.3. Inclusão da Tecla `Ç` no Teclado Virtual da Fase 3
- **Objetivo:** Avaliar a inclusão explícita da tecla `Ç` no teclado virtual da Fase 3 para vocábulos com cedilha (`MAÇÃ`, `PALHAÇO`, `CABEÇA`, `CORAÇÃO`, `ESCOVAÇÃO`), definindo o critério pedagógico entre 1º Ano e 2º Ano.

### 3.4. Chaveamento "Modo 1º Ano" vs. "Modo 2º Ano"
- **Objetivo:** Adicionar seletor de nível no Painel da Professora para acompanhar a progressão da turma ao 2º Ano do Ensino Fundamental (foco em dígrafos `CH`, `LH`, `NH`, `RR`, `SS`, regra contextual de `M` antes de `P` e `B`, frases com dupla lacuna ou exigência estrita de acentuação/cedilha).

---

## 4. Refinamentos Técnicos Complementares (Backlog Interno)

Itens de baixa prioridade mapeados no [RELATORIO_DIAGNOSTICO_V2.2.md](RELATORIO_DIAGNOSTICO_V2.2.md) (Categoria 2 — *Pode ser melhorado*):
- Suporte a palavras compostas hifenizadas (`ARCO-ÍRIS`, `BEIJA-FLOR`, `GUARDA-CHUVA`) no `js/syllable-helper.js` para subdividir automaticamente cada elemento composto;
- Validação com a Profª Carla sobre a divisão silábica padrão de `CÁRIE` (`CÁ-RI-E` vs. `CÁ-RIE`);
- Suavização adicional de rótulos técnicos no painel (`JSON` -> `Cópia de segurança`, uniformização de `"períodos"` no lugar de `"ciclos"`) e inclusão de `@media (prefers-reduced-motion: reduce)` em `css/teacher-panel.css`.

---

## 5. Visão de Longo Prazo (v3.0)

### 5.1. Arquitetura Multi-Turma para Fundamental I (`Escola -> Professora -> Turma`)
- **Descrição:** Evoluir a camada de persistência local para suportar múltiplos perfis hierárquicos (`Escola -> Professora -> Turma -> Temas/Relatórios`), permitindo que o mesmo computador ou lousa digital atenda diferentes professoras e turmas nos turnos matutino e vespertino com isolamento completo de dados.
