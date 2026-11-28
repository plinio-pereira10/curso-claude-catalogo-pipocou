'use client'

import { useId, useState } from 'react'
import { FOCUS_RING } from '@/lib/ui'

type Props = {
  /** Quantos filtros (Gênero, Nota, Ordem) estão ativos. */
  count: number
  /** Durante uma busca os filtros ficam desligados. */
  disabled: boolean
  /** Os selects de Gênero, Nota e Ordem. */
  children: React.ReactNode
}

/**
 * Filtros da lista. No celular ficam num painel aberto pelo botão "Filtros (n)", em
 * linha própria (order-last), um embaixo do outro com a mesma largura; a partir de `sm:`
 * o painel some (`sm:contents`) e os selects voltam a ser itens da faixa.
 * Devolve dois itens do flex da faixa: o botão e o painel.
 */
export function FiltersPanel({ count, disabled, children }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  // durante uma busca o painel fecha (os filtros ficam desligados)
  const expanded = open && !disabled

  return (
    <>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:hidden ${
          expanded ? 'border-texto/40 bg-white/10' : 'border-linha'
        } ${FOCUS_RING}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </svg>
        {count > 0 ? `Filtros (${count})` : 'Filtros'}
      </button>

      <div
        id={panelId}
        className={`${expanded ? 'flex' : 'hidden'} order-last w-full flex-col gap-3 rounded-2xl border border-linha bg-superficie/60 p-4 sm:contents sm:[&_label]:w-auto sm:[&_label]:justify-start sm:[&_select]:w-auto [&_label]:w-full [&_label]:justify-between [&_select]:h-10 [&_select]:w-44 sm:[&_select]:h-auto`}
      >
        {children}
      </div>
    </>
  )
}
