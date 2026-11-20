# Contas e "Minhas listas" — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conta com e-mail e senha (Supabase), marcar filmes/séries como "Quero assistir" ou "Já assisti", etiquetas nos cartões e a página "Minhas listas".

**Architecture:** Supabase pelo servidor com `@supabase/ssr`: cliente de servidor lê/grava cookies; `proxy.ts` renova a sessão; uma camada de acesso a dados (`server-only`) expõe o usuário e as marcações; Server Actions fazem login, cadastro, sair e marcar. Tudo que lê cookies fica dentro de `<Suspense>` e nunca dentro de `'use cache'`. As listas ficam na tabela `user_titles` com RLS e um retrato do título.

**Tech Stack:** Next.js 16.4 (`cacheComponents`), TypeScript, Tailwind 4, Vitest (globais), `@supabase/supabase-js`, `@supabase/ssr`.

**Spec:** `docs/superpowers/specs/2026-11-20-contas-e-listas-design.md`

## Global Constraints

- Ler antes de codar: `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`, `authentication.md`, `01-getting-started/16-proxy.md`, `07-mutating-data.md`, `03-api-reference/04-functions/cookies.md`.
- Variáveis: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em `.env.local`; modelo vazio em `.env.example`. Nunca chave de serviço.
- Tabela `user_titles`: `user_id uuid` (→ `auth.users`, `on delete cascade`, padrão `auth.uid()`), `media_type text` (`movie`|`tv`), `tmdb_id int`, `status text` (`want`|`watched`), `title text`, `poster_path text null`, `backdrop_path text null`, `release_year int null`, `vote_average real`, `created_at`, `updated_at timestamptz default now()`; `unique (user_id, media_type, tmdb_id)`; RLS ligado com políticas select/insert/update/delete `using/with check (auth.uid() = user_id)`.
- Endereços: `/entrar`, `/criar-conta`, `/minhas-listas` (`?lista=assistidos` para "Já assisti"; sem parâmetro = "Quero assistir"). Parâmetro de retorno: `voltar`.
- Textos exatos: `Quero assistir`, `Já assisti`, `✓ Assisti` (etiqueta), `Minhas listas`, `Entrar`, `Criar conta`, `Sair`, `Filme`, `Série`, `Você ainda não marcou nenhum título.`, sub-abas `Quero assistir (N)` e `Já assisti (N)`.
- Mensagens de erro (pt-BR): `E-mail ou senha incorretos.`, `Este e-mail já tem uma conta.`, `A senha precisa ter pelo menos 6 caracteres.`, `Informe um e-mail válido.`, `Não foi possível conectar. Tente de novo.`
- Um título em uma lista só; clicar no botão marcado desmarca; sem login → `/entrar?voltar=<título>`; depois de entrar volta, **sem marcar sozinho**. "Sair" → `/`.
- Supabase fora do ar: catálogo funciona, menu mostra "Entrar", sem etiquetas; ações mostram `Não foi possível conectar. Tente de novo.`
- Branch: `feat/contas-e-listas`. Commits terminam com a linha de coautoria do projeto.

## Review Focus

1. `voltar=https://site-mal.com`, `voltar=//site-mal.com`, `voltar=/\site-mal.com` → vai para `/`. (Task 2)
2. Supabase fora do ar ou variáveis vazias → catálogo abre, menu mostra "Entrar", nenhuma tela de erro. (Task 1 e Task 4)
3. Cliques rápidos seguidos no botão de marcar → estado final coerente com o último clique gravado (botão desativado enquanto grava). (Task 3)
4. Sessão vencida ao clicar em marcar → leva para "Entrar" (com `voltar`), não mostra erro técnico. (Task 3)
5. Pessoa B não vê nem altera as marcações da pessoa A (RLS). (Task 1, verificação real)

---

### Task 1: Base do Supabase (tabela, clientes, proxy, usuário atual)

**Files:**
- Create: `supabase/schema.sql`, `src/lib/supabase/server.ts`, `src/proxy.ts`, `src/lib/auth.ts`, `src/lib/auth.test.ts`, `scripts/check-rls.mjs`
- Modify: `package.json`, `.env.example`, `README.md`

**Interfaces:**
- Produces: `createSupabaseServerClient(): Promise<SupabaseClient>` (`server.ts`, usa `cookies()`; `setAll` em try/catch, como manda o `@supabase/ssr` para Server Components); `type CurrentUser = { id: string; email: string; initial: string }`; `getCurrentUser(): Promise<CurrentUser | null>` (`auth.ts`, `server-only`; usa `auth.getUser()`; devolve `null` sem sessão, com variáveis ausentes ou com erro de rede — nunca lança).

