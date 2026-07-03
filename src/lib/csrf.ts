import { NextResponse } from "next/server";

/**
 * Same-origin guard for state-changing requests.
 *
 * Rationale: session cookies are SameSite=lax, which STILL permits
 * top-level POST/PATCH/DELETE submitted via HTML `<form>` or cross-origin
 * `fetch` with simple Content-Types (`text/plain` + JSON body bypasses the
 * CORS preflight). Without a token or origin check, an attacker page can
 * trigger authenticated state changes against our API just by rendering a
 * form targeting our endpoint and getting an admin to visit it.
 *
 * We gate every state-changing route (POST/PATCH/PUT/DELETE) by requiring
 * the request's Origin header to match the server's own origin. Browsers
 * always send Origin on non-GET requests from scripts/forms, so this cleanly
 * rejects cross-origin submissions without needing a token round-trip.
 *
 * Server-to-server callers (e.g. the Saman bank payment callback) do not
 * send a browser Origin header at all; those routes explicitly opt out by
 * not calling this helper and validating authenticity another way (HMAC /
 * transaction verification).
 */
export function requireSameOrigin(req: Request):
  | { ok: true }
  | { ok: false; response: Response } {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { ok: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Must come from a browser that sends Origin. Null origin (sandboxed
  // iframes, some fetch-no-referrer setups) is suspicious on a write —
  // reject by default.
  if (!origin && !referer) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "origin-missing" },
        { status: 403 }
      ),
    };
  }

  const host = req.headers.get("host");
  const xfHost = req.headers.get("x-forwarded-host");
  const expectedHost = xfHost || host;
  if (!expectedHost) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "host-missing" },
        { status: 403 }
      ),
    };
  }

  try {
    const originHost = origin
      ? new URL(origin).host
      : new URL(referer!).host;
    if (originHost !== expectedHost) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "cross-origin" },
          { status: 403 }
        ),
      };
    }
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "origin-invalid" },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}
