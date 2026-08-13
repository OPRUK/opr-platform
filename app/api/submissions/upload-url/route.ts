import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { attachmentLimits, normaliseMimeType, AttachmentKind } from "../../../../lib/media-attachments";
import { checkRateLimit } from "../../../../lib/rate-limit";

// Mints a private path grouped by submission session, so a single mobile
// share flow's attachments land together: {submissionToken}/{kind}/{uuid}.{ext}.
// The client PUTs the file straight to Supabase Storage using the returned
// token — this never touches the request body of this route, so it's not
// subject to Vercel's serverless body-size limit the way a proxied upload
// would be, while still never exposing the anon key a bucket-wide write.
const submissionTokenPattern = /^[a-zA-Z0-9-]{8,64}$/;

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return Response.json({ error: "Upload service is not configured" }, { status: 503 });
    }

    const rateLimitError = await checkRateLimit(supabase, request, "submissions-upload-url");
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const kind = typeof body.kind === "string" ? body.kind : "";
    const size = typeof body.size === "number" ? body.size : NaN;
    const type = typeof body.type === "string" ? normaliseMimeType(body.type) : "";
    const submissionToken = typeof body.submissionToken === "string" ? body.submissionToken : "";

    if (!submissionTokenPattern.test(submissionToken)) {
      return Response.json({ error: "A valid submission session is required" }, { status: 400 });
    }

    const limits = attachmentLimits[kind as AttachmentKind];
    if (!limits) {
      return Response.json({ error: "Unsupported attachment kind" }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0 || size > limits.maxSize) {
      return Response.json({ error: "File is too large" }, { status: 400 });
    }
    const extension = limits.types[type];
    if (!extension) {
      return Response.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const path = `${submissionToken}/${kind}/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage.from("recipe-uploads").createSignedUploadUrl(path);

    if (error || !data) {
      console.error("OPR upload URL could not be created", error);
      return Response.json({ error: "Upload could not be prepared" }, { status: 500 });
    }

    return Response.json({ path: data.path, token: data.token });
  } catch (error) {
    console.error("OPR upload URL request failed", error);
    return Response.json({ error: "Upload could not be prepared" }, { status: 400 });
  }
}
