import { cache, Suspense } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { summarizeAvailability } from '@/lib/availability'
import { formatRating, formatRuntime } from '@/lib/format'
import { posterUrl } from '@/lib/images'
import { TmdbError } from '@/lib/tmdb/client'
import { getTitleDetails, getWatchProviders } from '@/lib/tmdb/titles'
import { BackButton } from '@/components/BackButton'
import { PosterPlaceholder } from '@/components/TitleCard'
import { WhereToWatch } from '@/components/WhereToWatch'

/** "123" → 123; qualquer outra coisa → null. */
function parseMovieId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const id = Number.parseInt(raw, 10)
  return id > 0 ? id : null
}

/**
 * Busca detalhes e serviços juntos. Se o filme não existir, mostra a página "não encontrado".
 * `cache` evita buscar duas vezes (título da aba + página).
 */
const loadMovie = cache(async (rawId: string) => {
  const id = parseMovieId(rawId)
  if (id === null) notFound()
  try {
    const [details, providers] = await Promise.all([getTitleDetails('movie', id), getWatchProviders('movie', id)])
    return { details, availability: summarizeAvailability(providers.byCountry) }
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) notFound()
    throw error
  }
})

export async function generateMetadata({ params }: PageProps<'/filme/[id]'>): Promise<Metadata> {
  const { details } = await loadMovie((await params).id)
  return { title: `${details.title} — Catálogo de Filmes` }
}

export default function MoviePage({ params }: PageProps<'/filme/[id]'>) {
  return (
    <div className="space-y-6">
      <BackButton />
      <Suspense fallback={<p className="text-zinc-400">Carregando filme…</p>}>
        <MovieDetailsView params={params} />
      </Suspense>
    </div>
  )
}

async function MovieDetailsView({ params }: Pick<PageProps<'/filme/[id]'>, 'params'>) {
  const { details, availability } = await loadMovie((await params).id)
  const src = posterUrl(details.posterPath, 'w500')
  const runtime = formatRuntime(details.runtime)

  return (
    <article className="flex flex-col gap-6 sm:flex-row">
      <div className="w-full max-w-xs shrink-0">
        {src ? (
          <Image src={src} alt={details.title} width={500} height={750} className="w-full rounded-lg" priority />
        ) : (
          <PosterPlaceholder title={details.title} />
        )}
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          {details.title}
          {details.releaseYear && <span className="font-normal text-zinc-400"> ({details.releaseYear})</span>}
        </h1>

        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-300">
          <span>⭐ {formatRating(details.voteAverage)}</span>
          {runtime && <span>⏱ {runtime}</span>}
          {details.genres.length > 0 && <span>{details.genres.map((g) => g.name).join(', ')}</span>}
        </p>

        <p className="max-w-2xl leading-relaxed">{details.overview || 'Sinopse não disponível.'}</p>

        <WhereToWatch availability={availability} />
      </div>
    </article>
  )
}
