import { Suspense } from 'react'
import { loadCatalogPage } from '@/lib/catalog'
import { visibleGenres } from '@/lib/doramas'
import { filtersToQuery, parseFilters } from '@/lib/filters'
import { MEDIA, type MediaType } from '@/lib/media'
import { getGenres, getTopProviders } from '@/lib/tmdb/titles'
import { DoramasToggle } from './DoramasToggle'
import { GenreSelect } from './GenreSelect'
import { RatingSelect } from './RatingSelect'
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

  const searching = Boolean(q)
  const current = { providerId, genreId, minRating, q, doramas }
  const query = filtersToQuery(current)

  return (
    <>
      <TopBar type={type} providers={providers} filters={current} />
      <div className={`${GUTTER} space-y-6 py-6`}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <GenreSelect
            type={type}
            genres={visibleGenres(allGenres, type, doramas)}
            filters={current}
            disabled={searching}
          />
          <RatingSelect type={type} filters={current} disabled={searching} />
          <DoramasToggle type={type} filters={current} disabled={searching} />
        </div>
        {searching && <p className="text-sm text-zinc-400">{MEDIA[type].searchNote}</p>}
      </div>

      {/* key: quando os filtros mudam, a grade recomeça da primeira página */}
      <TitleGrid key={`${type}?${query}`} type={type} initial={firstPage} query={query} />
      </div>
    </>
  )
}
