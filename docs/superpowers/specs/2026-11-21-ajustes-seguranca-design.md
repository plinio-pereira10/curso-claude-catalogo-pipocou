# Ajustes de segurança — Design curto

Data: 2026-11-21 · Mudança pequena (itens adiados das revisões de "Contas e Minhas listas").

**Intenção:** deixar o site protegido antes de publicar na Vercel.

**Objetivos (aprovados pelo dono):**
1. **Limites na tabela `user_titles`** (CHECKs no banco): `title` 1–300 caracteres; `poster_path`/`backdrop_path` nulos ou no formato do TMDB `^/[A-Za-z0-9._-]+$` com até 100 caracteres; `release_year` nulo ou 1870–2100; `vote_average` 0–10. `created_at` sempre definido pelo banco (gatilho em insert e update; update não altera `created_at`). A ação `setMark` confere as mesmas regras antes de gravar (dado inválido → mensagem de erro normal). O dono roda o SQL de novo; as linhas atuais já cumprem as regras.
2. **Cookie de sessão protegido:** `httpOnly: true` (invisível ao JavaScript da página), `secure` em produção (só https), `sameSite: 'lax'`, `path: '/'` — no cliente do servidor e no `proxy.ts`. Nenhum cliente Supabase roda no navegador, então nada quebra.
3. **Tempo-limite de 5 s** em toda chamada ao Supabase (fetch próprio passado ao cliente). Sem resposta → "não logado" (catálogo segue funcionando); ações mostram a mensagem de erro.
4. **`proxy.ts` não roda em `/api/`** (o "Carregar mais" não usa a sessão).

**Não-objetivos:** "esqueci a senha"/confirmação de e-mail (depois de publicar); limite de linhas por pessoa; `getClaims()` no lugar de `getUser()`.

**Abordagem:** só um caminho sensato para cada item, nos arquivos já existentes (`supabase/schema.sql`, `src/lib/marks.ts`, `src/app/actions/marks.ts`, `src/lib/supabase/*`, `src/proxy.ts`).

**Decisões do Claude:** regras de validação num só lugar (`src/lib/marks.ts`), usadas pela ação; opções do cookie e o fetch com tempo-limite em `src/lib/supabase/env.ts`, compartilhados entre servidor e proxy; o script de RLS ganha uma verificação de que o banco recusa um título gigante.
