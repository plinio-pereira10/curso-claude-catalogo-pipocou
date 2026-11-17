import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TitleGrid } from './TitleGrid'
import type { TitleSummary } from '@/lib/tmdb/types'

const fetchMock = vi.fn()

function item(id: number, title: string): TitleSummary {
  return { id, title, posterPath: null, backdropPath: null, overview: '', releaseYear: 2024, voteAverage: 7 }
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
  mockFetchJson({ page: 2, totalPages: 2, results: [item(2, 'B')] })
  render(<TitleGrid type="movie" initial={{ page: 1, totalPages: 2, results: [item(1, 'A')] }} query="provider=8" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(String(fetchMock.mock.calls[0][0])).toBe('/api/titles?type=movie&provider=8&page=2')
  expect((await screen.findAllByText('B')).length).toBeGreaterThan(0)
  expect(screen.getAllByText('A').length).toBeGreaterThan(0)
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
})

test('séries pedem /api/titles com type=tv', async () => {
  mockFetchJson({ page: 2, totalPages: 2, results: [] })
  render(<TitleGrid type="tv" initial={{ page: 1, totalPages: 2, results: [item(1, 'A')] }} query="provider=8" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(String(fetchMock.mock.calls[0][0])).toBe('/api/titles?type=tv&provider=8&page=2')
})

test('sem query monta a URL só com tipo e página', async () => {
  mockFetchJson({ page: 2, totalPages: 3, results: [] })
  render(<TitleGrid type="movie" initial={{ page: 1, totalPages: 3, results: [item(1, 'A')] }} query="" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(String(fetchMock.mock.calls[0][0])).toBe('/api/titles?type=movie&page=2')
})

test('ignora títulos repetidos ao juntar páginas', async () => {
  mockFetchJson({ page: 2, totalPages: 3, results: [item(1, 'A'), item(3, 'C')] })
  render(<TitleGrid type="movie" initial={{ page: 1, totalPages: 3, results: [item(1, 'A')] }} query="" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  await screen.findAllByText('C')
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

test('sem mais páginas não mostra o botão', () => {
  render(<TitleGrid type="movie" initial={{ page: 1, totalPages: 1, results: [item(1, 'A')] }} query="" />)
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
})

test('falha no fetch mostra erro e mantém o botão', async () => {
  mockFetchJson({ error: 'Falha ao buscar títulos' }, 502)
  render(<TitleGrid type="movie" initial={{ page: 1, totalPages: 2, results: [item(1, 'A')] }} query="" />)
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
  expect(await screen.findByText('Erro ao carregar mais títulos.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Carregar mais' })).toBeInTheDocument()
})

test('lista vazia de filmes mostra "Nenhum filme encontrado."', () => {
  render(<TitleGrid type="movie" initial={{ page: 1, totalPages: 0, results: [] }} query="" />)
  expect(screen.getByText('Nenhum filme encontrado.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull()
})

test('lista vazia de séries mostra "Nenhuma série encontrada."', () => {
  render(<TitleGrid type="tv" initial={{ page: 1, totalPages: 0, results: [] }} query="" />)
  expect(screen.getByText('Nenhuma série encontrada.')).toBeInTheDocument()
})
