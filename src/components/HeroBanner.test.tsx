import { act, fireEvent, render, screen } from '@testing-library/react'
import { HeroBanner, ROTATE_MS } from './HeroBanner'
import type { FeaturedItem } from '@/lib/home'

function item(id: number, logoPath: string | null = null): FeaturedItem {
  return {
    title: {
      id,
      title: `Título ${id}`,
      posterPath: null,
      backdropPath: `/b${id}.jpg`,
      overview: `Sinopse ${id}`,
      releaseYear: 2024,
      voteAverage: 7.5,
    },
    provider: { id: 8, name: 'Netflix', logoPath: '/n.png' },
    logoPath,
  }
}

let reducedMotion = false

beforeEach(() => {
  reducedMotion = false
  vi.useFakeTimers()
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('reduce') ? reducedMotion : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** O destaque visível é o que não está escondido (aria-hidden). */
function currentTitle() {
  return screen.getByRole('link', { name: 'Ver detalhes' }).getAttribute('href')
}

test('mostra o logo do título quando existe; sem logo, o nome como título', () => {
  const { unmount } = render(<HeroBanner type="movie" items={[item(1, '/logo1.png')]} />)
  expect(screen.getByRole('img', { name: 'Título 1' })).toBeInTheDocument()
  unmount()
  render(<HeroBanner type="movie" items={[item(1)]} />)
  expect(screen.getByRole('heading', { level: 1, name: 'Título 1' })).toBeInTheDocument()
})

test('o streaming aparece pelo nome na linha da nota, com o logo só decorativo', () => {
  render(<HeroBanner type="movie" items={[item(1)]} />)
  const line = screen.getByText('Netflix').closest('p')
  expect(line).toHaveTextContent('Netflix')
  expect(line).toHaveTextContent('7.5')
  expect(line).toHaveTextContent('2024')
  // o nome já está em texto: o logo não é lido de novo pelo leitor de tela
  expect(screen.queryByRole('img', { name: 'Netflix' })).toBeNull()
})

test('Ver detalhes leva à página do título', () => {
  render(<HeroBanner type="movie" items={[item(7)]} />)
  expect(currentTitle()).toBe('/filme/7')
})

test('troca de destaque pelas bolinhas', () => {
  render(<HeroBanner type="tv" items={[item(1), item(2), item(3)]} />)
  fireEvent.click(screen.getByRole('button', { name: 'Destaque 2' }))
  expect(currentTitle()).toBe('/serie/2')
  expect(screen.getByRole('button', { name: 'Destaque 2' })).toHaveAttribute('aria-current', 'true')
})

test('troca sozinho a cada 8 s e volta ao primeiro', () => {
  render(<HeroBanner type="movie" items={[item(1), item(2), item(3)]} />)
  expect(ROTATE_MS).toBe(8000)
  act(() => vi.advanceTimersByTime(ROTATE_MS))
  expect(currentTitle()).toBe('/filme/2')
  act(() => vi.advanceTimersByTime(ROTATE_MS))
  expect(currentTitle()).toBe('/filme/3')
  act(() => vi.advanceTimersByTime(ROTATE_MS))
  expect(currentTitle()).toBe('/filme/1')
})

test('não troca sozinho quando o sistema pede menos movimento', () => {
  reducedMotion = true
  render(<HeroBanner type="movie" items={[item(1), item(2)]} />)
  act(() => vi.advanceTimersByTime(ROTATE_MS * 2))
  expect(currentTitle()).toBe('/filme/1')
})

test('para enquanto o mouse está em cima', () => {
  render(<HeroBanner type="movie" items={[item(1), item(2)]} />)
  fireEvent.mouseEnter(screen.getByRole('region', { name: 'Destaques' }))
  act(() => vi.advanceTimersByTime(ROTATE_MS * 2))
  expect(currentTitle()).toBe('/filme/1')
})

test('com 1 destaque não mostra bolinhas; sem destaques não mostra nada', () => {
  const { container, unmount } = render(<HeroBanner type="movie" items={[item(1)]} />)
  expect(screen.queryByRole('button', { name: 'Destaque 1' })).toBeNull()
  unmount()
  const empty = render(<HeroBanner type="movie" items={[]} />)
  expect(empty.container).toBeEmptyDOMElement()
  expect(container).toBeEmptyDOMElement()
})

test('continua parado se o mouse sai mas o foco do teclado ainda está no banner', () => {
  render(<HeroBanner type="movie" items={[item(1), item(2)]} />)
  const region = screen.getByRole('region', { name: 'Destaques' })
  act(() => screen.getByRole('link', { name: 'Ver detalhes' }).focus())
  fireEvent.mouseEnter(region)
  fireEvent.mouseLeave(region)
  act(() => vi.advanceTimersByTime(ROTATE_MS * 2))
  expect(currentTitle()).toBe('/filme/1')
})
