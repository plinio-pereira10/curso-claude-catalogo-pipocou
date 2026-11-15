import { filtersToQuery, type Filters } from './filters'

/** O que o catálogo mostra: filmes ("movie") ou séries ("tv"), como o TMDB chama. */
export type MediaType = 'movie' | 'tv'

/** Tudo o que muda entre filmes e séries: endereços e textos. */
export const MEDIA: Record<
  MediaType,
  { label: string; listPath: string; detailPrefix: string; noneFound: string; notFound: string; searchNote: string }
> = {
  movie: {
    label: 'Filmes',
    listPath: '/',
    detailPrefix: '/filme',
    noneFound: 'Nenhum filme encontrado.',
    notFound: 'Filme não encontrado.',
    searchNote: 'A busca mostra todos os filmes. A disponibilidade aparece na página de cada filme.',
  },
  tv: {
    label: 'Séries',
    listPath: '/series',
    detailPrefix: '/serie',
    noneFound: 'Nenhuma série encontrada.',
    notFound: 'Série não encontrada.',
    searchNote: 'A busca mostra todas as séries. A disponibilidade aparece na página de cada série.',
  },
}

/** "tv" vira série; qualquer outra coisa vira filme (nunca dá erro). */
export function parseMediaType(raw: string | null | undefined): MediaType {
  return raw === 'tv' ? 'tv' : 'movie'
}

/** Endereço da página de detalhes (ex.: /filme/7, /serie/9). */
export function detailPath(type: MediaType, id: number): string {
  return `${MEDIA[type].detailPrefix}/${id}`
}

type ListFilters = Omit<Filters, 'page' | 'doramas'> & { page?: number; doramas?: boolean }

/** Endereço da lista com os filtros (ex.: /series?provider=8&doramas=1). */
export function listHref(type: MediaType, filters: ListFilters): string {
  const query = filtersToQuery(filters)
  return query ? `${MEDIA[type].listPath}?${query}` : MEDIA[type].listPath
}

/** Link da aba: mantém streaming, nota e Doramas; limpa gênero, busca e página. */
export function switchTabHref(target: MediaType, current: Pick<ListFilters, 'providerId' | 'minRating' | 'doramas'>): string {
  return listHref(target, { providerId: current.providerId, minRating: current.minRating, doramas: current.doramas })
}
