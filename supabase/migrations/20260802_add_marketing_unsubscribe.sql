-- Stores a person's decision to stop optional OPR marketing communications.
-- This does not remove their recipe submission or Founding Table record.
alter table public.founding_table_members
  add column if not exists marketing_unsubscribed_at timestamptz;

alter table public.recipe_submissions
  add column if not exists marketing_unsubscribed_at timestamptz;

create index if not exists founding_table_members_marketing_opt_in_idx
  on public.founding_table_members (marketing_opt_in)
  where marketing_opt_in = true;

create index if not exists recipe_submissions_marketing_opt_in_idx
  on public.recipe_submissions (marketing_opt_in)
  where marketing_opt_in = true;
