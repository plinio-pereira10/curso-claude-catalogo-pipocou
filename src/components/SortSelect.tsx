'use client'

import { useRouter } from 'next/navigation'
import type { Filters } from '@/lib/filters'
import { listHref, type MediaType } from '@/lib/media'
import { parseSortOrder } from '@/lib/rating'
import { FOCUS_RING } from '@/lib/ui'

type Props = {
  type: MediaType
  filters: Omit<Filters, 'page'>
  disabled: boolean
}

/** Lista "Ordem: Mais populares / Mais bem avaliados". Mantém os outros filtros escolhidos. */
export function SortSelect({ type, filters, disabled }: Props) {
  const router = useRouter()

  function change(value: string) {
    router.push(listHref(type, { ...filters, q: undefined, sort: parseSortOrder(value) }))
  }

  return (
    <label className="flex items-center gap-2 text-sm text-suave">
      Ordem:
      <select
        value={filters.sort === 'rating' ? 'nota' : ''}
        onChange={(e) => change(e.target.value)}
        disabled={disabled}
        className={`rounded-full border border-linha bg-superficie py-1.5 pr-8 pl-4 text-sm disabled:opacity-40 ${FOCUS_RING}`}
      >
        <option value="">Mais populares</option>
        <option value="nota">Mais bem avaliados</option>
      </select>
    </label>
  )
}
