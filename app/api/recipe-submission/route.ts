import { newSubmissionEmail, recipeReceivedEmail, sendEmail } from "../../../lib/email";
import { normaliseAttribution } from "../../../lib/attribution";
import { recordAnalyticsEvent } from "../../../lib/analytics-server";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { checkRateLimit } from "../../../lib/rate-limit";
import { attachmentLimits, extensionFor } from "../../../lib/media-attachments";
import { titleCaseDishName } from "../../../lib/text";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

function readText(formData: FormData, field: string, required = false) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";

  if (required && !text) throw new Error(`Missing ${field}`);
  return text;
}

// Contributor-stated only, never inferred from method text — capped at 24h
// to reject garbage input rather than trusting an unbounded number.
function readMinutes(formData: FormData, field: string): number | null {
  const text = readText(formData, field);
  if (!text) return null;
  const value = Number(text);
  return Number.isInteger(value) && value >= 0 && value <= 1440 ? value : null;
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error("OPR recipe submission service is not configured");
      return Response.json({ error: "Submission service is not configured" }, { status: 503 });
    }

    const rateLimitError = await checkRateLimit(supabase, request, "recipe-submission");
    if (rateLimitError) return rateLimitError;

    const formData = await request.formData();
    const name = readText(formData, "name", true);
    const email = readText(formData, "email", true);
    const title = titleCaseDishName(readText(formData, "title", true));
    const category = readText(formData, "category", true);
    const story = readText(formData, "story", true);
    const ingredients = readText(formData, "ingredients", true);
    const method = readText(formData, "method", true);
    const attribution = normaliseAttribution({
      source: readText(formData, "attributionSource"),
      utmSource: readText(formData, "utmSource"),
      utmMedium: readText(formData, "utmMedium"),
      utmCampaign: readText(formData, "utmCampaign"),
    });

    if (readText(formData, "submissionAgreementAccepted") !== "true") {
      return Response.json({ error: "Submission agreement is required" }, { status: 400 });
    }

    const photo = formData.get("photo");
    const contributorPhoto = formData.get("contributorPhoto");
    const originalRecipe = formData.get("originalRecipe");
    const audioStory = formData.get("audioStory");
    const recipeVideo = formData.get("recipeVideo");
    if (photo instanceof File && photo.size > attachmentLimits.dish.maxSize) {
      return Response.json({ error: "Photo is too large" }, { status: 400 });
    }
    if (photo instanceof File && !extensionFor("dish", photo.type)) {
      return Response.json({ error: "Unsupported photo type" }, { status: 400 });
    }
    if (contributorPhoto instanceof File && contributorPhoto.size > attachmentLimits.portrait.maxSize) {
      return Response.json({ error: "Cook photo is too large" }, { status: 400 });
    }
    if (contributorPhoto instanceof File && contributorPhoto.size > 0 && !extensionFor("portrait", contributorPhoto.type)) {
      return Response.json({ error: "Unsupported cook photo type" }, { status: 400 });
    }
    if (originalRecipe instanceof File && originalRecipe.size > attachmentLimits.original.maxSize) {
      return Response.json({ error: "Original recipe image is too large" }, { status: 400 });
    }
    if (originalRecipe instanceof File && originalRecipe.size > 0 && !extensionFor("original", originalRecipe.type)) {
      return Response.json({ error: "Unsupported original recipe image type" }, { status: 400 });
    }
    if (audioStory instanceof File && audioStory.size > attachmentLimits.audio.maxSize) {
      return Response.json({ error: "Voice story is too large" }, { status: 400 });
    }
    if (audioStory instanceof File && audioStory.size > 0 && !extensionFor("audio", audioStory.type)) {
      return Response.json({ error: "Unsupported voice story type" }, { status: 400 });
    }
    if (recipeVideo instanceof File && recipeVideo.size > attachmentLimits.video.maxSize) {
      return Response.json({ error: "Recipe video is too large" }, { status: 400 });
    }
    if (recipeVideo instanceof File && recipeVideo.size > 0 && !extensionFor("video", recipeVideo.type)) {
      return Response.json({ error: "Unsupported recipe video type" }, { status: 400 });
    }

    let photoPath: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      photoPath = `dish/${crypto.randomUUID()}.${extensionFor("dish", photo.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-uploads")
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });

      if (uploadError) throw uploadError;
    }

    let originalRecipePath: string | null = null;
    if (originalRecipe instanceof File && originalRecipe.size > 0) {
      originalRecipePath = `original/${crypto.randomUUID()}.${extensionFor("original", originalRecipe.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-uploads")
        .upload(originalRecipePath, originalRecipe, {
          contentType: originalRecipe.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;
    }

    let contributorPhotoPath: string | null = null;
    if (contributorPhoto instanceof File && contributorPhoto.size > 0) {
      contributorPhotoPath = `portrait/${crypto.randomUUID()}.${extensionFor("portrait", contributorPhoto.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-uploads")
        .upload(contributorPhotoPath, contributorPhoto, {
          contentType: contributorPhoto.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;
    }

    let audioStoryPath: string | null = null;
    if (audioStory instanceof File && audioStory.size > 0) {
      audioStoryPath = `audio/${crypto.randomUUID()}.${extensionFor("audio", audioStory.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-uploads")
        .upload(audioStoryPath, audioStory, {
          contentType: audioStory.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;
    }

    let recipeVideoPath: string | null = null;
    if (recipeVideo instanceof File && recipeVideo.size > 0) {
      recipeVideoPath = `video/${crypto.randomUUID()}.${extensionFor("video", recipeVideo.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-uploads")
        .upload(recipeVideoPath, recipeVideo, {
          contentType: recipeVideo.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;
    }

    const { error: submissionError } = await supabase.from("recipe_submissions").insert({
      name,
      email,
      location: readText(formData, "location") || null,
      title,
      category,
      servings: readText(formData, "servings") || null,
      prep_time_minutes: readMinutes(formData, "prepTimeMinutes"),
      cook_time_minutes: readMinutes(formData, "cookTimeMinutes"),
      story,
      ingredients,
      method,
      cook_notes: readText(formData, "cookNotes") || null,
      photo_path: photoPath,
      contributor_photo_path: contributorPhotoPath,
      original_recipe_path: originalRecipePath,
      audio_story_path: audioStoryPath,
      recipe_video_path: recipeVideoPath,
      // Retain the original database field while the combined submission
      // agreement covers licence, permission to share identifiable people in
      // submitted media, and adult-only eligibility.
      permission_to_feature: true,
      licence_accepted: true,
      marketing_opt_in: readText(formData, "marketingOptIn") === "true",
      consent_version: readText(formData, "consentVersion") || "opr-submission-terms-2026-08-03-combined",
      consent_given_at: new Date().toISOString(),
    });

    if (submissionError) throw submissionError;

    const contributorEmail = recipeReceivedEmail({ name, title });
    const teamEmail = newSubmissionEmail({
      name,
      email,
      title,
      location: readText(formData, "location") || null,
    });

    // Saving the recipe takes priority. An email issue must not erase a valid submission.
    await Promise.allSettled([
      sendEmail({ to: email, ...contributorEmail }),
      sendEmail({ to: adminEmail, ...teamEmail }),
      recordAnalyticsEvent(supabase, {
        eventKey: "recipe_submission_success",
        pagePath: "/share",
        destination: null,
        attribution,
      }),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    // Keep the public response deliberately general, but retain the full error
    // in Vercel's private server logs so a failed submission can be diagnosed.
    console.error("OPR recipe submission failed", error);
    return Response.json({ error: "Recipe could not be saved" }, { status: 400 });
  }
}
