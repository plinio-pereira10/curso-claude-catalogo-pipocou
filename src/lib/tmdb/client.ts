import 'server-only'

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
    let response: Response
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
    } catch (error) {
      // Falha de conexão (ex.: "fetch failed" quando a internet oscila).
      if (isLastAttempt) throw error
      await waitBeforeRetry(attempt, path, 'falha de conexão')
      continue
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

/** Esperas entre tentativas (em milissegundos): 300 ms e depois 1 s. */
export const RETRY_DELAYS_MS = [300, 1000]

async function waitBeforeRetry(attempt: number, path: string, reason: string) {
  const delay = RETRY_DELAYS_MS[attempt]
  console.warn(`TMDB: ${reason} em ${path}; tentando de novo em ${delay} ms`)
  await new Promise((resolve) => setTimeout(resolve, delay))
}
