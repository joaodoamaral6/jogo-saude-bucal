# Domínio Pedagógico, Alinhamento BNCC e Guia da Professora (v2.1)

Este documento apresenta a fundamentação pedagógica do software **Saúde na Escola: Saúde Bucal**, sua matriz de alinhamento com a **Base Nacional Comum Curricular (BNCC — Ensino Fundamental I)** e o guia prático de operação do **Painel da Professora**.

---

## 1. Matriz de Alinhamento com a BNCC (Ensino Fundamental I)

O jogo foi desenhado para apoiar a transição entre a hipótese pré-silábica/silábica e a escrita alfabética no **1º e 2º Ano do Ensino Fundamental**, integrando Língua Portuguesa, Ciências da Natureza e Matemática:

| Módulo / Funcionalidade do Jogo | Código BNCC | Componente e Ano | Habilidade Oficial da BNCC | Como o Software Trabalha a Habilidade |
| :--- | :---: | :--- | :--- | :--- |
| **Fase 1: Jogo da Memória** *(Figura/Dica + Palavra Escrita)* | **EF01LP08** **EF12LP01** | Língua Portuguesa (1º e 2º Ano) | Relacionar elementos sonoros (sílabas, fonemas, partes de palavras) com sua representação escrita; ler palavras novas com precisão na decodificação. | Cada par exige associar 1 carta ilustrativa (ou pista textual/silábica no modo Palavras da Semana) a 1 carta contendo **exclusivamente a palavra escrita em CAIXA ALTA**, impedindo a mera memorização visual de desenhos iguais. |
| **Fase 2: Construtor de Sílabas** *(Sílabas + 2 Intrusas)* | **EF01LP06** **EF01LP09** **EF02LP02** | Língua Portuguesa (1º e 2º Ano) | Segmentar oralmente palavras em sílabas; comparar palavras identificando semelhanças e diferenças entre sons de sílabas iniciais, mediais e finais; segmentar palavras em sílabas e remover/substituir sílabas. | A criança lê/ouve a dica descritiva e monta a palavra tocando nas sílabas corretas em meio a **2 sílabas intrusas**. Ao errar, permanecem fixas as sílabas já acertadas, reduzindo a frustração e focando a atenção apenas na sílaba divergente. |
| **Fase 3: Escrita Espontânea** *(Frase com Lacuna + Regra Anti-Preguiça)* | **EF01LP02** **EF01LP07** **EF02LP01** | Língua Portuguesa (1º e 2º Ano) | Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética — usando letras/grafemas que representem fonemas; identificar fonemas e sua representação por letras. | O aluno completa a palavra ausente dentro de uma frase contextualizada usando o teclado virtual `A-Z`. A **Regra Anti-Preguiça** trava em verde as letras corretas e apaga apenas as incorretas, promovendo autorreflexão fonológica letra a letra. |
| **Motor Silencioso de Trocas Ortográficas** (`AnalyticsEngine`) | **EF02LP03** **EF02LP04** **EF02LP05** | Língua Portuguesa (2º Ano) | Ler e escrever palavras com correspondências regulares diretas entre letras e fonemas (`F/V`, `T/D`, `P/B`) e contextuais (`C/QU`, `G/GU`, `R/RR`, `S/SS`, `M` antes de `P` e `B`). | Mapeia em segundo plano as trocas fonológicas e ortográficas realizadas pelos alunos na Fase 3 (`G/J`, `M/N`, `S/Z`, `C/S/Ç`, `P/B`, `T/D`, `F/V`, `L/U`, `C/G`), entregando à docente um diagnóstico pronto com exemplos reais para revisão no quadro. |
| **Vocabulário Padrão de Saúde Bucal** *(160 Textos Educativos)* | **EF01CI03** | Ciências (1º Ano) | Discutir as razões pelas quais os hábitos de higiene do corpo (como lavar as mãos e escovar os dentes) são necessários para a manutenção da saúde. | Trabalha 10 conceitos fundamentais (`BOCA`, `DENTE`, `PASTA`, `ESCOVA`, `SORRISO`, `FIO`, `ÁGUA`, `CÁRIE`, `LÍNGUA`, `GENGIVA`) por meio de 80 dicas e 80 frases educativas validadas pedagogicamente. |
| **Ranking da Turma e Contagem de Estrelas** | **EF01MA01** **EF01MA05** | Matemática (1º Ano) | Utilizar números naturais como indicador de quantidade ou de ordem; comparar números naturais de até duas ordens em situações cotidianas. | Utiliza pontuação em escala baixa com estrelas desenhadas lado a lado para contagem visual um a um e ordenação explícita **do Maior para o Menor**. |

---

## 2. Guia Prático de Uso para a Professora

### 2.1. Como Abrir o Painel da Professora
1. Na tela do **Menu Inicial**, localize o botão discreto de **engrenagem** no canto superior direito do cartão principal (`SORRISO BRILHANTE!`).
2. **Toque e segure o botão por 3 segundos contínuos** (ou clique e segure com o mouse).
3. Essa trava de 3 segundos existe para impedir que as crianças entrem nas configurações acidentalmente durante a aula na lousa digital.

---

### 2.2. Aba 1: Turma, Modo de Operação e Backup JSON

#### A) Alternar entre Modo Aula e Modo Livre
- **Modo Aula (Recomendado para sala de aula):** Ativa a coleta silenciosa de estatísticas diagnósticas por sessão e exibe os botões rápidos com os nomes dos alunos da turma na hora de salvar no Ranking.
- **Modo Livre (Recomendado para Mostra Escolar ou recreação):** Desativa a gravação de estatísticas diagnósticas e oculta a lista da turma no Ranking, permitindo que visitantes joguem livremente sem misturar dados ao histórico da turma.

