const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://otherpeoplesrecipes.co.uk";
const from = process.env.EMAIL_FROM || "Other People's Recipes <onboarding@resend.dev>";

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
    subject: `We received “${title}” — Other People's Recipes`,
    html: `
      <div style="font-family: 'Gill Sans MT', 'Gill Sans', Avenir, Corbel, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <p style="color: #9A622A; letter-spacing: 2px; font-size: 12px; text-transform: uppercase;">Other People's Recipes</p>
        <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 34px; line-height: 1.2;">Thank you for sharing your recipe.</h1>
        <p>Dear ${escapeHtml(name)},</p>
        <p>We&apos;ve received <strong>${escapeHtml(title)}</strong> and the story behind it. Thank you for trusting Other People&apos;s Recipes with a page from your family kitchen.</p>
        <p>Our team will read every recipe carefully. If it is selected for the Living Cookbook, the restaurant or a future film, we&apos;ll be in touch.</p>
        <p style="margin-top: 32px;">Warmly,<br /><strong>The OPR team</strong></p>
        <p style="border-top: 1px solid #DDB765; padding-top: 18px; margin-top: 36px; font-size: 13px; color: #6B6254;">Every Recipe has a Story.</p>
      </div>
    `,
  };
}

export function newSubmissionEmail({ name, email, title, location }: { name: string; email: string; title: string; location?: string | null }) {
  return {
    subject: `New OPR recipe: ${title}`,
    html: `
      <div style="font-family: 'Gill Sans MT', 'Gill Sans', Avenir, Corbel, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <p style="color: #9A622A; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Private OPR alert</p>
        <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 30px;">A new recipe has arrived.</h1>
        <p><strong>${escapeHtml(title)}</strong></p>
        <p>Shared by ${escapeHtml(name)}${location ? ` from ${escapeHtml(location)}` : ""}.</p>
        <p>Contact: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><a href="${siteUrl}/admin" style="display: inline-block; background: #123C39; color: #FFF3DF; padding: 12px 18px; border-radius: 999px; text-decoration: none;">Open recipe inbox</a></p>
      </div>
    `,
  };
}

export function publishedRecipeEmail({ name, title, recipeUrl }: { name: string; title: string; recipeUrl: string }) {
  return {
    subject: `Your recipe is now in the OPR Living Cookbook`,
    html: `
      <div style="font-family: 'Gill Sans MT', 'Gill Sans', Avenir, Corbel, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <p style="color: #9A622A; letter-spacing: 2px; font-size: 12px; text-transform: uppercase;">Other People's Recipes</p>
        <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 34px; line-height: 1.2;">Your recipe is now part of the book.</h1>
        <p>Dear ${escapeHtml(name)},</p>
        <p>We&apos;re delighted to let you know that <strong>${escapeHtml(title)}</strong> is now live in the Other People&apos;s Recipes Living Cookbook.</p>
        <p><a href="${recipeUrl}" style="display: inline-block; background: #123C39; color: #FFF3DF; padding: 12px 18px; border-radius: 999px; text-decoration: none;">See your recipe</a></p>
        <p>Thank you for helping us preserve the food and stories that matter.</p>
        <p style="margin-top: 32px;">Warmly,<br /><strong>The OPR team</strong></p>
      </div>
    `,
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
    html: `
      <div style="font-family: 'Gill Sans MT', 'Gill Sans', Avenir, Corbel, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <img src="${siteUrl}/images/social/opr-pinterest-profile.png" alt="Other People's Recipes" width="56" height="56" style="display: block; margin: 0 auto 20px; border-radius: 999px;" />
        <p style="color: #9A622A; letter-spacing: 2px; font-size: 12px; text-transform: uppercase; text-align: center;">Other People's Recipes</p>
        <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 34px; line-height: 1.2; text-align: center;">You&apos;ve got a seat at our table.</h1>
        <p>Hi ${escapeHtml(name)},</p>
        <p>Other People&apos;s Recipes started as a note I wrote myself back in 2000 — one day, build the place where family recipes can live on. You just became one of the first people helping make that real.</p>
        ${marketingOptIn ? "<p>You&apos;ll be the first to hear when a new family recipe goes up, when tasting events open, when Recipe of the Month voting starts, and whatever we build next.</p>" : "<p>Your place is saved. You didn&apos;t opt in to OPR news, so that&apos;s the last you&apos;ll hear from us unless you get in touch.</p>"}
        <p>While you wait, the Living Cookbook is already open.</p>
        <p><a href="${siteUrl}/family-cookbook" style="display: inline-block; background: #1C5A50; color: #FFF3DF; padding: 12px 18px; border-radius: 999px; text-decoration: none;">Explore the Living Cookbook</a></p>
        <p style="margin-top: 32px;">Warmly,<br /><strong>Chaten</strong><br />Founder, Other People&apos;s Recipes</p>
        ${marketingFooter(unsubscribeUrl)}
        <p style="font-size: 13px; color: #6B6254;">Every Recipe has a Story.</p>
      </div>
    `,
  };
}

export function newFoundingTableEmail({ name, email }: { name: string; email: string }) {
  return {
    subject: `New table signup: ${name}`,
    html: `
      <div style="font-family: 'Gill Sans MT', 'Gill Sans', Avenir, Corbel, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <p style="color: #9A622A; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Private OPR alert</p>
        <h1 style="font-family: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif; font-size: 30px;">A new person has joined our table.</h1>
        <p><strong>${escapeHtml(name)}</strong> has joined the waitlist.</p>
        <p>Contact: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      </div>
    `,
  };
}
