# Visual estilo streaming — design

## Intenção

O dono quer o catálogo "muito mais bonito", com o visual da tela inicial do Prime Video
(imagem de referência enviada em 16/11/2026): fundo azul bem escuro, banner grande com a
imagem de um título em destaque, fileiras de cartazes deitados que rolam para o lado e menu
no topo com o item ativo em pílula branca e os logos dos streamings ao lado.

Copiamos o **estilo**, não a marca: nenhum logo, nome ou cor exclusiva da Amazon/Prime.

## Objetivos

- Tela inicial (Filmes e Séries) **sem filtros**: banner em destaque + uma fileira por streaming.
- Tela **com filtro** (streaming, gênero, nota, Doramas ou busca): a grade de hoje, com cartões deitados.
- Página de detalhes com a imagem de cena do título ao fundo.
- Tudo o que funciona hoje continua funcionando: abas, filtros, Doramas, Nota, busca,
  "Carregar mais", "← voltar", Onde Assistir.

## Fora do escopo

- Botão "assistir" (não temos vídeo), lista "minha lista", perfis, login.
- Novos filtros ou nova ordem da lista.
- Publicar na Vercel.

## O que seria um fracasso mesmo funcionando

- Parecer uma cópia da Amazon (logo, nome "Prime", o azul exato da marca).
- Tela inicial lenta ou quebrando inteira porque um streaming falhou.
- Perder algum filtro ou o "voltar" mantendo os filtros.
- Texto ilegível sobre a imagem do banner.

## Abordagens consideradas

- **A — só o visual:** mesma grade, cartões deitados, banner do título mais popular. Menos
  trabalho, mas não tem a cara da referência (as fileiras são o que define a tela).
- **B — tela inicial em fileiras (escolhida pelo dono):** sem filtros, banner + fileiras por
  streaming; com filtro, grade. Mais parecida com a referência; custa mais buscas ao TMDB
  (uma por fileira, guardadas em cache).

## Como a tela B funciona

### Quando mostra fileiras e quando mostra grade

- **Fileiras:** a URL não tem nenhum filtro (`provider`, `genre`, `nota`, `doramas`, `q`).
  Vale para `/` (Filmes) e `/series` (Séries).
- **Grade:** qualquer filtro na URL. Igual à de hoje (mesma busca, mesmo "Carregar mais",
  mesma rota `/api/titles`), só com o visual novo.

### Fileiras

- Uma fileira para cada streaming de `getTopProviders(type)` (até 8), na mesma ordem dos botões.
- Cada fileira: página 1 do `discoverTitles` com só aquele streaming (até 20 títulos, por popularidade).
- Título da fileira: logo pequeno + nome do streaming ("Netflix", "Disney+"). Sem "Em alta na/no",
  para não errar o artigo de cada nome.
- No fim do título da fileira, link **"Ver todos"** que abre a grade com aquele streaming
  (`listHref(type, { providerId })`).
- Rola para o lado com o dedo/trackpad (`overflow-x-auto` + `scroll-snap`). No computador, botões
  de seta ‹ › nas pontas, que aparecem ao passar o mouse e rolam uma "tela" de cartões.
- Se a busca de uma fileira falhar, **só aquela fileira some**. Se todas falharem, mostra o erro
  de sempre (`error.tsx`).
- Fileira vazia (streaming sem títulos) não aparece.

### Banner (destaque)

- Até 5 títulos, um de cada fileira: o 1º título da 1ª fileira, o 1º da 2ª... sem repetir e
  só títulos que têm imagem de cena. Assim sabemos em qual streaming cada destaque está.
- Ocupa a largura toda, começa no topo da página (o menu fica por cima dele, transparente).
  Altura: ~70% da tela no computador, ~60% no celular.
- Imagem de cena (`backdrop_path`, tamanho `w1280`) à direita; degradê do azul do fundo vindo da
  esquerda e de baixo, para o texto ficar legível.
