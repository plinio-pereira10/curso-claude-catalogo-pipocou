import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}))

import { SearchToggle } from './SearchToggle'

test('SearchToggle abre a busca e põe o cursor no campo', async () => {
  render(<SearchToggle type="movie" />)
  const abrir = screen.getByRole('button', { name: 'Abrir busca' })
  expect(abrir).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(abrir)
  expect(abrir).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('searchbox')).toHaveFocus()
})

test('SearchToggle fecha com o X', async () => {
  render(<SearchToggle type="movie" />)
  await userEvent.click(screen.getByRole('button', { name: 'Abrir busca' }))
  await userEvent.click(screen.getByRole('button', { name: 'Fechar busca' }))
  expect(screen.getByRole('button', { name: 'Abrir busca' })).toHaveAttribute('aria-expanded', 'false')
})

test('SearchToggle com busca feita começa aberto mostrando o texto', () => {
  render(<SearchToggle type="movie" initialQuery="duna" />)
  expect(screen.getByRole('button', { name: 'Abrir busca' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('searchbox')).toHaveValue('duna')
})

test('SearchToggle devolve o foco à lupa ao fechar com o X', async () => {
  render(<SearchToggle type="movie" />)
  await userEvent.click(screen.getByRole('button', { name: 'Abrir busca' }))
  await userEvent.click(screen.getByRole('button', { name: 'Fechar busca' }))
  expect(screen.getByRole('button', { name: 'Abrir busca' })).toHaveFocus()
})

test('SearchToggle já aberto: a lupa leva o cursor ao campo', async () => {
  render(<SearchToggle type="movie" initialQuery="duna" />)
  await userEvent.click(screen.getByRole('button', { name: 'Abrir busca' }))
  expect(screen.getByRole('searchbox')).toHaveFocus()
})
