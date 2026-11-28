import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FiltersPanel } from './FiltersPanel'

test('FiltersPanel abre e fecha o painel', async () => {
  render(
    <FiltersPanel count={0} disabled={false}>
      <p>selects</p>
    </FiltersPanel>,
  )
  const botao = screen.getByRole('button', { name: 'Filtros' })
  const painel = document.getElementById(botao.getAttribute('aria-controls')!)!
  expect(botao).toHaveAttribute('aria-expanded', 'false')
  expect(painel).toHaveClass('hidden')
  await userEvent.click(botao)
  expect(botao).toHaveAttribute('aria-expanded', 'true')
  expect(painel).not.toHaveClass('hidden')
  await userEvent.click(botao)
  expect(painel).toHaveClass('hidden')
})

test('FiltersPanel mostra quantos filtros estão ativos', () => {
  const { rerender } = render(
    <FiltersPanel count={2} disabled={false}>
      <p>selects</p>
    </FiltersPanel>,
  )
  expect(screen.getByRole('button', { name: 'Filtros (2)' })).toBeInTheDocument()
  rerender(
    <FiltersPanel count={0} disabled={false}>
      <p>selects</p>
    </FiltersPanel>,
  )
  expect(screen.getByRole('button', { name: 'Filtros' })).toBeInTheDocument()
})

test('FiltersPanel desligado durante a busca', () => {
  render(
    <FiltersPanel count={0} disabled>
      <p>selects</p>
    </FiltersPanel>,
  )
  expect(screen.getByRole('button', { name: 'Filtros' })).toBeDisabled()
})

test('FiltersPanel fecha o painel quando uma busca começa', async () => {
  const { rerender } = render(
    <FiltersPanel count={0} disabled={false}>
      <p>selects</p>
    </FiltersPanel>,
  )
  const botao = screen.getByRole('button', { name: 'Filtros' })
  const painel = document.getElementById(botao.getAttribute('aria-controls')!)!
  await userEvent.click(botao)
  expect(painel).not.toHaveClass('hidden')
  rerender(
    <FiltersPanel count={0} disabled>
      <p>selects</p>
    </FiltersPanel>,
  )
  expect(painel).toHaveClass('hidden')
  expect(botao).toHaveAttribute('aria-expanded', 'false')
})
