-- One published community recipe can be highlighted on the OPR homepage.
alter table public.recipe_submissions
  add column if not exists is_recipe_of_week boolean not null default false,
  add column if not exists recipe_of_week_note text;

create unique index if not exists recipe_submissions_one_recipe_of_week
  on public.recipe_submissions (is_recipe_of_week)
  where is_recipe_of_week;
