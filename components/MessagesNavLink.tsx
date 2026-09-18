"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import {
  latestInbound,
  listAllMessages,
  totalUnread,
  type LiteMessage,
} from "@/lib/messages-client";

const NOTIFY_PREF_KEY = "ice-lite-msg-notify";
const SEEN_MSG_KEY = "ice-lite-msg-seen-at";

function canUseNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function readSeenAt() {
  try {
    return Number(localStorage.getItem(SEEN_MSG_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

function writeSeenAt(at: number) {
  try {
    localStorage.setItem(SEEN_MSG_KEY, String(at));
  } catch {
    /* ignore */
  }
}

function notifyPref() {
  try {
    return localStorage.getItem(NOTIFY_PREF_KEY);
  } catch {
    return null;
  }
}

function setNotifyPref(v: "on" | "off") {
  try {
    localStorage.setItem(NOTIFY_PREF_KEY, v);
  } catch {
    /* ignore */
  }
}

function fireMessageNotification(msg: LiteMessage) {
  if (!canUseNotifications() || Notification.permission !== "granted") return;
  if (typeof document !== "undefined" && document.visibilityState === "visible") {
    // Still notify if not on messages page; skip if already reading messages
    try {
      if (window.location.pathname.startsWith("/messages")) return;
    } catch {
      /* ignore */
    }
  }
  const title = msg.fromName || msg.from || "New message";
  const body = (msg.text || "Someone sent you a message.").slice(0, 140);
  try {
    const n = new Notification(title, {
      body,
      tag: `ice-lite-msg-${msg.from}`,
      renotify: true,
    });
    n.onclick = () => {
      try {
        window.focus();
        window.location.href = `/messages?with=${encodeURIComponent(msg.from)}`;
      } catch {
        /* ignore */
      }
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export function MessagesNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const { signedIn, ready } = useAuth();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [showEnable, setShowEnable] = useState(false);
  const primed = useRef(false);

  useEffect(() => {
    if (!canUseNotifications()) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
    setShowEnable(
      Notification.permission === "default" && notifyPref() !== "off" && !!signedIn
    );
  }, [signedIn]);

  useEffect(() => {
    if (!ready || !signedIn) {
      setUnread(0);
      primed.current = false;
      return;
    }
    let cancelled = false;

    async function tick() {
      try {
        const pack = await listAllMessages();
        if (cancelled) return;
        const n = totalUnread(pack.me, pack.messages, pack.reads);
        setUnread(n);

        const newest = latestInbound(pack.me, pack.messages);
        if (!newest) {
          primed.current = true;
          return;
        }

        const seenAt = readSeenAt();
        // First successful poll: seed seen watermark, don't spam old messages
        if (!primed.current) {
          writeSeenAt(Math.max(seenAt, newest.at));
          primed.current = true;
          return;
        }

        if (newest.at > seenAt) {
          writeSeenAt(newest.at);
          if (notifyPref() !== "off") fireMessageNotification(newest);
        }
      } catch {
        if (!cancelled) setUnread(0);
      }
    }

    void tick();
    const id = window.setInterval(tick, 20000);
    const onFocus = () => {
      void tick();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void tick();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ready, signedIn, pathname]);

  async function enableAlerts() {
    if (!canUseNotifications()) return;
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result === "granted") {
        setNotifyPref("on");
        setShowEnable(false);
      } else {
        setNotifyPref("off");
        setShowEnable(false);
      }
    } catch {
      setShowEnable(false);
    }
  }

  if (!signedIn) {
    return (
      <Link className="nav-link" href="/messages" onClick={onNavigate}>
        Messages
      </Link>
    );
  }

  return (
    <span className="nav-msg-wrap">
      <Link className="nav-link nav-link-badge" href="/messages" onClick={onNavigate}>
        Messages
        {unread > 0 ? <span className="nav-badge">{unread > 9 ? "9+" : unread}</span> : null}
      </Link>
      {showEnable && perm === "default" ? (
        <button
          type="button"
          className="nav-notify-btn"
          onClick={() => {
            void enableAlerts();
          }}
          title="Get a notification when someone messages you"
        >
          Alerts
        </button>
      ) : null}
    </span>
  );
}
