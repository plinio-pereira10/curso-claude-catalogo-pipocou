vi.mock('server-only', () => ({}))

const { getCurrentUser, from } = vi.hoisted(() => ({ getCurrentUser: vi.fn(), from: vi.fn() }))
vi.mock('@/lib/auth', () => ({ getCurrentUser }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ from }) }))

import { countMyLists, getMyList, getTitleMark, getUserMarks } from './user-titles'

type FakeQuery = Record<'select' | 'eq' | 'order' | 'maybeSingle', ReturnType<typeof vi.fn>> & PromiseLike<unknown>

/** Consulta falsa do Supabase: cada método devolve a própria consulta; o await devolve `result`. */
function query(result: unknown): FakeQuery {
  const q = {} as FakeQuery
  for (const m of ['select', 'eq', 'order', 'maybeSingle'] as const) q[m] = vi.fn(() => q)
  ;(q as { then: unknown }).then = (resolve: (v: unknown) => void) => resolve(result)
  return q
}

const user = { id: 'u1', email: 'p@x.com', initial: 'P' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

test('getUserMarks sem login devolve {} sem consultar', async () => {
  getCurrentUser.mockResolvedValue(null)
  await expect(getUserMarks()).resolves.toEqual({})
  expect(from).not.toHaveBeenCalled()
})

test('getUserMarks monta o mapa tipo:id → lista', async () => {
  getCurrentUser.mockResolvedValue(user)
  const q = query({
    data: [
      { media_type: 'tv', tmdb_id: 5, status: 'want' },
      { media_type: 'movie', tmdb_id: 7, status: 'watched' },
    ],
    error: null,
  })
  from.mockReturnValue(q)
  await expect(getUserMarks()).resolves.toEqual({ 'tv:5': 'want', 'movie:7': 'watched' })
  expect(from).toHaveBeenCalledWith('user_titles')
  expect(q.eq).toHaveBeenCalledWith('user_id', 'u1')
})

test('getUserMarks com erro devolve {}', async () => {
  getCurrentUser.mockResolvedValue(user)
  from.mockReturnValue(query({ data: null, error: { message: 'falhou' } }))
  await expect(getUserMarks()).resolves.toEqual({})
})

test('getTitleMark devolve a lista do título ou null', async () => {
  getCurrentUser.mockResolvedValue(user)
  from.mockReturnValue(query({ data: { status: 'watched' }, error: null }))
  await expect(getTitleMark('movie', 7)).resolves.toBe('watched')
  from.mockReturnValue(query({ data: null, error: null }))
  await expect(getTitleMark('movie', 8)).resolves.toBeNull()
})

test('getMyList devolve o retrato dos títulos, mais recentes primeiro', async () => {
  getCurrentUser.mockResolvedValue(user)
  const q = query({
    data: [
      {
        media_type: 'tv',
        tmdb_id: 5,
        title: 'Round 6',
        poster_path: '/p.jpg',
        backdrop_path: '/b.jpg',
        release_year: 2021,
        vote_average: 7.9,
      },
    ],
    error: null,
  })
  from.mockReturnValue(q)
  await expect(getMyList('want')).resolves.toEqual([
    {
      mediaType: 'tv',
      tmdbId: 5,
      title: 'Round 6',
      posterPath: '/p.jpg',
      backdropPath: '/b.jpg',
      releaseYear: 2021,
      voteAverage: 7.9,
    },
  ])
  expect(q.eq).toHaveBeenCalledWith('status', 'want')
  expect(q.order).toHaveBeenCalledWith('updated_at', { ascending: false })
})

test('countMyLists conta cada lista', async () => {
  getCurrentUser.mockResolvedValue(user)
  from.mockReturnValue(query({ data: [{ status: 'want' }, { status: 'want' }, { status: 'watched' }], error: null }))
  await expect(countMyLists()).resolves.toEqual({ want: 2, watched: 1 })
})
