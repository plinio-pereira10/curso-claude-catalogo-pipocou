# Filtro por nota — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lista "Nota: Todas / 6+ / 7+ / 8+" nas duas abas, filtrando por nota mínima com pelo menos 15 votos.

**Architecture:** `minRating` entra em `Filters` (URL `nota`), passa por `loadCatalogPage` até `discoverTitles`, que envia `vote_average.gte` e `vote_count.gte=15`. Novo `RatingSelect` na tela. Os controles passam a navegar com `{ ...filtros atuais, campo alterado }`.

**Tech Stack:** Next.js 16.4, TypeScript, Vitest (globais), Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-15-filtro-nota-design.md`

## Global Constraints

- Opções exatas: `Todas`, `6+`, `7+`, `8+`; URL `nota=6|7|8`; outros valores ignorados.
- `MIN_VOTE_COUNT = 15`, constante única em `src/lib/rating.ts` com comentário "para mudar o mínimo de votos, altere aqui".
- Sem nota escolhida: nenhum parâmetro novo enviado ao TMDB.
- Ordem de `filtersToQuery`: `provider, genre, nota, doramas, q, page`.
- Busca desativa a lista de nota. Trocar de aba mantém `provider`, `nota`, `doramas`.
- Branch: `feat/filtro-nota`.

## Review Focus

1. `?nota=9`, `?nota=abc`, `?nota=7.5` → ignorados, lista normal. (Task 1)
2. Mudar streaming, gênero ou Doramas com nota escolhida → a nota continua na URL. (Task 2)
3. "Carregar mais" com nota → página 2 também filtrada (`nota` vai na query do grid). (Task 2)

---

### Task 1: Nota nos filtros e no pedido ao TMDB

**Files:**
- Create: `src/lib/rating.ts`, `src/lib/rating.test.ts`
- Modify: `src/lib/filters.ts`, `filters.test.ts`, `src/lib/tmdb/titles.ts`, `titles.test.ts`, `src/lib/catalog.ts`, `catalog.test.ts`, `src/lib/media.ts`, `media.test.ts`

**Interfaces:**
- Produces (`rating.ts`): `RATING_OPTIONS = [6, 7, 8] as const`; `type MinRating = 6 | 7 | 8`; `MIN_VOTE_COUNT = 15`; `parseMinRating(raw: string | undefined): MinRating | undefined`.
- Produces: `Filters.minRating?: MinRating`; `discoverTitles(type, { …, minRating?: MinRating })`; `switchTabHref` mantém `minRating`.

- [ ] **Step 1: Testes que falham**

```ts
// rating.test.ts
test('parseMinRating aceita só 6, 7 e 8', () => {
  expect(parseMinRating('7')).toBe(7)
  for (const bad of ['9', '5', 'abc', '7.5', '', undefined]) expect(parseMinRating(bad)).toBeUndefined()
})
// filters.test.ts
test('lê nota', ...)                                   // { nota: '8' } → minRating 8; { nota: '9' } → sem minRating
test('filtersToQuery escreve nota na ordem', ...)      // providerId 8, genreId 35, minRating 7, doramas → 'provider=8&genre=35&nota=7&doramas=1'
// titles.test.ts
test('nota mínima envia vote_average.gte e vote_count.gte=15', ...)
test('sem nota não envia vote_average.gte nem vote_count.gte', ...)
// catalog.test.ts — atualizar chamadas esperadas com minRating: undefined e acrescentar:
test('nota é repassada ao discover', ...)              // minRating 8 → discoverTitles(..., { ..., minRating: 8 })
// media.test.ts
test('switchTabHref mantém a nota', ...)               // { providerId: 8, minRating: 7, doramas: true } → '/series?provider=8&nota=7&doramas=1'
```

- [ ] **Step 2: Rodar e ver falhar** — `npm test` · FAIL.
- [ ] **Step 3: Implementar.**
- [ ] **Step 4: Rodar e ver passar** — `npm test && npx tsc --noEmit` · PASS.
- [ ] **Step 5: Commit** — `feat: nota mínima nos filtros e no pedido ao TMDB`

---

### Task 2: Lista "Nota" na tela e controles que preservam filtros

**Files:**
- Create: `src/components/RatingSelect.tsx`, `src/components/RatingSelect.test.tsx`, `src/components/ProviderFilter.test.tsx`
- Modify: `CatalogPage.tsx`, `ProviderFilter.tsx`, `GenreSelect.tsx`, `DoramasToggle.tsx`, `DoramasToggle.test.tsx`, `MediaTabs.test.tsx`

**Interfaces:**
- Produces: `<RatingSelect type filters disabled />` (`<label>Nota: <select>` com `Todas`, `6+`, `7+`, `8+`). Controles navegam com `listHref(type, { ...filters, q: undefined, <campo> })`.

- [ ] **Step 1: Testes que falham** (mock de `next/navigation` como nos testes atuais)

```tsx
test('RatingSelect escolhe 8+ mantendo os outros filtros', ...)   // filtros {providerId 8, genreId 18, doramas true} → push('/series?provider=8&genre=18&nota=8&doramas=1')
test('RatingSelect "Todas" tira a nota', ...)                     // minRating 7 → push('/series?provider=8')
test('RatingSelect desativado na busca', ...)
test('DoramasToggle mantém a nota', ...)                          // minRating 7 → '/series?nota=7&doramas=1'
test('ProviderFilter mantém nota e gênero', ...)                  // clicar Netflix com genreId 18, minRating 8 → '/?provider=8&genre=18&nota=8'
test('MediaTabs leva a nota ao trocar de aba', ...)               // search 'nota=8&genre=35' → Séries href '/series?nota=8'
```

- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar `RatingSelect`, ajustar controles e colocar a lista em `CatalogPage` ao lado do gênero.**
- [ ] **Step 4: Rodar e ver passar** — `npm test && npx tsc --noEmit && npm run lint && npm run build`.
- [ ] **Step 5: Verificar com dados reais** — `/series?provider=8&doramas=1&genre=10749&nota=8` só traz títulos com nota ≥ 8 e ≥ 15 votos (conferir via `/api/titles`), "8+" aparece selecionado; página 2 via "Carregar mais" também filtrada; `/?nota=9` lista normal.
- [ ] **Step 6: Commit** — `feat: lista Nota na tela, válida nas duas abas`
