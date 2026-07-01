import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * PWA manifest at /manifest.webmanifest
 * Allows users to "Add to Home Screen" on mobile devices.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "God's Grace",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#be185d",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "fashion"],
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Shop Products",
        short_name: "Shop",
        description: "Browse our collection",
        url: "/?section=products",
      },
      {
        name: "Contact Us",
        short_name: "Contact",
        description: "Get in touch with us",
        url: "/?section=contact",
      },
    ],
  };
}
