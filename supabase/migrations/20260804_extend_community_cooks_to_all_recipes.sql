-- Let families share their cooking experience for both community-submitted
-- recipes and the original curated OPR cookbook recipes.
alter table public.recipe_community_cooks
  alter column recipe_submission_id drop not null;

alter table public.recipe_community_cooks
  add column if not exists recipe_slug text,
  add column if not exists recipe_title text;

alter table public.recipe_community_cooks
  drop constraint if exists recipe_community_cooks_recipe_target_check;

alter table public.recipe_community_cooks
  add constraint recipe_community_cooks_recipe_target_check
  check (recipe_submission_id is not null or recipe_slug is not null);

create index if not exists recipe_community_cooks_slug_idx
  on public.recipe_community_cooks (recipe_slug, is_approved, created_at desc);
