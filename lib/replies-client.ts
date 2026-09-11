export type LiteReply = {
  id: string;
  postId: string;
  author: string;
  authorName: string;
  content: string;
  timestamp: number;
  mine?: boolean;
};

export async function loadReplies(postId: string) {
  const res = await fetch(`/api/replies?post=${encodeURIComponent(postId)}`, { cache: "no-store" });
  const data = await res.json();
  return (data.replies || []) as LiteReply[];
}

export async function createReply(postId: string, content: string) {
  const res = await fetch("/api/replies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not reply.");
  return data.reply as LiteReply;
}

export async function deleteReply(id: string) {
  const res = await fetch("/api/replies", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not delete reply.");
}
