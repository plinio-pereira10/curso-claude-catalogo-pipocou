vi.mock('server-only', () => ({}))
vi.mock('./tmdb/titles', () => ({
  discoverTitles: vi.fn(async () => ({ page: 1, totalPages: 1, results: [] })),
  searchTitles: vi.fn(async () => ({ page: 1, totalPages: 1, results: [] })),
}))

import { loadCatalogPage } from './catalog'
import { discoverTitles, searchTitles } from './tmdb/titles'

beforeEach(() => vi.clearAllMocks())

test('com busca usa searchTitles e ignora filtros', async () => {
  await loadCatalogPage('movie', { q: 'duna', providerId: 8, genreId: 35, doramas: true, page: 3 }, [8, 119])
  expect(searchTitles).toHaveBeenCalledWith('movie', { query: 'duna', page: 3 })
  expect(discoverTitles).not.toHaveBeenCalled()
})

test('busca em séries usa searchTitles com tv', async () => {
  await loadCatalogPage('tv', { q: 'pousando', doramas: false, page: 1 }, [8])
  expect(searchTitles).toHaveBeenCalledWith('tv', { query: 'pousando', page: 1 })
})

test('com serviço escolhido filtra só por ele', async () => {
  await loadCatalogPage('movie', { providerId: 8, genreId: 35, doramas: false, page: 2 }, [8, 119])
  expect(discoverTitles).toHaveBeenCalledWith('movie', { providerIds: [8], genreId: 35, doramas: false, minRating: undefined, sortByRating: false, page: 2 })
})

test('sem serviço escolhido usa todos os serviços dos botões', async () => {
  await loadCatalogPage('tv', { doramas: true, page: 1 }, [8, 119])
  expect(discoverTitles).toHaveBeenCalledWith('tv', { providerIds: [8, 119], genreId: undefined, doramas: true, minRating: undefined, sortByRating: false, page: 1 })
})

test('séries com Doramas e gênero excluído ignoram o gênero', async () => {
  await loadCatalogPage('tv', { genreId: 16, doramas: true, page: 1 }, [8])
  expect(discoverTitles).toHaveBeenCalledWith('tv', { providerIds: [8], genreId: undefined, doramas: true, minRating: undefined, sortByRating: false, page: 1 })
})

test('gênero permitido com Doramas é mantido', async () => {
  await loadCatalogPage('tv', { genreId: 18, doramas: true, page: 1 }, [8])
  expect(discoverTitles).toHaveBeenCalledWith('tv', { providerIds: [8], genreId: 18, doramas: true, minRating: undefined, sortByRating: false, page: 1 })
})

test('catálogo repassa a ordem', async () => {
  await loadCatalogPage('tv', { sort: 'rating', doramas: true, page: 2 }, [8])
  expect(discoverTitles).toHaveBeenCalledWith('tv', {
    providerIds: [8],
    genreId: undefined,
    doramas: true,
    minRating: undefined,
    sortByRating: true,
    page: 2,
  })
})

test('nota é repassada ao discover', async () => {
  await loadCatalogPage('movie', { minRating: 8, doramas: false, page: 1 }, [8])
  expect(discoverTitles).toHaveBeenCalledWith('movie', {
    providerIds: [8],
    genreId: undefined,
    doramas: false,
    minRating: 8,
    sortByRating: false,
    page: 1,
  })
})
