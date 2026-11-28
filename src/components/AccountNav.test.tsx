import { render, screen } from '@testing-library/react'

const { getCurrentUser } = vi.hoisted(() => ({ getCurrentUser: vi.fn() }))
vi.mock('@/lib/auth', () => ({ getCurrentUser }))
vi.mock('@/app/actions/auth', () => ({ signOut: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => '/serie/5' }))

import { AccountNav } from './AccountNav'

test('AccountNav sem login mostra Entrar com volta para a página atual', async () => {
  getCurrentUser.mockResolvedValue(null)
  render(await AccountNav())
  expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/entrar?voltar=%2Fserie%2F5')
  expect(screen.queryByRole('link', { name: 'Minhas listas' })).toBeNull()
})

test('AccountNav logado mostra Minhas listas, inicial e Sair', async () => {
  getCurrentUser.mockResolvedValue({ id: 'u1', email: 'plinio@x.com', initial: 'P' })
  render(await AccountNav())
  expect(screen.getByRole('link', { name: 'Minhas listas' })).toHaveAttribute('href', '/minhas-listas')
  expect(screen.getByRole('button', { name: 'Menu da conta' })).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: 'Minhas listas' })).toHaveLength(1)
  expect(screen.getByTitle('plinio@x.com')).toHaveTextContent('P')
  expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull()
})
