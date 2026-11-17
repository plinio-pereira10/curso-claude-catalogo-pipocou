import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import { Footer } from '@/components/Footer'
import './globals.css'

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Catálogo de Filmes e Séries',
  description: 'Filmes e séries disponíveis agora nos streamings do Brasil.',
}

/** O menu do topo (TopBar) fica em cada página, porque nas listas ele mostra os streamings. */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="relative flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
