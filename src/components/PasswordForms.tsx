'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset, updatePassword, type AuthState, type ResetRequestState } from '@/app/actions/auth'
import { AUTH_MESSAGES, MIN_PASSWORD_LENGTH } from '@/lib/auth-errors'
import { FOCUS_RING } from '@/lib/ui'
import { PasswordInput } from './PasswordInput'

const INPUT = `w-full rounded-lg border border-linha bg-superficie px-4 py-2.5 text-base ${FOCUS_RING}`
const BUTTON = `w-full rounded-full bg-texto px-4 py-2.5 font-semibold text-noite disabled:opacity-60 ${FOCUS_RING}`

function ErrorBox({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
      {message}
    </p>
  )
}

/** Tela "Esqueci minha senha": pede o e-mail e manda o link. */
export function ForgotPasswordForm({ linkExpired }: { linkExpired: boolean }) {
  const [state, formAction, pending] = useActionState<ResetRequestState, FormData>(requestPasswordReset, {
    error: null,
    sent: false,
  })

  return (
    <form action={formAction} className="mx-auto w-full max-w-sm space-y-5">
      <h1 className="text-2xl font-extrabold">Esqueci minha senha</h1>

      {linkExpired && !state.sent && <ErrorBox message={AUTH_MESSAGES.linkExpired} />}

      {state.sent ? (
        <p className="rounded-lg border border-linha bg-superficie px-4 py-3 text-sm">{AUTH_MESSAGES.resetSent}</p>
      ) : (
        <>
          <p className="text-sm text-suave">Informe o e-mail da sua conta. Vamos mandar um link para você criar uma senha nova.</p>
          <label className="block space-y-1.5">
            <span className="text-sm text-suave">E-mail</span>
            <input name="email" type="email" autoComplete="email" required className={INPUT} />
          </label>
          {state.error && <ErrorBox message={state.error} />}
          <button type="submit" disabled={pending} className={BUTTON}>
            {pending ? 'Aguarde…' : 'Enviar link'}
          </button>
        </>
      )}

      <p className="text-center text-sm text-suave">
        <Link href="/entrar" className={`rounded font-semibold text-texto underline ${FOCUS_RING}`}>
          Voltar para Entrar
        </Link>
      </p>
    </form>
  )
}

/** Tela "Nova senha": aberta pelo link do e-mail. */
export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(updatePassword, { error: null })

  return (
    <form action={formAction} className="mx-auto w-full max-w-sm space-y-5">
      <h1 className="text-2xl font-extrabold">Nova senha</h1>

      <div className="space-y-1.5">
        <label className="block space-y-1.5">
          <span className="text-sm text-suave">Nova senha</span>
          <PasswordInput
            name="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            aria-describedby="dica-nova-senha"
          />
        </label>
        <p id="dica-nova-senha" className="text-xs text-suave">
          Use pelo menos {MIN_PASSWORD_LENGTH} caracteres.
        </p>
      </div>

      {state.error && (
        <div className="space-y-2">
          <ErrorBox message={state.error} />
          {state.error === AUTH_MESSAGES.linkExpired && (
            <Link href="/esqueci-senha" className={`block text-center text-sm font-semibold underline ${FOCUS_RING}`}>
              Pedir um novo link
            </Link>
          )}
        </div>
      )}

      <button type="submit" disabled={pending} className={BUTTON}>
        {pending ? 'Aguarde…' : 'Salvar senha'}
      </button>
    </form>
  )
}
