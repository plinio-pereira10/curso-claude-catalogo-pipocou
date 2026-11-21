import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import { cache } from 'react'
import { SUPABASE_TIMEOUT_MS, supabaseEnv, TIMED_OUT, withTimeout } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** A pessoa logada, só com o que o site usa. */
export type CurrentUser = {
  id: string
  email: string
  /** Primeira letra do e-mail, maiúscula (o círculo do menu). */
  initial: string
}

/** Resultado de perguntar ao Supabase quem está logado. */
export type UserLookup = {
  user: CurrentUser | null
  /** true = não foi possível perguntar (Supabase fora do ar); false = resposta confiável. */
  failed: boolean
}

/**
 * Pergunta ao Supabase quem está logado. Nunca lança erro.
 * `cache` (do React) guarda a resposta durante a montagem de uma página: o menu, os botões e as
 * listas perguntam várias vezes, mas o Supabase só é consultado uma vez.
 * Lê cookies: use só dentro de <Suspense>.
 */
export const lookupCurrentUser = cache(async (): Promise<UserLookup> => {
  if (!supabaseEnv()) return { user: null, failed: false }
  try {
    const supabase = await createSupabaseServerClient()
    // Limite total de 5 s: renovar a sessão pode fazer várias tentativas seguidas.
    const answer = await withTimeout(supabase.auth.getUser(), SUPABASE_TIMEOUT_MS)
    if (answer === TIMED_OUT) {
      console.error('Supabase: tempo esgotado ao ler o usuário')
      return { user: null, failed: true }
    }
    const { data, error } = answer
    const user = data?.user
    if (error) {
      // "sem sessão" é a resposta normal para quem não entrou; o resto é falha de verdade
      const noSession = error.name === 'AuthSessionMissingError'
      if (!noSession) console.error('Supabase: não foi possível ler o usuário', error)
      return { user: null, failed: !noSession }
    }
    if (!user?.email) return { user: null, failed: false }
    return { user: { id: user.id, email: user.email, initial: user.email.charAt(0).toUpperCase() }, failed: false }
  } catch (error) {
    // erros internos do Next (ex.: fim da pré-renderização) voltam para o Next tratar
    unstable_rethrow(error)
    console.error('Supabase: não foi possível ler o usuário', error)
    return { user: null, failed: true }
  }
})

/**
 * Quem está logado agora, ou null (sem sessão, sem variáveis ou com o Supabase fora do ar).
 * O catálogo continua funcionando como para quem não tem conta.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  return (await lookupCurrentUser()).user
}
