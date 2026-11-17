'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Filters } from '@/lib/filters'
import { logoUrl } from '@/lib/images'
import { listHref, type MediaType } from '@/lib/media'
import type { Provider } from '@/lib/tmdb/types'
import { FOCUS_RING } from '@/lib/ui'

type Props = {
  type: MediaType
  providers: Provider[]
  filters: Omit<Filters, 'page'>
  disabled: boolean
}

/**
 * Botões só com o logo de cada streaming (o nome fica no `title` e no `aria-label`).
 * Clicar de novo no selecionado tira o filtro.
 */
export function ProviderFilter({ type, providers, filters, disabled }: Props) {
  const router = useRouter()

  function select(id: number) {
    const providerId = id === filters.providerId ? undefined : id
    router.push(listHref(type, { ...filters, q: undefined, providerId }))
  }

  return (
    <div className="no-scrollbar -m-1 flex gap-2 overflow-x-auto p-1" role="group" aria-label="Filtrar por streaming">
      {providers.map((p) => {
        const active = p.id === filters.providerId
        // com um streaming escolhido, os outros ficam apagados
        const look = active ? 'outline-2 outline-offset-2 outline-white' : filters.providerId ? 'opacity-45 hover:opacity-100' : ''
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => select(p.id)}
            disabled={disabled}
            aria-pressed={active}
            aria-label={p.name}
            title={p.name}
            className={`shrink-0 rounded-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${look}`}
          >
            <Image src={logoUrl(p.logoPath)} alt="" width={36} height={36} className="size-9 rounded-lg" />
          </button>
        )
      })}
    </div>
  )
}
