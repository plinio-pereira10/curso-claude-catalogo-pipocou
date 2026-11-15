import { posterUrl, logoUrl } from './images'

test('posterUrl monta a URL com tamanho padrão w342', () => {
  expect(posterUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg')
})

test('posterUrl aceita tamanho', () => {
  expect(posterUrl('/abc.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg')
})

test('posterUrl retorna null sem cartaz', () => {
  expect(posterUrl(null)).toBeNull()
})

test('logoUrl usa w92', () => {
  expect(logoUrl('/n.png')).toBe('https://image.tmdb.org/t/p/w92/n.png')
})
