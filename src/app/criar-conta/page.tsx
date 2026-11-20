import type { Metadata } from 'next'
import { AuthPage } from '@/components/AuthPage'

export const metadata: Metadata = { title: 'Criar conta — Catálogo' }

export default function CriarContaPage({ searchParams }: PageProps<'/criar-conta'>) {
  return <AuthPage mode="criar-conta" searchParams={searchParams} />
}
