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

const OPTIONS: { doramas: boolean; label: string }[] = [
  { doramas: false, label: 'Todos' },
  { doramas: true, label: 'Doramas' },
]

/**
 * "Todos | Doramas", como as abas Filmes | Séries: a opção escolhida fica na pílula branca.
 * "Doramas" liga o filtro e soma com o streaming, o gênero, a nota e a ordem escolhidos.
 */
export function DoramasToggle({ type, filters, disabled }: Props) {
  const router = useRouter()

  function choose(doramas: boolean) {
    if (doramas === filters.doramas) return // já está nessa opção
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
    <div role="group" aria-label="Doramas" className="inline-flex gap-0.5 rounded-full border border-linha p-[3px]">
      {OPTIONS.map((option) => {
        const active = option.doramas === filters.doramas
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => choose(option.doramas)}
            disabled={disabled}
            aria-pressed={active}
            className={`rounded-full px-3.5 py-1 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${
              active ? 'bg-texto text-noite' : 'text-suave hover:text-texto'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
