vi.mock('server-only', () => ({}))

const { getUser, createSupabaseServerClient } = vi.hoisted(() => {
  const getUser = vi.fn()
  return { getUser, createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser } })) }
})
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient }))

// O `cache` do React só guarda respostas no servidor de verdade; aqui, uma versão que guarda
// e pode ser zerada entre os testes (como se cada teste fosse uma página nova).
const { resetters } = vi.hoisted(() => ({ resetters: [] as (() => void)[] }))
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T,>(fn: () => T) => {
    let stored: { value: T } | null = null
    resetters.push(() => (stored = null))
    return () => (stored ??= { value: fn() }).value
  },
}))

import { getCurrentUser, lookupCurrentUser } from './auth'

beforeEach(() => {
  for (const reset of resetters) reset()
  getUser.mockReset()
  createSupabaseServerClient.mockClear()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

test('getCurrentUser devolve id, e-mail e inicial maiúscula', async () => {
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'plinio@x.com' } }, error: null })
  await expect(getCurrentUser()).resolves.toEqual({ id: 'u1', email: 'plinio@x.com', initial: 'P' })
})

test('sem sessão devolve null', async () => {
  getUser.mockResolvedValue({ data: { user: null }, error: null })
  await expect(getCurrentUser()).resolves.toBeNull()
})

test('erro do Supabase devolve null', async () => {
  getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth session missing!' } })
  await expect(getCurrentUser()).resolves.toBeNull()
  getUser.mockRejectedValue(new TypeError('fetch failed'))
  await expect(getCurrentUser()).resolves.toBeNull()
})

test('variáveis ausentes devolve null sem chamar o Supabase', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
  await expect(getCurrentUser()).resolves.toBeNull()
  expect(createSupabaseServerClient).not.toHaveBeenCalled()
})

test('cancelamento da pré-renderização do Next volta para o Next (não vira "sem login")', async () => {
  const prerenderAbort = Object.assign(new Error('During prerendering, `cookies()` rejects...'), {
    digest: 'HANGING_PROMISE_REJECTION',
  })
  createSupabaseServerClient.mockRejectedValueOnce(prerenderAbort)
  await expect(getCurrentUser()).rejects.toBe(prerenderAbort)
  expect(console.error).not.toHaveBeenCalled()
})

test('consulta o Supabase uma vez só durante a montagem da página', async () => {
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'plinio@x.com' } }, error: null })
  await Promise.all([getCurrentUser(), getCurrentUser(), lookupCurrentUser()])
  expect(getUser).toHaveBeenCalledTimes(1)
})

test('lookupCurrentUser diferencia "ninguém logado" de "Supabase fora do ar"', async () => {
  getUser.mockResolvedValue({ data: { user: null }, error: { name: 'AuthSessionMissingError', message: 'Auth session missing!' } })
  await expect(lookupCurrentUser()).resolves.toEqual({ user: null, failed: false })
})

test('lookupCurrentUser marca falha quando o Supabase não responde', async () => {
  getUser.mockResolvedValue({ data: { user: null }, error: { name: 'AuthRetryableFetchError', message: 'fetch failed' } })
  await expect(lookupCurrentUser()).resolves.toEqual({ user: null, failed: true })
})

test('lookupCurrentUser marca falha quando a chamada lança erro', async () => {
  getUser.mockRejectedValue(new TypeError('fetch failed'))
  await expect(lookupCurrentUser()).resolves.toEqual({ user: null, failed: true })
})
