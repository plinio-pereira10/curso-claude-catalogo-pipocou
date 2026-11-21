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

/** Limites do retrato (os mesmos que o banco confere em supabase/schema.sql). */
export const SNAPSHOT_LIMITS = { titleMax: 300, pathMax: 100, yearMin: 1870, yearMax: 2100 }

/** Caminho de imagem no formato do TMDB, ex.: "/abc123.jpg" (nunca um endereço de outro site). */
const IMAGE_PATH = /^\/[A-Za-z0-9._-]+$/

function isImagePath(value: unknown): boolean {
  if (value === null) return true
  return typeof value === 'string' && value.length <= SNAPSHOT_LIMITS.pathMax && IMAGE_PATH.test(value) && !value.includes('..')
}

/** O retrato que chegou do navegador segue as regras? (qualquer um pode mandar outros dados) */
export function isValidSnapshot(s: unknown): s is TitleSnapshot {
  if (typeof s !== 'object' || s === null) return false
  const { title, posterPath, backdropPath, releaseYear, voteAverage } = s as Record<string, unknown>
  return (
    typeof title === 'string' &&
    title.length >= 1 &&
    title.length <= SNAPSHOT_LIMITS.titleMax &&
    isImagePath(posterPath) &&
    isImagePath(backdropPath) &&
    (releaseYear === null ||
      (Number.isInteger(releaseYear) &&
        (releaseYear as number) >= SNAPSHOT_LIMITS.yearMin &&
        (releaseYear as number) <= SNAPSHOT_LIMITS.yearMax)) &&
    typeof voteAverage === 'number' &&
    voteAverage >= 0 &&
    voteAverage <= 10
  )
}

/** Chave de um título no mapa de marcações: ("tv", 5) → "tv:5". */
export function markKey(type: MediaType, id: number): string {
  return `${type}:${id}`
}

/** O que acontece ao clicar num botão: o mesmo botão desmarca (null); o outro troca de lista. */
export function nextStatus(current: MarkStatus | null, clicked: MarkStatus): MarkStatus | null {
  return current === clicked ? null : clicked
}
