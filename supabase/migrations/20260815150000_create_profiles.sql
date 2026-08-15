create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  store jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant select, insert, update on table public.profiles to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, store)
  values (
    new.id,
    jsonb_build_object(
      'version', 1,
      'setupComplete', false,
      'accessory', 'curl',
      'pointer', jsonb_build_object('cycle', 1, 'week', 1, 'intensity', 'heavy'),
      'cycles', jsonb_build_object(
        '1', jsonb_build_object(
          'squat', 95,
          'bench', 95,
          'row', 65,
          'ohp', 55,
          'sldl', 85,
          'accessory', 40,
          'calf', 70
        )
      ),
      'sessions', '[]'::jsonb
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
