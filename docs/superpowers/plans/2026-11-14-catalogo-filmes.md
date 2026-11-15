# Catálogo de Filmes em Streaming — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site em Next.js que lista os filmes disponíveis por assinatura no Brasil (dados do TMDB), com filtros, busca, "Carregar mais" e tela de detalhes com "onde assistir" (incluindo outros países quando não há no Brasil).

**Architecture:** Next.js App Router. Toda chamada ao TMDB acontece no servidor (Server Components e um Route Handler), usando o token guardado em variável de ambiente. Os filtros ficam na URL (`?provider=8&genre=35&q=duna`), e a página renderiza a primeira página no servidor. O botão "Carregar mais" busca as páginas seguintes num Route Handler interno (`/api/movies`). A lógica de dados fica em funções puras dentro de `src/lib/`, testadas com Vitest.

**Tech Stack:** Next.js (create-next-app@latest, App Router, TypeScript, Tailwind CSS, ESLint, `src/`), Vitest + @testing-library/react + jsdom, Node 26.

**Spec:** `docs/superpowers/specs/2026-11-14-catalogo-filmes-design.md`

## Global Constraints

- Região fixa: `watch_region=BR`; idioma: `language=pt-BR` em todas as chamadas ao TMDB.
- "Disponível" = `with_watch_monetization_types=flatrate` (só assinatura), inclusive na tela de detalhes e na lista de outros países.
- Ordem padrão da lista: `sort_by=popularity.desc`.
- O TMDB limita a busca a 500 páginas: nunca pedir `page > 500`.
- Token só no servidor: variável `TMDB_READ_TOKEN` em `.env.local` (no `.gitignore`). Nada de `NEXT_PUBLIC_` no token. `src/lib/tmdb/client.ts` importa `server-only`.
- Base da API: `https://api.themoviedb.org/3`, cabeçalho `Authorization: Bearer <token>`. Imagens: `https://image.tmdb.org/t/p/<tamanho><path>`.
- Rodapé em todas as páginas com o texto exato: `Dados de filmes fornecidos pelo TMDB. Disponibilidade em streaming fornecida pelo JustWatch.` e o aviso `Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.`
- Textos de interface em português do Brasil.
- Fora de escopo: login, favoritos, séries, trailers, banco de dados, aluguel/compra.
- Código simples e legível: o dono do projeto está aprendendo. Sem bibliotecas extras além das listadas.

## Decisões do plano (tomadas pelo Claude)

- **Busca x filtros:** o endpoint `/search/movie` não filtra por streaming. Quando há texto na busca (`q`), a lista usa `/search/movie` e os filtros de serviço e gênero ficam desativados, com o aviso "A busca mostra todos os filmes. A disponibilidade aparece na página de cada filme." A tela de detalhes mostra "Não disponível em streaming no momento" quando for o caso (cumprindo a decisão do spec sem fazer 20 chamadas extras por página).
- **Sem serviço selecionado:** `with_watch_providers` recebe os IDs de todos os serviços dos botões, separados por `|` (OU). Assim a lista mostra só filmes que estão em algum desses serviços.
- **Botões de serviço:** os 8 primeiros de `/watch/providers/movie?watch_region=BR`, ordenados por `display_priorities.BR` crescente.
- **Outros países:** mostrar os 5 primeiros (em ordem alfabética do nome em português) e o botão "ver todos os N países". Nomes via `Intl.DisplayNames(['pt-BR'], { type: 'region' })`. Sem bandeiras.

## Review Focus

1. Filme sem cartaz (`poster_path: null`) → mostrar um bloco cinza com o título, nunca uma imagem quebrada. (Task 1 e Task 4)
2. Filtros ou busca sem resultado → mensagem "Nenhum filme encontrado." e nenhum botão "Carregar mais". (Task 4)
3. URL com valores inválidos (`?provider=abc&page=-3&genre=`) → ignorar e usar o padrão, sem erro. (Task 3)
4. `/filme/abc` ou um ID que o TMDB responde com 404 → página "Filme não encontrado", não uma tela de erro. (Task 6)
5. Token ausente ou TMDB fora do ar → página de erro amigável em português; com token ausente, a mensagem do erro no servidor diz `TMDB_READ_TOKEN não configurado`. (Task 2 e Task 4)

