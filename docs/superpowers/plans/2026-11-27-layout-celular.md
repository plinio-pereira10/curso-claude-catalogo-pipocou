# Layout no celular (topo e filtros) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No celular, topo com 2 linhas (busca vira 🔍, conta vira círculo com menu) e filtros com 1 linha (botão "Filtros (n)" + Todos/Doramas); notebook sem mudança.

**Architecture:** Só CSS decide celular × notebook (classes `sm:` do Tailwind; nada de `matchMedia`, para não haver diferença entre servidor e navegador). Cada controle existe **uma vez** no HTML; no celular ele fica escondido até abrir (`hidden` ↔ `flex`), a partir de `sm:` fica sempre à vista. Três componentes cliente pequenos guardam o "aberto/fechado": `AccountMenu`, `SearchToggle`, `FiltersPanel`.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind 4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-27-layout-celular-design.md`

## Global Constraints

- A partir de 640px (`sm:`) a tela fica **igual a hoje** (ordem, textos e aparência).
- Streamings e Todos/Doramas sempre à vista no celular.
- Botões novos: nome acessível, `aria-expanded`, foco com `FOCUS_RING` (`src/lib/ui.ts`).
- Ícones em SVG inline (o projeto não usa biblioteca de ícones).
- A conta continua dentro de `<Suspense fallback={null}>` (sem piscar "Entrar").
- Textos em português, como no resto do site.

## Antes de começar

- Com `npm run dev` rodando, tirar as fotos de "antes" do notebook com o Edge headless
  (`--headless=new --force-device-scale-factor=1 --window-size=1400,200`) em `/` e `/series`,
  guardadas no scratchpad, para comparar na Task 5. As fotos headless saem sem login; o estado
  logado é conferido pelos testes e pelo dono no navegador.

## Review Focus

- Busca já feita (`?q=` na URL): no celular a linha da busca começa aberta mostrando o texto — teste na Task 3.
- Menu da conta: fecha com Esc, com toque fora e ao escolher uma opção — testes na Task 2.
- Durante uma busca os filtros ficam desligados: o botão "Filtros" também — teste na Task 4.
- Teclado: abrir a busca põe o cursor no campo; os botões informam aberto/fechado (`aria-expanded`) — testes nas Tasks 3 e 4.
- Logado no notebook continua com "Minhas listas" · círculo (com e-mail no `title`) · "Sair", sem itens duplicados no HTML enquanto o menu está fechado — teste na Task 2.

---

### Task 1: Contagem de filtros ativos

**Files:**
- Modify: `src/lib/filters.ts`
- Test: `src/lib/filters.test.ts`

**Interfaces:**
- Produces: `activeFilterCount(f: Pick<Filters, 'genreId' | 'minRating' | 'sort'>): number` — +1 para `genreId`, +1 para `minRating`, +1 para `sort === 'rating'`. Doramas, streaming e busca não contam.

- [ ] **Step 1: Teste que falha**

```ts
test('activeFilterCount conta só Gênero, Nota e Ordem', () => {
  expect(activeFilterCount({})).toBe(0)
  expect(activeFilterCount({ genreId: 35 })).toBe(1)
  expect(activeFilterCount({ genreId: 35, minRating: 7, sort: 'rating' })).toBe(3)
})
```

- [ ] **Step 2:** `npx vitest run src/lib/filters.test.ts` → FAIL (função não existe).
- [ ] **Step 3:** Implementar `activeFilterCount` em `src/lib/filters.ts`.
- [ ] **Step 4:** Mesmo comando → PASS.
- [ ] **Step 5:** Commit `feat: contagem de filtros ativos (Gênero, Nota, Ordem)`.

### Task 2: Menu da conta no celular

**Files:**
- Create: `src/components/AccountMenu.tsx`, `src/components/AccountMenu.test.tsx`
- Modify: `src/components/AccountNav.tsx`, `src/components/AccountNav.test.tsx`

**Interfaces:**
- Produces: `AccountMenu({ initial, email }: { initial: string; email: string })` (cliente). Botão redondo âmbar com a inicial, `aria-label="Menu da conta"`, `aria-expanded`, **sem** `title` (o `title` com e-mail fica só no círculo do notebook). Aberto: lista com link "Minhas listas" (`/minhas-listas`) e botão "Sair" num `<form action={signOut}>`; o e-mail aparece em texto pequeno no topo do menu. Itens só são renderizados quando aberto.
- `AccountNav` logado: envolve a versão atual em `hidden sm:flex` e acrescenta `<div className="sm:hidden"><AccountMenu …/></div>`. Sem login: sem mudança.

- [ ] **Step 1: Testes que falham** em `AccountMenu.test.tsx` (mock de `@/app/actions/auth` como em `AccountNav.test.tsx`):
  - `'AccountMenu abre e mostra Minhas listas e Sair'`: botão "Menu da conta" com `aria-expanded="false"`; clicar → `aria-expanded="true"`, link "Minhas listas" com `href="/minhas-listas"`, botão "Sair", texto do e-mail.
  - `'AccountMenu fecha com Esc, com clique fora e ao escolher uma opção'`: abrir, `userEvent.keyboard('{Escape}')` → link some; abrir, clicar em `document.body` → some; abrir, clicar "Minhas listas" → some.
  - Em `AccountNav.test.tsx`, no teste logado, acrescentar: `expect(screen.getByRole('button', { name: 'Menu da conta' })).toBeInTheDocument()` e `expect(screen.getAllByRole('link', { name: 'Minhas listas' })).toHaveLength(1)`.
- [ ] **Step 2:** `npx vitest run src/components/AccountMenu.test.tsx src/components/AccountNav.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar `AccountMenu` (clique fora via `pointerdown` no `document` comparando com um `ref` do contêiner; Esc via `keydown`; listeners só enquanto aberto) e alterar `AccountNav`.
- [ ] **Step 4:** Mesmo comando → PASS.
- [ ] **Step 5:** Commit `feat: no celular, a conta vira um círculo com menu`.

