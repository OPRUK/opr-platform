export const runtime = "nodejs";

const maximumImageSize = 10 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type RecipeDraft = {
  title: string | null;
  category: string | null;
  servings: string | null;
  ingredients: string | null;
  method: string | null;
  cookNotes: string | null;
};

function safeDraft(value: unknown): RecipeDraft {
  const candidate = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const text = (field: string) => typeof candidate[field] === "string" && candidate[field].trim() ? candidate[field].trim() : null;
  return {
    title: text("title"),
    category: text("category"),
    servings: text("servings"),
    ingredients: text("ingredients"),
    method: text("method"),
    cookNotes: text("cookNotes"),
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "The recipe-reading helper is not switched on yet." }, { status: 503 });
    }

    const formData = await request.formData();
    const image = formData.get("recipeImage");
    if (!(image instanceof File) || image.size === 0) {
      return Response.json({ error: "Please choose a clear photo of the recipe first." }, { status: 400 });
    }
    if (image.size > maximumImageSize || !acceptedImageTypes.has(image.type)) {
      return Response.json({ error: "Please use a JPG, PNG or WebP image smaller than 10 MB." }, { status: 400 });
    }

    const imageData = Buffer.from(await image.arrayBuffer()).toString("base64");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "handwritten_recipe_draft",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: ["string", "null"] },
                category: { type: ["string", "null"] },
                servings: { type: ["string", "null"] },
                ingredients: { type: ["string", "null"] },
                method: { type: ["string", "null"] },
                cookNotes: { type: ["string", "null"] },
              },
              required: ["title", "category", "servings", "ingredients", "method", "cookNotes"],
            },
          },
        },
        messages: [
          {
            role: "system",
            content: "You carefully transcribe handwritten family recipes. Extract only wording that is visible in the image. Do not invent ingredients, quantities, temperatures, times, a story, or missing steps. Keep ingredients one per line and method steps on separate lines. Set a field to null if it is not written or cannot be read. Use one of these exact categories only when clear: Breakfast or brunch, Starter or side, Main course, Dessert or baking, Drink, Something else.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Create an editable recipe draft from this image." },
              { type: "image_url", image_url: { url: `data:${image.type};base64,${imageData}`, detail: "high" } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OPR recipe scan failed", await response.text());
      return Response.json({ error: "We could not read that recipe just now. Please try a clearer photo." }, { status: 502 });
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Recipe scan returned no text");

    return Response.json({ draft: safeDraft(JSON.parse(content)) });
  } catch (error) {
    console.error("OPR recipe scan failed", error);
    return Response.json({ error: "We could not read that recipe just now. Please try a clearer photo." }, { status: 400 });
  }
}
