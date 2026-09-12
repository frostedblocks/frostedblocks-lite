import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import "./messenger.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://lite.frostedblocks.com"),
  title: {
    default: "ICE Lite | Lite Frost before the ICE",
    template: "%s | ICE Lite",
  },
  description: "Lite Frost before the ICE — a door to the ICE Network. Post, follow, and message on ICE Lite with email or phone login.",
  keywords: ["ICE Lite", "ICE Network", "Lite Frost", "email login social"],
  openGraph: {
    title: "ICE Lite | Lite Frost before the ICE",
    description: "A door to the ICE Network. Post, follow, and message with email or phone login.",
    url: "https://lite.frostedblocks.com",
    siteName: "ICE Lite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICE Lite | Lite Frost before the ICE",
    description: "A door to the ICE Network. Post, follow, and message with email or phone login.",
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
