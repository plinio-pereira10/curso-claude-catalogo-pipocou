'use client'

import { useState } from 'react'
import { MovieCard } from './MovieCard'
import type { MoviePage, MovieSummary } from '@/lib/tmdb/types'

type Props = {
  /** A primeira página, já buscada no servidor. */
  initial: MoviePage
  /** Os filtros atuais no formato da URL (sem "page"), ex.: "provider=8". */
  query: string
}

/** Junta duas listas sem repetir filmes (a popularidade muda entre uma página e outra). */
function mergeUnique(current: MovieSummary[], incoming: MovieSummary[]): MovieSummary[] {
  const seen = new Set(current.map((m) => m.id))
  return [...current, ...incoming.filter((m) => !seen.has(m.id))]
}

export function MovieGrid({ initial, query }: Props) {
  const [movies, setMovies] = useState(initial.results)
  const [page, setPage] = useState(initial.page)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const hasMore = page < initial.totalPages

  async function loadMore() {
    setLoading(true)
    setFailed(false)
    try {
      const params = new URLSearchParams(query)
      params.set('page', String(page + 1))
      const response = await fetch(`/api/movies?${params.toString()}`)
      if (!response.ok) throw new Error(`status ${response.status}`)
      const next: MoviePage = await response.json()
      setMovies((current) => mergeUnique(current, next.results))
      setPage(next.page)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (movies.length === 0) {
    return <p className="text-zinc-400">Nenhum filme encontrado.</p>
  }

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>

      {failed && <p className="text-center text-sm text-red-400">Erro ao carregar mais filmes.</p>}

      {hasMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            aria-label="Carregar mais"
            className="rounded bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  )
}
