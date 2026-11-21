# Pipocou — filmes e séries nos streamings

Site que mostra os filmes disponíveis **agora** nos streamings do Brasil (só assinatura), com dados do [TMDB](https://www.themoviedb.org).

## Como rodar

1. **Crie uma conta gratuita no TMDB:** https://www.themoviedb.org/signup
2. **Gere o token:** entre na sua conta → Configurações → **API** → peça uma chave (uso pessoal/educacional). Copie o **API Read Access Token** (é o texto longo, começa com `eyJ...`).
3. **Guarde o token no projeto:** copie o arquivo `.env.example` para `.env.local` e cole o token:
   ```
   TMDB_READ_TOKEN=eyJ...seu token...
   ```
   O `.env.local` não vai para o git, então o seu token fica só no seu computador.
4. **Instale e rode:**
   ```
   npm install
   npm run dev
   ```
   Abra http://localhost:3000

## Contas e listas (Supabase)

O login e as listas "Quero assistir" / "Já assisti" usam o [Supabase](https://supabase.com) (plano gratuito).

1. Crie um projeto (região **South America (São Paulo)**).
2. **Authentication → Sign In / Providers → Email**: desligue **Confirm email**.
3. **SQL Editor → New query**: cole o arquivo `supabase/schema.sql` e clique em **Run** (cria a tabela e as regras de segurança). Sempre que esse arquivo mudar, rode-o de novo: ele não apaga dados.
4. **Project Settings → API Keys**: copie o **Project URL** e a **Publishable key** para o `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   Nunca use a chave **secret / service_role** no site.
5. **"Esqueci minha senha"** (no plano gratuito, o e-mail só chega para o e-mail da sua conta no Supabase):
   - **Authentication → URL Configuration**: em **Site URL**, o endereço do site publicado; em **Redirect URLs**, adicione `https://SEU-SITE.vercel.app/**` e `http://localhost:3000/**`.
   - O e-mail usa o modelo padrão do Supabase (em inglês), e o link só funciona **no mesmo navegador** em que foi pedido.
   - **Futuro (SMTP próprio, ex.: um Gmail só para o site):** permite editar o modelo em **Authentication → Emails → Templates → Reset Password** com o arquivo `supabase/email-redefinir-senha.html` (em português, link que funciona em qualquer aparelho) e enviar para qualquer pessoa.
6. Para conferir a segurança (ninguém vê as listas de outra pessoa): `node --env-file=.env.local scripts/check-rls.mjs` → deve terminar com **RLS OK**. O script cria duas contas de teste, que podem ser apagadas em Authentication → Users.

## Comandos

- `npm run dev` — roda o site em modo de desenvolvimento
- `npm test` — roda os testes automáticos
- `npm run build` — gera a versão de produção (e confere se está tudo certo)

## Documentação

- Design: `docs/superpowers/specs/2026-11-14-catalogo-filmes-design.md`
- Plano: `docs/superpowers/plans/2026-11-14-catalogo-filmes.md`

Dados de filmes fornecidos pelo TMDB. Disponibilidade em streaming fornecida pelo JustWatch. Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
