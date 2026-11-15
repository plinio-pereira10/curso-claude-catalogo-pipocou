import { Suspense } from 'react'
import { parseFilters } from '@/lib/filters'
import { discoverMovies, getGenres, getTopProviders, searchMovies } from '@/lib/tmdb/movies'
import { GenreSelect } from '@/components/GenreSelect'
import { MovieCard } from '@/components/MovieCard'
import { ProviderFilter } from '@/components/ProviderFilter'
import { SearchBox } from '@/components/SearchBox'

export default function Home({ searchParams }: PageProps<'/'>) {
  return (
    <Suspense fallback={<p className="text-zinc-400">Carregando filmes…</p>}>
      <Catalog searchParams={searchParams} />
    </Suspense>
  )
}

/** Lê os filtros da URL e busca os filmes no TMDB (sempre no servidor). */
async function Catalog({ searchParams }: Pick<PageProps<'/'>, 'searchParams'>) {
  const { providerId, genreId, q } = parseFilters(await searchParams)
  const [providers, genres] = await Promise.all([getTopProviders(), getGenres()])

  const firstPage = q
    ? await searchMovies({ query: q, page: 1 })
    : await discoverMovies({
        providerIds: providerId ? [providerId] : providers.map((p) => p.id),
        genreId,
        page: 1,
      })

  const searching = Boolean(q)

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

      {firstPage.results.length === 0 ? (
        <p className="text-zinc-400">Nenhum filme encontrado.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {firstPage.results.map((movie) => (
            <li key={movie.id}>
              <MovieCard movie={movie} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
