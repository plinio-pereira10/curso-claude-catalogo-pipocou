import Link from 'next/link'
import { Suspense } from 'react'
import type { Filters } from '@/lib/filters'
import type { MediaType } from '@/lib/media'
import type { Provider } from '@/lib/tmdb/types'
import { FOCUS_RING, GUTTER } from '@/lib/ui'
import { MediaTabs, MediaTabsFallback } from './MediaTabs'
import { ProviderFilter } from './ProviderFilter'
import { SearchBox } from './SearchBox'

type Props = {
  type: MediaType
  /** Por cima do banner (fundo transparente). Senão, fundo azul-noite. */
  overlay?: boolean
  /** Nas listas: os streamings viram botões de filtro no menu. */
  providers?: Provider[]
  filters?: Omit<Filters, 'page'>
}

/** Menu do topo: Catálogo · Filmes | Séries · logos dos streamings · busca. */
export function TopBar({ type, overlay = false, providers, filters }: Props) {
  const position = overlay
    ? 'absolute inset-x-0 top-0 z-20 bg-linear-to-b from-noite/90 via-noite/50 to-transparent pb-10'
    : 'border-b border-linha bg-noite pb-4'

  return (
    <header className={`${position} ${GUTTER} pt-4`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href="/" className={`rounded text-lg font-extrabold ${FOCUS_RING}`}>
          🎬 Catálogo
        </Link>

        {/* As abas leem o endereço (filtros); enquanto isso, mostra a versão sem filtros. */}
        <Suspense fallback={<MediaTabsFallback />}>
          <MediaTabs />
        </Suspense>

        {providers && filters && (
          <>
            <span aria-hidden className="hidden h-7 w-px bg-linha lg:block" />
            <div className="order-last w-full min-w-0 lg:order-none lg:w-auto lg:flex-1">
              <ProviderFilter type={type} providers={providers} filters={filters} disabled={Boolean(filters.q)} />
            </div>
          </>
        )}

        <div className="w-full sm:ml-auto sm:w-auto">
          <SearchBox key={filters?.q ?? ''} type={type} initialQuery={filters?.q} />
        </div>
      </div>
    </header>
  )
}
