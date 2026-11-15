'use client'

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="space-y-4 py-10 text-center">
      <p>Não foi possível carregar os filmes agora.</p>
      <button type="button" onClick={() => retry()} className="rounded bg-white px-4 py-2 text-sm font-medium text-black">
        Tentar de novo
      </button>
    </div>
  )
}
