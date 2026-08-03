-- Optional portrait submitted by a contributor for display on their published recipe page.
alter table public.recipe_submissions
  add column if not exists contributor_photo_path text;

comment on column public.recipe_submissions.contributor_photo_path is
  'Optional contributor portrait, shown only when the associated recipe is published.';
