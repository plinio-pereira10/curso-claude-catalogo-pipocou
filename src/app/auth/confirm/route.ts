import { unstable_rethrow } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Para onde leva o link do e-mail "Esqueci minha senha". Aceita os dois formatos:
 * - `?code=...` — link padrão do Supabase (usado hoje): troca o código pela sessão. Só funciona
 *   no mesmo navegador em que o link foi pedido.
 * - `?token_hash=...&type=recovery` — link do modelo em português (para quando houver SMTP próprio).
 * Deu certo → tela "Nova senha". Vencido, já usado, outro navegador ou inválido → "Esqueci minha
 * senha" com o aviso.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const code = params.get('code')
  const tokenHash = params.get('token_hash')
  const fail = NextResponse.redirect(new URL('/esqueci-senha?erro=link', request.url))

  if (!code && !(tokenHash && params.get('type') === 'recovery')) return fail

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash! })
    if (error) {
      console.error('Supabase: link de nova senha recusado', error.code ?? error.message)
      return fail
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: falha ao conferir o link de nova senha', error)
    return fail
  }
  return NextResponse.redirect(new URL('/nova-senha', request.url))
}
