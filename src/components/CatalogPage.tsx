import { Suspense } from 'react'
import { loadCatalogPage } from '@/lib/catalog'
import { filtersToQuery, parseFilters } from '@/lib/filters'
import type { MediaType } from '@/lib/media'
import { getGenres, getTopProviders } from '@/lib/tmdb/titles'
import { FilterBar } from './FilterBar'
import { TitleGrid } from './TitleGrid'
import { TopBar } from './TopBar'
import { GUTTER } from '@/lib/ui'

type Props = {
  type: MediaType
  searchParams: PageProps<'/'>['searchParams']
}

/** A lista do catálogo, usada pela aba Filmes (/) e pela aba Séries (/series). */
export function CatalogPage({ type, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <>
          <TopBar type={type} />
          <p className={`${GUTTER} py-6 text-suave`}>Carregando…</p>
        </>
      }
    >
      <Catalog type={type} searchParams={searchParams} />
    </Suspense>
  )
}

/** Lê os filtros da URL e busca a primeira página no TMDB (sempre no servidor). */
async function Catalog({ type, searchParams }: Props) {
  const filters = { ...parseFilters(await searchParams), page: 1 }
  const { providerId, genreId, minRating, q, doramas } = filters
  const [providers, allGenres] = await Promise.all([getTopProviders(type), getGenres(type)])
  const firstPage = await loadCatalogPage(
    type,
    filters,
    providers.map((p) => p.id),
  )

  const current = { providerId, genreId, minRating, q, doramas }
  const query = filtersToQuery(current)

  return (
    <>
      <TopBar type={type} providers={providers} filters={current} />
      <div className={`${GUTTER} space-y-6 py-6`}>
      <FilterBar type={type} genres={allGenres} filters={current} />

      {/* key: quando os filtros mudam, a grade recomeça da primeira página */}
      <TitleGrid key={`${type}?${query}`} type={type} initial={firstPage} query={query} />
      </div>
    </>
  )
}
