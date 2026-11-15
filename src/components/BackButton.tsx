'use client'

import { useRouter } from 'next/navigation'

/** Volta para a lista mantendo os filtros. Se a pessoa abriu o link direto, vai para o início. */
export function BackButton() {
  const router = useRouter()

  function goBack() {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <button type="button" onClick={goBack} className="text-sm text-zinc-400 hover:text-white">
      ← voltar
    </button>
  )
}
