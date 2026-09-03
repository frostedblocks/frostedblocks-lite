import type { IcePost } from "./types";

export const SEED_FEED: IcePost[] = [
  {
    id: "seed-1",
    author: "on-chain",
    authorName: "Walter L. Wood",
    category: "Crypto",
    source: "network",
    timestamp: Date.parse("2026-08-29") * 1e6,
    likes: 0,
    loves: 0,
    content:
      "ICP 8/29: Network withstood AI-enabled attack — hundreds of canisters with malformed Wasm.",
  },
  {
    id: "seed-2",
    author: "on-chain",
    authorName: "Walter L. Wood",
    category: "General",
    source: "network",
    timestamp: Date.parse("2026-08-24") * 1e6,
    likes: 0,
    loves: 0,
    content: "Supreme Court greenlights Trump's mail-in voting restrictions.",
  },
  {
    id: "seed-3",
    author: "on-chain",
    authorName: "Walter L. Wood",
    category: "Ideas",
    source: "network",
    timestamp: Date.parse("2026-08-22") * 1e6,
    likes: 0,
    loves: 0,
    content:
      "The greatest privilege of my life is being able to work with incredible people to create amazing products.",
  },
];
