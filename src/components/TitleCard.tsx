import Image from 'next/image'
import Link from 'next/link'
import { formatRating } from '@/lib/format'
import { backdropUrl, posterUrl } from '@/lib/images'
import { detailPath, type MediaType } from '@/lib/media'
import type { TitleSummary } from '@/lib/tmdb/types'

/** Bloco usado quando o título não tem cartaz (página de detalhes). */
export function PosterPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-superficie p-2 text-center text-sm text-suave">
      {title}
    </div>
  )
}

/** Tamanhos do cartão na tela (fileiras e grade), para o navegador baixar a imagem certa. */
const CARD_SIZES = '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 45vw, 75vw'

/**
 * Cartão deitado (16:9): imagem de cena; sem ela, o cartaz em pé centralizado;
 * sem nenhuma imagem, só o fundo. Nome, nota e ano ficam por cima, embaixo.
 */
export function TitleCard({ item, type }: { item: TitleSummary; type: MediaType }) {
  const backdrop = backdropUrl(item.backdropPath)
  const poster = posterUrl(item.posterPath)

  return (
    <Link href={detailPath(type, item.id)} className="group block rounded-lg outline-none">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-superficie ring-white motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-[1.04] group-hover:ring-2 group-focus-visible:scale-[1.04] group-focus-visible:ring-2">
        {backdrop ? (
          <Image src={backdrop} alt={item.title} fill sizes={CARD_SIZES} className="object-cover" />
        ) : poster ? (
          <Image src={poster} alt={item.title} fill sizes={CARD_SIZES} className="object-contain" />
        ) : null}

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-noite via-noite/70 to-transparent px-3 pt-10 pb-2.5">
          <p className="line-clamp-2 text-sm leading-snug font-semibold">{item.title}</p>
          <p className="mt-0.5 flex gap-3 text-xs text-suave">
            <span>
              {item.voteAverage > 0 && (
                <span aria-hidden className="mr-1 text-ambar">
                  ★
                </span>
              )}
              <span>{formatRating(item.voteAverage)}</span>
            </span>
            {item.releaseYear && <span>{item.releaseYear}</span>}
          </p>
        </div>
      </div>
    </Link>
  )
}
