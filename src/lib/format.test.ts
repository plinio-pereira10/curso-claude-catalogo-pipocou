import { formatRuntime, formatRating, formatSeasons, formatVotes } from './format'

test('formatRuntime mostra horas e minutos com dois dígitos', () => {
  expect(formatRuntime(166)).toBe('2h46min')
  expect(formatRuntime(125)).toBe('2h05min')
})

test('formatRuntime com menos de uma hora mostra só minutos', () => {
  expect(formatRuntime(45)).toBe('45min')
})

test('formatRuntime devolve null sem duração', () => {
  expect(formatRuntime(null)).toBeNull()
  expect(formatRuntime(0)).toBeNull()
})

test('formatRating usa uma casa decimal', () => {
  expect(formatRating(8.234)).toBe('8.2')
  expect(formatRating(7)).toBe('7.0')
})

test('formatSeasons', () => {
  expect(formatSeasons(1)).toBe('1 temporada')
  expect(formatSeasons(3)).toBe('3 temporadas')
  expect(formatSeasons(null)).toBeNull()
  expect(formatSeasons(0)).toBeNull()
})

test('formatRating sem votos mostra "Sem nota"', () => {
  expect(formatRating(0)).toBe('Sem nota')
  expect(formatRating(8.234)).toBe('8.2')
})

test('formatVotes', () => {
  expect(formatVotes(0)).toBeNull()
  expect(formatVotes(1)).toBe('1 voto')
  expect(formatVotes(44)).toBe('44 votos')
  expect(formatVotes(999)).toBe('999 votos')
  expect(formatVotes(1000)).toBe('1 mil votos')
  expect(formatVotes(1234)).toBe('1,2 mil votos')
  expect(formatVotes(9960)).toBe('10 mil votos')
  expect(formatVotes(17963)).toBe('18 mil votos')
})
