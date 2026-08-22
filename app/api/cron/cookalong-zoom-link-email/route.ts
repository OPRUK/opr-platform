import { cookalongZoomLinkEmail, sendEmail } from "../../../../lib/email";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zoomLink = process.env.COOKALONG_ZOOM_LINK;
  if (!zoomLink) {
    console.error("OPR cook-along Zoom link email skipped: COOKALONG_ZOOM_LINK is not set");
    return Response.json({ error: "COOKALONG_ZOOM_LINK is not configured." }, { status: 503 });
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return Response.json({ error: "Cook-along email service is not configured." }, { status: 503 });
  }

  const { data: signups, error } = await client
    .from("cookalong_signups")
    .select("id, name, email")
    .is("zoom_link_email_sent_at", null);

  if (error) {
    console.error("OPR cook-along Zoom link email lookup failed", error);
    return Response.json({ error: "Could not load signups." }, { status: 500 });
  }

  let sent = 0;
  for (const signup of signups ?? []) {
    const { sent: delivered } = await sendEmail({
      to: signup.email,
      ...cookalongZoomLinkEmail({ name: signup.name, zoomLink }),
    });
    if (!delivered) continue;

    const { error: updateError } = await client
      .from("cookalong_signups")
      .update({ zoom_link_email_sent_at: new Date().toISOString() })
      .eq("id", signup.id);
    if (updateError) {
      console.error("OPR cook-along Zoom link email sent but not marked", signup.id, updateError);
      continue;
    }
    sent += 1;
  }

  return Response.json({ ok: true, sent, total: signups?.length ?? 0 });
}
