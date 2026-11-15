import { cache, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { summarizeAvailability } from '@/lib/availability'
import { formatRating, formatRuntime, formatSeasons } from '@/lib/format'
import { posterUrl } from '@/lib/images'
import { MEDIA, type MediaType } from '@/lib/media'
import { TmdbError } from '@/lib/tmdb/client'
import { getTitleDetails, getWatchProviders } from '@/lib/tmdb/titles'
import { BackButton } from './BackButton'
import { PosterPlaceholder } from './TitleCard'
import { WhereToWatch } from './WhereToWatch'

type Params = Promise<{ id: string }>

/** "123" → 123; qualquer outra coisa → null. */
function parseTitleId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const id = Number.parseInt(raw, 10)
  return id > 0 ? id : null
}

/**
 * Busca detalhes e serviços juntos. Se o título não existir, mostra a página "não encontrado".
 * `cache` evita buscar duas vezes (título da aba + página).
 */
const loadTitle = cache(async (type: MediaType, rawId: string) => {
  const id = parseTitleId(rawId)
  if (id === null) notFound()
  try {
    const [details, providers] = await Promise.all([getTitleDetails(type, id), getWatchProviders(type, id)])
    return {
      details,
      availability: summarizeAvailability(providers.byCountry),
      brazilLink: providers.brazilLink,
    }
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) notFound()
    throw error
  }
})

/** Título da aba do navegador: "<nome> — Catálogo". */
export async function titleMetadata(type: MediaType, params: Params): Promise<Metadata> {
  const { details } = await loadTitle(type, (await params).id)
  return { title: `${details.title} — Catálogo` }
}

/** Página de detalhes, usada por /filme/[id] e /serie/[id]. */
export function TitleDetailsPage({ type, params }: { type: MediaType; params: Params }) {
  return (
    <div className="space-y-6">
      <BackButton type={type} />
      <Suspense fallback={<p className="text-zinc-400">Carregando…</p>}>
        <TitleDetailsView type={type} params={params} />
      </Suspense>
    </div>
  )
}

async function TitleDetailsView({ type, params }: { type: MediaType; params: Params }) {
  const { details, availability, brazilLink } = await loadTitle(type, (await params).id)
  const src = posterUrl(details.posterPath, 'w500')
  const runtime = formatRuntime(details.runtime)
  const seasons = formatSeasons(details.seasons)

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
          {seasons && <span>📺 {seasons}</span>}
          {details.genres.length > 0 && <span>{details.genres.map((g) => g.name).join(', ')}</span>}
        </p>

        <p className="max-w-2xl leading-relaxed">{details.overview || 'Sinopse não disponível.'}</p>

        <WhereToWatch availability={availability} brazilLink={brazilLink} />
      </div>
    </article>
  )
}

/** Página "não encontrado" de filmes e séries. */
export function TitleNotFound({ type }: { type: MediaType }) {
  return (
    <div className="space-y-4 py-10 text-center">
      <p>{MEDIA[type].notFound}</p>
      <Link href={MEDIA[type].listPath} className="underline">
        Voltar para a lista
      </Link>
    </div>
  )
}
