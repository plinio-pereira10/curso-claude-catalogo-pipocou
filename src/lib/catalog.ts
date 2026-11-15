import type { Filters } from './filters'
import { discoverMovies, searchMovies } from './tmdb/movies'
import type { MoviePage } from './tmdb/types'

/**
 * Busca uma página da lista conforme os filtros.
 * - Com texto de busca: procura pelo nome (o TMDB não combina busca com streaming).
 * - Sem busca: filmes por assinatura no Brasil, no serviço escolhido ou em todos os dos botões.
 */
export function loadCatalogPage(filters: Filters, allProviderIds: number[]): Promise<MoviePage> {
  if (filters.q) {
    return searchMovies({ query: filters.q, page: filters.page })
  }
  return discoverMovies({
    providerIds: filters.providerId ? [filters.providerId] : allProviderIds,
    genreId: filters.genreId,
    page: filters.page,
  })
}
