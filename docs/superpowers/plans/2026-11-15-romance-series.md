# Romance para séries — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Opção "Romance" na lista de gêneros da aba Séries, filtrando pela palavra-chave 9840 do TMDB.

**Architecture:** `getGenres('tv')` acrescenta `{ id: 10749, name: 'Romance' }` em ordem alfabética; `discoverTitles('tv', …)` troca `with_genres=10749` por `with_keywords=9840`. Nada mais muda.

**Tech Stack:** Next.js 16.4, TypeScript, Vitest (globais).

**Spec:** `docs/superpowers/specs/2026-11-15-romance-series-design.md`

## Global Constraints

- Só séries mudam; `discoverTitles('movie', { genreId: 10749 })` continua enviando `with_genres=10749`.
- Romance não é excluído pelo Doramas.
- Branch: `feat/series-doramas` (o mesmo das séries).

## Review Focus

1. `/series?genre=10749` (link antigo) → lista de séries românticas, não vazia. (Task 1)
2. Romance + Doramas + streaming → `with_keywords=9840` junto com `with_origin_country`, `without_genres` e `with_watch_providers`. (Task 1)
3. Aba Filmes com Romance → continua usando o gênero real. (Task 1)

---

### Task 1: Romance por palavra-chave nas séries

**Files:**
- Modify: `src/lib/tmdb/titles.ts`, `src/lib/tmdb/titles.test.ts`

**Interfaces:**
- Produces: `ROMANCE_GENRE_ID = 10749`, `ROMANCE_KEYWORD_ID = 9840` (exportados de `titles.ts`). Assinaturas existentes inalteradas.

- [ ] **Step 1: Escrever os testes que falham**

```ts
test('Romance em séries usa a palavra-chave 9840', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], genreId: 10749, doramas: true, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.get('with_keywords')).toBe('9840')
  expect(url.searchParams.has('with_genres')).toBe(false)
  expect(url.searchParams.get('with_origin_country')).toBe('KR|JP|CN|TW|TH')
  expect(url.searchParams.get('with_watch_providers')).toBe('8')
})
test('Romance em filmes continua usando o gênero', ...)            // with_genres '10749', sem with_keywords
test('outros gêneros de séries não usam palavra-chave', ...)        // genreId 18 → with_genres '18', sem with_keywords
test('getGenres de séries inclui Romance em ordem alfabética', async () => {
  mockFetchJson({ genres: [{ id: 35, name: 'Comédia' }, { id: 9648, name: 'Mistério' }, { id: 10766, name: 'Soap' }] })
  expect((await getGenres('tv')).map((g) => g.name)).toEqual(['Comédia', 'Mistério', 'Romance', 'Soap'])
})
test('getGenres de filmes não acrescenta nada', ...)
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL nos testes novos.
- [ ] **Step 3: Implementar em `titles.ts`.**
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test && npx tsc --noEmit && npm run lint && npm run build` · Expected: tudo limpo.
- [ ] **Step 5: Verificar com dados reais** — `/series?genre=10749&doramas=1&provider=8` mostra doramas românticos (ex.: "É Minha Luz", "Dr. Romântico") e "Romance" aparece selecionado na lista.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: Romance para séries via palavra-chave do TMDB"`
