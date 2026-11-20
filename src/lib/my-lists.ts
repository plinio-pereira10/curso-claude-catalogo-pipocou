import type { MarkStatus } from './marks'
import type { TitleSummary } from './tmdb/types'
import type { SavedTitle } from './user-titles'

/** Sub-aba de "Minhas listas" pela URL: `?lista=assistidos` = "Já assisti"; o resto = "Quero assistir". */
export function parseListParam(raw: string | undefined): MarkStatus {
  return raw === 'assistidos' ? 'watched' : 'want'
}

/** Converte um título salvo para o formato que o cartão usa. */
export function savedToSummary(s: SavedTitle): TitleSummary {
  return {
    id: s.tmdbId,
    title: s.title,
    posterPath: s.posterPath,
    backdropPath: s.backdropPath,
    releaseYear: s.releaseYear,
    voteAverage: s.voteAverage,
    overview: '',
  }
}
