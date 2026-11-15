# Séries e filtro Doramas — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Acrescentar a aba Séries e o botão "🌸 Doramas" (nas duas abas) ao catálogo existente, adaptando as peças atuais para "filme ou série" sem duplicar código.

**Architecture:** Um tipo `MediaType = 'movie' | 'tv'` passa por todas as camadas. Um arquivo de configuração (`src/lib/media.ts`) guarda o que muda entre filme e série (endereços, textos). As funções do TMDB, o carregador da lista, a grade, os controles e a tela de detalhes recebem o tipo. As páginas `/` e `/series` usam o mesmo componente de lista, e `/filme/[id]` e `/serie/[id]` usam o mesmo componente de detalhes.

**Tech Stack:** Next.js 16.4 (App Router, `cacheComponents`), TypeScript, Tailwind 4, Vitest + Testing Library (testes usam os globais do Vitest; não importar de `'vitest'`).

**Spec:** `docs/superpowers/specs/2026-11-15-series-e-doramas-design.md`

## Global Constraints

- Ler o guia relevante em `node_modules/next/dist/docs/` antes de usar uma API do Next (regra do `AGENTS.md`).
- Todas as regras atuais continuam: `watch_region=BR`, `language=pt-BR`, `with_watch_monetization_types=flatrate`, `sort_by=popularity.desc`, máximo de 500 páginas, token só no servidor (`server-only`).
- Doramas: `with_origin_country=KR|JP|CN|TW|TH`. Gêneros excluídos: filmes `[16]`; séries `[16, 10764, 10767, 10763]`, enviados como `without_genres` separados por `,`.
- Com Doramas ligado, os gêneros excluídos somem da lista de gêneros e, se vierem na URL, são ignorados.
- Endereços: `/` (filmes), `/series`, `/filme/[id]`, `/serie/[id]`. Doramas na URL: `doramas=1`.
- Trocar de aba mantém `provider` e `doramas`, e limpa `genre`, `q` e `page`.
- Textos exatos: botão `🌸 Doramas`; abas `Filmes` e `Séries`; cabeçalho `🎬 Catálogo`; rodapé `Dados de filmes e séries fornecidos pelo TMDB. Disponibilidade em streaming fornecida pelo JustWatch.`; link `Ver no streaming`.
- O link "Ver no streaming" usa `results.BR.link` e só aparece quando há assinatura no Brasil.
- Comportamento da aba Filmes não muda (exceto os textos de cabeçalho/rodapé acima).
- Fora de escopo: dublagem, episódios/temporadas individuais, trailers, login, ajustes pendentes como "⭐ 0.0".
- Testes no mesmo estilo dos atuais; `npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run build` limpos ao fim de cada task.
- Trabalhar no branch `feat/series-doramas`.

## Review Focus

1. URL com Doramas e um gênero excluído (`/series?doramas=1&genre=16`) → o gênero é ignorado e a lista aparece normalmente, não vazia. (Task 3)
2. Trocar de aba com um gênero escolhido → o gênero é limpo, porque os números de gênero de filmes e séries não batem. (Task 1)
3. `/serie/abc` ou uma série que o TMDB responde com 404 → "Série não encontrada.", não tela de erro. (Task 5)
4. Série sem data de estreia ou sem número de temporadas → a página abre sem essas informações, sem quebrar. (Task 2 e Task 5)
5. `/api/titles?type=xyz` → tratado como filme, nunca erro 500. (Task 1 e Task 3)

---

### Task 1: Configuração de filme/série, Doramas e filtros

**Files:**
- Create: `src/lib/media.ts`, `src/lib/media.test.ts`, `src/lib/doramas.ts`, `src/lib/doramas.test.ts`
- Modify: `src/lib/filters.ts`, `src/lib/filters.test.ts`

