import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { RatingSelect } from './RatingSelect'

beforeEach(() => push.mockReset())

test('RatingSelect mostra as opções Todas, 6+, 7+, 8+', () => {
  render(<RatingSelect type="tv" filters={{ doramas: false }} disabled={false} />)
  const options = screen.getAllByRole('option').map((o) => o.textContent)
  expect(options).toEqual(['Todas', '6+', '7+', '8+'])
})

test('RatingSelect escolhe 8+ mantendo os outros filtros', async () => {
  render(<RatingSelect type="tv" filters={{ providerId: 8, genreId: 18, doramas: true }} disabled={false} />)
  await userEvent.selectOptions(screen.getByLabelText('Nota:'), '8')
  expect(push).toHaveBeenCalledWith('/series?provider=8&genre=18&nota=8&doramas=1')
})

test('RatingSelect "Todas" tira a nota', async () => {
  render(<RatingSelect type="tv" filters={{ providerId: 8, minRating: 7, doramas: false }} disabled={false} />)
  expect(screen.getByLabelText('Nota:')).toHaveValue('7')
  await userEvent.selectOptions(screen.getByLabelText('Nota:'), '')
  expect(push).toHaveBeenCalledWith('/series?provider=8')
})

test('RatingSelect desativado na busca', () => {
  render(<RatingSelect type="movie" filters={{ q: 'duna', doramas: false }} disabled />)
  expect(screen.getByLabelText('Nota:')).toBeDisabled()
})
