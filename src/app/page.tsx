import { Suspense } from 'react'
import { loadCatalogPage } from '@/lib/catalog'
import { filtersToQuery, parseFilters } from '@/lib/filters'
import { getGenres, getTopProviders } from '@/lib/tmdb/titles'
import { GenreSelect } from '@/components/GenreSelect'
import { MovieGrid } from '@/components/MovieGrid'
import { ProviderFilter } from '@/components/ProviderFilter'
import { SearchBox } from '@/components/SearchBox'

export default function Home({ searchParams }: PageProps<'/'>) {
  return (
    <Suspense fallback={<p className="text-zinc-400">Carregando filmes…</p>}>
      <Catalog searchParams={searchParams} />
    </Suspense>
  )
}

/** Lê os filtros da URL e busca a primeira página no TMDB (sempre no servidor). */
async function Catalog({ searchParams }: Pick<PageProps<'/'>, 'searchParams'>) {
  const filters = { ...parseFilters(await searchParams), page: 1 }
  const { providerId, genreId, q } = filters
  const [providers, genres] = await Promise.all([getTopProviders('movie'), getGenres('movie')])
  const firstPage = await loadCatalogPage(
    filters,
    providers.map((p) => p.id),
  )

  const searching = Boolean(q)
  const query = filtersToQuery({ providerId, genreId, q })

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SearchBox key={q ?? ''} initialQuery={q} />
        <ProviderFilter providers={providers} selectedId={providerId} genreId={genreId} disabled={searching} />
        <GenreSelect genres={genres} selectedId={genreId} providerId={providerId} disabled={searching} />
        {searching && (
          <p className="text-sm text-zinc-400">
            A busca mostra todos os filmes. A disponibilidade aparece na página de cada filme.
          </p>
        )}
      </div>

      {/* key: quando os filtros mudam, a grade recomeça da primeira página */}
      <MovieGrid key={query} initial={firstPage} query={query} />
    </div>
  )
}
