alter table public.social_film_posts
  add column if not exists ignored boolean not null default false;
