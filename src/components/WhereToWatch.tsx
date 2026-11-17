'use client'

import { useState } from 'react'
import Image from 'next/image'
import { logoUrl } from '@/lib/images'
import type { Availability } from '@/lib/availability'

/** Quantos países aparecem antes do botão "ver todos". */
const INITIAL_COUNTRIES = 5

type Props = {
  availability: Availability
  /** Página "onde assistir" do TMDB para o Brasil (só existe quando há assinatura no Brasil). */
  brazilLink?: string | null
}

export function WhereToWatch({ availability, brazilLink }: Props) {
  const [showAll, setShowAll] = useState(false)
  const { brazil, otherCountries } = availability

  if (brazil.length > 0) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Onde assistir</h2>
        <div className="flex flex-wrap gap-3">
          {brazil.map((p) => (
            <Image
              key={p.id}
              src={logoUrl(p.logoPath)}
              alt={p.name}
              title={p.name}
              width={48}
              height={48}
              className="rounded-lg"
            />
          ))}
        </div>
        {brazilLink && (
          <a
            href={brazilLink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm underline hover:text-texto"
          >
            Onde Assistir ↗
          </a>
        )}
      </section>
    )
  }

  if (otherCountries.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Onde assistir</h2>
        <p className="text-suave">Não disponível em streaming no momento.</p>
      </section>
    )
  }

  const visible = showAll ? otherCountries : otherCountries.slice(0, INITIAL_COUNTRIES)

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Onde assistir</h2>
      <p className="text-suave">Não disponível em streaming no Brasil.</p>
      <p className="mt-3">Disponível em outros países:</p>
      <ul className="mt-1 space-y-1 text-sm text-texto/85">
        {visible.map((c) => (
          <li key={c.code}>
            {c.name} — {c.providers.map((p) => p.name).join(', ')}
          </li>
        ))}
      </ul>
      {!showAll && otherCountries.length > INITIAL_COUNTRIES && (
        <button type="button" onClick={() => setShowAll(true)} className="mt-2 text-sm underline">
          ver todos os {otherCountries.length} países
        </button>
      )}
    </section>
  )
}
