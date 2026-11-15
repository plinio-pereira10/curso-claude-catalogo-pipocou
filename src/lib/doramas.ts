import type { MediaType } from './media'
import type { Genre } from './tmdb/types'

/** Países de origem que contam como dorama: Coreia do Sul, Japão, China, Taiwan, Tailândia. */
export const DORAMA_COUNTRIES = ['KR', 'JP', 'CN', 'TW', 'TH']

/**
 * Gêneros que NÃO contam como dorama.
 * Filmes: Animação. Séries: Animação, Reality, Talk (auditório) e News.
 */
export function doramaExcludedGenres(type: MediaType): number[] {
  return type === 'tv' ? [16, 10764, 10767, 10763] : [16]
}

/** Lista de gêneros a mostrar: com Doramas ligado, esconde os excluídos. */
export function visibleGenres(genres: Genre[], type: MediaType, doramas: boolean): Genre[] {
  if (!doramas) return genres
  const excluded = doramaExcludedGenres(type)
  return genres.filter((g) => !excluded.includes(g.id))
}

/** Gênero que vale de verdade: com Doramas ligado, um gênero excluído é ignorado. */
export function effectiveGenreId(type: MediaType, genreId: number | undefined, doramas: boolean): number | undefined {
  if (genreId && doramas && doramaExcludedGenres(type).includes(genreId)) return undefined
  return genreId
}
