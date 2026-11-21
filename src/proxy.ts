import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_OPTIONS, SUPABASE_TIMEOUT_MS, supabaseEnv, supabaseFetch, withTimeout } from '@/lib/supabase/env'

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
    cookieOptions: SESSION_COOKIE_OPTIONS,
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
        // A resposta que grava o cookie de sessão não pode ser guardada em cache (CDN/proxy),
        // senão o cookie de uma pessoa poderia ser entregue a outra.
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value)
      },
    },
  })

  try {
    // Confere a sessão com o Supabase (e renova se precisar). Não decide nada sobre acesso aqui.
    // Limite total de 5 s: com o Supabase travado, a página segue sem esperar a renovação.
    await withTimeout(supabase.auth.getUser(), SUPABASE_TIMEOUT_MS)
  } catch (error) {
    console.error('Supabase: não foi possível renovar a sessão', error)
  }

  return response
}

export const config = {
  // Todas as páginas, menos a rota interna do "Carregar mais" (api/), arquivos do Next e imagens.
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
