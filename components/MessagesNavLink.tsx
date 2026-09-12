"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { listAllMessages, totalUnread } from "@/lib/messages-client";

export function MessagesNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const { signedIn, ready } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!ready || !signedIn) {
      setUnread(0);
      return;
    }
    let cancelled = false;
    async function tick() {
      try {
        const pack = await listAllMessages();
        if (!cancelled) setUnread(totalUnread(pack.me, pack.messages, pack.reads));
      } catch {
        if (!cancelled) setUnread(0);
      }
    }
    void tick();
    const id = window.setInterval(tick, 45000);
    const onFocus = () => { void tick(); };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [ready, signedIn]);

  return (
    <Link className="nav-link nav-link-badge" href="/messages" onClick={onNavigate}>
      Messages
      {unread > 0 ? <span className="nav-badge">{unread > 9 ? "9+" : unread}</span> : null}
    </Link>
  );
}
