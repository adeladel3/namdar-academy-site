import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { UserRole } from "@/lib/db";

export type Session = {
  userId: string;
  phone: string;
  name: string;
  role: UserRole;
};

const SESSION_COOKIE = "namdar_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "dev-only-insecure-replace-in-prod";

function sign(payload: string) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

export function encodeSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function decodeSession(token: string): Session | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function isAdmin(s: Session | null | undefined) {
  return s?.role === "admin";
}
export function isStaff(s: Session | null | undefined) {
  return s?.role === "admin" || s?.role === "support";
}
