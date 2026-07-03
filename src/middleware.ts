import { NextRequest, NextResponse } from "next/server";
import {
  REFERRAL_COOKIE,
  normalizeReferralCode,
  referralCookieOptions,
} from "@/lib/referral";

/**
 * Edge-level CSRF + security headers.
 *
 * Why here (vs per-route):
 *   - SameSite=lax cookies do not protect against top-level cross-origin
 *     POST/PATCH/DELETE. An attacker page can render `<form action="/api/..."
 *     method="POST">` and the authenticated cookie still rides along.
 *   - Every mutating request must come from our own origin. Browsers always
 *     send `Origin` on non-GET fetches and form POSTs, so matching it against
 *     `Host` (or `X-Forwarded-Host` when behind a proxy) is a reliable gate.
 *   - A single place instead of 50+ route handlers means we cannot forget.
 *
 * The payment callback (`/api/payment/callback`) is explicitly exempt because
 * the bank POSTs from its own origin and does not send a browser `Origin`
 * header; that route validates authenticity via SEP's RefNum + amount match.
 */

const CSRF_EXEMPT_PATHS: readonly string[] = [
  "/api/payment/callback",
];

function isSafeMethod(m: string) {
  const up = m.toUpperCase();
  return up === "GET" || up === "HEAD" || up === "OPTIONS";
}

/**
 * Origin مجاز:
 *  - host دقیقاً برابر باشد
 *  - یا origin زیرشاخه‌ی namdaracademy.com باشد (تا investinghub، namdargold،
 *    و سایر زیردامنه‌ها برای فراخوانی API سایت اصلی مسدود نشوند).
 */
function isAllowedHost(reqHost: string, originHost: string): boolean {
  if (originHost === reqHost) return true;
  if (
    /(^|\.)namdaracademy\.com$/i.test(originHost) &&
    /(^|\.)namdaracademy\.com$/i.test(reqHost)
  ) {
    return true;
  }
  return false;
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return false;

  const candidate = origin || referer;
  if (!candidate) return false;
  try {
    return isAllowedHost(host, new URL(candidate).host);
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only gate API routes. App-router page requests are GET and already safe;
  // their forms post to /api/*.
  if (pathname.startsWith("/api/")) {
    if (!isSafeMethod(req.method)) {
      const exempt = CSRF_EXEMPT_PATHS.some((p) => pathname.startsWith(p));
      if (!exempt && !sameOrigin(req)) {
        return NextResponse.json(
          { error: "cross-origin" },
          { status: 403 }
        );
      }
    }
  }

  // Apply hardening headers to everything.
  const res = NextResponse.next();

  // Referral attribution — if the visitor arrived with ?ref=CODE (typically
  // a sales-agent link), drop a 30-day cookie so a later purchase can be
  // attributed even if they leave and come back. We don't strip the query
  // param from the URL — flicker-free, and the param is harmless.
  if (isSafeMethod(req.method)) {
    const raw = req.nextUrl.searchParams.get("ref");
    const code = normalizeReferralCode(raw);
    if (code) {
      res.cookies.set(REFERRAL_COOKIE, code, referralCookieOptions());
    }
  }

  // Prevent our site from being framed by attacker pages (clickjacking).
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  // MIME sniffing (SVG-as-HTML, etc.).
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Strip Referer on cross-origin navigations.
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // HSTS only in production HTTPS deployments (no effect on http://localhost).
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  return res;
}

// Run on everything except Next's internals and public static assets.
// `/m/` نیز exclude شده چون route سرو فایل آپلودی است و هدر امنیتی
// خاص نمی‌خواهد (پاسخ binary است نه HTML/JS).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|figma|fonts|uploads|m/).*)",
  ],
};