### Task 3: Busca com ícone no celular

**Files:**
- Create: `src/components/SearchToggle.tsx`, `src/components/SearchToggle.test.tsx`
- Modify: `src/components/SearchBox.tsx`, `src/components/TopBar.tsx`, `src/components/TopBar.test.tsx`

**Interfaces:**
- `SearchBox` ganha prop opcional `inputRef?: React.Ref<HTMLInputElement>` repassada ao `<input>`.
- Produces: `SearchToggle({ type, initialQuery }: { type: MediaType; initialQuery?: string })` (cliente). Retorna um **fragmento** com dois itens do flex do `TopBar`:
  1. botão 🔍 `aria-label="Abrir busca"`, `aria-expanded`, `aria-controls` = id da linha, `sm:hidden`;
  2. a linha (`id`) com `SearchBox` + botão ✕ `aria-label="Fechar busca"` (`sm:hidden`). Classe: `${open ? 'flex' : 'hidden'} sm:flex`; no celular `order-1 w-full`, a partir de `sm:` como o `div` atual da busca (`sm:order-none sm:ml-auto sm:w-auto`).
  - Estado inicial: aberto se `initialQuery` não for vazio. Ao abrir pelo botão, foco no campo.
- `TopBar`: troca o `div` da busca por `<SearchToggle key={filters?.q ?? ''} …/>`. No celular a linha 1 fica: Logo · abas · 🔍 (empurrado à direita, `ml-auto`) · conta; a partir de `sm:` a ordem atual (busca depois dos streamings, conta por último).

- [ ] **Step 1: Testes que falham** em `SearchToggle.test.tsx` (mock de `next/navigation` como em `TopBar.test.tsx`):
  - `'SearchToggle abre a busca e põe o cursor no campo'`: botão "Abrir busca" com `aria-expanded="false"`; clicar → `"true"` e `expect(screen.getByRole('searchbox')).toHaveFocus()`.
  - `'SearchToggle fecha com o X'`: abrir, clicar "Fechar busca" → botão "Abrir busca" com `aria-expanded="false"`.
  - `'SearchToggle com busca feita começa aberto mostrando o texto'`: `initialQuery="duna"` → `aria-expanded="true"` e `searchbox` com valor `duna`.
  - Em `TopBar.test.tsx`: `expect(screen.getByRole('button', { name: 'Abrir busca' })).toBeInTheDocument()` no primeiro teste.
