import type { Metadata } from 'next'
import { Figtree, Fredoka } from 'next/font/google'
import { Footer } from '@/components/Footer'
import { SITE_NAME } from '@/lib/site'
import './globals.css'

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
})

/** Fonte só do logo "Pipocou" (classe font-logo). */
const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  weight: '700',
})

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'Filmes e séries disponíveis agora nos streamings do Brasil.',
}

/** O menu do topo (TopBar) fica em cada página, porque nas listas ele mostra os streamings. */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="relative flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
