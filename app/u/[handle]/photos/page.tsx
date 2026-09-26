import type { Metadata } from "next";
import { PublicPhotoGallery } from "@/components/PublicPhotoGallery";
import { isLiteHandle } from "@/lib/public";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Metadata {
  const handle = String(params.handle || "").trim();
  if (!isLiteHandle(handle)) return { title: "Photos" };
  return {
    title: `Photos · ${handle}`,
    description: `Photos for ${handle} on ICE Lite`,
  };
}

export default function PublicPhotosPage({
  params,
}: {
  params: { handle: string };
}) {
  return (
    <main className="wrap page">
      <PublicPhotoGallery handle={params.handle} />
    </main>
  );
}
