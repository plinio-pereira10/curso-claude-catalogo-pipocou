'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { parseFilters } from '@/lib/filters'
import { MEDIA, switchTabHref, type MediaType } from '@/lib/media'

const TABS: MediaType[] = ['movie', 'tv']

/** Qual aba está ativa, pelo endereço: /series e /serie/... são Séries; o resto é Filmes. */
function activeTab(pathname: string): MediaType {
  return pathname.startsWith('/series') || pathname.startsWith('/serie/') ? 'tv' : 'movie'
}

/** Abas "Filmes | Séries". Trocar de aba mantém o streaming e o Doramas escolhidos. */
export function MediaTabs() {
  const pathname = usePathname()
  const filters = parseFilters(Object.fromEntries(useSearchParams()))
  const active = activeTab(pathname)

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
            className={`rounded px-3 py-1 text-sm ${isActive ? 'bg-white font-medium text-black' : 'text-zinc-300 hover:text-white'}`}
          >
            {MEDIA[type].label}
          </Link>
        )
      })}
    </nav>
  )
}
