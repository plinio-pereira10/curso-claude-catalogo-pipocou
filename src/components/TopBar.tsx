import { Suspense } from 'react'
import type { Filters } from '@/lib/filters'
import type { MediaType } from '@/lib/media'
import type { Provider } from '@/lib/tmdb/types'
import { GUTTER } from '@/lib/ui'
import { AccountNav } from './AccountNav'
import { Logo } from './Logo'
import { MediaTabs, MediaTabsFallback } from './MediaTabs'
import { ProviderFilter } from './ProviderFilter'
import { SearchToggle } from './SearchToggle'

type Props = {
  type: MediaType
  /**
   * - `solid` (padrão): fundo azul-noite.
   * - `overlay`: flutua por cima da imagem de fundo (página de detalhes).
   * - `banner`: dentro do banner da tela inicial, no fluxo normal: a altura real empurra o conteúdo.
   */
  variant?: 'solid' | 'overlay' | 'banner'
  /** Nas listas: os streamings viram botões de filtro no menu. */
  providers?: Provider[]
  filters?: Omit<Filters, 'page'>
}

const TRANSPARENT = 'z-20 bg-linear-to-b from-noite/90 via-noite/50 to-transparent pb-10'
const POSITION = {
  solid: 'border-b border-linha bg-noite pb-4',
  overlay: `absolute inset-x-0 top-0 ${TRANSPARENT}`,
  banner: `relative ${TRANSPARENT}`,
}

/** Menu do topo: logo Pipocou · Filmes | Séries · logos dos streamings · busca · conta (Minhas listas / Entrar). */
export function TopBar({ type, variant = 'solid', providers, filters }: Props) {
  const position = POSITION[variant]

  return (
    <header className={`${position} ${GUTTER} pt-4`}>
      {/* No celular os espaços são menores para logo, abas, lupa e conta caberem numa linha. */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-3 sm:gap-x-5">
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

        {/* No celular: lupa à direita na linha do logo (ml-auto) e, ao abrir, a busca ocupa a linha de baixo. */}
        <SearchToggle key={filters?.q ?? ''} type={type} initialQuery={filters?.q} />

        {/* Depois da lupa (celular) ou da busca (a partir de sm). */}
        <div>
          {/* Lê o cookie de sessão; enquanto isso, não mostra nada (evita piscar "Entrar" para quem está logado). */}
          <Suspense fallback={null}>
            <AccountNav />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
