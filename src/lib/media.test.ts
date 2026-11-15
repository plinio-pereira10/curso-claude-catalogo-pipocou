import { parseMediaType, detailPath, listHref, switchTabHref, MEDIA } from './media'

test('parseMediaType', () => {
  expect(parseMediaType('tv')).toBe('tv')
  expect(parseMediaType('movie')).toBe('movie')
  expect(parseMediaType('xyz')).toBe('movie')
  expect(parseMediaType(null)).toBe('movie')
  expect(parseMediaType(undefined)).toBe('movie')
})

test('detailPath', () => {
  expect(detailPath('movie', 7)).toBe('/filme/7')
  expect(detailPath('tv', 9)).toBe('/serie/9')
})

test('listHref', () => {
  expect(listHref('movie', { doramas: false })).toBe('/')
  expect(listHref('tv', { providerId: 8, doramas: true })).toBe('/series?provider=8&doramas=1')
  expect(listHref('movie', { q: 'duna', doramas: false })).toBe('/?q=duna')
})

test('switchTabHref mantém streaming e Doramas e limpa o resto', () => {
  expect(switchTabHref('tv', { providerId: 8, doramas: true })).toBe('/series?provider=8&doramas=1')
  expect(switchTabHref('movie', { doramas: false })).toBe('/')
})

test('textos por tipo', () => {
  expect(MEDIA.movie.noneFound).toBe('Nenhum filme encontrado.')
  expect(MEDIA.tv.noneFound).toBe('Nenhuma série encontrada.')
  expect(MEDIA.tv.notFound).toBe('Série não encontrada.')
  expect(MEDIA.tv.label).toBe('Séries')
})
