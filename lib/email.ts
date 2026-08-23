const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://otherpeoplesrecipes.co.uk";
const from = process.env.EMAIL_FROM || "Other People's Recipes <onboarding@resend.dev>";

// Shared chrome for every outbound email: the OPR badge and parchment
// background from the brand guidelines, with body content sitting in a
// cream card on top. One place to update if the brand assets ever change —
// see OPR Brand Guidelines v1.0 ("Email identity").
function emailShell(bodyHtml: string) {
  return `
    <div style="background: #EED8B2; padding: 32px 12px; font-family: 'Gill Sans MT', 'Gill Sans', Avenir, Corbel, Arial, sans-serif;">
      <div style="max-width: 620px; margin: 0 auto; background-image: url('${siteUrl}/images/email/opr-paper-background.jpg'); background-size: cover; background-position: center; background-color: #EAD09B; border-radius: 18px; border: 1px solid #9B6935; padding: 34px 22px 26px;">
        <img src="${siteUrl}/images/email/opr-logo-badge.png" alt="Other People's Recipes" width="64" height="64" style="display: block; margin: 0 auto 14px; border-radius: 999px;" />
        <p style="color: #9A622A; letter-spacing: 2px; font-size: 12px; text-transform: uppercase; text-align: center; margin: 0 0 22px;">Other People&apos;s Recipes</p>
        <div style="background: #FFF9EE; border-radius: 14px; padding: 30px 26px; color: #4A4232; line-height: 1.65; box-shadow: 0 12px 26px rgba(74, 42, 14, 0.16);">
          ${bodyHtml}
        </div>
        <p style="text-align: center; font-size: 11px; letter-spacing: 1px; color: #6B5637; margin: 18px 0 0;">Every Recipe has a Story.</p>
      </div>
    </div>
  `;
}

// Chaten's actual signature, replacing the plain-text sign-off — see
// OPR Brand Guidelines v1.0 ("Email identity").
function signatureBlock(leadIn: string) {
  return `
    <div style="margin-top: 32px;">
      <p style="margin: 0 0 6px;">${leadIn}</p>
      <img src="${siteUrl}/images/chaten-signature.png" alt="Chaten" width="150" style="display: block; height: auto;" />
      <p style="margin: 4px 0 0; font-size: 13px; color: #4A4232;">Founder, Other People&apos;s Recipes</p>
    </div>
  `;
}

function marketingFooter(unsubscribeUrl: string | null) {
  if (!unsubscribeUrl) return "";

  return `<p style="border-top: 1px solid #DDB765; padding-top: 18px; margin-top: 36px; font-size: 13px; color: #6B6254;">You are receiving OPR news because you asked us to keep you posted. <a href="${unsubscribeUrl}" style="color: #1C5A50;">Unsubscribe from OPR updates</a>.</p>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  // Email becomes active as soon as the key is added in Vercel. Until then,
  // recipe submissions still work normally.
  if (!apiKey) {
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    console.error("OPR email could not be sent", await response.text());
  }

  return { sent: response.ok };
}

export function recipeReceivedEmail({ name, title }: { name: string; title: string }) {
  return {
    subject: `We've got "${title}"`,
    html: emailShell(`
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.2; text-align: center; color: #123C39; margin: 0 0 22px;">Thank you for sharing your recipe.</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for trusting us with <strong>${escapeHtml(title)}</strong> and the story behind it — that&apos;s exactly what Other People&apos;s Recipes is for.</p>
      <p>I read every recipe that comes in myself. If it&apos;s selected for the Living Cookbook, the restaurant, or a future film, I&apos;ll be in touch.</p>
      ${signatureBlock("Warmly,")}
    `),
  };
}

