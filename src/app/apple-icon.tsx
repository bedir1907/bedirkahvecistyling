import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          border: "6px solid #e7e7e7",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 68,
              fontWeight: 800,
              color: "#050505",
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            BK
          </span>
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: "#888",
              letterSpacing: 1.5,
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            Styling
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
