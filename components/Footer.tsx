import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <Link href="/about">About</Link>
      <Link href="/join">Join</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/contact">Contact</Link>
      <a href="/rss.xml">RSS</a>
      <a href="https://www.frostedblocks.com" rel="noopener noreferrer">ICE Network</a>
    </footer>
  );
}
