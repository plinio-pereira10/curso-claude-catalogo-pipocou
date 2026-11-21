import { parseMinRating, parseSortOrder, type MinRating, type SortOrder } from './rating'

/** Os filtros da lista, lidos do endereço da página (ex.: `?provider=8&genre=35`). */
export type Filters = {
  providerId?: number
  genreId?: number
  /** Nota mínima (6, 7 ou 8), `nota=` na URL. */
  minRating?: MinRating
  /** Ordem "Mais bem avaliados" (`ordem=nota` na URL); sem ela, por popularidade. */
  sort?: SortOrder
  q?: string
  /** Botão Doramas ligado (`doramas=1` na URL). */
  doramas: boolean
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
  const filters: Filters = {
    doramas: first(sp.doramas) === '1',
    page: Math.min(positiveInt(first(sp.page)) ?? 1, MAX_PAGE),
  }

  const providerId = positiveInt(first(sp.provider))
  if (providerId) filters.providerId = providerId

  const genreId = positiveInt(first(sp.genre))
  if (genreId) filters.genreId = genreId

  const minRating = parseMinRating(first(sp.nota))
  if (minRating) filters.minRating = minRating

  const sort = parseSortOrder(first(sp.ordem))
  if (sort) filters.sort = sort

  const q = first(sp.q)?.trim()
  if (q) filters.q = q

  return filters
}

/** Monta o texto da URL (sem o "?") a partir dos filtros. Omite vazios e a página 1. */
export function filtersToQuery(f: Omit<Filters, 'page' | 'doramas'> & { page?: number; doramas?: boolean }): string {
  const params = new URLSearchParams()
  if (f.providerId) params.set('provider', String(f.providerId))
  if (f.genreId) params.set('genre', String(f.genreId))
  if (f.minRating) params.set('nota', String(f.minRating))
  if (f.sort === 'rating') params.set('ordem', 'nota')
  if (f.doramas) params.set('doramas', '1')
  if (f.q) params.set('q', f.q)
  if (f.page && f.page > 1) params.set('page', String(f.page))
  return params.toString()
}

/**
 * Todos os filtros escolhidos, sem a página (o que as telas e os botões usam).
 * Copia o objeto inteiro: um filtro novo nunca é esquecido.
 */
export function currentFilters(f: Filters): Omit<Filters, 'page'> {
  const copy: Partial<Filters> = { ...f }
  delete copy.page
  return copy as Omit<Filters, 'page'>
}
