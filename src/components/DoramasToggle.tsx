'use client'

import { useRouter } from 'next/navigation'
import { effectiveGenreId } from '@/lib/doramas'
import type { Filters } from '@/lib/filters'
import { listHref, type MediaType } from '@/lib/media'
import { FOCUS_RING } from '@/lib/ui'

type Props = {
  type: MediaType
  filters: Omit<Filters, 'page'>
  disabled: boolean
}

/** Botão liga/desliga "🌸 Doramas". Soma com o streaming e o gênero escolhidos. */
export function DoramasToggle({ type, filters, disabled }: Props) {
  const router = useRouter()
  const active = filters.doramas

  function toggle() {
    const doramas = !active
    router.push(
      listHref(type, {
        ...filters,
        q: undefined,
        // ao ligar, um gênero que não conta como dorama (ex.: Animação) sai da URL
        genreId: effectiveGenreId(type, filters.genreId, doramas),
        doramas,
      }),
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${
        active ? 'border-pink-300 bg-pink-300 font-semibold text-noite' : 'border-linha bg-superficie hover:border-suave'
      }`}
    >
      🌸 Doramas
    </button>
  )
}
