-- site_events_event_key_check was created with the original 6 event keys and
-- never updated as new event keys were added to lib/attribution.ts's
-- AnalyticsEventKey union — every film_play, film_watched,
-- community_cook_success and cookalong_signup_success insert has been
-- silently failing this constraint (recordAnalyticsEvent swallows the error
-- by design, so the API kept returning 204 with nothing actually written).

alter table public.site_events drop constraint if exists site_events_event_key_check;
alter table public.site_events add constraint site_events_event_key_check
  check (event_key in (
    'home_cookbook',
    'cookbook_share',
    'film_recipe',
    'founder_join',
    'join_table_success',
    'recipe_submission_success',
    'community_cook_success',
    'film_play',
    'film_watched',
    'cookalong_signup_success'
  ));
