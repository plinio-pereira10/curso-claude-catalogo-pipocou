import { GUTTER } from '@/lib/ui'

export function Footer() {
  return (
    <footer className={`mt-auto border-t border-linha py-6 text-sm text-suave ${GUTTER}`}>
      <p>
        Dados de filmes e séries fornecidos pelo{' '}
        <a href="https://www.themoviedb.org" className="underline hover:text-texto" target="_blank" rel="noreferrer">
          TMDB
        </a>
        . Disponibilidade em streaming fornecida pelo{' '}
        <a href="https://www.justwatch.com" className="underline hover:text-texto" target="_blank" rel="noreferrer">
          JustWatch
        </a>
        .
      </p>
      <p className="mt-1">Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.</p>
    </footer>
  )
}
