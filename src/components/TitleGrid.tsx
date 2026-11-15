'use client'

import { useState } from 'react'
import { TitleCard } from './TitleCard'
import { MEDIA, type MediaType } from '@/lib/media'
import type { TitlePage, TitleSummary } from '@/lib/tmdb/types'

type Props = {
  /** Filmes ou séries. */
  type: MediaType
  /** A primeira página, já buscada no servidor. */
  initial: TitlePage
  /** Os filtros atuais no formato da URL (sem "page"), ex.: "provider=8&doramas=1". */
  query: string
}

/** Junta duas listas sem repetir títulos (a popularidade muda entre uma página e outra). */
function mergeUnique(current: TitleSummary[], incoming: TitleSummary[]): TitleSummary[] {
  const seen = new Set(current.map((t) => t.id))
  return [...current, ...incoming.filter((t) => !seen.has(t.id))]
}

export function TitleGrid({ type, initial, query }: Props) {
  const [items, setItems] = useState(initial.results)
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
      const response = await fetch(`/api/titles?type=${type}&${params.toString()}`)
      if (!response.ok) throw new Error(`status ${response.status}`)
      const next: TitlePage = await response.json()
      setItems((current) => mergeUnique(current, next.results))
      setPage(next.page)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return <p className="text-zinc-400">{MEDIA[type].noneFound}</p>
  }

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <li key={item.id}>
            <TitleCard item={item} type={type} />
          </li>
        ))}
      </ul>

      {failed && <p className="text-center text-sm text-red-400">Erro ao carregar mais títulos.</p>}

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
