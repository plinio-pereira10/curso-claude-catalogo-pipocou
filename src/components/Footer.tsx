export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 px-4 py-6 text-center text-sm text-zinc-400">
      <p>
        Dados de filmes e séries fornecidos pelo{' '}
        <a href="https://www.themoviedb.org" className="underline hover:text-white" target="_blank" rel="noreferrer">
          TMDB
        </a>
        . Disponibilidade em streaming fornecida pelo{' '}
        <a href="https://www.justwatch.com" className="underline hover:text-white" target="_blank" rel="noreferrer">
          JustWatch
        </a>
        .
      </p>
      <p className="mt-1">Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.</p>
    </footer>
  )
}
