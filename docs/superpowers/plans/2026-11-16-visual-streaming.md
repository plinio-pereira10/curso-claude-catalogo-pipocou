# Visual estilo streaming — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tela inicial com banner + fileiras por streaming (sem filtros), grade com cartões deitados (com filtros), menu novo e detalhes com imagem de cena, no visual azul-noite descrito no design.

**Architecture:** Dados novos do TMDB (`backdropPath`, `overview`, logo do título) em `titles.ts`; montagem da tela inicial numa função pura + carregador em `src/lib/home.ts`; componentes visuais novos (`TopBar`, `HeroBanner`, `TitleRow`, `FilterBar`) e os existentes restilizados. O cabeçalho sai do `layout.tsx` e cada página renderiza o seu `TopBar`.

**Tech Stack:** Next.js 16.4 (cacheComponents, `'use cache'`), React 19, Tailwind 4, TypeScript, Vitest (globais) + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-16-visual-streaming-design.md`

## Global Constraints

- Branch: `feat/visual-streaming`.
- Antes de mexer em fontes, imagens ou cache, ler `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`, `12-images.md` e `08-caching.md` (o Next desta versão difere do que você conhece).
- Cores (tokens em `globals.css`): Noite `#0D1520`, Superfície `#1A2533`, Linha `#2C3A4B`, Texto `#F1F4F8`, Texto suave `#93A1B2`, Âmbar `#F2C14E`. Doramas continua `pink-300`. Sem o azul da marca Prime.
- Fonte: Figtree (`next/font/google`, variável `--font-figtree`) no lugar da Geist. Pesos 400/600/800.
- Margem lateral única: `export const GUTTER = 'px-4 sm:px-8 lg:px-12'` em `src/lib/ui.ts`, usada no menu, banner, filtros, fileiras e grade.
- Sem letras todas maiúsculas em rótulos; sem "→" em botões.
- Textos exatos: `Ver detalhes`, `Ver todos`, `Carregar mais`, `← voltar`.
- Nenhum logo/nome "Prime"/Amazon no site.
- Foco do teclado: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` em tudo que é clicável.

## Review Focus

1. Um erro especial do Next (aborto do prerender) dentro do `Promise.allSettled` das fileiras precisa ser relançado com `unstable_rethrow`, senão a página é gerada sem fileiras. (Task 2)
2. O mesmo título em 1º lugar em dois streamings, ou menos de 5 streamings → banner sem repetidos e com menos slides; com 0 destaques o banner não aparece; com 1 não há bolinhas nem troca automática. (Tasks 2 e 6)
3. Título sem imagem de cena nunca vai para o banner; cartão sem imagem de cena usa o cartaz; sem nenhuma imagem, bloco com o nome. (Tasks 2 e 4)
4. Celular (375px): a página inteira nunca rola para o lado; só as fileiras e a faixa de logos rolam. (Tasks 3, 5, 7 — conferência manual na Task 9)
5. Quem usa teclado: setas das fileiras, bolinhas do banner e logos dos streamings têm nome acessível e foco visível. (Tasks 3, 5, 6)

---

### Task 1: Dados novos do TMDB

**Files:**
- Modify: `src/lib/tmdb/types.ts`, `src/lib/tmdb/titles.ts`, `src/lib/images.ts`
- Test: `src/lib/tmdb/titles.test.ts`, `src/lib/images.test.ts`, e os testes que montam `TitleSummary` (`TitleCard.test.tsx`, `TitleGrid.test.tsx`, outros que o `tsc`/vitest apontar)

**Interfaces:**
- Produces:
  - `TitleSummary` ganha `backdropPath: string | null` e `overview: string` (`TitleDetails` herda; o `overview` próprio de `TitleDetails` sai).
  - `backdropUrl(path: string | null, size: 'w780' | 'w1280' = 'w780'): string | null` em `images.ts`.
  - `getProviderRow(type: MediaType, providerId: number): Promise<TitleSummary[]>` — `'use cache'` + `cacheLife('hours')`; devolve `discoverTitles(type, { providerIds: [providerId], doramas: false, page: 1 }).results`.
  - `getTitleLogo(type: MediaType, id: number): Promise<string | null>` — `'use cache'` + `cacheLife('hours')`; GET `/{type}/{id}/images` com `include_image_language: 'pt,en,null'`; escolhe o primeiro logo com `iso_639_1 === 'pt'`, senão `'en'`, senão `null`-idioma, senão `null`.

- [ ] **Step 1: Criar a branch** `git switch -c feat/visual-streaming`.
- [ ] **Step 2: Testes que falham** em `titles.test.ts`:
  - `discoverTitles converte backdrop_path e overview` — resultado cru com `backdrop_path: '/b.jpg', overview: 'Sinopse'` → `results[0]` tem `backdropPath: '/b.jpg', overview: 'Sinopse'`; sem os campos → `backdropPath: null, overview: ''`.
  - `getProviderRow pede só aquele streaming, página 1, e guarda por hours` — `with_watch_providers` = `'337'`, `page` = `'1'`, `cacheLife` chamado com `'hours'`, devolve a lista.
  - `getTitleLogo prefere pt, depois en` — logos `[{file_path:'/en.png',iso_639_1:'en'},{file_path:'/pt.png',iso_639_1:'pt'}]` → `'/pt.png'`; só `en` → `'/en.png'`; lista vazia → `null`; URL `/3/movie/7/images` com `include_image_language=pt,en,null`.
  - Ajustar o teste `listas de streamings e gêneros são guardadas por "hours"` se necessário (continua com 2 chamadas).
  - Em `images.test.ts`: `backdropUrl('/b.jpg')` → `https://image.tmdb.org/t/p/w780/b.jpg`; com `'w1280'` → `.../w1280/b.jpg`; `null` → `null`.
