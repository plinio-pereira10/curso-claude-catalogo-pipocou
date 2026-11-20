import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { setMark, push } = vi.hoisted(() => ({ setMark: vi.fn(), push: vi.fn() }))
vi.mock('@/app/actions/marks', () => ({ setMark }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { MarkButtons } from './MarkButtons'

const snapshot = { title: 'Round 6', posterPath: null, backdropPath: '/b.jpg', releaseYear: 2021, voteAverage: 7.9 }
const base = { type: 'tv' as const, tmdbId: 93405, snapshot, returnPath: '/serie/93405' }

beforeEach(() => {
  setMark.mockReset()
  push.mockReset()
})

test('MarkButtons sem login são links para entrar com voltar', () => {
  render(<MarkButtons {...base} initialStatus={null} loggedIn={false} />)
  for (const name of ['Quero assistir', 'Já assisti']) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', '/entrar?voltar=%2Fserie%2F93405')
  }
  expect(screen.queryByRole('button')).toBeNull()
})

test('MarkButtons marca, troca de lista e desmarca', async () => {
  setMark.mockResolvedValue({ ok: true })
  render(<MarkButtons {...base} initialStatus={null} loggedIn />)
  const want = screen.getByRole('button', { name: 'Quero assistir' })
  const watched = screen.getByRole('button', { name: 'Já assisti' })
  expect(want).toHaveAttribute('aria-pressed', 'false')

  await userEvent.click(want)
  expect(setMark).toHaveBeenLastCalledWith({ mediaType: 'tv', tmdbId: 93405, status: 'want', snapshot })
  expect(want).toHaveAttribute('aria-pressed', 'true')

  await userEvent.click(watched)
  expect(setMark).toHaveBeenLastCalledWith({ mediaType: 'tv', tmdbId: 93405, status: 'watched', snapshot })
  expect(watched).toHaveAttribute('aria-pressed', 'true')
  expect(want).toHaveAttribute('aria-pressed', 'false')

  await userEvent.click(watched)
  expect(setMark).toHaveBeenLastCalledWith({ mediaType: 'tv', tmdbId: 93405, status: null, snapshot })
  expect(watched).toHaveAttribute('aria-pressed', 'false')
})

test('MarkButtons desativa enquanto grava e mostra erro se falhar', async () => {
  let finish: (v: unknown) => void = () => {}
  setMark.mockReturnValue(new Promise((resolve) => (finish = resolve)))
  render(<MarkButtons {...base} initialStatus="want" loggedIn />)
  await userEvent.click(screen.getByRole('button', { name: 'Já assisti' }))
  expect(screen.getByRole('button', { name: 'Quero assistir' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Já assisti' })).toBeDisabled()

  // espera o React terminar de processar a resposta (não depende de tempo de espera)
  await act(async () => finish({ ok: false, reason: 'erro' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível conectar. Tente de novo.')
  // continua como estava antes do clique
  expect(screen.getByRole('button', { name: 'Quero assistir' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Quero assistir' })).toBeEnabled()
})

test('MarkButtons com sessão vencida leva para entrar', async () => {
  setMark.mockResolvedValue({ ok: false, reason: 'login' })
  render(<MarkButtons {...base} initialStatus={null} loggedIn />)
  await userEvent.click(screen.getByRole('button', { name: 'Quero assistir' }))
  expect(push).toHaveBeenCalledWith('/entrar?voltar=%2Fserie%2F93405')
})
