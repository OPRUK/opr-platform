import { createClient } from "@supabase/supabase-js";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

async function getAdminClient(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!token || !supabaseUrl || !publishableKey || !secretKey) return null;
  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await authClient.auth.getUser(token);
  if (data.user?.email?.toLowerCase() !== adminEmail) return null;

  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: Request) {
  const adminClient = await getAdminClient(request);
  if (!adminClient) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { data, error } = await adminClient
    .from("recipe_community_cooks")
    .select("id, recipe_submission_id, name, note, photo_path, is_approved, created_at, recipe_submissions(title)")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ communityCooks: data ?? [] });
}

export async function PATCH(request: Request) {
  const adminClient = await getAdminClient(request);
  if (!adminClient) return Response.json({ error: "Unauthorised" }, { status: 401 });
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
    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR community cook update failed", error);
    return Response.json({ error: "Community post could not be updated" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const adminClient = await getAdminClient(request);
  if (!adminClient) return Response.json({ error: "Unauthorised" }, { status: 401 });
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
      const { error: storageError } = await adminClient.storage.from("recipe-photos").remove([post.photo_path]);
      if (storageError) throw storageError;
    }
    const { error: deleteError } = await adminClient.from("recipe_community_cooks").delete().eq("id", id);
    if (deleteError) throw deleteError;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR community cook deletion failed", error);
    return Response.json({ error: "Community post could not be deleted" }, { status: 400 });
  }
}
