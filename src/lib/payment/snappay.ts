/**
 * SnappPay (اسنپ‌پی) BNPL payment provider — OAuth-based installment gateway.
 *
 * Official docs: https://academy.snapppay.ir/self-cms/
 * API base: https://api.snapppay.ir/
 *
 * Flow:
 *   1. OAuth token (cached)
 *   2. Optional: eligible check
 *   3. Get payment token → redirect user
 *   4. Callback → verify → settle
 *   5. On mismatch: revert
 *
 * All amounts are in Rial (IRR). Multiply Toman × 10 before calling.
 */

import { getSetting } from "@/lib/db";
import type {
  PaymentClient,
  TokenRequest,
  TokenResult,
  VerifyRequest,
  VerifyResult,
  ReverseRequest,
  ReverseResult,
} from "./types";

// --- Config readers ---

function readBaseUrl(): string {
  const fromSettings = getSetting<string>("payment.snappayBaseUrl");
  if (typeof fromSettings === "string" && fromSettings.trim())
    return fromSettings.trim().replace(/\/+$/, "");
  return (process.env.SNAPPAY_BASE_URL ?? "https://api.snapppay.ir").replace(
    /\/+$/,
    "",
  );
}

function readClientId(): string {
  const fromSettings = getSetting<string>("payment.snappayClientId");
  if (typeof fromSettings === "string" && fromSettings.trim())
    return fromSettings.trim();
  return process.env.SNAPPAY_CLIENT_ID ?? "";
}

function readClientSecret(): string {
  const fromSettings = getSetting<string>("payment.snappayClientSecret");
  if (typeof fromSettings === "string" && fromSettings.trim())
    return fromSettings.trim();
  return process.env.SNAPPAY_CLIENT_SECRET ?? "";
}

function readUsername(): string {
  const fromSettings = getSetting<string>("payment.snappayUsername");
  if (typeof fromSettings === "string" && fromSettings.trim())
    return fromSettings.trim();
  return process.env.SNAPPAY_USERNAME ?? "";
}

function readPassword(): string {
  const fromSettings = getSetting<string>("payment.snappayPassword");
  if (typeof fromSettings === "string" && fromSettings.trim())
    return fromSettings.trim();
  return process.env.SNAPPAY_PASSWORD ?? "";
}

// --- OAuth token cache ---

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 30s safety margin)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const baseUrl = readBaseUrl();
  const clientId = readClientId();
  const clientSecret = readClientSecret();
  const username = readUsername();
  const password = readPassword();

  if (!clientId || !clientSecret || !username || !password) {
    console.error("[snappay] OAuth credentials missing");
    return null;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const body = new URLSearchParams({
    grant_type: "password",
    scope: "online-merchant",
    username,
    password,
  });

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/online/v1/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": `SnappPay, ${clientId}`,
      },
      body: body.toString(),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[snappay] OAuth token HTTP ${res.status}`);
      return null;
    }
  } catch (e) {
    console.error("[snappay] OAuth token request failed:", e);
    return null;
  }

  let data: {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
  };
  try {
    data = await res.json();
  } catch {
    console.error("[snappay] OAuth token response not JSON");
    return null;
  }

  if (!data.access_token) {
    console.error("[snappay] OAuth token missing in response");
    return null;
  }

  // Cache the token (expires_in is in seconds)
  const expiresIn = data.expires_in ?? 3600;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return data.access_token;
}

/** Clear the cached token (e.g., after receiving 401). */
function clearTokenCache() {
  cachedToken = null;
}

/** Exported for tests only — clear the cache between tests. */
export function _clearCacheForTests() {
  cachedToken = null;
}

// --- Helper: Bearer request with auto-retry on 401 ---

async function bearerRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const baseUrl = readBaseUrl();
  let token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "Failed to obtain access token" };
  }

  const attemptRequest = async (
    tkn: string,
  ): Promise<{ ok: true; data: T } | { ok: false; error: string }> => {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${tkn}`,
          "Content-Type": "application/json",
          "User-Agent": `SnappPay, ${readClientId()}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      // On 401, clear cache and retry once
      if (res.status === 401) {
        return { ok: false, error: "Unauthorized (401)" };
      }

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` };
      }

      let parsed: T;
      try {
        parsed = await res.json();
      } catch {
        return { ok: false, error: "Invalid JSON response" };
      }

      return { ok: true, data: parsed };
    } catch (e) {
      return { ok: false, error: `Network error: ${(e as Error).message}` };
    }
  };

  // First attempt
  let result = await attemptRequest(token);
  if (result.ok) return result;

  // If 401, refresh token and retry once
  if (result.error.includes("401")) {
    clearTokenCache();
    token = await getAccessToken();
    if (!token) {
      return { ok: false, error: "Failed to refresh token after 401" };
    }
    result = await attemptRequest(token);
  }

  return result;
}

