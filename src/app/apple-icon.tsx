import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "#05070A",
          fontFamily: "monospace",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4"
            stroke="#B3C1CF"
            strokeWidth={1.6}
          />
          <rect
            x="9.25"
            y="7.25"
            width="5.5"
            height="9.5"
            rx="0.5"
            stroke="#3D8BFF"
            strokeWidth={1}
            opacity={0.5}
          />
          <path d="M10.4 11.2 12 9.6l1.6 1.6" stroke="#44D17A" strokeWidth={1.6} />
          <path d="M10.4 12.8 12 14.4l1.6-1.6" stroke="#FF4D67" strokeWidth={1.6} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
