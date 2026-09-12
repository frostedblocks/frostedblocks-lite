import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://lite.frostedblocks.com"),
  title: {
    default: "ICE Lite | Simple social",
    template: "%s | ICE Lite",
  },
  description: "Post, follow, and message on ICE Lite. Email or phone login. Public ICE Network posts appear in the feed.",
  keywords: ["ICE Lite", "ICE Network", "simple social network", "email login social"],
  openGraph: {
    title: "ICE Lite | Simple social",
    description: "Post, follow, and message. Email or phone login.",
    url: "https://lite.frostedblocks.com",
    siteName: "ICE Lite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICE Lite | Simple social",
    description: "Post, follow, and message. Email or phone login.",
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
