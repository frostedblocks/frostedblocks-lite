import { NextResponse } from "next/server";
import { getPost } from "@/lib/get-post";
import { publicError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  if (!post) return publicError(404, "Post not found.");
  return NextResponse.json({ post });
}
