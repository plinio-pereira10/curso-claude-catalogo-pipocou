# Ordenar por nota — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lista "Ordem: Mais populares / Mais bem avaliados" nas duas abas; a segunda ordena por nota com pelo menos 50 votos.

**Architecture:** `Filters.sort?: 'rating'` (URL `ordem=nota`) passa por `loadCatalogPage` até `discoverTitles`, que troca `sort_by` e aplica o mínimo de votos. Novo `SortSelect` na `FilterBar`.

**Tech Stack:** Next.js 16.4, TypeScript, Vitest (globais), Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-21-ordenar-por-nota-design.md`

## Global Constraints

- Textos exatos: rótulo `Ordem:`, opções `Mais populares` e `Mais bem avaliados`.
- `SORT_MIN_VOTE_COUNT = 50` em `src/lib/rating.ts` (comentário "para mudar, altere aqui"); `MIN_VOTE_COUNT = 15` do filtro continua.
- Mais bem avaliados: `sort_by=vote_average.desc`, `vote_count.gte=max(nota ? 15 : 0, 50)` = 50. Sem a ordem: `sort_by=popularity.desc` e nada muda.
- URL `ordem=nota`; ordem dos parâmetros `provider, genre, nota, ordem, doramas, q, page`; outros valores de `ordem` ignorados.
- Trocar de aba mantém `provider`, `nota`, `ordem`, `doramas`. Busca desativa a lista.
- Branch: `feat/ordem-nota`.

## Review Focus

1. `?ordem=xyz` / `?ordem=` → ignorado, lista normal por popularidade. (Task 1)
2. Ordem + nota 8+ → `vote_count.gte=50` (não 15) e `vote_average.gte=8`. (Task 1)
3. Mudar streaming, gênero, nota ou Doramas com a ordem escolhida → `ordem=nota` continua na URL. (Task 2)

---

### Task 1: Ordem nos filtros e no pedido ao TMDB

**Files:** `src/lib/rating.ts`, `src/lib/filters.ts` (+test), `src/lib/tmdb/titles.ts` (+test), `src/lib/catalog.ts` (+test), `src/lib/media.ts` (+test), `src/lib/home.ts` (+test)

**Interfaces:**
- Produces: `SORT_MIN_VOTE_COUNT = 50`; `type SortOrder = 'rating'`; `Filters.sort?: SortOrder`; `discoverTitles(type, { …, sortByRating?: boolean })`; `hasActiveFilters` considera `sort`; `switchTabHref` mantém `sort`.

- [ ] **Step 1: Testes que falham**

```ts
test('lê ordem=nota e ignora outros valores', ...)              // {ordem:'nota'} → sort 'rating'; {ordem:'xyz'} e {ordem:''} → sem sort
test('filtersToQuery escreve ordem na posição certa', ...)       // providerId 8, genreId 35, minRating 8, sort 'rating', doramas → 'provider=8&genre=35&nota=8&ordem=nota&doramas=1'
test('ordem por nota usa vote_average.desc e 50 votos', ...)     // discoverTitles('movie', {…, sortByRating:true}) → sort_by 'vote_average.desc', vote_count.gte '50'
test('ordem por nota com nota 8+ usa 50 votos e vote_average.gte 8', ...)
test('sem a ordem continua por popularidade', ...)               // sort_by 'popularity.desc'
test('catálogo repassa a ordem', ...)                            // loadCatalogPage(… sort:'rating') → discoverTitles(…, sortByRating: true)
test('switchTabHref mantém a ordem', ...)                        // → '/series?ordem=nota'
test('hasActiveFilters conta a ordem', ...)                      // { sort:'rating', doramas:false } → true
```

- [ ] **Step 2: Rodar e ver falhar.** · **Step 3: Implementar.** · **Step 4: `npm test && npx tsc --noEmit`.**
- [ ] **Step 5: Commit** — `feat: ordem por nota nos filtros e no pedido ao TMDB`

### Task 2: Lista "Ordem" na tela

**Files:** `src/components/SortSelect.tsx` (+test), `src/components/FilterBar.tsx`, `src/components/MediaTabs.test.tsx`, `src/components/RatingSelect.test.tsx` (manter ordem)

**Interfaces:** `<SortSelect type filters disabled />` (`<label>Ordem: <select>` com valores `''` e `'nota'`); navega com `listHref(type, { ...filters, q: undefined, sort })`.

- [ ] **Step 1: Testes que falham**

```tsx
test('SortSelect mostra as duas opções, com Mais populares por padrão', ...)
test('SortSelect escolhe Mais bem avaliados mantendo os filtros', ...)   // {providerId 8, minRating 8, doramas true} → '/series?provider=8&nota=8&ordem=nota&doramas=1'
test('SortSelect volta para Mais populares', ...)                        // sort 'rating' → push sem ordem
test('SortSelect desativado na busca', ...)
test('RatingSelect mantém a ordem', ...)                                 // filters { sort:'rating' } escolher 7 → '/?nota=7&ordem=nota'
test('MediaTabs leva a ordem ao trocar de aba', ...)
```

- [ ] **Step 2: Rodar e ver falhar.** · **Step 3: Implementar e colocar na `FilterBar` depois da Nota.** · **Step 4: `npm test && npx tsc --noEmit && npm run lint && npm run build`.**
- [ ] **Step 5: Verificar com dados reais** — `/api/titles?type=movie&provider=8&ordem=nota` em ordem decrescente de nota (≥ 50 votos); `/series?doramas=1&ordem=nota` mostra "Mais bem avaliados" selecionado; página 2 continua decrescente; `/?ordem=xyz` normal.
- [ ] **Step 6: Commit** — `feat: lista Ordem na faixa de filtros`
