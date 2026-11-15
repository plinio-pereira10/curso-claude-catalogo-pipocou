vi.mock('server-only', () => ({}))

import { tmdbFetch, TmdbError } from './client'

const fetchMock = vi.fn()

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('TMDB_READ_TOKEN', 'tok')
  vi.useFakeTimers()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

/** Roda o pedido avançando o relógio falso pelas esperas entre tentativas. */
async function run<T>(promise: Promise<T>): Promise<T> {
  const settled = promise.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error }),
  )
  await vi.runAllTimersAsync()
  const result = await settled
  if (result.ok) return result.value
  throw result.error
}

test('falha de conexão e depois sucesso → devolve o resultado', async () => {
  fetchMock.mockRejectedValueOnce(new TypeError('fetch failed')).mockResolvedValueOnce(json({ ok: 1 }))
  await expect(run(tmdbFetch('/x'))).resolves.toEqual({ ok: 1 })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('três falhas de conexão → lança o erro, 3 chamadas', async () => {
  fetchMock.mockRejectedValue(new TypeError('fetch failed'))
  await expect(run(tmdbFetch('/x'))).rejects.toThrow('fetch failed')
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

test('503 e depois 200 → tenta de novo', async () => {
  fetchMock.mockResolvedValueOnce(json({}, 503)).mockResolvedValueOnce(json({ ok: 1 }))
  await expect(run(tmdbFetch('/x'))).resolves.toEqual({ ok: 1 })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('429 e depois 200 → tenta de novo', async () => {
  fetchMock.mockResolvedValueOnce(json({}, 429)).mockResolvedValueOnce(json({ ok: 1 }))
  await expect(run(tmdbFetch('/x'))).resolves.toEqual({ ok: 1 })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('404 → não tenta de novo e lança TmdbError 404', async () => {
  fetchMock.mockResolvedValue(json({}, 404))
  const err = await run(tmdbFetch<never>('/x')).catch((e: TmdbError) => e)
  expect(err).toBeInstanceOf(TmdbError)
  expect(err.status).toBe(404)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('três respostas 500 → lança TmdbError 500', async () => {
  fetchMock.mockImplementation(async () => json({}, 500))
  const err = await run(tmdbFetch<never>('/x')).catch((e: TmdbError) => e)
  expect(err).toBeInstanceOf(TmdbError)
  expect(err.status).toBe(500)
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

/** Um fetch que nunca responde, mas desiste quando o pedido é cancelado (tempo-limite). */
function hangingFetch(_url: unknown, init?: RequestInit) {
  return new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('tempo esgotado', 'TimeoutError')))
  })
}

test('pedido que trava é cancelado em 5 s e tenta de novo', async () => {
  fetchMock.mockImplementationOnce(hangingFetch).mockResolvedValueOnce(json({ ok: 1 }))
  await expect(run(tmdbFetch('/x'))).resolves.toEqual({ ok: 1 })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('três pedidos que travam → erro, sem esperar para sempre', async () => {
  fetchMock.mockImplementation(hangingFetch)
  await expect(run(tmdbFetch('/x'))).rejects.toThrow('tempo esgotado')
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

test('cancelamento da pré-renderização do Next não é repetido', async () => {
  // Erro que o Next.js usa quando termina a pré-renderização e cancela os pedidos pendentes.
  const prerenderAbort = Object.assign(new Error('During prerendering, fetch() rejects...'), {
    digest: 'HANGING_PROMISE_REJECTION',
  })
  fetchMock.mockRejectedValueOnce(prerenderAbort).mockResolvedValueOnce(json({ ok: 1 }))
  await expect(run(tmdbFetch('/x'))).rejects.toBe(prerenderAbort)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(console.warn).not.toHaveBeenCalled()
})

test('sem token → erro imediato, nenhuma chamada', async () => {
  vi.stubEnv('TMDB_READ_TOKEN', '')
  await expect(run(tmdbFetch('/x'))).rejects.toThrow('TMDB_READ_TOKEN não configurado')
  expect(fetchMock).not.toHaveBeenCalled()
})

// ---- Tempo-limite: valor, limpeza e leitura da resposta ----

test('tempo-limite não dispara antes de 5 s', async () => {
  fetchMock.mockImplementationOnce(hangingFetch).mockResolvedValueOnce(json({ ok: 1 }))
  const promise = tmdbFetch('/x')
  await vi.advanceTimersByTimeAsync(4999)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1 + 300) // estoura o tempo-limite e passa a espera de 300 ms
  expect(fetchMock).toHaveBeenCalledTimes(2)
  await expect(promise).resolves.toEqual({ ok: 1 })
})

test('timer é limpo após sucesso', async () => {
  fetchMock.mockResolvedValueOnce(json({ ok: 1 }))
  await run(tmdbFetch('/x'))
  expect(vi.getTimerCount()).toBe(0)
})

test('log diz "tempo esgotado" quando o tempo-limite estoura', async () => {
  // fetch que rejeita com o motivo do cancelamento, como o fetch real faz
  fetchMock
    .mockImplementationOnce(
      (_url: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    .mockResolvedValueOnce(json({ ok: 1 }))
  await run(tmdbFetch('/x'))
  expect(vi.mocked(console.warn).mock.calls[0][0]).toContain('tempo esgotado (5 s)')
})

test('corpo da resposta que trava também cai no tempo-limite', async () => {
  // cabeçalhos chegam, mas o corpo nunca termina (a não ser que o pedido seja cancelado)
  fetchMock.mockImplementationOnce(async (_url: unknown, init?: RequestInit) => {
    const body = new ReadableStream({
      start(controller) {
        init?.signal?.addEventListener('abort', () => controller.error(init.signal?.reason))
      },
    })
    return new Response(body, { status: 200 })
  })
  await expect(run(tmdbFetch('/x'))).rejects.toThrow('tempo esgotado (5 s)')
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
