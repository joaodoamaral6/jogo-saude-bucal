# Saúde na Escola: Saúde Bucal — Jogo Educativo Web

Projeto de software educativo desenvolvido para apoiar a alfabetização inicial e o ensino de saúde bucal em turmas do 1º e 2º Ano do Ensino Fundamental, projetado para funcionar em Lousas Digitais (Telas Interativas Touch) e também em celulares e computadores.

---

## 1. Sobre o Projeto e Metodologia de Trabalho

- **Link do Jogo Online (GitHub Pages):** [https://joaodoamaral6.github.io/jogo-saude-bucal/](https://joaodoamaral6.github.io/jogo-saude-bucal/)
- **Repositório:** [https://github.com/joaodoamaral6/jogo-saude-bucal](https://github.com/joaodoamaral6/jogo-saude-bucal)
- **Autor:** João Carlos do Amaral de Oliveira — Estudante de Engenharia de Software (2º Semestre)
- **Professora Parceira (Levantamento de Requisitos e Validação):** Carla Machado (Docente do 1º / 2º Ano)
- **Ferramenta de Apoio ao Desenvolvimento:** Google Antigravity

### Como este projeto foi construído

Sou estudante do **2º semestre de Engenharia de Software** e possuo base em desenvolvimento Front-End com HTML, CSS e JavaScript. Este projeto nasceu de uma demanda real para a Mostra Escolar da turma da professora Carla Machado.

Para conseguir entregar uma ferramenta completa, robusta e adaptada à realidade de sala de aula, utilizei o **Google Antigravity** como assistente de codificação, assumindo na prática o ciclo de engenharia do projeto:
1. **Levantamento de Requisitos com a Cliente:** Conversei diretamente com a professora Carla para entender como as crianças de 6 e 7 anos interagem com a lousa digital e quais conteúdos precisavam ser trabalhados.
2. **Testes Práticos e Avaliação Crítica:** A cada versão gerada, testei o software no computador e no celular, identifiquei bugs de interface, problemas de espaço na tela, comportamentos de botões e pontos onde a experiência poderia melhorar.
3. **Validação Pedagógica Contínua:** Apresentei cada etapa para a professora Carla validar, ajustando regras de pontuação, trocando frases para evitar ambiguidades e garantindo que o jogo fizesse sentido pedagógico.
4. **Estudo do Código:** Mais do que apenas gerar o código, busquei compreender a estrutura por trás de cada seção — como o CSS organiza as zonas da tela, como o JavaScript controla os estados de cada fase e por que determinadas soluções técnicas foram escolhidas.

---

## 2. Problemas Reais Resolvidos na Engenharia do Jogo

Durante a concepção e os testes com a professora, identificamos desafios práticos do uso por crianças pequenas em uma tela interativa:

1. **Alcance Físico na Lousa Digital:** Crianças do 1º ano são baixinhas e não alcançam a parte de cima da lousa interativa. Por isso, toda a tela foi dividida em duas partes: a metade superior serve apenas para visualização (desenhos e frases), enquanto todos os botões, cartas, sílabas e o teclado virtual ficam do meio para baixo.
2. **Toque Simples em vez de Arrastar (*Drag-and-Drop*):** Em telas interativas escolares, arrastar elementos com o dedo costuma falhar. Na Fase 2 (Sílabas), optamos por cliques simples: um toque sobe a sílaba para o espaço vazio; outro toque devolve a sílaba para baixo.
3. **Bloqueio de Gestos Acidentais:** Crianças costumam tocar rápido várias vezes ou segurar o dedo na tela. Usamos `user-select: none`, `touch-action: manipulation` e bloqueamos o menu de clique direito (`contextmenu`) para impedir que a tela dê zoom sozinha ou abra janelas do navegador no meio da aula.
4. **Padronização Visual com SVG (Sem Emojis de Sistema):** Emojis comuns mudam de aparência dependendo do aparelho e às vezes passam um aspecto improvisado. Por isso, todos os desenhos das palavras, medalhas e ícones de botões foram feitos em código `<svg>` diretamente dentro do HTML, garantindo que o visual seja idêntico em qualquer tela e funcione 100% offline.

---

## 3. Estrutura das 3 Fases do Jogo

O jogo possui um Menu Inicial onde a professora ou o aluno pode escolher uma fase específica ou jogar a **Jornada Completa** (as 3 fases em sequência):

### Fase 1: Jogo da Memória (Figura + Palavra)
- Grade com 8 cartas (4 pares sorteados a cada partida).
- O par não é formado por duas figuras iguais, mas sim por **1 carta com o Desenho** e **1 carta com a Palavra escrita** (ex: desenho do dente + palavra `DENTE`). Isso estimula a criança a ler a palavra em vez de apenas decorar cores.

### Fase 2: Construtor de Sílabas
- Trabalha 10 palavras do tema Saúde Bucal (`BOCA`, `DENTE`, `PASTA`, `ESCOVA`, `SORRISO`, `FIO`, `ÁGUA`, `CÁRIE`, `LÍNGUA`, `GENGIVA`).
- Mostra a figura, uma dica de leitura e os espaços das sílabas. Embaixo, mistura as sílabas corretas com **2 sílabas intrusas** para a criança identificar os sons corretos.
- Conta com um banco de **80 dicas diferentes** (8 por palavra) que são sorteadas sem repetição, evitando que os 16 alunos da turma decorem a resposta do colega anterior.

### Fase 3: Escrita Espontânea (Regra Anti-Preguiça)
- Exibe uma frase com lacuna (sorteada de um banco de **80 frases educativas**) e um teclado virtual completo na parte inferior da tela.
- **Tolerância a Acentos:** A criança pode digitar a letra sem acento (ex: apertar `A` na palavra `ÁGUA`) que o sistema reconhece como correto e já preenche com o acento na caixinha.
- **Regra Pedagógica Anti-Preguiça:** Não há botão de "Ver Resposta". Quando a criança aperta em **VERIFICAR**, as letras que ela acertou na posição certa ficam travadas em **verde**, e apenas as letras erradas são limpas para que ela tente descobrir o que falta.

### Ranking Pedagógico da Turma (Noção de Maior e Menor)
- A pontuação utiliza **numerais baixos (escala de 1 a 10)** para se adequar à matemática do 1º ano.
- Ao final da partida, a criança digita seu nome em um mini-teclado na tela.
- O Ranking ordena os alunos da maior para a menor pontuação, exibindo medalhas em SVG para o 1º, 2º e 3º lugares, o numeral da nota e a mesma quantidade de estrelas desenhadas lado a lado para que a criança possa contar visualmente.

---

## 4. Como o Código Está Organizado (`index.html`)

Optamos por concentrar HTML, CSS e JavaScript em um único arquivo (`index.html`) para facilitar o uso na escola: basta copiar um único arquivo no pendrive ou abrir o link, sem precisar instalar nada e sem depender de internet.

1. **CSS (`<style>`):**
   - Define variáveis de cores (`:root`), regras de Flexbox e CSS Grid para posicionar os elementos e botões com efeito 3D.
   - Utiliza `100dvh` (*Dynamic Viewport Height*) e duas regras `@media` separadas: uma para celulares em pé (`portrait`, adaptando os cartões para grades `2x2` e `2x4`) e outra para celulares deitados (`landscape`), sem afetar o visual da tela interativa da escola.
2. **HTML (`<body>`):**
   - Estruturado como uma *Single-Page Application* (SPA): todas as telas (`#screenMenu`, `#screenPhase1`, `#screenPhase2`, `#screenPhase3`) ficam no mesmo documento, e o JavaScript alterna a classe `.active` para mostrar apenas a fase atual.
3. **JavaScript (`<script>`):**
   - **`WORD_BANK`:** Array de objetos que guarda as 10 palavras, suas sílabas, sílabas intrusas, os 80 textos de dicas da Fase 2, as 80 frases de lacuna da Fase 3 e o código SVG de cada ilustração.
   - **Sintetizador de Áudio (`Web Audio API`):** Gera efeitos sonoros de clique, acerto, incentivo e vitória diretamente pelo navegador usando frequências matemáticas (`AudioContext`), sem precisar de arquivos `.mp3` externos.
   - **Objeto `gameState`:** Guarda o estado atual do jogo (fase ativa, estrelas da partida, cartas viradas, letras travadas e travas contra cliques duplos).
   - **Sorteio sem Repetição (*Fisher-Yates* + `localStorage`):** Embaralha os índices das 8 frases de cada palavra e salva a fila no navegador para garantir que as frases não se repitam entre um aluno e outro.

---

## 5. Histórico de Validação e Melhorias Realizadas

Ao longo do desenvolvimento, o software passou por testes contínuos comigo e com a professora Carla Machado:

- **Ajuste de Espaçamento e Ícones:** Substituição de todos os emojis por SVGs desenhados sob medida e ajuste de margens para que a sombra dos botões não encostasse na barra inferior.
- **Correção de Responsividade Mobile:** Ajuste da altura real em celulares (`100dvh`) para que a barra de endereço do navegador não cortasse o rodapé do jogo.
- **Adequação da Pontuação e Reset do Contador:** Mudança da pontuação para numerais baixos e correção do botão "Zerar Ranking" para também zerar imediatamente o contador de estrelas no topo da tela.
- **Criação e Refinamento das 160 Frases:** Ampliação do banco para 80 dicas na Fase 2 e 80 frases na Fase 3, revisando palavras específicas (como `FIO`, `ÁGUA` e `GENGIVA`) para manter uma linguagem 100% adequada às crianças.

---

## 6. Próximos Passos — Proposta de Evolução para o 2º Ano

Como a professora Carla Machado continuará com a mesma turma no **2º Ano** no próximo ano letivo, elaborei uma proposta de evolução do software (validada e aprovada por ela) para que o jogo cresça junto com as crianças:

1. **Mudança de Temas conforme o Calendário Escolar:**
   - Manter a estrutura das 3 fases e permitir trocar o tema ao longo do ano (Semana dos Povos Indígenas em abril, Festa Junina em junho, Consciência Negra em novembro, Meio Ambiente e Animais), contando também com um botão seletor para a professora escolher qualquer tema quando quiser.
2. **Modo 2º Ano (Novos Desafios de Escrita):**
   - Adicionar a opção de alternar entre `"Modo 1º Ano"` e `"Modo 2º Ano"`. No modo de 2º ano, trabalhar frases com duas palavras para completar e focar em dificuldades ortográficas próprias dessa etapa (`CH`, `LH`, `NH`, `RR`, `SS` e uso de `M` antes de `P` e `B`).
3. **Espaço "Palavras da Semana" para a Professora:**
   - Criar uma tela simples onde a professora possa digitar de 6 a 8 palavras que estiver trabalhando no livro de histórias ou no quadro naquela semana, gerando automaticamente o Jogo da Memória, as sílabas e as frases com o conteúdo da aula.
4. **Registro Silencioso de Dúvidas da Turma:**
   - Como é difícil observar cada letra digitada por 16 crianças ao mesmo tempo, o jogo anotará em segundo plano onde ocorreram mais erros (por exemplo, trocas entre `G` e `J` em `"GENGIVA"` ou sílabas com mais tentativas) para exibir um resumo simples ao final da aula, ajudando a professora a saber o que revisar no quadro no dia seguinte.
5. **Avatares Personalizados das Crianças *(Sugestão da Professora Carla)*:**
   - Durante a validação da proposta, a professora sugeriu criar avatares para as crianças. Na versão de 2º ano, cada aluno poderá escolher ou montar seu avatar ao registrar seu nome no Ranking da Turma.

---

## 7. Como Executar o Projeto

1. Acesse diretamente pelo navegador através do link do GitHub Pages:
   - [https://joaodoamaral6.github.io/jogo-saude-bucal/](https://joaodoamaral6.github.io/jogo-saude-bucal/)
2. Ou baixe/clone este repositório e abra o arquivo `index.html` em qualquer navegador (funciona mesmo sem internet):
   ```bash
   git clone https://github.com/joaodoamaral6/jogo-saude-bucal.git
   ```
3. **Dica de Uso na Escola:** Na lousa interativa, pressione `F11` no teclado para colocar o navegador em modo de **Tela Cheia**.
