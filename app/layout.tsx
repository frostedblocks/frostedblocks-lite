import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./messenger.css";
import "./photo-gallery.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SHARE = "Free ICE Lite — post free.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lite.frostedblocks.com"),
  title: {
    default: "ICE Lite | Post free",
    template: "%s | ICE Lite",
  },
  description: SHARE,
  keywords: ["ICE Lite", "email login", "social", "free social"],
  openGraph: {
    title: "ICE Lite | Post free",
    description: SHARE,
    siteName: "ICE Lite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICE Lite | Post free",
    description: SHARE,
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
