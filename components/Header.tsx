import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";
export function Header() {
  return (
    <header className="wrap glass header">
      <Link className="brand" href="/">
        <div className="logo">ICE</div>
        <div><b>ICE Lite</b><span>not on-chain</span></div>
      </Link>
      <nav className="nav">
        <Link href="/join">How to join</Link>
        <Link href="/about">About</Link>
        <a className="btn ghost" href={ONCHAIN_URL}>ICE Network</a>
      </nav>
    </header>
  );
}