- [ ] **Step 2:** `npx vitest run src/components/SearchToggle.test.tsx src/components/TopBar.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar `inputRef`, `SearchToggle` e a troca no `TopBar` (comentários atuais sobre `order-1`/`ml-auto` atualizados).
- [ ] **Step 4:** Mesmo comando → PASS.
- [ ] **Step 5:** Commit `feat: no celular, a busca abre por um ícone`.

### Task 4: Painel de filtros no celular

**Files:**
- Create: `src/components/FiltersPanel.tsx`, `src/components/FiltersPanel.test.tsx`
- Modify: `src/components/FilterBar.tsx`

**Interfaces:**
- Consumes: `activeFilterCount` (Task 1).
- Produces: `FiltersPanel({ count, disabled, children }: { count: number; disabled: boolean; children: React.ReactNode })` (cliente). Retorna fragmento com:
  1. botão `sm:hidden` com texto "Filtros" ou "Filtros (n)" quando `count > 0`, `aria-expanded`, `aria-controls`, `disabled={disabled}`;
  2. painel (`id`) com `children`: celular `${open ? 'flex' : 'hidden'} order-last w-full flex-col`, Gênero/Nota/Ordem um embaixo do outro com a mesma largura; a partir de `sm:` `sm:contents` (os selects voltam a ser itens da faixa, como hoje).
- `FilterBar`: `<FiltersPanel count={activeFilterCount(filters)} disabled={searching}>` envolve `GenreSelect`, `RatingSelect`, `SortSelect`; `DoramasToggle` fica fora, ao lado do botão. A partir de `sm:` a ordem visual continua Gênero · Nota · Ordem · Doramas.

- [ ] **Step 1: Testes que falham** em `FiltersPanel.test.tsx`:
  - `'FiltersPanel abre e fecha o painel'`: botão "Filtros" com `aria-expanded="false"`; clicar → `"true"` e o painel (achado pelo `aria-controls`) não tem a classe `hidden`; clicar de novo → tem.
  - `'FiltersPanel mostra quantos filtros estão ativos'`: `count={2}` → botão com nome "Filtros (2)"; `count={0}` → "Filtros".
  - `'FiltersPanel desligado durante a busca'`: `disabled` → botão `toBeDisabled()`.
- [ ] **Step 2:** `npx vitest run src/components/FiltersPanel.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar `FiltersPanel` e ajustar `FilterBar`.
- [ ] **Step 4:** `npx vitest run` (tudo) → PASS; `npx tsc --noEmit` e `npx eslint src` sem erros.
- [ ] **Step 5:** Commit `feat: no celular, Gênero, Nota e Ordem num painel "Filtros"`.

### Task 5: Acabamento visual e conferência

**Files:**
- Modify: só classes nos componentes das Tasks 2–4, se preciso.

- [ ] **Step 1:** Usar a skill `frontend-design` para acertar espaçamentos, tamanhos de toque (mínimo ~40px nos botões novos), contraste e a aparência do menu e do painel, dentro da paleta (`noite`, `superficie`, `linha`, `texto`, `suave`, `ambar`) e da fonte atuais.
- [ ] **Step 2:** Fotos com o Edge headless (`--force-device-scale-factor=1`), servidor `npm run dev` rodando: `500x700` em `/`, `/series`, `/entrar` e `/?q=duna`; `1400x200` em `/` e `/series`. Esperado: celular com topo de 2 linhas e filtros em 1 linha; notebook igual às fotos de "antes" (seção "Antes de começar").
- [ ] **Step 3:** `npx vitest run`, `npx tsc --noEmit`, `npx eslint src` → tudo sem erros.
- [ ] **Step 4:** Commit `style: acabamento do topo e filtros no celular` (se houve mudança).
