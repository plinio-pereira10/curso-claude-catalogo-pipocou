vi.mock('server-only', () => ({}))
vi.mock('./tmdb/movies', () => ({
  discoverMovies: vi.fn(async () => ({ page: 1, totalPages: 1, results: [] })),
  searchMovies: vi.fn(async () => ({ page: 1, totalPages: 1, results: [] })),
}))

import { loadCatalogPage } from './catalog'
import { discoverMovies, searchMovies } from './tmdb/movies'

beforeEach(() => vi.clearAllMocks())

test('com busca usa searchMovies e ignora filtros', async () => {
  await loadCatalogPage({ q: 'duna', providerId: 8, genreId: 35, doramas: false, page: 3 }, [8, 119])
  expect(searchMovies).toHaveBeenCalledWith({ query: 'duna', page: 3 })
  expect(discoverMovies).not.toHaveBeenCalled()
})

test('com serviço escolhido filtra só por ele', async () => {
  await loadCatalogPage({ providerId: 8, genreId: 35, doramas: false, page: 2 }, [8, 119])
  expect(discoverMovies).toHaveBeenCalledWith({ providerIds: [8], genreId: 35, page: 2 })
})

test('sem serviço escolhido usa todos os serviços dos botões', async () => {
  await loadCatalogPage({ doramas: false, page: 1 }, [8, 119])
  expect(discoverMovies).toHaveBeenCalledWith({ providerIds: [8, 119], genreId: undefined, page: 1 })
})
