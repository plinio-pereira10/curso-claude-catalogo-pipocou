'use client'

import { useRouter } from 'next/navigation'
import { effectiveGenreId } from '@/lib/doramas'
import type { Filters } from '@/lib/filters'
import { listHref, type MediaType } from '@/lib/media'

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
        providerId: filters.providerId,
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
      className={`rounded-full border px-3 py-1 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'border-pink-300 bg-pink-300 text-black' : 'border-white/20 hover:border-white/60'
      }`}
    >
      🌸 Doramas
    </button>
  )
}
