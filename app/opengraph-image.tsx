import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Free ICE Lite — post free.";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#07070b",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 6,
            color: "#7dd3fc",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          ICE Lite
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 750, lineHeight: 0.95 }}>
          Post free
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 600,
            lineHeight: 1.2,
            color: "#94a3b8",
            marginTop: 20,
          }}
        >
          Free ICE Lite — post free.
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 28, color: "#64748b" }}>
          lite.frostedblocks.com
        </div>
      </div>
    ),
    size,
  );
}
