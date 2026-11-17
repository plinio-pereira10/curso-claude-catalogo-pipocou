vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ unstable_rethrow: vi.fn() }))
vi.mock('./tmdb/titles', () => ({
  getTopProviders: vi.fn(),
  getProviderRow: vi.fn(),
  getTitleLogo: vi.fn(),
}))

import { unstable_rethrow } from 'next/navigation'
import { getProviderRow, getTitleLogo, getTopProviders } from './tmdb/titles'
import { hasActiveFilters, loadHome, pickFeatured, type ProviderRow } from './home'
import type { Provider, TitleSummary } from './tmdb/types'

function title(id: number, backdropPath: string | null = `/b${id}.jpg`): TitleSummary {
  return { id, title: `T${id}`, posterPath: null, backdropPath, releaseYear: 2024, voteAverage: 7, overview: '' }
}

function provider(id: number): Provider {
  return { id, name: `P${id}`, logoPath: `/p${id}.png` }
}

beforeEach(() => {
  vi.mocked(getTopProviders).mockReset()
  vi.mocked(getProviderRow).mockReset()
  vi.mocked(getTitleLogo).mockReset()
  vi.mocked(unstable_rethrow).mockReset()
})

test('hasActiveFilters: só a lista sem nenhum filtro conta como tela inicial', () => {
  expect(hasActiveFilters({ doramas: false })).toBe(false)
  expect(hasActiveFilters({ doramas: false, providerId: 8 })).toBe(true)
  expect(hasActiveFilters({ doramas: false, genreId: 18 })).toBe(true)
  expect(hasActiveFilters({ doramas: false, minRating: 7 })).toBe(true)
  expect(hasActiveFilters({ doramas: false, q: 'duna' })).toBe(true)
  expect(hasActiveFilters({ doramas: true })).toBe(true)
})

test('pickFeatured pega o 1º título com imagem de cena de cada fileira, sem repetir', () => {
  const rows: ProviderRow[] = [
    { provider: provider(1), titles: [title(1, null), title(2)] },
    { provider: provider(2), titles: [title(2), title(3)] },
    { provider: provider(3), titles: [title(4)] },
  ]
  expect(pickFeatured(rows).map((f) => [f.title.id, f.provider.id])).toEqual([
    [2, 1],
    [3, 2],
    [4, 3],
  ])
})

test('pickFeatured respeita o máximo', () => {
  const rows = Array.from({ length: 7 }, (_, i) => ({ provider: provider(i), titles: [title(i)] }))
  expect(pickFeatured(rows)).toHaveLength(5)
  expect(pickFeatured(rows, 2)).toHaveLength(2)
})

test('loadHome monta uma fileira por streaming, na ordem, com o logo dos destaques', async () => {
  vi.mocked(getTopProviders).mockResolvedValue([provider(8), provider(119)])
  vi.mocked(getProviderRow).mockImplementation(async (_type, id) => [title(id)])
  vi.mocked(getTitleLogo).mockImplementation(async (_type, id) => `/logo${id}.png`)
  const home = await loadHome('movie')
  expect(home.rows.map((r) => r.provider.id)).toEqual([8, 119])
  expect(home.featured.map((f) => f.logoPath)).toEqual(['/logo8.png', '/logo119.png'])
  expect(getProviderRow).toHaveBeenCalledWith('movie', 8)
  expect(getTitleLogo).toHaveBeenCalledWith('movie', 8)
})

test('loadHome esconde a fileira que falhou e a vazia', async () => {
  const boom = new Error('falhou')
  vi.mocked(getTopProviders).mockResolvedValue([provider(1), provider(2), provider(3)])
  vi.mocked(getProviderRow).mockImplementation(async (_type, id) => {
    if (id === 1) throw boom
    return id === 2 ? [] : [title(3)]
  })
  vi.mocked(getTitleLogo).mockResolvedValue(null)
  const home = await loadHome('tv')
  expect(home.rows.map((r) => r.provider.id)).toEqual([3])
  expect(unstable_rethrow).toHaveBeenCalledWith(boom)
})

test('loadHome relança quando todas as fileiras falham', async () => {
  vi.mocked(getTopProviders).mockResolvedValue([provider(1), provider(2)])
  vi.mocked(getProviderRow).mockRejectedValue(new Error('fora do ar'))
  await expect(loadHome('movie')).rejects.toThrow('fora do ar')
})

test('loadHome usa null quando o logo do título falha', async () => {
  vi.mocked(getTopProviders).mockResolvedValue([provider(1)])
  vi.mocked(getProviderRow).mockResolvedValue([title(1)])
  vi.mocked(getTitleLogo).mockRejectedValue(new Error('sem logo'))
  const home = await loadHome('movie')
  expect(home.featured).toHaveLength(1)
  expect(home.featured[0].logoPath).toBeNull()
})
