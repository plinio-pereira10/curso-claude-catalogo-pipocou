# "Esqueci minha senha" — Design curto

Data: 2026-11-21 · Mudança pequena.

**Intenção:** aprender no curso como funciona a recuperação de senha. **Basta funcionar para o dono** (decisão dele).

**Restrição descoberta (documentação oficial do Supabase):** o serviço de e-mail padrão só entrega para membros da equipe do projeto (os demais recebem "Email address not authorized") e tem limite de 2 e-mails por hora; não serve para produção. Para outros usuários seria preciso SMTP próprio (Resend, Brevo…) e, em geral, domínio próprio — fora desta etapa.

**Objetivos:**
1. Link **"Esqueci minha senha"** na tela "Entrar" → `/esqueci-senha`: campo e-mail + botão **"Enviar link"**.
2. Depois de enviar, sempre a mesma mensagem: **"Se existir uma conta com esse e-mail, enviamos um link para criar uma senha nova."** (não revela quais e-mails têm conta). Limite atingido → **"Muitos pedidos. Espere alguns minutos e tente de novo."**
3. Link do e-mail → `/auth/confirm?token_hash=…&type=recovery` → o site confere com o Supabase (`verifyOtp`), cria a sessão e leva a `/nova-senha`.
4. `/nova-senha`: senha nova (mínimo 6) → **"Salvar senha"** → atualiza (`updateUser`) e vai para a página inicial já logado.
5. Link vencido/usado/inválido → `/esqueci-senha?erro=link` com **"Este link não vale mais. Peça um novo abaixo."**; `/nova-senha` sem sessão mostra a mesma orientação.
6. Funciona no site publicado e no `localhost`.

**Não-objetivos:** confirmação de e-mail no cadastro; SMTP próprio/domínio; e-mails para outras pessoas.

**Abordagens:** (1) *escolhida* — link do e-mail com `token_hash` direto para o site (modelo do e-mail colado pelo dono, em português): funciona em qualquer aparelho. (2) padrão do Supabase (PKCE com `code`): só funciona no mesmo navegador em que o link foi pedido — descartada.

**Configuração pelo dono (Supabase):** Authentication → URL Configuration: **Site URL** = `https://curso-claude-code-chi.vercel.app`; **Redirect URLs** = `https://curso-claude-code-chi.vercel.app/**` e `http://localhost:3000/**`. Authentication → Emails → **Reset Password**: assunto e corpo em português fornecidos pelo builder, com o link `{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`.

**Mudança durante a construção (decisão do dono):** o painel do Supabase agora só permite editar os modelos de e-mail com SMTP próprio configurado. O dono escolheu a **opção A**: usar o modelo padrão (em inglês) e o link padrão do Supabase (PKCE): o link passa pelo Supabase e volta a `/auth/confirm?code=…`, que troca o código pela sessão (`exchangeCodeForSession`). Só funciona no mesmo navegador em que o link foi pedido — aceitável, pois só o dono usa. `redirectTo` passa a ser `<origem>/auth/confirm`. A rota continua aceitando `token_hash` (servirá quando houver SMTP). **Pendente para o futuro:** SMTP próprio — ideia do dono: um Gmail criado só para o site, com "senha de app" — para ter e-mail em português, link em qualquer aparelho e e-mails para qualquer pessoa. O arquivo `supabase/email-redefinir-senha.html` fica pronto para essa etapa.

**Decisões do Claude:** `redirectTo` = origem do próprio site, lida dos cabeçalhos da requisição (o Supabase só aceita endereços da lista acima, então um cabeçalho forjado não leva a outro site); o modelo do e-mail fica em `supabase/email-redefinir-senha.html`; mensagens e validação reaproveitam `auth-errors.ts`.
