-- Part 1 of the secure submission pipeline (see OPR-AUDIT-AUG-2026.md companion
-- spec). `recipe-photos` is public and accepts anon uploads; everything landed
-- there is readable the instant it's uploaded, before any review. These two new
-- buckets replace it: `recipe-uploads` (private, server-mediated only) holds
-- everything until an OPR administrator publishes it; `recipe-published` (public)
-- is what public pages, next/image and OG crawlers actually read from. No anon
-- storage policies are added on either bucket — all access is server-mediated,
-- either via the service-role client or short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-uploads',
  'recipe-uploads',
  false,
  26214400,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/x-m4a',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-published',
  'recipe-published',
  true,
  26214400,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/x-m4a',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do nothing;

-- Only the OPR admin (via the authenticated-admin policy pattern already used
-- for `films` and `recipe-photos`) can manage either bucket directly; all other
-- access goes through server routes using the service-role client.
drop policy if exists "OPR admin can manage recipe uploads" on storage.objects;
create policy "OPR admin can manage recipe uploads"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'recipe-uploads' and (select auth.jwt() ->> 'email') = 'chaten@otherpeoplesrecipes.co.uk')
  with check (bucket_id = 'recipe-uploads' and (select auth.jwt() ->> 'email') = 'chaten@otherpeoplesrecipes.co.uk');

drop policy if exists "OPR admin can manage published recipe assets" on storage.objects;
create policy "OPR admin can manage published recipe assets"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'recipe-published' and (select auth.jwt() ->> 'email') = 'chaten@otherpeoplesrecipes.co.uk')
  with check (bucket_id = 'recipe-published' and (select auth.jwt() ->> 'email') = 'chaten@otherpeoplesrecipes.co.uk');
