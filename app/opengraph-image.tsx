import { ImageResponse } from "next/og";

export const alt = "Other People's Recipes — Every Recipe has a Story.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 650 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 7,
              color: "#f2c563",
              marginBottom: 30,
            }}
          >
            A LIVING COOKBOOK
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.04,
            }}
          >
            Other People&apos;s Recipes
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 31,
              lineHeight: 1.35,
              color: "#f6e9cf",
            }}
          >
            Every Recipe has a Story.
          </div>
        </div>

        <div
          style={{
            width: 300,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#123c39",
            border: "8px solid #e2ad42",
            boxShadow: "inset 0 0 0 12px #0a2e2b",
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
            <div style={{ display: "flex", fontSize: 88, fontWeight: 800, fontFamily: "serif" }}>
              OPR
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2.1,
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