- [ ] **Step 1: Branch e dependências** — `git checkout -b feat/contas-e-listas`; `npm i @supabase/supabase-js @supabase/ssr`.
- [ ] **Step 2: Escrever `supabase/schema.sql`** com a tabela, índice em `(user_id, status, updated_at desc)`, RLS e as 4 políticas das Global Constraints, e um gatilho que atualiza `updated_at` em `update`.
- [ ] **Step 3: Parar e guiar o dono** (passo manual, combinado no design): criar o projeto (região São Paulo), desligar **Authentication → Sign In / Providers → Email → Confirm email**, colar e rodar `supabase/schema.sql` no **SQL Editor**, copiar **Project URL** e **Publishable key** para `.env.local`. Atualizar `.env.example` e `README.md` com esses passos. Não seguir sem as variáveis.
- [ ] **Step 4: Testes que falham** (`auth.test.ts`, mock de `@/lib/supabase/server` e `server-only`)

```ts
test('getCurrentUser devolve id, e-mail e inicial maiúscula', ...)   // getUser → { user: { id: 'u1', email: 'plinio@x.com' } } → { id: 'u1', email: 'plinio@x.com', initial: 'P' }
test('sem sessão devolve null', ...)                                  // { user: null }
test('erro do Supabase devolve null', ...)                            // getUser rejeita ou devolve { error } → null
test('variáveis ausentes devolve null sem chamar o Supabase', ...)    // vi.stubEnv vazio
```

- [ ] **Step 5: Rodar e ver falhar** — `npm test` · FAIL.
- [ ] **Step 6: Implementar** `server.ts`, `auth.ts` e `src/proxy.ts` (renova a sessão com `createServerClient` sobre `request`/`response`, seguindo o guia de proxy do Next 16 e o padrão do `@supabase/ssr`; `matcher` excluindo `_next/static`, `_next/image`, `favicon.ico` e imagens; se as variáveis estiverem vazias, apenas `NextResponse.next()`).
- [ ] **Step 7: Rodar e ver passar** — `npm test && npx tsc --noEmit && npm run build` · tudo limpo; o catálogo abre normalmente com `next start`.
- [ ] **Step 8: Verificação real do RLS** — `scripts/check-rls.mjs` (Node, só chave pública): cria duas contas de teste (`teste-a-<data>@exemplo.com`, `teste-b-…`), A grava uma linha, B faz `select` (espera 0 linhas) e tenta `update`/`delete` na linha de A (espera 0 linhas afetadas). Rodar `node --env-file=.env.local scripts/check-rls.mjs` · Expected: `RLS OK`. Avisar o dono que as duas contas de teste podem ser apagadas em Authentication → Users.
- [ ] **Step 9: Commit** — `feat: base do Supabase com tabela, RLS, proxy e usuário atual`

---

### Task 2: Entrar, criar conta, sair e menu da conta

**Files:**
- Create: `src/lib/redirect.ts` (+test), `src/lib/auth-errors.ts` (+test), `src/app/actions/auth.ts`, `src/app/entrar/page.tsx`, `src/app/criar-conta/page.tsx`, `src/components/AuthForm.tsx` (+test), `src/components/AccountNav.tsx` (+test)
- Modify: `src/components/TopBar.tsx`

