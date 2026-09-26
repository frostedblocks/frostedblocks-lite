import type { Metadata } from "next";
import { PublicProfileView } from "@/components/PublicProfileView";
import { isLiteHandle } from "@/lib/public";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Metadata {
  const handle = String(params.handle || "").trim();
  if (!isLiteHandle(handle)) return { title: "Profile" };
  return {
    title: `${handle} on ICE Lite`,
    description: `Public Lite profile for ${handle}`,
  };
}

export default function PublicProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  return (
    <main className="wrap page">
      <PublicProfileView handle={params.handle} />
    </main>
  );
}
