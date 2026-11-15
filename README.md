# Catálogo de Filmes

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

## Comandos

- `npm run dev` — roda o site em modo de desenvolvimento
- `npm test` — roda os testes automáticos
- `npm run build` — gera a versão de produção (e confere se está tudo certo)

## Documentação

- Design: `docs/superpowers/specs/2026-11-14-catalogo-filmes-design.md`
- Plano: `docs/superpowers/plans/2026-11-14-catalogo-filmes.md`

Dados de filmes fornecidos pelo TMDB. Disponibilidade em streaming fornecida pelo JustWatch. Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
