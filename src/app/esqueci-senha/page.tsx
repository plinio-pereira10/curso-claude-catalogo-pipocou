import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site'
import { Suspense } from 'react'
import { ForgotPasswordForm } from '@/components/PasswordForms'
import { TopBar } from '@/components/TopBar'
import { GUTTER } from '@/lib/ui'

export const metadata: Metadata = { title: pageTitle('Esqueci minha senha') }

export default function EsqueciSenhaPage({ searchParams }: PageProps<'/esqueci-senha'>) {
  return (
    <>
      <TopBar type="movie" />
      <div className={`${GUTTER} py-12`}>
        <Suspense fallback={<p className="text-center text-suave">Carregando…</p>}>
          <Content searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}

/** `?erro=link`: veio de um link de e-mail vencido ou já usado. */
async function Content({ searchParams }: Pick<PageProps<'/esqueci-senha'>, 'searchParams'>) {
  const { erro } = await searchParams
  return <ForgotPasswordForm linkExpired={erro === 'link'} />
}
