import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LuckyBGM - Focus Music & Pomodoro Timer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #050510 0%, #0a1628 50%, #150a28 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <span style={{ fontSize: "64px" }}>🎵</span>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "white",
            margin: 0,
            letterSpacing: "-1px",
          }}
        >
          LuckyBGM
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.5)",
            margin: "16px 0 0 0",
          }}
        >
          Focus Music & Pomodoro Timer — Enter Flow State
        </p>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "48px",
          }}
        >
          {["📚 Deep Focus", "🎹 AI Music", "⏱ Pomodoro"].map((item) => (
            <div
              key={item}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "22px",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
