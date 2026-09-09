import { sql } from "./db";

export async function rateLimit(key: string, limit: number, windowSec: number) {
  const q = sql();
  const rows = await q`SELECT hits, window_start FROM lite_rate WHERE key = ${key}`;
  const now = Date.now();
  if (!rows.length) {
    await q`INSERT INTO lite_rate (key, hits, window_start) VALUES (${key}, 1, NOW())
      ON CONFLICT (key) DO UPDATE SET hits = 1, window_start = NOW()`;
    return { ok: true, retryAfter: 0 };
  }
  const start = new Date(rows[0].window_start).getTime();
  if (now - start > windowSec * 1000) {
    await q`UPDATE lite_rate SET hits = 1, window_start = NOW() WHERE key = ${key}`;
    return { ok: true, retryAfter: 0 };
  }
  const hits = Number(rows[0].hits || 0) + 1;
  await q`UPDATE lite_rate SET hits = ${hits} WHERE key = ${key}`;
  if (hits > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((windowSec * 1000 - (now - start)) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}
