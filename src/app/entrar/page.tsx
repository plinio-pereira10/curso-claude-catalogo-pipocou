import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site'
import { AuthPage } from '@/components/AuthPage'

export const metadata: Metadata = { title: pageTitle('Entrar') }

export default function EntrarPage({ searchParams }: PageProps<'/entrar'>) {
  return <AuthPage mode="entrar" searchParams={searchParams} />
}
