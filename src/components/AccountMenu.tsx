'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/actions/auth'
import { FOCUS_RING } from '@/lib/ui'

/**
 * Menu da conta para o celular: um círculo com a inicial que abre "Minhas listas" e "Sair".
 * Fecha com Esc, clique fora ou ao escolher uma opção.
 */
export function AccountMenu({ initial, email }: { initial: string; email: string }) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('pointerdown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        aria-label="Menu da conta"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className={`flex size-8 items-center justify-center rounded-full bg-ambar text-sm font-extrabold text-noite ${FOCUS_RING}`}
      >
        {initial}
      </button>
      {aberto && (
        <div className="absolute right-0 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-xl border border-white/10 bg-noite p-2 shadow-lg">
          <p className="truncate px-3 py-1 text-xs text-suave">{email}</p>
          <Link
            href="/minhas-listas"
            onClick={() => setAberto(false)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold text-texto/80 hover:bg-white/10 hover:text-texto ${FOCUS_RING}`}
          >
            Minhas listas
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className={`w-full rounded-lg px-3 py-2 text-left text-sm text-suave hover:bg-white/10 hover:text-texto ${FOCUS_RING}`}
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