**Interfaces:**
- Produces (`media.ts`):
  - `type MediaType = 'movie' | 'tv'`
  - `MEDIA: Record<MediaType, { label: string; listPath: string; detailPrefix: string; noneFound: string; notFound: string; searchNote: string }>` com:
    - movie: `'Filmes'`, `'/'`, `'/filme'`, `'Nenhum filme encontrado.'`, `'Filme não encontrado.'`, `'A busca mostra todos os filmes. A disponibilidade aparece na página de cada filme.'`
    - tv: `'Séries'`, `'/series'`, `'/serie'`, `'Nenhuma série encontrada.'`, `'Série não encontrada.'`, `'A busca mostra todas as séries. A disponibilidade aparece na página de cada série.'`
  - `parseMediaType(raw: string | null | undefined): MediaType` (`'tv'` → tv; qualquer outra coisa → movie)
  - `detailPath(type: MediaType, id: number): string`
  - `listHref(type: MediaType, filters: Omit<Filters, 'page'> & { page?: number }): string` (`listPath` + `?` + `filtersToQuery`, sem `?` se vazio)
  - `switchTabHref(target: MediaType, current: Pick<Filters, 'providerId' | 'doramas'>): string`
- Produces (`doramas.ts`):
  - `DORAMA_COUNTRIES = ['KR', 'JP', 'CN', 'TW', 'TH']`
  - `doramaExcludedGenres(type: MediaType): number[]`
  - `visibleGenres(genres: Genre[], type: MediaType, doramas: boolean): Genre[]`
  - `effectiveGenreId(type: MediaType, genreId: number | undefined, doramas: boolean): number | undefined` (undefined se o gênero for excluído)
- Produces (`filters.ts`): `Filters` ganha `doramas: boolean` (obrigatório; `false` por padrão). `parseFilters` lê `doramas=1` como `true` (qualquer outro valor → `false`). `filtersToQuery` aceita `doramas?: boolean` e escreve `doramas=1` só quando `true`, na ordem `provider, genre, doramas, q, page`.

- [ ] **Step 1: Criar o branch** — `git checkout -b feat/series-doramas`

- [ ] **Step 2: Escrever os testes que falham**

```ts
// media.test.ts
test('parseMediaType', () => {
  expect(parseMediaType('tv')).toBe('tv')
  expect(parseMediaType('movie')).toBe('movie')
  expect(parseMediaType('xyz')).toBe('movie')
  expect(parseMediaType(null)).toBe('movie')
})
test('detailPath', () => {
  expect(detailPath('movie', 7)).toBe('/filme/7')
  expect(detailPath('tv', 9)).toBe('/serie/9')
})
test('listHref', () => {
  expect(listHref('movie', { doramas: false })).toBe('/')
  expect(listHref('tv', { providerId: 8, doramas: true })).toBe('/series?provider=8&doramas=1')
})
test('switchTabHref mantém streaming e Doramas e limpa o resto', () => {
  expect(switchTabHref('tv', { providerId: 8, doramas: true })).toBe('/series?provider=8&doramas=1')
  expect(switchTabHref('movie', { doramas: false })).toBe('/')
})
```

```ts
// doramas.test.ts
test('gêneros excluídos por tipo', () => {
  expect(doramaExcludedGenres('movie')).toEqual([16])
  expect(doramaExcludedGenres('tv')).toEqual([16, 10764, 10767, 10763])
})
test('visibleGenres esconde excluídos só com Doramas ligado', () => {
  const g = [{ id: 16, name: 'Animação' }, { id: 18, name: 'Drama' }, { id: 10764, name: 'Reality' }]
  expect(visibleGenres(g, 'tv', true)).toEqual([{ id: 18, name: 'Drama' }])
  expect(visibleGenres(g, 'tv', false)).toEqual(g)
  expect(visibleGenres(g, 'movie', true).map((x) => x.id)).toEqual([18, 10764])
})
test('effectiveGenreId ignora gênero excluído com Doramas', () => {
  expect(effectiveGenreId('tv', 16, true)).toBeUndefined()
  expect(effectiveGenreId('tv', 16, false)).toBe(16)
  expect(effectiveGenreId('movie', 10749, true)).toBe(10749)
})
```

Em `filters.test.ts`: os `toEqual` existentes passam a incluir `doramas: false`, e são acrescentados:

```ts
test('lê doramas=1', () => {
  expect(parseFilters({ doramas: '1' }).doramas).toBe(true)
  expect(parseFilters({ doramas: 'sim' }).doramas).toBe(false)
})
test('filtersToQuery escreve doramas na ordem', () => {
  expect(filtersToQuery({ providerId: 8, genreId: 35, doramas: true, page: 2 })).toBe('provider=8&genre=35&doramas=1&page=2')
})
```

