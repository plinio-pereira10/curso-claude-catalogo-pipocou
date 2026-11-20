import 'server-only'
import { supabaseEnv } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** A pessoa logada, só com o que o site usa. */
export type CurrentUser = {
  id: string
  email: string
  /** Primeira letra do e-mail, maiúscula (o círculo do menu). */
  initial: string
}

/**
 * Quem está logado agora, ou null.
 * Nunca lança erro: sem sessão, sem variáveis ou com o Supabase fora do ar, devolve null
 * (o catálogo continua funcionando como para quem não tem conta).
 * Lê cookies: use só dentro de <Suspense>.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!supabaseEnv()) return null
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()
    const user = data?.user
    if (error || !user?.email) return null
    return { id: user.id, email: user.email, initial: user.email.charAt(0).toUpperCase() }
  } catch (error) {
    console.error('Supabase: não foi possível ler o usuário', error)
    return null
  }
}
