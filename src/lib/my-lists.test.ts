import { parseListParam, savedToSummary } from './my-lists'

test('parseListParam', () => {
  expect(parseListParam('assistidos')).toBe('watched')
  expect(parseListParam(undefined)).toBe('want')
  expect(parseListParam('x')).toBe('want')
})

test('savedToSummary', () => {
  expect(
    savedToSummary({ mediaType: 'tv', tmdbId: 5, title: 'Round 6', posterPath: '/p.jpg', backdropPath: '/b.jpg', releaseYear: 2021, voteAverage: 7.9 }),
  ).toEqual({ id: 5, title: 'Round 6', posterPath: '/p.jpg', backdropPath: '/b.jpg', releaseYear: 2021, voteAverage: 7.9, overview: '' })
})
