import { summarizeAvailability, countryName, dedupeProviders } from './availability'

const netflix = { id: 8, name: 'Netflix', logoPath: '/n.png' }
const prime = { id: 119, name: 'Prime Video', logoPath: '/p.png' }
const max = { id: 1899, name: 'Max', logoPath: '/m.png' }

test('separa Brasil dos outros países e ordena por nome', () => {
  const r = summarizeAvailability({ US: [netflix], BR: [prime], PT: [max] })
  expect(r.brazil).toEqual([prime])
  expect(r.otherCountries.map((c) => c.name)).toEqual(['Estados Unidos', 'Portugal'])
  expect(r.otherCountries[0]).toEqual({ code: 'US', name: 'Estados Unidos', providers: [netflix] })
})

test('ordena com acentos em português', () => {
  const r = summarizeAvailability({ ZA: [netflix], AT: [netflix], DE: [netflix] })
  expect(r.otherCountries.map((c) => c.name)).toEqual(['África do Sul', 'Alemanha', 'Áustria'])
})

test('sem Brasil devolve lista vazia para o Brasil', () => {
  expect(summarizeAvailability({ US: [netflix] }).brazil).toEqual([])
})

test('countryName traduz e devolve o código se desconhecido', () => {
  expect(countryName('GB')).toBe('Reino Unido')
  expect(countryName('QQ')).toBe('QQ')
})

const p = (id: number, name: string) => ({ id, name, logoPath: `/${id}.png` })

test('dedupeProviders esconde variações quando o principal existe', () => {
  expect(dedupeProviders([p(8, 'Netflix'), p(1796, 'Netflix Standard with Ads')])).toEqual([p(8, 'Netflix')])
  expect(dedupeProviders([p(1899, 'HBO Max'), p(1825, 'HBO Max Amazon Channel')])).toEqual([p(1899, 'HBO Max')])
})

test('dedupeProviders mantém variação sem o principal', () => {
  expect(dedupeProviders([p(2156, 'Telecine Amazon Channel')])).toEqual([p(2156, 'Telecine Amazon Channel')])
})

test('dedupeProviders com várias variações', () => {
  const result = dedupeProviders([
    p(119, 'Amazon Prime Video'),
    p(531, 'Paramount Plus'),
    p(2303, 'Paramount Plus Premium'),
    p(2100, 'Amazon Prime Video with Ads'),
  ])
  expect(result.map((x) => x.name)).toEqual(['Amazon Prime Video', 'Paramount Plus'])
})

test('summarizeAvailability aplica a regra no Brasil e nos outros países', () => {
  const r = summarizeAvailability({
    BR: [p(8, 'Netflix'), p(1796, 'Netflix Standard with Ads')],
    US: [p(1899, 'HBO Max'), p(1825, 'HBO Max Amazon Channel')],
  })
  expect(r.brazil).toEqual([p(8, 'Netflix')])
  expect(r.otherCountries[0].providers).toEqual([p(1899, 'HBO Max')])
})
