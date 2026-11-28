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

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`rounded-full border border-linha px-4 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:hidden ${FOCUS_RING}`}
      >
        {count > 0 ? `Filtros (${count})` : 'Filtros'}
      </button>

      <div
        id={panelId}
        className={`${open ? 'flex' : 'hidden'} order-last w-full flex-col gap-3 sm:contents sm:[&_label]:w-auto sm:[&_label]:justify-start sm:[&_select]:w-auto [&_label]:w-full [&_label]:justify-between [&_select]:w-44`}
      >
        {children}
      </div>
    </>
  )
}
