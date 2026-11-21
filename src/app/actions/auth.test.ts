vi.mock('server-only', () => ({}))

const { auth, redirect, requestHeaders } = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  // como o redirect de verdade, interrompe a função lançando um erro
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
  requestHeaders: new Map<string, string>(),
}))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ auth }) }))
vi.mock('next/headers', () => ({ headers: async () => ({ get: (name: string) => requestHeaders.get(name) ?? null }) }))
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  redirect,
}))

import { requestPasswordReset, signIn, signOut, signUp, updatePassword } from './auth'

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

// ---- Esqueci minha senha ----

const NEUTRAL = 'Se existir uma conta com esse e-mail, enviamos um link para criar uma senha nova.'
const LINK_EXPIRED = 'Este link não vale mais. Peça um novo abaixo.'

test('requestPasswordReset chama o Supabase com redirectTo da origem e devolve a mensagem neutra', async () => {
  requestHeaders.clear()
  requestHeaders.set('host', 'curso-claude-code-chi.vercel.app')
  requestHeaders.set('x-forwarded-proto', 'https')
  auth.resetPasswordForEmail.mockResolvedValue({ error: null })
  await expect(requestPasswordReset({ error: null, sent: false }, form({ email: ' p@x.com ' }))).resolves.toEqual({
    error: null,
    sent: true,
  })
  expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('p@x.com', {
    redirectTo: 'https://curso-claude-code-chi.vercel.app/auth/confirm',
  })
})

test('requestPasswordReset no localhost usa http', async () => {
  requestHeaders.clear()
  requestHeaders.set('host', 'localhost:3000')
  auth.resetPasswordForEmail.mockResolvedValue({ error: null })
  await requestPasswordReset({ error: null, sent: false }, form({ email: 'p@x.com' }))
  expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('p@x.com', { redirectTo: 'http://localhost:3000/auth/confirm' })
})

test('requestPasswordReset com e-mail inválido avisa sem chamar o Supabase', async () => {
  await expect(requestPasswordReset({ error: null, sent: false }, form({ email: 'p' }))).resolves.toEqual({
    error: 'Informe um e-mail válido.',
    sent: false,
  })
  expect(auth.resetPasswordForEmail).not.toHaveBeenCalled()
})

test('requestPasswordReset com erro do Supabase (exceto limite) devolve a mesma mensagem neutra', async () => {
  requestHeaders.clear()
  requestHeaders.set('host', 'localhost:3000')
  for (const code of ['email_address_not_authorized', 'user_not_found']) {
    auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { code } })
    await expect(requestPasswordReset({ error: null, sent: false }, form({ email: 'p@x.com' }))).resolves.toEqual({
      error: null,
      sent: true,
    })
  }
  expect(NEUTRAL).toBeTruthy()
})

test('requestPasswordReset com limite atingido avisa para esperar', async () => {
  requestHeaders.clear()
  requestHeaders.set('host', 'localhost:3000')
  auth.resetPasswordForEmail.mockResolvedValue({ error: { code: 'over_email_send_rate_limit', status: 429 } })
  await expect(requestPasswordReset({ error: null, sent: false }, form({ email: 'p@x.com' }))).resolves.toEqual({
    error: 'Muitos pedidos. Espere alguns minutos e tente de novo.',
    sent: false,
  })
})

test('updatePassword sem sessão orienta a pedir novo link', async () => {
  auth.updateUser.mockResolvedValue({ error: { name: 'AuthSessionMissingError', message: 'Auth session missing!' } })
  await expect(updatePassword({ error: null }, form({ password: 'nova123' }))).resolves.toEqual({ error: LINK_EXPIRED })
})

test('updatePassword com senha curta não chama o Supabase', async () => {
  await expect(updatePassword({ error: null }, form({ password: '123' }))).resolves.toEqual({
    error: 'A senha precisa ter pelo menos 6 caracteres.',
  })
  expect(auth.updateUser).not.toHaveBeenCalled()
})

test('updatePassword igual à atual avisa', async () => {
  auth.updateUser.mockResolvedValue({ error: { code: 'same_password' } })
  await expect(updatePassword({ error: null }, form({ password: 'senha123' }))).resolves.toEqual({
    error: 'A senha nova precisa ser diferente da atual.',
  })
})

test('updatePassword com sucesso vai para a página inicial', async () => {
  auth.updateUser.mockResolvedValue({ error: null })
  await expect(updatePassword({ error: null }, form({ password: 'nova123' }))).rejects.toThrow('REDIRECT:/')
  expect(auth.updateUser).toHaveBeenCalledWith({ password: 'nova123' })
})
