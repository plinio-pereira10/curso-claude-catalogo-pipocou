# Guardar listas e tentar de novo — Design curto

Data: 2026-11-15 · Mudança pequena.

**Intenção:** o dono viu o site lento e com falhas. O log do `npm run dev` mostrou `TypeError: fetch failed` (conexão com o TMDB caindo por alguns minutos) e `Slow filesystem detected`. O revisor apontou que cada página pede ao TMDB as listas de streamings e de gêneros toda vez (3 pedidos por página; o "Carregar mais" também repete a lista de streamings).

**Objetivos:**
1. Guardar no servidor as listas de streamings (`getTopProviders`) e de gêneros (`getGenres`) por **1 hora** — perfil pronto `'hours'` do Next.js 16 (renova a cada 1 h em segundo plano, sem ninguém esperar; descarta após 1 dia sem visitas). Filmes e séries continuam buscados na hora.
2. Em `tmdbFetch`, **tentar de novo até 2 vezes** quando houver erro de conexão ou o TMDB responder 429 (sobrecarga) ou 5xx (erro dele). Não repetir em 4xx como 404. Se as 3 tentativas falharem, o erro segue como hoje.

**Não-objetivos:** mudar aparência, filtros ou "Carregar mais"; guardar listas de filmes/séries; resolver a lentidão de disco (isso é exceção no antivírus, do lado do dono).

**Restrições:** Next.js 16.4 com `cacheComponents`; ler `node_modules/next/dist/docs/` (`use cache`, `cacheLife`); token continua só no servidor; funções guardadas não podem ler APIs de requisição (não leem).

**Abordagens:**
1. *(escolhida)* `'use cache'` + `cacheLife('hours')` nas duas funções — recurso nativo, conforme a documentação.
2. Variável na memória com relógio feita à mão — descartada: mais código e não integra com o Next.
- Tentativas: laço simples dentro de `tmdbFetch` com pequenas esperas (300 ms e 1000 ms).

**Decisões do dono:** fazer a etapa; tempo de 1 hora (achou 6 h muito).

**Decisões do Claude:** esperas de 300 ms e 1000 ms entre tentativas; uma linha de log no servidor a cada nova tentativa.
