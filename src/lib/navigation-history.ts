import { MEDIA, type MediaType } from './media'

/**
 * Guarda as páginas do site visitadas nesta aba (some ao recarregar a página).
 * Serve para o botão "Voltar" saber se pode voltar sem sair do site e para onde vai.
 * (O `document.referrer` não serve: no Next.js, clicar num link não recarrega a página.)
 */
export type HistorySnapshot = {
  visits: number
  firstPath: string | null
  currentPath: string | null
  previousPath: string | null
}

const EMPTY: HistorySnapshot = { visits: 0, firstPath: null, currentPath: null, previousPath: null }

let snapshot: HistorySnapshot = EMPTY
const listeners = new Set<() => void>()

/** Registra uma visita; repetir a mesma página não conta. Avisa quem está acompanhando. */
export function recordVisit(path: string) {
  if (path === snapshot.currentPath) return
  snapshot = {
    visits: snapshot.visits + 1,
    firstPath: snapshot.firstPath ?? path,
    currentPath: path,
    previousPath: snapshot.currentPath,
  }
  for (const listener of listeners) listener()
}

/** Para `useSyncExternalStore`: o estado atual (o mesmo objeto enquanto nada muda). */
export function getHistorySnapshot(): HistorySnapshot {
  return snapshot
}

/** No servidor não há histórico: o botão começa como se fosse a primeira página. */
export function getServerHistorySnapshot(): HistorySnapshot {
  return EMPTY
}

export function subscribeHistory(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Dá para voltar sem sair do site?
 * Não, se esta é a primeira página aberta na aba — inclusive quando a pessoa voltou até ela
 * pelo botão do navegador (antes dela no histórico só existe o que veio de fora).
 * Limitação aceita: chegar de novo à primeira página por um link do site também leva à lista.
 */
function canGoBack(s: HistorySnapshot): boolean {
  return s.visits > 1 && s.currentPath !== s.firstPath
}

export function hasInAppHistory(): boolean {
  return canGoBack(snapshot)
}

/** Nome das páginas que o botão sabe dizer. */
const DESTINATIONS: Record<string, string> = {
  [MEDIA.movie.listPath]: MEDIA.movie.label,
  [MEDIA.tv.listPath]: MEDIA.tv.label,
  '/minhas-listas': 'Minhas listas',
}

/**
 * Texto do botão "Voltar": diz para onde ele leva.
 * Sem página anterior no site → a lista do tipo do título (é para lá que o botão vai).
 */
export function backLabel(type: MediaType, s: HistorySnapshot): string {
  if (!canGoBack(s)) return `Voltar para ${MEDIA[type].label}`
  const name = s.previousPath ? DESTINATIONS[s.previousPath] : undefined
  return name ? `Voltar para ${name}` : 'Voltar'
}