---

### Task 1: Projeto base, testes e rodapé de créditos

**Files:**
- Create (via create-next-app): estrutura do projeto em `d:\curso-claude-code` (raiz, ao lado de `docs/`)
- Create: `vitest.config.ts`, `vitest.setup.ts`, `.env.example`, `README.md`
- Create: `src/lib/images.ts`, `src/lib/images.test.ts`
- Create: `src/components/Footer.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx` (placeholder "Catálogo de Filmes"), `package.json` (scripts)

**Interfaces:**
- Produces: `posterUrl(path: string | null, size?: 'w185' | 'w342' | 'w500'): string | null` (padrão `'w342'`); `logoUrl(path: string): string` (tamanho `w92`); `<Footer />`; script `npm test` (= `vitest run`).

- [ ] **Step 1: Inicializar git e o projeto**

Run: `git init` na raiz; depois `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm` (a pasta já tem `docs/`; se o comando recusar a pasta não vazia, criar num diretório temporário e mover os arquivos para a raiz). Instalar `npm i server-only` e `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`.
Expected: `npm run dev` abre a página inicial padrão em http://localhost:3000.

- [ ] **Step 2: Configurar Vitest**

`vitest.config.ts` com plugin react, `environment: 'jsdom'`, alias `@` → `./src`, `setupFiles: ['./vitest.setup.ts']` (importa `@testing-library/jest-dom/vitest`). Em `package.json`: `"test": "vitest run"`.

- [ ] **Step 3: Escrever o teste que falha**

```ts
// src/lib/images.test.ts
import { posterUrl, logoUrl } from './images'
test('posterUrl monta a URL com tamanho padrão w342', () => {
  expect(posterUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg')
})
test('posterUrl aceita tamanho', () => {
  expect(posterUrl('/abc.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg')
})
test('posterUrl retorna null sem cartaz', () => {
  expect(posterUrl(null)).toBeNull()
})
test('logoUrl usa w92', () => {
  expect(logoUrl('/n.png')).toBe('https://image.tmdb.org/t/p/w92/n.png')
})
```

- [ ] **Step 4: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL (módulo `./images` não existe).

- [ ] **Step 5: Implementar `src/lib/images.ts`** com as assinaturas acima.

- [ ] **Step 6: Rodar e ver passar** — Run: `npm test` · Expected: 4 testes PASS.

- [ ] **Step 7: Rodapé, layout e documentação**

`Footer.tsx` com os dois textos exatos das Global Constraints e link para https://www.themoviedb.org e https://www.justwatch.com. `layout.tsx`: `lang="pt-BR"`, título "Catálogo de Filmes", cabeçalho com "🎬 Catálogo de Filmes" (link para `/`) e `<Footer />`. Trocar `page.tsx` por um placeholder. Em `next.config.ts`, liberar imagens de `image.tmdb.org` (`images.remotePatterns`). `.env.example` com `TMDB_READ_TOKEN=`. `README.md` curto em português: como criar conta no TMDB, gerar o "API Read Access Token" em Configurações → API, copiar para `.env.local`, e rodar `npm run dev` / `npm test`.
Expected: `npm run build` sem erros; o rodapé aparece em http://localhost:3000.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: projeto Next.js base com Vitest e rodapé de créditos"
```

---

### Task 2: Cliente do TMDB

**Files:**
- Create: `src/lib/tmdb/types.ts`, `src/lib/tmdb/client.ts`, `src/lib/tmdb/movies.ts`
- Test: `src/lib/tmdb/movies.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  - `MovieSummary = { id: number; title: string; posterPath: string | null; releaseYear: number | null; voteAverage: number }`
  - `MoviePage = { results: MovieSummary[]; page: number; totalPages: number }` (`totalPages` já limitado a 500)
  - `Provider = { id: number; name: string; logoPath: string }`
  - `Genre = { id: number; name: string }`
  - `MovieDetails = MovieSummary & { overview: string; runtime: number | null; genres: Genre[] }`
  - `ProvidersByCountry = Record<string, Provider[]>` (código do país → serviços de assinatura; países sem `flatrate` não entram)
