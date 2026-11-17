import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: () => '/serie/5',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}))

import Loading from './loading'

test('carregamento mantém o menu e não desenha o banner', () => {
  const { container } = render(<Loading />)
  expect(screen.getByRole('navigation', { name: 'Filmes ou séries' })).toBeInTheDocument()
  expect(screen.getByText('Carregando…')).toBeInTheDocument()
  expect(container.querySelector('[class*="h-[75vh]"]')).toBeNull()
})
