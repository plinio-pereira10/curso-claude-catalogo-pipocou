import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const push = vi.fn()
const back = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, back }) }))

beforeEach(() => {
  push.mockReset()
  back.mockReset()
  // cada teste começa com o histórico de visitas zerado (como uma aba nova)
  vi.resetModules()
})

async function load() {
  const history = await import('@/lib/navigation-history')
  const { BackButton } = await import('./BackButton')
  return { ...history, BackButton }
}

test('BackButton volta quando já passou por outra página do site', async () => {
  const { recordVisit, BackButton } = await load()
  recordVisit('/series')
  recordVisit('/serie/5')
  render(<BackButton type="tv" />)
  await userEvent.click(screen.getByRole('button', { name: '← voltar' }))
  expect(back).toHaveBeenCalled()
  expect(push).not.toHaveBeenCalled()
})

test('BackButton vai para /series quando a série foi a primeira página aberta', async () => {
  const { recordVisit, BackButton } = await load()
  recordVisit('/serie/5')
  render(<BackButton type="tv" />)
  await userEvent.click(screen.getByRole('button', { name: '← voltar' }))
  expect(push).toHaveBeenCalledWith('/series')
  expect(back).not.toHaveBeenCalled()
})

test('BackButton vai para / (Filmes) quando o filme foi a primeira página aberta', async () => {
  const { recordVisit, BackButton } = await load()
  recordVisit('/filme/7')
  render(<BackButton type="movie" />)
  await userEvent.click(screen.getByRole('button', { name: '← voltar' }))
  expect(push).toHaveBeenCalledWith('/')
})

test('visitar a mesma página de novo não conta como outra página', async () => {
  const { recordVisit, hasInAppHistory } = await load()
  recordVisit('/filme/7')
  recordVisit('/filme/7')
  expect(hasInAppHistory()).toBe(false)
})

test('de volta à primeira página aberta (pelo voltar do navegador), vai para a lista', async () => {
  const { recordVisit, BackButton } = await load()
  recordVisit('/serie/5') // abriu pelo WhatsApp
  recordVisit('/series') // clicou na aba Séries
  recordVisit('/serie/5') // voltou com o botão do navegador
  render(<BackButton type="tv" />)
  await userEvent.click(screen.getByRole('button', { name: '← voltar' }))
  expect(push).toHaveBeenCalledWith('/series')
  expect(back).not.toHaveBeenCalled()
})
