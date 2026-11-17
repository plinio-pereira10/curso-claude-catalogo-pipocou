import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { ProviderFilter } from './ProviderFilter'

beforeEach(() => push.mockReset())

const providers = [{ id: 8, name: 'Netflix', logoPath: '/n.png' }]

test('ProviderFilter mantém nota e gênero', async () => {
  render(<ProviderFilter type="movie" providers={providers} filters={{ genreId: 18, minRating: 8, doramas: false }} disabled={false} />)
  await userEvent.click(screen.getByRole('button', { name: 'Netflix' }))
  expect(push).toHaveBeenCalledWith('/?provider=8&genre=18&nota=8')
})

test('ProviderFilter mostra só o logo, com o nome como nome acessível', () => {
  render(<ProviderFilter type="movie" providers={providers} filters={{ doramas: false }} disabled={false} />)
  expect(screen.getByRole('button', { name: 'Netflix' })).toBeInTheDocument()
  expect(screen.queryByText('Netflix')).toBeNull()
})
