create table if not exists public.app_state (
  id int primary key default 1 check (id = 1),
  store jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_all" on public.app_state;
create policy "app_state_all"
  on public.app_state for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update on table public.app_state to anon, authenticated;

insert into public.app_state (id, store)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
