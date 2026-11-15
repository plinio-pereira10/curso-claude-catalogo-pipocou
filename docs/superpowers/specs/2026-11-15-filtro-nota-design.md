# Filtro por nota — Design curto

Data: 2026-11-15 · Mudança pequena.

**Intenção:** o dono quer filtrar o catálogo pela nota do TMDB, em todas as abas (não só doramas).

**Dados reais que guiaram as decisões (Netflix BR):** títulos com poucos votos têm notas pouco confiáveis (ex.: "100 Dias de Mentiras", 8.9 com 18 votos); doramas têm bem menos votos que séries famosas (The Office: 5.720) — Doramas nota 8+: 249 sem mínimo, 177 com mínimo 30, 109 com mínimo 100; 137 filmes da Netflix têm 0 votos ("⭐ 0.0").

**Objetivos:**
- Lista "Nota:" ao lado do gênero com **Todas / 6+ / 7+ / 8+**. Na URL: `nota=6|7|8`.
- Com 6+/7+/8+: só títulos com nota ≥ X **e pelo menos 15 votos** (`vote_average.gte`, `vote_count.gte`). "Todas": comportamento atual.
- Ordem continua por popularidade.
- Vale nas duas abas, com qualquer streaming, gênero (inclusive Romance de séries) e Doramas. Trocar de aba mantém a nota. "Carregar mais" respeita a nota.
- Busca por nome desliga a nota (como os outros filtros).

**Não-objetivos:** ordenar por nota (opção B, talvez no futuro); esconder "⭐ 0.0" com "Todas" (fica para a etapa de acabamento).

**Abordagens:** A (filtrar a partir de uma nota, ordem por popularidade) — escolhida pelo dono; B (ordenar por nota) e C (as duas) — descartadas por ora. Implementação: só um caminho sensato — mais um filtro no mesmo fluxo de streaming/gênero (URL → `parseFilters` → `loadCatalogPage` → `discoverTitles`).

**Decisões do dono:** opção A; opções 6+/7+/8+ (proposta aceita); **mínimo de 15 votos** (fácil de mudar depois).

**Decisões do Claude:** valores fora de 6/7/8 na URL são ignorados; o mínimo de votos fica numa constante única com comentário; os controles passam a preservar todos os filtros ao navegar (evita esquecer a nota em cada botão).
