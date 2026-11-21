import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { SortSelect } from './SortSelect'

beforeEach(() => push.mockReset())

test('SortSelect mostra as duas opções, com Mais populares por padrão', () => {
  render(<SortSelect type="movie" filters={{ doramas: false }} disabled={false} />)
  expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Mais populares', 'Mais bem avaliados'])
  expect(screen.getByLabelText('Ordem:')).toHaveValue('')
})

test('SortSelect escolhe Mais bem avaliados mantendo os filtros', async () => {
  render(<SortSelect type="tv" filters={{ providerId: 8, minRating: 8, doramas: true }} disabled={false} />)
  await userEvent.selectOptions(screen.getByLabelText('Ordem:'), 'nota')
  expect(push).toHaveBeenCalledWith('/series?provider=8&nota=8&ordem=nota&doramas=1')
})

test('SortSelect volta para Mais populares', async () => {
  render(<SortSelect type="movie" filters={{ providerId: 8, sort: 'rating', doramas: false }} disabled={false} />)
  expect(screen.getByLabelText('Ordem:')).toHaveValue('nota')
  await userEvent.selectOptions(screen.getByLabelText('Ordem:'), '')
  expect(push).toHaveBeenCalledWith('/?provider=8')
})

test('SortSelect desativado na busca', () => {
  render(<SortSelect type="movie" filters={{ q: 'duna', doramas: false }} disabled />)
  expect(screen.getByLabelText('Ordem:')).toBeDisabled()
})
