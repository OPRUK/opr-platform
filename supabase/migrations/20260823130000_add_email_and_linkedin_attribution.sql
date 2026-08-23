-- Two gaps found while reviewing the newsletter: "email" was never a
-- recognised attribution source or medium (so newsletter link clicks
-- can't be attributed), and "linkedin" — despite migration
-- 20260821130000_add_linkedin_attribution.sql existing in the repo —
-- was never actually applied to this database, so the LinkedIn
-- cook-along post has been silently failing attribution since it went
-- live. Fixing both together since they touch the same constraints.

alter table public.link_clicks drop constraint if exists link_clicks_source_check;
alter table public.link_clicks add constraint link_clicks_source_check
  check (source is null or source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin', 'email'));

alter table public.link_clicks drop constraint if exists link_clicks_utm_source_check;
alter table public.link_clicks add constraint link_clicks_utm_source_check
  check (utm_source is null or utm_source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin', 'email'));

alter table public.link_clicks drop constraint if exists link_clicks_utm_medium_check;
alter table public.link_clicks add constraint link_clicks_utm_medium_check
  check (utm_medium is null or utm_medium in ('social', 'email'));

alter table public.site_events drop constraint if exists site_events_source_check;
alter table public.site_events add constraint site_events_source_check
  check (source is null or source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin', 'email'));

alter table public.site_events drop constraint if exists site_events_utm_source_check;
alter table public.site_events add constraint site_events_utm_source_check
  check (utm_source is null or utm_source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin', 'email'));

alter table public.site_events drop constraint if exists site_events_utm_medium_check;
alter table public.site_events add constraint site_events_utm_medium_check
  check (utm_medium is null or utm_medium in ('social', 'email'));
