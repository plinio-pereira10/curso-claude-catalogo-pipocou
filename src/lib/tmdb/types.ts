/** Um filme na lista (cartão). */
export type MovieSummary = {
  id: number
  title: string
  posterPath: string | null
  releaseYear: number | null
  voteAverage: number
}

/** Uma página de resultados. `totalPages` já vem limitado a 500 (limite do TMDB). */
export type MoviePage = {
  results: MovieSummary[]
  page: number
  totalPages: number
}

/** Um serviço de streaming (Netflix, Prime Video...). */
export type Provider = {
  id: number
  name: string
  logoPath: string
}

export type Genre = {
  id: number
  name: string
}

/** Todas as informações da tela de detalhes. */
export type MovieDetails = MovieSummary & {
  overview: string
  runtime: number | null
  genres: Genre[]
}

/** Código do país (ex.: "BR") → serviços de assinatura onde o filme está. */
export type ProvidersByCountry = Record<string, Provider[]>
