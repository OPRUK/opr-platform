import { createClient } from "@supabase/supabase-js";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

export async function DELETE(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Not authorised" }, { status: 401 });

  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!publicUrl || !publishableKey || !secretKey) {
    return Response.json({ error: "The OPR admin service is not configured" }, { status: 503 });
  }

  const authClient = createClient(publicUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData } = await authClient.auth.getUser(token);
  if (authData.user?.email !== adminEmail) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!Number.isInteger(id)) {
      return Response.json({ error: "A valid recipe is required" }, { status: 400 });
    }

    const adminClient = createClient(publicUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: recipe, error: readError } = await adminClient
      .from("recipe_submissions")
      .select("photo_path, original_recipe_path, audio_story_path")
      .eq("id", id)
      .maybeSingle();

    if (readError || !recipe) {
      return Response.json({ error: "Recipe not found" }, { status: 404 });
    }

    const files = [recipe.photo_path, recipe.original_recipe_path, recipe.audio_story_path].filter(
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
