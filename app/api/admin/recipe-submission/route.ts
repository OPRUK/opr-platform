import { createClient } from "@supabase/supabase-js";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

// Use every field that exists on the table. This keeps the private inbox working
// while optional recipe features are added over time.
const submissionFields = "*";

async function getAdminClient(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!token) return { client: null, error: "Your secure sign-in has expired. Please sign out and use a new sign-in link." };
  if (!publicUrl || !publishableKey || !secretKey) {
    return { client: null, error: "The private inbox connection is not fully configured." };
  }

  const authClient = createClient(publicUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || authData.user?.email?.toLowerCase() !== adminEmail) {
    return { client: null, error: "This secure sign-in is not authorised for the OPR inbox. Please sign out and use the OPR team email." };
  }

  return {
    client: createClient(publicUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    error: null,
  };
}

export async function GET(request: Request) {
  const { client: adminClient, error: accessError } = await getAdminClient(request);
  if (!adminClient) return Response.json({ error: accessError }, { status: 401 });

  const { data, error } = await adminClient
    .from("recipe_submissions")
    .select(submissionFields)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("OPR recipe inbox load failed", error);
    return Response.json({ error: `Could not load recipes: ${error.message}` }, { status: 400 });
  }
  return Response.json({ submissions: data ?? [] });
}

export async function PATCH(request: Request) {
  const { client: adminClient, error: accessError } = await getAdminClient(request);
  if (!adminClient) return Response.json({ error: accessError }, { status: 401 });

  try {
    const body = await request.json();
    if (!Number.isInteger(body.id)) {
      return Response.json({ error: "A valid recipe is required" }, { status: 400 });
    }

    if (body.action === "feature") {
      const featured = Boolean(body.featured);
      if (featured) {
        const { error: clearError } = await adminClient
          .from("recipe_submissions")
          .update({ is_recipe_of_week: false })
          .eq("is_recipe_of_week", true);
        if (clearError) throw clearError;
      }

      const { error } = await adminClient
        .from("recipe_submissions")
        .update({
          is_recipe_of_week: featured,
          recipe_of_week_note: featured && typeof body.note === "string" ? body.note.trim() || null : null,
        })
        .eq("id", body.id);
      if (error) throw error;
      return Response.json({ ok: true });
    }

    const changes = body.changes;
    if (!changes || typeof changes !== "object") {
      return Response.json({ error: "No changes supplied" }, { status: 400 });
    }

    const allowedKeys = ["status", "is_published", "published_at", "is_recipe_of_week", "recipe_of_week_note"];
    const safeChanges = Object.fromEntries(
      Object.entries(changes).filter(([key]) => allowedKeys.includes(key)),
    );
    if (!Object.keys(safeChanges).length) {
      return Response.json({ error: "No valid changes supplied" }, { status: 400 });
    }

    const { error } = await adminClient
      .from("recipe_submissions")
      .update(safeChanges)
      .eq("id", body.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR recipe update failed", error);
    return Response.json({ error: "Recipe could not be updated" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { client: adminClient, error: accessError } = await getAdminClient(request);
  if (!adminClient) return Response.json({ error: accessError }, { status: 401 });

  try {
    const { id } = await request.json();
    if (!Number.isInteger(id)) {
      return Response.json({ error: "A valid recipe is required" }, { status: 400 });
    }

    const { data: recipe, error: readError } = await adminClient
      .from("recipe_submissions")
      .select("photo_path, contributor_photo_path, original_recipe_path, audio_story_path, recipe_video_path")
      .eq("id", id)
      .maybeSingle();

    if (readError || !recipe) {
      return Response.json({ error: "Recipe not found" }, { status: 404 });
    }

    const { data: communityPosts, error: communityPostsError } = await adminClient
      .from("recipe_community_cooks")
      .select("photo_path")
      .eq("recipe_submission_id", id);
    if (communityPostsError) throw communityPostsError;

    const files = [
      recipe.photo_path,
      recipe.contributor_photo_path,
      recipe.original_recipe_path,
      recipe.audio_story_path,
      recipe.recipe_video_path,
      ...(communityPosts ?? []).map((post) => post.photo_path),
    ].filter(
      (path): path is string => typeof path === "string" && path.length > 0,
    );
    if (files.length) {
      const { error: storageError } = await adminClient.storage.from("recipe-photos").remove(files);
      if (storageError) throw storageError;
    }

    const { error: deleteError } = await adminClient
      .from("recipe_submissions")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR recipe deletion failed", error);
    return Response.json({ error: "Recipe could not be deleted" }, { status: 400 });
  }
}