- Produces (`client.ts`): `class TmdbError extends Error { status: number }`; `tmdbFetch<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T>` — sempre adiciona `language=pt-BR`, omite parâmetros `undefined`, usa `next: { revalidate: 3600 }`, lança `TmdbError` com o status em resposta não-OK e `Error('TMDB_READ_TOKEN não configurado')` se o token faltar.
- Produces (`movies.ts`):
  - `discoverMovies(opts: { providerIds: number[]; genreId?: number; page: number }): Promise<MoviePage>`
  - `searchMovies(opts: { query: string; page: number }): Promise<MoviePage>`
  - `getMovieDetails(id: number): Promise<MovieDetails>`
  - `getMovieProviders(id: number): Promise<ProvidersByCountry>`
  - `getTopProviders(limit?: number): Promise<Provider[]>` (padrão 8)
  - `getGenres(): Promise<Genre[]>`

- [ ] **Step 1: Escrever os testes que falham** (mockar `global.fetch` com `vi.fn`, `vi.stubEnv('TMDB_READ_TOKEN', 'tok')`, e `vi.mock('server-only', () => ({}))`)

```ts
test('discoverMovies envia os parâmetros fixos e junta serviços com |', async () => {
  mockFetchJson({ page: 1, total_pages: 900, results: [
    { id: 1, title: 'Duna', poster_path: '/d.jpg', release_date: '2024-02-28', vote_average: 8.2 },
  ] })
  const r = await discoverMovies({ providerIds: [8, 119], genreId: 35, page: 2 })
  const url = new URL(lastFetchUrl())
  expect(url.pathname).toBe('/3/discover/movie')
  expect(url.searchParams.get('watch_region')).toBe('BR')
  expect(url.searchParams.get('with_watch_monetization_types')).toBe('flatrate')
  expect(url.searchParams.get('with_watch_providers')).toBe('8|119')
  expect(url.searchParams.get('with_genres')).toBe('35')
  expect(url.searchParams.get('sort_by')).toBe('popularity.desc')
  expect(url.searchParams.get('language')).toBe('pt-BR')
  expect(url.searchParams.get('page')).toBe('2')
  expect(lastFetchHeaders().Authorization).toBe('Bearer tok')
  expect(r).toEqual({ page: 1, totalPages: 500, results: [
    { id: 1, title: 'Duna', posterPath: '/d.jpg', releaseYear: 2024, voteAverage: 8.2 },
  ] })
})
test('release_date vazio vira releaseYear null', ...)          // '' → null
test('searchMovies usa /search/movie com query', ...)           // pathname '/3/search/movie', query 'duna'
test('getMovieProviders mantém só países com flatrate', ...)    // { BR: {flatrate:[...]}, US: {rent:[...]} } → só BR
test('getTopProviders ordena por display_priorities.BR e corta no limite', ...)
test('resposta 404 lança TmdbError com status 404', ...)
test('sem token lança "TMDB_READ_TOKEN não configurado"', ...)
```

`mockFetchJson`, `lastFetchUrl`, `lastFetchHeaders` são helpers locais no arquivo de teste. Os testes marcados com `...` seguem o mesmo padrão, com as asserções indicadas no comentário.

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL (módulos não existem).

- [ ] **Step 3: Implementar `types.ts`, `client.ts` e `movies.ts`** com as assinaturas acima. `getMovieDetails` mapeia `runtime` e `genres`; `getMovieProviders` lê `results[país].flatrate` de `/movie/{id}/watch/providers` (mapeando `provider_id`, `provider_name`, `logo_path`).

- [ ] **Step 4: Rodar e ver passar** — Run: `npm test` · Expected: todos PASS.

- [ ] **Step 5: Commit** — `git add src/lib/tmdb && git commit -m "feat: cliente do TMDB com descoberta, busca, detalhes e serviços"`

---

### Task 3: Filtros na URL

