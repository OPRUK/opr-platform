-- Keep the storage bucket allowlist aligned with lib/media-attachments.ts.
-- Existing buckets are updated explicitly because their original migration
-- used ON CONFLICT DO NOTHING and therefore cannot change a deployed bucket.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'audio/aac', 'audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/ogg',
  'audio/wav', 'audio/webm', 'audio/x-m4a',
  'video/mp4', 'video/quicktime', 'video/webm'
]
where id in ('recipe-uploads', 'recipe-published');
