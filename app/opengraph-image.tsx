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
          color: "#FFF3DF",
          fontFamily: '"Gill Sans MT", "Gill Sans", Avenir, Corbel, Arial, sans-serif',
          background:
            "radial-gradient(circle at 88% 12%, #DDB765 0, #DDB765 10%, transparent 33%), linear-gradient(135deg, #08231F 0%, #123C39 52%, #08231F 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 650 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 7,
              color: "#DDB765",
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
              fontFamily: 'Didot, "Bodoni MT", Georgia, "Times New Roman", serif',
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
              color: "#FFF3DF",
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
            background: "#123C39",
            border: "8px solid #DDB765",
            boxShadow: "inset 0 0 0 12px #08231F",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF3DF",
            }}
          >
            <div style={{ display: "flex", fontSize: 88, fontWeight: 800, fontFamily: 'Didot, "Bodoni MT", Georgia, "Times New Roman", serif' }}>
              OPR
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2.1,
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
