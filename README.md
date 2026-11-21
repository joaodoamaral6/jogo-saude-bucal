# Saúde na Escola: Saúde Bucal (v2.1)

![Stack HTML5 CSS3 Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-0284C7)
![Execução 100% Offline file://](https://img.shields.io/badge/Execucao-100%25%20Offline%20(file%3A%2F%2F)-16A34A)
![Alinhamento BNCC Fundamental I](https://img.shields.io/badge/Pedagogico-BNCC%20Fundamental%20I-D97706)
![Privacidade LGPD Local-First](https://img.shields.io/badge/Privacidade-LGPD%20Local--First-7C3AED)

Aplicação web educativa desenvolvida para apoiar o processo de alfabetização inicial e a conscientização sobre higiene bucal no Ensino Fundamental I (1º e 2º Ano). O software foi projetado com foco em **Lousas Digitais Interativas (Touch)** conectadas via HDMI/USB em ambiente escolar Linux e Windows, mantendo responsividade completa para computadores e dispositivos móveis.

- **Aplicação Online (GitHub Pages):** [https://joaodoamaral6.github.io/jogo-saude-bucal/](https://joaodoamaral6.github.io/jogo-saude-bucal/)
- **Repositório Oficial:** [https://github.com/joaodoamaral6/jogo-saude-bucal](https://github.com/joaodoamaral6/jogo-saude-bucal)
- **Autor e Engenheiro de Software:** João Carlos do Amaral de Oliveira
- **Especialista de Domínio e Validação Pedagógica:** Profª Carla Machado (Ensino Fundamental I)

---

## 1. Visão Geral

O projeto **Saúde na Escola: Saúde Bucal** une Engenharia de Software e prática pedagógica de sala de aula em uma arquitetura **100% Offline-First e Zero-Dependency**.

- **Propósito Pedagógico:** Conduzir alunos em fase de alfabetização por uma jornada gradual de complexidade linguística — partindo da associação visual entre figura e palavra escrita (Fase 1), passando pela consciência fonológica e montagem silábica com distratores (Fase 2), até a escrita alfabética espontânea em contexto frasal com feedback formativo letra a letra (Fase 3). Paralelamente, oferece à docente um motor silencioso de análise diagnóstica capaz de mapear dificuldades silábicas e trocas ortográficas da turma sem interromper a dinâmica lúdica da aula.
- **Propósito Técnico:** Garantir execução imediata em computadores escolares sem acesso à internet diretamente pelo protocolo `file://` (duplo clique em `index.html`), utilizando módulos JavaScript encapsulados em IIFEs sob o namespace global `window.SaudeEscola`, ilustrações vetoriais 100% em SVG infantil (zero emojis nativos de sistema), síntese sonora procedural via Web Audio API e persistência local resiliente com exportação e importação de backup JSON sanitizado.

---

## 2. Principais Funcionalidades (Versão 2.1)

- **Três Fases Pedagógicas Progressivas + Jornada Completa:**
  - **Fase 1 (Jogo da Memória):** Associação de leitura entre 1 carta com ilustração SVG e 1 carta exclusivamente com a palavra em caixa alta (4 pares por partida).
  - **Fase 2 (Construtor de Sílabas):** Banco de 80 dicas descritivas sem repetição (fila *Fisher-Yates*) e montagem por toque simples com sílabas corretas embaralhadas junto a 2 sílabas intrusas.
  - **Fase 3 (Escrita Espontânea):** Banco de 80 frases com lacuna, teclado virtual na metade inferior da tela, tolerância a acentos via normalização Unicode (`NFD`) e **Regra Anti-Preguiça** (mantém fixas em verde as letras corretas e limpa apenas as incorretas).
  - **Seletor de Questões (3, 5 ou 10):** Ajuste rápido da duração das Fases 2 e 3 no menu inicial para adequar o tempo de fila em sala de aula.
- **Modo Aula vs. Modo Livre (Mostra Escolar):**
  - No **Modo Aula**, o sistema exibe sugestões rápidas com os nomes cadastrados da turma no modal final e consolida estatísticas diagnósticas por sessão.
  - No **Modo Livre**, visitantes e alunos jogam livremente sem gravar sessões no histórico diagnóstico da turma.
- **Painel da Professora e "Palavras da Semana":**
  - Acesso protegido por pressão longa de 3 segundos no ícone de engrenagem do menu inicial.
  - Cadastro de **4 a 12 palavras personalizadas** com separação silábica por hífen, dica e frase com lacuna (`___`), adaptando automaticamente as 3 fases do jogo ao conteúdo trabalhado na semana (com geração automática de sílabas intrusas e pareamento na Fase 1 por Dica/Frase ou Sílaba Inicial).
- **Motor Silencioso de Análise e Gráfico de Evolução por Fase:**
  - Captura em segundo plano de tentativas, acertos de primeira tentativa, sílabas com maior índice de confusão e trocas ortográficas recorrentes (`G/J`, `M/N`, `S/Z`, `C/S/Ç`, `P/B`, `T/D`, `F/V`, `L/U`, `C/G`).
  - Painel visual com indicadores separados para **Fase 1 (Memória)**, **Fase 2 (Sílabas)** e **Fase 3 (Escrita)**, incluindo gráfico diário de barras verticais agrupadas por fase e filtro por aluno ou visão consolidada da turma.
- **Resiliência de Dados com Backup JSON Sanitizado:**
  - Exportação e restauração local de todo o banco da turma (`saudeEscola_v2_dados` e `saudeBucalRanking`) em arquivo `.json`, com validação estrita de esquema e sanitização contra XSS.
- **IHC para Lousa Digital Touch (Confirmação em 2 Toques):**
  - Ergonomia projetada para a estatura de crianças de 6 a 7 anos (controles interativos na metade inferior da tela) e proteção contra toques acidentais por confirmação em 2 toques rápidos com reset automático nas ações destrutivas (`MENU INICIAL` durante partida ativa, `ZERAR RANKING`, exclusão de aluno e limpeza de dados).
- **Compatibilidade Responsiva para Celulares (iOS e Android) e Tablets:**
  - Além do uso principal na lousa digital (`> 1024px`), o jogo conta com layout mobile fluido (retrato e paisagem, de `360px` a `430px+`) compatível com **iOS Safari** e **Android Chrome**, incluindo suporte a *safe areas* (`viewport-fit=cover` + `env(safe-area-inset-*)`), prevenção de zoom automático em formulários, teclado virtual ergonômico e acesso completo ao Painel da Professora em telas pequenas.
- **Amplificação Segura de Áudio (`Web Audio API`):**
  - Cadeia master com `DynamicsCompressorNode` (`threshold: -18dB`, `ratio: 6`) e `GainNode` (`1.35`) calibrada para alto-falantes de TVs e lousas HDMI em salas de aula ruidosas, sem distorção (*clipping*).

---

## 3. Estrutura de Diretórios

```text
jogo-escola/
├── index.html                  # Ponto de entrada SPA (100% compatível com file://)
├── README.md                   # Vitrine executiva e visão geral do projeto
├── CHANGELOG.md                # Histórico de versões e Registro de Decisões (Mini-ADRs)
├── GEMINI.md                   # Diretrizes de arquitetura, escopo e padrões de engenharia
├── css/
│   ├── game.css                # Estilos principais, layout de lousa touch e responsividade 100dvh
│   └── teacher-panel.css       # Estilos do Painel da Professora e gráficos de evolução
├── js/
│   ├── storage-service.js      # Persistência localStorage, sanitização, Palavras da Semana e Backup JSON
│   ├── analytics-engine.js     # Motor silencioso de captura ortográfica/silábica e agregação por fase
│   ├── evolution-view.js       # Renderização dos cards diagnósticos e gráfico de barras por fase
│   ├── teacher-panel-ui.js     # Interface do Painel da Professora (Turma, Palavras, Evolução e Backup)
│   ├── word-bank.js            # Banco padrão (10 palavras, 160 textos educativos e SVGs infantis)
│   ├── audio-engine.js         # Sintetizador Web Audio API com compressor dinâmico e ganho master
│   ├── ranking-service.js      # Modal de Ranking, mini-teclado virtual com tecla ESPAÇO e sugestões
│   └── game-engine.js          # Máquina de estados central das Fases 1, 2 e 3 e navegação SPA
└── docs/
    ├── REQUISITOS.md           # Especificação de Atores, RFs, RNFs, Regras de Negócio e Casos de Uso
    ├── ARQUITETURA.md          # Arquitetura modular IIFE, fluxo de dados, schemas JSON e segurança
    ├── PEDAGOGICO.md           # Alinhamento com a BNCC e guia prático de uso para a professora
    └── ROADMAP.md              # Backlog validado, melhorias técnicas internas e evolução v2.2/v3.0
```

---

## 4. Como Executar

### 4.1. Execução Local 100% Offline (Via Protocolo `file://`)
Não é necessário instalar Node.js, bancos de dados ou servidores web locais:
1. Clone este repositório ou extraia a pasta do projeto em qualquer computador ou pendrive:
   ```bash
   git clone https://github.com/joaodoamaral6/jogo-saude-bucal.git
   ```
2. Dê duplo clique diretamente sobre o arquivo `index.html` para abri-lo em qualquer navegador moderno (Chrome, Edge, Firefox ou Safari).
3. **Dica para Lousa Digital:** Pressione `F11` no navegador para ativar o modo **Tela Cheia**, maximizando a área de alcance físico das crianças.

### 4.2. Execução Online (GitHub Pages)
Acesse diretamente pelo navegador da lousa interativa, computador ou smartphone:
- [https://joaodoamaral6.github.io/jogo-saude-bucal/](https://joaodoamaral6.github.io/jogo-saude-bucal/)

---

## 5. Índice de Documentação Técnica e Pedagógica

Para consultar as especificações detalhadas de engenharia de software, arquitetura e domínio pedagógico do projeto, acesse os documentos abaixo:

| Documento | Descrição |
| :--- | :--- |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de entregas da versão v2.1 e Registro de Decisões de Arquitetura (ADR-01 a ADR-06). |
| [docs/REQUISITOS.md](docs/REQUISITOS.md) | Especificação de Requisitos Funcionais (`RF`), Não-Funcionais (`RNF`), Regras de Negócio (`RN`) e Diagrama de Casos de Uso. |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Diagramas da arquitetura modular (`window.SaudeEscola`), fluxo de dados analíticos, modelo de dados do `localStorage` e garantias de segurança/IHC. |
| [docs/PEDAGOGICO.md](docs/PEDAGOGICO.md) | Matriz de alinhamento com habilidades da BNCC (Ensino Fundamental I) e manual prático de operação para a professora. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Planejamento de evolução futura, itens em validação com a professora regente e melhorias técnicas mapeadas. |
