import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://lite.frostedblocks.com"),
  title: {
    default: "ICE Lite | Quiet social without tokens",
    template: "%s | ICE Lite",
  },
  description:
    "ICE Lite is the free door to ICE Network. Post, follow, and message with email or phone — no wallet, no tokens. Public on-chain posts appear in the feed.",
  keywords: [
    "ICE Lite",
    "ICE Network",
    "quiet social network",
    "decentralized social",
    "email login social",
    "Internet Computer lite",
  ],
  openGraph: {
    title: "ICE Lite | Quiet social without tokens",
    description:
      "The free door to ICE Network. Email or phone login, no wallet required. Same quiet feed, upgrade to a canister later.",
    url: "https://lite.frostedblocks.com",
    siteName: "ICE Lite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICE Lite | Quiet social without tokens",
    description:
      "The free door to ICE Network. Email or phone login, no wallet required.",
  },
  alternates: {
    canonical: "https://lite.frostedblocks.com",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
