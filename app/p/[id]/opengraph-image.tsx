import { ImageResponse } from "next/og";
import { getPost } from "@/lib/get-post";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  const name = post?.authorName || "ICE Lite";
  const body = (post?.content || "Lite Frost before the ICE — a door to the ICE Network.").replace(/\s+/g, " ").slice(0, 180);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#07070b",
          color: "#e2e8f0",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#7dd3fc", textTransform: "uppercase" }}>
          ICE Lite
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 28, color: "#94a3b8" }}>{name}</div>
          <div style={{ fontSize: 44, lineHeight: 1.15, fontWeight: 700, color: "#f8fafc" }}>{body}</div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#64748b" }}>lite.frostedblocks.com</div>
      </div>
    ),
    size,
  );
}
