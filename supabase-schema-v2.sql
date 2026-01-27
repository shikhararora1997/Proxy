-- PROXY Database Schema v2 (Simplified - No Auth)
-- Run this in your Supabase SQL Editor
--
-- This version removes Supabase Auth dependency.
-- Users are identified by username only (for demo purposes).

-- ========================================
-- STEP 1: Drop old objects if they exist
-- ========================================

-- Drop old trigger (if exists)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop old RLS policies
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own messages" on public.messages;
drop policy if exists "Users can insert own messages" on public.messages;
drop policy if exists "Users can view own ledger entries" on public.ledger_entries;
drop policy if exists "Users can insert own ledger entries" on public.ledger_entries;
drop policy if exists "Users can update own ledger entries" on public.ledger_entries;
drop policy if exists "Users can delete own ledger entries" on public.ledger_entries;

-- Drop old tables
drop table if exists public.ledger_entries;
drop table if exists public.messages;
drop table if exists public.profiles;

-- ========================================
-- STEP 2: Create new tables
-- ========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (standalone - no auth dependency)
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  display_name text,
  persona_id text check (persona_id in ('p1', 'p2', 'p3', 'p4')),
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

-- Ledger Entries table
create table public.ledger_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  description text not null,
  amount numeric,
  category text,
  status text check (status in ('pending', 'resolved', 'void')) default 'pending',
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

-- ========================================
-- STEP 4: Enable RLS with open policies (demo mode)
-- ========================================

-- For a demo with ~10 users, we'll use simplified RLS
-- In production, you'd want proper authentication

alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.ledger_entries enable row level security;

-- Allow all operations (demo mode - no auth)
-- Profiles: Anyone can read and create, only owner can update
create policy "Allow read profiles"
  on public.profiles for select
  using (true);

create policy "Allow insert profiles"
  on public.profiles for insert
  with check (true);

create policy "Allow update profiles"
  on public.profiles for update
  using (true);

-- Messages: Allow all operations
create policy "Allow read messages"
  on public.messages for select
  using (true);

create policy "Allow insert messages"
  on public.messages for insert
  with check (true);

-- Ledger: Allow all operations
create policy "Allow read ledger"
  on public.ledger_entries for select
  using (true);

create policy "Allow insert ledger"
  on public.ledger_entries for insert
  with check (true);

create policy "Allow update ledger"
  on public.ledger_entries for update
  using (true);

create policy "Allow delete ledger"
  on public.ledger_entries for delete
  using (true);

-- ========================================
-- STEP 5: Create helper functions
-- ========================================

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_ledger_entries_updated_at
  before update on public.ledger_entries
  for each row execute procedure public.update_updated_at_column();