- [ ] **Step 3: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL (módulos `./media` e `./doramas` não existem; testes de `doramas` em filters falham).
- [ ] **Step 4: Implementar `media.ts`, `doramas.ts` e a mudança em `filters.ts`.** Os chamadores atuais de `parseFilters`/`filtersToQuery` continuam compilando (o novo campo é opcional em `filtersToQuery`).
- [ ] **Step 5: Rodar e ver passar** — Run: `npm test && npx tsc --noEmit` · Expected: todos PASS, tsc sem erros.
- [ ] **Step 6: Commit** — `git add src/lib && git commit -m "feat: configuração de filmes/séries, regras de Doramas e filtro na URL"`

---

### Task 2: Funções do TMDB para filmes e séries

**Files:**
- Rename: `src/lib/tmdb/movies.ts` → `src/lib/tmdb/titles.ts`, `movies.test.ts` → `titles.test.ts`
- Modify: `src/lib/tmdb/types.ts`, e todos os arquivos que importam de `movies.ts` ou usam os tipos renomeados (`catalog.ts`, `catalog.test.ts`, `src/app/page.tsx`, `src/app/api/movies/route.ts`, `src/app/filme/[id]/page.tsx`, `MovieCard.tsx`, `MovieGrid.tsx`, `ProviderFilter.tsx`, `GenreSelect.tsx`, `WhereToWatch.tsx`, `availability.ts` e testes) — só o mínimo para compilar, mantendo o comportamento de filmes.

**Interfaces:**
- Consumes: `MediaType`, `DORAMA_COUNTRIES`, `doramaExcludedGenres` (Task 1).
- Produces (`types.ts`): renomear `MovieSummary` → `TitleSummary`, `MoviePage` → `TitlePage`, `MovieDetails` → `TitleDetails` (campos iguais; `title` guarda o `name` das séries; `releaseYear` vem de `first_air_date` nas séries). `TitleDetails` ganha `seasons: number | null` (séries: `number_of_seasons`; filmes: `null`). Para séries, `runtime` é `null`. Novo: `WatchProviders = { byCountry: ProvidersByCountry; brazilLink: string | null }`.
- Produces (`titles.ts`):
  - `discoverTitles(type: MediaType, opts: { providerIds: number[]; genreId?: number; doramas: boolean; page: number }): Promise<TitlePage>` — com `doramas: true` envia `with_origin_country=KR|JP|CN|TW|TH` e `without_genres=<excluídos do tipo, separados por ,>`.
  - `searchTitles(type, opts: { query: string; page: number }): Promise<TitlePage>`
  - `getTitleDetails(type, id: number): Promise<TitleDetails>`
  - `getWatchProviders(type, id: number): Promise<WatchProviders>` (`brazilLink` = `results.BR.link` só se BR tiver `flatrate`; senão `null`)
  - `getTopProviders(type, limit = 8): Promise<Provider[]>` (endpoint `/watch/providers/{movie|tv}`, mesma lista fixa `SUBSCRIPTION_PROVIDER_IDS`)
  - `getGenres(type): Promise<Genre[]>` (`/genre/{movie|tv}/list`)
  - Os endpoints usam `type` direto no caminho (`/discover/${type}`, `/search/${type}`, `/${type}/${id}`...).

- [ ] **Step 1: Escrever os testes que falham** — renomear o arquivo de testes, trocar as chamadas para as novas assinaturas com `'movie'` (os testes existentes continuam valendo, com `doramas: false` no discover), e acrescentar:

