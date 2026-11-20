import { markKey, nextStatus } from './marks'

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
