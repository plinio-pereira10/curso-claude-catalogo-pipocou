'use client'

import { useRouter } from 'next/navigation'
import { MEDIA, type MediaType } from '@/lib/media'
import { hasInAppHistory } from '@/lib/navigation-history'

/**
 * Volta para a página anterior do site (mantendo os filtros).
 * Se esta foi a primeira página aberta (ex.: link do WhatsApp), vai para a lista da aba certa.
 */
export function BackButton({ type }: { type: MediaType }) {
  const router = useRouter()

  function goBack() {
    if (hasInAppHistory()) router.back()
    else router.push(MEDIA[type].listPath)
  }

  return (
    <button type="button" onClick={goBack} className="text-sm text-zinc-400 hover:text-white">
      ← voltar
    </button>
  )
}
