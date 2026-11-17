-- Wurde einmal im Supabase "SQL Editor" ausgeführt.
create table if not exists public.kv (user_id uuid not null default auth.uid() references auth.users on delete cascade, key text not null, data jsonb not null, updated_at timestamptz not null default now(), primary key (user_id, key));
alter table public.kv enable row level security;
create policy own_rows on public.kv for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.kv to authenticated;
create index if not exists kv_upd on public.kv (user_id, updated_at);

-- Benachrichtigungen (Push)
create table if not exists public.push_subs (endpoint text primary key, user_id uuid not null default auth.uid() references auth.users on delete cascade, sub jsonb not null, created_at timestamptz default now());
alter table public.push_subs enable row level security;
drop policy if exists own_subs on public.push_subs;
create policy own_subs on public.push_subs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.push_subs to authenticated;
create table if not exists public.reminders (id text primary key, user_id uuid not null default auth.uid() references auth.users on delete cascade, at timestamptz not null, title text not null, body text, sent boolean not null default false);
alter table public.reminders enable row level security;
drop policy if exists own_rem on public.reminders;
create policy own_rem on public.reminders for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.reminders to authenticated;
create index if not exists rem_due on public.reminders (sent, at);
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('send-reminders', '* * * * *', $$select net.http_post(url := 'https://bucszzzfzjgpdizgxssn.supabase.co/functions/v1/send-reminders', headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb, body := '{}'::jsonb)$$);

-- Tägliche Server-Sicherung (14 Tage)
create table if not exists public.kv_backup (day date not null, user_id uuid not null references auth.users on delete cascade, key text not null, data jsonb not null, updated_at timestamptz, primary key (day, user_id, key));
alter table public.kv_backup enable row level security;
create policy own_backup on public.kv_backup for select to authenticated using (auth.uid() = user_id);
grant select on public.kv_backup to authenticated;
select cron.schedule('daily-backup', '17 2 * * *', $$insert into public.kv_backup select current_date, user_id, key, data, updated_at from public.kv on conflict do nothing; delete from public.kv_backup where day < current_date - 14$$);
