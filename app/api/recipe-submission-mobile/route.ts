import { createClient } from "@supabase/supabase-js";
import { newSubmissionEmail, recipeReceivedEmail, sendEmail } from "../../../lib/email";

// A dedicated, lighter endpoint for the mobile Share screen (title/name/
// story only — see design_handoff_opr_app). Deliberately separate from
// /api/recipe-submission so the desktop form's full required-field
// validation is untouched; both insert into the same recipe_submissions
// table via the columns app/api/recipe-submission/route.ts already uses.
//
// Attachments are uploaded directly from the browser to Supabase Storage
// (see MobileShareForm.tsx) rather than proxied through this route — a
// combined multi-attachment request proxied through a Vercel serverless
// function hits its ~4.5MB request-body limit well before any of this
// route's own, more generous per-file size checks would apply. This route
// only ever receives short storage paths, never file bytes.
const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

// Paths this route accepts are always ones this codebase itself generated
// (see MobileShareForm.tsx's folder prefixes) — reject anything else so a
// crafted payload can't reference/attach an arbitrary object in the bucket.
const pathPattern = /^(?:audio|videos|originals)\/[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$|^[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/;

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readPath(value: unknown): string | null {
  const text = readText(value);
  return text && pathPattern.test(text) ? text : null;
}

export async function POST(request: Request) {
  try {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!secretKey || !supabaseUrl) {
      return Response.json({ error: "Submission service is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const name = readText(body.name);
    const title = readText(body.title);
    const story = readText(body.story);
    const location = readText(body.location) || null;

    if (!name || !title || !story) {
      return Response.json({ error: "Missing recipe details" }, { status: 400 });
    }
    if (body.submissionAgreementAccepted !== true) {
      return Response.json({ error: "Submission agreement is required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const email = readText(body.email) || null;

    const { error: submissionError } = await supabase.from("recipe_submissions").insert({
      name,
      email,
      location,
      title,
      story,
      photo_path: readPath(body.photoPath),
      original_recipe_path: readPath(body.originalRecipePath),
      audio_story_path: readPath(body.audioStoryPath),
      recipe_video_path: readPath(body.recipeVideoPath),
      permission_to_feature: true,
      licence_accepted: true,
      marketing_opt_in: body.marketingOptIn === true,
      consent_version: readText(body.consentVersion) || "opr-submission-terms-2026-08-03-combined",
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
