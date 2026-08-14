import { ImageResponse } from "next/og";
import { getFeaturedRecipe } from "../../../lib/recipes";

// Every recipe gets a consistent 1200×630 card, generated the same way
// regardless of the source photo's own format/dimensions (a mix of WebP and
// PNG at various aspect ratios) — a branded template is more consistent
// across recipes than compositing varying photos would be, and avoids
// needing an image-decoding dependency this app doesn't already have.
export const alt = "A recipe from Other People's Recipes.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function RecipeOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getFeaturedRecipe(slug);
  const eyebrow = recipe ? [recipe.category, recipe.place].filter(Boolean).join(" · ") : "A LIVING COOKBOOK";
  const title = recipe?.title ?? "Other People's Recipes";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "74px 92px",
          color: "#fff8ea",
          background:
            "radial-gradient(circle at 88% 12%, #d9a949 0, #d9a949 10%, transparent 33%), linear-gradient(135deg, #0d3f3a 0%, #123c39 52%, #092d29 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#f2c563",
              marginBottom: 30,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 30 ? 58 : 70,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.08,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 26,
              lineHeight: 1.35,
              color: "#f6e9cf",
            }}
          >
            A family recipe from Other People&apos;s Recipes.
          </div>
        </div>

        <div
          style={{
            width: 260,
            height: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#123c39",
            border: "8px solid #e2ad42",
            boxShadow: "inset 0 0 0 12px #0a2e2b",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff3dc",
            }}
          >
            <div style={{ display: "flex", fontSize: 76, fontWeight: 800, fontFamily: "serif" }}>
              OPR
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#e2ad42",
              }}
            >
              OTHER PEOPLE&apos;S RECIPES
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
