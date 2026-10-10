/**
 * Payment provider registry and dynamic selector.
 *
 * This module exports a factory function that returns the correct PaymentClient
 * based on the active provider configured in admin settings or env vars.
 */

import { getSetting } from "@/lib/db";
import { sepClient, tomanToRial as sepTomanToRial } from "./sep";
import { snappayClient, tomanToRial as snappayTomanToRial } from "./snappay";
import type { PaymentClient, PaymentProvider } from "./types";

/**
 * Get the currently active payment provider from settings (falls back to env).
 */
export function getActiveProvider(): PaymentProvider {
  const fromSettings = getSetting<string>("payment.provider");
  if (fromSettings === "snappay") return "snappay";
  if (fromSettings === "sep") return "sep";

  // Env fallback
  const fromEnv = process.env.PAYMENT_PROVIDER?.toLowerCase();
  if (fromEnv === "snappay") return "snappay";

  // Default to SEP for backward compatibility
  return "sep";
}

/**
 * Get the PaymentClient for the active provider.
 */
export function getPaymentClient(
  provider?: PaymentProvider,
): PaymentClient {
  const p = provider ?? getActiveProvider();
  switch (p) {
    case "snappay":
      return snappayClient;
    case "sep":
    default:
      return sepClient;
  }
}

/**
 * Convert Toman to Rial for the active provider.
 * All providers use Rial internally, but the function is kept for clarity.
 */
export function tomanToRial(toman: number, provider?: PaymentProvider): number {
  const p = provider ?? getActiveProvider();
  switch (p) {
    case "snappay":
      return snappayTomanToRial(toman);
    case "sep":
    default:
      return sepTomanToRial(toman);
  }
}

/**
 * Check if any payment provider is configured and enabled.
 */
export function isPaymentConfigured(): boolean {
  const provider = getActiveProvider();
  const client = getPaymentClient(provider);
  return client.isConfigured();
}

export type { PaymentProvider, PaymentClient } from "./types";
