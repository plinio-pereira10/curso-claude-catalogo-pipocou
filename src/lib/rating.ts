/** Opções da lista "Nota": 6+, 7+ e 8+ (além de "Todas"). */
export const RATING_OPTIONS = [6, 7, 8] as const

export type MinRating = (typeof RATING_OPTIONS)[number]

/**
 * Mínimo de votos para um título entrar quando há nota escolhida.
 * Evita notas altas dadas por pouca gente. Para mudar o mínimo de votos, altere aqui.
 */
export const MIN_VOTE_COUNT = 15

/** "6", "7" ou "8" viram número; qualquer outra coisa é ignorada. */
export function parseMinRating(raw: string | undefined): MinRating | undefined {
  return RATING_OPTIONS.find((option) => String(option) === raw)
}
