import { createClient } from "@supabase/supabase-js";
import { newSubmissionEmail, recipeReceivedEmail, sendEmail } from "../../../lib/email";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";
const maximumPhotoSize = 5 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

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
    if (photo instanceof File && photo.size > maximumPhotoSize) {
      return Response.json({ error: "Photo is too large" }, { status: 400 });
    }
    if (photo instanceof File && !acceptedPhotoTypes.has(photo.type)) {
      return Response.json({ error: "Unsupported photo type" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let photoPath: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
      photoPath = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-photos")
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });

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
      permission_to_feature: readText(formData, "permission") === "true",
      photo_path: photoPath,
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
  } catch {
    return Response.json({ error: "Recipe could not be saved" }, { status: 400 });
  }
}
