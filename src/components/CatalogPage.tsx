import { Suspense } from 'react'
import { loadCatalogPage } from '@/lib/catalog'
import { filtersToQuery, parseFilters, type Filters } from '@/lib/filters'
import { hasActiveFilters, loadHome } from '@/lib/home'
import { MEDIA, type MediaType } from '@/lib/media'
import { getGenres, getTopProviders } from '@/lib/tmdb/titles'
import { GUTTER } from '@/lib/ui'
import { CatalogSkeleton } from './CatalogSkeleton'
import { FilterBar } from './FilterBar'
import { HeroBanner } from './HeroBanner'
import { TitleGrid } from './TitleGrid'
import { TitleRow } from './TitleRow'
import { TopBar } from './TopBar'

type Props = {
  type: MediaType
  searchParams: PageProps<'/'>['searchParams']
}

type CurrentFilters = Omit<Filters, 'page'>

/**
 * A lista do catálogo, usada pela aba Filmes (/) e pela aba Séries (/series).
 * Sem filtros: banner + uma fileira por streaming. Com qualquer filtro: a grade.
 */
export function CatalogPage({ type, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <>
          <TopBar type={type} />
          <CatalogSkeleton />
        </>
      }
    >
      <Catalog type={type} searchParams={searchParams} />
    </Suspense>
  )
}

/** Lê os filtros da URL e decide entre tela inicial (fileiras) e grade. Sempre no servidor. */
async function Catalog({ type, searchParams }: Props) {
  const { providerId, genreId, minRating, q, doramas } = parseFilters(await searchParams)
  const current: CurrentFilters = { providerId, genreId, minRating, q, doramas }
  return hasActiveFilters(current) ? <Grid type={type} filters={current} /> : <Home type={type} filters={current} />
}

/** Tela inicial: banner com destaques e uma fileira por streaming. */
async function Home({ type, filters }: { type: MediaType; filters: CurrentFilters }) {
  const [providers, genres, home] = await Promise.all([getTopProviders(type), getGenres(type), loadHome(type)])
  const hasHero = home.featured.length > 0

  return (
    <>
      <TopBar type={type} overlay={hasHero} providers={providers} filters={filters} />
      <HeroBanner type={type} items={home.featured} />
      <div className="space-y-8 pt-6 pb-12">
        <div className={GUTTER}>
          <FilterBar type={type} genres={genres} filters={filters} />
        </div>
        {home.rows.length === 0 ? (
          <p className={`${GUTTER} text-suave`}>{MEDIA[type].noneFound}</p>
        ) : (
          home.rows.map((row) => <TitleRow key={row.provider.id} type={type} row={row} />)
        )}
      </div>
    </>
  )
}

/** Grade com filtros (streaming, gênero, nota, Doramas ou busca) e "Carregar mais". */
async function Grid({ type, filters }: { type: MediaType; filters: CurrentFilters }) {
  const [providers, genres] = await Promise.all([getTopProviders(type), getGenres(type)])
  const firstPage = await loadCatalogPage(
    type,
    { ...filters, page: 1 },
    providers.map((p) => p.id),
  )
  const query = filtersToQuery(filters)

  return (
    <>
      <TopBar type={type} providers={providers} filters={filters} />
      <div className={`${GUTTER} space-y-6 pt-6 pb-12`}>
        <FilterBar type={type} genres={genres} filters={filters} />
        {/* key: quando os filtros mudam, a grade recomeça da primeira página */}
        <TitleGrid key={`${type}?${query}`} type={type} initial={firstPage} query={query} />
      </div>
    </>
  )
}
