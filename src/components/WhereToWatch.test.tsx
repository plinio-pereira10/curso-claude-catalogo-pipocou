import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WhereToWatch } from './WhereToWatch'
import type { CountryAvailability } from '@/lib/availability'

const netflix = { id: 8, name: 'Netflix', logoPath: '/n.png' }
const max = { id: 1899, name: 'Max', logoPath: '/m.png' }

function countries(n: number): CountryAvailability[] {
  return Array.from({ length: n }, (_, i) => ({ code: `C${i}`, name: `País ${i}`, providers: [netflix, max] }))
}

test('com Brasil mostra só os serviços do Brasil', () => {
  render(<WhereToWatch availability={{ brazil: [netflix, max], otherCountries: countries(3) }} />)
  expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Max' })).toBeInTheDocument()
  expect(screen.queryByText('Disponível em outros países:')).toBeNull()
})

test('sem Brasil mostra outros países: 5 primeiros e botão ver todos', async () => {
  render(<WhereToWatch availability={{ brazil: [], otherCountries: countries(6) }} />)
  expect(screen.getByText('Não disponível em streaming no Brasil.')).toBeInTheDocument()
  expect(screen.getByText('Disponível em outros países:')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(5)
  expect(screen.getByText('País 0 — Netflix, Max')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'ver todos os 6 países' }))
  expect(screen.getAllByRole('listitem')).toHaveLength(6)
  expect(screen.queryByRole('button', { name: /ver todos/ })).toBeNull()
})

test('com 5 países ou menos não mostra o botão', () => {
  render(<WhereToWatch availability={{ brazil: [], otherCountries: countries(5) }} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(5)
  expect(screen.queryByRole('button', { name: /ver todos/ })).toBeNull()
})

test('sem nenhum país mostra "Não disponível em streaming no momento."', () => {
  render(<WhereToWatch availability={{ brazil: [], otherCountries: [] }} />)
  expect(screen.getByText('Não disponível em streaming no momento.')).toBeInTheDocument()
  expect(screen.queryByText('Disponível em outros países:')).toBeNull()
})

test('com Brasil e link mostra "Ver no streaming"', () => {
  render(
    <WhereToWatch
      availability={{ brazil: [netflix], otherCountries: [] }}
      brazilLink="https://www.themoviedb.org/tv/5/watch?locale=BR"
    />,
  )
  const link = screen.getByRole('link', { name: 'Ver no streaming' })
  expect(link).toHaveAttribute('href', 'https://www.themoviedb.org/tv/5/watch?locale=BR')
  expect(link).toHaveAttribute('target', '_blank')
})

test('sem Brasil não mostra o link mesmo com brazilLink', () => {
  render(<WhereToWatch availability={{ brazil: [], otherCountries: countries(2) }} brazilLink="https://x" />)
  expect(screen.queryByRole('link', { name: 'Ver no streaming' })).toBeNull()
})

test('com Brasil e sem link não mostra o link', () => {
  render(<WhereToWatch availability={{ brazil: [netflix], otherCountries: [] }} brazilLink={null} />)
  expect(screen.queryByRole('link', { name: 'Ver no streaming' })).toBeNull()
})
