/**
 * Boot-time config validation for payment providers.
 *
 * This module exports a function that checks whether the active payment
 * provider is properly configured. If not, it logs a warning (or throws
 * in strict mode) with the exact missing env vars / settings.
 */

import { getSetting } from "@/lib/db";
import type { PaymentProvider } from "./types";

type ConfigCheckResult =
  | { ok: true }
  | { ok: false; provider: PaymentProvider; missing: string[] };

/**
 * Check if the active payment provider has all required configuration.
 * Returns { ok: true } or { ok: false, missing: [...] }.
 */
export function checkPaymentConfig(
  provider: PaymentProvider,
): ConfigCheckResult {
  if (provider === "sep") {
    const terminalId =
      getSetting<string>("payment.sepTerminalId") ??
      process.env.SEP_TERMINAL_ID;
    if (!terminalId) {
      return { ok: false, provider: "sep", missing: ["SEP_TERMINAL_ID"] };
    }
    return { ok: true };
  }

  if (provider === "snappay") {
    const baseUrl =
      getSetting<string>("payment.snappayBaseUrl") ??
      process.env.SNAPPAY_BASE_URL;
    const clientId =
      getSetting<string>("payment.snappayClientId") ??
      process.env.SNAPPAY_CLIENT_ID;
    const clientSecret =
      getSetting<string>("payment.snappayClientSecret") ??
      process.env.SNAPPAY_CLIENT_SECRET;
    const username =
      getSetting<string>("payment.snappayUsername") ??
      process.env.SNAPPAY_USERNAME;
    const password =
      getSetting<string>("payment.snappayPassword") ??
      process.env.SNAPPAY_PASSWORD;

    const missing: string[] = [];
    if (!baseUrl) missing.push("SNAPPAY_BASE_URL");
    if (!clientId) missing.push("SNAPPAY_CLIENT_ID");
    if (!clientSecret) missing.push("SNAPPAY_CLIENT_SECRET");
    if (!username) missing.push("SNAPPAY_USERNAME");
    if (!password) missing.push("SNAPPAY_PASSWORD");

    if (missing.length > 0) {
      return { ok: false, provider: "snappay", missing };
    }
    return { ok: true };
  }

  return { ok: true };
}

/**
 * Log a startup warning if the active provider is misconfigured.
 * Call this once at app boot (e.g., in a top-level layout or middleware).
 */
export function warnIfMisconfigured(provider: PaymentProvider): void {
  const result = checkPaymentConfig(provider);
  if (!result.ok) {
    console.warn(
      `[payment] Provider "${result.provider}" is enabled but missing config:`,
      result.missing.join(", "),
    );
    console.warn(
      `[payment] Set these in admin settings (/admin/settings/payment) or environment variables.`,
    );
  }
}
