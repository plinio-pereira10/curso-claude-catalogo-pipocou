import { unstable_rethrow } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Para onde leva o link do e-mail "Esqueci minha senha":
 * /auth/confirm?token_hash=...&type=recovery
 * Confere o código com o Supabase (que cria a sessão de recuperação) e abre a tela "Nova senha".
 * Link vencido, já usado ou inválido → volta para "Esqueci minha senha" com o aviso.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')
  const fail = NextResponse.redirect(new URL('/esqueci-senha?erro=link', request.url))

  if (!tokenHash || type !== 'recovery') return fail

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })
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
