-- Einmal im Supabase "SQL Editor" ausführen (Run).
create table if not exists public.kv (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.kv enable row level security;
drop policy if exists "Nur eigene Daten" on public.kv;
create policy "Nur eigene Daten" on public.kv
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists kv_updated on public.kv (user_id, updated_at);
