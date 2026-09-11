"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButtons } from "./AuthButtons";
import { BrandLink } from "./BrandLink";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/network", label: "Network" },
  { href: "/messages", label: "Messages" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="wrap glass header">
      <div className="header-row">
        <BrandLink />
        <nav className="nav nav-desktop" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} className="nav-link" href={l.href}>
              {l.label}
            </Link>
          ))}
          <AuthButtons />
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={open ? "menu-icon open" : "menu-icon"} aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <nav id="mobile-menu" className="nav-drawer" aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.href} className="nav-link" href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <AuthButtons />
        </nav>
      ) : null}
    </header>
  );
}
