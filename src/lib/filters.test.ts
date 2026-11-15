import { parseFilters, filtersToQuery } from './filters'

test('lê valores válidos', () => {
  expect(parseFilters({ provider: '8', genre: '35', q: ' duna ', page: '3' })).toEqual({
    providerId: 8,
    genreId: 35,
    q: 'duna',
    doramas: false,
    page: 3,
  })
})

test('ignora valores inválidos', () => {
  expect(parseFilters({ provider: 'abc', genre: '', q: '   ', page: '-3' })).toEqual({ doramas: false, page: 1 })
})

test('ignora números com lixo e zero', () => {
  expect(parseFilters({ provider: '8abc', genre: '0', page: '2.5' })).toEqual({ doramas: false, page: 1 })
})

test('limita page a 500', () => {
  expect(parseFilters({ page: '9999' }).page).toBe(500)
})

test('usa o primeiro valor quando vem lista', () => {
  expect(parseFilters({ provider: ['8', '9'] }).providerId).toBe(8)
})

test('filtersToQuery omite vazios e page 1', () => {
  expect(filtersToQuery({ providerId: 8, page: 1 })).toBe('provider=8')
  expect(filtersToQuery({ q: 'duna', page: 2 })).toBe('q=duna&page=2')
  expect(filtersToQuery({})).toBe('')
})

test('filtersToQuery codifica texto da busca', () => {
  expect(filtersToQuery({ q: 'o poderoso chefão' })).toBe('q=o+poderoso+chef%C3%A3o')
})

test('lê doramas=1', () => {
  expect(parseFilters({ doramas: '1' }).doramas).toBe(true)
  expect(parseFilters({ doramas: 'sim' }).doramas).toBe(false)
  expect(parseFilters({}).doramas).toBe(false)
})

test('filtersToQuery escreve doramas na ordem', () => {
  expect(filtersToQuery({ providerId: 8, genreId: 35, doramas: true, page: 2 })).toBe('provider=8&genre=35&doramas=1&page=2')
  expect(filtersToQuery({ providerId: 8, doramas: false })).toBe('provider=8')
})