- À esquerda, de cima para baixo:
  1. logo pequeno do streaming (já vem do TMDB);
  2. **logo do título** (a arte com o nome, como "The Rings of Power" na referência) — vem de
     `/{type}/{id}/images`; se não houver, o nome em texto grande;
  3. linha com ⭐ nota e ano;
  4. sinopse em até 3 linhas;
  5. botão **"Ver detalhes"** (pílula clara) que leva à página do título.
- Bolinhas embaixo para trocar o destaque (a ativa é mais larga, como na referência).
- Troca sozinho a cada 8 s; para enquanto o mouse está em cima ou o foco está dentro; **não troca
  sozinho** se o sistema pede menos movimento (`prefers-reduced-motion`). Troca com fade curto.

### Menu do topo

- Uma barra só: **🎬 Catálogo** · abas **Filmes | Séries** (ativa em pílula branca, texto escuro) ·
  divisória fina · **logos dos streamings** (botões de filtro, só o logo; nome no `title` e no
  `aria-label`) · divisória · campo de busca.
- Nas páginas de lista a barra fica por cima do banner (fundo transparente); nas outras e quando
  a página rola, fundo azul-escuro.
- Celular: abas na primeira linha; logos numa faixa que rola para o lado embaixo.
- Hoje o cabeçalho está no `layout.tsx` e os streamings são buscados dentro do `CatalogPage`.
  Sugestão: o cabeçalho vira um componente (`TopBar`) que cada página renderiza — as listas passam
  os streamings; os detalhes renderizam sem logos. O construtor pode escolher outro jeito, desde
  que o resultado visual seja esse.

### Filtros restantes (Gênero, Nota, Doramas)

- Faixa logo abaixo do banner (modo fileiras) ou no topo da grade (modo grade): selects e o botão
  🌸 Doramas com o visual novo (pílulas escuras, borda clara ao focar). A busca continua com
  "Limpar" e com o aviso da busca.

### Cartão deitado

- Formato 16:9, cantos arredondados (8px), imagem de cena `w780`.
- Nome do título por cima, embaixo à esquerda, sobre um degradê escuro; ⭐ nota e ano em letra menor.
- Sem imagem de cena: usa o cartaz em pé centralizado sobre fundo da superfície; sem nenhuma imagem:
  bloco com o nome (como o `PosterPlaceholder` de hoje).
- Passar o mouse ou focar com o teclado: cresce um pouco (scale ~1.05) e ganha **contorno branco**
  — a única animação dos cartões.
- Na grade: 1 coluna no celular pequeno, 2 no `sm`, 3 no `lg`, 4 no `xl`. Na fileira: ~70% da tela
  no celular, ~24% no computador (aparece um pedaço do próximo, convidando a rolar).

### Página de detalhes

- Imagem de cena no topo, largura toda, com o mesmo degradê do banner.
- Por cima/logo abaixo: cartaz em pé à esquerda, à direita nome, ⭐ nota, duração/temporadas,
  gêneros, sinopse e Onde Assistir (mesmos componentes, visual novo).
- "← voltar" continua igual no comportamento.

## Plano visual (frontend-design)

### Cores

| Nome          | Hex       | Uso                                   |
|---------------|-----------|---------------------------------------|
| Noite         | `#0D1520` | fundo da página, degradês             |
| Superfície    | `#1A2533` | selects, placeholders, barra rolada   |
| Linha         | `#2C3A4B` | divisórias, bordas                    |
| Texto         | `#F1F4F8` | texto principal, pílula ativa         |
| Texto suave   | `#93A1B2` | ano, avisos, textos secundários       |
| Âmbar         | `#F2C14E` | estrela da nota                       |

O rosa do Doramas (`pink-300`) continua. O azul vivo da marca Prime **não** é usado.

### Fonte

- **Figtree** (Google Fonts, via `next/font/google`) no lugar da Geist, em tudo. Arredondada e bem
  legível de longe, combina com tela de TV. Pesos: 400 texto, 600 menus/títulos de fileira,
  800 nome do título no banner quando não há logo.
