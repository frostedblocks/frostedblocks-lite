export type CircleSummary = {
  id: string;
  slug: string;
  name: string;
  role: string;
  owner: boolean;
  invitePath: string;
};

export type CircleMember = {
  id: string;
  name: string;
  role: string;
  owner: boolean;
};

export type CircleDetail = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  owner: boolean;
  member: boolean;
  canJoin: boolean;
  invitePath: string | null;
  members?: CircleMember[];
};

export async function listCircles(): Promise<CircleSummary[]> {
  const res = await fetch("/api/circles", { cache: "no-store", credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load circles.");
  return (data.circles || []) as CircleSummary[];
}

export async function createCircle(name: string): Promise<CircleSummary> {
  const res = await fetch("/api/circles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not create circle.");
  return data.circle as CircleSummary;
}

export async function loadCircle(slug: string, invite?: string): Promise<CircleDetail> {
  const q = invite ? `?i=${encodeURIComponent(invite)}` : "";
  const res = await fetch(`/api/circles/${encodeURIComponent(slug)}${q}`, {
    cache: "no-store",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load circle.");
  return data.circle as CircleDetail;
}

export async function deleteCircle(slug: string, confirm: string) {
  const res = await fetch(`/api/circles/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ confirm }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not delete circle.");
}

export async function leaveCircle(slug: string) {
  const res = await fetch(`/api/circles/${encodeURIComponent(slug)}/leave`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not leave circle.");
}

export async function joinCircle(slug: string, invite: string) {
  const res = await fetch(`/api/circles/${encodeURIComponent(slug)}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ invite }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not join.");
}

export async function loadCirclePosts(slug: string) {
  const res = await fetch(`/api/circles/${encodeURIComponent(slug)}/posts`, {
    cache: "no-store",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load posts.");
  return data.posts || [];
}

export async function createCirclePost(slug: string, content: string) {
  const res = await fetch(`/api/circles/${encodeURIComponent(slug)}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not post.");
  return data.post;
}

export async function deleteCirclePost(slug: string, id: string) {
  const res = await fetch(`/api/circles/${encodeURIComponent(slug)}/posts`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not delete.");
}
