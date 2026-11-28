import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/app/actions/auth', () => ({ signOut: vi.fn() }))

import { AccountMenu } from './AccountMenu'

function abrir() {
  render(<AccountMenu initial="P" email="plinio@x.com" />)
  return screen.getByRole('button', { name: 'Menu da conta' })
}

test('AccountMenu abre e mostra Minhas listas e Sair', async () => {
  const botao = abrir()
  expect(botao).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(botao)
  expect(botao).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('link', { name: 'Minhas listas' })).toHaveAttribute('href', '/minhas-listas')
  expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  expect(screen.getByText('plinio@x.com')).toBeInTheDocument()
})

test('AccountMenu fecha com Esc, com clique fora e ao escolher uma opção', async () => {
  const botao = abrir()

  await userEvent.click(botao)
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('link', { name: 'Minhas listas' })).toBeNull()

  await userEvent.click(botao)
  await userEvent.click(document.body)
  expect(screen.queryByRole('link', { name: 'Minhas listas' })).toBeNull()

  await userEvent.click(botao)
  await userEvent.click(screen.getByRole('link', { name: 'Minhas listas' }))
  expect(screen.queryByRole('link', { name: 'Minhas listas' })).toBeNull()
})

test('AccountMenu devolve o foco ao círculo ao fechar com Esc', async () => {
  const botao = abrir()
  await userEvent.click(botao)
  screen.getByRole('link', { name: 'Minhas listas' }).focus()
  await userEvent.keyboard('{Escape}')
  expect(botao).toHaveFocus()
})

test('AccountMenu aponta o botão para o menu (aria-controls) quando aberto', async () => {
  const botao = abrir()
  await userEvent.click(botao)
  const menu = document.getElementById(botao.getAttribute('aria-controls') ?? '')
  expect(menu).not.toBeNull()
  expect(menu).toContainElement(screen.getByRole('link', { name: 'Minhas listas' }))
})
