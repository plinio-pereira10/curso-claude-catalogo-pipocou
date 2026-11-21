# Espaço entre o menu e o banner — plano

Design: `docs/superpowers/specs/2026-11-21-espaco-banner-design.md`

## Tarefa 1 — selo do streaming na linha da nota (TDD)

- Teste em `src/components/HeroBanner.test.tsx`: o nome do streaming aparece em texto na linha da nota, junto de nota e ano; não existe imagem com o nome do streaming (logo decorativo).
- Rodar e ver falhar.
- Em `src/components/HeroBanner.tsx`: remover o `<Image>` do provider do topo; na linha da nota (`<p className="flex items-center gap-4 ...">`) adicionar primeiro `<span className="flex items-center gap-2"><Image ... alt="" className="size-5 rounded" />{provider.name}</span>`.
- Rodar e ver passar.

## Tarefa 2 — margem no topo e altura mínima

- Section: trocar `h-[75vh] min-h-[34rem] sm:h-[65vh] sm:min-h-[28rem] lg:h-[70vh]` por `flex flex-col min-h-[max(75vh,34rem)] sm:min-h-[max(65vh,28rem)] lg:min-h-[max(70vh,28rem)]`.
- Wrapper do conteúdo: `h-full` vira `flex-1`, e entra `pt-36 sm:pt-28`.
- Só visual (classes); conferido no navegador. Rodar todos os testes, lint e build.
