import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseEnv } from './env'

/**
 * Cliente do Supabase para o servidor, ligado aos cookies da pessoa (a sessão fica num cookie).
 * Lê cookies, então só pode ser usado dentro de <Suspense> e nunca dentro de 'use cache'.
 */
export async function createSupabaseServerClient() {
  const env = supabaseEnv()
  if (!env) throw new Error('Variáveis do Supabase não configuradas')
  const cookieStore = await cookies()

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options)
        } catch {
          // Em páginas (Server Components) não dá para gravar cookies; o proxy.ts renova a sessão.
        }
      },
    },
  })
}