**Files:**
- Create: `src/lib/filters.ts`, `src/lib/filters.test.ts`

**Interfaces:**
- Produces: `Filters = { providerId?: number; genreId?: number; q?: string; page: number }`; `parseFilters(sp: Record<string, string | string[] | undefined>): Filters`; `filtersToQuery(f: Omit<Filters, 'page'> & { page?: number }): string` (sem `?` inicial, omite vazios e `page` igual a 1).

- [ ] **Step 1: Escrever os testes que falham**

```ts
test('lê valores válidos', () => {
  expect(parseFilters({ provider: '8', genre: '35', q: ' duna ', page: '3' }))
    .toEqual({ providerId: 8, genreId: 35, q: 'duna', page: 3 })
})
test('ignora valores inválidos', () => {
  expect(parseFilters({ provider: 'abc', genre: '', q: '   ', page: '-3' })).toEqual({ page: 1 })
})
test('limita page a 500', () => { expect(parseFilters({ page: '9999' }).page).toBe(500) })
test('usa o primeiro valor quando vem lista', () => {
  expect(parseFilters({ provider: ['8', '9'] }).providerId).toBe(8)
})
test('filtersToQuery omite vazios e page 1', () => {
  expect(filtersToQuery({ providerId: 8, page: 1 })).toBe('provider=8')
  expect(filtersToQuery({ q: 'duna', page: 2 })).toBe('q=duna&page=2')
  expect(filtersToQuery({})).toBe('')
})
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 3: Implementar `src/lib/filters.ts`** (inteiros positivos via `Number.parseInt`; `q` com `trim`, vazio vira ausente).
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test` · Expected: PASS.
- [ ] **Step 5: Commit** — `git add src/lib/filters.ts src/lib/filters.test.ts && git commit -m "feat: leitura e escrita dos filtros na URL"`

---

### Task 4: Tela de lista (primeira página)

**Files:**
- Create: `src/components/MovieCard.tsx`, `src/components/MovieCard.test.tsx`, `src/components/ProviderFilter.tsx`, `src/components/GenreSelect.tsx`, `src/components/SearchBox.tsx`
- Create: `src/app/error.tsx`, `src/app/loading.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `discoverMovies`, `searchMovies`, `getTopProviders`, `getGenres` (Task 2); `parseFilters`, `filtersToQuery` (Task 3); `posterUrl`, `logoUrl` (Task 1).
- Produces: `<MovieCard movie={MovieSummary} />` (link para `/filme/{id}`); `<ProviderFilter providers={Provider[]} selectedId?={number} disabled={boolean} />`; `<GenreSelect genres={Genre[]} selectedId?={number} disabled={boolean} />`; `<SearchBox initialQuery?={string} />`. Os três controles são Client Components que trocam a URL com `useRouter().push('/?' + filtersToQuery(...))`, sempre voltando para a página 1. Clicar no serviço já selecionado tira a seleção. A busca envia ao apertar Enter ou o botão, e tem um botão "Limpar".

- [ ] **Step 1: Escrever os testes que falham**

```tsx
test('MovieCard mostra cartaz, título, ano e link', () => {
  render(<MovieCard movie={{ id: 7, title: 'Duna', posterPath: '/d.jpg', releaseYear: 2024, voteAverage: 8.2 }} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/filme/7')
  expect(screen.getByRole('img', { name: 'Duna' })).toBeInTheDocument()
  expect(screen.getByText('2024')).toBeInTheDocument()
})
test('MovieCard sem cartaz mostra bloco com o título e nenhuma imagem', () => {
  render(<MovieCard movie={{ id: 7, title: 'Duna', posterPath: null, releaseYear: null, voteAverage: 0 }} />)
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.getAllByText('Duna').length).toBeGreaterThan(0)
})
```

(Usar `<img>` simples ou mockar `next/image` no teste; escolha do implementador.)

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 3: Implementar `MovieCard`.**
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test` · Expected: PASS.

- [ ] **Step 5: Implementar a página `src/app/page.tsx`** (Server Component, `searchParams` é uma Promise no Next 15+)

