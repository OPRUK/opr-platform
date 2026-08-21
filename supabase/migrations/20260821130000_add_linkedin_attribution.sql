-- Add LinkedIn to the privacy-safe first-party attribution allow-list.

alter table public.link_clicks drop constraint if exists link_clicks_source_check;
alter table public.link_clicks add constraint link_clicks_source_check
  check (source is null or source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin'));

alter table public.link_clicks drop constraint if exists link_clicks_utm_source_check;
alter table public.link_clicks add constraint link_clicks_utm_source_check
  check (utm_source is null or utm_source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin'));

alter table public.site_events drop constraint if exists site_events_source_check;
alter table public.site_events add constraint site_events_source_check
  check (source is null or source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin'));

alter table public.site_events drop constraint if exists site_events_utm_source_check;
alter table public.site_events add constraint site_events_utm_source_check
  check (utm_source is null or utm_source in ('instagram', 'tiktok', 'facebook', 'youtube', 'pinterest', 'linkedin'));

create index if not exists link_clicks_campaign_created_at_idx
  on public.link_clicks (utm_campaign, created_at desc);

create index if not exists site_events_campaign_created_at_idx
  on public.site_events (utm_campaign, created_at desc);
