'use client'

import Link from 'next/link'
import { FOCUS_RING, GUTTER } from '@/lib/ui'

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className={`${GUTTER} space-y-5 py-20 text-center`}>
      <p className="text-lg">Não foi possível carregar os dados agora.</p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className={`rounded-full bg-texto px-6 py-2 text-sm font-semibold text-noite ${FOCUS_RING}`}
        >
          Tentar de novo
        </button>
        <Link href="/" className={`rounded-full border border-linha px-6 py-2 text-sm ${FOCUS_RING}`}>
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
