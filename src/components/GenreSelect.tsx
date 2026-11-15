'use client'

import { useRouter } from 'next/navigation'
import type { Filters } from '@/lib/filters'
import { listHref, type MediaType } from '@/lib/media'
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
    router.push(listHref(type, { providerId: filters.providerId, genreId, doramas: filters.doramas }))
  }

  // Se o gênero da URL não está na lista (ex.: escondido pelo Doramas), mostra "Todos".
  const selected = genres.some((g) => g.id === filters.genreId) ? filters.genreId : ''

  return (
    <label className="flex items-center gap-2 text-sm">
      Gênero:
      <select
        value={selected}
        onChange={(e) => change(e.target.value)}
        disabled={disabled}
        className="rounded border border-white/20 bg-zinc-900 px-2 py-1 disabled:opacity-40"
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
