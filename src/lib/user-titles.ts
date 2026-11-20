import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { markKey, type MarkMap, type MarkStatus, type TitleSnapshot } from '@/lib/marks'
import type { MediaType } from '@/lib/media'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** Um título salvo nas listas da pessoa. */
export type SavedTitle = TitleSnapshot & { mediaType: MediaType; tmdbId: number }

// Todas estas funções leem o cookie de sessão: use só dentro de <Suspense>, nunca em 'use cache'.
// Além das regras de segurança do banco (RLS), as consultas filtram pelo user_id da pessoa logada.

/** Todas as marcações da pessoa, para as etiquetas dos cartões. Sem login ou com erro: {}. */
export async function getUserMarks(): Promise<MarkMap> {
  const user = await getCurrentUser()
  if (!user) return {}
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('user_titles')
      .select('media_type, tmdb_id, status')
      .eq('user_id', user.id)
    if (error || !data) return {}
    const marks: MarkMap = {}
    for (const row of data) marks[markKey(row.media_type, row.tmdb_id)] = row.status
    return marks
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: não foi possível ler as marcações', error)
    return {}
  }
}

/** Em qual lista um título está (ou null). */
export async function getTitleMark(type: MediaType, id: number): Promise<MarkStatus | null> {
  const user = await getCurrentUser()
  if (!user) return null
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('user_titles')
      .select('status')
      .eq('user_id', user.id)
      .eq('media_type', type)
      .eq('tmdb_id', id)
      .maybeSingle()
    if (error || !data) return null
    return data.status
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: não foi possível ler a marcação', error)
    return null
  }
}

/** Os títulos de uma lista, os marcados mais recentemente primeiro. */
export async function getMyList(status: MarkStatus): Promise<SavedTitle[]> {
  const user = await getCurrentUser()
  if (!user) return []
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('user_titles')
      .select('media_type, tmdb_id, title, poster_path, backdrop_path, release_year, vote_average')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('updated_at', { ascending: false })
    if (error || !data) return []
    return data.map((row) => ({
      mediaType: row.media_type,
      tmdbId: row.tmdb_id,
      title: row.title,
      posterPath: row.poster_path,
      backdropPath: row.backdrop_path,
      releaseYear: row.release_year,
      voteAverage: row.vote_average,
    }))
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: não foi possível ler a lista', error)
    return []
  }
}

/** Quantos títulos há em cada lista (para as sub-abas). */
export async function countMyLists(): Promise<{ want: number; watched: number }> {
  const counts = { want: 0, watched: 0 }
  const user = await getCurrentUser()
  if (!user) return counts
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.from('user_titles').select('status').eq('user_id', user.id)
    if (error || !data) return counts
    for (const row of data) counts[row.status as MarkStatus]++
    return counts
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: não foi possível contar as listas', error)
    return counts
  }
}
