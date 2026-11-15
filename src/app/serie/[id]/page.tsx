import { TitleDetailsPage, titleMetadata } from '@/components/TitleDetailsPage'

export function generateMetadata({ params }: PageProps<'/serie/[id]'>) {
  return titleMetadata('tv', params)
}

export default function SeriesDetailsPage({ params }: PageProps<'/serie/[id]'>) {
  return <TitleDetailsPage type="tv" params={params} />
}
