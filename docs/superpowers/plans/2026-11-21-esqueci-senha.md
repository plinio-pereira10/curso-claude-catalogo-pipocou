# "Esqueci minha senha" — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recuperar a senha por e-mail (link com `token_hash`), no site publicado e no localhost.

**Architecture:** Server Actions `requestPasswordReset` e `updatePassword` (em `src/app/actions/auth.ts`); Route Handler `GET /auth/confirm` chama `verifyOtp` e redireciona; páginas `/esqueci-senha` e `/nova-senha` com formulários `useActionState`.

**Tech Stack:** Next.js 16.4, `@supabase/ssr`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-21-esqueci-senha-design.md`

## Global Constraints

- Textos exatos: `Esqueci minha senha`, `Enviar link`, `Se existir uma conta com esse e-mail, enviamos um link para criar uma senha nova.`, `Muitos pedidos. Espere alguns minutos e tente de novo.`, `Este link não vale mais. Peça um novo abaixo.`, `Nova senha`, `Salvar senha`.
- `redirectTo` = `${proto}://${host}` da requisição (`x-forwarded-proto`/`host`; padrão `https`, e `http` para `localhost`).
- `/auth/confirm` aceita só `type=recovery` e `token_hash` não vazio; sucesso → `/nova-senha`; qualquer falha → `/esqueci-senha?erro=link`.
- `updatePassword` exige usuário logado (sessão de recuperação); sem sessão → `{ error: 'Este link não vale mais. Peça um novo abaixo.' }`; sucesso → `redirect('/')`.
- `unstable_rethrow` em todo `catch`; `redirect` fora do `try`.
- Branch: `feat/esqueci-senha`.

## Review Focus

1. `requestPasswordReset` com e-mail inexistente ou não autorizado → mesma mensagem de sucesso (não revela). (Task 1)
2. `/auth/confirm` sem `token_hash`, com `type` diferente ou token vencido → `/esqueci-senha?erro=link`, nunca erro técnico. (Task 1)
3. `/nova-senha` aberta sem ter vindo do link → orientação para pedir um novo, sem quebrar. (Task 1)

---

### Task 1: Código

**Files:** `src/lib/auth-errors.ts` (+test), `src/app/actions/auth.ts` (+test), `src/app/auth/confirm/route.ts` (+test), `src/components/ForgotPasswordForm.tsx`, `src/components/NewPasswordForm.tsx` (+tests), `src/app/esqueci-senha/page.tsx`, `src/app/nova-senha/page.tsx`, `src/components/AuthForm.tsx` (+test)

- [ ] **Step 1: Testes que falham**

```ts
test('requestPasswordReset chama o Supabase com redirectTo da origem e devolve a mensagem neutra', ...)
test('requestPasswordReset com e-mail inválido avisa sem chamar o Supabase', ...)
test('requestPasswordReset com erro do Supabase (exceto limite) devolve a mesma mensagem neutra', ...)  // email_address_not_authorized, user_not_found
test('requestPasswordReset com limite atingido avisa para esperar', ...)                                  // over_email_send_rate_limit / status 429
test('updatePassword sem sessão orienta a pedir novo link', ...)
test('updatePassword com senha curta não chama o Supabase', ...)
test('updatePassword com sucesso vai para a página inicial', ...)
test('GET /auth/confirm com token válido vai para /nova-senha', ...)
test('GET /auth/confirm sem token, tipo errado ou token recusado vai para /esqueci-senha?erro=link', ...)
test('AuthForm entrar tem o link Esqueci minha senha', ...)
test('ForgotPasswordForm mostra a mensagem do link vencido quando pedido', ...)
test('NewPasswordForm envia a senha e mostra erro devolvido', ...)
```

- [ ] **Step 2: Rodar e ver falhar.** · **Step 3: Implementar.** · **Step 4: `npm test && npx tsc --noEmit && npm run lint && npm run build`.**
- [ ] **Step 5: Commit** — `feat: esqueci minha senha (pedido, link e nova senha)`

### Task 2: Configuração no Supabase e teste real

**Files:** `supabase/email-redefinir-senha.html`, `README.md`

- [ ] **Step 1:** Escrever o modelo do e-mail (assunto + corpo em português) e a seção do README.
- [ ] **Step 2: Parar e guiar o dono:** URL Configuration (Site URL + 2 Redirect URLs) e modelo "Reset Password".
- [ ] **Step 3: Verificar o que dá sem a caixa de entrada:** pedido pelo site (mensagem neutra, sem erro no servidor); `/auth/confirm?token_hash=invalido&type=recovery` → `/esqueci-senha?erro=link`; `/nova-senha` sem sessão → orientação.
- [ ] **Step 4: Teste do dono** (só ele recebe o e-mail): pedir o link com o e-mail da conta do Supabase, abrir o e-mail (de preferência no celular), definir a senha nova e entrar com ela.
- [ ] **Step 5: Commit** — `docs: modelo do e-mail de nova senha e passo a passo no README`
