import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TitleRow } from './TitleRow'
import type { ProviderRow } from '@/lib/home'

function row(count: number): ProviderRow {
  return {
    provider: { id: 8, name: 'Netflix', logoPath: '/n.png' },
    titles: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `T${i + 1}`,
      posterPath: null,
      backdropPath: null,
      overview: '',
      releaseYear: 2024,
      voteAverage: 7,
    })),
  }
}

const scrollBy = vi.fn()

beforeEach(() => {
  scrollBy.mockReset()
  Element.prototype.scrollBy = scrollBy
})

test('mostra o nome do streaming como título da fileira', () => {
  render(<TitleRow type="movie" row={row(1)} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Netflix' })).toBeInTheDocument()
})

test('Ver todos abre a lista filtrada pelo streaming', () => {
  const { unmount } = render(<TitleRow type="movie" row={row(1)} />)
  expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/?provider=8')
  unmount()
  render(<TitleRow type="tv" row={row(1)} />)
  expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/series?provider=8')
})

test('um cartão por título', () => {
  render(<TitleRow type="movie" row={row(3)} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})

test('setas rolam a fileira', async () => {
  render(<TitleRow type="movie" row={row(3)} />)
  // o jsdom não calcula larguras: a fileira "tem" 1000px
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000)
  await userEvent.click(screen.getByRole('button', { name: 'Rolar para a direita' }))
  expect(scrollBy.mock.calls[0][0].left).toBe(900)
  await userEvent.click(screen.getByRole('button', { name: 'Rolar para a esquerda' }))
  expect(scrollBy.mock.calls[1][0].left).toBe(-900)
  vi.restoreAllMocks()
})
