import { Suspense } from "react";
import { Messenger } from "@/components/Messenger";

export default function MessagesPage() {
  return (
    <main className="wrap page">
      <Suspense fallback={null}>
        <Messenger />
      </Suspense>
    </main>
  );
}
