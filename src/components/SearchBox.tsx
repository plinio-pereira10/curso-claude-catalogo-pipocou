'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { listHref, MEDIA, type MediaType } from '@/lib/media'

/** Busca por nome. Envia com Enter ou com o botão; "Limpar" volta para a lista normal. */
export function SearchBox({ type, initialQuery = '' }: { type: MediaType; initialQuery?: string }) {
  const router = useRouter()
  const [text, setText] = useState(initialQuery)
  const placeholder = type === 'tv' ? 'Buscar série pelo nome' : 'Buscar filme pelo nome'

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.push(listHref(type, { q: text.trim(), doramas: false }))
  }

  function clear() {
    setText('')
    router.push(MEDIA[type].listPath)
  }

  return (
    <form onSubmit={submit} role="search" className="flex gap-2">
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded border border-white/20 bg-zinc-900 px-3 py-1.5 text-sm sm:w-72"
      />
      <button type="submit" className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black">
        Buscar
      </button>
      {initialQuery && (
        <button type="button" onClick={clear} className="rounded border border-white/20 px-3 py-1.5 text-sm">
          Limpar
        </button>
      )}
    </form>
  )
}
