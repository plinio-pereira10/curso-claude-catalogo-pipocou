'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn, signUp, type AuthState } from '@/app/actions/auth'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth-errors'
import { FOCUS_RING } from '@/lib/ui'
import { PasswordInput } from './PasswordInput'

type Mode = 'entrar' | 'criar-conta'

const TEXT: Record<Mode, { title: string; button: string; switchText: string; switchLink: string; switchPath: string }> = {
  entrar: {
    title: 'Entrar',
    button: 'Entrar',
    switchText: 'Ainda não tem conta?',
    switchLink: 'Criar conta',
    switchPath: '/criar-conta',
  },
  'criar-conta': {
    title: 'Criar conta',
    button: 'Criar conta',
    switchText: 'Já tem conta?',
    switchLink: 'Entrar',
    switchPath: '/entrar',
  },
}

/** Link para a outra tela, mantendo para onde voltar depois. */
function switchHref(path: string, voltar: string): string {
  return voltar === '/' ? path : `${path}?voltar=${encodeURIComponent(voltar)}`
}

const INPUT = `w-full rounded-lg border border-linha bg-superficie px-4 py-2.5 text-base ${FOCUS_RING}`

/** Formulário das telas "Entrar" e "Criar conta" (e-mail e senha). */
export function AuthForm({ mode, voltar }: { mode: Mode; voltar: string }) {
  const action = mode === 'entrar' ? signIn : signUp
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, { error: null })
  const text = TEXT[mode]

  return (
    <form action={formAction} className="mx-auto w-full max-w-sm space-y-5">
      <h1 className="text-2xl font-extrabold">{text.title}</h1>
      <input type="hidden" name="voltar" value={voltar} />

      <label className="block space-y-1.5">
        <span className="text-sm text-suave">E-mail</span>
        <input name="email" type="email" autoComplete="email" required className={INPUT} />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-suave">Senha</span>
        <PasswordInput
          name="password"
          autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        {mode === 'criar-conta' && (
          <span className="block text-xs text-suave">Use pelo menos {MIN_PASSWORD_LENGTH} caracteres.</span>
        )}
      </label>

      {mode === 'entrar' && (
        <p className="-mt-2 text-right text-sm">
          <Link href="/esqueci-senha" className={`rounded text-suave underline hover:text-texto ${FOCUS_RING}`}>
            Esqueci minha senha
          </Link>
        </p>
      )}

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`w-full rounded-full bg-texto px-4 py-2.5 font-semibold text-noite disabled:opacity-60 ${FOCUS_RING}`}
      >
        {pending ? 'Aguarde…' : text.button}
      </button>

      <p className="text-center text-sm text-suave">
        {text.switchText}{' '}
        <Link href={switchHref(text.switchPath, voltar)} className={`rounded font-semibold text-texto underline ${FOCUS_RING}`}>
          {text.switchLink}
        </Link>
      </p>
    </form>
  )
}
