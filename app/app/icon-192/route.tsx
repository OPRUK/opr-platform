import { ImageResponse } from "next/og";

// Standalone route (not the `icon` file convention) so it has a stable,
// hashless URL that public/app-manifest.webmanifest can reference directly.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#123C39",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: 'Didot, "Bodoni MT", Georgia, "Times New Roman", serif',
            fontSize: 80,
            fontWeight: 700,
            color: "#EED8B2",
          }}
        >
          OPR
        </div>
      </div>
    ),
    { width: 192, height: 192 },
  );
}
