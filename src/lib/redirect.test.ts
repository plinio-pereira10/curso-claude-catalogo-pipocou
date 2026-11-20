import { safeRedirectPath } from './redirect'

test('safeRedirectPath aceita caminhos internos', () => {
  expect(safeRedirectPath('/serie/5')).toBe('/serie/5')
  expect(safeRedirectPath('/series?doramas=1&nota=8')).toBe('/series?doramas=1&nota=8')
  expect(safeRedirectPath('/')).toBe('/')
})

test('safeRedirectPath recusa externos e vazios', () => {
  for (const bad of ['https://site-mal.com', '//site-mal.com', '/\\site-mal.com', 'site-mal.com', 'javascript:alert(1)', '', null, undefined]) {
    expect(safeRedirectPath(bad)).toBe('/')
  }
})

test('safeRedirectPath recusa caminhos com quebra de linha ou controle', () => {
  expect(safeRedirectPath('/ok\r\nSet-Cookie: x')).toBe('/')
  expect(safeRedirectPath('/\t/site-mal.com')).toBe('/')
})
