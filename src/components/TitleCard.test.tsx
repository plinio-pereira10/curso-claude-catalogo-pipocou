import { render, screen } from '@testing-library/react'
import { TitleCard } from './TitleCard'

test('TitleCard mostra cartaz, título, ano e link do filme', () => {
  render(<TitleCard type="movie" item={{ id: 7, title: 'Duna', posterPath: '/d.jpg', releaseYear: 2024, voteAverage: 8.2 }} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/filme/7')
  expect(screen.getByRole('img', { name: 'Duna' })).toBeInTheDocument()
  expect(screen.getByText('2024')).toBeInTheDocument()
})

test('TitleCard sem cartaz mostra bloco com o título e nenhuma imagem', () => {
  render(<TitleCard type="movie" item={{ id: 7, title: 'Duna', posterPath: null, releaseYear: null, voteAverage: 0 }} />)
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.getAllByText('Duna').length).toBeGreaterThan(0)
})

test('TitleCard de série aponta para /serie/{id}', () => {
  render(<TitleCard type="tv" item={{ id: 5, title: 'Round 6', posterPath: null, releaseYear: 2021, voteAverage: 7.8 }} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/serie/5')
})
