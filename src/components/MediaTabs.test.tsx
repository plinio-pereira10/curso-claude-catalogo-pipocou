import { render, screen } from '@testing-library/react'

let pathname = '/'
let search = ''
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(search),
}))

import { MediaTabs } from './MediaTabs'

function mockPath(p: string, s = '') {
  pathname = p
  search = s
}

test('MediaTabs marca Séries em /serie/5 e leva filtros', () => {
  mockPath('/serie/5', 'provider=8&doramas=1&genre=35')
  render(<MediaTabs />)
  expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Filmes' })).not.toHaveAttribute('aria-current')
  expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute('href', '/?provider=8&doramas=1')
  expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute('href', '/series?provider=8&doramas=1')
})

test('MediaTabs marca Filmes em / e em /filme/7', () => {
  mockPath('/', '')
  const { unmount } = render(<MediaTabs />)
  expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute('href', '/series')
  unmount()
  mockPath('/filme/7', '')
  render(<MediaTabs />)
  expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute('aria-current', 'page')
})

test('MediaTabs marca Séries em /series', () => {
  mockPath('/series', 'q=round')
  render(<MediaTabs />)
  expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute('href', '/')
})
