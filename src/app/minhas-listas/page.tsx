import type { Metadata } from 'next'
import { MyListsPage } from '@/components/MyListsPage'

export const metadata: Metadata = { title: 'Minhas listas — Catálogo' }

export default function MinhasListasPage({ searchParams }: PageProps<'/minhas-listas'>) {
  return <MyListsPage searchParams={searchParams} />
}
