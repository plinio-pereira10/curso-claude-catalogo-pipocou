vi.mock('server-only', () => ({}))

const { auth, redirect } = vi.hoisted(() => ({
  auth: { signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn() },
  // como o redirect de verdade, interrompe a função lançando um erro
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
}))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ auth }) }))
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  redirect,
}))

import { signIn, signOut, signUp } from './auth'

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

test('signIn com sucesso volta para o endereço seguro', async () => {
  auth.signInWithPassword.mockResolvedValue({ error: null })
  await expect(signIn({ error: null }, form({ email: 'p@x.com', password: '123456', voltar: '/serie/5' }))).rejects.toThrow(
    'REDIRECT:/serie/5',
  )
  expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'p@x.com', password: '123456' })
})

test('signIn com voltar externo vai para /', async () => {
  auth.signInWithPassword.mockResolvedValue({ error: null })
  await expect(
    signIn({ error: null }, form({ email: 'p@x.com', password: '123456', voltar: 'https://site-mal.com' })),
  ).rejects.toThrow('REDIRECT:/')
})

test('signIn com senha errada devolve a mensagem', async () => {
  auth.signInWithPassword.mockResolvedValue({ error: { code: 'invalid_credentials' } })
  await expect(signIn({ error: null }, form({ email: 'p@x.com', password: '123456' }))).resolves.toEqual({
    error: 'E-mail ou senha incorretos.',
  })
})

test('signIn valida antes de chamar o Supabase', async () => {
  await expect(signIn({ error: null }, form({ email: 'p', password: '123456' }))).resolves.toEqual({
    error: 'Informe um e-mail válido.',
  })
  expect(auth.signInWithPassword).not.toHaveBeenCalled()
})

test('signIn com Supabase fora do ar mostra erro de conexão', async () => {
  auth.signInWithPassword.mockRejectedValue(new TypeError('fetch failed'))
  await expect(signIn({ error: null }, form({ email: 'p@x.com', password: '123456' }))).resolves.toEqual({
    error: 'Não foi possível conectar. Tente de novo.',
  })
})

test('signUp com e-mail já cadastrado devolve a mensagem', async () => {
  auth.signUp.mockResolvedValue({ data: { session: null }, error: { code: 'user_already_exists' } })
  await expect(signUp({ error: null }, form({ email: 'p@x.com', password: '123456' }))).resolves.toEqual({
    error: 'Este e-mail já tem uma conta.',
  })
})

test('signUp com senha curta não chama o Supabase', async () => {
  await expect(signUp({ error: null }, form({ email: 'p@x.com', password: '123' }))).resolves.toEqual({
    error: 'A senha precisa ter pelo menos 6 caracteres.',
  })
  expect(auth.signUp).not.toHaveBeenCalled()
})

test('signUp com sucesso já entra e volta', async () => {
  auth.signUp.mockResolvedValue({ data: { session: { access_token: 't' } }, error: null })
  await expect(signUp({ error: null }, form({ email: 'p@x.com', password: '123456', voltar: '/series' }))).rejects.toThrow(
    'REDIRECT:/series',
  )
})

test('signOut sai e vai para a página inicial', async () => {
  auth.signOut.mockResolvedValue({ error: null })
  await expect(signOut()).rejects.toThrow('REDIRECT:/')
  expect(auth.signOut).toHaveBeenCalled()
})
