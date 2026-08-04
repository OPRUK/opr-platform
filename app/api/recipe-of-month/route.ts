import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const voteCookieName = "opr_recipe_of_month_voter";
const voteCookieAge = 60 * 60 * 24 * 370;

function currentMonthKey() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getResults(monthKey: string, voterToken?: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Voting is not configured");

  const { data, error } = await supabase
    .from("recipe_month_votes")
    .select("recipe_key, voter_token")
    .eq("month_key", monthKey);

  if (error) throw error;

  const totals = new Map<string, number>();
  let selectedRecipeKey: string | null = null;

  for (const vote of data ?? []) {
    totals.set(vote.recipe_key, (totals.get(vote.recipe_key) ?? 0) + 1);
    if (voterToken && vote.voter_token === voterToken) {
      selectedRecipeKey = vote.recipe_key;
    }
  }

  return {
    monthKey,
    selectedRecipeKey,
    totals: Object.fromEntries(totals),
  };
}

export async function GET(request: NextRequest) {
  try {
    const monthKey = currentMonthKey();
    const voterToken = request.cookies.get(voteCookieName)?.value;
    return NextResponse.json(await getResults(monthKey, voterToken));
  } catch (error) {
    console.error("OPR recipe of the month could not load", error);
    return NextResponse.json({ error: "Voting is unavailable just now." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recipeKey } = await request.json();
    if (typeof recipeKey !== "string" || !/^(featured-[a-z0-9-]+|community-\d+)$/.test(recipeKey)) {
      return NextResponse.json({ error: "Choose a recipe from the OPR cookbook." }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) throw new Error("Voting is not configured");

    const monthKey = currentMonthKey();
    const existingToken = request.cookies.get(voteCookieName)?.value;
    const voterToken = existingToken ?? crypto.randomUUID();
    const { error } = await supabase.from("recipe_month_votes").insert({
      month_key: monthKey,
      recipe_key: recipeKey,
      voter_token: voterToken,
    });

    if (error && error.code !== "23505") throw error;

    const result = await getResults(monthKey, voterToken);
    const response = NextResponse.json({
      ...result,
      alreadyVoted: error?.code === "23505",
    });

    if (!existingToken) {
      response.cookies.set(voteCookieName, voterToken, {
        httpOnly: true,
        maxAge: voteCookieAge,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("OPR recipe of the month vote could not save", error);
    return NextResponse.json({ error: "Your vote could not be saved just now." }, { status: 503 });
  }
}
