import { supabase } from "./supabase/client";

type StoredCommunityCook = {
  id: number;
  name: string;
  note: string | null;
  photo_path: string | null;
};

export type PublicCommunityCook = {
  id: number;
  name: string;
  note: string | null;
  photoUrl: string | null;
};

function toPublicCook(cook: StoredCommunityCook): PublicCommunityCook {
  return {
    id: cook.id,
    name: cook.name,
    note: cook.note,
    photoUrl: cook.photo_path
      ? supabase.storage.from("recipe-photos").getPublicUrl(cook.photo_path).data.publicUrl
      : null,
  };
}

export async function getApprovedCommunityCooks(target: { recipeId?: number; recipeSlug?: string }): Promise<PublicCommunityCook[]> {
  let query = supabase
    .from("recipe_community_cooks")
    .select("id, name, note, photo_path")
    .eq("is_approved", true)
    .order("approved_at", { ascending: false });

  if (target.recipeId) query = query.eq("recipe_submission_id", target.recipeId);
  if (target.recipeSlug) query = query.eq("recipe_slug", target.recipeSlug);

  const { data, error } = await query;
  if (error) {
    console.error("OPR community cooks could not be loaded", error);
    return [];
  }

  return ((data ?? []) as StoredCommunityCook[]).map(toPublicCook);
}
