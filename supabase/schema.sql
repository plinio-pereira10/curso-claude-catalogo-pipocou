-- Tabela das listas "Quero assistir" e "Já assisti".
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo inteiro → Run.
-- Pode rodar de novo sem problema (não apaga dados).

create table if not exists public.user_titles (
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  media_type    text not null check (media_type in ('movie', 'tv')),
  tmdb_id       integer not null check (tmdb_id > 0),
  status        text not null check (status in ('want', 'watched')),
  -- "retrato" do título no momento da marcação (para a lista abrir sem consultar o TMDB)
  title         text not null,
  poster_path   text,
  backdrop_path text,
  release_year  integer,
  vote_average  real not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- um título fica em uma lista só, por pessoa
  primary key (user_id, media_type, tmdb_id)
);

-- "Minhas listas" busca por pessoa + lista, mais recentes primeiro
create index if not exists user_titles_by_list
  on public.user_titles (user_id, status, updated_at desc);

-- updated_at muda a cada alteração (trocar de lista conta como "recente")
create or replace function public.user_titles_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_titles_touch on public.user_titles;
create trigger user_titles_touch
  before update on public.user_titles
  for each row execute function public.user_titles_touch();

-- Segurança: cada pessoa só lê e altera as próprias linhas.
alter table public.user_titles enable row level security;

drop policy if exists "ver as proprias marcacoes" on public.user_titles;
create policy "ver as proprias marcacoes" on public.user_titles
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "criar as proprias marcacoes" on public.user_titles;
create policy "criar as proprias marcacoes" on public.user_titles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "alterar as proprias marcacoes" on public.user_titles;
create policy "alterar as proprias marcacoes" on public.user_titles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "apagar as proprias marcacoes" on public.user_titles;
create policy "apagar as proprias marcacoes" on public.user_titles
  for delete to authenticated
  using ((select auth.uid()) = user_id);
