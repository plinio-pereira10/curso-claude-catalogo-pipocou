import { DORAMA_COUNTRIES, doramaExcludedGenres, visibleGenres, effectiveGenreId } from './doramas'

test('países dos doramas', () => {
  expect(DORAMA_COUNTRIES).toEqual(['KR', 'JP', 'CN', 'TW', 'TH'])
})

test('gêneros excluídos por tipo', () => {
  expect(doramaExcludedGenres('movie')).toEqual([16])
  expect(doramaExcludedGenres('tv')).toEqual([16, 10764, 10767, 10763])
})

test('visibleGenres esconde excluídos só com Doramas ligado', () => {
  const g = [
    { id: 16, name: 'Animação' },
    { id: 18, name: 'Drama' },
    { id: 10764, name: 'Reality' },
  ]
  expect(visibleGenres(g, 'tv', true)).toEqual([{ id: 18, name: 'Drama' }])
  expect(visibleGenres(g, 'tv', false)).toEqual(g)
  expect(visibleGenres(g, 'movie', true).map((x) => x.id)).toEqual([18, 10764])
})

test('effectiveGenreId ignora gênero excluído com Doramas', () => {
  expect(effectiveGenreId('tv', 16, true)).toBeUndefined()
  expect(effectiveGenreId('tv', 16, false)).toBe(16)
  expect(effectiveGenreId('movie', 10749, true)).toBe(10749)
  expect(effectiveGenreId('movie', undefined, true)).toBeUndefined()
})
