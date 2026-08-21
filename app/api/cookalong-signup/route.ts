import { cookalongSignupWelcomeEmail, newCookalongSignupEmail, sendEmail } from "../../../lib/email";
import { normaliseAttribution } from "../../../lib/attribution";
import { recordAnalyticsEvent } from "../../../lib/analytics-server";
import { createUnsubscribeLink } from "../../../lib/unsubscribe";
import { checkRateLimit } from "../../../lib/rate-limit";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";

const adminEmail = "chaten@otherpeoplesrecipes.co.uk";

export async function POST(request: Request) {
  try {
    const {
      name: submittedName,
      email: submittedEmail,
      marketingOptIn = false,
      attribution: submittedAttribution,
    } = await request.json();
    const name = typeof submittedName === "string" ? submittedName.trim() : "";
    const email = typeof submittedEmail === "string" ? submittedEmail.trim().toLowerCase() : "";
    const attribution = normaliseAttribution(submittedAttribution);

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Please enter your name and a valid email address." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error("OPR cook-along signup service is not configured");
      return Response.json({ error: "Sign-up is not available just now. Please try again shortly." }, { status: 503 });
    }

    const rateLimitResponse = await checkRateLimit(supabase, request, "cookalong-signup");
    if (rateLimitResponse) return rateLimitResponse;

    const wantsMarketing = marketingOptIn === true;
    const { error: saveError } = await supabase.from("cookalong_signups").insert({
      name,
      email,
      marketing_opt_in: wantsMarketing,
      source: attribution.source ?? "website",
    });

    if (saveError) {
      if (saveError.code === "23505") {
        // Already on the list — a new, explicit opt-in still counts as
        // consent to resume optional updates.
        if (wantsMarketing) {
          const { error: rejoinError } = await supabase
            .from("cookalong_signups")
            .update({ marketing_opt_in: true, marketing_unsubscribed_at: null })
            .eq("email", email);
          if (rejoinError) throw rejoinError;
        }
        return Response.json({ alreadyJoined: true });
      }

      throw saveError;
    }

    await recordAnalyticsEvent(supabase, {
      eventKey: "cookalong_signup_success",
      pagePath: "/live-with-dave",
      destination: null,
      attribution,
    });

    await Promise.all([
      sendEmail({
        to: email,
        ...cookalongSignupWelcomeEmail({
          name,
          unsubscribeUrl: wantsMarketing ? createUnsubscribeLink(email) : null,
          marketingOptIn: wantsMarketing,
        }),
      }),
      sendEmail({ to: adminEmail, ...newCookalongSignupEmail({ name, email }) }),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("OPR cook-along signup failed", error);
    return Response.json({ error: "We could not add you to the list just now." }, { status: 400 });
  }
}
