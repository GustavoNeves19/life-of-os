-- ============================================================
-- Life OS Pessoal — Schema Supabase
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: life_areas
-- ============================================================
create table public.life_areas (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  slug        text not null,
  icon        text not null default '📋',
  color       text not null default '#6366f1',
  sort_order  int  not null default 0,
  created_at  timestamptz default now() not null
);

alter table public.life_areas enable row level security;
create policy "Users can manage their own areas"
  on public.life_areas for all using (auth.uid() = user_id);

-- ============================================================
-- TABELA: pages
-- ============================================================
create table public.pages (
  id          uuid default uuid_generate_v4() primary key,
  area_id     uuid references public.life_areas(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  content     text,
  created_at  timestamptz default now() not null
);

alter table public.pages enable row level security;
create policy "Users can manage their own pages"
  on public.pages for all using (auth.uid() = user_id);

-- ============================================================
-- TABELA: tasks
-- ============================================================
create type task_priority as enum ('low', 'medium', 'high');
create type task_status   as enum ('pending', 'in_progress', 'done');

create table public.tasks (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  area_id     uuid references public.life_areas(id) on delete set null,
  page_id     uuid references public.pages(id) on delete set null,
  title       text not null,
  description text,
  priority    task_priority not null default 'medium',
  status      task_status   not null default 'pending',
  due_date    date,
  created_at  timestamptz default now() not null
);

alter table public.tasks enable row level security;
create policy "Users can manage their own tasks"
  on public.tasks for all using (auth.uid() = user_id);

create index on public.tasks(user_id, status);
create index on public.tasks(user_id, due_date);
create index on public.tasks(area_id);

-- ============================================================
-- TABELA: subtasks
-- ============================================================
create table public.subtasks (
  id        uuid default uuid_generate_v4() primary key,
  task_id   uuid references public.tasks(id) on delete cascade not null,
  title     text not null,
  completed boolean not null default false
);

alter table public.subtasks enable row level security;
create policy "Users can manage subtasks of their tasks"
  on public.subtasks for all
  using (
    exists (
      select 1 from public.tasks t
      where t.id = subtasks.task_id and t.user_id = auth.uid()
    )
  );

-- ============================================================
-- TABELA: goals
-- ============================================================
create type goal_timeframe as enum ('short', 'medium', 'long');

create table public.goals (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  area_id     uuid references public.life_areas(id) on delete set null,
  title       text not null,
  timeframe   goal_timeframe not null default 'short',
  progress    int  not null default 0 check (progress >= 0 and progress <= 100),
  target_date date,
  status      task_status not null default 'pending',
  created_at  timestamptz default now() not null
);

alter table public.goals enable row level security;
create policy "Users can manage their own goals"
  on public.goals for all using (auth.uid() = user_id);

-- ============================================================
-- TABELA: financial_entries
-- ============================================================
create type finance_type as enum ('income', 'expense');

create table public.financial_entries (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        finance_type not null,
  amount      numeric(10,2) not null check (amount > 0),
  category    text not null,
  description text,
  date        date not null default current_date,
  created_at  timestamptz default now() not null
);

alter table public.financial_entries enable row level security;
create policy "Users can manage their own finances"
  on public.financial_entries for all using (auth.uid() = user_id);

create index on public.financial_entries(user_id, date desc);

-- ============================================================
-- TABELA: finance_links
-- ============================================================
create table public.finance_links (
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
create policy "Users can manage their own finance links"
  on public.finance_links for all using (auth.uid() = user_id);

create index on public.finance_links(user_id, created_at desc);

-- ============================================================
-- TABELA: notes
-- ============================================================
create table public.notes (
  id         uuid default uuid_generate_v4() primary key,
  task_id    uuid references public.tasks(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade not null,
  content    text not null,
  created_at timestamptz default now() not null
);

alter table public.notes enable row level security;
create policy "Users can manage their own notes"
  on public.notes for all using (auth.uid() = user_id);

-- ============================================================
-- FUNÇÃO: seed das áreas padrão ao criar usuário
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.life_areas (user_id, name, slug, icon, color, sort_order)
  values
    (new.id, 'Faculdade',      'college',  '🎓', '#6366f1', 1),
    (new.id, 'Trabalho',       'work',     '💼', '#0ea5e9', 2),
    (new.id, 'Academia/Saúde', 'health',   '🏃', '#22c55e', 3),
    (new.id, 'Vida Pessoal',   'personal', '✨', '#f59e0b', 4),
    (new.id, 'Finanças',       'finances', '💰', '#10b981', 5),
    (new.id, 'Metas',          'goals',    '🎯', '#ec4899', 6);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
