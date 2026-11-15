/**
 * Conta as páginas do site visitadas nesta aba (some ao recarregar a página).
 * Serve para o botão "← voltar" saber se pode voltar sem sair do site.
 * (O `document.referrer` não serve: no Next.js, clicar num link não recarrega a página.)
 */
let visits = 0
let lastPath: string | null = null

/** Registra uma visita; repetir a mesma página não conta. */
export function recordVisit(path: string) {
  if (path === lastPath) return
  lastPath = path
  visits++
}

/** Já passou por mais de uma página do site nesta aba? */
export function hasInAppHistory(): boolean {
  return visits > 1
}
