import { backdropUrl, posterUrl, logoUrl } from './images'

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

test('backdropUrl usa w780 por padrão, aceita w1280 e devolve null sem imagem', () => {
  expect(backdropUrl('/b.jpg')).toBe('https://image.tmdb.org/t/p/w780/b.jpg')
  expect(backdropUrl('/b.jpg', 'w1280')).toBe('https://image.tmdb.org/t/p/w1280/b.jpg')
  expect(backdropUrl(null)).toBeNull()
})
