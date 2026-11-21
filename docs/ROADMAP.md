# Roadmap e Backlog de Evolução (v2.1.3 -> v2.2 / v3.0)

Este documento organiza o backlog de evolução pedagógica e técnica do projeto **Saúde na Escola: Saúde Bucal**, mantendo como diretriz de plataforma o **foco principal em Desktop e Lousas Digitais** (Windows, macOS e Linux).

Para consultar todas as funcionalidades, o Relatório Pedagógico PDF Offline (`v2.1.3`), as auditorias de segurança e decisões arquiteturais (Mini-ADRs) que **já foram implementadas e entregues até a versão v2.1.3**, acesse o arquivo [../CHANGELOG.md](../CHANGELOG.md).

---

## 1. Prioridades Mapeadas para a v2.2

Itens definidos a partir do uso prático e dos testes de sala de aula para compor o próximo ciclo evolutivo (**v2.2**):

### 1.1. Agrupamento e Comparativo Gráfico por Período Letivo (Bimestre / Trimestre)
- **Objetivo:** Permitir que a professora visualize o resumo individual (por aluno) e consolidado da turma agrupado por **Período Letivo (Bimestre ou Trimestre)**, gerando comparativos gráficos entre ciclos sem precisar apagar o histórico acumulado no `localStorage`.
- **Benefício Pedagógico:** Acompanhamento longitudinal ao longo do ano letivo com preservação integral da série histórica para conselhos de classe e reuniões com famílias.

### 1.2. Simplificação da UX do Gerenciamento de "Palavras da Semana"
- **Objetivo:** Tornar o formulário e o fluxo de cadastro, edição, ativação e visualização das **Palavras da Semana** mais simples, guiados e diretos para professoras sem perfil técnico.
- **Pontos de Evolução Previstos:**
  - Reduzir atrito na separação silábica por hífens (pré-visualização mais clara e ajuda contextual rápida);
  - Tornar mais evidente quando o modo personalizado está ativo ou pronto para ativar (`>= 4 palavras`), sem termos técnicos.

### 1.3. Evolução Futura do Mascote (Dentinho)
- **Objetivo:** Aprimorar em um próximo ciclo as animações avançadas, variedade de expressões faciais/corporais e sincronização visual da fala do mascote Dentinho nas interações do Menu Inicial e das Fases.

### 1.4. Redesenho Completo dos SVGs de Interface Restantes
- **Objetivo:** Atualizar visualmente os ícones de interface que ainda mantêm o traço mais simples das versões iniciais para um redesenho completo alinhado ao padrão ilustrativo infantil moderno:
  - Ícones de **som** (`SOUND_ON` / `SOUND_OFF`);
  - **Medalhas** de pódio (`1º`, `2º` e `3º` lugares);
  - **Troféus** do cabeçalho e dos modais;
  - **Casinha do Menu Inicial**;
  - Ícone do botão roxo **"OUTRA PALAVRA"** / **"NOVOS PARES"**.

---

## 2. Pendente de Validação e Definição com a Professora Carla Machado

Os itens desta seção dependem de alinhamento pedagógico e validação de uso em sala de aula com a professora regente antes de entrarem em desenvolvimento:

### 2.1. Implementação de Calendário Escolar (Estrutura e Uso Pedagógico)
- **Objetivo:** Definir com a professora como um calendário integrado ao jogo ou ao Painel da Professora pode apoiar a rotina diária da turma (ex.: vinculação de atividades por data letiva, planejamento semanal de palavras ou ativação automática de temas em datas comemorativas).
- **Pontos em Aberto para Validação:**
  - O calendário será exibido apenas para a professora no painel de gestão ou também terá uma visualização didática para as crianças no início da aula?
  - Quais marcos do calendário escolar anual devem vir pré-configurados?

