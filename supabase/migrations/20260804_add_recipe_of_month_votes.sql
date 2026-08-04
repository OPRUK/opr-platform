-- Recipe of the Month voting is intentionally server-only. Visitors receive a
-- browser token in a secure cookie, but their email address is never stored here.
create table if not exists public.recipe_month_votes (
  id bigint generated always as identity primary key,
  month_key text not null check (month_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  recipe_key text not null check (recipe_key ~ '^(featured-[a-z0-9-]+|community-[0-9]+)$'),
  voter_token text not null check (char_length(voter_token) between 20 and 100),
  created_at timestamptz not null default now(),
  unique (month_key, voter_token)
);

create index if not exists recipe_month_votes_month_key_idx
  on public.recipe_month_votes (month_key);

alter table public.recipe_month_votes enable row level security;

revoke all on public.recipe_month_votes from anon, authenticated;
