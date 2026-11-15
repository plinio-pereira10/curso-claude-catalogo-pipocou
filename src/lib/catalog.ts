import type { Filters } from './filters'
import { discoverTitles, searchTitles } from './tmdb/titles'
import type { TitlePage } from './tmdb/types'

/**
 * Busca uma página da lista conforme os filtros.
 * - Com texto de busca: procura pelo nome (o TMDB não combina busca com streaming).
 * - Sem busca: títulos por assinatura no Brasil, no serviço escolhido ou em todos os dos botões.
 */
export function loadCatalogPage(filters: Filters, allProviderIds: number[]): Promise<TitlePage> {
  if (filters.q) {
    return searchTitles('movie', { query: filters.q, page: filters.page })
  }
  return discoverTitles('movie', {
    providerIds: filters.providerId ? [filters.providerId] : allProviderIds,
    genreId: filters.genreId,
    doramas: filters.doramas,
    page: filters.page,
  })
}
