'use server'

import { headers } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { AUTH_MESSAGES, authErrorMessage, MIN_PASSWORD_LENGTH, validateCredentials } from '@/lib/auth-errors'
import { safeRedirectPath } from '@/lib/redirect'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** O que as telas "Entrar" e "Criar conta" recebem de volta: a mensagem de erro, se houver. */
export type AuthState = { error: string | null }

function readForm(form: FormData) {
  return {
    email: String(form.get('email') ?? '').trim(),
    password: String(form.get('password') ?? ''),
    voltar: safeRedirectPath(String(form.get('voltar') ?? '')),
  }
}

/** Entrar com e-mail e senha. Deu certo → volta para a página de onde a pessoa veio. */
export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const { email, password, voltar } = readForm(form)
  const invalid = validateCredentials(email, password)
  if (invalid) return { error: invalid }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: authErrorMessage(error) }
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: falha ao entrar', error)
    return { error: AUTH_MESSAGES.connection }
  }
  redirect(voltar) // fora do try: o redirect interrompe a função lançando um aviso interno do Next
}

/** Criar conta. Sem confirmação de e-mail: a pessoa já sai logada e volta para onde estava. */
export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const { email, password, voltar } = readForm(form)
  const invalid = validateCredentials(email, password)
  if (invalid) return { error: invalid }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: authErrorMessage(error) }
    // Sem sessão = o Supabase está pedindo confirmação de e-mail (opção "Confirm email" ligada).
    if (!data.session) return { error: AUTH_MESSAGES.connection }
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: falha ao criar conta', error)
    return { error: AUTH_MESSAGES.connection }
  }
  redirect(voltar)
}

/** Sair e voltar para a página inicial. */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: falha ao sair', error)
  }
  redirect('/')
}

// ---- Esqueci minha senha ----

/** O que a tela "Esqueci minha senha" recebe de volta. */
export type ResetRequestState = { error: string | null; sent: boolean }

/**
 * Endereço do próprio site (ex.: https://curso-claude-code-chi.vercel.app ou http://localhost:3000),
 * para o link do e-mail voltar para cá. O Supabase só aceita endereços cadastrados em
 * "Redirect URLs", então um cabeçalho forjado não consegue mandar o link para outro site.
 */
async function siteOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  const proto = h.get('x-forwarded-proto') ?? (isLocal ? 'http' : 'https')
  return `${proto}://${host}`
}

/**
 * Pede ao Supabase o e-mail com o link para criar uma senha nova.
 * A resposta é a mesma exista ou não a conta (não revela quais e-mails estão cadastrados).
 */
export async function requestPasswordReset(_prev: ResetRequestState, form: FormData): Promise<ResetRequestState> {
  const email = String(form.get('email') ?? '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: AUTH_MESSAGES.invalidEmail, sent: false }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await siteOrigin()}/auth/confirm`,
    })
    if (error?.code === 'over_email_send_rate_limit' || error?.code === 'over_request_rate_limit' || error?.status === 429) {
      return { error: AUTH_MESSAGES.tooManyRequests, sent: false }
    }
    // Outros erros (ex.: e-mail não autorizado no plano gratuito) não aparecem para a pessoa.
    if (error) console.error('Supabase: pedido de nova senha não enviado', error.code ?? error.message)
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: falha ao pedir nova senha', error)
    return { error: AUTH_MESSAGES.connection, sent: false }
  }
  return { error: null, sent: true }
}

/**
 * Salva a senha nova. Só funciona logo depois de abrir o link do e-mail
 * (o link cria uma sessão de recuperação). Deu certo → página inicial, já logado.
 */
export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get('password') ?? '')
  if (password.length < MIN_PASSWORD_LENGTH) return { error: AUTH_MESSAGES.shortPassword }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      if (error.name === 'AuthSessionMissingError') return { error: AUTH_MESSAGES.linkExpired }
      if (error.code === 'same_password') return { error: AUTH_MESSAGES.samePassword }
      return { error: authErrorMessage(error) }
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: falha ao salvar a senha nova', error)
    return { error: AUTH_MESSAGES.connection }
  }
  redirect('/')
}
