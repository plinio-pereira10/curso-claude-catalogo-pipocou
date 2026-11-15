import Image from 'next/image'
import Link from 'next/link'
import { posterUrl } from '@/lib/images'
import type { TitleSummary } from '@/lib/tmdb/types'

/** Bloco cinza usado quando o filme não tem cartaz. */
export function PosterPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-zinc-800 p-2 text-center text-sm text-zinc-400">
      {title}
    </div>
  )
}

export function MovieCard({ movie }: { movie: TitleSummary }) {
  const src = posterUrl(movie.posterPath)
  return (
    <Link href={`/filme/${movie.id}`} className="group block">
      {src ? (
        <Image
          src={src}
          alt={movie.title}
          width={342}
          height={513}
          className="aspect-[2/3] w-full rounded-lg object-cover transition group-hover:opacity-80"
        />
      ) : (
        <PosterPlaceholder title={movie.title} />
      )}
      <p className="mt-2 line-clamp-2 text-sm font-medium">{movie.title}</p>
      {movie.releaseYear && <p className="text-xs text-zinc-400">{movie.releaseYear}</p>}
    </Link>
  )
}
