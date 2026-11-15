import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { GenreSelect } from './GenreSelect'

beforeEach(() => push.mockReset())

const genres = [
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comédia' },
]

test('GenreSelect mantém a nota e o streaming', async () => {
  render(<GenreSelect type="movie" genres={genres} filters={{ providerId: 8, minRating: 7, doramas: false }} disabled={false} />)
  await userEvent.selectOptions(screen.getByRole('combobox'), '18')
  expect(push).toHaveBeenCalledWith('/?provider=8&genre=18&nota=7')
})

test('GenreSelect "Todos" tira só o gênero', async () => {
  render(<GenreSelect type="tv" genres={genres} filters={{ genreId: 35, minRating: 8, doramas: true }} disabled={false} />)
  await userEvent.selectOptions(screen.getByRole('combobox'), '')
  expect(push).toHaveBeenCalledWith('/series?nota=8&doramas=1')
})
