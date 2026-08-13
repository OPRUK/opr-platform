import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

function currentMonthKey() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

async function getAdminClient(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!token || !url || !publishableKey) return null;

  const authClient = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || data.user?.email?.toLowerCase() !== adminEmail) return null;

  return getSupabaseAdmin();
}

export async function GET(request: Request) {
  const client = await getAdminClient(request);
  if (!client) return Response.json({ error: "Your secure sign-in is not authorised." }, { status: 401 });

  const monthKey = currentMonthKey();
  const { data, error } = await client
    .from("recipe_month_votes")
    .select("recipe_key")
    .eq("month_key", monthKey);

  if (error) {
    console.error("OPR recipe of the month results could not load", error);
    return Response.json({ error: "Recipe of the Month results could not be loaded." }, { status: 400 });
  }

  const totals: Record<string, number> = {};
  for (const vote of data ?? []) {
    totals[vote.recipe_key] = (totals[vote.recipe_key] ?? 0) + 1;
  }

  return Response.json({ monthKey, totals, totalVotes: data?.length ?? 0 });
}