### 2.2. Expansão de Temas Além de Saúde Bucal
- **Objetivo:** Expandir o banco nativo do sistema (`js/word-bank.js`) com novos pacotes temáticos completos contendo ilustrações em SVG infantil, dicas descritivas (Fase 2) e frases contextualizadas (Fase 3), mantendo o tema original de Saúde Bucal e o seletor manual para a docente.
- **Temas Candidatos em Estudo:**
  - Meio Ambiente e Natureza;
  - Alimentação Saudável;
  - Cultura Indígena, Consciência Negra e Festas Tradicionais do Calendário Escolar.

### 2.3. Inclusão da Tecla `Ç` no Teclado Virtual da Fase 3
- **Objetivo:** Avaliar a inclusão explícita da tecla `Ç` no teclado virtual da Fase 3 (Escrita Espontânea) e no mini-teclado quando novos temas ou "Palavras da Semana" incluírem vocábulos com cedilha (ex.: `MAÇÃ`, `CABEÇA`, `CORAÇÃO`, `ESCOVAÇÃO`).
- **Critério Pedagógico a Validar:** Definir se, para o 1º e 2º anos, a tecla `Ç` deve ser exigida distintamente da letra `C` na Fase 3 ou se o comportamento deve variar conforme o nível da turma.

### 2.4. Chaveamento "Modo 1º Ano" vs. "Modo 2º Ano"
- **Objetivo:** Acompanhar a progressão da turma para o 2º Ano do Ensino Fundamental adicionando um seletor de nível no Painel da Professora.
- **Escopo Pedagógico Previsto para o Modo 2º Ano:**
  - Desafios focados em dígrafos (`CH`, `LH`, `NH`, `RR`, `SS`) e na regra contextual do uso de `M` antes de `P` e `B`;
  - Evolução da Fase 3 para trabalhar frases com **dupla lacuna** ou validação ortográfica estrita de acentuação e cedilha.

---

## 3. Melhorias Técnicas Previstas (Internas)

Melhorias de engenharia mapeadas durante a evolução da linha **v2.1** que podem ser executadas de forma cirúrgica sem alterar a experiência visual atual:

### 3.1. Refinamento do Comparador Ortográfico para Omissão de Dígrafos (`js/analytics-engine.js`)
- **Contexto Técnico:** Atualmente, `registrarTentativaFase3()` compara a palavra esperada e a tentativa do aluno posição por posição (`índice i`). Quando uma criança omite uma letra de um dígrafo no meio da palavra (por exemplo, digita `SORISO` em vez de `SORRISO`, ou `PASSARO` sem um `S`), o deslocamento de índice faz com que todas as letras subsequentes pareçam trocadas.
- **Solução Prevista:** Implementar alinhamento de sequência leve (distância de edição / *Longest Common Subsequence* por caractere) no `AnalyticsEngine` para isolar exatamente a omissão ou duplicação de letra em dígrafos (`RR`, `SS`, `CH`, `LH`, `NH`, `QU`, `GU`) sem contaminar a análise das letras seguintes da palavra.

### 3.2. Limpeza de Elementos HTML Legados Ocultos (`#p2EmojiCorner` e `#p3EmojiCorner`)
- **Contexto Técnico:** Em `index.html` e `css/game.css`, ainda existem os contêineres vazios `#p2EmojiCorner` (na Fase 2) e `#p3EmojiCorner` (na Fase 3), mantidos com `display: none` por herança da estrutura inicial da v1.0.
- **Solução Prevista:** Remover os dois elementos ociosos do `index.html` e suas regras correspondentes em `css/game.css` após confirmar que nenhum script externo referencia esses IDs.

---

## 4. Visão de Longo Prazo (v3.0)

Visão estratégica para consolidação da plataforma em toda a rede de Ensino Fundamental I:

### 4.1. Arquitetura Multi-Turma para Fundamental I (1º ao 5º Ano)
- **Descrição:** Evoluir a camada de armazenamento local para suportar múltiplos perfis hierárquicos (`Escola -> Professora -> Turma -> Temas/Relatórios`), permitindo que o mesmo equipamento ou lousa digital atenda diferentes professoras e turmas ao longo dos turnos matutino e vespertino com isolamento completo de dados.
