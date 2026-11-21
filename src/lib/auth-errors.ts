/** Mensagens mostradas nas telas "Entrar" e "Criar conta". */
export const AUTH_MESSAGES = {
  invalidCredentials: 'E-mail ou senha incorretos.',
  emailTaken: 'Este e-mail já tem uma conta.',
  shortPassword: 'A senha precisa ter pelo menos 6 caracteres.',
  invalidEmail: 'Informe um e-mail válido.',
  connection: 'Não foi possível conectar. Tente de novo.',
  // "Esqueci minha senha"
  resetSent: 'Se existir uma conta com esse e-mail, enviamos um link para criar uma senha nova.',
  tooManyRequests: 'Muitos pedidos. Espere alguns minutos e tente de novo.',
  linkExpired: 'Este link não vale mais. Peça um novo abaixo.',
  samePassword: 'A senha nova precisa ser diferente da atual.',
}

/** Tamanho mínimo da senha (padrão do Supabase). */
export const MIN_PASSWORD_LENGTH = 6

/** Traduz o erro do Supabase para uma mensagem em português. */
export function authErrorMessage(error: { code?: string; message?: string; status?: number } | null): string {
  switch (error?.code) {
    case 'invalid_credentials':
      return AUTH_MESSAGES.invalidCredentials
    case 'user_already_exists':
    case 'email_exists':
      return AUTH_MESSAGES.emailTaken
    case 'weak_password':
      return AUTH_MESSAGES.shortPassword
    case 'email_address_invalid':
    case 'validation_failed':
      return AUTH_MESSAGES.invalidEmail
    default:
      return AUTH_MESSAGES.connection
  }
}

/** Confere e-mail e senha antes de chamar o Supabase. Devolve a mensagem de erro ou null. */
export function validateCredentials(email: string, password: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return AUTH_MESSAGES.invalidEmail
  if (password.length < MIN_PASSWORD_LENGTH) return AUTH_MESSAGES.shortPassword
  return null
}
