

vi.mock('server-only', () => ({}))

import {
  discoverMovies,
  searchMovies,
  getMovieDetails,
  getMovieProviders,
  getTopProviders,
  getGenres,
} from './movies'
import { TmdbError } from './client'

const fetchMock = vi.fn()

function mockFetchJson(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  )
}

function lastFetchUrl(): string {
  return String(fetchMock.mock.calls.at(-1)![0])
}

function lastFetchHeaders(): Record<string, string> {
  return (fetchMock.mock.calls.at(-1)![1] as RequestInit).headers as Record<string, string>
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('TMDB_READ_TOKEN', 'tok')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

test('discoverMovies envia os parâmetros fixos e junta serviços com |', async () => {
  mockFetchJson({
    page: 1,
    total_pages: 900,
    results: [{ id: 1, title: 'Duna', poster_path: '/d.jpg', release_date: '2024-02-28', vote_average: 8.2 }],
  })
  const r = await discoverMovies({ providerIds: [8, 119], genreId: 35, page: 2 })
  const url = new URL(lastFetchUrl())
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

test('discoverMovies sem gênero não envia with_genres', async () => {
  mockFetchJson({ page: 1, total_pages: 1, results: [] })
  await discoverMovies({ providerIds: [8], page: 1 })
  expect(new URL(lastFetchUrl()).searchParams.has('with_genres')).toBe(false)
})

test('release_date vazio vira releaseYear null', async () => {
  mockFetchJson({
    page: 1,
    total_pages: 1,
    results: [{ id: 2, title: 'X', poster_path: null, release_date: '', vote_average: 0 }],
  })
  const r = await discoverMovies({ providerIds: [8], page: 1 })
  expect(r.results[0].releaseYear).toBeNull()
  expect(r.results[0].posterPath).toBeNull()
})

test('searchMovies usa /search/movie com query', async () => {
  mockFetchJson({ page: 1, total_pages: 3, results: [] })
  const r = await searchMovies({ query: 'duna', page: 1 })
  const url = new URL(lastFetchUrl())
  expect(url.pathname).toBe('/3/search/movie')
  expect(url.searchParams.get('query')).toBe('duna')
  expect(url.searchParams.get('language')).toBe('pt-BR')
  expect(r).toEqual({ page: 1, totalPages: 3, results: [] })
})

test('getMovieDetails mapeia duração, gêneros e sinopse', async () => {
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
  const d = await getMovieDetails(7)
  expect(new URL(lastFetchUrl()).pathname).toBe('/3/movie/7')
  expect(d).toEqual({
    id: 7,
    title: 'Duna',
    posterPath: '/d.jpg',
    releaseYear: 2024,
    voteAverage: 8.2,
    overview: 'Paul...',
    runtime: 166,
    genres: [{ id: 878, name: 'Ficção científica' }],
  })
})

test('getMovieProviders mantém só países com flatrate', async () => {
  mockFetchJson({
    id: 7,
    results: {
      BR: { link: 'x', flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png' }] },
      US: { link: 'y', rent: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: '/a.png' }] },
    },
  })
  const r = await getMovieProviders(7)
  expect(new URL(lastFetchUrl()).pathname).toBe('/3/movie/7/watch/providers')
  expect(r).toEqual({ BR: [{ id: 8, name: 'Netflix', logoPath: '/n.png' }] })
})

test('getTopProviders ordena por display_priorities.BR e corta no limite', async () => {
  mockFetchJson({
    results: [
      { provider_id: 1, provider_name: 'C', logo_path: '/c.png', display_priorities: { BR: 30 } },
      { provider_id: 2, provider_name: 'A', logo_path: '/a.png', display_priorities: { BR: 1 } },
      { provider_id: 3, provider_name: 'B', logo_path: '/b.png', display_priorities: { BR: 5 } },
    ],
  })
  const r = await getTopProviders(2)
  const url = new URL(lastFetchUrl())
  expect(url.pathname).toBe('/3/watch/providers/movie')
  expect(url.searchParams.get('watch_region')).toBe('BR')
  expect(r).toEqual([
    { id: 2, name: 'A', logoPath: '/a.png' },
    { id: 3, name: 'B', logoPath: '/b.png' },
  ])
})

test('getGenres devolve a lista de gêneros', async () => {
  mockFetchJson({ genres: [{ id: 35, name: 'Comédia' }] })
  expect(await getGenres()).toEqual([{ id: 35, name: 'Comédia' }])
  expect(new URL(lastFetchUrl()).pathname).toBe('/3/genre/movie/list')
})

test('resposta 404 lança TmdbError com status 404', async () => {
  mockFetchJson({ status_message: 'not found' }, 404)
  const err = await getMovieDetails(999).catch((e) => e)
  expect(err).toBeInstanceOf(TmdbError)
  expect(err.status).toBe(404)
})

test('sem token lança "TMDB_READ_TOKEN não configurado"', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', '')
  await expect(getGenres()).rejects.toThrow('TMDB_READ_TOKEN não configurado')
  expect(fetchMock).not.toHaveBeenCalled()
})
