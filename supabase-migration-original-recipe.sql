-- Store an optional photograph of a contributor's original handwritten recipe.
-- Applied in the Supabase SQL Editor on 2 August 2026.
alter table public.recipe_submissions
  add column if not exists original_recipe_path text;
