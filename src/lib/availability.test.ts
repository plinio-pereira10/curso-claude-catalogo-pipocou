import { summarizeAvailability, countryName } from './availability'

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
