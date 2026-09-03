import type { IceDoor } from "@/lib/types";

export function LiteBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={size === "lg" ? "door-badge door-lite door-badge-lg" : "door-badge door-lite"} title="Signed up on ICE Lite">
      ICE Lite
    </span>
  );
}

export function NetworkBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={size === "lg" ? "door-badge door-network door-badge-lg" : "door-badge door-network"} title="On ICE Network">
      ICE Network
    </span>
  );
}

export function DoorBadge({
  source,
  size = "sm",
}: {
  source?: IceDoor | string;
  size?: "sm" | "lg";
}) {
  if (source === "network") return <NetworkBadge size={size} />;
  return <LiteBadge size={size} />;
}

export function doorForPost(author: string, postId?: string, source?: IceDoor) {
  if (source) return source;
  if (postId?.startsWith("lite-") || author.includes("@")) return "lite" as const;
  return "network" as const;
}
