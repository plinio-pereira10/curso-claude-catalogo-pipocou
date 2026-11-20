import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseEnv } from '@/lib/supabase/env'

/**
 * Roda antes de cada página (no Next.js 16, o antigo "middleware" se chama proxy).
 * Renova a sessão do Supabase quando ela está para vencer e grava o cookie novo na resposta.
 * Sem as variáveis do Supabase, não faz nada (o catálogo funciona sem login).
 */
export async function proxy(request: NextRequest) {
  const env = supabaseEnv()
  if (!env) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
      },
    },
  })

  try {
    // Confere a sessão com o Supabase (e renova se precisar). Não decide nada sobre acesso aqui.
    await supabase.auth.getUser()
  } catch (error) {
    console.error('Supabase: não foi possível renovar a sessão', error)
  }

  return response
}

export const config = {
  // Todas as páginas, menos arquivos do Next e imagens.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
