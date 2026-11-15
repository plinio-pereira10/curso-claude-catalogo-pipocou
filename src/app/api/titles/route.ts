import type { NextRequest } from 'next/server'
import { loadCatalogPage } from '@/lib/catalog'
import { parseFilters } from '@/lib/filters'
import { parseMediaType } from '@/lib/media'
import { getTopProviders } from '@/lib/tmdb/titles'

/**
 * Usada pelo botão "Carregar mais": devolve a página pedida, com os mesmos filtros da lista.
 * `type=tv` para séries; qualquer outro valor vale como filmes.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = parseMediaType(searchParams.get('type'))
  const filters = parseFilters(Object.fromEntries(searchParams))
  try {
    const providers = filters.q || filters.providerId ? [] : await getTopProviders(type)
    const page = await loadCatalogPage(
      type,
      filters,
      providers.map((p) => p.id),
    )
    return Response.json(page)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Falha ao buscar títulos' }, { status: 502 })
  }
}
