import { cacheLife } from 'next/cache'
import { tmdbFetch } from './client'
import { DORAMA_COUNTRIES, doramaExcludedGenres } from '../doramas'
import type { MediaType } from '../media'
import { MIN_VOTE_COUNT, SORT_MIN_VOTE_COUNT, type MinRating } from '../rating'
import type { Genre, Provider, TitleDetails, TitlePage, TitleSummary, WatchProviders } from './types'

/** O TMDB não deixa pedir além da página 500. */
const MAX_PAGES = 500

// ---- Formato cru que o TMDB devolve ----
// Filmes usam `title` e `release_date`; séries usam `name` e `first_air_date`.

type RawTitle = {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path?: string | null
  overview?: string
  release_date?: string
  first_air_date?: string
  vote_average: number
}

type RawPage = {
  page: number
  total_pages: number
  results: RawTitle[]
}

type RawProvider = {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priorities?: Record<string, number>
}

// ---- Conversões para o nosso formato ----

function toTitleSummary(raw: RawTitle): TitleSummary {
  const date = raw.release_date || raw.first_air_date
  const year = date ? Number.parseInt(date.slice(0, 4), 10) : NaN
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? '',
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path ?? null,
    releaseYear: Number.isNaN(year) ? null : year,
    voteAverage: raw.vote_average,
    overview: raw.overview ?? '',
  }
}

function toTitlePage(raw: RawPage): TitlePage {
  return {
    page: raw.page,
    totalPages: Math.min(raw.total_pages, MAX_PAGES),
    results: raw.results.map(toTitleSummary),
  }
}

function toProvider(raw: RawProvider): Provider {
  return { id: raw.provider_id, name: raw.provider_name, logoPath: raw.logo_path }
}

// ---- Romance para séries ----
// O TMDB não tem gênero Romance para séries. Por isso, na aba Séries a opção "Romance"
// (mesmo número do Romance de filmes) busca pela palavra-chave "romance" do TMDB.

export const ROMANCE_GENRE_ID = 10749
export const ROMANCE_KEYWORD_ID = 9840

/** Para séries, "Romance" vira palavra-chave; o resto continua como gênero. */
function genreParams(type: MediaType, genreId: number | undefined) {
  if (type === 'tv' && genreId === ROMANCE_GENRE_ID) {
    return { with_genres: undefined, with_keywords: ROMANCE_KEYWORD_ID }
  }
  return { with_genres: genreId, with_keywords: undefined }
}

/**
 * Mínimo de votos para o pedido: 15 com nota escolhida, 50 na ordem por nota (vale o maior).
 * Sem nota nem ordem por nota, nenhum mínimo.
 */
function minVotes(opts: { minRating?: MinRating; sortByRating?: boolean }): number | undefined {
  if (opts.sortByRating) return Math.max(SORT_MIN_VOTE_COUNT, opts.minRating ? MIN_VOTE_COUNT : 0)
  return opts.minRating ? MIN_VOTE_COUNT : undefined
}

// ---- Funções usadas pelo site ----

/**
 * Filmes ou séries disponíveis por assinatura no Brasil, nos serviços informados (OU).
 * Com `minRating`, só títulos com essa nota ou mais (e votos suficientes).
 * Com `doramas`, só títulos da Coreia do Sul, Japão, China, Taiwan e Tailândia,
 * sem animação (e, nas séries, sem reality, auditório e jornalismo).
 */
export async function discoverTitles(
  type: MediaType,
  opts: {
    providerIds: number[]
    genreId?: number
    doramas: boolean
    minRating?: MinRating
    /** Ordem "Mais bem avaliados" (senão, por popularidade). */
    sortByRating?: boolean
    page: number
  },
): Promise<TitlePage> {
  const raw = await tmdbFetch<RawPage>(`/discover/${type}`, {
    watch_region: 'BR',
    with_watch_monetization_types: 'flatrate',
    with_watch_providers: opts.providerIds.join('|'),
    ...genreParams(type, opts.genreId),
    with_origin_country: opts.doramas ? DORAMA_COUNTRIES.join('|') : undefined,
    without_genres: opts.doramas ? doramaExcludedGenres(type).join(',') : undefined,
    // nota mínima: só títulos com essa nota e com votos suficientes para ela ser confiável
    'vote_average.gte': opts.minRating,
    'vote_count.gte': minVotes(opts),
    sort_by: opts.sortByRating ? 'vote_average.desc' : 'popularity.desc',
    page: opts.page,
  })
  return toTitlePage(raw)
}

/**
 * Uma fileira da tela inicial: os títulos mais populares de um streaming (página 1).
 * Guardada por 1 hora no servidor ('hours'), para a tela inicial não buscar tudo a cada visita.
 */
