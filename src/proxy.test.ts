import { NextRequest } from 'next/server'

const { createServerClient } = vi.hoisted(() => ({ createServerClient: vi.fn() }))
vi.mock('@supabase/ssr', () => ({ createServerClient }))

import { config, proxy } from './proxy'
import { supabaseFetch } from '@/lib/supabase/env'

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

test('cliente do proxy usa cookie protegido e o fetch com tempo-limite', async () => {
  supabaseThatRefreshes()
  await proxy(new NextRequest('http://localhost/'))
  const options = createServerClient.mock.calls[0][2]
  expect(options.cookieOptions).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
  expect(options.global.fetch).toBe(supabaseFetch)
})

test('matcher do proxy não inclui /api', () => {
  expect(config.matcher[0]).toContain('api/')
  const pattern = new RegExp(`^${config.matcher[0]}$`)
  expect(pattern.test('/api/titles')).toBe(false)
  expect(pattern.test('/series')).toBe(true)
  expect(pattern.test('/serie/93405')).toBe(true)
})

test('Supabase travado não segura a página por mais de 5 s', async () => {
  vi.useFakeTimers()
  try {
    createServerClient.mockImplementation(() => ({ auth: { getUser: () => new Promise(() => {}) } }))
    const result = proxy(new NextRequest('http://localhost/series'))
    await vi.advanceTimersByTimeAsync(5000)
    expect((await result).status).toBe(200)
  } finally {
    vi.useRealTimers()
  }
})
