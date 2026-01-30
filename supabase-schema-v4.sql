-- PROXY Database Schema v4 (Due Dates for Tasks)
-- Run this in your Supabase SQL Editor
--
-- Changes from v3:
-- - Added `due_at` column to ledger_entries (for task deadlines)

-- ========================================
-- STEP 1: Drop ALL existing objects
-- ========================================

-- Drop old trigger (if exists from v1)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop v2 triggers
drop trigger if exists update_profiles_updated_at on public.profiles;
drop trigger if exists update_ledger_entries_updated_at on public.ledger_entries;

-- Drop v2 RLS policies
drop policy if exists "Allow read profiles" on public.profiles;
drop policy if exists "Allow insert profiles" on public.profiles;
drop policy if exists "Allow update profiles" on public.profiles;
drop policy if exists "Allow read messages" on public.messages;
drop policy if exists "Allow insert messages" on public.messages;
drop policy if exists "Allow delete messages" on public.messages;
drop policy if exists "Allow read ledger" on public.ledger_entries;
drop policy if exists "Allow insert ledger" on public.ledger_entries;
drop policy if exists "Allow update ledger" on public.ledger_entries;
drop policy if exists "Allow delete ledger" on public.ledger_entries;

-- Drop v1 RLS policies
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own messages" on public.messages;
drop policy if exists "Users can insert own messages" on public.messages;
drop policy if exists "Users can view own ledger entries" on public.ledger_entries;
drop policy if exists "Users can insert own ledger entries" on public.ledger_entries;
drop policy if exists "Users can update own ledger entries" on public.ledger_entries;
drop policy if exists "Users can delete own ledger entries" on public.ledger_entries;

-- Drop tables (order matters for foreign keys)
drop table if exists public.ledger_entries;
drop table if exists public.messages;
drop table if exists public.profiles;

-- Drop helper function
drop function if exists public.update_updated_at_column();

-- ========================================
-- STEP 2: Create tables
-- ========================================

create extension if not exists "uuid-ossp";

-- Profiles table (standalone - no auth dependency)
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  display_name text,
  persona_id text check (persona_id in ('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10')),
  onboarding_complete boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table (Chat History)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender text check (sender in ('user', 'proxy')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ledger Entries table (Task List with Priority + Due Date)
create table public.ledger_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  description text not null,
  amount numeric,
  category text,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  status text check (status in ('pending', 'resolved', 'void')) default 'pending',
  due_at timestamp with time zone default null,
  completed_at timestamp with time zone default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- STEP 3: Create indexes
-- ========================================

create index profiles_username_idx on public.profiles(username);
create index messages_user_id_idx on public.messages(user_id);
create index messages_created_at_idx on public.messages(created_at);
create index ledger_entries_user_id_idx on public.ledger_entries(user_id);
create index ledger_entries_status_idx on public.ledger_entries(status);
create index ledger_entries_priority_idx on public.ledger_entries(priority);
create index ledger_entries_due_at_idx on public.ledger_entries(due_at);
create index ledger_entries_completed_at_idx on public.ledger_entries(completed_at);

-- ========================================
-- STEP 4: Enable RLS with open policies (demo mode)
-- ========================================

alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.ledger_entries enable row level security;

-- Profiles
create policy "Allow read profiles"
  on public.profiles for select using (true);
create policy "Allow insert profiles"
  on public.profiles for insert with check (true);
create policy "Allow update profiles"
  on public.profiles for update using (true);

-- Messages
create policy "Allow read messages"
  on public.messages for select using (true);
create policy "Allow insert messages"
  on public.messages for insert with check (true);
create policy "Allow delete messages"
  on public.messages for delete using (true);

-- Ledger
create policy "Allow read ledger"
  on public.ledger_entries for select using (true);
create policy "Allow insert ledger"
  on public.ledger_entries for insert with check (true);
create policy "Allow update ledger"
  on public.ledger_entries for update using (true);
create policy "Allow delete ledger"
  on public.ledger_entries for delete using (true);

-- ========================================
-- STEP 5: Helper functions & triggers
-- ========================================

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_ledger_entries_updated_at
  before update on public.ledger_entries
  for each row execute procedure public.update_updated_at_column();

-- ========================================
-- MIGRATION ONLY (if upgrading from v3)
-- ========================================
-- If you already have data and just want to add the column:
-- ALTER TABLE public.ledger_entries ADD COLUMN due_at timestamp with time zone default null;
-- CREATE INDEX ledger_entries_due_at_idx ON public.ledger_entries(due_at);
