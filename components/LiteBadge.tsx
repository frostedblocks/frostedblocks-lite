export function LiteBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={size === "lg" ? "door-badge door-badge-lite door-badge-lg" : "door-badge door-badge-lite"} title="ICE Lite account">
      ICE Lite
    </span>
  );
}

export function NetworkBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={size === "lg" ? "door-badge door-badge-net door-badge-lg" : "door-badge door-badge-net"} title="ICE Network account">
      ICE Network
    </span>
  );
}

export function isLiteAccount(author: string, postId?: string) {
  if (postId?.startsWith("lite-")) return true;
  return author.includes("@");
}

export function DoorBadge({
  author,
  postId,
  size = "sm",
}: {
  author: string;
  postId?: string;
  size?: "sm" | "lg";
}) {
  return isLiteAccount(author, postId) ? <LiteBadge size={size} /> : <NetworkBadge size={size} />;
}