Ler filtros com `parseFilters`. Buscar `getTopProviders()` e `getGenres()`. Se tiver `q`, chamar `searchMovies({ query: q, page: 1 })` e desativar serviço e gênero, mostrando o aviso exato das Decisões do plano. Se não tiver, chamar `discoverMovies({ providerIds: providerId ? [providerId] : providers.map(p => p.id), genreId, page: 1 })`. Grade responsiva (2 colunas no celular, 5 no desktop). Sem resultados: texto exato "Nenhum filme encontrado.". Nesta task, a página sempre carrega a página 1 (o "Carregar mais" vem na Task 5).

- [ ] **Step 6: Estados de carregamento e erro**

`loading.tsx` com a mensagem "Carregando filmes…". `error.tsx` (Client Component) com "Não foi possível carregar os filmes agora." e um botão "Tentar de novo" que chama `reset()`.

- [ ] **Step 7: Verificar no navegador**

Com `TMDB_READ_TOKEN` em `.env.local`, rodar `npm run dev` e conferir em http://localhost:3000:
- aparecem cartazes de filmes;
- clicar em "Netflix" muda a URL para `?provider=8` e a grade muda;
- escolher um gênero combina com o serviço;
- buscar "duna" mostra resultados, com filtros desativados e o aviso;
- buscar "xyzxyzxyz" mostra "Nenhum filme encontrado.";
- `?provider=abc&page=-3` carrega normalmente;
- sem o token (renomear `.env.local` e reiniciar), aparece a página de erro amigável.
Run também: `npm run build` · Expected: sem erros.

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: tela de lista com filtros por serviço, gênero e busca"`

---

### Task 5: "Carregar mais"

**Files:**
- Create: `src/app/api/movies/route.ts`, `src/components/MovieGrid.tsx`, `src/components/MovieGrid.test.tsx`
- Modify: `src/app/page.tsx` (passar a usar `MovieGrid`)

**Interfaces:**
- Consumes: `parseFilters`, `filtersToQuery`, `discoverMovies`, `searchMovies`, `getTopProviders`, `MovieCard`.
- Produces: `GET /api/movies?<mesmos filtros>&page=N` → JSON `MoviePage` (status 502 com `{ error: 'Falha ao buscar filmes' }` se o TMDB falhar). `<MovieGrid initial={MoviePage} query={string} />` (Client Component; `query` = `filtersToQuery` sem `page`). A página passa `key={query}` para o grid reiniciar quando os filtros mudam.

- [ ] **Step 1: Escrever os testes que falham** (mockar `fetch`)

```tsx
test('carrega a próxima página e junta os filmes', async () => {
  mockFetchJson({ page: 2, totalPages: 2, results: [movie(2, 'B')] })
  render(<MovieGrid initial={{ page: 1, totalPages: 2, results: [movie(1, 'A')] }} query="provider=8" />)
  await userClick(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(lastFetchUrl()).toBe('/api/movies?provider=8&page=2')
  expect(await screen.findByText('B')).toBeInTheDocument()
  expect(screen.getByText('A')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
})
test('sem mais páginas não mostra o botão', ...)             // page 1, totalPages 1
test('falha no fetch mostra "Erro ao carregar mais filmes." e mantém o botão', ...)
test('lista vazia mostra "Nenhum filme encontrado."', ...)
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 3: Implementar `MovieGrid`** (o botão fica desativado e mostra "Carregando…" durante o fetch; ignorar filmes com `id` repetido ao juntar as páginas, porque a popularidade muda entre as chamadas).
- [ ] **Step 4: Implementar `route.ts`** com a mesma regra da página (busca se houver `q`; caso contrário, discover com o serviço escolhido ou todos os 8).
- [ ] **Step 5: Rodar e ver passar** — Run: `npm test` · Expected: PASS.
- [ ] **Step 6: Trocar a grade da página por `MovieGrid` e verificar no navegador** — clicar em "Carregar mais" três vezes acrescenta filmes; trocar de serviço volta para a primeira página. `npm run build` sem erros.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: botão Carregar mais com rota interna"`

---

### Task 6: Tela de detalhes com "onde assistir"

