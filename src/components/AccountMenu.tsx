'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { signOut } from '@/app/actions/auth'
import { FOCUS_RING } from '@/lib/ui'

/**
 * Menu da conta para o celular: um círculo com a inicial que abre "Minhas listas" e "Sair".
 * Fecha com Esc, clique fora ou ao escolher uma opção.
 */
export function AccountMenu({ initial, email }: { initial: string; email: string }) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!aberto) return
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAberto(false)
      // as opções somem; o foco volta para o círculo
      botao.current?.focus()
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
        ref={botao}
        type="button"
        aria-label="Menu da conta"
        aria-expanded={aberto}
        aria-controls={aberto ? menuId : undefined}
        onClick={() => setAberto((v) => !v)}
        className={`flex size-10 items-center justify-center rounded-full ${FOCUS_RING}`}
      >
        {/* Círculo de 32px como no notebook; o botão em volta tem 40px para o dedo. */}
        <span
          className={`flex size-8 items-center justify-center rounded-full bg-ambar text-sm font-extrabold text-noite ${
            aberto ? 'ring-2 ring-ambar/40 ring-offset-2 ring-offset-noite' : ''
          }`}
        >
          {initial}
        </span>
      </button>
      {aberto && (
        <div id={menuId} className="absolute right-0 top-full z-50 mt-2 flex w-56 flex-col gap-0.5 rounded-2xl border border-linha bg-superficie p-1.5 shadow-xl shadow-black/50">
          <p className="mb-1 truncate border-b border-linha px-3 pt-1.5 pb-2.5 text-xs text-suave">{email}</p>
          <Link
            href="/minhas-listas"
            onClick={() => setAberto(false)}
            className={`flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-texto hover:bg-white/10 hover:text-texto ${FOCUS_RING}`}
          >
            Minhas listas
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className={`flex min-h-10 w-full items-center rounded-xl px-3 text-left text-sm text-suave hover:bg-white/10 hover:text-texto ${FOCUS_RING}`}
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
