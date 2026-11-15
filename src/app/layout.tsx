import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist } from 'next/font/google'
import { Footer } from '@/components/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Catálogo de Filmes',
  description: 'Filmes disponíveis agora nos streamings do Brasil.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-white/10 px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            🎬 Catálogo de Filmes
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
