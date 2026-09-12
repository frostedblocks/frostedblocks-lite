import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ICE Lite — Simple social, owned by you";

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
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#7dd3fc", textTransform: "uppercase", marginBottom: 24 }}>
          ICE Lite
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 750, lineHeight: 0.95 }}>
          Simple social,
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 750, lineHeight: 0.95, color: "#7dd3fc" }}>
          owned by you
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 28, color: "#94a3b8" }}>
          lite.frostedblocks.com
        </div>
      </div>
    ),
    size,
  );
}
