# Portfólio Pessoal — Vinicius Conceição Alves Maria

Site de portfólio pessoal com cinco páginas, construído com **HTML, CSS e JavaScript puro**, usando Tailwind CSS (via CDN) para o layout e Lucide para os ícones.
---
## Autor

**Vinicius Conceição Alves Maria**  **RGM: 48692484**
---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica das páginas (`header`, `nav`, `main`, `section`, `fieldset`, `form`) |
| CSS3 (`estilo.css`) | Grades de fundo, cartões de linguagens (Flexbox), gráficos Canvas/SVG, animações |
| JavaScript (`script.js`) | Todas as interações, validações e persistência |
---

## Features Criadas

### Recursos gerais (todas as páginas)

**Cabeçalho fixo com navegação**
O `header` usa `sticky top-0`, então o menu continua visível durante a rolagem. A página atual é destacada em azul no menu: Sobre Mim, Currículo, Contato, Multimídia e Gráfico.

**Alternador de estilo: Sketch Wireframe / Blueprint Azul**
Dois botões no cabeçalho chamam a função `setStyle()`, que troca as classes do painel `#wireframe-canvas` e de todas as seções:
- *Sketch Wireframe*: fundo claro com pontos, seções brancas de borda cinza tracejada.
- *Blueprint Azul*: fundo escuro com linhas azuis em grade, seções escuras de borda azul e títulos em azul-claro.

**Configuração do Tailwind**
O início do `script.js` define as famílias de fonte `sans` (Inter) e `mono` (Fira Code).

**Boas-vindas personalizadas (Feature 3)**
Na primeira visita, abre um modal perguntando o nome do visitante. Depois disso, a barra de navegação mostra "Olá, *nome* 👋", com o botão "Não é você?" para trocar.
- O nome é validado (mínimo de 2 letras, apenas letras) e formatado com a inicial maiúscula.
- Fica salvo em `localStorage`.
- "Agora não" ou a tecla `Esc` adiam o modal até o fim da sessão (`sessionStorage`), para não insistir.

---

### Página "Sobre Mim" (`index.html`)

- **Apresentação e interesses:** textos sobre o perfil, áreas de interesse (Back-End, Front-End, IA, desenvolvimento de sistemas) e foto de perfil de 200×200 px, com *fallback* para uma imagem de placeholder caso `img/foto.png` não carregue.
- **Cartões interativos de linguagens:** Java, Python, JavaScript, SQL, HTML e CSS. Ao passar o mouse, o cartão sobe levemente, muda de cor (uma cor por linguagem) e revela uma descrição curta. O layout usa **Flexbox com `flex-wrap`** (classe `.lang-flex`), reorganizando-se sozinho conforme a largura da tela.
- **Modal "Sobre este Wireframe":** botão de informações (ícone ℹ) que abre/fecha um modal com detalhes técnicos do projeto (`toggleInfoModal()`).
- **"Quer saber mais sobre mim?" (Feature 4):** mini-formulário de interesse.
  - O visitante escolhe *Sim / Talvez depois / Não*.
  - Se escolher "Sim", aparecem checkboxes de assuntos (Formação, Experiência, Objetivos, Tecnologias, Lado pessoal, Como falar comigo) e um comentário opcional de até 200 caracteres.
  - Ao salvar, a página mostra cartões com as informações dos assuntos escolhidos, personalizados com o nome do visitante, se ele já tiver informado.
  - A resposta persiste após recarregar. É possível **alterar** ou **apagar** (o apagar exige um segundo clique para confirmar, sem usar `alert`/`confirm`).

---

### Página "Currículo" (`curriculo.html`)

