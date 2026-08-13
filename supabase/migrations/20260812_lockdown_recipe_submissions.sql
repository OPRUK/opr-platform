-- Part 3 of the secure submission pipeline. APPLIED 2026-08-13 to production
-- directly (not via this file/the migration history — see chat/audit) once
-- the server routes in this branch (recipe-submission, recipe-submission-mobile,
-- recipe-community-cook, submissions/upload-url) were deployed and verified
-- working end-to-end. This file documents exactly what was run.
--
-- Confirmed live before applying: recipe_submissions had policy "Anyone can
-- submit a recipe" — INSERT for anon, with_check true — meaning anyone with
-- the public anon key could insert a row with is_published: true, bypassing
-- the app entirely. Verified closed post-apply: a raw anon-key insert now
-- returns 401, and published content still reads fine via the anon key.

-- Remove the browser's write path
drop policy if exists "Anyone can submit a recipe" on public.recipe_submissions;
revoke all on public.recipe_submissions from anon, authenticated;
grant select on public.recipe_submissions to anon;

revoke all on public.recipe_community_cooks from anon, authenticated;
grant select on public.recipe_community_cooks to anon;

-- Prevent owner-role bypass of RLS
alter table public.recipe_submissions force row level security;
alter table public.recipe_community_cooks force row level security;

-- Storage: remove public upload once the 1.4 migration (7 orphaned objects,
-- already copied to recipe-uploads — see supabase/migrations/20260812_add_private_upload_buckets.sql)
-- is verified complete and nothing in the codebase references recipe-photos
-- (confirmed clean via repo-wide grep as of this branch).
drop policy if exists "Anyone can upload recipe photos" on storage.objects;

-- The retained `grant select ... to anon` on recipe_submissions/
-- recipe_community_cooks is intentional: the existing "Public can read
-- published recipes" (is_published = true) and "Approved community cooks are
-- public" (is_approved = true) policies then serve published content to the
-- public site — see the confirmed live policies on both tables.

-- Follow-up, only after everything above is confirmed working with no
-- regressions (not part of this migration — run separately, deliberately):
--   1. alter storage.buckets set public = false where id = 'recipe-photos';
--   2. once satisfied nothing needs it, delete the 7 original objects still
--      sitting in recipe-photos (they were copied, not moved, to
--      recipe-uploads) and drop the bucket itself.
