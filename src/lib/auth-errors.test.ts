import { authErrorMessage, validateCredentials } from './auth-errors'

test('authErrorMessage mapeia os códigos do Supabase', () => {
  expect(authErrorMessage({ code: 'invalid_credentials' })).toBe('E-mail ou senha incorretos.')
  expect(authErrorMessage({ code: 'user_already_exists' })).toBe('Este e-mail já tem uma conta.')
  expect(authErrorMessage({ code: 'email_exists' })).toBe('Este e-mail já tem uma conta.')
  expect(authErrorMessage({ code: 'weak_password' })).toBe('A senha precisa ter pelo menos 6 caracteres.')
  expect(authErrorMessage({ code: 'email_address_invalid' })).toBe('Informe um e-mail válido.')
  expect(authErrorMessage({ code: 'validation_failed' })).toBe('Informe um e-mail válido.')
})

test('authErrorMessage para o resto mostra erro de conexão', () => {
  expect(authErrorMessage({ code: 'over_request_rate_limit' })).toBe('Não foi possível conectar. Tente de novo.')
  expect(authErrorMessage(null)).toBe('Não foi possível conectar. Tente de novo.')
})

test('validateCredentials confere e-mail e senha antes de chamar o Supabase', () => {
  expect(validateCredentials('plinio@x.com', '123456')).toBeNull()
  expect(validateCredentials('plinio', '123456')).toBe('Informe um e-mail válido.')
  expect(validateCredentials('', '123456')).toBe('Informe um e-mail válido.')
  expect(validateCredentials('plinio@x.com', '12345')).toBe('A senha precisa ter pelo menos 6 caracteres.')
})
