import { requireAdmin } from "../../../../lib/admin-auth";

function currentMonthKey() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

export async function GET(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return Response.json({ error: accessError }, { status: 401 });

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
