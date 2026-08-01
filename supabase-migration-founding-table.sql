-- Founding Table waiting list: private by default.
-- This has been run in the Supabase SQL Editor on 2 August 2026.
-- The website writes through a server-only route using SUPABASE_SECRET_KEY.

create table if not exists public.founding_table_members (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null unique check (email = lower(email)),
  marketing_opt_in boolean not null default false,
  source text not null default 'website',
  status text not null default 'waiting' check (status in ('waiting', 'invited', 'member', 'unsubscribed'))
);

alter table public.founding_table_members enable row level security;
revoke all on public.founding_table_members from anon, authenticated;
