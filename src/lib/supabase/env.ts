/** As duas variáveis do Supabase (públicas por natureza; a segurança vem das regras RLS). */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return url && key ? { url, key } : null
}
