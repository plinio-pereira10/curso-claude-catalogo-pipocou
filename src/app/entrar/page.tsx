import type { Metadata } from 'next'
import { AuthPage } from '@/components/AuthPage'

export const metadata: Metadata = { title: 'Entrar — Catálogo' }

export default function EntrarPage({ searchParams }: PageProps<'/entrar'>) {
  return <AuthPage mode="entrar" searchParams={searchParams} />
}
