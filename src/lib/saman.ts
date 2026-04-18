/**
 * Saman Electronic Payment (SEP) — درگاه سپ بانک سامان
 *
 * Flow:
 *   1) requestToken({amountRial, orderId, callbackUrl}) → { token }
 *   2) redirect user to SEP_START_URL + "?token=" + token
 *   3) bank POSTs callback (form-urlencoded) with RefNum/ResNum/State/Status
 *   4) verifyTransaction({refNum}) → { verified, amountRial }
 *
 * Amount unit: Rial (10 Rial = 1 Toman). Multiply Toman × 10.
 */

export const SEP_TOKEN_URL =
  process.env.SEP_TOKEN_URL ?? "https://sep.shaparak.ir/onlinepg/onlinepg";
export const SEP_START_URL =
  process.env.SEP_START_URL ?? "https://sep.shaparak.ir/OnlinePG/SendToken";
export const SEP_VERIFY_URL =
  process.env.SEP_VERIFY_URL ??
  "https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTransaction";

import { getSetting } from "@/lib/db";

/** Read terminal ID from settings first, then fall back to env. */
function readTerminalId(): string {
  const fromSettings = getSetting<string>("payment.sepTerminalId");
  if (typeof fromSettings === "string" && fromSettings.trim())
    return fromSettings.trim();
  return process.env.SEP_TERMINAL_ID ?? "";
}

/** @deprecated kept for backwards compatibility; use readTerminalId() */
export const SEP_TERMINAL_ID = process.env.SEP_TERMINAL_ID ?? "";

export function isSepConfigured() {
  return readTerminalId().length > 0;
}

export type SepTokenOk = { ok: true; token: string };
export type SepTokenErr = { ok: false; code: string; message: string };

export async function requestToken(params: {
  amountRial: number;
  orderId: string;
  callbackUrl: string;
  cellNumber?: string;
}): Promise<SepTokenOk | SepTokenErr> {
  if (!isSepConfigured()) {
    return { ok: false, code: "NO_TERMINAL", message: "ترمینال سپ پیکربندی نشده" };
  }
  const body = {
    Action: "Token",
    TerminalId: readTerminalId(),
    Amount: params.amountRial,
    ResNum: params.orderId,
    RedirectUrl: params.callbackUrl,
    ...(params.cellNumber ? { CellNumber: params.cellNumber } : {}),
  };
  let res: Response;
  try {
    res = await fetch(SEP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    return {
      ok: false,
      code: "NETWORK",
      message: `ارتباط با درگاه ناموفق: ${(e as Error).message}`,
    };
  }
  if (!res.ok) {
    return { ok: false, code: String(res.status), message: `خطای HTTP ${res.status}` };
  }
  let data: {
    status?: number;
    token?: string;
    errorCode?: string | number;
    errorDesc?: string;
  };
  try {
    data = await res.json();
  } catch {
    return { ok: false, code: "BAD_JSON", message: "پاسخ نامعتبر از درگاه" };
  }
  if (data.status === 1 && data.token) {
    return { ok: true, token: data.token };
  }
  return {
    ok: false,
    code: String(data.errorCode ?? "UNKNOWN"),
    message: data.errorDesc ?? "خطا در دریافت توکن پرداخت",
  };
}

export type SepVerifyOk = {
  ok: true;
  amountRial: number;
  refNum: string;
  resultCode: number;
};
export type SepVerifyErr = { ok: false; code: string; message: string };

export async function verifyTransaction(params: {
  refNum: string;
}): Promise<SepVerifyOk | SepVerifyErr> {
  if (!isSepConfigured()) {
    return { ok: false, code: "NO_TERMINAL", message: "ترمینال سپ پیکربندی نشده" };
  }
  let res: Response;
  try {
    res = await fetch(SEP_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        RefNum: params.refNum,
        TerminalNumber: readTerminalId(),
      }),
      cache: "no-store",
    });
  } catch (e) {
    return {
      ok: false,
      code: "NETWORK",
      message: `ارتباط با درگاه ناموفق: ${(e as Error).message}`,
    };
  }
  if (!res.ok) {
    return { ok: false, code: String(res.status), message: `خطای HTTP ${res.status}` };
  }
  let data: {
    Success?: boolean;
    ResultCode?: number;
    ResultDescription?: string;
    TransactionDetail?: {
      AffectiveAmount?: number;
      OrigAmount?: number;
      StraceNo?: string;
      RRN?: string;
    };
  };
  try {
    data = await res.json();
  } catch {
    return { ok: false, code: "BAD_JSON", message: "پاسخ نامعتبر از درگاه" };
  }
  if (data.Success && (data.ResultCode === 0 || data.ResultCode === 2)) {
    return {
      ok: true,
      refNum: params.refNum,
      amountRial:
        data.TransactionDetail?.AffectiveAmount ??
        data.TransactionDetail?.OrigAmount ??
        0,
      resultCode: data.ResultCode,
    };
  }
  return {
    ok: false,
    code: String(data.ResultCode ?? "UNKNOWN"),
    message: data.ResultDescription ?? "تراکنش تأیید نشد",
  };
}

export function tomanToRial(toman: number) {
  return toman * 10;
}

/** Map SEP State/Status values returned on callback to human-readable messages.
 *  See SEP docs; State is the primary signal (e.g. "OK", "CanceledByUser"). */
export function sepStateMessage(state: string | null) {
  switch (state) {
    case "OK":
      return "پرداخت با موفقیت انجام شد";
    case "CanceledByUser":
      return "پرداخت توسط کاربر لغو شد";
    case "Failed":
      return "پرداخت ناموفق بود";
    case "SessionIsNull":
    case "InvalidParameters":
      return "پارامترهای ارسالی به درگاه نامعتبر بود";
    case "MerchantIpInvalid":
      return "آدرس IP پذیرنده نامعتبر است";
    case "TokenNotFound":
    case "TokenRequired":
      return "توکن پرداخت نامعتبر یا منقضی شده";
    case "TerminalNotFound":
      return "ترمینال یافت نشد";
    default:
      return "خطای نامشخص در پرداخت";
  }
}
