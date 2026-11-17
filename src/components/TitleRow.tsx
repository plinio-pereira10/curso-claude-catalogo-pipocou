'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import type { ProviderRow } from '@/lib/home'
import { logoUrl } from '@/lib/images'
import { listHref, type MediaType } from '@/lib/media'
import { FOCUS_RING, GUTTER } from '@/lib/ui'
import { TitleCard } from './TitleCard'

/** Quanto cada clique na seta rola: 90% da largura visível (sobra um cartão de referência). */
const SCROLL_FRACTION = 0.9

/** Uma fileira da tela inicial: logo + nome do streaming, "Ver todos" e cartões que rolam para o lado. */
export function TitleRow({ type, row }: { type: MediaType; row: ProviderRow }) {
  const listRef = useRef<HTMLUListElement>(null)
  const { provider, titles } = row
  const headingId = `fileira-${provider.id}`

  function scroll(direction: 1 | -1) {
    const list = listRef.current
    if (!list) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    list.scrollBy({ left: direction * list.clientWidth * SCROLL_FRACTION, behavior: reduce ? 'auto' : 'smooth' })
  }

  const arrow = `absolute inset-y-0 z-10 hidden w-12 items-center justify-center text-3xl opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 md:flex ${FOCUS_RING}`

  return (
    <section aria-labelledby={headingId}>
      <div className={`flex items-center justify-between gap-4 ${GUTTER}`}>
        <h2 id={headingId} className="flex items-center gap-2.5 text-xl font-semibold">
          <Image src={logoUrl(provider.logoPath)} alt="" width={24} height={24} className="size-6 rounded-md" />
          {provider.name}
        </h2>
        <Link
          href={listHref(type, { providerId: provider.id })}
          className={`shrink-0 rounded text-sm font-semibold text-suave hover:text-texto ${FOCUS_RING}`}
        >
          Ver todos
        </Link>
      </div>

      <div className="group relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Rolar para a esquerda"
          className={`${arrow} left-0 bg-linear-to-r from-noite to-transparent`}
        >
          ‹
        </button>
        <ul
          ref={listRef}
          className={`no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto py-3 scroll-pl-4 sm:scroll-pl-8 lg:scroll-pl-12 ${GUTTER}`}
        >
          {titles.map((item) => (
            <li key={item.id} className="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-[24vw]">
              <TitleCard item={item} type={type} />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Rolar para a direita"
          className={`${arrow} right-0 bg-linear-to-l from-noite to-transparent`}
        >
          ›
        </button>
      </div>
    </section>
  )
}
