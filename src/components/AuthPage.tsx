import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { safeRedirectPath } from '@/lib/redirect'
import { GUTTER } from '@/lib/ui'
import { AuthForm } from './AuthForm'
import { TopBar } from './TopBar'

type Props = {
  mode: 'entrar' | 'criar-conta'
  searchParams: PageProps<'/entrar'>['searchParams']
}

/** Telas "Entrar" e "Criar conta". Quem já está logado vai direto para onde ia. */
export function AuthPage({ mode, searchParams }: Props) {
  return (
    <>
      <TopBar type="movie" />
      <div className={`${GUTTER} py-12`}>
        <Suspense fallback={<p className="text-center text-suave">Carregando…</p>}>
          <AuthContent mode={mode} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}

async function AuthContent({ mode, searchParams }: Props) {
  const raw = (await searchParams).voltar
  const voltar = safeRedirectPath(Array.isArray(raw) ? raw[0] : raw)
  if (await getCurrentUser()) redirect(voltar)
  return <AuthForm mode={mode} voltar={voltar} />
}
