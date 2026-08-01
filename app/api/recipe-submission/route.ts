import { createClient } from "@supabase/supabase-js";
import { newSubmissionEmail, recipeReceivedEmail, sendEmail } from "../../../lib/email";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";
const maximumPhotoSize = 5 * 1024 * 1024;
const maximumOriginalRecipeSize = 10 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const acceptedOriginalRecipeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

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

    const photo = formData.get("photo");
    const originalRecipe = formData.get("originalRecipe");
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
      photo_path: photoPath,
      original_recipe_path: originalRecipePath,
      // Retain the original database field while the newer licence wording is
      // in use. The required licence confirmation explicitly covers featuring
      // the recipe, so this is compatible with existing submissions.
      permission_to_feature: true,
      licence_accepted: readText(formData, "licenceAccepted") === "true",
      marketing_opt_in: readText(formData, "marketingOptIn") === "true",
      consent_version: readText(formData, "consentVersion") || "opr-submission-terms-2026-08-01",
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
