import Link from 'next/link'

export default function MovieNotFound() {
  return (
    <div className="space-y-4 py-10 text-center">
      <p>Filme não encontrado.</p>
      <Link href="/" className="underline">
        Voltar para a lista
      </Link>
    </div>
  )
}
