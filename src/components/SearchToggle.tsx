'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { MediaType } from '@/lib/media'
import { FOCUS_RING } from '@/lib/ui'
import { SearchBox } from './SearchBox'

/** Botões redondos do celular (lupa e X): 40px para o dedo. */
const ROUND_BUTTON = `flex size-10 shrink-0 items-center justify-center rounded-full border border-linha text-texto/90 hover:bg-white/10 hover:text-texto sm:hidden ${FOCUS_RING}`

/**
 * Busca do menu. No celular fica escondida atrás de um botão de lupa e abre numa linha
 * própria (com X para fechar); a partir de `sm:` o campo está sempre à vista.
 * Devolve dois itens do flex do menu: o botão e a linha.
 */
export function SearchToggle({ type, initialQuery = '' }: { type: MediaType; initialQuery?: string }) {
  const [open, setOpen] = useState(initialQuery !== '')
  const rowId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const lupaRef = useRef<HTMLButtonElement>(null)
  // só leva o cursor ao campo quando o usuário abre pelo botão (não na abertura inicial)
  const focusOnOpen = useRef(false)

  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false
      inputRef.current?.focus()
    }
  }, [open])

  function openSearch() {
    // já aberta (ex.: com ?q=): só leva o cursor ao campo
    if (open) {
      inputRef.current?.focus()
      return
    }
    focusOnOpen.current = true
    setOpen(true)
  }

  function closeSearch() {
    setOpen(false)
    // o X some junto com a linha; o foco volta para a lupa
    lupaRef.current?.focus()
  }

  return (
    <>
      <button
        ref={lupaRef}
        type="button"
        aria-label="Abrir busca"
        aria-expanded={open}
        aria-controls={rowId}
        onClick={openSearch}
        className={`ml-auto ${ROUND_BUTTON}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>

      {/* No celular ocupa a linha toda e desce (order-1); a partir de sm fica no fluxo, à direita dos streamings. */}
      <div
        id={rowId}
        className={`${open ? 'flex' : 'hidden'} order-1 w-full items-center gap-2 sm:order-none sm:ml-auto sm:flex sm:w-auto [&_button]:h-10 [&_input]:h-10 sm:[&_button]:h-auto sm:[&_input]:h-auto`}
      >
        <div className="min-w-0 flex-1 sm:flex-none">
          <SearchBox type={type} initialQuery={initialQuery} inputRef={inputRef} />
        </div>
        <button
          type="button"
          aria-label="Fechar busca"
          onClick={closeSearch}
          className={ROUND_BUTTON}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </>
  )
}
