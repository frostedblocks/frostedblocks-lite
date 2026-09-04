"use client";
import { avatarFor, currentUser } from "@/lib/auth-client";
import { deletePost } from "@/lib/posts-client";
import type { IcePost } from "@/lib/types";
import { useEffect, useState } from "react";
import { DoorBadge, doorForPost } from "./LiteBadge";

function when(ts: number) {
  const ms = ts > 1e14 ? ts / 1e6 : ts;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}

export function PostCard({ post, onChange }: { post: IcePost; onChange?: () => void }) {
  const [mine, setMine] = useState(false);
  const [photo, setPhoto] = useState("");
  const door = doorForPost(post.author, post.id, post.source);

  useEffect(() => {
    const user = currentUser();
    setMine(!!user && user.email === post.author && door === "lite");
    setPhoto(avatarFor(post.author));
  }, [post.author, door]);

  function remove() {
    if (!window.confirm("Delete this post?")) return;
    try {
      deletePost(post.id);
      onChange?.();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  return (
    <article className="glass post">
      <div className="post-top">
        {photo ? (
          <img className="avatar" src={photo} alt="" />
        ) : (
          <div className="avatar">{(post.authorName || "U").slice(0, 1).toUpperCase()}</div>
        )}
        <div>
          <b>
            {post.authorName}{" "}
            <DoorBadge source={door} author={post.author} postId={post.id} />
          </b>
          <div className="meta">{when(post.timestamp)}</div>
        </div>
        {post.category ? <span className="tag">{post.category}</span> : null}
      </div>
      <p>{post.content}</p>
      <div className="post-foot">
        <span>{post.likes} likes · {post.loves} loves</span>
        <span>
          {mine ? (
            <button className="delete-btn" type="button" onClick={remove}>Delete</button>
          ) : (
            "Comments"
          )}
        </span>
      </div>
    </article>
  );
}
