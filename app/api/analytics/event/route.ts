import { normaliseAttribution, type AnalyticsEventKey } from "../../../../lib/attribution";
import { recordAnalyticsEvent } from "../../../../lib/analytics-server";
import { featuredRecipes } from "../../../../lib/recipes";
import { films } from "../../../../lib/films";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";

const fixedEvents: Partial<Record<AnalyticsEventKey, { pagePath: string; destination: string }>> = {
  home_cookbook: { pagePath: "/", destination: "/family-cookbook" },
  cookbook_share: { pagePath: "/family-cookbook", destination: "/share" },
  founder_join: { pagePath: "/founder", destination: "/join-our-table" },
};

const recipeDestinations = new Set(
  featuredRecipes.map((recipe) => `/family-cookbook/${recipe.slug}`),
);

const filmDestinations = new Set(films.map((film) => film.video));
const filmEventKeys = new Set<AnalyticsEventKey>(["film_play", "film_watched"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return new Response(null, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const eventKey = values.eventKey;
  const submittedDestination = values.destination;
  if (typeof eventKey !== "string") {
    return new Response(null, { status: 400 });
  }

  let pagePath: string;
  let destination: string;
  if (eventKey === "film_recipe") {
    if (typeof submittedDestination !== "string" || !recipeDestinations.has(submittedDestination)) {
      return new Response(null, { status: 400 });
    }
    pagePath = "/films";
    destination = submittedDestination;
  } else if (filmEventKeys.has(eventKey as AnalyticsEventKey)) {
    if (typeof submittedDestination !== "string" || !filmDestinations.has(submittedDestination)) {
      return new Response(null, { status: 400 });
    }
    pagePath = "/films";
    destination = submittedDestination;
  } else {
    const fixedEvent = fixedEvents[eventKey as AnalyticsEventKey];
    if (!fixedEvent || submittedDestination !== fixedEvent.destination) {
      return new Response(null, { status: 400 });
    }
    pagePath = fixedEvent.pagePath;
    destination = fixedEvent.destination;
  }

  const client = getSupabaseAdmin();
  if (client) {
    await recordAnalyticsEvent(client, {
      eventKey: eventKey as AnalyticsEventKey,
      pagePath,
      destination,
      attribution: normaliseAttribution(values.attribution),
    });
  }

  return new Response(null, { status: 204 });
}
