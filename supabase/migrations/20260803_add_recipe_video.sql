-- An optional short film can now travel with a submitted recipe.
alter table public.recipe_submissions
  add column if not exists recipe_video_path text;

comment on column public.recipe_submissions.recipe_video_path is
  'Optional short recipe video stored in the recipe-photos bucket; shown only after the recipe is published.';
