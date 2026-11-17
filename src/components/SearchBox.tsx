'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { listHref, MEDIA, type MediaType } from '@/lib/media'
import { FOCUS_RING } from '@/lib/ui'

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
        className={`w-full min-w-0 rounded-full border border-linha bg-superficie/80 px-4 py-1.5 text-sm placeholder:text-suave sm:w-56 ${FOCUS_RING}`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-texto px-4 py-1.5 text-sm font-semibold text-noite ${FOCUS_RING}`}
      >
        Buscar
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={clear}
          className={`shrink-0 rounded-full border border-linha px-4 py-1.5 text-sm ${FOCUS_RING}`}
        >
          Limpar
        </button>
      )}
    </form>
  )
}
