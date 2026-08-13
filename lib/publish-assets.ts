import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";

// Copy-on-publish: `recipe-uploads` is private, so public pages, next/image
// and OG crawlers read from `recipe-published` instead. Called whenever an
// admin action makes something visible on the public site (a recipe or a
// community-cook photo) — the private original stays put either way.
export async function copyToPublished(supabase: SupabaseClient, paths: (string | null | undefined)[]) {
  const validPaths = paths.filter((path): path is string => Boolean(path));
  for (const path of validPaths) {
    const { error } = await supabase.storage
      .from("recipe-uploads")
      .copy(path, path, { destinationBucket: "recipe-published" });
    // Re-publishing after an edit copies the same path again — already
    // existing at the destination isn't a failure.
    if (error && !error.message?.toLowerCase().includes("already exists")) {
      throw error;
    }
  }
}
