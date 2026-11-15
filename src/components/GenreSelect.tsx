'use client'

import { useRouter } from 'next/navigation'
import { filtersToQuery } from '@/lib/filters'
import type { Genre } from '@/lib/tmdb/types'

type Props = {
  genres: Genre[]
  selectedId?: number
  providerId?: number
  disabled: boolean
}

export function GenreSelect({ genres, selectedId, providerId, disabled }: Props) {
  const router = useRouter()

  function change(value: string) {
    const genreId = value ? Number(value) : undefined
    router.push('/?' + filtersToQuery({ providerId, genreId }))
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      Gênero:
      <select
        value={selectedId ?? ''}
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
