vi.mock('server-only', () => ({}))

const { getUser, createSupabaseServerClient } = vi.hoisted(() => {
  const getUser = vi.fn()
  return { getUser, createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser } })) }
})
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient }))

import { getCurrentUser } from './auth'

beforeEach(() => {
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
