'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { parseFilters } from '@/lib/filters'
import { MEDIA, switchTabHref, type MediaType } from '@/lib/media'
import { recordVisit } from '@/lib/navigation-history'
import { FOCUS_RING } from '@/lib/ui'

const TABS: MediaType[] = ['movie', 'tv']

/** Qual aba está ativa, pelo endereço: /series e /serie/... são Séries; o resto é Filmes. */
function activeTab(pathname: string): MediaType {
  return pathname.startsWith('/series') || pathname.startsWith('/serie/') ? 'tv' : 'movie'
}

/** Abas "Filmes | Séries". Trocar de aba mantém o streaming, a nota e o Doramas escolhidos. */
export function MediaTabs() {
  const pathname = usePathname()
  const filters = parseFilters(Object.fromEntries(useSearchParams()))
  const active = activeTab(pathname)

  // As abas ficam em todas as páginas: aproveitamos para contar as visitas (usado pelo "← voltar").
  useEffect(() => recordVisit(pathname), [pathname])

  return <TabLinks active={active} hrefFor={(type) => switchTabHref(type, filters)} />
}

/** Versão sem filtros, mostrada enquanto o endereço ainda não foi lido. */
export function MediaTabsFallback() {
  return <TabLinks active={null} hrefFor={(type) => MEDIA[type].listPath} />
}

function TabLinks({ active, hrefFor }: { active: MediaType | null; hrefFor: (type: MediaType) => string }) {
  return (
    <nav aria-label="Filmes ou séries" className="flex gap-1">
      {TABS.map((type) => {
        const isActive = type === active
        return (
          <Link
            key={type}
            href={hrefFor(type)}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${FOCUS_RING} ${
              isActive ? 'bg-texto text-noite' : 'text-texto/80 hover:bg-white/10 hover:text-texto'
            }`}
          >
            {MEDIA[type].label}
          </Link>
        )
      })}
    </nav>
  )
}
