// Confere, no Supabase de verdade, que uma pessoa não vê nem altera as marcações de outra (RLS).
// Uso: node --env-file=.env.local scripts/check-rls.mjs
// Cria duas contas de teste (teste-a-… e teste-b-…@exemplo.com). Depois você pode apagá-las em
// Supabase → Authentication → Users.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local')
  process.exit(1)
}

const stamp = Date.now()
const password = `teste-${stamp}`
const failures = []
const check = (ok, label) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`)
  if (!ok) failures.push(label)
}

async function newUser(name) {
  const client = createClient(url, key, { auth: { persistSession: false } })
  const email = `teste-${name}-${stamp}@exemplo.com`
  const { data, error } = await client.auth.signUp({ email, password })
  if (error) throw new Error(`cadastro de ${email}: ${error.message}`)
  if (!data.session) throw new Error('cadastro sem sessão — o "Confirm email" está desligado?')
  return { client, id: data.user.id, email }
}

const a = await newUser('a')
const b = await newUser('b')
console.log(`contas de teste: ${a.email}, ${b.email}`)

const row = { media_type: 'tv', tmdb_id: 93405, status: 'want', title: 'Round 6', vote_average: 7.9 }

const insertA = await a.client.from('user_titles').insert(row).select()
check(!insertA.error && insertA.data?.length === 1, 'A consegue marcar um título')

const ownA = await a.client.from('user_titles').select('*')
check(ownA.data?.length === 1 && ownA.data[0].user_id === a.id, 'A vê a própria marcação')

const seenByB = await b.client.from('user_titles').select('*')
check(!seenByB.error && seenByB.data.length === 0, 'B não vê a marcação de A')

const updateByB = await b.client.from('user_titles').update({ status: 'watched' }).eq('user_id', a.id).select()
check(!updateByB.error && updateByB.data.length === 0, 'B não consegue alterar a marcação de A')

const deleteByB = await b.client.from('user_titles').delete().eq('user_id', a.id).select()
check(!deleteByB.error && deleteByB.data.length === 0, 'B não consegue apagar a marcação de A')

const forgeByB = await b.client.from('user_titles').insert({ ...row, user_id: a.id }).select()
check(Boolean(forgeByB.error), 'B não consegue criar marcação em nome de A')

const dupA = await a.client.from('user_titles').insert({ ...row, status: 'watched' }).select()
check(Boolean(dupA.error), 'o mesmo título não entra duas vezes para A (uma lista só)')

const stillA = await a.client.from('user_titles').select('status')
check(stillA.data?.length === 1 && stillA.data[0].status === 'want', 'a marcação de A continua intacta')

const anon = createClient(url, key, { auth: { persistSession: false } })
const seenByAnon = await anon.from('user_titles').select('*')
check(!seenByAnon.error && seenByAnon.data.length === 0, 'quem não está logado não vê nada')

await a.client.from('user_titles').delete().eq('user_id', a.id)

if (failures.length) {
  console.error(`\nRLS FALHOU (${failures.length})`)
  process.exit(1)
}
console.log('\nRLS OK')
