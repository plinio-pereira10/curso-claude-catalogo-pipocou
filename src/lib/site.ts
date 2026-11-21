/** Nome do site (aparece no logo e nos títulos das abas do navegador). */
export const SITE_NAME = 'Pipocou'

/** Título da aba de uma página interna: "Séries — Pipocou". */
export function pageTitle(name: string): string {
  return `${name} — ${SITE_NAME}`
}