```ts
test('discoverTitles de séries usa /discover/tv', ...)          // pathname '/3/discover/tv', watch_region BR, flatrate
test('séries usam name e first_air_date', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [{ id: 5, name: 'Pousando no Amor', poster_path: '/p.jpg', first_air_date: '2019-12-14', vote_average: 8.7 }] })
  const r = await discoverTitles('tv', { providerIds: [8], doramas: false, page: 1 })
  expect(r.results[0]).toEqual({ id: 5, title: 'Pousando no Amor', posterPath: '/p.jpg', releaseYear: 2019, voteAverage: 8.7 })
})
test('Doramas em séries envia países e exclui animação/reality/talk/news', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], doramas: true, page: 1 })
  const url = new URL(lastFetchUrl())
  expect(url.searchParams.get('with_origin_country')).toBe('KR|JP|CN|TW|TH')
  expect(url.searchParams.get('without_genres')).toBe('16,10764,10767,10763')
})
test('Doramas em filmes exclui só animação', ...)              // without_genres '16'
test('sem Doramas não envia país nem without_genres', ...)
test('getTitleDetails de série mapeia temporadas e runtime null', ...) // number_of_seasons 2 → seasons 2; runtime null
test('série sem data e sem temporadas', ...)                    // first_air_date '' e number_of_seasons ausente → releaseYear null, seasons null
test('getWatchProviders devolve link do Brasil só com assinatura', ...) // BR {link, flatrate} → brazilLink = link; BR só {link, rent} → null e BR fora de byCountry
test('getTopProviders e getGenres de séries usam os endpoints de tv', ...)
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL (`./titles` não existe).
- [ ] **Step 3: Implementar `titles.ts` e os tipos; remover `movies.ts`; atualizar os chamadores** com `'movie'` fixo (a rota e a página continuam funcionando só para filmes nesta task).
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test && npx tsc --noEmit && npm run build` · Expected: todos PASS, build sem erros.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "refactor: funções do TMDB servem filmes e séries, com filtro de Doramas"`

---

### Task 3: Carregador da lista, rota "Carregar mais" e grade por tipo

**Files:**
- Modify: `src/lib/catalog.ts`, `src/lib/catalog.test.ts`
- Rename: `src/app/api/movies/route.ts` → `src/app/api/titles/route.ts`
- Rename: `MovieCard.tsx` → `TitleCard.tsx`, `MovieGrid.tsx` → `TitleGrid.tsx` (e seus testes)

**Interfaces:**
- Consumes: Task 1 (`MediaType`, `MEDIA`, `detailPath`, `parseMediaType`, `effectiveGenreId`, `Filters`), Task 2 (`discoverTitles`, `searchTitles`, `getTopProviders`, `TitlePage`, `TitleSummary`).
- Produces:
  - `loadCatalogPage(type: MediaType, filters: Filters, allProviderIds: number[]): Promise<TitlePage>` — busca se houver `q`; senão discover com `genreId: effectiveGenreId(type, filters.genreId, filters.doramas)` e `doramas: filters.doramas`.
  - `GET /api/titles?type=<movie|tv>&<filtros>&page=N` → `TitlePage` JSON (502 `{ error: 'Falha ao buscar títulos' }` em falha). `type` lido com `parseMediaType`.
  - `<TitleCard item={TitleSummary} type={MediaType} />` (link via `detailPath`); `PosterPlaceholder` continua exportado.
  - `<TitleGrid type={MediaType} initial={TitlePage} query={string} />` — busca `/api/titles?type=<type>&<query>&page=N`; lista vazia mostra `MEDIA[type].noneFound`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// catalog.test.ts (atualizar os existentes para (type, filters, ids) e acrescentar)
test('séries com Doramas e gênero excluído ignoram o gênero', async () => {
  await loadCatalogPage('tv', { genreId: 16, doramas: true, page: 1 }, [8])
  expect(discoverTitles).toHaveBeenCalledWith('tv', { providerIds: [8], genreId: undefined, doramas: true, page: 1 })
})
test('busca em séries usa searchTitles com tv', ...)
```

```tsx
// TitleGrid.test.tsx (atualizar os existentes e acrescentar)
test('séries pedem /api/titles com type=tv', async () => {
  mockFetchJson({ page: 2, totalPages: 2, results: [] })
  render(<TitleGrid type="tv" initial={{ page: 1, totalPages: 2, results: [item(1, 'A')] }} query="provider=8" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(String(fetchMock.mock.calls[0][0])).toBe('/api/titles?type=tv&provider=8&page=2')
})
test('lista vazia de séries mostra "Nenhuma série encontrada."', ...)
// TitleCard.test.tsx
test('TitleCard de série aponta para /serie/{id}', ...)
```

O teste existente de URL do grid passa a esperar `/api/titles?type=movie&provider=8&page=2`.

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 3: Implementar** o carregador, a rota (com `getTopProviders(type)` quando não houver `q` nem `providerId`), o `TitleCard` e o `TitleGrid`. A página `/` passa a usar `TitleGrid type="movie"`.
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test && npx tsc --noEmit && npm run build` · Expected: PASS, build sem erros.
- [ ] **Step 5: Verificar a rota** — com `npm run dev` e o token: `/api/titles?type=tv&doramas=1` devolve séries asiáticas; `/api/titles?type=xyz` devolve filmes (status 200).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: lista e Carregar mais funcionam para filmes e séries"`

