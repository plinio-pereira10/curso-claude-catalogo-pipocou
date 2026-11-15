import type { NextRequest } from 'next/server'
import { loadCatalogPage } from '@/lib/catalog'
import { parseFilters } from '@/lib/filters'
import { getTopProviders } from '@/lib/tmdb/titles'

/** Usada pelo botão "Carregar mais": devolve a página pedida, com os mesmos filtros da lista. */
export async function GET(request: NextRequest) {
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams))
  try {
    const providers = filters.q || filters.providerId ? [] : await getTopProviders('movie')
    const page = await loadCatalogPage(
      filters,
      providers.map((p) => p.id),
    )
    return Response.json(page)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Falha ao buscar filmes' }, { status: 502 })
  }
}
