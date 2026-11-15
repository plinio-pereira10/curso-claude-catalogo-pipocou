# Acabamento — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajustes visíveis (Sem nota, logos sem repetição, "Onde Assistir ↗", voltar dentro do site) e internos (tempo-limite completo, log, testes).

**Architecture:** Mudanças locais em funções existentes; nenhuma peça nova além de `dedupeProviders`.

**Tech Stack:** Next.js 16.4, TypeScript, Vitest (globais), Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-15-acabamento-design.md`

## Global Constraints

- Textos exatos: `Sem nota`, `Onde Assistir ↗`.
- Sufixos de variação: `' with Ads'`, `' Standard'`, `' Amazon Channel'`, `' Premium'` (removidos repetidamente do fim do nome).
- Branch: `feat/acabamento`.

## Review Focus

1. Serviço só disponível como variação (ex.: "Telecine Amazon Channel" sem "Telecine") → continua aparecendo. (Task 1)
2. Voltar com página anterior do próprio site → `router.back()` (filtros mantidos); sem ela → lista da aba certa. (Task 1)
3. Corpo da resposta que trava → erro em ~5 s, não minutos. (Task 2)

---

### Task 1: Ajustes visíveis

**Files:** `src/lib/format.ts` (+test), `src/lib/availability.ts` (+test), `src/components/WhereToWatch.tsx` (+test), `src/components/BackButton.tsx`, `src/components/BackButton.test.tsx` (novo), `src/components/TitleDetailsPage.tsx`

**Interfaces:**
- `formatRating(vote: number): string` → `0` vira `'Sem nota'`.
- `dedupeProviders(providers: Provider[]): Provider[]` (exportada de `availability.ts`), aplicada em `summarizeAvailability` (Brasil e cada país).
- `<BackButton type={MediaType} />`.

- [ ] **Step 1: Testes que falham**

```ts
test('formatRating sem votos mostra "Sem nota"', ...)               // formatRating(0) → 'Sem nota'; 8.234 → '8.2'
test('dedupeProviders esconde variações quando o principal existe', ...) // Netflix, Netflix Standard with Ads → [Netflix]
test('dedupeProviders mantém variação sem o principal', ...)       // Telecine Amazon Channel → mantido
test('dedupeProviders com várias variações', ...)                  // Paramount Plus, Paramount Plus Premium, Amazon Prime Video, Amazon Prime Video with Ads → [Paramount Plus, Amazon Prime Video]
test('summarizeAvailability aplica a regra no Brasil e nos outros países', ...)
test('link se chama "Onde Assistir ↗"', ...)                        // WhereToWatch: getByRole('link', { name: 'Onde Assistir ↗' })
test('BackButton volta quando veio do próprio site', ...)          // referrer mesma origem → back()
test('BackButton vai para /series quando veio de fora', ...)       // referrer '' → push('/series')
```

- [ ] **Step 2: Rodar e ver falhar.** · **Step 3: Implementar.** · **Step 4: `npm test && npx tsc --noEmit`.**
- [ ] **Step 5: Commit** — `feat: Sem nota, logos sem repetição, Onde Assistir e voltar dentro do site`

### Task 2: Ajustes internos

**Files:** `src/lib/tmdb/client.ts` (+test), `src/components/GenreSelect.test.tsx` (novo), `src/components/MediaTabs.tsx`

- [ ] **Step 1: Testes que falham**

```ts
test('corpo que trava também cai no tempo-limite', ...)        // Response com corpo que nunca termina mas respeita o signal → rejeita (tempo esgotado), sem nova tentativa
test('tempo-limite não dispara antes de 5 s', ...)             // fetch pendurado: advanceTimersByTime(4999) → 1 chamada; +1 ms → segue para nova tentativa
test('timer é limpo após sucesso', ...)                        // vi.getTimerCount() === 0
test('log diz "tempo esgotado"', ...)                           // console.warn contém 'tempo esgotado (5 s)'
test('GenreSelect mantém a nota', ...)                          // escolher 18 com {providerId 8, minRating 7} → '/?provider=8&genre=18&nota=7'
```

- [ ] **Step 2: Rodar e ver falhar.** · **Step 3: Implementar.** · **Step 4: `npm test && npx tsc --noEmit && npm run lint && npm run build`.**
- [ ] **Step 5: Verificar com dados reais** — `/serie/93405` mostra só Netflix e o link "Onde Assistir ↗"; `/filme/693134` mostra HBO Max sem "HBO Max Amazon Channel"; um título sem votos mostra "⭐ Sem nota".
- [ ] **Step 6: Commit** — `fix: tempo-limite cobre a leitura da resposta; testes e comentário`