- Cabeçalho com nome e localização, seguido de um layout em **grid de 3 colunas** (1/3 lateral + 2/3 principal em telas médias ou maiores; empilhado no celular).
- **Coluna lateral:** informações pessoais e habilidades/competências.
- **Coluna principal:** objetivos, formação (fundamental, médio, técnico e superior) e experiência profissional.
- **Metas de Estudo (Feature 1):** o código está pronto no `script.js` (lista de metas com checkbox, filtros *todas/pendentes/concluídas*, barra de progresso, botão de limpar concluídas e persistência em `localStorage`), mas o bloco HTML correspondente ainda **não existe** no `curriculo.html` enviado. Veja [Pontos de atenção](#pontos-de-atenção).

---

### Página "Contato" (`formulario.html`)

**Formulário "Fale Comigo" com validação (Feature 2)**
- Campos: nome, data de nascimento, e-mail, assunto, telefone (opcional), mensagem (até 500 caracteres, com contador) e música favorita (opcional).
- O formulário usa `novalidate`: toda a validação é feita em JavaScript, com **mensagem de erro abaixo de cada campo**, borda vermelha/verde e atributos de acessibilidade (`aria-invalid`, `role="alert"`).
- A validação acontece ao sair do campo (`blur`) e, depois, a cada digitação.
- Regras principais: nome só com letras; data não pode estar no futuro; e-mail com formato válido; telefone com 10 a 13 dígitos; mensagem entre 10 e 500 caracteres.
- Em caso de erro, um banner mostra quantos campos precisam ser corrigidos e o foco vai para o primeiro inválido. Em caso de sucesso, um banner agradece ao visitante pelo nome.

**Rascunho automático**
O conteúdo digitado é salvo no `localStorage` (com *debounce* de 400 ms e também ao fechar a aba) e restaurado na próxima visita. O botão "Descartar rascunho" limpa tudo. Após um envio bem-sucedido, o rascunho é apagado.

**Perguntas para mim (Feature 5)**
O visitante pode criar até 10 perguntas, cada uma com assunto e texto (10 a 120 caracteres, sem duplicatas). É possível **adicionar, editar e apagar** perguntas, ou apagar todas com confirmação de dois cliques. As perguntas ficam salvas e são **enviadas junto com a mensagem** ao clicar em "Enviar". Se houver uma pergunta digitada e ainda não adicionada, o envio é bloqueado com um aviso, para ela não se perder.

**Histórico de mensagens enviadas**
Cada envio é guardado (as 50 mais recentes) e exibido em uma lista com data, nome, e-mail, assunto, mensagem, perguntas anexadas e música favorita. É possível apagar mensagens individualmente ou todas de uma vez (com confirmação). Nenhuma mensagem é enviada a um servidor.

---

### Página "Multimídia" (`multimidia.html`)

Demonstração dos elementos de mídia do HTML5, em cartões:
- **Vídeo local** (`<video controls>`)
- **Áudio local** (`<audio controls>`)
- **Vídeo do YouTube** incorporado via `<iframe>`
- **Mapa do Google Maps** (Suzano, SP) incorporado via `<iframe>`

Os arquivos locais ficam na pasta `img/`.

---

### Página "Gráfico" (`grafico.html`)

Demonstração de **Canvas** e **SVG**, em estilo monocromático:

- **01. Canvas — gráfico de linha interativo** (desenhado no `script.js`):
  - Animação de entrada que revela a linha aos poucos.
  - *Tooltip* ao passar o mouse sobre um ponto e linha guia tracejada.
  - Clique para fixar/desafixar um ponto.
  - Ajuste para telas de alta densidade (`devicePixelRatio`), deixando o desenho nítido.
- **02. SVG — vetor estilizado com CSS:** círculos concêntricos, uma órbita pontilhada que gira e um "planeta" que orbita o centro, tudo animado por `@keyframes`. O círculo central aumenta ao passar o mouse sobre o cartão.

---

## Estrutura do código e dos arquivos

### Árvore esperada

Os arquivos HTML referenciam `css/estilo.css`, `script/script.js` e a pasta `img/`. Para o site funcionar, o projeto deve estar organizado assim:

```
portfolio/
├── index.html          # Página "Sobre Mim" (página inicial)
├── curriculo.html      # Página "Currículo"
├── formulario.html     # Página "Contato" (formulário + histórico)
├── multimidia.html     # Página "Multimídia"
├── grafico.html        # Página "Gráfico" (Canvas e SVG)
│
├── css/
│   └── estilo.css      # Estilos personalizados
│
├── script/
│   └── script.js       # Toda a lógica JavaScript
│
└── img/
    ├── foto.png                       # Foto de perfil (200×200 usada na tela)
    ├── Never Gonna Give you up.mp4    # Vídeo local
    └── Never Gonna Give you up.mp3    # Áudio local
```

### Descrição dos arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Página inicial. Contém o cabeçalho, "Sobre Mim", interesses, cartões de linguagens, foto de perfil, o formulário "Quer saber mais sobre mim?" e o modal de informações. |
| `curriculo.html` | Currículo em grid de 3 colunas (informações pessoais, habilidades, objetivos, formação e experiência). |
| `formulario.html` | Formulário de contato com validação, rascunho, perguntas para o autor e histórico de mensagens. |
| `multimidia.html` | Vídeo, áudio, YouTube e Google Maps. Também define, em um `<script>` inline, uma versão própria de `setStyle()`. |
| `grafico.html` | Contém o `<canvas id="meuCanvas">` e o SVG animado; o desenho do canvas é feito pelo `script.js`. |
| `estilo.css` | Estilos que o Tailwind não cobre (veja abaixo). |
| `script.js` | Configuração do Tailwind, gráfico, alternador de tema, modal e as 5 features. |

---

