vi.mock('server-only', () => ({}))
vi.mock('./tmdb/titles', () => ({
  discoverTitles: vi.fn(async () => ({ page: 1, totalPages: 1, results: [] })),
  searchTitles: vi.fn(async () => ({ page: 1, totalPages: 1, results: [] })),
}))

import { loadCatalogPage } from './catalog'
import { discoverTitles, searchTitles } from './tmdb/titles'

beforeEach(() => vi.clearAllMocks())

test('com busca usa searchTitles e ignora filtros', async () => {
  await loadCatalogPage({ q: 'duna', providerId: 8, genreId: 35, doramas: false, page: 3 }, [8, 119])
  expect(searchTitles).toHaveBeenCalledWith('movie', { query: 'duna', page: 3 })
  expect(discoverTitles).not.toHaveBeenCalled()
})

test('com serviço escolhido filtra só por ele', async () => {
  await loadCatalogPage({ providerId: 8, genreId: 35, doramas: false, page: 2 }, [8, 119])
  expect(discoverTitles).toHaveBeenCalledWith('movie', { providerIds: [8], genreId: 35, doramas: false, page: 2 })
})

test('sem serviço escolhido usa todos os serviços dos botões', async () => {
  await loadCatalogPage({ doramas: false, page: 1 }, [8, 119])
  expect(discoverTitles).toHaveBeenCalledWith('movie', {
    providerIds: [8, 119],
    genreId: undefined,
    doramas: false,
    page: 1,
  })
})
