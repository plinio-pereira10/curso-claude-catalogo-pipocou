# Romance para séries — Design curto

Data: 2026-11-15 · Mudança pequena sobre `2026-11-15-series-e-doramas-design.md`.

**Intenção:** o dono quer "doramas de romance" na aba Séries. O TMDB não tem gênero Romance para séries (só para filmes). Consulta real (Doramas + Netflix BR): sem gênero 709, Drama 629 (quase não filtra), Soap 2, palavra-chave "romance" (id 9840) 232, com resultados românticos de verdade.

**Objetivo:** a lista de gêneros da aba Séries ganha "Romance", que filtra pela palavra-chave `9840` do TMDB (`with_keywords`). Soma com Doramas e streaming. Fica visível com Doramas ligado.

**Não-objetivos:** mudar a aba Filmes (já tem Romance real); combinar vários gêneros; outros gêneros por palavra-chave.

**Restrições:** um gênero por vez (como hoje); a busca por nome continua desligando filtros.

**Abordagens:**
1. *(escolhida)* "Romance" como mais uma opção da lista de gêneros de séries, usando o mesmo número do Romance de filmes (`10749`); no pedido ao TMDB de séries, esse número vira `with_keywords=9840`. Links antigos como `/series?genre=10749` passam a funcionar.
2. Um controle separado de Romance — descartado: o dono quer Romance junto aos gêneros.
3. Deixar Drama/Soap — descartado pelo dono após ver os números.

**Efeitos aceitos pelo dono:** depende das etiquetas da comunidade do TMDB — pode faltar algum dorama romântico e aparecer algum que não é só romance; os números variam com o tempo.

**Decisões do Claude:** a opção "Romance" entra em ordem alfabética na lista de séries; constantes `ROMANCE_GENRE_ID = 10749` e `ROMANCE_KEYWORD_ID = 9840` ficam em `src/lib/tmdb/titles.ts`.