#### B) Cadastrar Alunos no Padrão LGPD Escolar (`Nome + Inicial`)
Para proteger a privacidade das crianças na tela compartilhada da lousa digital, recomenda-se cadastrar cada aluno com o **primeiro nome seguido da inicial do sobrenome**:
- **Cadastro Individual:** Digite no campo, por exemplo, `Ana J.` e toque em **Adicionar**.
- **Cadastro em Lote:** Toque em **Adicionar vários alunos de uma vez**, digite os nomes separados por vírgula ou um por linha (ex.: `Ana J., Pedro M., Lucas S., Sofia R.`) e confirme.
- **Exclusão Segura (2 Toques):** Para remover um aluno da lista, toque no ícone de lixeira ao lado do nome e, em seguida, toque novamente em **`Confirmar?`** dentro de 3 segundos.

#### C) Realizar Backup e Restauração dos Dados (`.json`)
Como os dados ficam salvos diretamente no navegador da lousa ou computador utilizado, utilize o card **Backup dos Dados** na parte inferior da Aba 1 sempre que quiser guardar uma cópia de segurança em um pendrive ou transferir a turma para outro computador:
1. **Exportar Backup (.json):** Baixa automaticamente um arquivo chamado `backup-saude-escola-AAAA-MM-DD.json` contendo a lista da turma, as Palavras da Semana, todo o histórico de evolução e o Ranking.
2. **Importar Backup (.json):** Permite selecionar um arquivo `.json` salvo anteriormente. O sistema valida e sanitiza todos os registros automaticamente antes de restaurar os dados na tela.

---

### 2.3. Aba 2: Configurando as "Palavras da Semana"

Este recurso permite adaptar as 3 fases do jogo para qualquer conteúdo trabalhado na semana (histórias infantis, datas comemorativas, Ciências, etc.):

1. **Cadastrar as Palavras (Mínimo de 4 e Máximo de 12):**
   - **Palavra separada por sílabas:** Digite a palavra separando cada sílaba com hífen (ex.: `CA-VA-LO`, `BO-NE-CA`, `SOL`). O sistema gera automaticamente a palavra completa e escolhe sílabas intrusas adequadas para a Fase 2.
   - **Dica (Fase 2):** Escreva uma pista curta que ajude a criança a descobrir a palavra (ex.: `"ANIMAL QUE CORRE NO CAMPO E FAZ POCOTÓ."`).
   - **Frase com lacuna (Fase 3):** Escreva uma frase usando `___` no lugar da palavra (ex.: `"O ___ CORREU PELA FAZENDA."`). Caso você escreva a palavra inteira na frase, o sistema a converte automaticamente em `___`.
2. **Escolher o Modo da Fase 1 (Jogo da Memória):**
   - **Palavra + Dica/Frase:** Cada par na Fase 1 será formado por 1 carta com a Palavra e 1 carta com a Dica cadastrada (estimula a leitura de frases curtas).
   - **Palavra + Sílaba Inicial:** Cada par será formado por 1 carta com a Palavra e 1 carta destacando a primeira sílaba em tamanho grande (ideal para turmas no início da consciência silábica).
3. **Ativar no Jogo:**
   - Após cadastrar pelo menos **4 palavras**, marque a chave **"Usar Palavras da Semana no jogo"**. Um selo indicativo (`PALAVRAS DA SEMANA ATIVAS`) aparecerá no Menu Inicial e no cabeçalho das Fases 1, 2 e 3.

---

### 2.4. Aba 3: Interpretando o Painel e o Gráfico de Evolução por Fase

Na aba **Evolução**, a professora pode analisar o desempenho coletivo (**Toda a turma**) ou selecionar um **Aluno específico** e a **Data de referência**:

1. **Cards de Desempenho por Fase (`Fase 1: Memória`, `Fase 2: Sílabas`, `Fase 3: Escrita`):**
   - Permitem identificar rapidamente em qual etapa do processo de alfabetização a criança ou a turma apresenta maior segurança ou necessidade de reforço:
     - **Taxa alta na Fase 1, mas baixa na Fase 2:** O aluno reconhece globalmente a palavra, mas ainda precisa de apoio na segmentação e consciência silábica.
     - **Taxa alta na Fase 2, mas baixa na Fase 3:** O aluno compreende a estrutura silábica, mas enfrenta dúvidas ortográficas na escrita alfabética espontânea (letra por letra).
2. **Gráfico Diário de Evolução por Fase:**
   - Exibe barras verticais agrupadas para cada dia letivo com atividades registradas:
     - **Barra Azul (`F1`):** Taxa de acerto na Fase 1 (Memória).
     - **Barra Amarela (`F2`):** Taxa de acerto na Fase 2 (Sílabas).
     - **Barra Verde (`F3`):** Taxa de acerto na Fase 3 (Escrita).
   - Permite visualizar a curva de evolução da turma ao longo das semanas.
3. **Dúvidas Ortográficas, Sílabas com Mais Dúvidas e Palavras para Reforçar:**
   - Lista as trocas ortográficas reais detectadas na Fase 3 (ex.: `Troca G / J` com o exemplo `GENGIVA (J no lugar de G)`), as sílabas mais confundidas na Fase 2 e as palavras que exigiram mais tentativas, oferecendo um roteiro objetivo para a revisão no quadro no início da aula seguinte.
