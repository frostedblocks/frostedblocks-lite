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

function isLiteAuthor(author: string, postId?: string, source?: IceDoor) {
  if (source === "lite") return true;
  if (postId?.startsWith("lite-")) return true;
  if (author.includes("@")) return true;
  return false;
}

export function doorForPost(author: string, postId?: string, source?: IceDoor): IceDoor {
  if (isLiteAuthor(author, postId, source)) return "lite";
  if (source === "network") return "network";
  return "network";
}

export function DoorBadge({
  source,
  author,
  postId,
  size = "sm",
}: {
  source?: IceDoor | string;
  author?: string;
  postId?: string;
  size?: "sm" | "lg";
}) {
  const door = doorForPost(author || "", postId, source === "lite" || source === "network" ? source : undefined);
  if (door === "lite") return <LiteBadge size={size} />;
  return <NetworkBadge size={size} />;
}
