create table if not exists public.opc_social_film_posts
  (like public.social_film_posts including all);

alter table public.opc_social_film_posts enable row level security;
alter table public.opc_social_film_posts force row level security;
revoke all on public.opc_social_film_posts from anon, authenticated;
grant select, insert, update on public.opc_social_film_posts to service_role;
