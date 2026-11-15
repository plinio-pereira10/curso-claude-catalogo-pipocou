vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ cacheLife: vi.fn() }))

import {
  discoverTitles,
  searchTitles,
  getTitleDetails,
  getWatchProviders,
  getTopProviders,
  getGenres,
} from './titles'
import { TmdbError } from './client'
import { cacheLife } from 'next/cache'

const fetchMock = vi.fn()

function mockFetchJson(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  )
}

function lastFetchUrl(): URL {
  return new URL(String(fetchMock.mock.calls.at(-1)![0]))
}

function lastFetchHeaders(): Record<string, string> {
  return (fetchMock.mock.calls.at(-1)![1] as RequestInit).headers as Record<string, string>
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.mocked(cacheLife).mockClear()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('TMDB_READ_TOKEN', 'tok')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

// ---- Filmes (comportamento que já existia) ----

test('discoverTitles de filmes envia os parâmetros fixos e junta serviços com |', async () => {
  mockFetchJson({
    page: 1,
    total_pages: 900,
    results: [{ id: 1, title: 'Duna', poster_path: '/d.jpg', release_date: '2024-02-28', vote_average: 8.2 }],
  })
  const r = await discoverTitles('movie', { providerIds: [8, 119], genreId: 35, doramas: false, page: 2 })
  const url = lastFetchUrl()
  expect(url.pathname).toBe('/3/discover/movie')
  expect(url.searchParams.get('watch_region')).toBe('BR')
  expect(url.searchParams.get('with_watch_monetization_types')).toBe('flatrate')
  expect(url.searchParams.get('with_watch_providers')).toBe('8|119')
  expect(url.searchParams.get('with_genres')).toBe('35')
  expect(url.searchParams.get('sort_by')).toBe('popularity.desc')
  expect(url.searchParams.get('language')).toBe('pt-BR')
  expect(url.searchParams.get('page')).toBe('2')
  expect(lastFetchHeaders().Authorization).toBe('Bearer tok')
  expect(r).toEqual({
    page: 1,
    totalPages: 500,
    results: [{ id: 1, title: 'Duna', posterPath: '/d.jpg', releaseYear: 2024, voteAverage: 8.2 }],
  })
})

test('sem gênero não envia with_genres', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('movie', { providerIds: [8], doramas: false, page: 1 })
  expect(lastFetchUrl().searchParams.has('with_genres')).toBe(false)
})

test('release_date vazio vira releaseYear null', async () => {
  mockFetchJson({
    page: 1,
    total_pages: 1,
    results: [{ id: 2, title: 'X', poster_path: null, release_date: '', vote_average: 0 }],
  })
  const r = await discoverTitles('movie', { providerIds: [8], doramas: false, page: 1 })
  expect(r.results[0].releaseYear).toBeNull()
  expect(r.results[0].posterPath).toBeNull()
})

test('searchTitles de filmes usa /search/movie com query', async () => {
  mockFetchJson({ page: 1, total_pages: 3, results: [] })
  const r = await searchTitles('movie', { query: 'duna', page: 1 })
  const url = lastFetchUrl()
  expect(url.pathname).toBe('/3/search/movie')
  expect(url.searchParams.get('query')).toBe('duna')
  expect(url.searchParams.get('language')).toBe('pt-BR')
  expect(r).toEqual({ page: 1, totalPages: 3, results: [] })
})

test('getTitleDetails de filme mapeia duração, gêneros, sinopse e seasons null', async () => {
  mockFetchJson({
    id: 7,
    title: 'Duna',
    poster_path: '/d.jpg',
    release_date: '2024-02-28',
    vote_average: 8.2,
    overview: 'Paul...',
    runtime: 166,
    genres: [{ id: 878, name: 'Ficção científica' }],
  })
  const d = await getTitleDetails('movie', 7)
  expect(lastFetchUrl().pathname).toBe('/3/movie/7')
  expect(d).toEqual({
    id: 7,
    title: 'Duna',
    posterPath: '/d.jpg',
    releaseYear: 2024,
    voteAverage: 8.2,
    overview: 'Paul...',
    runtime: 166,
    seasons: null,
    genres: [{ id: 878, name: 'Ficção científica' }],
  })
})

test('getWatchProviders mantém só países com assinatura', async () => {
  mockFetchJson({
    id: 7,
    results: {
      BR: { link: 'https://tmdb/br', flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png' }] },
      US: { link: 'https://tmdb/us', rent: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: '/a.png' }] },
    },
  })
  const r = await getWatchProviders('movie', 7)
  expect(lastFetchUrl().pathname).toBe('/3/movie/7/watch/providers')
  expect(r).toEqual({
    byCountry: { BR: [{ id: 8, name: 'Netflix', logoPath: '/n.png' }] },
    brazilLink: 'https://tmdb/br',
  })
})

