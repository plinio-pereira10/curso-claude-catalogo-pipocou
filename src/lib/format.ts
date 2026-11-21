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

/**
 * Quantidade de votos: "1 voto", "44 votos", "1,2 mil votos", "18 mil votos". Sem votos → null.
 * Até 9.999 com uma casa (sem ",0"); a partir de 10 mil, arredondado.
 */
export function formatVotes(n: number): string | null {
  if (!n) return null
  if (n === 1) return '1 voto'
  if (n < 1000) return `${n} votos`
  const thousands = n / 1000
  const rounded = thousands < 9.95 ? Math.round(thousands * 10) / 10 : Math.round(thousands)
  return `${String(rounded).replace('.', ',')} mil votos`
}

/** Nota do TMDB com uma casa decimal (ex.: 8.2). Sem votos (nota 0) → "Sem nota". */
export function formatRating(vote: number): string {
  if (vote === 0) return 'Sem nota'
  return vote.toFixed(1)
}
