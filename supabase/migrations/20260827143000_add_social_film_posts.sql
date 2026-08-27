create table if not exists public.social_film_posts (
  platform text not null check (platform in ('facebook', 'instagram', 'tiktok', 'youtube', 'pinterest')),
  post_id text not null,
  film_video text,
  post_title text not null,
  metric_value bigint not null default 0 check (metric_value >= 0),
  published_at timestamptz,
  last_synced_at timestamptz not null default now(),
  primary key (platform, post_id)
);

create index if not exists social_film_posts_film_video_idx
  on public.social_film_posts (film_video, platform);

alter table public.social_film_posts enable row level security;
alter table public.social_film_posts force row level security;
revoke all on public.social_film_posts from anon, authenticated;

comment on table public.social_film_posts is
  'Private stable mapping from social platform post IDs to canonical OPR website films, with the latest actual platform metric.';
