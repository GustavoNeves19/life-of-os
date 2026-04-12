create table if not exists public.finance_links (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  url        text not null,
  provider   text,
  kind       text not null default 'other',
  notes      text,
  created_at timestamptz default now() not null
);

alter table public.finance_links enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'finance_links'
      and policyname = 'Users can manage their own finance links'
  ) then
    create policy "Users can manage their own finance links"
      on public.finance_links
      for all
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists finance_links_user_created_at_idx
  on public.finance_links(user_id, created_at desc);
