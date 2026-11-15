'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Filters } from '@/lib/filters'
import { logoUrl } from '@/lib/images'
import { listHref, type MediaType } from '@/lib/media'
import type { Provider } from '@/lib/tmdb/types'

type Props = {
  type: MediaType
  providers: Provider[]
  filters: Omit<Filters, 'page'>
  disabled: boolean
}

/** Botões com o logo de cada streaming. Clicar de novo no selecionado tira o filtro. */
export function ProviderFilter({ type, providers, filters, disabled }: Props) {
  const router = useRouter()

  function select(id: number) {
    const providerId = id === filters.providerId ? undefined : id
    router.push(listHref(type, { ...filters, q: undefined, providerId }))
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por streaming">
      {providers.map((p) => {
        const active = p.id === filters.providerId
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
