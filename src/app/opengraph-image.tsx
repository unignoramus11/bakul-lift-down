import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BAKUL LIFT DOWN — surveillance log for the Bakul Hostel lift";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05070A",
          backgroundImage:
            "linear-gradient(rgba(61,139,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(61,139,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          padding: 72,
          fontFamily: "monospace",
        }}
      >
        {/* top strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: "#FF4D67",
              }}
            />
            <div style={{ color: "#6D7C8D", fontSize: 24, letterSpacing: 4 }}>
              LIFT-01 · BAKUL HOSTEL · IIIT HYDERABAD
            </div>
          </div>
          <div style={{ color: "#6D7C8D", fontSize: 24, letterSpacing: 4 }}>REC ●</div>
        </div>

        {/* headline + stamp */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#F5F7FA",
                fontSize: 92,
                fontWeight: 700,
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              BAKUL LIFT DOWN
            </div>
            <div style={{ color: "#B3C1CF", fontSize: 30, marginTop: 24, letterSpacing: 2 }}>
              Crowd-sourced downtime surveillance for one very tired lift.
            </div>
          </div>
        </div>

        {/* bottom: stamp badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              display: "flex",
              color: "#FF4D67",
              border: "5px solid #FF4D67",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: 8,
              transform: "rotate(-6deg)",
              opacity: 0.9,
            }}
          >
            DOWN
          </div>
          <div style={{ color: "#475564", fontSize: 24, letterSpacing: 3 }}>
            bakul-lift-down.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
