import { Suspense } from "react";
import { CircleRoom } from "@/components/CircleRoom";

export default function CircleSlugPage({ params }: { params: { slug: string } }) {
  return (
    <main className="wrap page">
      <Suspense fallback={<p className="note">Opening circle…</p>}>
        <CircleRoom slug={params.slug} />
      </Suspense>
    </main>
  );
}
