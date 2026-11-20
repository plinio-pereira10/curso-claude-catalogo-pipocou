'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { AUTH_MESSAGES, authErrorMessage, validateCredentials } from '@/lib/auth-errors'
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
