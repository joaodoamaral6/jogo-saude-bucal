# Saúde na Escola: Saúde Bucal (v2.2.0)

![Stack HTML5 CSS3 Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-0284C7)
![Execução 100% Offline file://](https://img.shields.io/badge/Execucao-100%25%20Offline%20(file%3A%2F%2F)-16A34A)
![Segurança CSP Estrito Offline](https://img.shields.io/badge/Seguranca-CSP%20Estrito%20%2B%20DomSafe-0D9488)
![Alinhamento BNCC Fundamental I](https://img.shields.io/badge/Pedagogico-BNCC%20Fundamental%20I-D97706)
![Privacidade LGPD Local-First](https://img.shields.io/badge/Privacidade-LGPD%20Local--First-7C3AED)

Aplicação web educativa desenvolvida para apoiar o processo de alfabetização inicial e a conscientização sobre higiene bucal no Ensino Fundamental I (1º e 2º anos). O software tem **foco principal em Desktop e Lousas Digitais Interativas (Touch)** em **Windows (padrão das lousas escolares), macOS e Linux** (`> 1024px`), mantendo uma camada responsiva mobile secundária apenas para visualização de demonstração.

- **Aplicação Online (GitHub Pages):** [https://joaodoamaral6.github.io/jogo-saude-bucal/](https://joaodoamaral6.github.io/jogo-saude-bucal/)
- **Repositório Oficial:** [https://github.com/joaodoamaral6/jogo-saude-bucal](https://github.com/joaodoamaral6/jogo-saude-bucal)
- **Autor e Engenheiro de Software:** João Carlos do Amaral de Oliveira
- **Especialista de Domínio e Validação Pedagógica:** Profª Carla Machado (Ensino Fundamental I)

---

## 1. Visão Geral

O projeto **Saúde na Escola: Saúde Bucal** une Engenharia de Software e prática pedagógica de sala de aula em uma arquitetura **100% Offline-First e Zero-Dependency**.

- **Propósito Pedagógico:** Conduzir alunos em fase de alfabetização por uma jornada gradual de complexidade linguística — partindo da associação visual entre figura e palavra escrita (Fase 1), passando pela consciência fonológica e montagem silábica com distratores (Fase 2), até a escrita alfabética espontânea em contexto frasal com feedback formativo letra a letra (Fase 3). Paralelamente, oferece à docente um motor silencioso de análise diagnóstica capaz de mapear dificuldades silábicas e trocas ortográficas da turma ao longo dos bimestres ou trimestres sem interromper a dinâmica lúdica da aula.
- **Propósito Técnico:** Garantir execução imediata em lousas digitais e computadores escolares sem acesso à internet diretamente pelo protocolo `file://` (duplo clique em `index.html`), utilizando **20 módulos JavaScript** encapsulados em IIFEs sob o namespace global `window.SaudeEscola`, blindagem anti-XSS via `DomSafe` sob **Content-Security-Policy (CSP) estrito offline**, ilustrações vetoriais 100% em SVG infantil (zero emojis nativos de sistema), síntese sonora procedural via Web Audio API e persistência local resiliente com backup JSON sanitizado e relatório pedagógico em PDF offline.

---

## 2. Principais Funcionalidades (Versão 2.2.0)

- **Segurança Estrita (CSP Offline + `DomSafe`):**
  - Política `<meta http-equiv="Content-Security-Policy">` estrita (`default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; ...`) 100% compatível com `file://` e GitHub Pages.
  - Zero handlers inline (`on*=`), zero `style=` inline, zero `innerHTML`/`outerHTML`/`eval()`, sanitização de SVGs via `DOMParser` + allowlist (`js/dom-safe.js`) e proteção contra *prototype pollution* em dicionários e backups JSON.
- **Três Fases Pedagógicas Progressivas + Jornada Completa:**
  - **Fase 1 (Jogo da Memória):** Associação de leitura entre 1 carta com estímulo visual/contextual (ilustração SVG, figurinha, dica ou sílaba inicial) e 1 carta exclusivamente com a palavra em caixa alta (4 pares por partida), avaliada por **tempo médio de conclusão (em segundos)**.
  - **Fase 2 (Construtor de Sílabas):** Banco de 80 dicas descritivas sem repetição (fila *Fisher-Yates*) e montagem por toque simples com sílabas corretas embaralhadas junto a 2 sílabas intrusas.
  - **Fase 3 (Escrita Espontânea):** Banco de 80 frases com lacuna, teclado virtual na metade inferior da tela, tolerância a acentos via normalização Unicode (`NFD`), **Regra Anti-Preguiça** e suporte a frase com lacuna, pista ou ditado em sala no modo personalizado.
  - **Seletor de Questões (3, 5 ou 10):** Ajuste rápido da duração das Fases 2 e 3 no Menu Inicial.
- **Mascote Interativo Dentinho (`js/mascot-controller.js`) e Novos Ícones Vetoriais (`js/ui-icons.js`):**
  - Voz única no Menu Inicial, piscadas orgânicas automáticas, **5 estados expressivos** (`is-waving`, `is-celebrating`, `is-triumph`, `is-encouraging`, `is-curious`) e 3 cadências de boca falando (`.is-talking`, `.is-talking-excited`, `.is-talking-calm`) com `transform-box: fill-box` e suporte a `prefers-reduced-motion: reduce`.
  - Catálogo redesenhado com **10 ícones vetoriais infantis** em 5 conjuntos (Som ligado/mudo, Medalhas de 1º/2º/3º lugar, Troféus de cabeçalho/modal/ranking, Casinha e botão roxo `"OUTRA PALAVRA"` / `"NOVOS PARES"`).
- **UX Simplificada de "Palavras da Semana", Silabador Automático e 40 Figurinhas Vetoriais:**
  - Cartão visual de progresso rumo ao mínimo de **4 palavras** (até 12) com botão de ativação imediata nas 3 fases.
  - **Separador automático de sílabas em Português (`js/syllable-helper.js`)** com pré-visualização ao vivo em blocos táteis, ajuste manual e **cadastro ágil em lote** (várias palavras separadas por vírgula, ponto e vírgula ou quebra de linha).
  - **Biblioteca com 40 figurinhas vetoriais infantis em 5 categorias (`js/stickers/`):** *Animais (8)*, *Frutas e Alimentos (8)*, *Natureza (8)*, *Escola e Objetos (8)* e *Casa e Brinquedos (8)*, com correspondência automática enquanto a professora digita (incluindo plural/singular) e galeria de seleção manual.
- **Agrupamento e Comparativo por Período Letivo (Bimestre / Trimestre) + Alinhador LCS:**
  - Módulo `js/period-service.js` permitindo alternar entre **Bimestres (4 períodos)** e **Trimestres (3 períodos)** com datas editáveis e comparativo gráfico longitudinal sem apagar o histórico acumulado.
  - Comparador ortográfico na Fase 3 refinado por **distância de edição / LCS (`analisarEscritaFase3`)** em `js/analytics-engine.js`, isolando omissões em dígrafos (`RR`, `SS`, `CH`, `LH`, `NH`, `QU`, `GU`), duplicações e 9 pares fonéticos/ortográficos (`G/J`, `M/N`, `S/Z`, `C/S/Ç`, `P/B`, `T/D`, `F/V`, `L/U`, `C/G`).
- **Relatório Pedagógico PDF Offline (`@media print`), Anotações e Backup JSON:**
  - Impressão A4 100% offline (`js/report-print.js`) com suporte a recorte por período letivo e filtro por aluno ou turma completa, tabela **Aluno por Aluno** e **Anotações da Professora**.
  - Massa de teste oficial (`docs/turma-ficticia-v2.2.json`) com 7 alunos, 6 Palavras da Semana ilustradas, 24 sessões em 2 bimestres e 4 anotações pronta para importação via `file://`.
- **Sistema de Tokens `--ui-*` para Lousas Digitais (`> 1024px`) e Áudio Calibrado:**
  - **24 tokens CSS `--ui-*`** calibrados para salas iluminadas e projetores, foco visível (`:focus-visible`), confirmação em 2 toques e cadeia Web Audio API com `DynamicsCompressorNode` + `GainNode` master (`1.35`).

---

## 3. Estrutura de Diretórios

```text
jogo-escola/
├── index.html                        # Ponto de entrada SPA com CSP estrito (100% offline via file://)
├── .gitignore                        # Ignora releases/ locais e arquivos *.zip
├── README.md                         # Vitrine executiva e visão geral do projeto
├── CHANGELOG.md                      # Histórico de versões e Registro de Decisões (ADR-01 a ADR-16)
├── GEMINI.md                         # Diretrizes de arquitetura, pilares de segurança/IHC e governança
├── css/
│   ├── game.css                      # Tokens --ui-*, estilos das fases, Dentinho, lousa (>1024px) e mobile
│   └── teacher-panel.css             # Estilos do Painel da Professora, figurinhas, períodos e @media print
├── js/
│   ├── dom-safe.js                   # Utilitários DOM anti-XSS e parser/sanitizador SVG (DomSafe)
│   ├── period-service.js             # Gestão e validação de períodos letivos (Bimestres / Trimestres)
│   ├── stickers/
│   │   ├── animais.js                # 8 figurinhas vetoriais infantis — Animais
│   │   ├── frutas.js                 # 8 figurinhas vetoriais infantis — Frutas e Alimentos
│   │   ├── natureza.js               # 8 figurinhas vetoriais infantis — Natureza
│   │   ├── escola.js                 # 8 figurinhas vetoriais infantis — Escola e Objetos
│   │   ├── brinquedos.js             # 8 figurinhas vetoriais infantis — Casa e Brinquedos
│   │   └── index.js                  # Catálogo central e motor de correspondência automática (Stickers)
│   ├── storage-service.js            # Persistência localStorage, sanitização, anotações e Backup JSON
│   ├── analytics-engine.js           # Motor diagnóstico silencioso, alinhador LCS e comparativo por período
│   ├── evolution-view.js             # Gráficos por dia/período, tabela Aluno por Aluno e anotações
│   ├── report-print.js               # Relatório pedagógico imprimível / PDF offline (@media print A4)
│   ├── syllable-helper.js            # Separador automático de sílabas em Português e extrator em lote
│   ├── teacher-panel-ui.js           # Interface do Painel da Professora (Turma, Palavras da Semana, Evolução)
│   ├── ui-icons.js                   # Catálogo de 10 ícones vetoriais redesenhados de interface (UiIcons)
│   ├── word-bank.js                  # Banco padrão (10 palavras, 80 dicas, 80 frases e SVGs infantis)
│   ├── mascot-controller.js          # Controlador expressivo (5 humores, piscadas e fala) do Dentinho
│   ├── audio-engine.js               # Sintetizador Web Audio API com compressor dinâmico e ganho master
│   ├── ranking-service.js            # Modal de Ranking, medalhas vetoriais, mini-teclado e sugestões
│   └── game-engine.js                # Máquina de estados central das Fases 1, 2 e 3 e navegação SPA
└── docs/
    ├── FUNCIONALIDADES_V2.2.md       # Mapeamento funcional completo da v2.2 e fundamentação BNCC/MEC/IHC
    ├── RELATORIO_DIAGNOSTICO_V2.2.md # Relatório diagnóstico pré-release das auditorias de Segurança e BNCC
    ├── turma-ficticia-v2.2.json      # Massa de teste com 7 alunos, 6 palavras com figurinhas e 24 sessões
    ├── REQUISITOS.md                 # Especificação de Atores, RFs, RNFs, Regras de Negócio e Casos de Uso
    ├── ARQUITETURA.md                # Arquitetura modular IIFE, fluxo de dados, schemas JSON e segurança
    ├── PEDAGOGICO.md                 # Alinhamento com a BNCC e guia prático de uso para a professora
    └── ROADMAP.md                    # Backlog validado, prioridades v2.3 e evolução v3.0
```

---

## 4. Como Executar

### 4.1. Execução Local 100% Offline (Via Protocolo `file://`)
Não é necessário instalar Node.js, bancos de dados ou servidores web locais:
1. Clone este repositório ou extraia o pacote da versão em qualquer computador ou pendrive:
   ```bash
   git clone https://github.com/joaodoamaral6/jogo-saude-bucal.git
   ```
2. Dê duplo clique diretamente sobre o arquivo `index.html` para abri-lo em qualquer navegador moderno (Chrome, Edge, Firefox ou Safari em Windows, macOS ou Linux).
3. **Dica para Lousa Digital:** Pressione `F11` no navegador para ativar o modo **Tela Cheia**, maximizando a área de alcance físico das crianças.
4. **Teste Rápido com Turma Fictícia:** Segure a engrenagem no canto superior direito por **3 segundos**, clique em **`Importar JSON`** na aba *Turma e Modo* e selecione `docs/turma-ficticia-v2.2.json`.

### 4.2. Execução Online (GitHub Pages)
Acesse diretamente pelo navegador da lousa interativa ou computador:
- [https://joaodoamaral6.github.io/jogo-saude-bucal/](https://joaodoamaral6.github.io/jogo-saude-bucal/)

---

## 5. Índice de Documentação Técnica e Pedagógica

| Documento | Descrição |
| :--- | :--- |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de entregas até a v2.2.0 e Registro de Decisões de Arquitetura (`ADR-01` a `ADR-16`). |
| [docs/FUNCIONALIDADES_V2.2.md](docs/FUNCIONALIDADES_V2.2.md) | Documentação funcional completa da v2.2.0 com fundamentação em IHC Infantil, BNCC e MEC. |
| [docs/RELATORIO_DIAGNOSTICO_V2.2.md](docs/RELATORIO_DIAGNOSTICO_V2.2.md) | Diagnóstico estruturado das auditorias de Segurança/CSP e Português/BNCC/IHC em 4 categorias. |
| [docs/turma-ficticia-v2.2.json](docs/turma-ficticia-v2.2.json) | Backup JSON de demonstração com 7 alunos, 2 bimestres de histórico e 6 palavras com figurinhas. |
| [docs/REQUISITOS.md](docs/REQUISITOS.md) | Especificação de Requisitos Funcionais (`RF`), Não-Funcionais (`RNF`), Regras de Negócio (`RN`) e Diagrama de Casos de Uso. |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Diagramas da arquitetura modular (`window.SaudeEscola`), fluxo de dados analíticos e modelo de armazenamento. |
| [docs/PEDAGOGICO.md](docs/PEDAGOGICO.md) | Matriz de alinhamento com habilidades da BNCC (Ensino Fundamental I) e manual prático para a professora. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Planejamento pós-v2.2.0 (reforma visual profunda, banco de frases para as 40 figurinhas, itens Profª Carla e v3.0). |
