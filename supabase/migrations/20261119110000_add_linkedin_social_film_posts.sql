alter table public.social_film_posts
  drop constraint social_film_posts_platform_check,
  add constraint social_film_posts_platform_check
    check (platform in ('facebook', 'instagram', 'tiktok', 'youtube', 'pinterest', 'linkedin'));
