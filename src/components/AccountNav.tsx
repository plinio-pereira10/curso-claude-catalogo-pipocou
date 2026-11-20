import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { getCurrentUser } from '@/lib/auth'
import { FOCUS_RING } from '@/lib/ui'
import { LoginLink } from './LoginLink'

/**
 * Parte do menu que depende de quem está logado (lê o cookie de sessão: fica dentro de <Suspense>).
 * Logado: "Minhas listas", círculo com a inicial e "Sair". Sem login: "Entrar".
 */
export async function AccountNav() {
  const user = await getCurrentUser()
  if (!user) return <LoginLink />

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/minhas-listas"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold text-texto/80 hover:bg-white/10 hover:text-texto ${FOCUS_RING}`}
      >
        Minhas listas
      </Link>
      <span
        title={user.email}
        className="flex size-8 items-center justify-center rounded-full bg-ambar text-sm font-extrabold text-noite"
      >
        {user.initial}
      </span>
      <form action={signOut}>
        <button type="submit" className={`rounded text-sm text-suave hover:text-texto ${FOCUS_RING}`}>
          Sair
        </button>
      </form>
    </div>
  )
}
