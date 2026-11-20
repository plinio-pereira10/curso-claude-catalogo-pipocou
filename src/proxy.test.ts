import { NextRequest } from 'next/server'

const { createServerClient } = vi.hoisted(() => ({ createServerClient: vi.fn() }))
vi.mock('@supabase/ssr', () => ({ createServerClient }))

import { proxy } from './proxy'

beforeEach(() => {
  createServerClient.mockReset()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

/** Simula o Supabase renovando a sessão: grava um cookie e pede cabeçalhos "não guarde em cache". */
function supabaseThatRefreshes() {
  createServerClient.mockImplementation((_url, _key, options) => ({
    auth: {
      getUser: async () => {
        options.cookies.setAll([{ name: 'sb-token', value: 'novo', options: { path: '/' } }], {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
          Expires: '0',
          Pragma: 'no-cache',
        })
        return { data: { user: null }, error: null }
      },
    },
  }))
}

test('ao renovar a sessão, grava o cookie e proíbe cache da resposta', async () => {
  supabaseThatRefreshes()
  const response = await proxy(new NextRequest('http://localhost/series'))
  expect(response.cookies.get('sb-token')?.value).toBe('novo')
  expect(response.headers.get('Cache-Control')).toBe('private, no-cache, no-store, must-revalidate, max-age=0')
  expect(response.headers.get('Expires')).toBe('0')
  expect(response.headers.get('Pragma')).toBe('no-cache')
})

test('sem variáveis do Supabase não chama o Supabase', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
  const response = await proxy(new NextRequest('http://localhost/'))
  expect(createServerClient).not.toHaveBeenCalled()
  expect(response.status).toBe(200)
})

test('Supabase fora do ar não derruba a página', async () => {
  createServerClient.mockImplementation(() => ({
    auth: { getUser: async () => Promise.reject(new TypeError('fetch failed')) },
  }))
  const response = await proxy(new NextRequest('http://localhost/'))
  expect(response.status).toBe(200)
})
