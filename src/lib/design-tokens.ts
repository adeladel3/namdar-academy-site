/**
 * Brand design tokens — single source of truth for colors used across the
 * site and the admin panel. All hex values already appear inline in Tailwind
 * class strings throughout the codebase; this file simply consolidates them
 * for reference and programmatic use.
 */

export const BRAND = {
  // Deep navy — primary brand color used in site hero, CTAs, admin chrome.
  navy: "#1b3c8a",
  navyDeep: "#0f1f4a",
  navyMid: "#136cb5",
  navyLight: "#49bbbd",

  // Gold accents — used for premium CTAs (coaching, payment success, upsells).
  goldLight: "#f7cf5a",
  gold: "#e8bc3a",
  goldDeep: "#d4a62a",

  // Near-black body text used sitewide.
  ink: "#010514",

  // Surface tints.
  surface: "#ffffff",
  surfaceMuted: "#f5f7fb",
  surfaceTint: "#eef4ff",
  surfaceBorder: "#e5eaf5",
  surfaceDivider: "#eef2f7",

  // Semantic tones (used as Tailwind utility bases; kept here as constants
  // so chart axes and dynamic SVGs can reuse them).
  success: "#22c55e",
  successSoft: "#ecfdf5",
  warning: "#f59e0b",
  warningSoft: "#fff7ed",
  danger: "#ef4444",
  dangerSoft: "#fef2f2",
  info: "#0ea5e9",
  infoSoft: "#f0f9ff",
} as const;

/** Gradient strings that show up repeatedly across the site. */
export const GRADIENTS = {
  brandHorizontal: `linear-gradient(90deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%)`,
  brandDiagonal: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%)`,
  goldPill: `linear-gradient(180deg, ${BRAND.goldLight} 0%, ${BRAND.gold} 55%, ${BRAND.goldDeep} 100%)`,
  navyPanel: `linear-gradient(180deg, ${BRAND.navyDeep} 0%, ${BRAND.navy} 100%)`,
} as const;

export type BrandColor = keyof typeof BRAND;
