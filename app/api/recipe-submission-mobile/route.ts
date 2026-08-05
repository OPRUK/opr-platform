import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { newSubmissionEmail, recipeReceivedEmail, sendEmail } from "../../../lib/email";

// A dedicated, lighter endpoint for the mobile Share screen (title/name/
// story only — see design_handoff_opr_app). Deliberately separate from
// /api/recipe-submission so the desktop form's full required-field
// validation is untouched; both insert into the same recipe_submissions
// table via the columns app/api/recipe-submission/route.ts already uses.
const adminEmail = "chaten@otherpeoplesrecipes.co.uk";
const CONSENT_VERSION = "opr-submission-terms-2026-08-03-combined";
const maximumPhotoSize = 5 * 1024 * 1024;
const maximumMediaSize = 25 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const acceptedAudioTypes = new Set(["audio/aac", "audio/m4a", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/x-m4a"]);
const acceptedVideoTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);

function readText(formData: FormData, field: string, required = false) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (required && !text) throw new Error(`Missing ${field}`);
  return text;
}

async function uploadIfPresent(
  supabase: SupabaseClient,
  formData: FormData,
  field: string,
  { folder, maxSize, acceptedTypes, extensionFallback }: { folder: string; maxSize: number; acceptedTypes: Set<string>; extensionFallback: string },
) {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > maxSize) throw new Error(`${field} is too large`);
  if (!acceptedTypes.has(file.type)) throw new Error(`Unsupported ${field} type`);

  const extension = file.type.split("/")[1]?.replace("quicktime", "mov") || extensionFallback;
  const path = folder ? `${folder}/${crypto.randomUUID()}.${extension}` : `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("recipe-photos").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export async function POST(request: Request) {
  try {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!secretKey || !supabaseUrl) {
      return Response.json({ error: "Submission service is not configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const name = readText(formData, "name", true);
    const title = readText(formData, "title", true);
    const story = readText(formData, "story", true);
    const location = readText(formData, "location") || null;

    if (readText(formData, "submissionAgreementAccepted") !== "true") {
      return Response.json({ error: "Submission agreement is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const [photoPath, audioStoryPath, recipeVideoPath, originalRecipePath] = await Promise.all([
      uploadIfPresent(supabase, formData, "photo", { folder: "", maxSize: maximumPhotoSize, acceptedTypes: acceptedPhotoTypes, extensionFallback: "jpg" }),
      uploadIfPresent(supabase, formData, "audioStory", { folder: "audio", maxSize: maximumMediaSize, acceptedTypes: acceptedAudioTypes, extensionFallback: "m4a" }),
      uploadIfPresent(supabase, formData, "recipeVideo", { folder: "videos", maxSize: maximumMediaSize, acceptedTypes: acceptedVideoTypes, extensionFallback: "mp4" }),
      uploadIfPresent(supabase, formData, "originalRecipePhoto", { folder: "originals", maxSize: maximumPhotoSize, acceptedTypes: acceptedPhotoTypes, extensionFallback: "jpg" }),
    ]);

    const email = readText(formData, "email") || null;

    const { error: submissionError } = await supabase.from("recipe_submissions").insert({
      name,
      email,
      location,
      title,
      story,
      photo_path: photoPath,
      original_recipe_path: originalRecipePath,
      audio_story_path: audioStoryPath,
      recipe_video_path: recipeVideoPath,
      permission_to_feature: true,
      licence_accepted: true,
      marketing_opt_in: readText(formData, "marketingOptIn") === "true",
      consent_version: CONSENT_VERSION,
      consent_given_at: new Date().toISOString(),
    });

    if (submissionError) throw submissionError;

    const teamEmail = newSubmissionEmail({ name, email: email || "no email given", title, location });
    const emailTasks = [sendEmail({ to: adminEmail, ...teamEmail })];
    if (email) emailTasks.push(sendEmail({ to: email, ...recipeReceivedEmail({ name, title }) }));
    await Promise.allSettled(emailTasks);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR mobile recipe submission failed", error);
    return Response.json({ error: "Recipe could not be saved" }, { status: 400 });
  }
}
