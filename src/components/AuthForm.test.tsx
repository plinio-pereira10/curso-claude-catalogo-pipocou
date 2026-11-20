import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { signIn, signUp } = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }))
vi.mock('@/app/actions/auth', () => ({ signIn, signUp }))

import { AuthForm } from './AuthForm'

test('AuthForm entrar mostra e-mail, senha, botão, link para criar conta e campo voltar', () => {
  const { container } = render(<AuthForm mode="entrar" voltar="/serie/5" />)
  expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
  expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/criar-conta?voltar=%2Fserie%2F5')
  expect(container.querySelector('input[name="voltar"]')).toHaveValue('/serie/5')
})

test('AuthForm criar conta mostra o botão certo e link para entrar', () => {
  render(<AuthForm mode="criar-conta" voltar="/" />)
  expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/entrar')
  expect(screen.getByText(/pelo menos 6 caracteres/)).toBeInTheDocument()
})

test('AuthForm envia e mostra a mensagem de erro devolvida', async () => {
  signIn.mockResolvedValue({ error: 'E-mail ou senha incorretos.' })
  render(<AuthForm mode="entrar" voltar="/" />)
  await userEvent.type(screen.getByLabelText('E-mail'), 'p@x.com')
  await userEvent.type(screen.getByLabelText('Senha'), '123456')
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.')
  const sent = signIn.mock.calls[0][1] as FormData
  expect(sent.get('email')).toBe('p@x.com')
  expect(sent.get('voltar')).toBe('/')
})