**Files:**
- Create: `src/lib/availability.ts`, `src/lib/availability.test.ts`
- Create: `src/components/WhereToWatch.tsx`, `src/components/WhereToWatch.test.tsx`
- Create: `src/app/filme/[id]/page.tsx`, `src/app/filme/[id]/not-found.tsx`

**Interfaces:**
- Consumes: `getMovieDetails`, `getMovieProviders`, `TmdbError` (Task 2); `posterUrl`, `logoUrl` (Task 1).
- Produces:
  - `CountryAvailability = { code: string; name: string; providers: Provider[] }`
  - `Availability = { brazil: Provider[]; otherCountries: CountryAvailability[] }`
  - `summarizeAvailability(byCountry: ProvidersByCountry): Availability` — `otherCountries` exclui BR e vem ordenado por `name` (`localeCompare` em `pt-BR`).
  - `countryName(code: string): string` — `Intl.DisplayNames(['pt-BR'], { type: 'region' })`, devolve o próprio código se não conhecer.
  - `<WhereToWatch availability={Availability} />` (Client Component por causa do "ver todos").

- [ ] **Step 1: Escrever os testes que falham**

```ts
test('separa Brasil dos outros países e ordena por nome', () => {
  const r = summarizeAvailability({ US: [netflix], BR: [prime], PT: [max] })
  expect(r.brazil).toEqual([prime])
  expect(r.otherCountries.map(c => c.name)).toEqual(['Estados Unidos', 'Portugal'])
})
test('countryName traduz e devolve o código se desconhecido', () => {
  expect(countryName('GB')).toBe('Reino Unido')
  expect(countryName('ZZ')).toBe('ZZ')
})
```

```tsx
test('com Brasil mostra só os serviços do Brasil', ...)  // logos com alt = nome do serviço; sem "outros países"
test('sem Brasil mostra outros países: 5 primeiros e botão ver todos', async () => {
  render(<WhereToWatch availability={{ brazil: [], otherCountries: seisPaises }} />)
  expect(screen.getByText('Não disponível em streaming no Brasil.')).toBeInTheDocument()
  expect(screen.getByText('Disponível em outros países:')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(5)
  await userClick(screen.getByRole('button', { name: 'ver todos os 6 países' }))
  expect(screen.getAllByRole('listitem')).toHaveLength(6)
})
test('com 5 países ou menos não mostra o botão', ...)
test('sem nenhum país mostra "Não disponível em streaming no momento."', ...)
```

Cada país aparece como `<li>`: `Estados Unidos — Netflix, Max`.

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 3: Implementar `availability.ts` e `WhereToWatch.tsx`.**
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test` · Expected: PASS.

- [ ] **Step 5: Implementar a página `src/app/filme/[id]/page.tsx`**

`params` é uma Promise. Se `id` não for inteiro positivo, chamar `notFound()`. Buscar `getMovieDetails` e `getMovieProviders` em paralelo; se vier `TmdbError` com status 404, chamar `notFound()`. Mostrar: link "← voltar" (pequeno componente cliente: `router.back()` se houver histórico, para manter os filtros; senão, vai para `/`), cartaz `w500` (ou o bloco cinza), título e ano, nota com uma casa decimal (`⭐ 8.2`), duração em `Xh YYmin` (omitir se `null`), gêneros, sinopse (ou "Sinopse não disponível." se vazia) e `<WhereToWatch />`. Título da aba: `<título> — Catálogo de Filmes` via `generateMetadata`. `not-found.tsx`: "Filme não encontrado." com link para a lista.

- [ ] **Step 6: Verificar no navegador**
- um filme popular da lista mostra os logos dos serviços no Brasil;
- um filme só disponível fora do Brasil (achar pela busca, ex.: um filme antigo pouco conhecido) mostra a lista de países e o botão "ver todos";
- `/filme/abc` e `/filme/999999999` mostram "Filme não encontrado.";
- "← voltar" retorna à lista com os filtros mantidos.
Run: `npm test` e `npm run build` · Expected: tudo passa, build sem erros.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: tela de detalhes com onde assistir no Brasil e em outros países"`
