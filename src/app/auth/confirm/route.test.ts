vi.mock('server-only', () => ({}))

const { verifyOtp } = vi.hoisted(() => ({ verifyOtp: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ auth: { verifyOtp } }) }))

import { NextRequest } from 'next/server'
import { GET } from './route'

const location = (res: Response) => new URL(res.headers.get('location') ?? '').pathname + new URL(res.headers.get('location') ?? '').search

beforeEach(() => {
  verifyOtp.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

test('GET /auth/confirm com token válido vai para /nova-senha', async () => {
  verifyOtp.mockResolvedValue({ error: null })
  const res = await GET(new NextRequest('https://site.app/auth/confirm?token_hash=abc&type=recovery'))
  expect(verifyOtp).toHaveBeenCalledWith({ type: 'recovery', token_hash: 'abc' })
  expect(location(res)).toBe('/nova-senha')
})

test('GET /auth/confirm sem token, tipo errado ou token recusado vai para /esqueci-senha?erro=link', async () => {
  for (const url of ['https://site.app/auth/confirm?type=recovery', 'https://site.app/auth/confirm?token_hash=abc&type=signup']) {
    const res = await GET(new NextRequest(url))
    expect(location(res)).toBe('/esqueci-senha?erro=link')
  }
  expect(verifyOtp).not.toHaveBeenCalled()
  verifyOtp.mockResolvedValue({ error: { code: 'otp_expired' } })
  const res = await GET(new NextRequest('https://site.app/auth/confirm?token_hash=velho&type=recovery'))
  expect(location(res)).toBe('/esqueci-senha?erro=link')
  verifyOtp.mockRejectedValue(new TypeError('fetch failed'))
  const res2 = await GET(new NextRequest('https://site.app/auth/confirm?token_hash=x&type=recovery'))
  expect(location(res2)).toBe('/esqueci-senha?erro=link')
})
