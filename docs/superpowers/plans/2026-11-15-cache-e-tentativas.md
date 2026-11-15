# Guardar listas e tentar de novo — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menos pedidos ao TMDB (listas guardadas 1 h) e menos telas de erro em falhas passageiras (até 2 novas tentativas).

**Architecture:** `tmdbFetch` ganha um laço de tentativas. `getTopProviders` e `getGenres` ganham `'use cache'` + `cacheLife('hours')`.

**Tech Stack:** Next.js 16.4 (`cacheComponents`), TypeScript, Vitest (globais; `vi.useFakeTimers` para as esperas).

**Spec:** `docs/superpowers/specs/2026-11-15-cache-e-tentativas-design.md`

## Global Constraints

- Tentar de novo só em: erro de conexão (`fetch` rejeita), status 429, status ≥ 500. Máximo 3 tentativas no total; esperas de 300 ms e depois 1000 ms.
- Nunca repetir em 4xx (exceto 429); `TmdbError` com o status continua sendo lançado.
- Sem token → erro imediato, sem tentativas.
- Cache: `'use cache'` + `cacheLife('hours')` somente em `getTopProviders` e `getGenres`.
- Branch: `feat/cache-e-tentativas`.

## Review Focus

1. TMDB responde 404 → uma única tentativa e `TmdbError(404)` (a página "não encontrado" continua funcionando). (Task 1)
2. Três falhas de conexão seguidas → o erro chega à página (tela de erro), sem ficar tentando para sempre. (Task 1)
3. Testes do restante (`titles.test.ts`, `catalog.test.ts`) continuam rodando no Vitest mesmo com `cacheLife` importado de `next/cache`. (Task 2)

---

### Task 1: Tentativas em `tmdbFetch`

**Files:**
- Modify: `src/lib/tmdb/client.ts`
- Create: `src/lib/tmdb/client.test.ts`

**Interfaces:**
- Produces: `tmdbFetch<T>(path, params?)` com a mesma assinatura; exporta `RETRY_DELAYS_MS = [300, 1000]`.

- [ ] **Step 1: Escrever os testes que falham** (`vi.mock('server-only', () => ({}))`, `vi.stubEnv`, `vi.stubGlobal('fetch', …)`, `vi.useFakeTimers()`; avançar com `vi.runAllTimersAsync()`)

```ts
test('falha de conexão e depois sucesso → devolve o resultado', ...)      // reject TypeError('fetch failed'), depois 200 {ok:1} → resolve {ok:1}; fetch chamado 2x
test('três falhas de conexão → lança o erro, 3 chamadas', ...)
test('503 e depois 200 → tenta de novo', ...)                              // 2 chamadas
test('429 e depois 200 → tenta de novo', ...)
test('404 → não tenta de novo e lança TmdbError 404', ...)                 // 1 chamada
test('três respostas 500 → lança TmdbError 500', ...)                      // 3 chamadas
test('sem token → erro imediato, nenhuma chamada', ...)
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL nos testes de tentativa.
- [ ] **Step 3: Implementar o laço em `client.ts`** (log `console.warn` em pt-BR a cada nova tentativa).
- [ ] **Step 4: Rodar e ver passar** — Run: `npm test` · Expected: PASS (inclusive os testes antigos de `titles.test.ts`).
- [ ] **Step 5: Commit** — `git commit -m "feat: tentar de novo quando a conexão com o TMDB falhar"`

---

### Task 2: Guardar listas por 1 hora

**Files:**
- Modify: `src/lib/tmdb/titles.ts`, `src/lib/tmdb/titles.test.ts`, `src/lib/catalog.test.ts` (só se precisar do mock)

**Interfaces:**
- Consumes: `cacheLife` de `next/cache`.
- Produces: `getTopProviders` e `getGenres` com as mesmas assinaturas.

- [ ] **Step 1: Ler** `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` e `.../04-functions/cacheLife.md`.
- [ ] **Step 2: Escrever o teste que falha** em `titles.test.ts` (mock `vi.mock('next/cache', () => ({ cacheLife: vi.fn() }))`):

```ts
test('listas de streamings e gêneros são guardadas por "hours"', async () => {
  mockFetchJson({ results: [] })
  await getTopProviders('tv')
  mockFetchJson({ genres: [] })
  await getGenres('tv')
  expect(cacheLife).toHaveBeenCalledTimes(2)
  expect(cacheLife).toHaveBeenNthCalledWith(1, 'hours')
  expect(cacheLife).toHaveBeenNthCalledWith(2, 'hours')
})
test('discoverTitles não usa cache', ...)                                // cacheLife não chamado
```

- [ ] **Step 3: Rodar e ver falhar** — Run: `npm test` · Expected: FAIL.
- [ ] **Step 4: Implementar** `'use cache'` + `cacheLife('hours')` no topo das duas funções.
- [ ] **Step 5: Rodar e ver passar** — Run: `npm test && npx tsc --noEmit && npm run lint && npm run build` · Expected: tudo limpo.
- [ ] **Step 6: Verificar com dados reais** — `next start`: abrir `/series` duas vezes; o log do servidor mostra que o segundo carregamento não pediu as listas de novo (contar pedidos com `NEXT_PRIVATE_DEBUG_CACHE=1` ou medindo o tempo); a lista e os botões aparecem como antes.
- [ ] **Step 7: Commit** — `git commit -m "feat: guardar listas de streamings e gêneros por 1 hora"`