// --- SnappPay API methods ---

type EligibleResponse = {
  response?: { eligible?: boolean };
  successful?: boolean;
};

/** Check if the amount is eligible for installment payment. */
export async function checkEligible(
  amountRial: number,
): Promise<{ ok: true; eligible: boolean } | { ok: false; message: string }> {
  const res = await bearerRequest<EligibleResponse>(
    "GET",
    `/api/online/offer/v1/eligible?amount=${amountRial}`,
  );
  if (!res.ok) {
    return { ok: false, message: res.error };
  }
  const eligible = res.data.response?.eligible ?? false;
  return { ok: true, eligible };
}

type PaymentTokenResponse = {
  response?: {
    paymentToken?: string;
    paymentPageUrl?: string;
  };
  successful?: boolean;
  errorCode?: string;
  message?: string;
};

/** Get a payment token and the URL to redirect the user to. */
async function getPaymentToken(params: {
  amountRial: number;
  transactionId: string;
  returnURL: string;
  mobile?: string;
}): Promise<TokenResult> {
  const body = {
    amount: params.amountRial,
    paymentMethodTypeDto: "INSTALLMENT",
    returnURL: params.returnURL,
    transactionId: params.transactionId,
    mobile: params.mobile,
    discountAmount: 0,
    cartList: [
      {
        cartId: params.transactionId,
        totalAmount: params.amountRial,
        cartItems: [
          {
            id: params.transactionId,
            name: "سفارش نامدار آکادمی",
            count: 1,
            amount: params.amountRial,
            category: "آموزش",
            commissionType: "TYPE1",
          },
        ],
        taxAmount: 0,
        shippingAmount: 0,
        isShipmentIncluded: false,
        isTaxIncluded: false,
      },
    ],
  };

  const res = await bearerRequest<PaymentTokenResponse>(
    "POST",
    "/api/online/payment/v1/token",
    body,
  );

  if (!res.ok) {
    return { ok: false, code: "NETWORK", message: res.error };
  }

  if (
    res.data.successful &&
    res.data.response?.paymentToken &&
    res.data.response.paymentPageUrl
  ) {
    return {
      ok: true,
      token: res.data.response.paymentToken,
      paymentUrl: res.data.response.paymentPageUrl,
    };
  }

  return {
    ok: false,
    code: res.data.errorCode ?? "UNKNOWN",
    message: res.data.message ?? "Failed to obtain payment token",
  };
}

type VerifyResponse = {
  response?: {
    transactionId?: string;
    amount?: number;
  };
  successful?: boolean;
  errorCode?: string;
  message?: string;
};

/** Verify a payment after callback. Must be called before settle. */
async function verifyPayment(
  paymentToken: string,
): Promise<VerifyResult> {
  const res = await bearerRequest<VerifyResponse>(
    "POST",
    "/api/online/payment/v1/verify",
    { paymentToken },
  );

  if (!res.ok) {
    return { ok: false, code: "NETWORK", message: res.error };
  }

  if (res.data.successful && res.data.response) {
    return {
      ok: true,
      amountRial: res.data.response.amount ?? 0,
      refNum: paymentToken,
    };
  }

  return {
    ok: false,
    code: res.data.errorCode ?? "UNKNOWN",
    message: res.data.message ?? "Verification failed",
  };
}

type SettleResponse = {
  successful?: boolean;
  errorCode?: string;
  message?: string;
};

/** Settle (finalize) a verified payment. Must be called after verify succeeds. */
async function settlePayment(
  paymentToken: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const res = await bearerRequest<SettleResponse>(
    "POST",
    "/api/online/payment/v1/settle",
    { paymentToken },
  );

  if (!res.ok) {
    return { ok: false, code: "NETWORK", message: res.error };
  }

  if (res.data.successful) {
    return { ok: true };
  }

  return {
    ok: false,
    code: res.data.errorCode ?? "UNKNOWN",
    message: res.data.message ?? "Settle failed",
  };
}

