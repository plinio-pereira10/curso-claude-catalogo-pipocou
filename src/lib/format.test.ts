import { formatRuntime, formatRating } from './format'

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
