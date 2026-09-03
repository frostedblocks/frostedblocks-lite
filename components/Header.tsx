import Link from "next/link";
import { AuthButtons } from "./AuthButtons";
import { BrandLink } from "./BrandLink";

export function Header() {
  return (
    <header className="wrap glass header">
      <BrandLink />
      <nav className="nav">
        <Link href="/join">How to join</Link>
        <Link href="/about">About</Link>
        <Link className="btn ghost" href="/feed">Live feed</Link>
        <Link className="btn" href="/network">Network</Link>
        <Link className="btn ghost" href="/messages">Messages</Link>
        <AuthButtons />
      </nav>
    </header>
  );
}
