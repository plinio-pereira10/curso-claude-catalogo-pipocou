# Espaço entre o menu e o banner — plano

Design: `docs/superpowers/specs/2026-11-21-espaco-banner-design.md`

## Tarefa 1 — selo do streaming na linha da nota (TDD)

- Teste em `src/components/HeroBanner.test.tsx`: o nome do streaming aparece em texto na linha da nota, junto de nota e ano; o logo continua lá, mas sem nome para o leitor de tela (decorativo).
- Em `src/components/HeroBanner.tsx`: tirar o logo do topo do conteúdo e colocá-lo, com o nome, no começo da linha da nota.

## Tarefa 2 — menu dentro do banner, com a altura real (TDD)

(A primeira versão usava `pt-36 sm:pt-28` fixos; o revisor mostrou que não cobria a linha dos streamings no menu. Trocado por esta.)

- Testes: `TopBar variant="overlay"` é `absolute` e `variant="banner"` não; o `header` do `HeroBanner` fica na parte de fora do banner, antes do conteúdo e fora da região "Destaques".
- `TopBar`: prop `variant: 'solid' | 'overlay' | 'banner'` (detalhes usa `overlay`; tela inicial usa `banner`).
- `HeroBanner`: parte de fora (`min-h-[max(..)]`, imagens, sombras, `header`) + `<section>` do carrossel (`flex-1`, conteúdo, bolinhas, pausa por mouse/foco).
- `CatalogPage`: com destaques, passa o `TopBar variant="banner"` como `header`; sem destaques, `TopBar` normal.

## Tarefa 3 — mesma altura para todos os destaques

- Título com altura fixa (`h-26 sm:h-28`), título em texto `line-clamp-2`; sinopse sempre com 3 linhas (`min-h-[3lh]`, `aria-hidden` quando vazia).
- Rodar todos os testes, lint, tipos e build; conferir no navegador.
