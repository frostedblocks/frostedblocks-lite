import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { CANISTERS, HOST } from "./canisters";
import type { IcePost } from "./types";

const idlFactory = ({ IDL: e }: { IDL: typeof IDL }) => {
  const post = e.Record({
    id: e.Nat,
    content: e.Text,
    reportCount: e.Nat,
    author: e.Principal,
    likes: e.Nat,
    loves: e.Nat,
    imageURL: e.Opt(e.Text),
    isHidden: e.Bool,
    timestamp: e.Int,
  });
  const profile = e.Record({
    bio: e.Text,
    username: e.Text,
    avatarURL: e.Text,
  });
  return e.Service({
    getRecentPosts: e.Func([e.Nat], [e.Vec(post)], ["query"]),
    getProfile: e.Func([e.Principal], [e.Opt(profile)], ["query"]),
    getCategoriesForPosts: e.Func([e.Vec(e.Nat)], [e.Vec(e.Tuple(e.Nat, e.Text))], ["query"]),
  });
};

function shortName(author: string) {
  return author.length > 12 ? `${author.slice(0, 5)}…${author.slice(-5)}` : author;
}

export async function fetchRecentPosts(limit = 50): Promise<IcePost[]> {
  const agent = new HttpAgent({ host: HOST });
  const actor = Actor.createActor(idlFactory as any, {
    agent,
    canisterId: CANISTERS.ice,
  }) as {
    getRecentPosts: (n: bigint) => Promise<any[]>;
    getProfile: (p: any) => Promise<any[]>;
    getCategoriesForPosts: (ids: bigint[]) => Promise<[bigint, string][]>;
  };

  const raw = await actor.getRecentPosts(BigInt(limit));
  const visible = (raw || []).filter((p) => !p.isHidden);

  const names = new Map<string, string>();
  const authors = [...new Set(visible.map((p) => p.author.toText()))];
  await Promise.all(
    authors.slice(0, 30).map(async (id) => {
      try {
        const found = await actor.getProfile(visible.find((p) => p.author.toText() === id).author);
        const profile = Array.isArray(found) ? found[0] : found;
        if (profile?.username) names.set(id, profile.username);
      } catch {
        /* keep short principal */
      }
    }),
  );

  let categories = new Map<string, string>();
  try {
    const pairs = await actor.getCategoriesForPosts(visible.map((p) => p.id));
    for (const [id, cat] of pairs || []) categories.set(String(id), cat);
  } catch {
    categories = new Map();
  }

  return visible.map((p) => {
    const author = p.author.toText();
    const image = Array.isArray(p.imageURL) ? p.imageURL[0] : p.imageURL;
    return {
      id: `network-${p.id}`,
      content: p.content,
      author,
      authorName: names.get(author) || shortName(author),
      likes: Number(p.likes || 0),
      loves: Number(p.loves || 0),
      imageURL: image || null,
      timestamp: Number(p.timestamp),
      category: categories.get(String(p.id)) || "Network",
      source: "network" as const,
    };
  });
}
