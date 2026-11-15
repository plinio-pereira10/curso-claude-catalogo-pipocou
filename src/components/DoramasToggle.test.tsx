import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { DoramasToggle } from './DoramasToggle'

beforeEach(() => push.mockReset())

test('DoramasToggle liga mantendo streaming e gênero', async () => {
  render(<DoramasToggle type="tv" filters={{ providerId: 8, genreId: 10749, doramas: false }} disabled={false} />)
  const button = screen.getByRole('button', { name: '🌸 Doramas' })
  expect(button).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(button)
  expect(push).toHaveBeenCalledWith('/series?provider=8&genre=10749&doramas=1')
})

test('DoramasToggle ao ligar remove gênero excluído', async () => {
  render(<DoramasToggle type="tv" filters={{ genreId: 16, doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: '🌸 Doramas' }))
  expect(push).toHaveBeenCalledWith('/series?doramas=1')
})

test('DoramasToggle desliga', async () => {
  render(<DoramasToggle type="movie" filters={{ providerId: 8, doramas: true }} disabled={false} />)
  const button = screen.getByRole('button', { name: '🌸 Doramas' })
  expect(button).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(button)
  expect(push).toHaveBeenCalledWith('/?provider=8')
})

test('DoramasToggle desativado na busca', () => {
  render(<DoramasToggle type="tv" filters={{ q: 'x', doramas: false }} disabled />)
  expect(screen.getByRole('button', { name: '🌸 Doramas' })).toBeDisabled()
})

test('DoramasToggle mantém a nota', async () => {
  render(<DoramasToggle type="tv" filters={{ minRating: 7, doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: '🌸 Doramas' }))
  expect(push).toHaveBeenCalledWith('/series?nota=7&doramas=1')
})
