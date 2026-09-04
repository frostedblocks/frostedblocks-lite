import Link from "next/link";
import { AuthButtons } from "./AuthButtons";
import { BrandLink } from "./BrandLink";

export function Header() {
  return (
    <header className="wrap glass header">
      <BrandLink />
      <nav className="nav">
        <Link className="nav-link" href="/feed">Feed</Link>
        <Link className="nav-link" href="/network">Network</Link>
        <Link className="nav-link" href="/messages">Messages</Link>
        <AuthButtons />
      </nav>
    </header>
  );
}
