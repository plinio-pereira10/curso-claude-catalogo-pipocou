# Botão "Voltar" e votos — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Botão "Voltar" que diz o destino (opção C) e "(N votos)" ao lado da nota na página de detalhes.

**Architecture:** `navigation-history.ts` vira uma pequena "loja" (snapshot imutável + assinantes); `BackButton` lê com `useSyncExternalStore` e calcula o texto com `backLabel`. `getTitleDetails` mapeia `vote_count`; `formatVotes` formata.

**Tech Stack:** Next.js 16.4, React 19, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-21-voltar-e-votos-design.md`

## Global Constraints

- Textos: `Voltar`, `Voltar para Filmes`, `Voltar para Séries`, `Voltar para Minhas listas` (acessível como nome do botão).
- Votos: `formatVotes(0) = null`, `1 voto`, `44 votos`, `1,2 mil votos`, `1 mil votos`, `18 mil votos`; mostrado como `(…)` em cor `suave` após a nota.
- Branch: `feat/voltar-e-votos`.

## Review Focus

1. Abrir o detalhe por link direto → texto "Voltar para Séries/Filmes" e o clique vai para a lista. (Task 1)
2. Detalhe → outro detalhe → "Voltar" (sem destino) e o clique volta ao detalhe anterior. (Task 1)
3. Sem diferença entre o HTML do servidor e o primeiro desenho no navegador (sem aviso de hidratação). (Task 1)

---

### Task 1: Histórico com página anterior e botão novo

**Files:** `src/lib/navigation-history.ts`, `src/components/BackButton.tsx` (+test)

- **Interfaces:** `type HistorySnapshot = { visits: number; firstPath: string | null; currentPath: string | null; previousPath: string | null }`; `getHistorySnapshot()`, `getServerHistorySnapshot()`, `subscribeHistory(cb)`, `recordVisit(path)`, `hasInAppHistory()`; `backLabel(type: MediaType, s: HistorySnapshot): string`.
- [ ] Testes que falham: `backLabel` (link direto tv/movie; anterior `/`, `/series`, `/minhas-listas`, `/filme/7`); `BackButton` mostra "Voltar para Séries" ao vir de `/series`, "Voltar" vindo de outro detalhe, "Voltar para Séries" por link direto, e atualiza quando a visita é registrada depois do desenho; testes atuais de clique ajustados ao nome novo.
- [ ] Implementar · `npm test && npx tsc --noEmit` · Commit `feat: botão Voltar diz para onde volta`

### Task 2: Quantidade de votos

**Files:** `src/lib/tmdb/types.ts`, `src/lib/tmdb/titles.ts` (+test), `src/lib/format.ts` (+test), `src/components/TitleDetailsPage.tsx`

- [ ] Testes que falham: `formatVotes` (casos acima); `getTitleDetails` devolve `voteCount`.
- [ ] Implementar e mostrar `(N votos)` após a nota quando `voteAverage > 0` · `npm test && npx tsc --noEmit && npm run lint && npm run build` · verificação real (`/serie/93405` mostra "(18 mil votos)") · Commit `feat: quantidade de votos na página de detalhes`
