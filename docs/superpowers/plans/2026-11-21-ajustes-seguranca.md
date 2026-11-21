# Ajustes de segurança — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validação do retrato (ação + banco), cookie de sessão protegido, tempo-limite de 5 s no Supabase e proxy fora de `/api/`.

**Architecture:** Regras puras em `src/lib/marks.ts`; opções de cookie e `supabaseFetch` em `src/lib/supabase/env.ts`, usados por `server.ts` e `proxy.ts`; CHECKs e gatilho em `supabase/schema.sql`.

**Tech Stack:** Next.js 16.4, `@supabase/ssr`, Vitest (globais, fake timers).

**Spec:** `docs/superpowers/specs/2026-11-21-ajustes-seguranca-design.md`

## Global Constraints

- Regras: título 1–300; caminhos de imagem `null` ou `^/[A-Za-z0-9._-]+$` e ≤ 100; ano `null` ou inteiro 1870–2100; nota número 0–10.
- Cookie: `{ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' }`.
- Tempo-limite: `SUPABASE_TIMEOUT_MS = 5000`, mensagem de cancelamento `tempo esgotado (5 s)`.
- Proxy `matcher` exclui `api/`, `_next/static`, `_next/image`, `favicon.ico` e imagens.
- SQL idempotente (pode rodar de novo). Branch: `feat/ajustes-seguranca`.

## Review Focus

1. Título com 301 caracteres ou `posterPath: 'https://site-mal.com/x.jpg'` → `setMark` recusa (`erro`) e o banco também recusa (23514). (Task 1 e Task 2)
2. Supabase que não responde → em ~5 s o usuário vira "não logado" e o catálogo abre. (Task 1)
3. Cookie de sessão gravado com `HttpOnly` depois de entrar. (Task 2, verificação real)

---

### Task 1: Código (validação, cookie, tempo-limite, proxy)

**Files:** `src/lib/marks.ts` (+test), `src/app/actions/marks.ts` (+test), `src/lib/supabase/env.ts`, `src/lib/supabase/env.test.ts` (novo), `src/lib/supabase/server.ts`, `src/proxy.ts`, `src/proxy.test.ts`

**Interfaces:**
- `isValidSnapshot(s: unknown): s is TitleSnapshot` e `SNAPSHOT_LIMITS = { titleMax: 300, pathMax: 100, yearMin: 1870, yearMax: 2100 }` em `marks.ts`.
- `SESSION_COOKIE_OPTIONS`, `SUPABASE_TIMEOUT_MS = 5000`, `supabaseFetch(input, init?): Promise<Response>` em `env.ts`.

- [ ] **Step 1: Testes que falham**

```ts
test('isValidSnapshot aceita o retrato normal e caminhos nulos', ...)
test('isValidSnapshot recusa título vazio ou com mais de 300 caracteres', ...)
test('isValidSnapshot recusa caminhos fora do formato do TMDB', ...)   // 'https://site-mal.com/x.jpg', '/../x', '/a b.jpg', '/' + 'a'.repeat(100)
test('isValidSnapshot recusa ano e nota fora da faixa', ...)          // 1500, 2200, 1.5, nota -1, 11, NaN
test('setMark recusa retrato inválido sem chamar o Supabase', ...)
test('supabaseFetch desiste depois de 5 s', ...)                      // fetch pendurado + fake timers → rejeita 'tempo esgotado (5 s)'
test('supabaseFetch repassa a resposta normal e limpa o timer', ...)
test('cliente do proxy usa cookie protegido e o fetch com tempo-limite', ...)  // createServerClient chamado com cookieOptions { httpOnly: true, sameSite: 'lax', path: '/' } e global.fetch === supabaseFetch
test('matcher do proxy não inclui /api', ...)
```

- [ ] **Step 2: Rodar e ver falhar.** · **Step 3: Implementar** (`server.ts` também passa `cookieOptions` e `global: { fetch: supabaseFetch }`). · **Step 4: `npm test && npx tsc --noEmit && npm run lint && npm run build`.**
- [ ] **Step 5: Commit** — `feat: validação do retrato, cookie protegido e tempo-limite no Supabase`

### Task 2: Banco (limites e gatilho) e verificação real

**Files:** `supabase/schema.sql`, `scripts/check-rls.mjs`, `README.md`

- [ ] **Step 1:** Acrescentar ao `schema.sql` os CHECKs (com `drop constraint if exists` antes de cada `add constraint`) e trocar o gatilho para `before insert or update` (insert: `created_at = now()`; update: `created_at = old.created_at`; ambos `updated_at = now()`).
- [ ] **Step 2:** `check-rls.mjs` ganha: título de 301 caracteres → erro `23514`; `created_at` enviado pelo cliente é ignorado (fica perto de agora).
- [ ] **Step 3: Rodar o script e ver falhar** (banco ainda sem os limites) · Expected: `RLS FALHOU` nas duas verificações novas.
- [ ] **Step 4: Parar e pedir ao dono** para rodar o `schema.sql` de novo no SQL Editor.
- [ ] **Step 5: Rodar o script** · Expected: `RLS OK`. Verificar com o site real: entrar → `Set-Cookie` com `HttpOnly`; marcar/desmarcar continua funcionando.
- [ ] **Step 6: Commit** — `feat: limites na tabela e data de criação definida pelo banco`
