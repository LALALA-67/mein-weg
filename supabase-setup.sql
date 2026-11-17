-- Wurde einmal im Supabase "SQL Editor" ausgeführt.
create table if not exists public.kv (user_id uuid not null default auth.uid() references auth.users on delete cascade, key text not null, data jsonb not null, updated_at timestamptz not null default now(), primary key (user_id, key));
alter table public.kv enable row level security;
create policy own_rows on public.kv for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.kv to authenticated;
create index if not exists kv_upd on public.kv (user_id, updated_at);
