# Contas e "Minhas listas" — Design

Data: 2026-11-20
Base: catálogo atual no `main` (filmes e séries, Doramas, Romance, nota, visual estilo streaming).

## Intenção e porquê

O dono do projeto está num curso aprendendo a criar com o Claude Code. Agora quer que cada pessoa possa **guardar o que quer assistir e o que já assistiu**, com **conta própria (e-mail e senha)**, usando o **Supabase**. É a primeira etapa com banco de dados e login — já prevista no primeiro design ("Next.js permite login e favoritos no futuro").

## Objetivos

1. **Criar conta e entrar** com e-mail e senha (Supabase Auth). **Sem confirmação de e-mail**: cadastrou, já está logado. Senha mínima de 6 caracteres (padrão do Supabase). **Sair** pelo menu.
2. **Catálogo continua aberto**: navegar não exige conta; o login só é pedido ao marcar ou ao abrir "Minhas listas".
3. **Marcar títulos** (filmes **e** séries) na **página de detalhes**, com dois botões: **"Quero assistir"** e **"Já assisti"**.
   - Um título fica em **uma lista só**: marcar "Já assisti" tira de "Quero assistir" e vice-versa.
   - Clicar de novo no botão marcado **desmarca**.
   - Sem login: o botão leva para "Entrar" e, depois de entrar (ou criar conta), **volta para o mesmo título**. A marcação **não** é feita automaticamente: a pessoa clica no botão de novo (decisão do dono; a gravação automática pode vir depois).
4. **Etiquetas nos cartões** (fileiras, grade, "Carregar mais", banner não precisa): títulos marcados mostram **"Quero assistir"** ou **"✓ Assisti"**. Só para quem está logado.
5. **Menu do topo**:
   - Logado: **Filmes | Séries | Minhas listas** + círculo com a **inicial** do e-mail + **"Sair"**.
   - Sem login: **"Entrar"** no lugar do círculo; a aba "Minhas listas" não aparece.
6. **"Minhas listas"** (endereço próprio): duas sub-abas **"Quero assistir (N)"** e **"Já assisti (N)"**, com filmes e séries juntos, etiqueta **"Filme"** ou **"Série"** em cada cartão, **mais recentes primeiro**. Lista vazia: "Você ainda não marcou nenhum título." com link para o catálogo. Sem filtros nesta etapa.

Esboços aprovados (companheiro visual): opção B de navegação ("Minhas listas" com sub-abas) e opção A de marcação (botões só na página de detalhes + etiquetas nos cartões).

```
Logado:  🎬 Catálogo  Filmes  Séries │ Minhas listas            (P) Sair
         [ Quero assistir (12) ] [ Já assisti (30) ]
         ┌──────┐ ┌──────┐ ┌──────┐
         │Série │ │Filme │ │Série │   ← etiqueta do tipo
         └──────┘ └──────┘ └──────┘

Detalhes: Pousando no Amor (2019)  ★ 8.7 · 1 temporada
          [✓ Quero assistir] [ Já assisti ]
```

## Não-objetivos

- "Esqueci minha senha" e confirmação de e-mail (ficam para depois, juntos).
- Login social (Google etc.), foto/perfil, troca de e-mail/senha.
- Filtros e busca dentro de "Minhas listas"; atalhos de marcar nos cartões.
- Notas pessoais, listas personalizadas, compartilhar listas.

## Anti-objetivos

- Uma pessoa conseguir ver ou alterar as listas de outra.
- Segredos do Supabase (chave de serviço) no navegador ou no git.
- Dados de uma pessoa entrarem num cache compartilhado (`'use cache'`) e aparecerem para outra.
- Quebrar o catálogo para quem não tem conta ou deixar as páginas lentas para todos por causa do login.

## Restrições

- **Next.js 16.4 com `cacheComponents`**: ler `node_modules/next/dist/docs/` antes (especialmente `02-guides/authentication-with-cache-components.md`, `authentication.md`, `01-getting-started/16-proxy.md`, `07-mutating-data.md`). Leitura de cookies só dentro de `<Suspense>`; nunca dentro de `'use cache'`. Em Next 16 o antigo "middleware" se chama **proxy** (`proxy.ts`).
- **Supabase**: pacotes `@supabase/supabase-js` e `@supabase/ssr`. Variáveis em `.env.local` (e modelo em `.env.example`): URL do projeto e **chave pública** (publishable/anon) — podem ser `NEXT_PUBLIC_…`, pois são públicas por natureza; a segurança vem das regras RLS. **Nada de chave de serviço.**
- O dono precisa: criar o projeto no Supabase, **desligar "Confirm email"** em Authentication → Providers → Email, rodar o SQL da tabela no SQL Editor, e copiar URL + chave pública. O builder entrega esse SQL num arquivo do repositório e instruções no README.
- Token do TMDB continua só no servidor; tudo que já existe continua funcionando.
- Textos em português do Brasil.

