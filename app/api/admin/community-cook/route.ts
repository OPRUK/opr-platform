import { requireAdmin } from "../../../../lib/admin-auth";
import { copyToPublished } from "../../../../lib/publish-assets";
import { resolveAssetUrlMap } from "../../../../lib/resolve-asset-urls";

export async function GET(request: Request) {
  const { client: adminClient, error: accessError } = await requireAdmin(request);
  if (!adminClient) return Response.json({ error: accessError }, { status: 401 });

  const { data, error } = await adminClient
    .from("recipe_community_cooks")
    .select("id, recipe_submission_id, recipe_slug, recipe_title, name, note, photo_path, is_approved, created_at, recipe_submissions(title)")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const rows = data ?? [];
  const urlMap = await resolveAssetUrlMap(
    adminClient,
    rows.map((row) => ({ paths: [row.photo_path], published: Boolean(row.is_approved) })),
  );
  const communityCooks = rows.map((row) => ({
    ...row,
    photo_url: row.photo_path ? (urlMap.get(row.photo_path) ?? null) : null,
  }));

  return Response.json({ communityCooks });
}

export async function PATCH(request: Request) {
  const { client: adminClient, error: accessError } = await requireAdmin(request);
  if (!adminClient) return Response.json({ error: accessError }, { status: 401 });
  try {
    const { id, isApproved } = await request.json();
    if (!Number.isInteger(id) || typeof isApproved !== "boolean") {
      return Response.json({ error: "Invalid update" }, { status: 400 });
    }
    const { error } = await adminClient
      .from("recipe_community_cooks")
      .update({ is_approved: isApproved, approved_at: isApproved ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) throw error;

    if (isApproved) {
      const { data: post, error: readError } = await adminClient
        .from("recipe_community_cooks")
        .select("photo_path")
        .eq("id", id)
        .maybeSingle();
      if (readError) throw readError;
      if (post?.photo_path) await copyToPublished(adminClient, [post.photo_path]);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR community cook update failed", error);
    return Response.json({ error: "Community post could not be updated" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { client: adminClient, error: accessError } = await requireAdmin(request);
  if (!adminClient) return Response.json({ error: accessError }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!Number.isInteger(id)) return Response.json({ error: "Invalid community post" }, { status: 400 });

    const { data: post, error: readError } = await adminClient
      .from("recipe_community_cooks")
      .select("photo_path")
      .eq("id", id)
      .maybeSingle();
    if (readError || !post) return Response.json({ error: "Community post not found" }, { status: 404 });
    if (post.photo_path) {
      const { error: storageError } = await adminClient.storage.from("recipe-uploads").remove([post.photo_path]);
      if (storageError) throw storageError;
      const { error: publishedStorageError } = await adminClient.storage.from("recipe-published").remove([post.photo_path]);
      if (publishedStorageError) throw publishedStorageError;
    }
    const { error: deleteError } = await adminClient.from("recipe_community_cooks").delete().eq("id", id);
    if (deleteError) throw deleteError;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR community cook deletion failed", error);
    return Response.json({ error: "Community post could not be deleted" }, { status: 400 });
  }
}