test('getWatchProviders sem assinatura no Brasil devolve brazilLink null', async () => {
  mockFetchJson({
    id: 7,
    results: {
      BR: { link: 'https://tmdb/br', rent: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: '/a.png' }] },
      PT: { link: 'https://tmdb/pt', flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png' }] },
    },
  })
  const r = await getWatchProviders('movie', 7)
  expect(r.brazilLink).toBeNull()
  expect(Object.keys(r.byCountry)).toEqual(['PT'])
})

test('getTopProviders ordena por display_priorities.BR e corta no limite', async () => {
  mockFetchJson({
    results: [
      { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/d.png', display_priorities: { BR: 30 } },
      { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png', display_priorities: { BR: 1 } },
      { provider_id: 119, provider_name: 'Prime Video', logo_path: '/p.png', display_priorities: { BR: 5 } },
    ],
  })
  const r = await getTopProviders('movie', 2)
  const url = lastFetchUrl()
  expect(url.pathname).toBe('/3/watch/providers/movie')
  expect(url.searchParams.get('watch_region')).toBe('BR')
  expect(r).toEqual([
    { id: 8, name: 'Netflix', logoPath: '/n.png' },
    { id: 119, name: 'Prime Video', logoPath: '/p.png' },
  ])
})

test('getTopProviders deixa de fora lojas de aluguel/compra', async () => {
  mockFetchJson({
    results: [
      { provider_id: 2, provider_name: 'Apple TV', logo_path: '/a.png', display_priorities: { BR: 0 } },
      { provider_id: 3, provider_name: 'Google Play Movies', logo_path: '/g.png', display_priorities: { BR: 1 } },
      { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png', display_priorities: { BR: 2 } },
    ],
  })
  expect(await getTopProviders('movie')).toEqual([{ id: 8, name: 'Netflix', logoPath: '/n.png' }])
})

test('getGenres de filmes devolve a lista de gêneros', async () => {
  mockFetchJson({ genres: [{ id: 35, name: 'Comédia' }] })
  expect(await getGenres('movie')).toEqual([{ id: 35, name: 'Comédia' }])
  expect(lastFetchUrl().pathname).toBe('/3/genre/movie/list')
})

test('resposta 404 lança TmdbError com status 404', async () => {
  mockFetchJson({ status_message: 'not found' }, 404)
  const err = await getTitleDetails('movie', 999).catch((e) => e)
  expect(err).toBeInstanceOf(TmdbError)
  expect(err.status).toBe(404)
})

test('sem token lança "TMDB_READ_TOKEN não configurado"', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', '')
  await expect(getGenres('movie')).rejects.toThrow('TMDB_READ_TOKEN não configurado')
  expect(fetchMock).not.toHaveBeenCalled()
})

// ---- Séries ----

test('discoverTitles de séries usa /discover/tv com as regras fixas', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], doramas: false, page: 1 })
  const url = lastFetchUrl()
  expect(url.pathname).toBe('/3/discover/tv')
  expect(url.searchParams.get('watch_region')).toBe('BR')
  expect(url.searchParams.get('with_watch_monetization_types')).toBe('flatrate')
  expect(url.searchParams.get('sort_by')).toBe('popularity.desc')
})

test('séries usam name e first_air_date', async () => {
  mockFetchJson({
    page: 1,
    total_pages: 1,
    results: [{ id: 5, name: 'Pousando no Amor', poster_path: '/p.jpg', first_air_date: '2019-12-14', vote_average: 8.7 }],
  })
  const r = await discoverTitles('tv', { providerIds: [8], doramas: false, page: 1 })
  expect(r.results[0]).toEqual({ id: 5, title: 'Pousando no Amor', posterPath: '/p.jpg', releaseYear: 2019, voteAverage: 8.7 })
})

test('Doramas em séries envia países e exclui animação/reality/talk/news', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], doramas: true, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.get('with_origin_country')).toBe('KR|JP|CN|TW|TH')
  expect(url.searchParams.get('without_genres')).toBe('16,10764,10767,10763')
})

test('Doramas em filmes exclui só animação', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('movie', { providerIds: [8], doramas: true, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.get('with_origin_country')).toBe('KR|JP|CN|TW|TH')
  expect(url.searchParams.get('without_genres')).toBe('16')
})

test('sem Doramas não envia país nem without_genres', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], doramas: false, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.has('with_origin_country')).toBe(false)
  expect(url.searchParams.has('without_genres')).toBe(false)
})

test('searchTitles de séries usa /search/tv', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await searchTitles('tv', { query: 'pousando', page: 1 })
  expect(lastFetchUrl().pathname).toBe('/3/search/tv')
})

