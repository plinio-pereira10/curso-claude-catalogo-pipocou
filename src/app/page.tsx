import { CatalogPage } from '@/components/CatalogPage'

/** Aba Filmes. */
export default function Home({ searchParams }: PageProps<'/'>) {
  return <CatalogPage type="movie" searchParams={searchParams} />
}
