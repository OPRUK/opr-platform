import { createClient } from "@supabase/supabase-js";

const maximumPhotoSize = 5 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function readText(formData: FormData, field: string, required = false) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (required && !text) throw new Error(`Missing ${field}`);
  return text;
}

function extensionForImage(type: string) {
  return ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[type] ?? "jpg";
}

export async function POST(request: Request) {
  try {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!secretKey || !supabaseUrl) {
      return Response.json({ error: "Community sharing is not configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const recipeId = Number(readText(formData, "recipeId", true));
    const name = readText(formData, "name", true);
    const note = readText(formData, "note");
    const agreementAccepted = readText(formData, "agreementAccepted") === "true";
    const photo = formData.get("photo");

    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return Response.json({ error: "A valid recipe is required" }, { status: 400 });
    }
    if (name.length > 80 || note.length > 1000) {
      return Response.json({ error: "Please shorten your name or note" }, { status: 400 });
    }
    if (!agreementAccepted) {
      return Response.json({ error: "Permission to share is required" }, { status: 400 });
    }
    if (photo instanceof File && photo.size > maximumPhotoSize) {
      return Response.json({ error: "Photo is too large" }, { status: 400 });
    }
    if (photo instanceof File && photo.size > 0 && !acceptedPhotoTypes.has(photo.type)) {
      return Response.json({ error: "Please use a JPG, PNG or WebP photo" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: recipe, error: recipeError } = await supabase
      .from("recipe_submissions")
      .select("id")
      .eq("id", recipeId)
      .eq("is_published", true)
      .maybeSingle();
    if (recipeError || !recipe) {
      return Response.json({ error: "This recipe is not available for community sharing" }, { status: 404 });
    }

    let photoPath: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      photoPath = `community-cooks/${crypto.randomUUID()}.${extensionForImage(photo.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-photos")
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });
      if (uploadError) throw uploadError;
    }

    const { error: insertError } = await supabase.from("recipe_community_cooks").insert({
      recipe_submission_id: recipeId,
      name,
      note: note || null,
      photo_path: photoPath,
    });
    if (insertError) throw insertError;

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR community cook submission failed", error);
    return Response.json({ error: "Your community post could not be saved" }, { status: 400 });
  }
}
