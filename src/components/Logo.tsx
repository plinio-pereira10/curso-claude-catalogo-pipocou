import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'
import { FOCUS_RING } from '@/lib/ui'

/** Pipoca estourando (o pingo do "i" e o ícone do site). */
export function Pipoca({ className }: { className?: string }) {
  return (
    <svg data-pipoca aria-hidden="true" viewBox="0 0 26 24" className={className}>
      <path
        fill="var(--ambar)"
        d="M13 2c3 0 5 2 5.5 4.5C21 6 24 8 24 11.5c0 2.5-1.5 4.5-3.5 5 .5 3-2 5.5-5 5.5-1.2 0-2.2-.4-3-1-.8.6-1.8 1-3 1-3 0-5.5-2.5-5-5.5C2.5 16 1 14 1 11.5 1 8 4 6 6.5 6.5 7 4 10 2 13 2z"
      />
    </svg>
  )
}

/**
 * Logo "Pipocou" do menu do topo: letra redonda (Fredoka, carregada no layout) e o pingo
 * do "i" como uma pipoca âmbar. Link para a página inicial.
 */
export function Logo() {
  return (
    <Link href="/" aria-label={SITE_NAME} className={`rounded font-logo text-[26px] leading-none font-bold tracking-tight ${FOCUS_RING}`}>
      <span aria-hidden="true">
        P
        <span className="relative inline-block">
          {/* "ı" sem pingo; a pipoca faz o papel do pingo */}
          ı
          <Pipoca className="absolute -top-[9px] left-1/2 size-[13px] -translate-x-1/2" />
        </span>
        pocou
      </span>
    </Link>
  )
}
