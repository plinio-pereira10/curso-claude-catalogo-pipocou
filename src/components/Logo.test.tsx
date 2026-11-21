import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'

test('Logo é o link para o início com o nome Pipocou e a pipoca no "i"', () => {
  const { container } = render(<Logo />)
  const link = screen.getByRole('link', { name: 'Pipocou' })
  expect(link).toHaveAttribute('href', '/')
  const kernel = container.querySelector('svg[data-pipoca]')
  expect(kernel).not.toBeNull()
  expect(kernel).toHaveAttribute('aria-hidden', 'true')
})
