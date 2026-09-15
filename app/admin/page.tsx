import { getLiteAdmin } from "@/lib/lite-admin";

export const dynamic = "force-dynamic";

/**
 * Read-only Lite admin status (server-rendered from ICE canister).
 * Does not accept Lite email/phone session as authority.
 * Writes happen only via Internet Identity on ICE Network /admin/lite.
 */
export default async function LiteAdminStatusPage() {
  let admin = null as Awaited<ReturnType<typeof getLiteAdmin>> | null;
  let err = "";
  try {
    admin = await getLiteAdmin();
  } catch (e) {
    err = "Could not load admin lock from ICE.";
  }

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "3rem auto",
        padding: "1.5rem",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        background: "#07070b",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>ICE Lite status</h1>
      <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.5 }}>
        This page shows the on-chain Lite lock. It cannot be changed from a Lite email or phone
        login. Owner changes are made with Internet Identity on the ICE Network admin path.
      </p>
      {err ? (
        <p style={{ color: "#f87171" }}>{err}</p>
      ) : admin ? (
        <ul style={{ lineHeight: 1.7, color: "#cbd5e1", fontSize: "0.95rem" }}>
          <li>Signups: {admin.signupsOpen ? "open" : "closed"}</li>
          <li>Network feed bridge: {admin.feedBridgeOpen ? "open" : "closed"}</li>
          <li>Banned handles: {admin.bannedLiteHandles.length}</li>
          <li>Hidden posts: {admin.hiddenLitePostIds.length}</li>
          <li>Updated at (ns): {admin.updatedAt || "—"}</li>
        </ul>
      ) : null}
    </main>
  );
}
