/** Duração em minutos → "2h46min" (ou "45min"). Sem duração → null. */
export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}min` : `${m}min`
}

/** Número de temporadas → "1 temporada" / "3 temporadas". Sem número → null. */
export function formatSeasons(n: number | null): string | null {
  if (!n) return null
  return n === 1 ? '1 temporada' : `${n} temporadas`
}

/** Nota do TMDB com uma casa decimal (ex.: 8.2). Sem votos (nota 0) → "Sem nota". */
export function formatRating(vote: number): string {
  if (vote === 0) return 'Sem nota'
  return vote.toFixed(1)
}
