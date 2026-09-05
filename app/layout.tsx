import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://lite.frostedblocks.com"),
  title: "ICE Lite | Quiet social without tokens",
  description: "Web2 door of ICE Network — same quiet feed, email login, public on-chain posts included.",
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
