import type { IcePost } from "@/lib/types";
function when(ts: number) {
  const ms = ts > 1e14 ? ts / 1e6 : ts;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}
export function PostCard({ post }: { post: IcePost }) {
  return (
    <article className="glass post">
      <div className="post-top">
        <div className="avatar">{(post.authorName || "U").slice(0, 1).toUpperCase()}</div>
        <div><b>{post.authorName}</b><div className="meta">{when(post.timestamp)}</div></div>
        {post.category ? <span className="tag">{post.category}</span> : null}
      </div>
      <p>{post.content}</p>
      <div className="post-foot"><span>{post.likes} likes · {post.loves} loves</span><span>Comments</span></div>
    </article>
  );
}
