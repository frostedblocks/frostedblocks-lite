import type { IcePost } from "./types";

/** Cold-start labels only — not real Network posts. */
export const SEED_FEED: IcePost[] = [
  {
    id: "seed-1",
    author: "lite-seed",
    authorName: "Demo",
    category: "Demo",
    source: "lite",
    timestamp: Date.parse("2026-09-20") * 1e6,
    likes: 0,
    loves: 0,
    content: "[Demo] ICE Lite is live. Free. No wallet. Post something real.",
  },
  {
    id: "seed-2",
    author: "lite-seed",
    authorName: "Demo",
    category: "Demo",
    source: "lite",
    timestamp: Date.parse("2026-09-19") * 1e6,
    likes: 0,
    loves: 0,
    content: "[Demo] You’re early. First posts shape the feed.",
  },
  {
    id: "seed-3",
    author: "lite-seed",
    authorName: "Demo",
    category: "Demo",
    source: "lite",
    timestamp: Date.parse("2026-09-18") * 1e6,
    likes: 0,
    loves: 0,
    content: "[Demo] Creators who want wallets graduate to ICE Network — not here.",
  },
];