---

### Task 4: Aba Séries, botão Doramas e abas no topo

**Files:**
- Create: `src/components/CatalogPage.tsx` (Server Component compartilhado), `src/app/series/page.tsx`, `src/components/DoramasToggle.tsx`, `src/components/DoramasToggle.test.tsx`, `src/components/MediaTabs.tsx`, `src/components/MediaTabs.test.tsx`
- Modify: `src/app/page.tsx`, `src/components/ProviderFilter.tsx`, `GenreSelect.tsx`, `SearchBox.tsx`, `src/app/layout.tsx`, `src/components/Footer.tsx`, `src/app/error.tsx`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces:
  - `<CatalogPage type={MediaType} searchParams={PageProps<'/'>['searchParams']} />` — o conteúdo atual de `page.tsx`, parametrizado: `getTopProviders(type)`, `getGenres(type)` filtrado por `visibleGenres`, `loadCatalogPage(type, ...)`, aviso `MEDIA[type].searchNote` na busca, `<TitleGrid type>`. Fica dentro de `<Suspense>` (como hoje). `src/app/page.tsx` → `type="movie"`; `src/app/series/page.tsx` → `type="tv"`.
  - Controles (`ProviderFilter`, `GenreSelect`, `DoramasToggle`) recebem `type: MediaType`, `filters: Omit<Filters, 'page'>` e `disabled: boolean`, e navegam com `router.push(listHref(type, { ...filters, <campo alterado> }))`. Trocar de streaming ou de Doramas mantém os outros filtros, exceto `q`. `SearchBox` recebe `type` e `initialQuery`; envia `listHref(type, { q, doramas: false })`, e "Limpar" volta para `MEDIA[type].listPath`.
  - `<DoramasToggle type filters disabled />`: botão com texto `🌸 Doramas` e `aria-pressed`. Clicar inverte `doramas`. Se ligar e o gênero atual estiver excluído, remove o gênero da URL.
  - `<MediaTabs />` (Client Component no cabeçalho): links `Filmes` e `Séries` com `aria-current="page"` na aba ativa. Aba ativa = `tv` se o caminho começar com `/series` ou `/serie/`; senão `movie`. Os links usam `switchTabHref` com `provider`/`doramas` lidos de `useSearchParams()`. Fica dentro de `<Suspense>` no layout, com fallback mostrando as abas sem filtros (ler `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`).
  - Textos: cabeçalho `🎬 Catálogo`; título do site `Catálogo de Filmes e Séries`; rodapé com o texto exato das Global Constraints; `error.tsx` passa a dizer `Não foi possível carregar os dados agora.`

- [ ] **Step 1: Escrever os testes que falham** (mockar `next/navigation`: `useRouter` → `{ push: vi.fn() }`, `usePathname`, `useSearchParams`)

```tsx
test('DoramasToggle liga mantendo streaming e gênero', async () => {
  render(<DoramasToggle type="tv" filters={{ providerId: 8, genreId: 10749, doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: '🌸 Doramas' }))
  expect(push).toHaveBeenCalledWith('/series?provider=8&genre=10749&doramas=1')
})
test('DoramasToggle ao ligar remove gênero excluído', ...)   // genreId 16 → '/series?doramas=1'
test('DoramasToggle desliga', ...)                            // doramas true → '/series?provider=8'; aria-pressed true antes
test('DoramasToggle desativado na busca', ...)                // disabled → botão disabled
test('MediaTabs marca Séries em /serie/5 e leva filtros', () => {
  mockPath('/serie/5', 'provider=8&doramas=1&genre=35')
  render(<MediaTabs />)
  expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute('href', '/?provider=8&doramas=1')
})
test('MediaTabs marca Filmes em /', ...)
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 3: Implementar `DoramasToggle` e `MediaTabs`.**
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test` · Expected: PASS.
- [ ] **Step 5: Implementar `CatalogPage`, as duas páginas, os ajustes nos controles, no layout, no rodapé e no `error.tsx`.**
- [ ] **Step 6: Verificar** — Run: `npm test && npx tsc --noEmit && npm run lint && npm run build` · Expected: tudo limpo, com as rotas `/` e `/series` no build. Com `npm run dev` e o token:
  - `/series` mostra séries e a aba Séries fica destacada;
  - Doramas + Netflix + Romance mostra doramas de romance, sem animes;
  - com Doramas ligado, "Animação" some da lista de gêneros;
  - `/series?doramas=1&genre=16` mostra a lista (gênero ignorado);
  - trocar de aba mantém Netflix e Doramas, e o gênero volta para "Todos";
  - a aba Filmes continua igual a antes.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: aba Séries, botão Doramas e abas no topo"`

