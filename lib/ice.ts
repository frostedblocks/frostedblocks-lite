import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { CANISTERS, HOST } from "./canisters";
import type { IcePost, IceProfile } from "./types";

const Time = IDL.Int;

const Post = IDL.Record({
  id: IDL.Nat,
  content: IDL.Text,
  reportCount: IDL.Nat,
  author: IDL.Principal,
  likes: IDL.Nat,
  loves: IDL.Nat,
  imageURL: IDL.Opt(IDL.Text),
  isHidden: IDL.Bool,
  timestamp: Time,
});

const Profile = IDL.Record({
  bio: IDL.Text,
  username: IDL.Text,
  avatarURL: IDL.Text,
});

const idlFactory = ({ IDL: I }: { IDL: typeof IDL }) =>
  I.Service({
    getRecentPosts: I.Func([I.Nat], [I.Vec(Post)], ["query"]),
    getHomeFeed: I.Func([I.Nat], [I.Vec(Post)], ["query"]),
    getProfile: I.Func([I.Principal], [I.Opt(Profile)], ["query"]),
    getPostCategory: I.Func([I.Nat], [I.Text], ["query"]),
  });

type IceActor = {
  getRecentPosts: (n: bigint) => Promise<any[]>;
  getProfile: (p: Principal) => Promise<[] | [IceProfile]>;
  getPostCategory: (id: bigint) => Promise<string>;
};

function actor(): IceActor {
  const agent = new HttpAgent({ host: HOST });
  return Actor.createActor(idlFactory as any, {
    agent,
    canisterId: CANISTERS.ice,
  }) as unknown as IceActor;
}

function natToString(n: unknown): string {
  if (n == null) return "0";
  return typeof n === "bigint" ? n.toString() : String(n);
}

export async function fetchRecentPosts(limit = 20): Promise<IcePost[]> {
  const ice = actor();
  const raw = await ice.getRecentPosts(BigInt(limit));
  const posts: IcePost[] = [];

  for (const p of raw) {
    if (p.isHidden) continue;
    const author = Principal.from(p.author).toText();
    let authorName = author.slice(0, 5);
    try {
      const prof = await ice.getProfile(Principal.from(p.author));
      if (prof && prof.length && prof[0].username) authorName = prof[0].username;
    } catch {
      /* keep short principal */
    }
    let category: string | undefined;
    try {
      category = await ice.getPostCategory(p.id);
    } catch {
      category = undefined;
    }
    const image = Array.isArray(p.imageURL) ? p.imageURL[0] ?? null : null;
    posts.push({
      id: natToString(p.id),
      content: String(p.content ?? ""),
      author,
      authorName,
      likes: Number(natToString(p.likes)),
      loves: Number(natToString(p.loves)),
      imageURL: image,
      timestamp: Number(natToString(p.timestamp)),
      category,
    });
  }
  return posts;
}
