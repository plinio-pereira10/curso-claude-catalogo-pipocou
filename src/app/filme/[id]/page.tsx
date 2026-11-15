import { TitleDetailsPage, titleMetadata } from '@/components/TitleDetailsPage'

export function generateMetadata({ params }: PageProps<'/filme/[id]'>) {
  return titleMetadata('movie', params)
}

export default function MoviePage({ params }: PageProps<'/filme/[id]'>) {
  return <TitleDetailsPage type="movie" params={params} />
}
