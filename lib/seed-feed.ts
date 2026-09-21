import type { IcePost } from "./types";

/** Labeled Demo seeds only — never real Network posts or Walter's on-chain history. */
export const SEED_FEED: IcePost[] = [
  {
    id: "demo-1",
    author: "demo_ice",
    authorName: "Demo",
    category: "Demo",
    source: "lite",
    timestamp: Date.parse("2026-09-20") * 1e6,
    likes: 0,
    loves: 0,
    content: "[Demo] Testing ICE Lite. Free. No wallet. First post.",
  },
  {
    id: "demo-2",
    author: "seed_notes",
    authorName: "Demo",
    category: "Demo",
    source: "lite",
    timestamp: Date.parse("2026-09-19") * 1e6,
    likes: 0,
    loves: 0,
    content: "[Demo] Empty feed on purpose — be early.",
  },
  {
    id: "demo-3",
    author: "demo_ice",
    authorName: "Demo",
    category: "Demo",
    source: "lite",
    timestamp: Date.parse("2026-09-18") * 1e6,
    likes: 0,
    loves: 0,
    content: "[Demo] Sign up, make one post, tell us if it felt dead or alive.",
  },
];
