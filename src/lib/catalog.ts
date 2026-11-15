import { effectiveGenreId } from './doramas'
import type { Filters } from './filters'
import type { MediaType } from './media'
import { discoverTitles, searchTitles } from './tmdb/titles'
import type { TitlePage } from './tmdb/types'

/**
 * Busca uma página da lista (filmes ou séries) conforme os filtros.
 * - Com texto de busca: procura pelo nome (o TMDB não combina busca com streaming nem Doramas).
 * - Sem busca: títulos por assinatura no Brasil, no serviço escolhido ou em todos os dos botões.
 *   Com Doramas ligado, um gênero excluído (ex.: Animação) é ignorado.
 */
export function loadCatalogPage(type: MediaType, filters: Filters, allProviderIds: number[]): Promise<TitlePage> {
  if (filters.q) {
    return searchTitles(type, { query: filters.q, page: filters.page })
  }
  return discoverTitles(type, {
    providerIds: filters.providerId ? [filters.providerId] : allProviderIds,
    genreId: effectiveGenreId(type, filters.genreId, filters.doramas),
    doramas: filters.doramas,
    minRating: filters.minRating,
    page: filters.page,
  })
}
