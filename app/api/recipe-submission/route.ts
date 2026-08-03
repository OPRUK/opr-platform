import { createClient } from "@supabase/supabase-js";
import { newSubmissionEmail, recipeReceivedEmail, sendEmail } from "../../../lib/email";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";
const maximumPhotoSize = 5 * 1024 * 1024;
const maximumOriginalRecipeSize = 10 * 1024 * 1024;
const maximumAudioStorySize = 10 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const acceptedOriginalRecipeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const acceptedAudioStoryTypes = new Set([
  "audio/aac",
  "audio/m4a",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
]);

function normaliseMimeType(type: string) {
  return type.split(";", 1)[0].toLowerCase();
}

function extensionForImage(type: string) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };

  return extensions[type] ?? "jpg";
}

function extensionForAudio(type: string) {
  const extensions: Record<string, string> = {
    "audio/aac": "aac",
    "audio/m4a": "m4a",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/webm": "webm",
    "audio/x-m4a": "m4a",
  };

  return extensions[normaliseMimeType(type)] ?? "webm";
}

function readText(formData: FormData, field: string, required = false) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";

  if (required && !text) throw new Error(`Missing ${field}`);
  return text;
}

export async function POST(request: Request) {
  try {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!secretKey || !supabaseUrl) {
      console.error("OPR recipe submission service is not configured", {
        hasSupabaseSecretKey: Boolean(secretKey),
        hasSupabaseUrl: Boolean(supabaseUrl),
      });
      return Response.json({ error: "Submission service is not configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const name = readText(formData, "name", true);
    const email = readText(formData, "email", true);
    const title = readText(formData, "title", true);
    const category = readText(formData, "category", true);
    const story = readText(formData, "story", true);
    const ingredients = readText(formData, "ingredients", true);
    const method = readText(formData, "method", true);

    if (readText(formData, "licenceAccepted") !== "true") {
      return Response.json({ error: "Submission licence confirmation is required" }, { status: 400 });
    }

    if (readText(formData, "thirdPartyPermissionAccepted") !== "true") {
      return Response.json({ error: "Permission confirmation is required" }, { status: 400 });
    }

    if (readText(formData, "isAtLeast18") !== "true") {
      return Response.json({ error: "Recipe submissions are currently for adults only" }, { status: 400 });
    }

    const photo = formData.get("photo");
    const originalRecipe = formData.get("originalRecipe");
    const audioStory = formData.get("audioStory");
    if (photo instanceof File && photo.size > maximumPhotoSize) {
      return Response.json({ error: "Photo is too large" }, { status: 400 });
    }
    if (photo instanceof File && !acceptedPhotoTypes.has(photo.type)) {
      return Response.json({ error: "Unsupported photo type" }, { status: 400 });
    }
    if (originalRecipe instanceof File && originalRecipe.size > maximumOriginalRecipeSize) {
      return Response.json({ error: "Original recipe image is too large" }, { status: 400 });
    }
    if (originalRecipe instanceof File && originalRecipe.size > 0 && !acceptedOriginalRecipeTypes.has(originalRecipe.type)) {
      return Response.json({ error: "Unsupported original recipe image type" }, { status: 400 });
    }
    if (audioStory instanceof File && audioStory.size > maximumAudioStorySize) {
      return Response.json({ error: "Voice story is too large" }, { status: 400 });
    }
    if (audioStory instanceof File && audioStory.size > 0 && !acceptedAudioStoryTypes.has(normaliseMimeType(audioStory.type))) {
      return Response.json({ error: "Unsupported voice story type" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let photoPath: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      const extension = extensionForImage(photo.type);
      photoPath = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-photos")
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });

      if (uploadError) throw uploadError;
    }

    let originalRecipePath: string | null = null;
    if (originalRecipe instanceof File && originalRecipe.size > 0) {
      originalRecipePath = `originals/${crypto.randomUUID()}.${extensionForImage(originalRecipe.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-photos")
        .upload(originalRecipePath, originalRecipe, {
          contentType: originalRecipe.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;
    }

    let audioStoryPath: string | null = null;
    if (audioStory instanceof File && audioStory.size > 0) {
      audioStoryPath = `audio/${crypto.randomUUID()}.${extensionForAudio(audioStory.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-photos")
        .upload(audioStoryPath, audioStory, {
          contentType: audioStory.type,
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
      story,
      ingredients,
      method,
      cook_notes: readText(formData, "cookNotes") || null,
      photo_path: photoPath,
      original_recipe_path: originalRecipePath,
      audio_story_path: audioStoryPath,
      // Retain the original database field while the newer licence wording is
      // in use. The required licence confirmation explicitly covers featuring
      // the recipe, so this is compatible with existing submissions.
      permission_to_feature: true,
      licence_accepted: readText(formData, "licenceAccepted") === "true",
      marketing_opt_in: readText(formData, "marketingOptIn") === "true",
      // This version records agreement to both the submission licence and the
      // separate confirmation covering people identifiable in uploaded media.
      consent_version: readText(formData, "consentVersion") || "opr-submission-terms-2026-08-03-age",
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
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    // Keep the public response deliberately general, but retain the full error
    // in Vercel's private server logs so a failed submission can be diagnosed.
    console.error("OPR recipe submission failed", error);
    return Response.json({ error: "Recipe could not be saved" }, { status: 400 });
  }
}
