# Botão "Voltar" e quantidade de votos — Design curto

Data: 2026-11-21 · Mudança pequena.

**Intenção:** o "← voltar" atual (texto pequeno e cinza) some sobre a imagem de cena; e a nota sozinha não diz o quanto é confiável. O dono pediu as duas melhorias; o visual do botão foi escolhido entre 3 esboços feitos com a skill `frontend-design` (opção **C — "Diz para onde volta"**).

**Objetivos (aprovados pelo dono):**
1. **Botão "Voltar"** claro e arredondado (`bg-texto`, texto `noite`, sombra), seta num círculo escuro, no canto sobre a imagem de cena. Texto conforme a página anterior dentro do site:
   - lista de Filmes (`/`) → "Voltar para **Filmes**"; lista de Séries (`/series`) → "Voltar para **Séries**"; `/minhas-listas` → "Voltar para **Minhas listas**"; outra página → "**Voltar**".
   - aberto por link de fora (primeira página da aba) → "Voltar para Filmes/Séries" conforme o tipo do título (é para onde o botão leva).
   - Comportamento igual ao atual: volta mantendo filtros e nunca sai do site.
2. **Votos só na página de detalhes:** `★ 7.9 (18 mil votos)`. Regras: 0 → nada (continua "Sem nota"); 1 → "1 voto"; até 999 → "44 votos"; 1.000–9.999 → uma casa ("1,2 mil votos", sem ",0": "1 mil votos"); a partir de 10.000 → inteiro arredondado ("18 mil votos").

**Não-objetivos:** votos nos cartões; identidade visual (nome/logo e botão Doramas) — próxima etapa.

**Abordagem:** histórico de navegação existente (`navigation-history.ts`) passa a guardar também a página anterior e avisar quem depende dele (`useSyncExternalStore`), para o texto do botão acompanhar a navegação sem diferença entre servidor e navegador. `vote_count` do TMDB entra em `TitleDetails.voteCount`.

**Decisões do Claude:** função pura `backLabel(type, snapshot)` e `formatVotes(n)` testadas; no servidor (e no primeiro desenho) o botão mostra "Voltar para Filmes/Séries" e se ajusta no navegador.
