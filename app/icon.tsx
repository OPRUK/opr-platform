import { ImageResponse } from "next/og";

// Google's own favicon guidance explicitly prefers a raster format (PNG or
// ICO) — SVG-only favicons have "limited support" in search results, which
// is why Google was showing a generic placeholder instead of this mark.
// Generated (matching the mobile app-icon pattern) rather than a static
// binary, so it always renders exactly as the original icon.svg did.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#123C39",
          fontFamily: '"Gill Sans MT", "Gill Sans", Avenir, Corbel, Arial, sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 440,
            height: 440,
            borderRadius: "50%",
            border: "12px solid #DDB765",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 386,
              height: 386,
              borderRadius: "50%",
              border: "5px solid #1C5A50",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", fontFamily: 'Didot, "Bodoni MT", Georgia, "Times New Roman", serif', fontSize: 133, fontWeight: 700, color: "#FFF3DF" }}>
              OPR
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontFamily: '"Gill Sans MT", "Gill Sans", Avenir, Corbel, Arial, sans-serif',
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#DDB765",
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
