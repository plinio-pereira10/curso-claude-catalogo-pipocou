/**
 * Endereço seguro para onde voltar depois de entrar (parâmetro `voltar`).
 * Só aceita caminhos do próprio site ("/serie/5"); qualquer outra coisa vira "/".
 * Impede que alguém use um link do site para mandar a pessoa a um site falso.
 */
export function safeRedirectPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/')) return '/'
  // "//site.com" e "/\site.com" são entendidos pelo navegador como outro site
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  // caracteres de controle (quebra de linha, tab...) nunca fazem parte de um caminho válido
  if (/[\u0000-\u001f\u007f]/.test(raw)) return '/'
  return raw
}
