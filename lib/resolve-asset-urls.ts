import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";

// Admin review screens need to show attachments before they're published —
// `recipe-uploads` is private, so those need short-lived signed URLs. Once
// published, the same path also exists in the public `recipe-published`
// bucket and a plain public URL (no signing, no expiry) works instead.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function resolveAssetUrlMap(
  supabase: SupabaseClient,
  entries: { paths: (string | null | undefined)[]; published: boolean }[],
): Promise<Map<string, string>> {
  const publicPaths = new Set<string>();
  const privatePaths = new Set<string>();
  for (const entry of entries) {
    const target = entry.published ? publicPaths : privatePaths;
    for (const path of entry.paths) if (path) target.add(path);
  }

  const urlMap = new Map<string, string>();
  for (const path of publicPaths) {
    urlMap.set(path, supabase.storage.from("recipe-published").getPublicUrl(path).data.publicUrl);
  }

  if (privatePaths.size) {
    const { data, error } = await supabase.storage
      .from("recipe-uploads")
      .createSignedUrls([...privatePaths], SIGNED_URL_TTL_SECONDS);
    if (error) {
      console.error("OPR signed URL batch failed", error);
    } else {
      for (const item of data) {
        if (item.path && item.signedUrl) urlMap.set(item.path, item.signedUrl);
      }
    }
  }

  return urlMap;
}