test('getTitleDetails de série mapeia temporadas e runtime null', async () => {
  mockFetchJson({
    id: 5,
    name: 'Pousando no Amor',
    poster_path: '/p.jpg',
    first_air_date: '2019-12-14',
    vote_average: 8.7,
    overview: 'Uma herdeira...',
    number_of_seasons: 1,
    episode_run_time: [70],
    genres: [{ id: 18, name: 'Drama' }],
  })
  const d = await getTitleDetails('tv', 5)
  expect(lastFetchUrl().pathname).toBe('/3/tv/5')
  expect(d).toEqual({
    id: 5,
    title: 'Pousando no Amor',
    posterPath: '/p.jpg',
    releaseYear: 2019,
    voteAverage: 8.7,
    overview: 'Uma herdeira...',
    runtime: null,
    seasons: 1,
    genres: [{ id: 18, name: 'Drama' }],
  })
})

test('série sem data e sem temporadas', async () => {
  mockFetchJson({ id: 6, name: 'Nova', poster_path: null, first_air_date: '', vote_average: 0, overview: '', genres: [] })
  const d = await getTitleDetails('tv', 6)
  expect(d.releaseYear).toBeNull()
  expect(d.seasons).toBeNull()
})

test('getWatchProviders de séries usa /tv/{id}/watch/providers', async () => {
  mockFetchJson({ id: 5, results: {} })
  expect(await getWatchProviders('tv', 5)).toEqual({ byCountry: {}, brazilLink: null })
  expect(lastFetchUrl().pathname).toBe('/3/tv/5/watch/providers')
})

test('getTopProviders e getGenres de séries usam os endpoints de tv', async () => {
  mockFetchJson({ results: [] })
  await getTopProviders('tv')
  expect(lastFetchUrl().pathname).toBe('/3/watch/providers/tv')
  mockFetchJson({ genres: [] })
  await getGenres('tv')
  expect(lastFetchUrl().pathname).toBe('/3/genre/tv/list')
})

// ---- Romance para séries (palavra-chave) ----

test('Romance em séries usa a palavra-chave 9840', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], genreId: 10749, doramas: true, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.get('with_keywords')).toBe('9840')
  expect(url.searchParams.has('with_genres')).toBe(false)
  expect(url.searchParams.get('with_origin_country')).toBe('KR|JP|CN|TW|TH')
  expect(url.searchParams.get('with_watch_providers')).toBe('8')
})

test('Romance em filmes continua usando o gênero', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('movie', { providerIds: [8], genreId: 10749, doramas: false, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.get('with_genres')).toBe('10749')
  expect(url.searchParams.has('with_keywords')).toBe(false)
})

test('outros gêneros de séries não usam palavra-chave', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], genreId: 18, doramas: false, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.get('with_genres')).toBe('18')
  expect(url.searchParams.has('with_keywords')).toBe(false)
})

test('getGenres de séries inclui Romance em ordem alfabética', async () => {
  mockFetchJson({
    genres: [
      { id: 35, name: 'Comédia' },
      { id: 9648, name: 'Mistério' },
      { id: 10766, name: 'Soap' },
    ],
  })
  expect((await getGenres('tv')).map((g) => g.name)).toEqual(['Comédia', 'Mistério', 'Romance', 'Soap'])
})

test('getGenres de filmes não acrescenta nada', async () => {
  mockFetchJson({ genres: [{ id: 10749, name: 'Romance' }] })
  expect(await getGenres('movie')).toEqual([{ id: 10749, name: 'Romance' }])
})

// ---- Listas guardadas por 1 hora ----

test('listas de streamings e gêneros são guardadas por "hours"', async () => {
  mockFetchJson({ results: [] })
  await getTopProviders('tv')
  mockFetchJson({ genres: [] })
  await getGenres('tv')
  expect(cacheLife).toHaveBeenCalledTimes(2)
  expect(cacheLife).toHaveBeenNthCalledWith(1, 'hours')
  expect(cacheLife).toHaveBeenNthCalledWith(2, 'hours')
})

test('discoverTitles não usa cache', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], doramas: false, page: 1 })
  expect(cacheLife).not.toHaveBeenCalled()
})

// ---- Nota mínima ----

test('nota mínima envia vote_average.gte e vote_count.gte=15', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('tv', { providerIds: [8], doramas: true, minRating: 8, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.get('vote_average.gte')).toBe('8')
  expect(url.searchParams.get('vote_count.gte')).toBe('15')
  expect(url.searchParams.get('sort_by')).toBe('popularity.desc')
})

test('sem nota não envia vote_average.gte nem vote_count.gte', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverTitles('movie', { providerIds: [8], doramas: false, page: 1 })
  const url = lastFetchUrl()
  expect(url.searchParams.has('vote_average.gte')).toBe(false)
  expect(url.searchParams.has('vote_count.gte')).toBe(false)
})
