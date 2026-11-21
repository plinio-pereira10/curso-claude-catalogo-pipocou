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

-- Limites do "retrato" (os mesmos que o site confere antes de gravar, em src/lib/marks.ts).
-- Impedem que alguém encha o banco com textos enormes ou guarde imagens de outros sites.
alter table public.user_titles drop constraint if exists user_titles_title_tamanho;
alter table public.user_titles add constraint user_titles_title_tamanho
  check (char_length(title) between 1 and 300);

alter table public.user_titles drop constraint if exists user_titles_poster_formato;
alter table public.user_titles add constraint user_titles_poster_formato
  check (poster_path is null or (char_length(poster_path) <= 100 and poster_path ~ '^/[A-Za-z0-9._-]+$' and poster_path not like '%..%'));

alter table public.user_titles drop constraint if exists user_titles_backdrop_formato;
alter table public.user_titles add constraint user_titles_backdrop_formato
  check (backdrop_path is null or (char_length(backdrop_path) <= 100 and backdrop_path ~ '^/[A-Za-z0-9._-]+$' and backdrop_path not like '%..%'));

alter table public.user_titles drop constraint if exists user_titles_ano_faixa;
alter table public.user_titles add constraint user_titles_ano_faixa
  check (release_year is null or release_year between 1870 and 2100);

alter table public.user_titles drop constraint if exists user_titles_nota_faixa;
alter table public.user_titles add constraint user_titles_nota_faixa
  check (vote_average between 0 and 10);

-- Datas definidas sempre pelo banco: created_at ao criar (nunca muda depois);
-- updated_at a cada alteração (trocar de lista conta como "recente").
create or replace function public.user_titles_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
  else
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_titles_touch on public.user_titles;
create trigger user_titles_touch
  before insert or update on public.user_titles
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
