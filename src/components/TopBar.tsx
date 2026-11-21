import { Suspense } from 'react'
import type { Filters } from '@/lib/filters'
import type { MediaType } from '@/lib/media'
import type { Provider } from '@/lib/tmdb/types'
import { GUTTER } from '@/lib/ui'
import { AccountNav } from './AccountNav'
import { Logo } from './Logo'
import { MediaTabs, MediaTabsFallback } from './MediaTabs'
import { ProviderFilter } from './ProviderFilter'
import { SearchBox } from './SearchBox'

type Props = {
  type: MediaType
  /** Dentro do banner, por cima da imagem (fundo transparente). Senão, fundo azul-noite. */
  overlay?: boolean
  /** Nas listas: os streamings viram botões de filtro no menu. */
  providers?: Provider[]
  filters?: Omit<Filters, 'page'>
}

/** Menu do topo: logo Pipocou · Filmes | Séries · logos dos streamings · busca · conta (Minhas listas / Entrar). */
export function TopBar({ type, overlay = false, providers, filters }: Props) {
  const position = overlay
    ? // no fluxo normal (não absolute): a altura real do menu empurra o conteúdo do banner para baixo
      'relative z-20 bg-linear-to-b from-noite/90 via-noite/50 to-transparent pb-10'
    : 'border-b border-linha bg-noite pb-4'

  return (
    <header className={`${position} ${GUTTER} pt-4`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Logo />

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

        {/* Lê o cookie de sessão; enquanto isso, não mostra nada (evita piscar "Entrar" para quem está logado). */}
        <Suspense fallback={null}>
          <AccountNav />
        </Suspense>
      </div>
    </header>
  )
}
