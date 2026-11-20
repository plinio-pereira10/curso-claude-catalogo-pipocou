'use server'

import { refresh } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import type { MarkStatus, TitleSnapshot } from '@/lib/marks'
import type { MediaType } from '@/lib/media'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type SetMarkInput = {
  mediaType: MediaType
  tmdbId: number
  /** Lista nova; null = desmarcar. */
  status: MarkStatus | null
  snapshot: TitleSnapshot
}

export type SetMarkResult = { ok: true } | { ok: false; reason: 'login' | 'erro' }

/** Confere o que chegou do navegador (qualquer um pode chamar esta função com outros dados). */
function isValid(input: SetMarkInput): boolean {
  const { mediaType, tmdbId, status, snapshot } = input
  return (
    (mediaType === 'movie' || mediaType === 'tv') &&
    Number.isInteger(tmdbId) &&
    tmdbId > 0 &&
    (status === null || status === 'want' || status === 'watched') &&
    typeof snapshot?.title === 'string' &&
    snapshot.title.length > 0
  )
}

/**
 * Marca, troca de lista ou desmarca um título para a pessoa logada.
 * Um título fica em uma lista só (a tabela tem uma linha por pessoa + título).
 */
export async function setMark(input: SetMarkInput): Promise<SetMarkResult> {
  if (!isValid(input)) return { ok: false, reason: 'erro' }

  // A própria função confere quem está logado (o proxy só renova a sessão; não protege nada).
  const user = await getCurrentUser()
  if (!user) return { ok: false, reason: 'login' }

  const { mediaType, tmdbId, status, snapshot } = input
  try {
    const supabase = await createSupabaseServerClient()
    const table = supabase.from('user_titles')
    const { error } =
      status === null
        ? await table.delete().eq('user_id', user.id).eq('media_type', mediaType).eq('tmdb_id', tmdbId)
        : await table.upsert(
            {
              user_id: user.id,
              media_type: mediaType,
              tmdb_id: tmdbId,
              status,
              title: snapshot.title,
              poster_path: snapshot.posterPath,
              backdrop_path: snapshot.backdropPath,
              release_year: snapshot.releaseYear,
              vote_average: snapshot.voteAverage,
            },
            { onConflict: 'user_id,media_type,tmdb_id' },
          )
    if (error) {
      console.error('Supabase: não foi possível gravar a marcação', error)
      return { ok: false, reason: 'erro' }
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error('Supabase: não foi possível gravar a marcação', error)
    return { ok: false, reason: 'erro' }
  }

  refresh() // atualiza a página (etiquetas e listas) com o que acabou de ser gravado
  return { ok: true }
}
