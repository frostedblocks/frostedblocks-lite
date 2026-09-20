import { ensureSchema, sql } from "@/lib/db";

export type FunnelEvent =
  | "signup_completed"
  | "first_post_created"
  | "day1_return";

/** Idempotent: one row per (user_id, event). Failures never break the request. */
export async function trackFunnelEvent(userId: number, event: FunnelEvent) {
  try {
    if (!userId || !Number.isFinite(userId)) return;
    await ensureSchema();
    const q = sql();
    await q`INSERT INTO lite_funnel_events (user_id, event)
      VALUES (${userId}, ${event})
      ON CONFLICT (user_id, event) DO NOTHING`;
  } catch (err) {
    console.error("funnel event failed", event, err instanceof Error ? err.message : err);
  }
}

/** Emit day1_return once the user is ≥24h past signup and hits an authed surface. */
export async function maybeTrackDay1Return(userId: number) {
  try {
    if (!userId || !Number.isFinite(userId)) return;
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT created_at FROM lite_users WHERE id = ${userId} LIMIT 1`;
    if (!rows[0]?.created_at) return;
    const createdMs = new Date(String(rows[0].created_at)).getTime();
    if (!Number.isFinite(createdMs)) return;
    if (Date.now() - createdMs < 24 * 60 * 60 * 1000) return;
    await trackFunnelEvent(userId, "day1_return");
  } catch (err) {
    console.error("day1_return check failed", err instanceof Error ? err.message : err);
  }
}
