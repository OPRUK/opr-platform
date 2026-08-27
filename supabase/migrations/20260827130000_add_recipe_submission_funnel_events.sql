alter table public.site_events drop constraint if exists site_events_event_key_check;
alter table public.site_events add constraint site_events_event_key_check
  check (event_key in (
    'home_cookbook',
    'cookbook_share',
    'film_recipe',
    'founder_join',
    'join_table_success',
    'recipe_submission_started',
    'recipe_submission_progress',
    'recipe_submission_attempt',
    'recipe_submission_success',
    'community_cook_success',
    'film_play',
    'film_watched',
    'cookalong_signup_success'
  ));
