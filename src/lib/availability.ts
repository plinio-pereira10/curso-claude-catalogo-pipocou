import type { Provider, ProvidersByCountry } from './tmdb/types'

export type CountryAvailability = {
  code: string
  name: string
  providers: Provider[]
}

export type Availability = {
  /** Serviços de assinatura no Brasil (vazio se não houver). */
  brazil: Provider[]
  /** Outros países onde o filme está por assinatura, em ordem alfabética. */
  otherCountries: CountryAvailability[]
}

const regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' })

/** Nome do país em português (ex.: "US" → "Estados Unidos"). Se não conhecer, devolve o código. */
export function countryName(code: string): string {
  try {
    const name = regionNames.of(code)
    return name && name !== code ? name : code
  } catch {
    return code
  }
}

/** Variações de um mesmo serviço (ex.: "Netflix Standard with Ads", "HBO Max Amazon Channel"). */
const VARIANT_SUFFIXES = [' with Ads', ' Standard', ' Amazon Channel', ' Premium']

/** Nome sem os sufixos de variação: "Netflix Standard with Ads" → "Netflix". */
function baseName(name: string): string {
  let base = name
  let changed = true
  while (changed) {
    changed = false
    for (const suffix of VARIANT_SUFFIXES) {
      if (base.endsWith(suffix)) {
        base = base.slice(0, -suffix.length)
        changed = true
      }
    }
  }
  return base
}

/**
 * Esconde variações de um serviço quando o serviço principal também aparece.
 * Ex.: Netflix + "Netflix Standard with Ads" → só Netflix.
 * Uma variação sozinha (ex.: "Telecine Amazon Channel" sem o Telecine) continua aparecendo.
 */
export function dedupeProviders(providers: Provider[]): Provider[] {
  const names = new Set(providers.map((p) => p.name))
  const seen = new Set<string>()
  return providers.filter((p) => {
    const base = baseName(p.name)
    const isVariantOfListedService = base !== p.name && names.has(base)
    if (isVariantOfListedService || seen.has(base)) return false
    seen.add(base)
    return true
  })
}

export function summarizeAvailability(byCountry: ProvidersByCountry): Availability {
  const otherCountries = Object.entries(byCountry)
    .filter(([code]) => code !== 'BR')
    .map(([code, providers]) => ({ code, name: countryName(code), providers: dedupeProviders(providers) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  return { brazil: dedupeProviders(byCountry.BR ?? []), otherCountries }
}
