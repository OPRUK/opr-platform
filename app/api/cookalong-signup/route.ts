import { cookalongUnavailableMessage, isCookalongSignupOpen } from "../../../lib/cookalong-event.ts";

export async function POST() {
  if (isCookalongSignupOpen()) {
    return Response.json({ error: "Cook-along signup is not configured yet." }, { status: 501 });
  }

  return Response.json(
    { error: cookalongUnavailableMessage() },
    { status: 410 },
  );
}
