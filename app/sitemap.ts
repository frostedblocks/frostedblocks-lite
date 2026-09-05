import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://lite.frostedblocks.com";
  return ["", "/feed", "/about", "/join", "/privacy", "/contact", "/signup", "/signin"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily",
    priority: path === "" || path === "/feed" ? 1 : 0.6,
  }));
}
