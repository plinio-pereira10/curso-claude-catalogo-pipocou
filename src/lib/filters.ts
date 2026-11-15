/** Os filtros da lista, lidos do endereço da página (ex.: `?provider=8&genre=35`). */
export type Filters = {
  providerId?: number
  genreId?: number
  q?: string
  page: number
}

type SearchParams = Record<string, string | string[] | undefined>

const MAX_PAGE = 500

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Aceita só inteiros positivos escritos por extenso ("8"); o resto vira undefined. */
function positiveInt(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  const n = Number.parseInt(value, 10)
  return n > 0 ? n : undefined
}

/** Lê os filtros da URL. Valores inválidos são ignorados (nunca dá erro). */
export function parseFilters(sp: SearchParams): Filters {
  const filters: Filters = { page: Math.min(positiveInt(first(sp.page)) ?? 1, MAX_PAGE) }

  const providerId = positiveInt(first(sp.provider))
  if (providerId) filters.providerId = providerId

  const genreId = positiveInt(first(sp.genre))
  if (genreId) filters.genreId = genreId

  const q = first(sp.q)?.trim()
  if (q) filters.q = q

  return filters
}

/** Monta o texto da URL (sem o "?") a partir dos filtros. Omite vazios e a página 1. */
export function filtersToQuery(f: Omit<Filters, 'page'> & { page?: number }): string {
  const params = new URLSearchParams()
  if (f.providerId) params.set('provider', String(f.providerId))
  if (f.genreId) params.set('genre', String(f.genreId))
  if (f.q) params.set('q', f.q)
  if (f.page && f.page > 1) params.set('page', String(f.page))
  return params.toString()
}
