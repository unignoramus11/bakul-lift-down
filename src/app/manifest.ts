import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BAKUL LIFT DOWN",
    short_name: "Lift Down",
    description:
      "Crowd-sourced surveillance log for the Bakul Hostel lift, IIIT Hyderabad.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070A",
    theme_color: "#05070A",
    orientation: "portrait",
    categories: ["utilities", "productivity"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
