'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FOCUS_RING } from '@/lib/ui'

/** Botão "Entrar" que, depois do login, volta para a página onde a pessoa estava. */
export function LoginLink() {
  const pathname = usePathname()
  const isAuthPage = ['/entrar', '/criar-conta', '/esqueci-senha', '/nova-senha'].includes(pathname)
  const href = pathname === '/' || isAuthPage ? '/entrar' : `/entrar?voltar=${encodeURIComponent(pathname)}`

  return (
    <Link href={href} className={`rounded-full border border-linha px-3 py-1.5 sm:px-4 text-sm font-semibold ${FOCUS_RING}`}>
      Entrar
    </Link>
  )
}
