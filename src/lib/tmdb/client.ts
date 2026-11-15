import 'server-only'
import { unstable_rethrow } from 'next/navigation'

const API_BASE = 'https://api.themoviedb.org/3'

/** Erro devolvido pelo TMDB (ex.: 404 quando o filme não existe). */
export class TmdbError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'TmdbError'
    this.status = status
  }
}

type Params = Record<string, string | number | undefined>

/**
 * Faz uma chamada à API do TMDB pelo servidor.
 * O token fica só aqui (variável de ambiente), nunca vai para o navegador.
 */
export async function tmdbFetch<T>(path: string, params: Params = {}): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN
  if (!token) {
    throw new Error('TMDB_READ_TOKEN não configurado')
  }

  const url = new URL(API_BASE + path)
  url.searchParams.set('language', 'pt-BR')
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  // Até 3 tentativas: a primeira + uma depois de cada espera.
  for (let attempt = 0; ; attempt++) {
    const isLastAttempt = attempt === RETRY_DELAYS_MS.length
    // Tempo-limite: se o TMDB não responder em 5 s, o pedido é cancelado.
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let response: Response
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: controller.signal,
      })
    } catch (error) {
      // Erros internos do Next.js (ex.: ao terminar a pré-renderização ele cancela os pedidos
      // pendentes de propósito) voltam para o Next tratar — não são falha de conexão.
      unstable_rethrow(error)
      // Falha de conexão (ex.: "fetch failed" quando a internet oscila) ou tempo esgotado.
      if (isLastAttempt) throw error
      await waitBeforeRetry(attempt, path, `falha de conexão (${describeError(error)})`)
      continue
    } finally {
      clearTimeout(timer)
    }

    if (response.ok) {
      return (await response.json()) as T
    }

    // 429 (TMDB sobrecarregado) e 5xx (erro no TMDB) podem passar; 404 e afins, não.
    const temporary = response.status === 429 || response.status >= 500
    if (!temporary || isLastAttempt) {
      throw new TmdbError(response.status, `TMDB respondeu ${response.status} em ${path}`)
    }
    await waitBeforeRetry(attempt, path, `status ${response.status}`)
  }
}

/** Quanto tempo esperar a resposta de cada pedido antes de desistir dele. */
export const TIMEOUT_MS = 5000

/** Esperas entre tentativas (em milissegundos): 300 ms e depois 1 s. */
export const RETRY_DELAYS_MS = [300, 1000]

/** Texto curto do erro para o log (ex.: "TypeError: fetch failed / ECONNRESET"). */
function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  const cause = (error as { cause?: { code?: string; message?: string } }).cause
  const detail = cause?.code ?? cause?.message
  return `${error.name}: ${error.message}${detail ? ` / ${detail}` : ''}`
}

async function waitBeforeRetry(attempt: number, path: string, reason: string) {
  const delay = RETRY_DELAYS_MS[attempt]
  console.warn(`TMDB: ${reason} em ${path}; tentando de novo em ${delay} ms`)
  await new Promise((resolve) => setTimeout(resolve, delay))
}