- Escala: 14 (detalhes) · 16 (texto) · 20 (títulos de fileira) · 28 (nome nos detalhes) ·
  48–64 (nome no banner, sem logo).
- Sem letras todas maiúsculas em rótulos.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎬 Catálogo  [Filmes] Séries │ N  P  D+  M  G … │ 🔍 buscar      │ ← por cima do banner
│                                                                 │
│  netflix                              (imagem de cena)          │
│  ▓▓ LOGO DO TÍTULO ▓▓                                           │
│  ⭐ 7,8   2024                                                   │
│  Sinopse em até três linhas…                                    │
│  ( Ver detalhes )                    ━ • • • •                  │
├─────────────────────────────────────────────────────────────────┤
│  Gênero [Todos ▾]  Nota [Todas ▾]  (🌸 Doramas)                  │
│                                                                 │
│  [N] Netflix                                       Ver todos    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──        │
│  │ imagem   │ │          │ │          │ │          │ │          │
│  │ Nome ⭐7 │ │          │ │          │ │          │ │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──        │
│  [P] Prime Video                                   Ver todos    │
│  …                                                              │
└─────────────────────────────────────────────────────────────────┘
```

Tudo alinhado à esquerda, com a mesma margem esquerda do banner, das fileiras e da grade
(as fileiras "vazam" pela direita até a borda da tela, como na referência).

### Princípios

- A ousadia fica num lugar só: o **banner com o logo do título**. O resto é calmo e organizado.
- A imagem é a protagonista: interface escura e discreta em volta das imagens do TMDB.
- Foco do teclado sempre visível (contorno branco, como o foco de controle remoto de TV).
- Celular de verdade: nada de rolagem lateral da página inteira; só as fileiras rolam.

## Mudanças nos dados

- `TitleSummary` ganha `backdropPath: string | null` e `overview: string` (o TMDB já manda os dois
  na busca, na descoberta e nos detalhes; o `overview` dos detalhes passa a vir daí).
- `images.ts` ganha `backdropUrl(path, size)` com tamanhos `w780` e `w1280`.
- Nova função `getTitleLogo(type, id)` em `titles.ts`: chama `/{type}/{id}/images` com
  `include_image_language=pt,en,null`, devolve o caminho do primeiro logo (prefere `pt`) ou `null`.
  Guardada em cache por horas (`'use cache'` + `cacheLife('hours')`).
- As fileiras usam `discoverTitles` como hoje. Hoje a lista **não** fica em cache (só streamings e
  gêneros ficam). As fileiras e os logos do banner passam a ficar em cache por 1 hora
  (`'use cache'` + `cacheLife('hours')`), para o TMDB ser chamado no máximo uma vez por hora em cada aba.
  A grade filtrada continua sem cache, como hoje.
- `next.config.ts` já libera `image.tmdb.org/t/p/**` — não muda.

## Testes

- Os testes que montam `TitleSummary` passam a incluir `backdropPath` e `overview`.
- Novos testes: escolha dos destaques (um por fileira, sem repetir, só com imagem de cena);
  "tem filtro?" decide fileiras × grade; cartão usa imagem de cena → cartaz → bloco;
  fileira com erro some sem derrubar as outras; banner não troca sozinho com menos movimento.
- Todos os testes atuais continuam passando (ajustados só onde o formato do cartão mudou).

## Decisões que tomei (o dono pode corrigir)

- Banner com até 5 destaques, um por streaming, trocando a cada 8 s.
- Fileira por streaming, com "Ver todos" abrindo a grade filtrada.
- Página de detalhes também ganha o visual novo.
- Busca fica no menu do topo.
- Fonte Figtree e as cores da tabela acima.

## Deixado para o construtor

- Mecanismo exato do cabeçalho por cima do banner (sugestão: `TopBar` por página).
- Visual da tela de carregamento (ex.: fileiras cinzas no lugar de "Carregando…").
- Ler o guia do Next em `node_modules/next/dist/docs/` antes de mexer em fontes, imagens e cache.
