import { GUTTER } from '@/lib/ui'

/** Esqueleto da tela inicial: o lugar do banner e duas fileiras de cartões. */
export function CatalogSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only">Carregando…</p>
      <div className="h-[60vh] min-h-[28rem] bg-superficie/60 motion-safe:animate-pulse lg:h-[70vh]" />
      <div className={`space-y-8 pt-6 pb-12 ${GUTTER}`}>
        {[0, 1].map((row) => (
          <div key={row} className="space-y-3">
            <div className="h-6 w-40 rounded bg-superficie motion-safe:animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {[0, 1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="aspect-video w-[70vw] shrink-0 rounded-lg bg-superficie motion-safe:animate-pulse sm:w-[42vw] lg:w-[24vw]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
