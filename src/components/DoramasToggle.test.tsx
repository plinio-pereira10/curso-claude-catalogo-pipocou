import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { DoramasToggle } from './DoramasToggle'

beforeEach(() => push.mockReset())

test('mostra "Todos | Doramas" num grupo chamado Doramas, com Todos ativo por padrão', () => {
  render(<DoramasToggle type="tv" filters={{ doramas: false }} disabled={false} />)
  expect(screen.getByRole('group', { name: 'Doramas' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Doramas' })).toHaveAttribute('aria-pressed', 'false')
})

test('Doramas liga mantendo streaming e gênero', async () => {
  render(<DoramasToggle type="tv" filters={{ providerId: 8, genreId: 10749, doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: 'Doramas' }))
  expect(push).toHaveBeenCalledWith('/series?provider=8&genre=10749&doramas=1')
})

test('Doramas ao ligar remove gênero excluído', async () => {
  render(<DoramasToggle type="tv" filters={{ genreId: 16, doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: 'Doramas' }))
  expect(push).toHaveBeenCalledWith('/series?doramas=1')
})

test('Todos desliga mantendo os filtros', async () => {
  render(<DoramasToggle type="movie" filters={{ providerId: 8, doramas: true }} disabled={false} />)
  expect(screen.getByRole('button', { name: 'Doramas' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: 'Todos' }))
  expect(push).toHaveBeenCalledWith('/?provider=8')
})

test('clicar na opção que já está ativa não faz nada', async () => {
  render(<DoramasToggle type="tv" filters={{ doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: 'Todos' }))
  expect(push).not.toHaveBeenCalled()
})

test('desativado na busca', () => {
  render(<DoramasToggle type="tv" filters={{ q: 'x', doramas: false }} disabled />)
  expect(screen.getByRole('button', { name: 'Todos' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Doramas' })).toBeDisabled()
})

test('mantém a nota', async () => {
  render(<DoramasToggle type="tv" filters={{ minRating: 7, doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: 'Doramas' }))
  expect(push).toHaveBeenCalledWith('/series?nota=7&doramas=1')
})
