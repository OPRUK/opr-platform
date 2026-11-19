create table if not exists public.opc_social_connections (
  platform text primary key check (platform in ('facebook', 'tiktok', 'youtube', 'pinterest')),
  account_id text not null,
  credential text not null,
  instagram_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.opc_social_oauth_states (
  state text primary key,
  platform text not null check (platform in ('facebook', 'tiktok', 'youtube', 'pinterest')),
  expires_at timestamptz not null
);

alter table public.opc_social_connections enable row level security;
alter table public.opc_social_connections force row level security;
alter table public.opc_social_oauth_states enable row level security;
alter table public.opc_social_oauth_states force row level security;
revoke all on public.opc_social_connections, public.opc_social_oauth_states from anon, authenticated;
grant select, insert, update on public.opc_social_connections to service_role;
grant select, insert, delete on public.opc_social_oauth_states to service_role;
