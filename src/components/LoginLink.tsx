'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FOCUS_RING } from '@/lib/ui'

/** Botão "Entrar" que, depois do login, volta para a página onde a pessoa estava. */
export function LoginLink() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/entrar' || pathname === '/criar-conta'
  const href = pathname === '/' || isAuthPage ? '/entrar' : `/entrar?voltar=${encodeURIComponent(pathname)}`

  return (
    <Link href={href} className={`rounded-full border border-linha px-4 py-1.5 text-sm font-semibold ${FOCUS_RING}`}>
      Entrar
    </Link>
  )
}
