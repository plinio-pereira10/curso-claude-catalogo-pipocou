# Séries e filtro Doramas — Design

Data: 2026-11-15
Base: catálogo de filmes já pronto (`docs/superpowers/specs/2026-11-14-catalogo-filmes-design.md`), no `main`.

## Intenção e porquê

O dono do projeto está num curso, aprendendo a criar com o Claude Code. O site hoje é um catálogo de **filmes** de assinatura no Brasil. Ele quer:
1. **Séries** no catálogo, numa aba própria.
2. Um filtro **Doramas** para achar produções asiáticas — e principalmente poder combinar com gênero e streaming (ex.: "doramas de romance na Netflix"). Doramas são quase sempre séries, por isso as duas coisas vêm juntas.

Como é um projeto de aprendizado, vale manter o código simples e sem duplicação.

## Objetivos

1. **Abas "Filmes | Séries"** no topo de todas as páginas.
   - Filmes: em `/` (como hoje). Séries: em `/series`.
   - A aba atual fica destacada.
2. **Lista de séries** igual à de filmes: botões de streaming, gênero, busca, "Carregar mais", só **assinatura no Brasil**, ordenada por popularidade.
3. **Botão "🌸 Doramas"** (liga/desliga), nas duas abas.
   - Ligado: só títulos com país de origem **Coreia do Sul, Japão, China, Taiwan ou Tailândia** (`KR`, `JP`, `CN`, `TW`, `TH`).
   - **Sem animes nem reality/auditório** (decisão do dono): o botão mostra novelas, séries e filmes com atores. Exclui Animação (gênero 16, em filmes e séries) e, nas séries, também Reality (10764), Talk (10767) e News (10763), via `without_genres`.
   - Soma com o streaming e o gênero (ex.: Doramas + Romance + Netflix).
   - Fica na URL, como os outros filtros.
4. **Página de detalhes da série** (`/serie/[id]`): cartaz, nome, ano de estreia, nota, **número de temporadas**, gêneros, sinopse e "onde assistir" — igual aos filmes, incluindo **outros países** quando não houver no Brasil.
5. **Link "Ver no streaming"** nas páginas de detalhes (filmes e séries): atalho para a página "onde assistir" do TMDB para o Brasil. Não promete mostrar dublagem.

Esboço da lista:
```
┌──────────────────────────────────────────┐
│  🎬 Catálogo      [ Filmes ] [ Séries ]  │
│  [🔍 buscar         ]                    │
│  [Netflix] [Prime] [Disney+] ...         │
│  Gênero: [Todos ▾]     [🌸 Doramas]      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│            [ Carregar mais ]             │
└──────────────────────────────────────────┘
```

## Não-objetivos

- Informação de **dublagem** (o TMDB não tem esse dado; decidido com o dono).
- Lista de episódios ou página de cada temporada.
- Trailers, login, favoritos, banco de dados.
- Aluguel/compra; outros países além do Brasil na navegação.
- Os ajustes pequenos pendentes da etapa anterior (ex.: "⭐ 0.0") — não fazem parte desta etapa.

## Anti-objetivos

- Quebrar ou mudar o comportamento atual da aba Filmes.
- Duplicar o código: duas grades, dois conjuntos de funções do TMDB, dois botões Doramas.
- Token do TMDB aparecendo no navegador.

## Restrições

- Mesmas regras da etapa anterior: `watch_region=BR`, `language=pt-BR`, `with_watch_monetization_types=flatrate`, `sort_by=popularity.desc`, limite de 500 páginas, token só no servidor, créditos ao TMDB/JustWatch no rodapé.
- Next.js 16.4 com `cacheComponents` — ler `node_modules/next/dist/docs/` antes de escrever código (regra do `AGENTS.md`).
- Endpoints do TMDB para séries: `/discover/tv`, `/search/tv`, `/tv/{id}`, `/tv/{id}/watch/providers`, `/genre/tv/list`, `/watch/providers/tv`. Séries usam `name` e `first_air_date` (filmes usam `title` e `release_date`).
- Doramas: parâmetro `with_origin_country=KR|JP|CN|TW|TH` (o `|` significa "ou"), válido em `/discover/movie` e `/discover/tv`.
- A busca por nome continua desligando os filtros (agora inclusive o Doramas), porque `/search/*` do TMDB não aceita esses filtros.
- Gêneros de filmes e de séries são listas diferentes no TMDB (ex.: séries têm "Action & Adventure" juntos). Ao trocar de aba, o gênero volta para "Todos"; o streaming escolhido e o Doramas continuam valendo.
- Os 45 testes atuais precisam continuar passando (ajustados só onde nomes mudarem).

## Abordagens consideradas

1. **Adaptar as peças atuais para "filme ou série" (escolhida).** Funções do TMDB, grade, filtros e "onde assistir" passam a receber o tipo (filme/série). Uma mudança futura vale para os dois. Custo: mexer em arquivos que já funcionam, protegidos pelos testes.
2. **Copiar as peças de filmes e criar versões só para séries.** Zero risco para filmes, mas tudo em dobro e cada ajuste futuro feito duas vezes.
3. Refazer do zero — descartada: a base atual já serve.

O dono escolheu a abordagem 1.

## Decisões do dono do projeto

- Abas Filmes | Séries.
- Doramas como **botão separado** (não dentro da lista de gêneros), para poder combinar com gênero.
- Países: Coreia do Sul, Japão, China, Taiwan, Tailândia. Nome do botão: "🌸 Doramas" nas duas abas.
- Doramas **sem animes e sem reality/auditório**.
- Dublagem fora. Link "Ver no streaming" como atalho.
- Séries: só assinatura no Brasil; detalhes com temporadas e onde assistir (inclusive outros países).
- Abordagem 1 (adaptar o que existe).

## Decisões do Claude (podem ser revistas)

- Endereços: `/` (filmes), `/series`, `/filme/[id]`, `/serie/[id]`. Doramas na URL como `?doramas=1`.
- O link "Ver no streaming" usa o campo `link` que o TMDB devolve em `watch/providers` para o Brasil (`results.BR.link`). Só aparece quando o título está por assinatura no Brasil (quando não está, a seção já mostra outros países ou "não disponível").
- Com Doramas ligado, os gêneros excluídos (Animação; e nas séries Reality, Talk, News) **somem da lista de gêneros**, para ninguém escolher uma combinação que sempre dá vazio. Se a URL vier com um desses gêneros e Doramas ligado, o gênero é ignorado.
- Trocar de aba limpa a busca por nome (e o gênero, como já dito); mantém streaming e Doramas.
- Cabeçalho passa a ser "🎬 Catálogo"; o rodapé diz "Dados de filmes e séries fornecidos pelo TMDB…".
- Nas páginas de detalhes, a aba destacada é a do tipo do título (filme → Filmes, série → Séries).
- Os botões de streaming das séries usam a mesma lista fixa de serviços de assinatura da etapa anterior, buscando nomes e logos em `/watch/providers/tv`.

## Deixado para quem construir

- Nomes internos (ex.: tipo `MediaType = 'movie' | 'tv'`, como renomear `MovieSummary` para algo neutro).
- Se a rota interna do "Carregar mais" muda de nome ou ganha um parâmetro de tipo.
- Visual das abas e do botão Doramas (seguir o estilo atual).
- Mensagem do "não encontrado" para séries ("Série não encontrada.").
- Testes no mesmo estilo dos atuais.
