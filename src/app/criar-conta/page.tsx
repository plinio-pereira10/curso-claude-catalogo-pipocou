import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site'
import { AuthPage } from '@/components/AuthPage'

export const metadata: Metadata = { title: pageTitle('Criar conta') }

export default function CriarContaPage({ searchParams }: PageProps<'/criar-conta'>) {
  return <AuthPage mode="criar-conta" searchParams={searchParams} />
}
