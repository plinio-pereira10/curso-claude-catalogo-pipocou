/** Duração em minutos → "2h46min" (ou "45min"). Sem duração → null. */
export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}min` : `${m}min`
}

/** Nota do TMDB com uma casa decimal (ex.: 8.2). */
export function formatRating(vote: number): string {
  return vote.toFixed(1)
}
