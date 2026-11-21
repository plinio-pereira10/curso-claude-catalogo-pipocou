import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { requestPasswordReset, updatePassword } = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
}))
vi.mock('@/app/actions/auth', () => ({ requestPasswordReset, updatePassword }))

import { ForgotPasswordForm, NewPasswordForm } from './PasswordForms'

beforeEach(() => {
  requestPasswordReset.mockReset()
  updatePassword.mockReset()
})

test('ForgotPasswordForm envia o e-mail e mostra a mensagem neutra', async () => {
  requestPasswordReset.mockResolvedValue({ error: null, sent: true })
  render(<ForgotPasswordForm linkExpired={false} />)
  await userEvent.type(screen.getByLabelText('E-mail'), 'p@x.com')
  await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }))
  expect(
    await screen.findByText('Se existir uma conta com esse e-mail, enviamos um link para criar uma senha nova.'),
  ).toBeInTheDocument()
  expect((requestPasswordReset.mock.calls[0][1] as FormData).get('email')).toBe('p@x.com')
})

test('ForgotPasswordForm mostra o erro devolvido', async () => {
  requestPasswordReset.mockResolvedValue({ error: 'Muitos pedidos. Espere alguns minutos e tente de novo.', sent: false })
  render(<ForgotPasswordForm linkExpired={false} />)
  await userEvent.type(screen.getByLabelText('E-mail'), 'p@x.com')
  await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Muitos pedidos. Espere alguns minutos e tente de novo.')
})

test('ForgotPasswordForm mostra a mensagem do link vencido quando pedido', () => {
  render(<ForgotPasswordForm linkExpired />)
  expect(screen.getByRole('alert')).toHaveTextContent('Este link não vale mais. Peça um novo abaixo.')
})

test('NewPasswordForm envia a senha e mostra erro devolvido', async () => {
  updatePassword.mockResolvedValue({ error: 'Este link não vale mais. Peça um novo abaixo.' })
  render(<NewPasswordForm />)
  await userEvent.type(screen.getByLabelText('Nova senha'), 'nova123')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar senha' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Este link não vale mais.')
  expect(screen.getByRole('link', { name: 'Pedir um novo link' })).toHaveAttribute('href', '/esqueci-senha')
  expect((updatePassword.mock.calls[0][1] as FormData).get('password')).toBe('nova123')
})
