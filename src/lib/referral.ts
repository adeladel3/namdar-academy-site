/**
 * Referral attribution helpers.
 *
 * Flow:
 *   1. Sales agent shares a URL like `https://namdaracademy.com/?ref=MONA10`.
 *   2. The edge middleware sees the `?ref=` param on any GET, validates it,
 *      and writes a cookie that lives for 30 days.
 *   3. When the visitor eventually starts a payment, the SEP start route
 *      reads the cookie via `readReferralCookie()` and freezes the agent +
 *      commission rate on the resulting Order.
 *
 * The cookie is intentionally NOT HttpOnly — front-end may want to display
 * a small "you are visiting via X" banner. Even if leaked it's just an
 * attribution token, not an auth secret.
 */
import type { NextRequest } from "next/server";

export const REFERRAL_COOKIE = "namdar_ref";
export const REFERRAL_LINK_COOKIE = "namdar_ref_link";
export const REFERRAL_TTL_DAYS = 30;
const REFERRAL_TTL_SECONDS = REFERRAL_TTL_DAYS * 24 * 60 * 60;

/** Allowed shape: 2–32 chars of [A-Z 0-9 _ -]. Reject everything else so we
 *  don't echo arbitrary user-controlled bytes into Set-Cookie. */
const REFERRAL_RE = /^[A-Z0-9_-]{2,32}$/;

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (!REFERRAL_RE.test(v)) return null;
  return v;
}

/** Read the referral cookie. Returns the normalized code or null. */
export function readReferralCookie(req: NextRequest | Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(/;\s*/)
    .find((c) => c.startsWith(REFERRAL_COOKIE + "="));
  if (!match) return null;
  const raw = decodeURIComponent(match.slice(REFERRAL_COOKIE.length + 1));
  return normalizeReferralCode(raw);
}

/** Read the per-link cookie set by `/r/[linkId]`. Returns the linkId or
 *  null. We don't validate the format here because link IDs are random
 *  strings — the caller looks it up in the DB and that's the real validation. */
export function readReferralLinkCookie(req: NextRequest | Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(/;\s*/)
    .find((c) => c.startsWith(REFERRAL_LINK_COOKIE + "="));
  if (!match) return null;
  const raw = decodeURIComponent(match.slice(REFERRAL_LINK_COOKIE.length + 1));
  return raw && /^link_[a-z0-9]{1,20}$/.test(raw) ? raw : null;
}

/** Build the Set-Cookie attributes object passed to NextResponse.cookies.set */
export function referralCookieOptions(): {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REFERRAL_TTL_SECONDS,
  };
}
