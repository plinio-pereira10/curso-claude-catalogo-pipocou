import { unstable_rethrow } from 'next/navigation'
import type { Filters } from './filters'
import type { MediaType } from './media'
import { getProviderRow, getTitleLogo, getTopProviders } from './tmdb/titles'
import type { Provider, TitleSummary } from './tmdb/types'

/** Uma fileira da tela inicial: um streaming e os títulos mais populares dele. */
export type ProviderRow = { provider: Provider; titles: TitleSummary[] }

/** Um destaque do banner: o título, o streaming onde ele está e a arte com o nome (se houver). */
export type FeaturedItem = { title: TitleSummary; provider: Provider; logoPath: string | null }

export type HomeData = { rows: ProviderRow[]; featured: FeaturedItem[] }

/** Quantos destaques o banner mostra, no máximo. */
export const MAX_FEATURED = 5

/** Tem algum filtro na URL? Sem nenhum, a página mostra banner + fileiras; com algum, a grade. */
export function hasActiveFilters(f: Omit<Filters, 'page'>): boolean {
  return Boolean(f.providerId || f.genreId || f.minRating || f.sort || f.q || f.doramas)
}

/**
 * Destaques do banner: o 1º título de cada fileira que tem imagem de cena,
 * sem repetir um título que já é destaque de outra fileira.
 */
export function pickFeatured(rows: ProviderRow[], max = MAX_FEATURED): Omit<FeaturedItem, 'logoPath'>[] {
  const picked: Omit<FeaturedItem, 'logoPath'>[] = []
  const used = new Set<number>()
  for (const row of rows) {
    if (picked.length >= max) break
    const title = row.titles.find((t) => t.backdropPath && !used.has(t.id))
    if (!title) continue
    used.add(title.id)
    picked.push({ title, provider: row.provider })
  }
  return picked
}

/**
 * Busca tudo da tela inicial: uma fileira por streaming e os destaques do banner.
 * Uma fileira que falha some sozinha; se todas falharem, o erro sobe (página de erro).
 */
export async function loadHome(type: MediaType): Promise<HomeData> {
  const providers = await getTopProviders(type)
  const results = await Promise.allSettled(providers.map((p) => getProviderRow(type, p.id)))

  const rows: ProviderRow[] = []
  const errors: unknown[] = []
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      if (result.value.length > 0) rows.push({ provider: providers[i], titles: result.value })
    } else {
      // Erros internos do Next (ex.: fim do prerender) precisam continuar subindo.
      unstable_rethrow(result.reason)
      errors.push(result.reason)
    }
  })
  if (providers.length > 0 && errors.length === providers.length) throw errors[0]

  const picked = pickFeatured(rows)
  const logos = await Promise.allSettled(picked.map((f) => getTitleLogo(type, f.title.id)))
  const featured = picked.map((f, i) => {
    const logo = logos[i]
    if (logo.status === 'rejected') unstable_rethrow(logo.reason)
    return { ...f, logoPath: logo.status === 'fulfilled' ? logo.value : null }
  })

  return { rows, featured }
}
