import type { Metadata } from 'next'
import { CatalogPage } from '@/components/CatalogPage'

export const metadata: Metadata = { title: 'Séries — Catálogo' }

/** Aba Séries. */
export default function SeriesPage({ searchParams }: PageProps<'/series'>) {
  return <CatalogPage type="tv" searchParams={searchParams} />
}
