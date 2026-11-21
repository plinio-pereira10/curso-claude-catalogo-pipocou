import { render, screen } from '@testing-library/react'
import { TitleCard } from './TitleCard'

test('TitleCard mostra cartaz, título, ano e link do filme', () => {
  render(<TitleCard type="movie" item={{ id: 7, title: 'Duna', posterPath: '/d.jpg', backdropPath: null, overview: '', releaseYear: 2024, voteAverage: 8.2 }} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/filme/7')
  expect(screen.getByRole('img', { name: 'Duna' })).toBeInTheDocument()
  expect(screen.getByText('2024')).toBeInTheDocument()
})

test('TitleCard sem cartaz mostra bloco com o título e nenhuma imagem', () => {
  render(<TitleCard type="movie" item={{ id: 7, title: 'Duna', posterPath: null, backdropPath: null, overview: '', releaseYear: null, voteAverage: 0 }} />)
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.getAllByText('Duna').length).toBeGreaterThan(0)
})

test('TitleCard de série aponta para /serie/{id}', () => {
  render(<TitleCard type="tv" item={{ id: 5, title: 'Round 6', posterPath: null, backdropPath: null, overview: '', releaseYear: 2021, voteAverage: 7.8 }} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/serie/5')
})

const base = { id: 7, title: 'Duna', posterPath: '/d.jpg', backdropPath: null, overview: '', releaseYear: 2024, voteAverage: 8.2 }

test('TitleCard usa a imagem de cena quando existe', () => {
  render(<TitleCard type="movie" item={{ ...base, backdropPath: '/b.jpg' }} />)
  const src = screen.getByRole('img', { name: 'Duna' }).getAttribute('src') ?? ''
  expect(decodeURIComponent(src)).toContain('/w780/b.jpg')
})

test('TitleCard sem imagem de cena usa o cartaz', () => {
  render(<TitleCard type="movie" item={base} />)
  const src = screen.getByRole('img', { name: 'Duna' }).getAttribute('src') ?? ''
  expect(decodeURIComponent(src)).toContain('/w342/d.jpg')
})

test('TitleCard mostra nota e ano', () => {
  render(<TitleCard type="movie" item={base} />)
  expect(screen.getByText('8.2')).toBeInTheDocument()
  expect(screen.getByText('2024')).toBeInTheDocument()
})

test('TitleCard mostra a etiqueta da lista marcada', () => {
  const { rerender } = render(<TitleCard type="movie" item={base} mark="want" />)
  expect(screen.getByText('Quero assistir')).toBeInTheDocument()
  rerender(<TitleCard type="movie" item={base} mark="watched" />)
  expect(screen.getByText('✓ Assisti')).toBeInTheDocument()
})

test('TitleCard sem mark não mostra etiqueta de lista', () => {
  render(<TitleCard type="movie" item={base} />)
  expect(screen.queryByText('Quero assistir')).toBeNull()
  expect(screen.queryByText('✓ Assisti')).toBeNull()
})

test('TitleCard com showKind mostra Filme ou Série', () => {
  const { rerender } = render(<TitleCard type="movie" item={base} showKind />)
  expect(screen.getByText('Filme')).toBeInTheDocument()
  rerender(<TitleCard type="tv" item={base} showKind />)
  expect(screen.getByText('Série')).toBeInTheDocument()
})

test('TitleCard destaca só o próprio cartão (grupo com nome, não o "group" da fileira)', () => {
  // A fileira (TitleRow) também tem a classe "group". Um "group-hover:" sem nome reage ao mouse
  // em cima da fileira inteira e acendia todos os cartões juntos.
  const { container } = render(<TitleCard type="movie" item={base} />)
  const link = screen.getByRole('link')
  expect(link.className.split(' ')).toContain('group/card')
  expect(link.className.split(' ')).not.toContain('group')
  expect(container.innerHTML).not.toMatch(/group-(hover|focus-visible):/)
})