type RevertResponse = {
  successful?: boolean;
  errorCode?: string;
  message?: string;
};

/** Revert (refund) a payment before it is settled. Cannot be called after settle. */
async function revertPayment(
  paymentToken: string,
): Promise<ReverseResult> {
  const res = await bearerRequest<RevertResponse>(
    "POST",
    "/api/online/payment/v1/revert",
    { paymentToken },
  );

  if (!res.ok) {
    return { ok: false, code: "NETWORK", message: res.error };
  }

  if (res.data.successful) {
    return { ok: true, refNum: paymentToken };
  }

  return {
    ok: false,
    code: res.data.errorCode ?? "UNKNOWN",
    message: res.data.message ?? "Revert failed",
  };
}

type CancelResponse = {
  successful?: boolean;
  errorCode?: string;
  message?: string;
};

/** Cancel a payment (alternative to revert). */
export async function cancelPayment(
  paymentToken: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const res = await bearerRequest<CancelResponse>(
    "POST",
    "/api/online/payment/v1/cancel",
    { paymentToken },
  );

  if (!res.ok) {
    return { ok: false, code: "NETWORK", message: res.error };
  }

  if (res.data.successful) {
    return { ok: true };
  }

  return {
    ok: false,
    code: res.data.errorCode ?? "UNKNOWN",
    message: res.data.message ?? "Cancel failed",
  };
}

type StatusResponse = {
  response?: {
    status?: string;
  };
  successful?: boolean;
  errorCode?: string;
  message?: string;
};

/** Query the current status of a payment. */
export async function getPaymentStatus(
  paymentToken: string,
): Promise<
  | { ok: true; status: string }
  | { ok: false; code: string; message: string }
> {
  const res = await bearerRequest<StatusResponse>(
    "GET",
    `/api/online/payment/v1/status?paymentToken=${encodeURIComponent(paymentToken)}`,
  );

  if (!res.ok) {
    return { ok: false, code: "NETWORK", message: res.error };
  }

  if (res.data.successful && res.data.response?.status) {
    return { ok: true, status: res.data.response.status };
  }

  return {
    ok: false,
    code: res.data.errorCode ?? "UNKNOWN",
    message: res.data.message ?? "Status query failed",
  };
}

// --- PaymentClient implementation ---

class SnappPayClient implements PaymentClient {
  readonly provider = "snappay" as const;

  isConfigured(): boolean {
    return !!(
      readBaseUrl() &&
      readClientId() &&
      readClientSecret() &&
      readUsername() &&
      readPassword()
    );
  }

  async requestToken(params: TokenRequest): Promise<TokenResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        code: "NOT_CONFIGURED",
        message: "اسنپ‌پی پیکربندی نشده است",
      };
    }

    // Optional: check eligibility first
    const eligibleCheck = await checkEligible(params.amountRial);
    if (eligibleCheck.ok && !eligibleCheck.eligible) {
      return {
        ok: false,
        code: "NOT_ELIGIBLE",
        message: "مبلغ برای پرداخت اقساطی مجاز نیست",
      };
    }

    return getPaymentToken({
      amountRial: params.amountRial,
      transactionId: params.orderId,
      returnURL: params.callbackUrl,
      mobile: params.cellNumber,
    });
  }

  async verify(params: VerifyRequest): Promise<VerifyResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        code: "NOT_CONFIGURED",
        message: "اسنپ‌پی پیکربندی نشده است",
      };
    }

    // SnappPay uses paymentToken, not refNum from the callback
    const token = params.providerToken ?? params.refNum;
    const verifyRes = await verifyPayment(token);
    if (!verifyRes.ok) return verifyRes;

    // After successful verify, immediately settle
    const settleRes = await settlePayment(token);
    if (!settleRes.ok) {
      return {
        ok: false,
        code: settleRes.code,
        message: `Verify OK but settle failed: ${settleRes.message}`,
      };
    }

    return verifyRes;
  }

  async reverse(params: ReverseRequest): Promise<ReverseResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        code: "NOT_CONFIGURED",
        message: "اسنپ‌پی پیکربندی نشده است",
      };
    }

    const token = params.providerToken ?? params.refNum;
    return revertPayment(token);
  }
}

export const snappayClient = new SnappPayClient();

/** Convert Toman to Rial (SnappPay expects Rial). */
export function tomanToRial(toman: number): number {
  return toman * 10;
}
