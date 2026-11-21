import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site'
import { NewPasswordForm } from '@/components/PasswordForms'
import { TopBar } from '@/components/TopBar'
import { GUTTER } from '@/lib/ui'

export const metadata: Metadata = { title: pageTitle('Nova senha') }

/**
 * Tela "Nova senha", aberta pelo link do e-mail (que cria a sessão de recuperação).
 * Sem essa sessão, salvar mostra "Este link não vale mais" com o link para pedir outro.
 */
export default function NovaSenhaPage() {
  return (
    <>
      <TopBar type="movie" />
      <div className={`${GUTTER} py-12`}>
        <NewPasswordForm />
      </div>
    </>
  )
}
