/**
 * Guarda as páginas do site visitadas nesta aba (some ao recarregar a página).
 * Serve para o botão "← voltar" saber se pode voltar sem sair do site.
 * (O `document.referrer` não serve: no Next.js, clicar num link não recarrega a página.)
 */
let visits = 0
let firstPath: string | null = null
let currentPath: string | null = null

/** Registra uma visita; repetir a mesma página não conta. */
export function recordVisit(path: string) {
  if (path === currentPath) return
  if (firstPath === null) firstPath = path
  currentPath = path
  visits++
}

/**
 * Dá para voltar sem sair do site?
 * Não, se esta é a primeira página aberta na aba — inclusive quando a pessoa voltou até ela
 * pelo botão do navegador (antes dela no histórico só existe o que veio de fora).
 * Limitação aceita: chegar de novo à primeira página por um link do site também leva à lista.
 */
export function hasInAppHistory(): boolean {
  return visits > 1 && currentPath !== firstPath
}
