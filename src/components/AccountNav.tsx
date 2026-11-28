import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { getCurrentUser } from '@/lib/auth'
import { FOCUS_RING } from '@/lib/ui'
import { AccountMenu } from './AccountMenu'
import { LoginLink } from './LoginLink'

/**
 * Parte do menu que depende de quem está logado (lê o cookie de sessão: fica dentro de <Suspense>).
 * Logado: no notebook "Minhas listas", círculo com a inicial e "Sair"; no celular só o círculo, que abre um menu. Sem login: "Entrar".
 */
export async function AccountNav() {
  const user = await getCurrentUser()
  if (!user) return <LoginLink />

  return (
    <>
      <div className="hidden items-center gap-3 sm:flex">
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
      <div className="sm:hidden">
        <AccountMenu initial={user.initial} email={user.email} />
      </div>
    </>
  )
}
