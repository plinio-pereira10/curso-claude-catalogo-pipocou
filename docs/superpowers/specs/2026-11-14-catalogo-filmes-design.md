# Catálogo de Filmes em Streaming — Design

Data: 2026-11-14

## Intenção e porquê

Um site que mostra os filmes disponíveis **agora** nos serviços de streaming no Brasil, usando a API do TMDB.

O dono do projeto está fazendo um curso e quer **aprender a criar com o Claude Code**. O objetivo principal é aprender, não lançar um produto. Por isso:
- Vale mais um site simples que funcione de ponta a ponta do que um site cheio de funções.
- Cada parte deve ser fácil de entender e de ver funcionando rapidamente.
- A base precisa permitir as próximas etapas (login, favoritos, séries, trailers) sem refazer o projeto.

## Objetivos (esta etapa)

1. **Tela de lista**: grade de cartazes dos filmes disponíveis por assinatura no Brasil.
   - Filtro por serviço de streaming (botões com o logo de cada serviço).
   - Filtro por gênero (lista suspensa).
   - Busca por nome do filme.
   - Botão "Carregar mais" para ver mais resultados.
2. **Tela de detalhes**: cartaz grande, título, ano, duração, nota, gênero(s), sinopse e **em quais streamings o filme está** no Brasil.
   - **Se o filme não estiver em nenhuma assinatura no Brasil**, mostrar em quais outros países ele está disponível por assinatura e em quais serviços (ex.: "Estados Unidos — Netflix, Max"). Exibir os primeiros países e um botão "ver todos". O endpoint `/movie/{id}/watch/providers` já devolve todos os países numa única chamada. Nomes dos países em português. (Pedido do dono do projeto; o formato da exibição é proposta do Claude.)
3. Crédito obrigatório ao TMDB e ao JustWatch visível no site (rodapé).

Esboço da tela de lista:
```
┌──────────────────────────────────────────┐
│  🎬 Catálogo de Filmes     [🔍 buscar  ] │
│  [Netflix] [Prime] [Disney+] [Max] ...   │
│  Gênero: [Todos ▾]                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│            [ Carregar mais ]             │
└──────────────────────────────────────────┘
```

Esboço da tela de detalhes:
```
┌──────────────────────────────────────────┐
│  ← voltar                                │
│  ┌──────┐  Título (Ano)                  │
│  │      │  ⭐ nota   ⏱ duração   Gênero   │
│  └──────┘  Sinopse...                    │
│            Onde assistir: [logos]        │
└──────────────────────────────────────────┘
```

## Não-objetivos (ficam para etapas futuras)

- Login e contas de usuário.
- Lista de favoritos.
- Séries de TV.
- Trailers.
- Banco de dados (esta etapa só lê dados do TMDB; nada é guardado).
- Filmes disponíveis só para aluguel ou compra.
- Navegar o catálogo de outros países (a lista e os filtros são só do Brasil; outros países aparecem apenas na tela de detalhes, como informação).

## Anti-objetivos (seria um fracasso mesmo funcionando)

- A chave/token do TMDB aparecer no navegador ou no repositório.
- Código tão complexo que o dono do projeto não consegue acompanhar o que cada parte faz.
- Uma arquitetura que obrigue a refazer o projeto para adicionar login e favoritos.

## Restrições

- **Região fixa: Brasil** (`watch_region=BR`) e textos em português (`language=pt-BR`).
- **"Disponível" = incluso na assinatura** (`with_watch_monetization_types=flatrate`).
- **Uso não comercial**, dentro dos termos gratuitos do TMDB. Atribuição ao TMDB e ao JustWatch é obrigatória.
- A busca `/discover/movie` do TMDB devolve no máximo 500 páginas por consulta; o site trabalha com filtros e paginação, nunca com "todos de uma vez".
- O token do TMDB fica só no servidor (variável de ambiente, ex.: `TMDB_READ_TOKEN` em `.env.local`, fora do git).
- O dono precisa criar uma conta no TMDB e gerar o token de leitura (API Read Access Token).

## Abordagens consideradas

1. **HTML/CSS/JS puros**: mais simples de entender, sem instalação. Descartada porque o token fica exposto no navegador e a base não suporta bem login e favoritos.
2. **React (Vite) só no navegador**: componentes reaproveitáveis e muito usado no mercado. Descartada porque o token continua exposto e login/favoritos exigiriam outra peça depois.
3. **Next.js (escolhida)**: React com parte que roda no servidor. O token fica escondido no servidor, há caminho direto para login e favoritos (ex.: Supabase) e o deploy na Vercel é gratuito. Custo: um pouco mais de conceitos no começo.

O dono do projeto escolheu o Next.js, depois de confirmar que ele permite banco de dados para login e favoritos no futuro.

## Decisões do dono do projeto

- Plataforma: site no navegador (web app).
- Tecnologia: Next.js.
- Telas e funções: as descritas em Objetivos; o resto fica para depois.
- País: Brasil; somente assinatura (proposta aceita).

## Decisões menores (tomadas pelo Claude, podem ser revistas)

- **Ordem padrão da lista:** por popularidade.
- **Tela de detalhes:** mostra só os serviços de assinatura, coerente com a regra "somente assinatura".
- **Busca por nome:** se aparecer um filme que não está em nenhuma assinatura no Brasil, mostrar a mensagem "Não disponível em streaming no momento" em vez de escondê-lo.

## Deixado para quem construir

- Detalhes do Next.js (App Router, TypeScript, estilização — sugestão: Tailwind CSS).
- Como os filtros se combinam e se refletem na URL (sugestão: filtros na URL, para o botão "voltar" e links funcionarem).
- Quais serviços aparecem como botões (sugestão: buscar a lista de `/watch/providers/movie?watch_region=BR` e mostrar os principais).
- Como a busca por nome convive com os filtros. Atenção: o endpoint `/search/movie` do TMDB não filtra por streaming, então é preciso decidir como tratar isso.
- Estados de carregamento, erro e "nenhum filme encontrado".
- Testes (manter simples, adequados a um projeto de aprendizado).
- Layout responsivo para funcionar no celular.
- Deploy na Vercel é opcional nesta etapa.
