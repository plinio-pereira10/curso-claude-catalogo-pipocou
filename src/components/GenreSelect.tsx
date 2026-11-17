'use client'

import { useRouter } from 'next/navigation'
import type { Filters } from '@/lib/filters'
import { listHref, type MediaType } from '@/lib/media'
import { FOCUS_RING } from '@/lib/ui'
import type { Genre } from '@/lib/tmdb/types'

type Props = {
  type: MediaType
  genres: Genre[]
  filters: Omit<Filters, 'page'>
  disabled: boolean
}

export function GenreSelect({ type, genres, filters, disabled }: Props) {
  const router = useRouter()

  function change(value: string) {
    const genreId = value ? Number(value) : undefined
    router.push(listHref(type, { ...filters, q: undefined, genreId }))
  }

  // Se o gênero da URL não está na lista (ex.: escondido pelo Doramas), mostra "Todos".
  const selected = genres.some((g) => g.id === filters.genreId) ? filters.genreId : ''

  return (
    <label className="flex items-center gap-2 text-sm text-suave">
      Gênero:
      <select
        value={selected}
        onChange={(e) => change(e.target.value)}
        disabled={disabled}
        className={`rounded-full border border-linha bg-superficie py-1.5 pr-8 pl-4 text-sm disabled:opacity-40 ${FOCUS_RING}`}
      >
        <option value="">Todos</option>
        {genres.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </label>
  )
}
