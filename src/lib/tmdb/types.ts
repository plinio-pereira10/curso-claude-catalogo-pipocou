/** Um filme ou série na lista (cartão). Para séries, `title` guarda o nome da série. */
export type TitleSummary = {
  id: number
  title: string
  posterPath: string | null
  /** Imagem de cena (deitada), usada no banner e nos cartões. */
  backdropPath: string | null
  releaseYear: number | null
  voteAverage: number
  /** Sinopse ('' quando o TMDB não tem). */
  overview: string
}

/** Uma página de resultados. `totalPages` já vem limitado a 500 (limite do TMDB). */
export type TitlePage = {
  results: TitleSummary[]
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
export type TitleDetails = TitleSummary & {
  /** Duração em minutos (só filmes). */
  runtime: number | null
  /** Número de temporadas (só séries). */
  seasons: number | null
  genres: Genre[]
}

/** Código do país (ex.: "BR") → serviços de assinatura onde o título está. */
export type ProvidersByCountry = Record<string, Provider[]>

/** Onde assistir: serviços por país + link do TMDB para o Brasil (só se houver assinatura no Brasil). */
export type WatchProviders = {
  byCountry: ProvidersByCountry
  brazilLink: string | null
}
