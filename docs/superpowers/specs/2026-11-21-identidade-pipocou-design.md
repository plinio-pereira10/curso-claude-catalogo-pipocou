# Identidade visual "Pipocou" — Design curto

Data: 2026-11-21 · Mudança pequena.

**Intenção:** o dono achou simples demais o "🎬 Catálogo" e a flor do botão "🌸 Doramas". Pediu um nome divertido; dos 5 propostos escolheu 3 (Pipocou, Bora Ver?, Tá Passando) e, nos esboços feitos com a skill `frontend-design`, escolheu **Pipocou** (logo A) e o Doramas **"Todos | Doramas"** (opção 3).

**Objetivos (aprovados pelo dono):**
1. Site passa a se chamar **Pipocou**.
   - Logo no menu do topo: "Pipocou" na fonte **Fredoka** (700, só no logo, via `next/font`), cor `texto`; o pingo do "i" é uma **pipoca âmbar** (`#f2c14e`, SVG). Substitui "🎬 Catálogo"; continua sendo o link para `/`, com nome acessível "Pipocou".
   - Títulos da aba: `Pipocou` (página inicial; descrição "Filmes e séries disponíveis agora nos streamings do Brasil.") e `<página> — Pipocou` nas internas (ex.: `Round 6 — Pipocou`, `Séries — Pipocou`).
   - Ícone da aba: a pipoca âmbar em fundo azul-noite (`src/app/icon.svg`); o `favicon.ico` padrão sai.
   - README com o nome novo.
2. Botão Doramas vira **"Todos | Doramas"** (dois segmentos, o escolhido em pílula branca, como as abas Filmes | Séries). "Doramas" liga, "Todos" desliga; mesma regra de hoje (soma com streaming/gênero/nota/ordem, remove gênero excluído ao ligar, desativado na busca). Grupo com nome acessível "Doramas" e `aria-pressed` em cada segmento.

**Não-objetivos:** mudar cores, fonte do resto do site, layout ou funções; logo nos e-mails do Supabase.

**Abordagem:** só um caminho sensato — componente `Logo` novo usado pelo `TopBar`; constante `SITE_NAME = 'Pipocou'` em `src/lib/site.ts` usada em todos os títulos; `DoramasToggle` passa a renderizar os dois segmentos.