export function newSubmissionEmail({ name, email, title, location }: { name: string; email: string; title: string; location?: string | null }) {
  return {
    subject: `New OPR recipe: ${title}`,
    html: emailShell(`
      <p style="color: #9A622A; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px;">Private OPR alert</p>
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 28px; color: #123C39; margin: 0 0 18px;">A new recipe has arrived.</h1>
      <p><strong>${escapeHtml(title)}</strong></p>
      <p>Shared by ${escapeHtml(name)}${location ? ` from ${escapeHtml(location)}` : ""}.</p>
      <p>Contact: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><a href="${siteUrl}/admin" style="display: inline-block; background: #123C39; color: #FFF3DF; padding: 12px 18px; border-radius: 999px; text-decoration: none;">Open recipe inbox</a></p>
    `),
  };
}

export function publishedRecipeEmail({ name, title, recipeUrl }: { name: string; title: string; recipeUrl: string }) {
  return {
    subject: `"${title}" is live in the Living Cookbook`,
    html: emailShell(`
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.2; text-align: center; color: #123C39; margin: 0 0 22px;">Your recipe is now part of the book.</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p><strong>${escapeHtml(title)}</strong> is now live in the Living Cookbook — permanently, alongside the story of who taught it to you and why it matters.</p>
      <p><a href="${recipeUrl}" style="display: inline-block; background: #123C39; color: #FFF3DF; padding: 12px 18px; border-radius: 999px; text-decoration: none;">See your recipe</a></p>
      <p>Thank you for trusting us with it. This is exactly what Other People&apos;s Recipes is for.</p>
      ${signatureBlock("Warmly,")}
    `),
  };
}

export function foundingTableWelcomeEmail({
  name,
  unsubscribeUrl,
  marketingOptIn,
}: {
  name: string;
  unsubscribeUrl: string | null;
  marketingOptIn: boolean;
}) {
  return {
    subject: "You've got a seat at our table",
    html: emailShell(`
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.2; text-align: center; color: #123C39; margin: 0 0 22px;">You&apos;ve got a seat at our table.</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Other People&apos;s Recipes started as a note I wrote myself back in 2000 — one day, build the place where family recipes can live on. You just became one of the first people helping make that real.</p>
      ${marketingOptIn ? "<p>You&apos;ll be the first to hear when a new family recipe goes up, when tasting events open, when Recipe of the Month voting starts, and whatever we build next.</p>" : "<p>Your place is saved. You didn&apos;t opt in to OPR news, so that&apos;s the last you&apos;ll hear from us unless you get in touch.</p>"}
      <p>While you wait, the Living Cookbook is already open.</p>
      <p><a href="${siteUrl}/family-cookbook" style="display: inline-block; background: #1C5A50; color: #FFF3DF; padding: 12px 18px; border-radius: 999px; text-decoration: none;">Explore the Living Cookbook</a></p>
      ${signatureBlock("Warmly,")}
      ${marketingFooter(unsubscribeUrl)}
    `),
  };
}

export function cookalongSignupWelcomeEmail({
  name,
  unsubscribeUrl,
  marketingOptIn,
}: {
  name: string;
  unsubscribeUrl: string | null;
  marketingOptIn: boolean;
}) {
  return {
    subject: "You're in for Dave's live Butter Chicken cook-along",
    html: emailShell(`
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.2; text-align: center; color: #123C39; margin: 0 0 22px;">You&apos;ve got a spot at Dave&apos;s table.</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p>You&apos;re on the list for Dave&apos;s live Butter Chicken cook-along on <strong>Sunday 4 October, 5pm UK time</strong>, over Zoom.</p>
      <p>We&apos;ll send you the recipe list about a week before, so you can shop and prep, then the Zoom link closer to the day.</p>
      <p>Can&apos;t make it live? No problem — just keep an eye on your inbox for the details.</p>
      ${signatureBlock("Warmly,")}
      ${marketingFooter(unsubscribeUrl)}
      ${!marketingOptIn ? '<p style="font-size: 13px; color: #6B6254; margin-top: 18px;">You will only hear from us about this cook-along — you did not opt in to other OPR news.</p>' : ""}
    `),
  };
}

