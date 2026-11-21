import { MEDIA, type MediaType } from './media'

/**
 * Guarda o caminho de páginas do site nesta aba (some ao recarregar a página), como uma pilha:
 * entrar numa página empilha; voltar para a página anterior (pelo botão do navegador ou pelo
 * "Voltar") desempilha. Serve para o botão "Voltar" saber se pode voltar sem sair do site e
 * dizer para onde vai. (O `document.referrer` não serve: no Next.js, clicar num link não
 * recarrega a página.)
 */
export type HistorySnapshot = {
  /** Da primeira página aberta (início) até a atual (fim). */
  stack: readonly string[]
}

const EMPTY: HistorySnapshot = { stack: [] }

let snapshot: HistorySnapshot = EMPTY
const listeners = new Set<() => void>()

/**
 * Registra a página atual. Repetir a mesma página não conta. Chegar na página anterior da
 * pilha é tratado como "voltar" (desempilha); qualquer outra página é empilhada.
 */
export function recordVisit(path: string) {
  const { stack } = snapshot
  if (path === stack.at(-1)) return
  const wentBack = stack.length >= 2 && path === stack.at(-2)
  snapshot = { stack: wentBack ? stack.slice(0, -1) : [...stack, path] }
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
 * Dá para voltar sem sair do site? Só se houver uma página do site antes da atual na pilha.
 * Na primeira página aberta (inclusive depois de voltar até ela pelo navegador), não: antes
 * dela só existe o que veio de fora.
 */
function canGoBack(s: HistorySnapshot): boolean {
  return s.stack.length > 1
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
 * Texto do botão "Voltar": diz para onde ele leva (a página anterior na pilha).
 * Sem página anterior no site → a lista do tipo do título (é para lá que o botão vai).
 */
export function backLabel(type: MediaType, s: HistorySnapshot): string {
  if (!canGoBack(s)) return `Voltar para ${MEDIA[type].label}`
  const name = DESTINATIONS[s.stack.at(-2) ?? '']
  return name ? `Voltar para ${name}` : 'Voltar'
}
