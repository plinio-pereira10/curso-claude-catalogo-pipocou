/** As duas variáveis do Supabase (públicas por natureza; a segurança vem das regras RLS). */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return url && key ? { url, key } : null
}

/**
 * Opções do cookie de sessão. `httpOnly`: o JavaScript da página não consegue ler o cookie
 * (nenhum cliente Supabase roda no navegador aqui). `secure`: no site publicado, só via https.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

/** Quanto esperar o Supabase responder antes de desistir. */
export const SUPABASE_TIMEOUT_MS = 5000

/**
 * O fetch que o cliente do Supabase usa: igual ao normal, mas desiste depois de 5 s.
 * Sem isso, um Supabase travado deixaria as páginas de quem está logado presas.
 */
export async function supabaseFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(new Error(`tempo esgotado (${SUPABASE_TIMEOUT_MS / 1000} s)`)),
    SUPABASE_TIMEOUT_MS,
  )
  // se quem chamou também cancelar, repassa o cancelamento
  const outer = init.signal
  const onOuterAbort = () => controller.abort(outer?.reason)
  if (outer?.aborted) onOuterAbort()
  else outer?.addEventListener('abort', onOuterAbort)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
    outer?.removeEventListener('abort', onOuterAbort)
  }
}
