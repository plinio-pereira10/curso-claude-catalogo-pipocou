# Acabamento — Design curto

Data: 2026-11-15 · Mudança pequena (ajustes pendentes das revisões anteriores).

**Intenção:** fechar os ajustes pequenos acumulados — primeiro os visíveis, depois os internos.

**Objetivos visíveis (aprovados pelo dono):**
1. Página de detalhes: título sem votos mostra **"⭐ Sem nota"** em vez de "⭐ 0.0".
2. Logos repetidos: esconder variações (" with Ads", " Standard", " Amazon Channel", " Premium") **só quando o serviço principal também aparece** no mesmo país. Ex. real: Round 6 (Netflix + "Netflix Standard with Ads") → só Netflix; Duna 2 (HBO Max + "HBO Max Amazon Channel") → só HBO Max; "Telecine Amazon Channel" sozinho continua. Vale para Brasil e outros países.
3. Link "Ver no streaming" passa a se chamar **"Onde Assistir ↗"** (escolha do dono; grafia corrigida de "Assitir").
4. Botão "← voltar": se veio de outra página do próprio site, volta (mantém filtros); se abriu por link de fora, vai para a lista da aba certa (Filmes `/` ou Séries `/series`).

**Objetivos internos (decisões do Claude, sem mudança visível):**
5. Tempo-limite de 5 s cobre também a leitura da resposta (`response.json()`).
6. Cancelamento por tempo-limite registra "tempo esgotado (5 s)".
7. Testes: valor do tempo-limite (não dispara antes de 5 s; timer limpo após sucesso); GenreSelect mantém a nota.
8. Comentário do `MediaTabs` menciona que a nota também é mantida.

**Não-objetivos:** mudar regras de filtros; ordenar por nota.

**Abordagem:** só um caminho sensato para cada item, dentro dos arquivos já existentes (`format.ts`, `availability.ts`, `WhereToWatch.tsx`, `BackButton.tsx`, `client.ts`). Regra dos logos: normalizar o nome removendo os sufixos e manter o primeiro de cada nome-base (o TMDB lista o serviço principal primeiro).
