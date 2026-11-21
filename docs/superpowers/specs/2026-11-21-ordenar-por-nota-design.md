# Ordenar por nota — Design curto

Data: 2026-11-21 · Mudança pequena (opção B adiada do filtro de nota).

**Intenção:** poder ver primeiro os títulos mais bem avaliados, combinando com os filtros existentes.

**Dados reais que guiaram o mínimo de votos (Netflix BR, ordem por nota):** com 15 votos o topo dos filmes vira especiais pouco conhecidos ("Franco Escamilla…", 9.1 com 34 votos); com 100 aparecem os esperados (Como Mágica, Um Sonho de Liberdade). Doramas séries (8 streamings): 624 títulos com 15+ votos, 210 com 100+. O dono escolheu o meio-termo **50**.

**Objetivos:**
- Lista "Ordem:" na faixa de filtros com **Mais populares** (padrão, comportamento atual) e **Mais bem avaliados**.
- "Mais bem avaliados": `sort_by=vote_average.desc` e **pelo menos 50 votos** (`vote_count.gte`). Com nota escolhida também, vale o maior mínimo (50).
- URL `ordem=nota`; escolher a ordem mostra a grade (conta como filtro); "Carregar mais" respeita; trocar de aba mantém a ordem; a busca por nome desliga a ordem.

**Não-objetivos:** ordem em "Minhas listas" (continua por marcação) e na tela inicial (banner/fileiras por popularidade); outras ordens (data, nome).

**Abordagem:** só um caminho sensato — mais um filtro no mesmo fluxo de URL → `parseFilters` → `loadCatalogPage` → `discoverTitles`, como streaming, gênero e nota.

**Decisões do dono:** fazer só esta etapa agora; mínimo de 50 votos na ordem (o filtro de nota continua com 15); rótulos e comportamento propostos aprovados.

**Decisões do Claude:** constante `SORT_MIN_VOTE_COUNT = 50` em `src/lib/rating.ts`; ordem da URL `provider, genre, nota, ordem, doramas, q, page`; valores de `ordem` diferentes de `nota` são ignorados.
