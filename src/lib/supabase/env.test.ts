import { SESSION_COOKIE_OPTIONS, SUPABASE_TIMEOUT_MS, TIMED_OUT, supabaseFetch, withTimeout } from './env'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test('cookie de sessão protegido', () => {
  expect(SESSION_COOKIE_OPTIONS).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
  expect(SUPABASE_TIMEOUT_MS).toBe(5000)
})

test('supabaseFetch desiste depois de 5 s', async () => {
  // fetch que nunca responde, mas desiste quando o pedido é cancelado (como o fetch real)
  fetchMock.mockImplementation(
    (_url: unknown, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
      }),
  )
  const result = supabaseFetch('https://exemplo.supabase.co/auth/v1/user').catch((e: Error) => e)
  await vi.advanceTimersByTimeAsync(4999)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  const error = await result
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).message).toBe('tempo esgotado (5 s)')
})

test('supabaseFetch repassa a resposta normal e limpa o timer', async () => {
  fetchMock.mockResolvedValue(new Response('{}', { status: 200 }))
  const response = await supabaseFetch('https://exemplo.supabase.co/rest/v1/user_titles', { method: 'GET' })
  expect(response.status).toBe(200)
  expect(fetchMock.mock.calls[0][1].method).toBe('GET')
  expect(vi.getTimerCount()).toBe(0)
})

test('supabaseFetch respeita um cancelamento vindo de quem chamou', async () => {
  fetchMock.mockImplementation(
    (_url: unknown, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
      }),
  )
  const controller = new AbortController()
  const result = supabaseFetch('https://exemplo.supabase.co/x', { signal: controller.signal }).catch((e: Error) => e)
  controller.abort(new Error('cancelado'))
  expect(((await result) as Error).message).toBe('cancelado')
})

test('withTimeout devolve o resultado quando chega a tempo', async () => {
  await expect(withTimeout(Promise.resolve('ok'), 5000)).resolves.toBe('ok')
  expect(vi.getTimerCount()).toBe(0)
})

test('withTimeout desiste no tempo total, mesmo que a tarefa continue', async () => {
  const result = withTimeout(new Promise(() => {}), 5000)
  await vi.advanceTimersByTimeAsync(5000)
  await expect(result).resolves.toBe(TIMED_OUT)
})
