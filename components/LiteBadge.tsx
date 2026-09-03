export function LiteBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={size === "lg" ? "lite-badge lite-badge-lg" : "lite-badge"} title="Signed up on ICE Lite">
      ICE Lite
    </span>
  );
}

export function isLiteAccount(author: string, postId?: string) {
  if (postId?.startsWith("lite-")) return true;
  return author.includes("@");
}
