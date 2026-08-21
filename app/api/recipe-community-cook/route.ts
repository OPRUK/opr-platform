import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { checkRateLimit } from "../../../lib/rate-limit";
import { attachmentLimits, extensionFor } from "../../../lib/media-attachments";
import { normaliseAttribution } from "../../../lib/attribution";
import { recordAnalyticsEvent } from "../../../lib/analytics-server";

function readText(formData: FormData, field: string, required = false) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (required && !text) throw new Error(`Missing ${field}`);
  return text;
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: "Community sharing is not configured" }, { status: 503 });
    }

    const rateLimitError = await checkRateLimit(supabase, request, "recipe-community-cook");
    if (rateLimitError) return rateLimitError;

    const formData = await request.formData();
    const recipeIdText = readText(formData, "recipeId");
    const recipeId = recipeIdText ? Number(recipeIdText) : null;
    const recipeSlug = readText(formData, "recipeSlug");
    const recipeTitle = readText(formData, "recipeTitle");
    const name = readText(formData, "name", true);
    const note = readText(formData, "note");
    const agreementAccepted = readText(formData, "agreementAccepted") === "true";
    const photo = formData.get("photo");
    const attribution = normaliseAttribution({
      source: readText(formData, "attributionSource"),
      utmSource: readText(formData, "utmSource"),
      utmMedium: readText(formData, "utmMedium"),
      utmCampaign: readText(formData, "utmCampaign"),
    });

    const isCommunityRecipe = recipeId !== null;
    const isCuratedRecipe = Boolean(recipeSlug);
    if ((!isCommunityRecipe && !isCuratedRecipe) || (isCommunityRecipe && isCuratedRecipe)) {
      return Response.json({ error: "A valid recipe is required" }, { status: 400 });
    }
    if (isCommunityRecipe && (!Number.isInteger(recipeId) || recipeId < 1)) {
      return Response.json({ error: "A valid recipe is required" }, { status: 400 });
    }
    if (isCuratedRecipe && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipeSlug) || recipeTitle.length > 160 || !recipeTitle)) {
      return Response.json({ error: "A valid recipe is required" }, { status: 400 });
    }
    if (name.length > 80 || note.length > 1000) {
      return Response.json({ error: "Please shorten your name or note" }, { status: 400 });
    }
    if (!agreementAccepted) {
      return Response.json({ error: "Permission to share is required" }, { status: 400 });
    }
    if (photo instanceof File && photo.size > attachmentLimits.portrait.maxSize) {
      return Response.json({ error: "Photo is too large" }, { status: 400 });
    }
    if (photo instanceof File && photo.size > 0 && !extensionFor("portrait", photo.type)) {
      return Response.json({ error: "Please use a JPG, PNG or WebP photo" }, { status: 400 });
    }

    if (isCommunityRecipe) {
      const { data: recipe, error: recipeError } = await supabase
        .from("recipe_submissions")
        .select("id")
        .eq("id", recipeId)
        .eq("is_published", true)
        .maybeSingle();
      if (recipeError || !recipe) {
        return Response.json({ error: "This recipe is not available for community sharing" }, { status: 404 });
      }
    }

    let photoPath: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      photoPath = `community-cooks/${crypto.randomUUID()}.${extensionFor("portrait", photo.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-uploads")
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });
      if (uploadError) throw uploadError;
    }

    const { error: insertError } = await supabase.from("recipe_community_cooks").insert({
      recipe_submission_id: recipeId,
      recipe_slug: recipeSlug || null,
      recipe_title: recipeTitle || null,
      name,
      note: note || null,
      photo_path: photoPath,
    });
    if (insertError) throw insertError;

    const pagePath = recipeSlug ? `/family-cookbook/${recipeSlug}` : `/family-cookbook/community/${recipeId}`;
    await recordAnalyticsEvent(supabase, {
      eventKey: "community_cook_success",
      pagePath,
      destination: null,
      attribution,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR community cook submission failed", error);
    return Response.json({ error: "Your community post could not be saved" }, { status: 400 });
  }
}
