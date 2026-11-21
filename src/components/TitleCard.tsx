import Image from 'next/image'
import Link from 'next/link'
import { formatRating } from '@/lib/format'
import { backdropUrl, posterUrl } from '@/lib/images'
import type { MarkStatus } from '@/lib/marks'
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
type CardProps = {
  item: TitleSummary
  type: MediaType
  /** Lista em que a pessoa marcou o título (etiqueta no canto). */
  mark?: MarkStatus
  /** Mostra a etiqueta "Filme" / "Série" (em "Minhas listas", onde os dois aparecem juntos). */
  showKind?: boolean
}

const TAG = 'absolute top-2 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow'

export function TitleCard({ item, type, mark, showKind = false }: CardProps) {
  const backdrop = backdropUrl(item.backdropPath)
  const poster = posterUrl(item.posterPath)

  return (
    // Grupo com nome ("card"): a fileira em volta também tem "group" (para as setas), e um
    // "group-hover:" sem nome acenderia todos os cartões quando o mouse está na fileira.
    <Link href={detailPath(type, item.id)} className="group/card block rounded-lg outline-none">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-superficie ring-white motion-safe:transition-transform motion-safe:duration-200 group-hover/card:scale-[1.04] group-hover/card:ring-2 group-focus-visible/card:scale-[1.04] group-focus-visible/card:ring-2">
        {backdrop ? (
          <Image src={backdrop} alt={item.title} fill sizes={CARD_SIZES} className="object-cover" />
        ) : poster ? (
          <Image src={poster} alt={item.title} fill sizes={CARD_SIZES} className="object-contain" />
        ) : null}

        {showKind && <span className={`${TAG} left-2 bg-noite/85 text-texto`}>{type === 'tv' ? 'Série' : 'Filme'}</span>}
        {mark && (
          <span className={`${TAG} right-2 ${mark === 'watched' ? 'bg-ambar text-noite' : 'bg-texto text-noite'}`}>
            {mark === 'watched' ? '✓ Assisti' : 'Quero assistir'}
          </span>
        )}

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
