/* In-memory OTP store. Replace with Redis/DB in production.
 * Kept outside globalThis in dev so HMR doesn't wipe it. */

type OtpRecord = { code: string; expiresAt: number; attempts: number };

type UserRecord = { id: string; phone: string; name: string; role: "user" | "admin" };

type OrderRecord = {
  id: string;
  userId: string;
  courseSlug: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  authority?: string;
  refId?: string;
  createdAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __namdar_otp: Map<string, OtpRecord> | undefined;
  // eslint-disable-next-line no-var
  var __namdar_users: Map<string, UserRecord> | undefined;
  // eslint-disable-next-line no-var
  var __namdar_orders: Map<string, OrderRecord> | undefined;
  // eslint-disable-next-line no-var
  var __namdar_enrollments: Map<string, Set<string>> | undefined;
}

export const otpStore: Map<string, OtpRecord> =
  globalThis.__namdar_otp ?? (globalThis.__namdar_otp = new Map());

export const userStore: Map<string, UserRecord> =
  globalThis.__namdar_users ?? (globalThis.__namdar_users = new Map());

export const orderStore: Map<string, OrderRecord> =
  globalThis.__namdar_orders ?? (globalThis.__namdar_orders = new Map());

/** Map userId → set of enrolled course slugs */
export const enrollmentStore: Map<string, Set<string>> =
  globalThis.__namdar_enrollments ??
  (globalThis.__namdar_enrollments = new Map());

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type { UserRecord, OrderRecord };
