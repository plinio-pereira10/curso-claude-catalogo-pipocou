import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MovieGrid } from './MovieGrid'
import type { TitleSummary } from '@/lib/tmdb/types'

const fetchMock = vi.fn()

function movie(id: number, title: string): TitleSummary {
  return { id, title, posterPath: null, releaseYear: 2024, voteAverage: 7 }
}

function mockFetchJson(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }))
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => vi.unstubAllGlobals())

test('carrega a próxima página e junta os filmes', async () => {
  mockFetchJson({ page: 2, totalPages: 2, results: [movie(2, 'B')] })
  render(<MovieGrid initial={{ page: 1, totalPages: 2, results: [movie(1, 'A')] }} query="provider=8" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(String(fetchMock.mock.calls[0][0])).toBe('/api/movies?provider=8&page=2')
  expect((await screen.findAllByText('B')).length).toBeGreaterThan(0)
  expect(screen.getAllByText('A').length).toBeGreaterThan(0)
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
})

test('sem query monta a URL só com a página', async () => {
  mockFetchJson({ page: 2, totalPages: 3, results: [] })
  render(<MovieGrid initial={{ page: 1, totalPages: 3, results: [movie(1, 'A')] }} query="" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(String(fetchMock.mock.calls[0][0])).toBe('/api/movies?page=2')
})

test('ignora filmes repetidos ao juntar páginas', async () => {
  mockFetchJson({ page: 2, totalPages: 3, results: [movie(1, 'A'), movie(3, 'C')] })
  render(<MovieGrid initial={{ page: 1, totalPages: 3, results: [movie(1, 'A')] }} query="" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  await screen.findAllByText('C')
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

test('sem mais páginas não mostra o botão', () => {
  render(<MovieGrid initial={{ page: 1, totalPages: 1, results: [movie(1, 'A')] }} query="" />)
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
})

test('falha no fetch mostra "Erro ao carregar mais filmes." e mantém o botão', async () => {
  mockFetchJson({ error: 'Falha ao buscar filmes' }, 502)
  render(<MovieGrid initial={{ page: 1, totalPages: 2, results: [movie(1, 'A')] }} query="" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(await screen.findByText('Erro ao carregar mais filmes.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Carregar mais' })).toBeInTheDocument()
})

test('lista vazia mostra "Nenhum filme encontrado."', () => {
  render(<MovieGrid initial={{ page: 1, totalPages: 0, results: [] }} query="" />)
  expect(screen.getByText('Nenhum filme encontrado.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
})
