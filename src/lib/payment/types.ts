/**
 * Payment provider abstraction types.
 *
 * This module defines interfaces and types that enable the app to support
 * multiple payment gateways (SEP/Saman, SnappPay, etc.) without tightly
 * coupling business logic to a specific provider.
 */

export type PaymentProvider = "sep" | "snappay";

export type TokenRequest = {
  amountRial: number;
  orderId: string;
  callbackUrl: string;
  cellNumber?: string;
};

export type TokenResult =
  | { ok: true; token: string; paymentUrl: string }
  | { ok: false; code: string; message: string };

export type VerifyRequest = {
  refNum: string;
  /** For providers that use a different identifier (e.g. SnappPay's paymentToken),
   *  this field holds the provider-specific token. */
  providerToken?: string;
};

export type VerifyResult =
  | {
      ok: true;
      amountRial: number;
      refNum: string;
      resultCode?: number;
      rrn?: string;
      maskedPan?: string;
      hashedPan?: string;
      straceNo?: string;
    }
  | { ok: false; code: string; message: string };

export type ReverseRequest = {
  refNum: string;
  providerToken?: string;
};

export type ReverseResult =
  | { ok: true; refNum: string; resultCode?: number }
  | { ok: false; code: string; message: string };

/**
 * Unified interface for payment providers. Each provider (SEP, SnappPay, etc.)
 * must implement these methods.
 */
export interface PaymentClient {
  readonly provider: PaymentProvider;

  /**
   * Check if the provider is properly configured (all required env vars/settings present).
   */
  isConfigured(): boolean;

  /**
   * Request a payment token and return the URL to redirect the user to.
   */
  requestToken(params: TokenRequest): Promise<TokenResult>;

  /**
   * Verify a payment after the user returns from the gateway.
   * Must be idempotent — calling multiple times with the same refNum should not error.
   */
  verify(params: VerifyRequest): Promise<VerifyResult>;

  /**
   * Reverse/refund a payment. Optional — not all providers support this.
   * For SnappPay, this is called "revert" and must happen before settle.
   */
  reverse?(params: ReverseRequest): Promise<ReverseResult>;
}