## Abordagens consideradas

1. **Supabase pelo servidor (escolhida).** Login/cadastro/sair e marcação por funções de servidor (Server Actions); sessão em cookie com `@supabase/ssr`; `proxy.ts` renova a sessão; listas numa tabela com RLS. Etiquetas e listas já chegam prontas na página; mesmo padrão do resto do site; é o que o guia do Next recomenda. Custo: mais peças (cookie, proxy, actions).
2. **Supabase só no navegador.** Menos peças, mas etiquetas/nome aparecem depois de a página carregar, o servidor não sabe quem está logado (complica "Minhas listas" e o "voltar ao mesmo título") e destoa do resto do site.
3. Login próprio sem Supabase — descartado: o dono escolheu o Supabase.

## Decisões do dono

- Filmes e séries; sem confirmação de e-mail; "esqueci a senha" depois.
- Navegação: "Minhas listas" com duas sub-abas.
- Marcação: botões só na página de detalhes; etiquetas nos cartões.
- Regras: uma lista só por título; clicar de novo desmarca; sem login → "Entrar" → volta ao título.
- Caminho 1 (Supabase pelo servidor).
- Depois de entrar pelo botão de marcar: volta ao título, sem marcar sozinho.

## Ordem de trabalho (combinada com o dono)

O **projeto Supabase real** do dono precisa existir **antes** da construção, porque a regra RLS (ninguém vê as listas de outro) só pode ser comprovada contra um Supabase de verdade. Primeiro passo do plano: o dono cria o projeto (região São Paulo), desliga "Confirm email", roda o SQL entregue pelo builder e informa URL + chave pública. A verificação do RLS com **duas contas de teste** faz parte do plano.

## Decisões do Claude (podem ser revistas)

- **Guardar um retrato do título ao marcar**: além de `tipo` + `id do TMDB` + `lista`, a linha guarda nome, imagem de cena, cartaz e ano. "Minhas listas" abre com **uma** consulta ao Supabase, sem um pedido ao TMDB por título. (O retrato pode ficar desatualizado se o TMDB mudar o nome/imagem — aceitável.)
- Tabela (nome sugerido `user_titles`): `user_id` (ligado ao usuário do Supabase), `media_type` (`movie`|`tv`), `tmdb_id`, `status` (`want`|`watched`), campos do retrato, `created_at`/`updated_at`; **chave única** (`user_id`, `media_type`, `tmdb_id`) — garante "uma lista só"; **RLS** permitindo a cada usuário só ler/inserir/alterar/apagar as próprias linhas.
- Ordem "mais recentes primeiro" usa a data da última marcação (mudar de lista conta como recente).
- Telas **"Entrar"** e **"Criar conta"** simples no visual atual (e-mail, senha, link para alternar), com mensagens de erro em português (e-mail/senha errados, e-mail já cadastrado, senha curta).
- Endereços sugeridos: `/entrar`, `/criar-conta`, `/minhas-listas` (sub-aba na URL, ex.: `?lista=assistidos`). O "voltar ao título" usa um parâmetro com o endereço de origem, aceitando **só caminhos internos** do site (nunca um site externo).
- Inicial do círculo = primeira letra do e-mail, em maiúscula.
- "Sair" leva para a página inicial (`/`).
- Se o Supabase estiver fora do ar: o catálogo continua funcionando (sem etiquetas, menu mostra "Entrar"); os botões de marcar e as telas de login mostram uma mensagem de erro em português.

## Deixado para quem construir

- Nomes de arquivos, funções e tipos; organização da "camada de acesso a dados" (ex.: `getCurrentUser`, `getUserMarks`), seguindo o guia do Next.
- Como as etiquetas chegam aos itens do "Carregar mais" (ex.: a rota interna devolver o estado de cada item, ou o cliente receber o conjunto de marcados).
- Detalhes visuais dos botões, das telas de login e das etiquetas, seguindo o visual atual (paleta azul-noite, botões arredondados, `FOCUS_RING`).
- Estados de carregamento e erro dos botões de marcar (ex.: desabilitar enquanto grava; mensagem se falhar).
- Testes no estilo atual (Vitest com globais; mocks do cliente Supabase onde necessário) e verificação real com o projeto Supabase do dono.
