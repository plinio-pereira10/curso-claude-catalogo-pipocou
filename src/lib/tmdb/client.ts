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

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new TmdbError(response.status, `TMDB respondeu ${response.status} em ${path}`)
  }

  return (await response.json()) as T
}
