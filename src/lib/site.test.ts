import { pageTitle, SITE_NAME } from './site'

test('nome do site e títulos das páginas', () => {
  expect(SITE_NAME).toBe('Pipocou')
  expect(pageTitle('Séries')).toBe('Séries — Pipocou')
  expect(pageTitle('Round 6')).toBe('Round 6 — Pipocou')
})