**Interfaces:**
- Consumes: `createSupabaseServerClient`, `getCurrentUser` (Task 1).
- Produces:
  - `safeRedirectPath(raw: string | null | undefined): string` — aceita só caminhos que começam com `/` e não com `//` nem `/\`; senão `/`.
  - `authErrorMessage(error: { code?: string; message?: string; status?: number } | null): string` — mapeia para as mensagens das Global Constraints (`invalid_credentials` → senha incorreta; `user_already_exists`/`email_exists` → já tem conta; `weak_password` → 6 caracteres; `email_address_invalid`/`validation_failed` → e-mail inválido; outro → não foi possível conectar).
  - `type AuthState = { error: string | null }`; Server Actions `signIn(prev: AuthState, form: FormData): Promise<AuthState>`, `signUp(prev, form)` (validam e-mail e senha ≥ 6 antes de chamar o Supabase; sucesso → `redirect(safeRedirectPath(form.get('voltar')))`), `signOut(): Promise<void>` (→ `redirect('/')`).
  - `<AuthForm mode="entrar" | "criar-conta" voltar={string} />` (Client, `useActionState`); `<AccountNav />` (Server, lê `getCurrentUser`): logado → link `Minhas listas`, círculo com a inicial, botão `Sair` (form com `signOut`); sem login → link `Entrar` (para `/entrar?voltar=<página atual>` quando disponível).

- [ ] **Step 1: Testes que falham**

```ts
test('safeRedirectPath aceita caminhos internos', ...)        // '/serie/5' → '/serie/5'; '/series?doramas=1' → igual
test('safeRedirectPath recusa externos e vazios', ...)        // 'https://site-mal.com', '//site-mal.com', '/\\site-mal.com', '', null → '/'
test('authErrorMessage mapeia os códigos', ...)               // cada código → mensagem exata; null → 'Não foi possível conectar. Tente de novo.'
test('AuthForm entrar mostra e-mail, senha, link para criar conta e campo voltar', ...)
test('AuthForm mostra a mensagem de erro do estado', ...)
test('AccountNav sem login mostra Entrar', ...)               // mock getCurrentUser → null
test('AccountNav logado mostra Minhas listas, inicial e Sair', ...)
```

- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** helpers, actions, páginas (`/entrar` e `/criar-conta` leem `voltar` de `searchParams` dentro de `<Suspense>`; quem já está logado é levado para `voltar`) e `AccountNav` no `TopBar` dentro de `<Suspense fallback={null}>`, à direita da busca.
- [ ] **Step 4: Rodar e ver passar** — `npm test && npx tsc --noEmit && npm run lint && npm run build`.
- [ ] **Step 5: Verificar com o Supabase real** — criar conta nova → já logado, menu mostra a inicial; Sair → `/` com "Entrar"; entrar com senha errada → `E-mail ou senha incorretos.`; criar com o mesmo e-mail → `Este e-mail já tem uma conta.`; `/entrar?voltar=https://site-mal.com` → depois de entrar vai para `/`.
- [ ] **Step 6: Commit** — `feat: entrar, criar conta, sair e menu da conta`

---

### Task 3: Marcar na página de detalhes

**Files:**
- Create: `src/lib/marks.ts` (+test), `src/lib/user-titles.ts` (+test), `src/app/actions/marks.ts` (+test), `src/components/MarkButtons.tsx` (+test)
- Modify: `src/components/TitleDetailsPage.tsx`

**Interfaces:**
- Consumes: `createSupabaseServerClient`, `getCurrentUser` (Task 1), `safeRedirectPath` (Task 2), `TitleDetails`, `MediaType`, `detailPath`.
- Produces:
  - `marks.ts` (puro): `type MarkStatus = 'want' | 'watched'`; `type MarkMap = Record<string, MarkStatus>`; `markKey(type: MediaType, id: number): string` (`'movie:7'`); `nextStatus(current: MarkStatus | null, clicked: MarkStatus): MarkStatus | null` (mesmo botão → `null`; outro → `clicked`); `type TitleSnapshot = { title: string; posterPath: string | null; backdropPath: string | null; releaseYear: number | null; voteAverage: number }`.
  - `user-titles.ts` (`server-only`): `getTitleMark(type, id): Promise<MarkStatus | null>`; `getUserMarks(): Promise<MarkMap>` (`{}` sem login ou com erro); `type SavedTitle = TitleSnapshot & { mediaType: MediaType; tmdbId: number }`; `getMyList(status: MarkStatus): Promise<SavedTitle[]>` (mais recentes primeiro por `updated_at`); `countMyLists(): Promise<{ want: number; watched: number }>`.
  - Action `setMark(input: { mediaType: MediaType; tmdbId: number; status: MarkStatus | null; snapshot: TitleSnapshot }): Promise<{ ok: true } | { ok: false; reason: 'login' | 'erro' }>` — valida o tipo/ids/status; `status: null` apaga a linha; senão `upsert` em `(user_id, media_type, tmdb_id)`; sem usuário → `{ ok: false, reason: 'login' }`; atualiza a página conforme o guia de mutações do Next 16.
  - `<MarkButtons type tmdbId snapshot initialStatus loggedIn returnPath />` (Client): sem login, os dois botões são links para `/entrar?voltar=<returnPath>`; logado, `aria-pressed`, desativados enquanto gravam, mostram `Não foi possível conectar. Tente de novo.` em falha; `reason: 'login'` leva para `/entrar?voltar=…`.

- [ ] **Step 1: Testes que falham**

```ts
test('markKey', ...)                                   // ('tv', 5) → 'tv:5'
test('nextStatus', ...)                                // (null,'want')→'want'; ('want','want')→null; ('want','watched')→'watched'
test('setMark sem usuário pede login', ...)            // mock getCurrentUser → null → { ok:false, reason:'login' }
test('setMark grava com upsert e retrato', ...)        // verifica payload: user_id, media_type, tmdb_id, status, title, poster_path… e onConflict 'user_id,media_type,tmdb_id'
test('setMark com status null apaga a linha', ...)
test('setMark recusa dados inválidos', ...)            // mediaType 'x', tmdbId 0, status 'y' → { ok:false, reason:'erro' } sem chamar o Supabase
test('getUserMarks sem login ou com erro devolve {}', ...)
test('MarkButtons sem login são links para entrar com voltar', ...)
test('MarkButtons marca, desmarca e troca de lista', ...)   // mock setMark; aria-pressed segue nextStatus
test('MarkButtons desativa enquanto grava e mostra erro', ...)
test('MarkButtons com reason login leva para entrar', ...)
```

- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** e colocar `MarkButtons` em `TitleDetailsView` logo abaixo da linha de nota/duração, numa parte em `<Suspense>` que lê `getCurrentUser` e `getTitleMark` (o restante da página não espera o login).
- [ ] **Step 4: Rodar e ver passar** — `npm test && npx tsc --noEmit && npm run lint && npm run build`.
- [ ] **Step 5: Verificar com o Supabase real** — sem login: clicar leva a `/entrar?voltar=/serie/93405`, e depois de entrar volta à série sem marcar; logado: marcar "Quero assistir", recarregar (continua marcado), trocar para "Já assisti", clicar de novo (desmarca); conferir a linha no Supabase (Table Editor).
- [ ] **Step 6: Commit** — `feat: marcar Quero assistir e Já assisti na página de detalhes`

---

### Task 4: Etiquetas nos cartões e página "Minhas listas"

**Files:**
- Create: `src/app/minhas-listas/page.tsx`, `src/components/MyListsPage.tsx`, `src/lib/my-lists.ts` (+test)
- Modify: `src/components/TitleCard.tsx` (+test), `TitleRow.tsx`, `TitleGrid.tsx` (+test), `CatalogPage.tsx`, `src/lib/media.ts` (se precisar de rótulo singular)

**Interfaces:**
- Consumes: `MarkStatus`, `MarkMap`, `markKey`, `getUserMarks`, `getMyList`, `countMyLists`, `SavedTitle` (Task 3); `getCurrentUser` (Task 1).
- Produces:
  - `TitleCard` ganha `mark?: MarkStatus` (etiqueta `Quero assistir` / `✓ Assisti`, canto superior direito) e `showKind?: boolean` (etiqueta `Filme` / `Série`, canto superior esquerdo).
  - `TitleRow` e `TitleGrid` ganham `marks?: MarkMap`; o grid usa o mesmo mapa para os itens do "Carregar mais".
  - `parseListParam(raw: string | undefined): MarkStatus` (`'assistidos'` → `'watched'`; resto → `'want'`) e `savedToSummary(s: SavedTitle): TitleSummary` (`overview: ''`, `id: tmdbId`) em `my-lists.ts`.
  - `CatalogPage`: `Home` e `Grid` buscam `getUserMarks()` em paralelo com o que já buscam e repassam `marks` (continua dentro do `<Suspense>` existente; nada de dados do usuário em `'use cache'`).
  - `/minhas-listas`: sem login → `redirect('/entrar?voltar=/minhas-listas')`; sub-abas `Quero assistir (N)` / `Já assisti (N)` (links `/minhas-listas` e `/minhas-listas?lista=assistidos`, `aria-current` na ativa); grade de `TitleCard` com `showKind` e `mark`; vazia → `Você ainda não marcou nenhum título.` com link `Ver o catálogo` para `/`.

- [ ] **Step 1: Testes que falham**

```ts
test('parseListParam', ...)                                 // 'assistidos'→'watched'; undefined/'x'→'want'
test('savedToSummary', ...)
test('TitleCard mostra etiqueta Quero assistir / ✓ Assisti', ...)
test('TitleCard sem mark não mostra etiqueta', ...)
test('TitleCard com showKind mostra Filme ou Série', ...)
test('TitleGrid aplica marks aos itens do Carregar mais', ...)   // item 2 chega no fetch; marks {'movie:2':'watched'} → '✓ Assisti'
```

- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** etiquetas, repasse de `marks`, `my-lists.ts`, `MyListsPage` (com `TopBar`, dentro de `<Suspense>`) e a página.
- [ ] **Step 4: Rodar e ver passar** — `npm test && npx tsc --noEmit && npm run lint && npm run build`.
- [ ] **Step 5: Verificar com o Supabase real** — logado: etiquetas aparecem nas fileiras, na grade e depois do "Carregar mais"; `/minhas-listas` mostra contagens certas, filmes e séries juntos com `Filme`/`Série`, mais recente primeiro; sub-aba "Já assisti" funciona; conta nova → mensagem de lista vazia; sem login, `/minhas-listas` leva a "Entrar". Com `NEXT_PUBLIC_SUPABASE_URL` trocada por um endereço inválido (só para o teste) o catálogo abre, menu mostra "Entrar", sem etiquetas.
- [ ] **Step 6: Commit** — `feat: etiquetas nos cartões e página Minhas listas`
