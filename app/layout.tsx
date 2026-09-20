import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./messenger.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SHARE =
  "Free ICE Lite — post without a wallet.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lite.frostedblocks.com"),
  title: {
    default: "ICE Lite | Post without a wallet",
    template: "%s | ICE Lite",
  },
  description: SHARE,
  keywords: ["ICE Lite", "email login", "social", "no wallet"],
  openGraph: {
    title: "ICE Lite | Post without a wallet",
    description: SHARE,
    url: "https://lite.frostedblocks.com",
    siteName: "ICE Lite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICE Lite | Post without a wallet",
    description: SHARE,
  },
  alternates: {
    canonical: "https://lite.frostedblocks.com",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Read request headers so this layout stays dynamic and Next can apply the CSP nonce.
  headers().get("x-nonce");

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
