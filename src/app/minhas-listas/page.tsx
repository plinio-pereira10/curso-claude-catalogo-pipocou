import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site'
import { MyListsPage } from '@/components/MyListsPage'

export const metadata: Metadata = { title: pageTitle('Minhas listas') }

export default function MinhasListasPage({ searchParams }: PageProps<'/minhas-listas'>) {
  return <MyListsPage searchParams={searchParams} />
}
