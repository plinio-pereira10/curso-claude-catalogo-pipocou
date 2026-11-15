import { render, screen } from '@testing-library/react'
import { MovieCard } from './MovieCard'

test('MovieCard mostra cartaz, título, ano e link', () => {
  render(<MovieCard movie={{ id: 7, title: 'Duna', posterPath: '/d.jpg', releaseYear: 2024, voteAverage: 8.2 }} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/filme/7')
  expect(screen.getByRole('img', { name: 'Duna' })).toBeInTheDocument()
  expect(screen.getByText('2024')).toBeInTheDocument()
})

test('MovieCard sem cartaz mostra bloco com o título e nenhuma imagem', () => {
  render(<MovieCard movie={{ id: 7, title: 'Duna', posterPath: null, releaseYear: null, voteAverage: 0 }} />)
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.getAllByText('Duna').length).toBeGreaterThan(0)
})
