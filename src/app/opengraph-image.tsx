import { ImageResponse } from "next/og"

export const alt = "Bedir Kahveci Styling — Modern Erkek Giyim"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "24px solid #050505",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 180,
            height: 180,
            borderRadius: 90,
            background: "#050505",
            color: "#ffffff",
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -4,
            marginBottom: 48,
          }}
        >
          BK
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            color: "#050505",
            letterSpacing: -2,
          }}
        >
          Bedir Kahveci Styling
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 30,
            color: "#777777",
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Modern Erkek Giyim
        </div>
      </div>
    ),
    { ...size }
  )
}
