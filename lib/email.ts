const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://otherpeoplesrecipes.co.uk";
const from = process.env.EMAIL_FROM || "Other People's Recipes <onboarding@resend.dev>";

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
      <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <p style="color: #9A622A; letter-spacing: 2px; font-size: 12px; text-transform: uppercase;">Other People's Recipes</p>
        <h1 style="font-size: 34px; line-height: 1.2;">Thank you for sharing your recipe.</h1>
        <p>Dear ${escapeHtml(name)},</p>
        <p>We&apos;ve received <strong>${escapeHtml(title)}</strong> and the story behind it. Thank you for trusting Other People&apos;s Recipes with a page from your family kitchen.</p>
        <p>Our team will read every recipe carefully. If it is selected for the Family Cookbook, the restaurant or a future film, we&apos;ll be in touch.</p>
        <p style="margin-top: 32px;">Warmly,<br /><strong>The OPR team</strong></p>
        <p style="border-top: 1px solid #D1AD75; padding-top: 18px; margin-top: 36px; font-size: 13px; color: #6B6254;">Every recipe has a story.</p>
      </div>
    `,
  };
}

export function newSubmissionEmail({ name, email, title, location }: { name: string; email: string; title: string; location?: string | null }) {
  return {
    subject: `New OPR recipe: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <p style="color: #9A622A; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Private OPR alert</p>
        <h1 style="font-family: Georgia, serif; font-size: 30px;">A new recipe has arrived.</h1>
        <p><strong>${escapeHtml(title)}</strong></p>
        <p>Shared by ${escapeHtml(name)}${location ? ` from ${escapeHtml(location)}` : ""}.</p>
        <p>Contact: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><a href="${siteUrl}/admin" style="display: inline-block; background: #4A4232; color: white; padding: 12px 18px; border-radius: 999px; text-decoration: none;">Open recipe inbox</a></p>
      </div>
    `,
  };
}

export function publishedRecipeEmail({ name, title, recipeUrl }: { name: string; title: string; recipeUrl: string }) {
  return {
    subject: `Your recipe is now in the OPR Family Cookbook`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; color: #4A4232; line-height: 1.65;">
        <p style="color: #9A622A; letter-spacing: 2px; font-size: 12px; text-transform: uppercase;">Other People's Recipes</p>
        <h1 style="font-size: 34px; line-height: 1.2;">Your recipe is now part of the book.</h1>
        <p>Dear ${escapeHtml(name)},</p>
        <p>We&apos;re delighted to let you know that <strong>${escapeHtml(title)}</strong> is now live in the Other People&apos;s Recipes Family Cookbook.</p>
        <p><a href="${recipeUrl}" style="display: inline-block; background: #4A4232; color: white; padding: 12px 18px; border-radius: 999px; text-decoration: none;">See your recipe</a></p>
        <p>Thank you for helping us preserve the food and stories that matter.</p>
        <p style="margin-top: 32px;">Warmly,<br /><strong>The OPR team</strong></p>
      </div>
    `,
  };
}
