import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/**
 * Web App Manifest — marks the site installable as a PWA on Android
 * (Chrome / Samsung Internet / Firefox) and macOS/Windows browsers. iOS
 * Safari uses legacy apple-mobile-web-app-* meta tags wired up in the
 * root layout (not this manifest).
 *
 * Icons currently point to SVG — Chromium accepts SVG icons, but for
 * best cross-browser install UX, drop PNG variants into `/public/pwa/`
 * at 192×192 and 512×512 and reference them here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#1b3c8a",
    lang: "fa",
    dir: "rtl",
    categories: ["education", "finance", "business"],
    icons: [
      {
        src: "/figma/headerpic.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "دوره‌ها",
        short_name: "دوره‌ها",
        description: "مشاهده همه دوره‌های آموزشی",
        url: "/courses",
      },
      {
        name: "کوچینگ MON",
        short_name: "کوچینگ",
        description: "دوره کوچینگ حرفه‌ای معامله‌گری",
        url: "/coaching",
      },
      {
        name: "داشبورد من",
        short_name: "داشبورد",
        description: "پنل کاربری",
        url: "/dashboard",
      },
    ],
  };
}
