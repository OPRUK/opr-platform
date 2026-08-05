import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Full-bleed square, no rounded corners or transparency — iOS applies its
// own corner mask, and a pre-rounded/circular icon leaves ugly gaps.
export default function AppleIcon() {
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
            fontFamily: "Georgia, serif",
            fontSize: 76,
            fontWeight: 700,
            color: "#EED8B2",
          }}
        >
          OPR
        </div>
      </div>
    ),
    size,
  );
}
