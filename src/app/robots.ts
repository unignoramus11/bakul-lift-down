import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: "https://bakul-lift-down.vercel.app/sitemap.xml",
    host: "https://bakul-lift-down.vercel.app",
  };
}
