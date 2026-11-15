'use client'

import { useRouter } from 'next/navigation'
import type { Filters } from '@/lib/filters'
import { listHref, type MediaType } from '@/lib/media'
import { parseMinRating, RATING_OPTIONS } from '@/lib/rating'

type Props = {
  type: MediaType
  filters: Omit<Filters, 'page'>
  disabled: boolean
}

/** Lista "Nota: Todas / 6+ / 7+ / 8+". Mantém os outros filtros escolhidos. */
export function RatingSelect({ type, filters, disabled }: Props) {
  const router = useRouter()

  function change(value: string) {
    router.push(listHref(type, { ...filters, q: undefined, minRating: parseMinRating(value) }))
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      Nota:
      <select
        value={filters.minRating ?? ''}
        onChange={(e) => change(e.target.value)}
        disabled={disabled}
        className="rounded border border-white/20 bg-zinc-900 px-2 py-1 disabled:opacity-40"
      >
        <option value="">Todas</option>
        {RATING_OPTIONS.map((rating) => (
          <option key={rating} value={rating}>
            {rating}+
          </option>
        ))}
      </select>
    </label>
  )
}
