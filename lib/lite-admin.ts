/**
 * Server-only ICE Lite admin lock.
 * Source of truth: ICE canister getLiteAdmin() on 6jf55-…
 * Never call write methods from Lite — owner toggles via II on ICE Network.
 */
import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { CANISTERS, HOST } from "./canisters";
import { handleOf } from "./public";

export type LiteAdmin = {
  signupsOpen: boolean;
  feedBridgeOpen: boolean;
  bannedLiteHandles: string[];
  hiddenLitePostIds: string[];
  updatedAt: number;
};

const DEFAULT: LiteAdmin = {
  signupsOpen: true,
  // Default closed — Lite must not surface Network posts unless owner opens the bridge.
  feedBridgeOpen: false,
  bannedLiteHandles: [],
  hiddenLitePostIds: [],
  updatedAt: 0,
};

const TTL_MS = 15_000;
let cache: { at: number; admin: LiteAdmin } | null = null;
let pending: Promise<LiteAdmin> | null = null;

const idlFactory = ({ IDL: e }: { IDL: typeof IDL }) => {
  const liteAdmin = e.Record({
    signupsOpen: e.Bool,
    feedBridgeOpen: e.Bool,
    bannedLiteHandles: e.Vec(e.Text),
    hiddenLitePostIds: e.Vec(e.Text),
    updatedAt: e.Int,
  });
  return e.Service({
    getLiteAdmin: e.Func([], [liteAdmin], ["query"]),
  });
};

function normalizeHandle(h: string) {
  return String(h || "")
    .trim()
    .toLowerCase();
}

async function loadLiteAdmin(): Promise<LiteAdmin> {
  const agent = new HttpAgent({ host: HOST });
  const actor = Actor.createActor(idlFactory as any, {
    agent,
    canisterId: CANISTERS.ice,
  }) as { getLiteAdmin: () => Promise<any> };

  const raw = await actor.getLiteAdmin();
  return {
    signupsOpen: raw?.signupsOpen !== false,
    // Prefer closed when field missing/ambiguous
    feedBridgeOpen: raw?.feedBridgeOpen === true,
    bannedLiteHandles: (raw?.bannedLiteHandles || []).map((h: string) =>
      normalizeHandle(h),
    ),
    hiddenLitePostIds: (raw?.hiddenLitePostIds || []).map((id: string) =>
      String(id),
    ),
    updatedAt: Number(raw?.updatedAt || 0),
  };
}

/** Cached public query — safe for API routes. Fail-open to DEFAULT if canister unreachable. */
export async function getLiteAdmin(): Promise<LiteAdmin> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.admin;
  if (!pending) {
    pending = loadLiteAdmin()
      .then((admin) => {
        cache = { at: Date.now(), admin };
        return admin;
      })
      .catch((err) => {
        console.error(
          "getLiteAdmin failed",
          err instanceof Error ? err.message : err,
        );
        if (cache) return cache.admin;
        return DEFAULT;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export function isHandleBanned(admin: LiteAdmin, handleOrId: string | number) {
  const h = normalizeHandle(
    typeof handleOrId === "number" || /^\d+$/.test(String(handleOrId))
      ? handleOf(handleOrId)
      : String(handleOrId),
  );
  return admin.bannedLiteHandles.includes(h);
}

export function isPostHidden(admin: LiteAdmin, postId: string | number) {
  const id = String(postId);
  return (
    admin.hiddenLitePostIds.includes(id) ||
    admin.hiddenLitePostIds.includes(`lite-${id}`)
  );
}

export async function denyIfBanned(userId: number | null | undefined) {
  if (userId == null) return null;
  const admin = await getLiteAdmin();
  if (isHandleBanned(admin, userId)) {
    const { publicError } = await import("./http");
    return publicError(403, "This account cannot do that right now.");
  }
  return null;
}
