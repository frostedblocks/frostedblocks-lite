import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { getPost, postUrl } from "@/lib/get-post";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPost(params.id);
  if (!post) return { title: "Post" };
  const title = `${post.authorName} on ICE Lite`;
  const description = post.content.replace(/\s+/g, " ").slice(0, 160);
  const url = postUrl(post.id);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "ICE Lite",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  if (!post) notFound();
  return (
    <main className="wrap page">
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p className="note" style={{ margin: "0 0 12px" }}>
          <Link className="quiet-link" href="/">Back to feed</Link>
        </p>
        <PostCard post={post} />
      </div>
    </main>
  );
}
