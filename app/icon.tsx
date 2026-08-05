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
          background: "#123c39",
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
            border: "12px solid #e2ad42",
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
              border: "5px solid #4f665f",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", fontFamily: "Georgia, serif", fontSize: 133, fontWeight: 700, color: "#fff3dc" }}>
              OPR
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontFamily: "Arial, sans-serif",
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: 3,
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
