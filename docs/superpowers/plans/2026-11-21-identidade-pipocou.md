# Identidade "Pipocou" — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nome/logo "Pipocou" (com pipoca no "i"), títulos e ícone novos, e Doramas como "Todos | Doramas".

**Architecture:** `src/lib/site.ts` (`SITE_NAME`, `pageTitle(name)`), `src/components/Logo.tsx` (Fredoka via `next/font/google` + SVG da pipoca), `src/app/icon.svg`; `DoramasToggle` com dois segmentos.

**Tech Stack:** Next.js 16.4, Tailwind 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-21-identidade-pipocou-design.md`

## Global Constraints

- `SITE_NAME = 'Pipocou'`; `pageTitle('Séries') = 'Séries — Pipocou'`; título da página inicial `Pipocou`.
- Logo: link para `/` com `aria-label="Pipocou"`; pipoca `#f2c14e` (`fill` da cor âmbar), decorativa (`aria-hidden`).
- Doramas: segmentos com textos exatos `Todos` e `Doramas`, `role="group"` + `aria-label="Doramas"`, `aria-pressed`.
- Branch: `feat/identidade-pipocou`.

## Review Focus

1. Título de todas as páginas com "— Pipocou" (nenhum "Catálogo" restante em textos visíveis). (Task 1)
2. "Todos" com Doramas desligado não navega (já está nele); "Doramas" com gênero excluído remove o gênero. (Task 2)
3. Logo legível e com foco visível pelo teclado. (Task 1)

---

### Task 1: Nome, logo, títulos e ícone

**Files:** `src/lib/site.ts` (+test), `src/components/Logo.tsx` (+test), `src/components/TopBar.tsx`, `src/app/layout.tsx`, páginas com `metadata`, `src/components/TitleDetailsPage.tsx`, `src/app/icon.svg`, remover `src/app/favicon.ico`, `README.md`

- [ ] Testes que falham: `pageTitle`; `Logo` é link para `/` com nome "Pipocou" e contém o SVG da pipoca; `TopBar` mostra o logo (sem "Catálogo").
- [ ] Implementar · `npm test && npx tsc --noEmit && npm run lint && npm run build` · `grep` sem "Catálogo" em `src` (fora de testes) · Commit `feat: nome e logo Pipocou`

### Task 2: Doramas "Todos | Doramas"

**Files:** `src/components/DoramasToggle.tsx` (+test)

- [ ] Testes que falham (atualizar os atuais para os segmentos): ligar pelo segmento "Doramas" mantém streaming/gênero; ligar remove gênero excluído; "Todos" desliga mantendo filtros; segmento ativo com `aria-pressed="true"`; desativado na busca; clicar no segmento já ativo não navega.
- [ ] Implementar · checagens · verificação real (`/series?doramas=1` mostra "Doramas" ativo) · Commit `feat: Doramas como Todos | Doramas`
