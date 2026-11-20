import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import type { MarkStatus } from '@/lib/marks'
import { parseListParam, savedToSummary } from '@/lib/my-lists'
import { FOCUS_RING, GUTTER } from '@/lib/ui'
import { countMyLists, getMyList } from '@/lib/user-titles'
import { TitleCard } from './TitleCard'
import { TopBar } from './TopBar'

const TABS: { status: MarkStatus; label: string; href: string }[] = [
  { status: 'want', label: 'Quero assistir', href: '/minhas-listas' },
  { status: 'watched', label: 'Já assisti', href: '/minhas-listas?lista=assistidos' },
]

type Props = { searchParams: PageProps<'/minhas-listas'>['searchParams'] }

/** "Minhas listas": sub-abas "Quero assistir" e "Já assisti", com filmes e séries juntos. */
export function MyListsPage({ searchParams }: Props) {
  return (
    <>
      <TopBar type="movie" />
      <div className={`${GUTTER} space-y-6 pt-6 pb-12`}>
        <h1 className="text-2xl font-extrabold">Minhas listas</h1>
        <Suspense fallback={<p className="text-suave">Carregando…</p>}>
          <MyLists searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}

async function MyLists({ searchParams }: Props) {
  const raw = (await searchParams).lista
  const active = parseListParam(Array.isArray(raw) ? raw[0] : raw)

  // Só para quem está logado; sem login, vai para "Entrar" e depois volta para cá.
  if (!(await getCurrentUser())) redirect('/entrar?voltar=%2Fminhas-listas')

  const [counts, titles] = await Promise.all([countMyLists(), getMyList(active)])

  return (
    <>
      <nav aria-label="Listas" className="flex gap-2">
        {TABS.map((tab) => {
          const isActive = tab.status === active
          return (
            <Link
              key={tab.status}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${FOCUS_RING} ${
                isActive ? 'bg-texto text-noite' : 'border border-linha text-texto/80 hover:text-texto'
              }`}
            >
              {tab.label} ({counts[tab.status]})
            </Link>
          )
        })}
      </nav>

      {titles.length === 0 ? (
        <div className="space-y-3 py-10 text-center">
          <p className="text-suave">Você ainda não marcou nenhum título.</p>
          <Link href="/" className={`rounded font-semibold underline ${FOCUS_RING}`}>
            Ver o catálogo
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {titles.map((saved) => (
            <li key={`${saved.mediaType}:${saved.tmdbId}`}>
              <TitleCard item={savedToSummary(saved)} type={saved.mediaType} mark={active} showKind />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
