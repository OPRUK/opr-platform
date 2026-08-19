import { createClient } from "@supabase/supabase-js";
import { publishedRecipeEmail, sendEmail } from "../../../lib/email";
import { isAdminEmail } from "../../../lib/admin-emails";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://otherpeoplesrecipes.co.uk";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data } = await supabase.auth.getUser(token);

  if (!isAdminEmail(data.user?.email)) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  try {
    const { id, name, email, title } = await request.json();
    if (!id || !name || !email || !title) {
      return Response.json({ error: "Missing recipe details" }, { status: 400 });
    }

    const emailContent = publishedRecipeEmail({
      name,
      title,
      recipeUrl: `${siteUrl}/family-cookbook/community/${id}`,
    });
    await sendEmail({ to: email, ...emailContent });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Email could not be prepared" }, { status: 400 });
  }
}
