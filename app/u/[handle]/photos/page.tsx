import type { Metadata } from "next";
import { PublicPhotoGallery } from "@/components/PublicPhotoGallery";
import { ensureSchema, sql } from "@/lib/db";
import { isLiteHandle, publicName } from "@/lib/public";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const handle = String(params.handle || "").trim();
  if (!isLiteHandle(handle)) return { title: "Photos" };

  let label = handle;
  try {
    await ensureSchema();
    const userId = Number(handle.slice(1));
    if (Number.isFinite(userId) && userId >= 1) {
      const rows = await sql()`SELECT name FROM lite_users WHERE id = ${userId} LIMIT 1`;
      if (rows[0]) label = publicName(rows[0].name);
    }
  } catch {
    // Fall back to handle if DB is unavailable.
  }

  return {
    title: `Photos · ${label}`,
    description: `Photos for ${label} on ICE Lite`,
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
