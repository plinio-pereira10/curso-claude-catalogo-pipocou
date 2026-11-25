import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from './PasswordInput'

function renderField() {
  render(
    <form>
      <label>
        <span>Senha</span>
        <PasswordInput name="password" />
      </label>
    </form>,
  )
}

test('PasswordInput começa escondida e o botão mostra e esconde a senha', async () => {
  renderField()
  const input = screen.getByLabelText('Senha')
  expect(input).toHaveAttribute('type', 'password')

  const button = screen.getByRole('button', { name: 'Mostrar senha' })
  expect(button).toHaveAttribute('aria-pressed', 'false')

  await userEvent.click(button)
  expect(input).toHaveAttribute('type', 'text')
  expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute('aria-pressed', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }))
  expect(input).toHaveAttribute('type', 'password')
})

test('PasswordInput: o botão não envia o formulário e o texto digitado continua', async () => {
  const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault())
  renderField()
  document.querySelector('form')!.addEventListener('submit', onSubmit)

  const input = screen.getByLabelText('Senha')
  await userEvent.type(input, 'abc123')
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))

  expect(onSubmit).not.toHaveBeenCalled()
  expect(input).toHaveValue('abc123')
})
