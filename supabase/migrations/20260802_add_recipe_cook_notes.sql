-- Optional contributor substitutions, serving suggestions and helpful kitchen tips.
alter table public.recipe_submissions
  add column if not exists cook_notes text;

comment on column public.recipe_submissions.cook_notes is
  'Optional contributor cooking tips, substitutions and serving suggestions.';
