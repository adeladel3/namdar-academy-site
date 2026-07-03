import { NextResponse } from "next/server";
import { getSession, isStaff, type Session } from "@/lib/auth";
import { can, type AdminAction } from "@/lib/rbac";
import { requireSameOrigin } from "@/lib/csrf";

/**
 * All three admin guards below now take the incoming Request and enforce a
 * same-origin Origin/Referer check on non-GET methods. This closes the
 * CSRF gap that SameSite=lax cookies leave open for top-level form POSTs.
 * Read-only callers that don't need the CSRF check can pass `undefined`
 * (kept for backward compatibility with the existing call sites — but
 * new/updated routes should always pass `req`).
 */

export async function requireStaff(req?: Request): Promise<
  { ok: true; session: Session } | { ok: false; response: Response }
> {
  if (req) {
    const csrf = requireSameOrigin(req);
    if (!csrf.ok) return { ok: false, response: csrf.response };
  }
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }),
    };
  }
  if (!isStaff(session)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, session };
}

export async function requireAdmin(req?: Request): Promise<
  { ok: true; session: Session } | { ok: false; response: Response }
> {
  if (req) {
    const csrf = requireSameOrigin(req);
    if (!csrf.ok) return { ok: false, response: csrf.response };
  }
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }),
    };
  }
  if (session.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, session };
}

export async function requirePerm(
  action: AdminAction,
  req?: Request
): Promise<
  { ok: true; session: Session } | { ok: false; response: Response }
> {
  if (req) {
    const csrf = requireSameOrigin(req);
    if (!csrf.ok) return { ok: false, response: csrf.response };
  }
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }),
    };
  }
  if (!can(session, action)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, session };
}