- [ ] **Step 3: Rodar** `npx vitest run src/lib` — esperado: FALHA nos testes novos.
- [ ] **Step 4: Implementar** os tipos, `toTitleSummary` (`backdrop_path ?? null`, `overview ?? ''`), `getTitleDetails` sem montar `overview` à parte, `backdropUrl`, `getProviderRow`, `getTitleLogo`.
- [ ] **Step 5: Atualizar os objetos `TitleSummary` dos testes de componentes** com `backdropPath: null, overview: ''`.
- [ ] **Step 6: Rodar** `npm test` e `npx tsc --noEmit` — esperado: tudo PASSA, sem erro de tipo.
- [ ] **Step 7: Commit** `feat: imagem de cena, sinopse e logo do título vindos do TMDB`.

---

### Task 2: Montagem da tela inicial

**Files:**
- Create: `src/lib/home.ts`, `src/lib/home.test.ts`

**Interfaces:**
- Consumes: `getTopProviders`, `getProviderRow`, `getTitleLogo` (Task 1); `Filters` de `filters.ts`.
- Produces:
  ```ts
  export type ProviderRow = { provider: Provider; titles: TitleSummary[] }
  export type FeaturedItem = { title: TitleSummary; provider: Provider; logoPath: string | null }
  export type HomeData = { rows: ProviderRow[]; featured: FeaturedItem[] }
  export const MAX_FEATURED = 5
  export function hasActiveFilters(f: Omit<Filters, 'page'>): boolean
  export function pickFeatured(rows: ProviderRow[], max?: number): Omit<FeaturedItem, 'logoPath'>[]
  export async function loadHome(type: MediaType): Promise<HomeData>
  ```

- [ ] **Step 1: Testes que falham** em `home.test.ts` (mockar `./tmdb/titles` e `next/navigation` com `unstable_rethrow: vi.fn()`):
  - `hasActiveFilters` → `false` para `{ doramas: false }`; `true` para cada um: `providerId: 8`, `genreId: 18`, `minRating: 7`, `q: 'duna'`, `doramas: true`.
  - `pickFeatured pega o 1º título com imagem de cena de cada fileira, sem repetir` — fileira A `[t1(sem backdrop), t2]`, fileira B `[t2, t3]`, fileira C `[t4]` → títulos `[t2, t3, t4]` com os provedores A, B, C.
  - `pickFeatured respeita o máximo` — 7 fileiras → 5 itens.
  - `loadHome monta uma fileira por streaming, na ordem` — 2 provedores → `rows` na mesma ordem; `featured[i].logoPath` vem de `getTitleLogo`.
  - `loadHome esconde a fileira que falhou e a vazia` — provedor 1 rejeita, provedor 2 devolve `[]`, provedor 3 ok → `rows` só com o 3; `unstable_rethrow` chamado com o erro do 1.
  - `loadHome relança quando todas as fileiras falham` — todas rejeitam → `await expect(loadHome('movie')).rejects.toThrow()`.
  - `loadHome usa null quando o logo do título falha` — `getTitleLogo` rejeita → `logoPath: null`, sem erro.