---

### Task 5: Página de detalhes da série e link "Ver no streaming"

**Files:**
- Create: `src/components/TitleDetailsPage.tsx` (Server Component compartilhado + `titleMetadata`), `src/app/serie/[id]/page.tsx`, `src/app/serie/[id]/not-found.tsx`
- Modify: `src/app/filme/[id]/page.tsx`, `src/app/filme/[id]/not-found.tsx`, `src/components/WhereToWatch.tsx`, `src/components/WhereToWatch.test.tsx`, `src/lib/format.ts`, `src/lib/format.test.ts`

**Interfaces:**
- Consumes: Task 1 (`MEDIA`), Task 2 (`getTitleDetails`, `getWatchProviders`, `TitleDetails`, `WatchProviders`), `summarizeAvailability`, `formatRuntime`, `formatRating`.
- Produces:
  - `formatSeasons(n: number | null): string | null` → `1` → `'1 temporada'`, `3` → `'3 temporadas'`, `null`/`0` → `null`.
  - `<WhereToWatch availability={Availability} brazilLink?={string | null} />` — no caso "disponível no Brasil", mostra depois dos logos o link `Ver no streaming` (`target="_blank"`, `rel="noreferrer"`) quando `brazilLink` existir. Nos outros casos, sem link.
  - `<TitleDetailsPage type={MediaType} params={Promise<{ id: string }>} />` e `titleMetadata(type, params): Promise<Metadata>` (título `<nome> — Catálogo`) — o conteúdo atual de `filme/[id]/page.tsx`, parametrizado. Mostra `⏱ runtime` só para filmes e `formatSeasons` para séries. Usa `cache()` e `notFound()` como hoje.
  - As duas rotas (`filme/[id]` e `serie/[id]`) ficam finas e só repassam o `type`. Cada `not-found.tsx` mostra `MEDIA[type].notFound` com o link para `MEDIA[type].listPath`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
test('formatSeasons', () => {
  expect(formatSeasons(1)).toBe('1 temporada')
  expect(formatSeasons(3)).toBe('3 temporadas')
  expect(formatSeasons(null)).toBeNull()
  expect(formatSeasons(0)).toBeNull()
})
```

```tsx
test('com Brasil e link mostra "Ver no streaming"', () => {
  render(<WhereToWatch availability={{ brazil: [netflix], otherCountries: [] }} brazilLink="https://www.themoviedb.org/tv/5/watch?locale=BR" />)
  expect(screen.getByRole('link', { name: 'Ver no streaming' })).toHaveAttribute('href', 'https://www.themoviedb.org/tv/5/watch?locale=BR')
})
test('sem Brasil não mostra o link mesmo com brazilLink', ...)
test('com Brasil e sem link não mostra o link', ...)
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 3: Implementar `formatSeasons` e o link no `WhereToWatch`.**
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test` · Expected: PASS.
- [ ] **Step 5: Implementar `TitleDetailsPage`, as rotas e os `not-found`.**
- [ ] **Step 6: Verificar** — Run: `npm test && npx tsc --noEmit && npm run lint && npm run build` · Expected: tudo limpo, com `/serie/[id]` no build. Com `npm run dev` e o token:
  - clicar numa série abre `/serie/<id>` com temporadas, gêneros e onde assistir;
  - "Ver no streaming" aparece numa série/filme disponível no Brasil e abre a página do TMDB;
  - uma série só disponível fora do Brasil mostra a lista de países;
  - `/serie/abc` e `/serie/999999999` mostram "Série não encontrada.";
  - os detalhes de filmes continuam iguais a antes, agora com o link.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: detalhes de séries e link Ver no streaming"`
