import type { MetadataRoute } from "next";

const BASE = "https://bakul-lift-down.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/export`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
