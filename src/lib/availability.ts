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

export function summarizeAvailability(byCountry: ProvidersByCountry): Availability {
  const otherCountries = Object.entries(byCountry)
    .filter(([code]) => code !== 'BR')
    .map(([code, providers]) => ({ code, name: countryName(code), providers }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  return { brazil: byCountry.BR ?? [], otherCountries }
}
