'use client'

import { useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { MEDIA, type MediaType } from '@/lib/media'
import {
  backLabel,
  getHistorySnapshot,
  getServerHistorySnapshot,
  hasInAppHistory,
  subscribeHistory,
} from '@/lib/navigation-history'
import { FOCUS_RING } from '@/lib/ui'

/**
 * Botão "Voltar" da página de detalhes: claro, sobre a imagem de cena, dizendo para onde leva
 * (ex.: "Voltar para Séries"). Volta mantendo os filtros; se esta foi a primeira página aberta
 * (ex.: link do WhatsApp), vai para a lista da aba certa — nunca sai do site.
 */
export function BackButton({ type }: { type: MediaType }) {
  const router = useRouter()
  // acompanha o histórico: o menu registra a visita depois de desenhar, e o texto se ajusta
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot)
  const label = backLabel(type, history)
  const [prefix, destination] = label.startsWith('Voltar para ') ? ['Voltar para', label.slice(12)] : [label, '']

  function goBack() {
    if (hasInAppHistory()) router.back()
    else router.push(MEDIA[type].listPath)
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-2 rounded-full bg-texto py-1.5 pr-4 pl-1.5 text-sm text-noite shadow-lg shadow-black/40 transition-colors hover:bg-white ${FOCUS_RING}`}
    >
      <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-noite text-texto">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </span>
      <span className="font-bold">
        {destination ? (
          <>
            <span className="font-medium text-noite/65">{prefix}</span> {destination}
          </>
        ) : (
          prefix
        )}
      </span>
    </button>
  )
}
