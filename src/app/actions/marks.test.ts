vi.mock('server-only', () => ({}))

const { lookupCurrentUser, from, refresh } = vi.hoisted(() => ({
  lookupCurrentUser: vi.fn(),
  from: vi.fn(),
  refresh: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({ lookupCurrentUser }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ from }) }))
vi.mock('next/cache', () => ({ refresh }))

import { setMark } from './marks'

const user = { id: 'u1', email: 'p@x.com', initial: 'P' }
const snapshot = { title: 'Round 6', posterPath: '/p.jpg', backdropPath: '/b.jpg', releaseYear: 2021, voteAverage: 7.9 }

type FakeTable = Record<'upsert' | 'delete' | 'eq', ReturnType<typeof vi.fn>> & PromiseLike<unknown>

/** Tabela falsa do Supabase: cada método devolve a própria tabela; o await devolve `result`. */
function table(result: unknown = { error: null }): FakeTable {
  const t = {} as FakeTable
  for (const m of ['upsert', 'delete', 'eq'] as const) t[m] = vi.fn(() => t)
  ;(t as { then: unknown }).then = (resolve: (v: unknown) => void) => resolve(result)
  return t
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

test('setMark sem usuário pede login', async () => {
  lookupCurrentUser.mockResolvedValue({ user: null, failed: false })
  await expect(setMark({ mediaType: 'tv', tmdbId: 5, status: 'want', snapshot })).resolves.toEqual({
    ok: false,
    reason: 'login',
  })
  expect(from).not.toHaveBeenCalled()
})

test('setMark grava com upsert e retrato', async () => {
  lookupCurrentUser.mockResolvedValue({ user, failed: false })
  const t = table()
  from.mockReturnValue(t)
  await expect(setMark({ mediaType: 'tv', tmdbId: 5, status: 'want', snapshot })).resolves.toEqual({ ok: true })
  expect(from).toHaveBeenCalledWith('user_titles')
  expect(t.upsert).toHaveBeenCalledWith(
    {
      user_id: 'u1',
      media_type: 'tv',
      tmdb_id: 5,
      status: 'want',
      title: 'Round 6',
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      release_year: 2021,
      vote_average: 7.9,
    },
    { onConflict: 'user_id,media_type,tmdb_id' },
  )
  expect(refresh).toHaveBeenCalled()
})

test('setMark com status null apaga a linha', async () => {
  lookupCurrentUser.mockResolvedValue({ user, failed: false })
  const t = table()
  from.mockReturnValue(t)
  await expect(setMark({ mediaType: 'movie', tmdbId: 7, status: null, snapshot })).resolves.toEqual({ ok: true })
  expect(t.delete).toHaveBeenCalled()
  expect(t.eq).toHaveBeenCalledWith('user_id', 'u1')
  expect(t.eq).toHaveBeenCalledWith('media_type', 'movie')
  expect(t.eq).toHaveBeenCalledWith('tmdb_id', 7)
})

test('setMark recusa dados inválidos', async () => {
  lookupCurrentUser.mockResolvedValue({ user, failed: false })
  const bad = [
    { mediaType: 'x', tmdbId: 5, status: 'want', snapshot },
    { mediaType: 'tv', tmdbId: 0, status: 'want', snapshot },
    { mediaType: 'tv', tmdbId: 1.5, status: 'want', snapshot },
    { mediaType: 'tv', tmdbId: 5, status: 'y', snapshot },
    { mediaType: 'tv', tmdbId: 5, status: 'want', snapshot: { ...snapshot, title: '' } },
  ]
  for (const input of bad) {
    await expect(setMark(input as never)).resolves.toEqual({ ok: false, reason: 'erro' })
  }
  expect(from).not.toHaveBeenCalled()
})

test('setMark recusa retrato inválido sem chamar o Supabase', async () => {
  lookupCurrentUser.mockResolvedValue({ user, failed: false })
  const bad = [
    { ...snapshot, title: 'a'.repeat(301) },
    { ...snapshot, posterPath: 'https://site-mal.com/x.jpg' },
    { ...snapshot, releaseYear: 3000 },
    { ...snapshot, voteAverage: 99 },
  ]
  for (const s of bad) {
    await expect(setMark({ mediaType: 'tv', tmdbId: 5, status: 'want', snapshot: s })).resolves.toEqual({
      ok: false,
      reason: 'erro',
    })
  }
  expect(from).not.toHaveBeenCalled()
})

test('setMark com falha do Supabase devolve erro', async () => {
  lookupCurrentUser.mockResolvedValue({ user, failed: false })
  from.mockReturnValue(table({ error: { message: 'falhou' } }))
  await expect(setMark({ mediaType: 'tv', tmdbId: 5, status: 'want', snapshot })).resolves.toEqual({
    ok: false,
    reason: 'erro',
  })
})

test('setMark com o Supabase fora do ar mostra erro (não manda entrar)', async () => {
  lookupCurrentUser.mockResolvedValue({ user: null, failed: true })
  await expect(setMark({ mediaType: 'tv', tmdbId: 5, status: 'want', snapshot })).resolves.toEqual({
    ok: false,
    reason: 'erro',
  })
  expect(from).not.toHaveBeenCalled()
})
