import { visibleGenres } from '@/lib/doramas'
import type { Filters } from '@/lib/filters'
import { MEDIA, type MediaType } from '@/lib/media'
import type { Genre } from '@/lib/tmdb/types'
import { DoramasToggle } from './DoramasToggle'
import { GenreSelect } from './GenreSelect'
import { RatingSelect } from './RatingSelect'
import { SortSelect } from './SortSelect'

type Props = {
  type: MediaType
  /** Todos os gêneros da aba (o Doramas esconde alguns aqui dentro). */
  genres: Genre[]
  filters: Omit<Filters, 'page'>
}

/** Faixa com Gênero, Nota, Ordem e Doramas. Durante uma busca ficam desligados e aparece o aviso da busca. */
export function FilterBar({ type, genres, filters }: Props) {
  const searching = Boolean(filters.q)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <GenreSelect
          type={type}
          genres={visibleGenres(genres, type, filters.doramas)}
          filters={filters}
          disabled={searching}
        />
        <RatingSelect type={type} filters={filters} disabled={searching} />
        <SortSelect type={type} filters={filters} disabled={searching} />
        <DoramasToggle type={type} filters={filters} disabled={searching} />
      </div>
      {searching && <p className="text-sm text-suave">{MEDIA[type].searchNote}</p>}
    </div>
  )
}
