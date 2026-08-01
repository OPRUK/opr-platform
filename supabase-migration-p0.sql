-- P0.6: submission licence consent tracking
-- Run this once in the Supabase SQL Editor (or via the Supabase MCP) before
-- merging the p0-seo-and-legal branch, otherwise recipe submissions will
-- fail — the updated RecipeForm sends these fields on every insert.

alter table recipe_submissions
  add column if not exists licence_accepted boolean not null default false,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists consent_version text,
  add column if not exists consent_given_at timestamptz;

-- Optional: the old single checkbox field can stay for historical rows.
-- Nothing in the new code reads or writes permission_to_feature any more.
