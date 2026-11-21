import { isValidSnapshot, markKey, nextStatus } from './marks'

const ok = { title: 'Round 6', posterPath: '/p1.jpg', backdropPath: '/b_2-x.jpg', releaseYear: 2021, voteAverage: 7.9 }

test('isValidSnapshot aceita o retrato normal e caminhos nulos', () => {
  expect(isValidSnapshot(ok)).toBe(true)
  expect(isValidSnapshot({ ...ok, posterPath: null, backdropPath: null, releaseYear: null, voteAverage: 0 })).toBe(true)
  expect(isValidSnapshot({ ...ok, title: 'a'.repeat(300), voteAverage: 10 })).toBe(true)
})

test('isValidSnapshot recusa título vazio ou com mais de 300 caracteres', () => {
  expect(isValidSnapshot({ ...ok, title: '' })).toBe(false)
  expect(isValidSnapshot({ ...ok, title: 'a'.repeat(301) })).toBe(false)
  expect(isValidSnapshot({ ...ok, title: 42 })).toBe(false)
})

test('isValidSnapshot recusa caminhos fora do formato do TMDB', () => {
  for (const bad of ['https://site-mal.com/x.jpg', '/../x', '/a b.jpg', 'x.jpg', '/' + 'a'.repeat(100), '']) {
    expect(isValidSnapshot({ ...ok, posterPath: bad })).toBe(false)
    expect(isValidSnapshot({ ...ok, backdropPath: bad })).toBe(false)
  }
})

test('isValidSnapshot recusa ano e nota fora da faixa', () => {
  for (const year of [1500, 2200, 1.5]) expect(isValidSnapshot({ ...ok, releaseYear: year })).toBe(false)
  for (const vote of [-1, 11, Number.NaN]) expect(isValidSnapshot({ ...ok, voteAverage: vote })).toBe(false)
  expect(isValidSnapshot(null)).toBe(false)
})

test('markKey', () => {
  expect(markKey('tv', 5)).toBe('tv:5')
  expect(markKey('movie', 7)).toBe('movie:7')
})

test('nextStatus', () => {
  expect(nextStatus(null, 'want')).toBe('want')
  expect(nextStatus('want', 'want')).toBeNull()
  expect(nextStatus('want', 'watched')).toBe('watched')
  expect(nextStatus('watched', 'want')).toBe('want')
  expect(nextStatus('watched', 'watched')).toBeNull()
})
