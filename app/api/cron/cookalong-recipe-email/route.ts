import { cookalongUnavailableMessage, isCookalongCronEligible } from "../../../../lib/cookalong-event.ts";

export const runtime = "nodejs";

function isAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCookalongCronEligible("recipeList")) {
    return Response.json({ error: `${cookalongUnavailableMessage()} No email was sent.` }, { status: 410 });
  }

  return Response.json({ error: "Cook-along recipe-list delivery is not configured yet." }, { status: 501 });
}
