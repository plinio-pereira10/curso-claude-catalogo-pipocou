import Image from 'next/image'
import Link from 'next/link'
import { posterUrl } from '@/lib/images'
import { detailPath, type MediaType } from '@/lib/media'
import type { TitleSummary } from '@/lib/tmdb/types'

/** Bloco cinza usado quando o título não tem cartaz. */
export function PosterPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-zinc-800 p-2 text-center text-sm text-zinc-400">
      {title}
    </div>
  )
}

export function TitleCard({ item, type }: { item: TitleSummary; type: MediaType }) {
  const src = posterUrl(item.posterPath)
  return (
    <Link href={detailPath(type, item.id)} className="group block">
      {src ? (
        <Image
          src={src}
          alt={item.title}
          width={342}
          height={513}
          className="aspect-[2/3] w-full rounded-lg object-cover transition group-hover:opacity-80"
        />
      ) : (
        <PosterPlaceholder title={item.title} />
      )}
      <p className="mt-2 line-clamp-2 text-sm font-medium">{item.title}</p>
      {item.releaseYear && <p className="text-xs text-zinc-400">{item.releaseYear}</p>}
    </Link>
  )
}
