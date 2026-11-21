'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { formatRating } from '@/lib/format'
import type { FeaturedItem } from '@/lib/home'
import { backdropUrl, logoUrl, titleLogoUrl } from '@/lib/images'
import { detailPath, type MediaType } from '@/lib/media'
import { FOCUS_RING, GUTTER } from '@/lib/ui'

/** Tempo de cada destaque antes de trocar sozinho. */
export const ROTATE_MS = 8000

/**
 * Banner do topo da tela inicial. Mostra um destaque por vez e troca sozinho a cada 8 s,
 * menos quando o mouse/foco está nele ou quando o sistema pede menos movimento.
 * `header` (o menu do topo) fica dentro do banner, por cima da imagem, mas no fluxo normal:
 * ele empurra o conteúdo para baixo pela altura real dele (1 a 4 linhas, conforme a tela).
 */
export function HeroBanner({
  type,
  items,
  header,
}: {
  type: MediaType
  items: FeaturedItem[]
  header?: ReactNode
}) {
  const [index, setIndex] = useState(0)
  // mouse em cima e foco do teclado dentro pausam separadamente: um não desfaz o outro
  const [hovered, setHovered] = useState(false)
  const [focusInside, setFocusInside] = useState(false)
  const paused = hovered || focusInside
  const count = items.length

  useEffect(() => {
    if (paused || count < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    // um timer por destaque: escolher outro pelas bolinhas recomeça a contagem
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), ROTATE_MS)
    return () => clearTimeout(timer)
  }, [index, paused, count])

  if (count === 0) return null
  const current = items[Math.min(index, count - 1)]
  const { title, provider, logoPath } = current

  return (
    // Parte de fora: imagem de fundo + menu do topo. Altura mínima (não fixa): em tela baixa
    // o banner cresce em vez de o conteúdo subir até o menu.
    <div className="relative flex min-h-[max(75vh,34rem)] flex-col overflow-hidden sm:min-h-[max(65vh,28rem)] lg:min-h-[max(70vh,28rem)]">
      {/* Todas as imagens ficam empilhadas; só a do destaque atual aparece (troca com fade). */}
      {items.map((item, i) => (
        <Image
          key={item.title.id}
          src={backdropUrl(item.title.backdropPath, 'w1280') ?? ''}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          className={`object-cover object-[70%_20%] motion-safe:transition-opacity motion-safe:duration-700 ${
            item === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-r from-noite via-noite/70 to-transparent sm:via-noite/40" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-noite via-noite/60 to-transparent" />

      {header}

      {/* Parte de dentro: o carrossel. O menu fica fora dele, para o leitor de tela não o anunciar
          como parte de "Destaques" (e mexer no menu não pausa a troca). */}
      <section
        aria-roledescription="carrossel"
        aria-label="Destaques"
        className={`relative z-10 flex flex-1 flex-col justify-end pt-4 pb-16 lg:pb-20 ${GUTTER}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocusInside(true)}
        onBlur={(e) => {
          // só sai do "foco dentro" quando o foco vai para fora do carrossel
          if (!e.currentTarget.contains(e.relatedTarget)) setFocusInside(false)
        }}
      >
        <div className="max-w-xl space-y-4">
          {/* título com altura fixa e sinopse sempre com 3 linhas: todos os destaques têm a mesma altura,
              então a página não "pula" quando o banner troca sozinho */}
          {/* h-26 = 2 linhas de text-5xl com leading 1.05 (≈101 px) */}
          <h1 className="flex h-26 items-end sm:h-28">
            {logoPath ? (
              <span className="relative block h-full w-[min(26rem,80vw)]">
                <Image
                  src={titleLogoUrl(logoPath)}
                  alt={title.title}
                  fill
                  sizes="26rem"
                  className="object-contain object-bottom-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
                />
              </span>
            ) : (
              // leading um pouco maior que 1: o corte das 2 linhas não come a perna do "g", "j", "p", "y"
              <span className="line-clamp-2 text-5xl leading-[1.05] font-extrabold tracking-tight text-balance">
                {title.title}
              </span>
            )}
          </h1>

          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
            {/* o nome do streaming já está em texto: o logo é só decorativo */}
            <span className="flex items-center gap-2">
              <Image src={logoUrl(provider.logoPath)} alt="" width={20} height={20} className="size-5 rounded" />
              {provider.name}
            </span>
            <span>
              {title.voteAverage > 0 && (
                <span aria-hidden className="mr-1 text-ambar">
                  ★
                </span>
              )}
              {formatRating(title.voteAverage)}
            </span>
            {title.releaseYear && <span className="text-suave">{title.releaseYear}</span>}
          </p>

          {/* sem sinopse, o parágrafo vazio só guarda o espaço (o leitor de tela pula) */}
          <p aria-hidden={!title.overview || undefined} className="line-clamp-3 min-h-[3lh] leading-relaxed text-texto/85">
            {title.overview}
          </p>

          <Link
            href={detailPath(type, title.id)}
            className={`inline-block rounded-full bg-texto px-6 py-2.5 text-sm font-semibold text-noite hover:bg-white ${FOCUS_RING}`}
          >
            Ver detalhes
          </Link>
        </div>

        {count > 1 && (
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-1">
            {items.map((item, i) => {
              const active = item === current
              return (
                <button
                  key={item.title.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Destaque ${i + 1}`}
                  aria-current={active ? 'true' : undefined}
                  className={`rounded-full p-1.5 ${FOCUS_RING}`}
                >
                  <span
                    className={`block h-2 rounded-full motion-safe:transition-all ${active ? 'w-6 bg-texto' : 'w-2 bg-texto/40'}`}
                  />
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
