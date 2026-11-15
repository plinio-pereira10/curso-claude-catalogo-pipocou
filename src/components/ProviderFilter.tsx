'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { filtersToQuery } from '@/lib/filters'
import { logoUrl } from '@/lib/images'
import type { Provider } from '@/lib/tmdb/types'

type Props = {
  providers: Provider[]
  selectedId?: number
  genreId?: number
  disabled: boolean
}

/** Botões com o logo de cada streaming. Clicar de novo no selecionado tira o filtro. */
export function ProviderFilter({ providers, selectedId, genreId, disabled }: Props) {
  const router = useRouter()

  function select(id: number) {
    const providerId = id === selectedId ? undefined : id
    router.push('/?' + filtersToQuery({ providerId, genreId }))
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por streaming">
      {providers.map((p) => {
        const active = p.id === selectedId
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => select(p.id)}
            disabled={disabled}
            aria-pressed={active}
            title={p.name}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              active ? 'border-white bg-white text-black' : 'border-white/20 hover:border-white/60'
            }`}
          >
            <Image src={logoUrl(p.logoPath)} alt="" width={20} height={20} className="rounded" />
            {p.name}
          </button>
        )
      })}
    </div>
  )
}
