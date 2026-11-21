import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}))

// a parte da conta lê o cookie de sessão (só no servidor); aqui o teste é do menu
vi.mock('./AccountNav', () => ({ AccountNav: () => null }))

import { TopBar } from './TopBar'

const providers = [{ id: 8, name: 'Netflix', logoPath: '/n.png' }]

test('TopBar sem streamings não mostra os logos', () => {
  render(<TopBar type="movie" />)
  expect(screen.queryByRole('group', { name: 'Filtrar por streaming' })).toBeNull()
  expect(screen.getByRole('search')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Filmes' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Séries' })).toBeInTheDocument()
})

test('TopBar com streamings mostra os logos como filtro', () => {
  render(<TopBar type="tv" providers={providers} filters={{ doramas: false }} />)
  expect(screen.getByRole('group', { name: 'Filtrar por streaming' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Netflix' })).toBeInTheDocument()
})

test('TopBar mostra o logo Pipocou, sem o nome antigo', () => {
  render(<TopBar type="movie" />)
  expect(screen.getByRole('link', { name: 'Pipocou' })).toHaveAttribute('href', '/')
  expect(screen.queryByText(/Catálogo/)).toBeNull()
})
