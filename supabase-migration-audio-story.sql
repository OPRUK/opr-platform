-- Store an optional voice note explaining the story behind a recipe.
alter table public.recipe_submissions
  add column if not exists audio_story_path text;
