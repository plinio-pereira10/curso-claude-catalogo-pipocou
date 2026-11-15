import { tmdbFetch } from './client'
import type { Genre, MovieDetails, MoviePage, MovieSummary, Provider, ProvidersByCountry } from './types'

/** O TMDB não deixa pedir além da página 500. */
const MAX_PAGES = 500

// ---- Formato cru que o TMDB devolve ----

type RawMovie = {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
  vote_average: number
}

type RawPage = {
  page: number
  total_pages: number
  results: RawMovie[]
}

type RawProvider = {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priorities?: Record<string, number>
}

// ---- Conversões para o nosso formato ----

function toMovieSummary(raw: RawMovie): MovieSummary {
  const year = raw.release_date ? Number.parseInt(raw.release_date.slice(0, 4), 10) : NaN
  return {
    id: raw.id,
    title: raw.title,
    posterPath: raw.poster_path,
    releaseYear: Number.isNaN(year) ? null : year,
    voteAverage: raw.vote_average,
  }
}

function toMoviePage(raw: RawPage): MoviePage {
  return {
    page: raw.page,
    totalPages: Math.min(raw.total_pages, MAX_PAGES),
    results: raw.results.map(toMovieSummary),
  }
}

function toProvider(raw: RawProvider): Provider {
  return { id: raw.provider_id, name: raw.provider_name, logoPath: raw.logo_path }
}

// ---- Funções usadas pelo site ----

/** Filmes disponíveis por assinatura no Brasil, nos serviços informados (OU). */
export async function discoverMovies(opts: {
  providerIds: number[]
  genreId?: number
  page: number
}): Promise<MoviePage> {
  const raw = await tmdbFetch<RawPage>('/discover/movie', {
    watch_region: 'BR',
    with_watch_monetization_types: 'flatrate',
    with_watch_providers: opts.providerIds.join('|'),
    with_genres: opts.genreId,
    sort_by: 'popularity.desc',
    page: opts.page,
  })
  return toMoviePage(raw)
}

/** Busca por nome (não filtra por streaming — limitação do TMDB). */
export async function searchMovies(opts: { query: string; page: number }): Promise<MoviePage> {
  const raw = await tmdbFetch<RawPage>('/search/movie', { query: opts.query, page: opts.page })
  return toMoviePage(raw)
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const raw = await tmdbFetch<RawMovie & { overview: string; runtime: number | null; genres: Genre[] }>(
    `/movie/${id}`,
  )
  return {
    ...toMovieSummary(raw),
    overview: raw.overview,
    runtime: raw.runtime,
    genres: raw.genres,
  }
}

/** Onde o filme está por assinatura, em cada país. Países sem assinatura ficam de fora. */
export async function getMovieProviders(id: number): Promise<ProvidersByCountry> {
  const raw = await tmdbFetch<{ results: Record<string, { flatrate?: RawProvider[] }> }>(
    `/movie/${id}/watch/providers`,
  )
  const byCountry: ProvidersByCountry = {}
  for (const [country, info] of Object.entries(raw.results)) {
    if (info.flatrate && info.flatrate.length > 0) {
      byCountry[country] = info.flatrate.map(toProvider)
    }
  }
  return byCountry
}

/** Os serviços mais importantes no Brasil, segundo a ordem do próprio TMDB. */
export async function getTopProviders(limit = 8): Promise<Provider[]> {
  const raw = await tmdbFetch<{ results: RawProvider[] }>('/watch/providers/movie', { watch_region: 'BR' })
  const priority = (p: RawProvider) => p.display_priorities?.BR ?? Number.MAX_SAFE_INTEGER
  return [...raw.results]
    .sort((a, b) => priority(a) - priority(b))
    .slice(0, limit)
    .map(toProvider)
}

export async function getGenres(): Promise<Genre[]> {
  const raw = await tmdbFetch<{ genres: Genre[] }>('/genre/movie/list')
  return raw.genres
}
