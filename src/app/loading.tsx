import { TopBar } from '@/components/TopBar'
import { GUTTER } from '@/lib/ui'

/**
 * Carregamento entre páginas: mantém o menu e mostra um aviso simples.
 * (A lista e os detalhes têm o próprio esqueleto; aqui não sabemos qual página vem.)
 */
export default function Loading() {
  return (
    <>
      <TopBar type="movie" />
      <p className={`${GUTTER} py-6 text-suave`}>Carregando…</p>
    </>
  )
}
