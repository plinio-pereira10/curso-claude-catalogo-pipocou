import { cache, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { summarizeAvailability } from '@/lib/availability'
import { formatRating, formatRuntime, formatSeasons } from '@/lib/format'
import { backdropUrl, posterUrl } from '@/lib/images'
import { getCurrentUser } from '@/lib/auth'
import { detailPath, MEDIA, type MediaType } from '@/lib/media'
import { TmdbError } from '@/lib/tmdb/client'
import { getTitleDetails, getWatchProviders } from '@/lib/tmdb/titles'
import type { TitleDetails } from '@/lib/tmdb/types'
import { getTitleMark } from '@/lib/user-titles'
import { BackButton } from './BackButton'
import { MarkButtons } from './MarkButtons'
import { PosterPlaceholder } from './TitleCard'
import { TopBar } from './TopBar'
import { GUTTER } from '@/lib/ui'
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
    <Suspense
      fallback={
        <>
          <TopBar type={type} />
          <p className={`${GUTTER} py-6 text-suave`}>Carregando…</p>
        </>
      }
    >
      <TitleDetailsView type={type} params={params} />
    </Suspense>
  )
}

async function TitleDetailsView({ type, params }: { type: MediaType; params: Params }) {
  const { details, availability, brazilLink } = await loadTitle(type, (await params).id)
  const poster = posterUrl(details.posterPath, 'w500')
  const backdrop = backdropUrl(details.backdropPath, 'w1280')
  const runtime = formatRuntime(details.runtime)
  const seasons = formatSeasons(details.seasons)

  return (
    <>
      {/* Com imagem de cena, o menu fica por cima dela. */}
      <TopBar type={type} overlay={Boolean(backdrop)} />

      {backdrop && (
        <div className="relative h-[45vh] min-h-72 lg:h-[60vh]">
          <Image src={backdrop} alt="" fill sizes="100vw" priority className="object-cover object-[70%_20%]" />
          <div className="absolute inset-0 bg-linear-to-r from-noite/80 via-noite/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-noite via-noite/70 to-transparent" />
        </div>
      )}

      <div className={`relative ${GUTTER} space-y-6 pb-12 ${backdrop ? '-mt-40 lg:-mt-56' : 'pt-6'}`}>
        <BackButton type={type} />

        <article className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="w-40 shrink-0 sm:w-56">
            {poster ? (
              <Image
                src={poster}
                alt={details.title}
                width={500}
                height={750}
                className="w-full rounded-lg shadow-2xl shadow-black/60"
                priority
              />
            ) : (
              <PosterPlaceholder title={details.title} />
            )}
          </div>

          <div className="space-y-4 sm:pt-16 lg:pt-28">
            <h1 className="text-3xl leading-tight font-extrabold text-balance">
              {details.title}
              {details.releaseYear && <span className="font-normal text-suave"> ({details.releaseYear})</span>}
            </h1>

            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-texto/85">
              <span>
                {details.voteAverage > 0 && (
                  <span aria-hidden className="mr-1 text-ambar">
                    ★
                  </span>
                )}
                {formatRating(details.voteAverage)}
              </span>
              {runtime && <span>{runtime}</span>}
              {seasons && <span>{seasons}</span>}
              {details.genres.length > 0 && <span>{details.genres.map((g) => g.name).join(', ')}</span>}
            </p>

            {/* Depende de quem está logado: fica numa parte separada, que não atrasa o resto da página. */}
            <Suspense fallback={<div className="h-9" />}>
              <TitleMarks type={type} details={details} />
            </Suspense>

            <p className="max-w-2xl leading-relaxed">{details.overview || 'Sinopse não disponível.'}</p>

            <WhereToWatch availability={availability} brazilLink={brazilLink} />
          </div>
        </article>
      </div>
    </>
  )
}

/** Botões "Quero assistir" / "Já assisti", com o estado atual da pessoa (lê o cookie de sessão). */
async function TitleMarks({ type, details }: { type: MediaType; details: TitleDetails }) {
  const [user, status] = await Promise.all([getCurrentUser(), getTitleMark(type, details.id)])
  return (
    <MarkButtons
      type={type}
      tmdbId={details.id}
      snapshot={{
        title: details.title,
        posterPath: details.posterPath,
        backdropPath: details.backdropPath,
        releaseYear: details.releaseYear,
        voteAverage: details.voteAverage,
      }}
      initialStatus={status}
      loggedIn={Boolean(user)}
      returnPath={detailPath(type, details.id)}
    />
  )
}

/** Página "não encontrado" de filmes e séries. */
export function TitleNotFound({ type }: { type: MediaType }) {
  return (
    <>
      {/* O menu fica aqui também: ele conta as visitas usadas pelo "← voltar". */}
      <TopBar type={type} />
      <div className={`${GUTTER} space-y-4 py-10 text-center`}>
        <p>{MEDIA[type].notFound}</p>
        <Link href={MEDIA[type].listPath} className="underline">
          Voltar para a lista
        </Link>
      </div>
    </>
  )
}
