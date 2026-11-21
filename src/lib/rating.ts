/** Opções da lista "Nota": 6+, 7+ e 8+ (além de "Todas"). */
export const RATING_OPTIONS = [6, 7, 8] as const

export type MinRating = (typeof RATING_OPTIONS)[number]

/**
 * Mínimo de votos para um título entrar quando há nota escolhida.
 * Evita notas altas dadas por pouca gente. Para mudar o mínimo de votos, altere aqui.
 */
export const MIN_VOTE_COUNT = 15

/**
 * Mínimo de votos na ordem "Mais bem avaliados" (maior que o do filtro: na ordem por nota,
 * títulos com poucos votos e nota alta iriam para o topo). Para mudar, altere aqui.
 */
export const SORT_MIN_VOTE_COUNT = 50

/** Ordem da lista além da padrão (popularidade): só "por nota", `ordem=nota` na URL. */
export type SortOrder = 'rating'

/** "nota" vira a ordem por nota; qualquer outra coisa é ignorada (fica a padrão). */
export function parseSortOrder(raw: string | undefined): SortOrder | undefined {
  return raw === 'nota' ? 'rating' : undefined
}

/** "6", "7" ou "8" viram número; qualquer outra coisa é ignorada. */
export function parseMinRating(raw: string | undefined): MinRating | undefined {
  return RATING_OPTIONS.find((option) => String(option) === raw)
}
