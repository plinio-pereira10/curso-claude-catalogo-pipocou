'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setMark } from '@/app/actions/marks'
import { AUTH_MESSAGES } from '@/lib/auth-errors'
import { nextStatus, type MarkStatus, type TitleSnapshot } from '@/lib/marks'
import type { MediaType } from '@/lib/media'
import { FOCUS_RING } from '@/lib/ui'

type Props = {
  type: MediaType
  tmdbId: number
  snapshot: TitleSnapshot
  initialStatus: MarkStatus | null
  loggedIn: boolean
  /** Página para onde voltar depois de entrar (a do próprio título). */
  returnPath: string
}

const BUTTONS: { status: MarkStatus; label: string }[] = [
  { status: 'want', label: 'Quero assistir' },
  { status: 'watched', label: 'Já assisti' },
]

const BASE = `rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${FOCUS_RING}`

function look(status: MarkStatus, active: boolean): string {
  if (!active) return 'border-linha text-texto hover:border-texto/60'
  return status === 'watched' ? 'border-ambar bg-ambar text-noite' : 'border-texto bg-texto text-noite'
}

/** Botões "Quero assistir" e "Já assisti" da página de detalhes. */
export function MarkButtons({ type, tmdbId, snapshot, initialStatus, loggedIn, returnPath }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [failed, setFailed] = useState(false)
  const [pending, startTransition] = useTransition()
  const loginHref = `/entrar?voltar=${encodeURIComponent(returnPath)}`

  // Sem login: os botões levam para "Entrar" e, depois, de volta a este título.
  if (!loggedIn) {
    return (
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map((b) => (
          <Link key={b.status} href={loginHref} className={`${BASE} ${look(b.status, false)}`}>
            {b.label}
          </Link>
        ))}
      </div>
    )
  }

  function click(clicked: MarkStatus) {
    const target = nextStatus(status, clicked)
    setFailed(false)
    startTransition(async () => {
      const result = await setMark({ mediaType: type, tmdbId, status: target, snapshot })
      if (result.ok) setStatus(target)
      else if (result.reason === 'login') router.push(loginHref) // sessão vencida
      else setFailed(true)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map((b) => {
          const active = status === b.status
          return (
            <button
              key={b.status}
              type="button"
              onClick={() => click(b.status)}
              disabled={pending}
              aria-pressed={active}
              className={`${BASE} ${look(b.status, active)}`}
            >
              {active && <span aria-hidden>✓ </span>}
              {b.label}
            </button>
          )
        })}
      </div>
      {failed && (
        <p role="alert" className="text-sm text-red-300">
          {AUTH_MESSAGES.connection}
        </p>
      )}
    </div>
  )
}
