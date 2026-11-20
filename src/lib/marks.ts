import type { MediaType } from './media'

/** Em qual lista o título está: "Quero assistir" (want) ou "Já assisti" (watched). */
export type MarkStatus = 'want' | 'watched'

/** Marcações da pessoa: "tipo:id" (ex.: "tv:5") → lista. */
export type MarkMap = Record<string, MarkStatus>

/** "Retrato" do título guardado ao marcar (para "Minhas listas" abrir sem consultar o TMDB). */
export type TitleSnapshot = {
  title: string
  posterPath: string | null
  backdropPath: string | null
  releaseYear: number | null
  voteAverage: number
}

/** Chave de um título no mapa de marcações: ("tv", 5) → "tv:5". */
export function markKey(type: MediaType, id: number): string {
  return `${type}:${id}`
}

/** O que acontece ao clicar num botão: o mesmo botão desmarca (null); o outro troca de lista. */
export function nextStatus(current: MarkStatus | null, clicked: MarkStatus): MarkStatus | null {
  return current === clicked ? null : clicked
}
