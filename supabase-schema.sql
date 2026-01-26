-- PROXY Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
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

-- Indexes for performance
create index messages_user_id_idx on public.messages(user_id);
create index messages_created_at_idx on public.messages(created_at);
create index ledger_entries_user_id_idx on public.ledger_entries(user_id);
create index ledger_entries_status_idx on public.ledger_entries(status);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.ledger_entries enable row level security;

-- Profiles: Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Messages: Users can only access their own messages
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- Ledger: Users can only access their own entries
create policy "Users can view own ledger entries"
  on public.ledger_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own ledger entries"
  on public.ledger_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ledger entries"
  on public.ledger_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own ledger entries"
  on public.ledger_entries for delete
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
