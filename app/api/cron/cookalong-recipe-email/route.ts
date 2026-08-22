import { cookalongRecipeListEmail, sendEmail } from "../../../../lib/email";
import { getFeaturedRecipe } from "../../../../lib/recipes";
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

  const client = getSupabaseAdmin();
  if (!client) {
    return Response.json({ error: "Cook-along email service is not configured." }, { status: 503 });
  }

  const recipe = getFeaturedRecipe("daves-butter-chicken");
  if (!recipe) {
    return Response.json({ error: "Recipe data is unavailable." }, { status: 503 });
  }

  const { data: signups, error } = await client
    .from("cookalong_signups")
    .select("id, name, email")
    .is("recipe_email_sent_at", null);

  if (error) {
    console.error("OPR cook-along recipe email lookup failed", error);
    return Response.json({ error: "Could not load signups." }, { status: 500 });
  }

  let sent = 0;
  for (const signup of signups ?? []) {
    const { sent: delivered } = await sendEmail({
      to: signup.email,
      ...cookalongRecipeListEmail({ name: signup.name, ingredients: recipe.ingredients }),
    });
    if (!delivered) continue;

    const { error: updateError } = await client
      .from("cookalong_signups")
      .update({ recipe_email_sent_at: new Date().toISOString() })
      .eq("id", signup.id);
    if (updateError) {
      console.error("OPR cook-along recipe email sent but not marked", signup.id, updateError);
      continue;
    }
    sent += 1;
  }

  return Response.json({ ok: true, sent, total: signups?.length ?? 0 });
}
