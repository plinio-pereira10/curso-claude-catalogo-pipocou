const IMAGE_BASE = 'https://image.tmdb.org/t/p'

export type PosterSize = 'w185' | 'w342' | 'w500'

/** URL do cartaz no TMDB, ou null quando o filme não tem cartaz. */
export function posterUrl(path: string | null, size: PosterSize = 'w342'): string | null {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

/** URL do logo de um serviço de streaming. */
export function logoUrl(path: string): string {
  return `${IMAGE_BASE}/w92${path}`
}