export async function getProviderRow(type: MediaType, providerId: number): Promise<TitleSummary[]> {
  'use cache'
  cacheLife('hours')
  const page = await discoverTitles(type, { providerIds: [providerId], doramas: false, page: 1 })
  return page.results
}

/**
 * A arte com o nome do título (logo), usada no banner. Prefere português do Brasil, depois
 * qualquer português (ex.: Portugal, onde o nome pode ser outro), depois inglês, depois sem
 * idioma. Sem logo → null. Guardada por 1 hora no servidor ('hours').
 */
export async function getTitleLogo(type: MediaType, id: number): Promise<string | null> {
  'use cache'
  cacheLife('hours')
  const raw = await tmdbFetch<{
    logos: { file_path: string; iso_639_1: string | null; iso_3166_1?: string | null }[]
  }>(`/${type}/${id}/images`, {
    include_image_language: 'pt,en,null',
  })
  const byLanguage = (lang: string | null) => raw.logos.find((l) => l.iso_639_1 === lang)
  const brazilian = raw.logos.find((l) => l.iso_639_1 === 'pt' && l.iso_3166_1 === 'BR')
  const logo = brazilian ?? byLanguage('pt') ?? byLanguage('en') ?? byLanguage(null)
  return logo?.file_path ?? null
}

/** Busca por nome (não filtra por streaming — limitação do TMDB). */
export async function searchTitles(type: MediaType, opts: { query: string; page: number }): Promise<TitlePage> {
  const raw = await tmdbFetch<RawPage>(`/search/${type}`, { query: opts.query, page: opts.page })
  return toTitlePage(raw)
}

export async function getTitleDetails(type: MediaType, id: number): Promise<TitleDetails> {
  const raw = await tmdbFetch<
    RawTitle & { runtime?: number | null; number_of_seasons?: number | null; vote_count?: number; genres: Genre[] }
  >(`/${type}/${id}`)
  return {
    ...toTitleSummary(raw),
    runtime: type === 'movie' ? (raw.runtime ?? null) : null,
    seasons: type === 'tv' ? (raw.number_of_seasons ?? null) : null,
    voteCount: raw.vote_count ?? 0,
    genres: raw.genres,
  }
}

/** Onde o título está por assinatura, em cada país, e o link do TMDB para o Brasil. */
export async function getWatchProviders(type: MediaType, id: number): Promise<WatchProviders> {
  const raw = await tmdbFetch<{ results: Record<string, { link?: string; flatrate?: RawProvider[] }> }>(
    `/${type}/${id}/watch/providers`,
  )
  const byCountry: WatchProviders['byCountry'] = {}
  for (const [country, info] of Object.entries(raw.results)) {
    if (info.flatrate && info.flatrate.length > 0) {
      byCountry[country] = info.flatrate.map(toProvider)
    }
  }
  const brazilLink = byCountry.BR ? (raw.results.BR?.link ?? null) : null
  return { byCountry, brazilLink }
}

/**
 * Serviços de ASSINATURA que viram botões. O TMDB também lista lojas de aluguel/compra
 * (Apple TV, Google Play...), que nunca teriam títulos "inclusos na assinatura".
 * Para incluir outro serviço, adicione o ID dele aqui.
 */
export const SUBSCRIPTION_PROVIDER_IDS = [
  8, // Netflix
  119, // Prime Video
  337, // Disney+
  1899, // Max
  307, // Globoplay
  350, // Apple TV+
  531, // Paramount+
  11, // MUBI
]

/**
 * Os serviços de assinatura mais importantes no Brasil, na ordem do próprio TMDB.
 * Guardada por 1 hora no servidor ('hours'): a lista quase nunca muda.
 */
export async function getTopProviders(type: MediaType, limit = 8): Promise<Provider[]> {
  'use cache'
  cacheLife('hours')
  const raw = await tmdbFetch<{ results: RawProvider[] }>(`/watch/providers/${type}`, { watch_region: 'BR' })
  const priority = (p: RawProvider) => p.display_priorities?.BR ?? Number.MAX_SAFE_INTEGER
  return raw.results
    .filter((p) => SUBSCRIPTION_PROVIDER_IDS.includes(p.provider_id))
    .sort((a, b) => priority(a) - priority(b))
    .slice(0, limit)
    .map(toProvider)
}

/** Lista de gêneros. Guardada por 1 hora no servidor ('hours'): quase nunca muda. */
export async function getGenres(type: MediaType): Promise<Genre[]> {
  'use cache'
  cacheLife('hours')
  const raw = await tmdbFetch<{ genres: Genre[] }>(`/genre/${type}/list`)
  if (type === 'movie') return raw.genres
  // Séries: acrescenta "Romance" (por palavra-chave), em ordem alfabética.
  return [...raw.genres, { id: ROMANCE_GENRE_ID, name: 'Romance' }].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR'),
  )
}
