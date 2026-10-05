export const runtime = "nodejs";

function isAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ error: "The October 2026 cook-along has finished. No email was sent." }, { status: 410 });
}