export function cookalongRecipeListEmail({
  name,
  ingredients,
}: {
  name: string;
  ingredients: string[];
}) {
  return {
    subject: "Dave's Butter Chicken — the recipe list for Sunday",
    html: emailShell(`
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.2; text-align: center; color: #123C39; margin: 0 0 22px;">Time to go shopping.</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Dave&apos;s cooking his family Butter Chicken live this <strong>Sunday 4 October, 5pm UK time</strong>, over Zoom — here&apos;s everything you need to shop and prep before then, so you can cook right alongside him.</p>
      <p style="margin-top: 28px; font-weight: bold; color: #123C39;">What you&apos;ll need:</p>
      <ul style="padding-left: 20px; margin: 12px 0;">
        ${ingredients.map((item) => `<li style="margin-bottom: 6px;">${escapeHtml(item)}</li>`).join("\n        ")}
      </ul>
      <p><a href="${siteUrl}/family-cookbook/daves-butter-chicken" style="display: inline-block; background: #1C5A50; color: #FFF3DF; padding: 12px 18px; border-radius: 999px; text-decoration: none;">See the full recipe and method</a></p>
      <p style="margin-top: 24px;">We&apos;ll send the Zoom link separately, closer to the day.</p>
      ${signatureBlock("See you Sunday,")}
      <p style="border-top: 1px solid #DDB765; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #6B6254;">You&apos;re receiving this because you signed up for Dave&apos;s live cook-along.</p>
    `),
  };
}

export function cookalongZoomLinkEmail({
  name,
  zoomLink,
}: {
  name: string;
  zoomLink: string;
}) {
  return {
    subject: "Your Zoom link for Dave's cook-along on Sunday",
    html: emailShell(`
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.2; text-align: center; color: #123C39; margin: 0 0 22px;">See you in the kitchen.</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Dave&apos;s live Butter Chicken cook-along starts <strong>Sunday 4 October, 5pm UK time</strong>. Here&apos;s your link to join:</p>
      <p style="text-align: center; margin: 28px 0;"><a href="${escapeHtml(zoomLink)}" style="display: inline-block; background: #1C5A50; color: #FFF3DF; padding: 14px 26px; border-radius: 999px; text-decoration: none; font-weight: bold;">Join the Zoom cook-along</a></p>
      <p>A few things that help:</p>
      <ul style="padding-left: 20px; margin: 12px 0;">
        <li style="margin-bottom: 6px;">Have your ingredients prepped and within reach — Dave keeps moving.</li>
        <li style="margin-bottom: 6px;">Join a few minutes early to get set up.</li>
        <li style="margin-bottom: 6px;">Bring your questions — this is a live kitchen, not a recording.</li>
      </ul>
      <p>This link is just for you — please don&apos;t share it on.</p>
      ${signatureBlock("See you Sunday,")}
      <p style="border-top: 1px solid #DDB765; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #6B6254;">You&apos;re receiving this because you signed up for Dave&apos;s live cook-along.</p>
    `),
  };
}

export function newCookalongSignupEmail({ name, email }: { name: string; email: string }) {
  return {
    subject: `New cook-along signup: ${name}`,
    html: emailShell(`
      <p style="color: #9A622A; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px;">Private OPR alert</p>
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 26px; color: #123C39; margin: 0 0 18px;">Someone has joined the cook-along.</h1>
      <p><strong>${escapeHtml(name)}</strong> signed up to watch Dave&apos;s live Butter Chicken cook-along.</p>
      <p>Contact: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    `),
  };
}

export function newFoundingTableEmail({ name, email }: { name: string; email: string }) {
  return {
    subject: `New table signup: ${name}`,
    html: emailShell(`
      <p style="color: #9A622A; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px;">Private OPR alert</p>
      <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 26px; color: #123C39; margin: 0 0 18px;">A new person has joined our table.</h1>
      <p><strong>${escapeHtml(name)}</strong> has joined the waitlist.</p>
      <p>Contact: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    `),
  };
}