- [ ] **Step 2: Rodar** `npx vitest run src/lib/home.test.ts` — esperado: FALHA (módulo não existe).
- [ ] **Step 3: Implementar** `home.ts`. `loadHome`: `getTopProviders(type)` → `Promise.allSettled` de `getProviderRow` por provedor; para cada rejeitado chamar `unstable_rethrow(reason)`; se havia provedores e todos rejeitaram, lançar o primeiro motivo; descartar fileiras vazias; `pickFeatured`; logos com `Promise.allSettled` (rejeitado → `null`, também passando por `unstable_rethrow`).
- [ ] **Step 4: Rodar** o arquivo — esperado: PASSA.
- [ ] **Step 5: Commit** `feat: montagem das fileiras e destaques da tela inicial`.

---

### Task 3: Base visual e menu do topo

**Files:**
- Create: `src/lib/ui.ts`, `src/components/TopBar.tsx`, `src/components/TopBar.test.tsx`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/MediaTabs.tsx`, `src/components/ProviderFilter.tsx` (+test), `src/components/SearchBox.tsx`, `src/components/Footer.tsx`, `src/components/CatalogPage.tsx`, `src/components/TitleDetailsPage.tsx`, `src/app/filme/[id]/not-found.tsx`, `src/app/serie/[id]/not-found.tsx`

**Interfaces:**
- Produces:
  - `GUTTER` (ver Global Constraints).
  - `TopBar({ type, overlay = false, providers, filters }: { type: MediaType; overlay?: boolean; providers?: Provider[]; filters?: Omit<Filters, 'page'> })` — servidor; mostra 🎬 Catálogo, `MediaTabs` (dentro de `Suspense` com `MediaTabsFallback`), divisória, `ProviderFilter` (só quando `providers` e `filters` vêm; `disabled={Boolean(filters.q)}`), divisória, `SearchBox key={filters?.q ?? ''} type initialQuery={filters?.q}`. `overlay` → `absolute inset-x-0 top-0 z-20` com degradê Noite→transparente; senão fundo Noite com borda inferior Linha. Não é fixo ao rolar (decisão do construtor registrada).
  - Tailwind: cores como `bg-noite`, `bg-superficie`, `border-linha`, `text-texto`, `text-suave`, `text-ambar` via `@theme inline`.

- [ ] **Step 1: Testes que falham:**
  - `ProviderFilter.test.tsx`: novo `mostra só o logo, com o nome como nome acessível` — botão `{ name: 'Netflix' }` existe e `screen.queryByText('Netflix')` é `null`. Os testes atuais continuam.
  - `TopBar.test.tsx` (mockar `next/navigation`: `usePathname`, `useSearchParams`, `useRouter`): sem `providers` não há `role="group"` "Filtrar por streaming"; com `providers` e `filters` há; tem `role="search"`; links Filmes e Séries.
- [ ] **Step 2: Rodar** esses dois arquivos — esperado: FALHA.
- [ ] **Step 3: Implementar:**
  - `globals.css`: tokens do Global Constraints em `:root`, mapeados em `@theme inline` (`--color-noite`…, `--font-sans: var(--font-figtree)`); `body` com fundo Noite e texto Texto.
  - `layout.tsx`: Figtree no lugar da Geist; sem `<header>`; `<main className="flex-1">` sem largura máxima nem padding.
  - `ProviderFilter`: só o logo (32px, arredondado), `aria-label={p.name}`, ativo com contorno branco e o resto com opacidade reduzida; no celular a faixa rola para o lado (`overflow-x-auto`, sem quebrar linha).
  - `MediaTabs`: pílula branca no ativo, texto escuro, peso 600.
  - `SearchBox`, `Footer`: cores novas (Superfície/Linha/Suave).
  - `CatalogPage` (provisório até a Task 7): renderiza `<TopBar type providers filters />` acima do conteúdo, que fica num `div` com `GUTTER` e `py-6`.
  - `TitleDetailsPage` e os dois `not-found.tsx`: renderizam `<TopBar type={...} />` e o conteúdo com `GUTTER`. (O `MediaTabs` conta visitas para o "← voltar"; por isso o `TopBar` precisa estar em todas as páginas.)
- [ ] **Step 4: Rodar** `npm test` e `npx tsc --noEmit` — esperado: PASSA.
- [ ] **Step 5: Commit** `feat: cores, fonte Figtree e menu do topo com logos dos streamings`.

---

### Task 4: Cartão deitado, grade e faixa de filtros

**Files:**
- Create: `src/components/FilterBar.tsx`
- Modify: `src/components/TitleCard.tsx` (+test), `src/components/TitleGrid.tsx`, `src/components/GenreSelect.tsx`, `src/components/RatingSelect.tsx`, `src/components/DoramasToggle.tsx`, `src/components/CatalogPage.tsx`

**Interfaces:**
- Consumes: `backdropUrl`, `posterUrl`, `formatRating`.
- Produces:
  - `TitleCard({ item, type })` — mesmo nome e props; formato 16:9.
  - `PosterPlaceholder` continua exportado (detalhes usa).
  - `FilterBar({ type, genres, filters }: { type: MediaType; genres: Genre[]; filters: Omit<Filters, 'page'> })` — `GenreSelect`, `RatingSelect`, `DoramasToggle` (todos com `disabled={Boolean(filters.q)}`) e, com busca, o `MEDIA[type].searchNote`.

- [ ] **Step 1: Testes que falham** em `TitleCard.test.tsx`:
  - `usa a imagem de cena quando existe` — `backdropPath: '/b.jpg'` → `img` com nome `Duna` e `src` contendo `w780` (o `next/image` codifica a URL: conferir com `toContain(encodeURIComponent('/w780/b.jpg'))` ou `toContain('w780')`).
  - `sem imagem de cena usa o cartaz` — `backdropPath: null, posterPath: '/d.jpg'` → `src` contém `w342`.
  - `mostra nota e ano` — `voteAverage: 8.2, releaseYear: 2024` → textos `8.2` e `2024` visíveis.
  - Os testes atuais (link, bloco sem imagem, link de série) continuam.
- [ ] **Step 2: Rodar** — esperado: FALHA.
- [ ] **Step 3: Implementar:**
  - `TitleCard`: `aspect-video rounded-lg overflow-hidden bg-superficie`; imagem de cena `object-cover`, ou cartaz `object-contain` centralizado, ou bloco com o nome; nome (até 2 linhas, peso 600) + `⭐ nota` (estrela Âmbar) e ano embaixo à esquerda sobre degradê escuro; `group-hover`/`focus-visible`: `scale-105` + contorno branco, com `motion-safe:transition`.
  - `TitleGrid`: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, botão "Carregar mais" em pílula clara.
  - `GenreSelect`/`RatingSelect`/`DoramasToggle`: pílulas Superfície com borda Linha; Doramas ativo segue rosa.
  - `CatalogPage`: troca o bloco de filtros pelo `FilterBar` (o `SearchBox` e o `ProviderFilter` já estão no `TopBar`).
- [ ] **Step 4: Rodar** `npm test` — esperado: PASSA.
- [ ] **Step 5: Commit** `feat: cartão deitado, grade e faixa de filtros no visual novo`.

---

### Task 5: Fileira que rola para o lado

**Files:**
- Create: `src/components/TitleRow.tsx`, `src/components/TitleRow.test.tsx`

**Interfaces:**
- Consumes: `ProviderRow` (Task 2), `TitleCard` (Task 4), `listHref`, `logoUrl`.
- Produces: `TitleRow({ type, row }: { type: MediaType; row: ProviderRow })` — cliente.

- [ ] **Step 1: Testes que falham:**
  - `mostra o nome do streaming como título da fileira` — `heading` de nível 2 com nome `Netflix`.
  - `Ver todos abre a lista filtrada pelo streaming` — link `Ver todos` com `href` `/?provider=8` (filmes) e `/series?provider=8` (séries).
  - `um cartão por título` — 3 títulos → 3 `listitem`.
  - `setas rolam a fileira` — `Element.prototype.scrollBy = vi.fn()`; clicar em `{ name: 'Rolar para a direita' }` chama `scrollBy` com `left` positivo; `{ name: 'Rolar para a esquerda' }` com `left` negativo.
- [ ] **Step 2: Rodar** — esperado: FALHA.
- [ ] **Step 3: Implementar:** `section` com cabeçalho (logo 24px + `h2` 20px/600, "Ver todos" à direita, alinhados ao `GUTTER`); `ul` `flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-*` com o mesmo padding esquerdo do `GUTTER` e sem barra de rolagem visível; `li` `shrink-0 snap-start w-[70vw] sm:w-[42vw] lg:w-[24vw]`; setas (`aria-label` acima) só a partir de `md`, aparecem com `group-hover`/`focus-visible`, rolam `ul.clientWidth * 0.9` com `behavior: 'smooth'` (ou `'auto'` se `prefers-reduced-motion`).
- [ ] **Step 4: Rodar** — esperado: PASSA.
- [ ] **Step 5: Commit** `feat: fileira de títulos por streaming`.

---

### Task 6: Banner em destaque

**Files:**
- Create: `src/components/HeroBanner.tsx`, `src/components/HeroBanner.test.tsx`

**Interfaces:**
- Consumes: `FeaturedItem` (Task 2), `backdropUrl(…, 'w1280')`, `logoUrl`, `detailPath`, `formatRating`.
- Produces: `HeroBanner({ type, items }: { type: MediaType; items: FeaturedItem[] })` — cliente; `null` quando `items` vazio. `export const ROTATE_MS = 8000`.

- [ ] **Step 1: Testes que falham** (`vi.useFakeTimers()`; `window.matchMedia` mockado devolvendo `matches` configurável):
  - `mostra o logo do título quando existe` — `img` com nome igual ao título; sem `logoPath` → `heading` de nível 1 com o título.
  - `Ver detalhes leva à página do título` — link `Ver detalhes` com `href` `/filme/7`.
  - `troca de destaque pelas bolinhas` — 3 itens → 3 botões `Destaque 1`…`Destaque 3`; clicar no 2 mostra o 2º título e marca `aria-current="true"` nele.
  - `troca sozinho a cada 8 s` — avançar `ROTATE_MS` → 2º título; avançar de novo → 3º; de novo → volta ao 1º.
  - `não troca sozinho com menos movimento` — `matchMedia('(prefers-reduced-motion: reduce)').matches = true` → depois de `ROTATE_MS` continua o 1º.
  - `para enquanto o mouse está em cima` — `mouseEnter` na `section`, avançar `ROTATE_MS` → continua o 1º.
  - `com 1 destaque não mostra bolinhas` — nenhum botão `Destaque 1`.
- [ ] **Step 2: Rodar** — esperado: FALHA.
- [ ] **Step 3: Implementar:** `section aria-roledescription="carrossel" aria-label="Destaques"`, altura `h-[60vh] lg:h-[70vh]`, largura toda; imagem de cena `fill object-cover object-right` com `priority` no 1º; dois degradês (Noite da esquerda e de baixo); bloco à esquerda com `GUTTER`, alinhado embaixo a ~25% da altura: logo do streaming (28px), logo do título (`max-h-28 max-w-[min(28rem,80vw)] object-contain object-left`) ou `h1` 48–64px/800, linha `⭐ nota   ano`, sinopse `line-clamp-3 max-w-xl`, botão pílula clara "Ver detalhes"; bolinhas centralizadas embaixo (ativa `w-6`, outras `w-2`). Troca com fade (`motion-safe:transition-opacity`). Intervalo pausado com `mouseenter`/`focusin`, retomado com `mouseleave`/`focusout`.
- [ ] **Step 4: Rodar** — esperado: PASSA.
- [ ] **Step 5: Commit** `feat: banner com destaques de cada streaming`.

---

### Task 7: Tela inicial em fileiras × grade

**Files:**
- Modify: `src/components/CatalogPage.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`

**Interfaces:**
- Consumes: `hasActiveFilters`, `loadHome` (Task 2); `TopBar` (3); `FilterBar`, `TitleGrid` (4); `TitleRow` (5); `HeroBanner` (6).

- [ ] **Step 1: Implementar `CatalogPage`:**
  - Sem filtros (`!hasActiveFilters(current)`): `Promise.all([loadHome(type), getGenres(type)])` e `getTopProviders(type)` para o menu; render: `<TopBar type overlay providers filters />`, `<HeroBanner />`, `FilterBar` com `GUTTER`, depois as `TitleRow` com `space-y-8`. Sem fileiras → `MEDIA[type].noneFound`. Sem destaques → `TopBar` sem `overlay`.
  - Com filtros: o fluxo atual (`loadCatalogPage` + `TitleGrid` com a mesma `key`), com `TopBar` sem `overlay`, `FilterBar` e grade dentro de `GUTTER`.
  - `Suspense` fallback: `<TopBar type />` + o esqueleto do `loading.tsx`.
- [ ] **Step 2: `loading.tsx`:** bloco Superfície com a altura do banner + 2 fileiras de 4 retângulos 16:9 Superfície (`motion-safe:animate-pulse`), com texto `Carregando…` só para leitor de tela (`sr-only`).
- [ ] **Step 3: `error.tsx`:** cores novas, botão pílula clara "Tentar de novo" e link "Voltar ao início" (`/`), dentro de `GUTTER` (esta página não tem `TopBar`).
- [ ] **Step 4: Rodar** `npm test`, `npx tsc --noEmit`, `npm run lint` — esperado: tudo PASSA.
- [ ] **Step 5: Commit** `feat: tela inicial com banner e fileiras; grade quando há filtro`.

---

### Task 8: Página de detalhes com imagem de cena

**Files:**
- Modify: `src/components/TitleDetailsPage.tsx`, `src/components/WhereToWatch.tsx`, `src/components/BackButton.tsx`

**Interfaces:**
- Consumes: `backdropUrl(…, 'w1280')`, `TopBar`.

- [ ] **Step 1: Implementar:** `TopBar overlay` quando há imagem de cena; imagem de cena no topo (`h-[45vh] lg:h-[60vh]`, largura toda, mesmos degradês do banner); conteúdo sobe por cima da parte de baixo da imagem (`-mt-32 lg:-mt-48`, `relative`): cartaz em pé (`w-40 sm:w-56`, sombra) à esquerda, à direita `h1` 28px/800 com o ano em Suave, linha com ⭐ (Âmbar), duração/temporadas e gêneros, sinopse `max-w-2xl leading-relaxed`, `WhereToWatch`. Sem imagem de cena: layout atual com cores novas. `BackButton` e `WhereToWatch`: só cores/tipografia (comportamento e textos iguais).
- [ ] **Step 2: Rodar** `npm test` — esperado: PASSA (testes de `WhereToWatch` e `BackButton` sem mudança).
- [ ] **Step 3: Commit** `feat: detalhes com imagem de cena ao fundo`.

---

### Task 9: Conferência no navegador

- [ ] **Step 1:** `npm run build` — esperado: build sem erros (inclui o prerender com `cacheComponents`).
- [ ] **Step 2:** Rodar o site (`npm run dev`) e tirar capturas em 1440px e 375px de: `/`, `/series`, `/?provider=8`, `/?q=duna`, `/series?doramas=1`, uma página de filme e uma de série.
- [ ] **Step 3:** Conferir: banner legível, fileiras rolam, nada de rolagem lateral da página em 375px, foco visível navegando com Tab (menu → banner → filtros → fileiras), "← voltar" mantém filtros, "Ver todos" abre a grade certa.
- [ ] **Step 4:** Corrigir o que aparecer, `npm test`, commit `fix: ajustes visuais da conferência`.
