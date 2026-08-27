create table if not exists public.social_connections (
  platform text primary key check (platform in ('youtube', 'pinterest')),
  refresh_token text not null,
  scope text,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_oauth_states (
  state text primary key,
  platform text not null check (platform in ('youtube', 'pinterest')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.social_connections enable row level security;
alter table public.social_connections force row level security;
alter table public.social_oauth_states enable row level security;
alter table public.social_oauth_states force row level security;
revoke all on public.social_connections from anon, authenticated;
revoke all on public.social_oauth_states from anon, authenticated;

comment on table public.social_connections is
  'Private server-only OAuth refresh tokens for OPR analytics integrations.';
comment on table public.social_oauth_states is
  'Short-lived one-time state values protecting admin OAuth reconnect flows.';
