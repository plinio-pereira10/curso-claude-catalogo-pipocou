'use client'

import { useState, type InputHTMLAttributes } from 'react'
import { FOCUS_RING } from '@/lib/ui'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>

const INPUT = `w-full rounded-lg border border-linha bg-superficie py-2.5 pr-12 pl-4 text-base ${FOCUS_RING}`

/**
 * Campo de senha com botão de olho para mostrar/esconder o que foi digitado.
 * O botão é nosso (funciona em todos os navegadores); o olho próprio do Edge
 * fica escondido no globals.css para não aparecerem dois.
 */
export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={INPUT} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
        className={`absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-md text-suave hover:text-texto ${FOCUS_RING}`}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {/* Risco por cima do olho enquanto a senha está à mostra ("clique para esconder"). */}
          {visible && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </div>
  )
}
