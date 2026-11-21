import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site'
import { CatalogPage } from '@/components/CatalogPage'

export const metadata: Metadata = { title: pageTitle('Séries') }

/** Aba Séries. */
export default function SeriesPage({ searchParams }: PageProps<'/series'>) {
  return <CatalogPage type="tv" searchParams={searchParams} />
}
