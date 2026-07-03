import { cookies } from "next/headers";
import crypto from "node:crypto";
import { getUser, type UserRole } from "@/lib/db";

export type Session = {
  userId: string;
  phone: string;
  name: string;
  role: UserRole;
};

const SESSION_COOKIE = "namdar_session";
// Fail fast in production if SESSION_SECRET is unset. A silent fallback would
// let forged cookies through because the literal would also live in the repo
// history. Dev fallback is a fixed value so `npm run dev` still works without
// an env file, but it is NEVER used in production.
const SESSION_SECRET = (() => {
  const env = process.env.SESSION_SECRET;
  if (env && env.length >= 16) return env;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET env var is required in production (min 16 chars)."
    );
  }
  return "dev-only-insecure-replace-in-prod";
})();

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
  const decoded = decodeSession(token);
  if (!decoded) return null;

  // Re-hydrate role / name / phone from the DB on every request. The cookie
  // acts as a signed userId reference; the live record is the source of truth.
  // Why: if we trusted the role baked into the cookie, then an admin flipping
  // a user's role in /admin/users would not take effect until that user
  // logs out and back in — and worse, a just-demoted former admin would
  // keep seeing the admin panel link + pass server-side guards until their
  // cookie expired. Reading fresh avoids both.
  const user = getUser(decoded.userId);
  if (!user) return null;
  if (user.status !== "active") return null;
  return {
    userId: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
  };
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
export function isStaff(s: Session | null | undefined): boolean {
  if (!s) return false;
  if (s.role === "admin" || s.role === "support") return true;
  // کاربری که نقش پایه‌اش staff نیست ولی به صورت گرانولار حداقل یک
  // دسترسی مدیریتی فعال به او اعطا شده باشد، باید بتواند وارد پنل ادمین
  // شود و دکمه‌ی «پنل ادمین» در داشبوردش دیده شود. منبع حقیقت: DB.
  const u = getUser(s.userId);
  if (!u) return false;
  const grants = u.permissionGrants ?? [];
  const denies = u.permissionDenies ?? [];
  return grants.some((g) => !denies.includes(g));
}

const TOTP_CHALLENGE_TTL_MS = 5 * 60 * 1000;

export function signTotpChallenge(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, exp: Date.now() + TOTP_CHALLENGE_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyTotpChallenge(token: string): string | null {
  const [payload, sig] = (token || "").split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.userId !== "string") return null;
    return data.userId;
  } catch {
    return null;
  }
}

// --- Seminar reservation challenge ----------------------------------------

/**
 * بین مراحل ۱ (دریافت اطلاعات + ارسال OTP) و ۲ (تأیید OTP و ورود) پاپ‌آپ
 * رزرو سمینار، یک challenge امضاشده می‌سازیم که اطلاعات شناسنامه‌ای کاربر
 * را نگه می‌دارد. این کار از سر و کله زدن با session قبل از login جلوگیری
 * می‌کند و در عین حال اطلاعات را امن نگه می‌دارد (HMAC).
 *
 * چرا نه session: تا قبل از تأیید OTP کاربر هنوز login نشده. اگر اطلاعات
 * را روی DB ذخیره کنیم نیاز به cleanup داریم. challenge stateless ساده‌تر است.
 */
const SEMINAR_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export type SeminarReservationPayload = {
  seminarSlug: string;
  fullName: string;
  nationalId: string;
  phone: string;
  exp: number;
};

export function signSeminarChallenge(
  data: Omit<SeminarReservationPayload, "exp">
): string {
  const payload = Buffer.from(
    JSON.stringify({ ...data, exp: Date.now() + SEMINAR_CHALLENGE_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySeminarChallenge(
  token: string
): SeminarReservationPayload | null {
  const [payload, sig] = (token || "").split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.seminarSlug !== "string") return null;
    if (typeof data.fullName !== "string") return null;
    if (typeof data.nationalId !== "string") return null;
    if (typeof data.phone !== "string") return null;
    return data as SeminarReservationPayload;
  } catch {
    return null;
  }
}

// --- Pending TOTP setup (enable flow) -------------------------------------

const TOTP_SETUP_TTL_MS = 10 * 60 * 1000;

/**
 * Bind a freshly generated TOTP secret to the user's session for up to 10
 * minutes so the /enable endpoint can verify the user actually came through
 * /setup and is activating the SAME secret we showed them. Without this,
 * /enable would accept any client-supplied secret — an attacker with a
 * short-lived session hijack could plant their own authenticator as a
 * persistent backdoor.
 */
export function signTotpSetup(userId: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      secret,
      exp: Date.now() + TOTP_SETUP_TTL_MS,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyTotpSetup(
  token: string,
  expectedUserId: string
): { secret: string } | null {
  const [payload, sig] = (token || "").split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.userId !== "string" || data.userId !== expectedUserId)
      return null;
    if (typeof data.secret !== "string" || !data.secret) return null;
    return { secret: data.secret };
  } catch {
    return null;
  }
}
