import { parseMinRating, RATING_OPTIONS, MIN_VOTE_COUNT } from './rating'

test('opções e mínimo de votos', () => {
  expect(RATING_OPTIONS).toEqual([6, 7, 8])
  expect(MIN_VOTE_COUNT).toBe(15)
})

test('parseMinRating aceita só 6, 7 e 8', () => {
  expect(parseMinRating('6')).toBe(6)
  expect(parseMinRating('7')).toBe(7)
  expect(parseMinRating('8')).toBe(8)
  for (const bad of ['9', '5', 'abc', '7.5', '', undefined]) expect(parseMinRating(bad)).toBeUndefined()
})
