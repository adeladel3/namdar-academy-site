/**
 * Saman Electronic Payment (SEP) — درگاه سپ بانک سامان
 * Implements the merchant integration described in SEP's official "راهنمای
 * استفاده از درگاه پرداخت اینترنتی" (نگارش 3.6, دی 1404).
 *
 * Flow:
 *   1) requestToken({amountRial, orderId, callbackUrl}) → { token, paymentUrl }
 *   2) redirect user to paymentUrl
 *   3) bank POSTs back to RedirectUrl with State/Status/RefNum/ResNum/...
 *   4) verifyTransaction({refNum}) — must be called within 30 minutes; otherwise SEP auto-reverses
 *   5) reverseTransaction({refNum}) — within 50 minutes after verify, to refund
 *
 * Amount unit: Rial (10 Rial = 1 Toman). Multiply Toman × 10.
 * Limits per SEP rules: min 2,000 Rial, max 4,000,000,000 Rial (daily ceiling).
 *
 * توجه: درگاه نسل جدید سپ (pg-neo / neo-pg.sep.ir / blubank) به‌صراحت
 * غیرفعال است. هدر `X-IPG-Url` که از طرف سپ برای هدایت به neo-pg ارسال
 * می‌شود نادیده گرفته می‌شود و کاربر همیشه به `SEP_START_URL` کلاسیک
 * (sep.shaparak.ir/OnlinePG/SendToken) منتقل می‌شود.
 */

export const SEP_TOKEN_URL =
  process.env.SEP_TOKEN_URL ?? "https://sep.shaparak.ir/onlinepg/onlinepg";
export const SEP_START_URL =
  process.env.SEP_START_URL ?? "https://sep.shaparak.ir/OnlinePG/SendToken";
export const SEP_VERIFY_URL =
  process.env.SEP_VERIFY_URL ??
  "https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTransaction";
export const SEP_REVERSE_URL =
  process.env.SEP_REVERSE_URL ??
  "https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/ReverseTransaction";

export const SEP_MIN_AMOUNT_RIAL = 2_000;
export const SEP_MAX_AMOUNT_RIAL = 4_000_000_000;

import { getSetting } from "@/lib/db";

/** Read terminal ID from settings first, then fall back to env. */
function readTerminalId(): string {
  const fromSettings = getSetting<string>("payment.sepTerminalId");
  if (typeof fromSettings === "string" && fromSettings.trim())
    return fromSettings.trim();
  return process.env.SEP_TERMINAL_ID ?? "";
}

/**
 * Public base URL used to build the bank callback (RedirectUrl).
 *
 * SEP rejects any RedirectUrl whose host doesn't match the domain registered
 * for the terminal in the merchant contract. `localhost` is never accepted;
 * sub-domains must be whitelisted explicitly with SEP support.
 *
 * Resolution order:
 *   1. `payment.callbackBaseUrl` admin setting (per-environment override)
 *   2. `NEXT_PUBLIC_SITE_URL` env var — only if it is not localhost
 *   3. fallback to the request origin (works only in dev)
 */
/** آیا یک URL به‌سمت localhost / IP خصوصی اشاره می‌کند؟ */
function isLocalUrl(url: string): boolean {
  return /\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|::1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i.test(
    url,
  );
}

export function getPublicBaseUrl(reqUrl: string): string {
  // تنظیم ادمین اولویت دارد — اما اگر اشتباه روی localhost ست شده باشد
  // در پروداکشن آن را نادیده می‌گیریم. ارسال RedirectUrl=http://localhost:3000
  // به سپ باعث خطای «عدم همخوانی آدرس ارجاع دهنده» می‌شود.
  const fromSettings = getSetting<string>("payment.callbackBaseUrl");
  if (typeof fromSettings === "string" && fromSettings.trim()) {
    const v = fromSettings.trim().replace(/\/+$/, "");
    if (!(process.env.NODE_ENV === "production" && isLocalUrl(v))) {
      return v;
    }
    console.error(
      "[saman] payment.callbackBaseUrl روی localhost ست شده؛ در پروداکشن نادیده گرفته می‌شود."
    );
  }
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !isLocalUrl(fromEnv)) {
    return fromEnv.replace(/\/+$/, "");
  }
  // در پروداکشن هرگز به origin از reqUrl اعتماد نمی‌کنیم؛ اگر nginx به‌اشتباه
  // X-Forwarded-Host را پاس نکرده باشد، origin از 127.0.0.1:3000 خوانده می‌شود
  // و کالبک به سپ نامعتبر می‌رود.
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[saman] getPublicBaseUrl: نه payment.callbackBaseUrl معتبر ست شده و " +
        "نه NEXT_PUBLIC_SITE_URL غیر-localhost است. در /admin/settings/payment تنظیم کنید."
    );
    // مقدار امن پیش‌فرض: دامنه‌ی ثبت‌شده در قرارداد سپ.
    return "https://namdaracademy.com";
  }
  try {
    return new URL(reqUrl).origin;
  } catch {
    return "";
  }
}

export function isSepConfigured() {
  return readTerminalId().length > 0;
}

export type SepTokenOk = { ok: true; token: string; paymentUrl: string };
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
  if (!Number.isFinite(params.amountRial) || params.amountRial < SEP_MIN_AMOUNT_RIAL) {
    return {
      ok: false,
      code: "AMOUNT_TOO_LOW",
      message: `حداقل مبلغ پرداخت ${SEP_MIN_AMOUNT_RIAL.toLocaleString("fa-IR")} ریال است`,
    };
  }
  if (params.amountRial > SEP_MAX_AMOUNT_RIAL) {
    return {
      ok: false,
      code: "AMOUNT_TOO_HIGH",
      message: "مبلغ پرداخت بیش از سقف مجاز روزانه است",
    };
  }
  if (!/^https?:\/\//i.test(params.callbackUrl)) {
    return {
      ok: false,
      code: "BAD_CALLBACK",
      message: "آدرس بازگشت نامعتبر است",
    };
  }
  // در پروداکشن هرگز نباید RedirectUrl روی localhost برود — سپ خطای
  // «عدم همخوانی آدرس ارجاع دهنده» می‌دهد. اگر چنین چیزی به این جا رسید
  // یا با fallback به دامنه‌ی رسمی جایگزین می‌کنیم یا تراکنش را رد می‌کنیم.
  if (isLocalUrl(params.callbackUrl)) {
    if (process.env.NODE_ENV === "production") {
      const fixed = params.callbackUrl.replace(
        /^https?:\/\/(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|0\.0\.0\.0(:\d+)?)/i,
        "https://namdaracademy.com",
      );
      console.warn(
        `[saman] RedirectUrl روی localhost بود؛ به ${fixed} اصلاح شد.`,
      );
      params = { ...params, callbackUrl: fixed };
    } else {
      return {
        ok: false,
        code: "LOCALHOST_CALLBACK",
        message:
          "آدرس بازگشت روی localhost است؛ سپ این تراکنش را رد می‌کند. در /admin/settings/payment فیلد «آدرس عمومی سایت» را با دامنه‌ی واقعی پر کنید.",
      };
    }
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
  // درگاه نسل جدید سپ (pg-neo / neo-pg.sep.ir) به درخواست صاحب پروژه
  // غیرفعال است. حتی اگر سپ هدر X-IPG-Url را برای هدایت به neo-pg ارسال
  // کرده باشد، آن را نادیده می‌گیریم و کاربر را به مسیر کلاسیک می‌فرستیم.
  const startBase = SEP_START_URL;

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
    return {
      ok: true,
      token: data.token,
      paymentUrl: `${startBase}?token=${encodeURIComponent(data.token)}`,
    };
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
  rrn?: string;
  maskedPan?: string;
  hashedPan?: string;
  straceNo?: string;
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
        // SEP verify endpoint expects TerminalNumber as a number, not string.
        TerminalNumber: Number(readTerminalId()),
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
      // SEP docs use this misspelling; we keep both for safety.
      OrginalAmount?: number;
      OrigAmount?: number;
      StraceNo?: string;
      RRN?: string;
      MaskedPan?: string;
      HashedPan?: string;
    };
  };
  try {
    data = await res.json();
  } catch {
    return { ok: false, code: "BAD_JSON", message: "پاسخ نامعتبر از درگاه" };
  }
  // ResultCode 0 = success; 2 = duplicate request (already verified earlier — still authoritative).
  if (data.Success && (data.ResultCode === 0 || data.ResultCode === 2)) {
    const td = data.TransactionDetail ?? {};
    return {
      ok: true,
      refNum: params.refNum,
      amountRial:
        td.AffectiveAmount ?? td.OrginalAmount ?? td.OrigAmount ?? 0,
      resultCode: data.ResultCode,
      rrn: td.RRN,
      maskedPan: td.MaskedPan,
      hashedPan: td.HashedPan,
      straceNo: td.StraceNo,
    };
  }
  return {
    ok: false,
    code: String(data.ResultCode ?? "UNKNOWN"),
    message: data.ResultDescription ?? "تراکنش تأیید نشد",
  };
}

export type SepReverseResult =
  | { ok: true; refNum: string; resultCode: number }
  | { ok: false; code: string; message: string };

/** Reverse (refund) a previously-verified transaction. Must be called within
 *  ~50 minutes of the original transaction, per SEP rules. */
export async function reverseTransaction(params: {
  refNum: string;
}): Promise<SepReverseResult> {
  if (!isSepConfigured()) {
    return { ok: false, code: "NO_TERMINAL", message: "ترمینال سپ پیکربندی نشده" };
  }
  let res: Response;
  try {
    res = await fetch(SEP_REVERSE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        RefNum: params.refNum,
        TerminalNumber: Number(readTerminalId()),
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
  };
  try {
    data = await res.json();
  } catch {
    return { ok: false, code: "BAD_JSON", message: "پاسخ نامعتبر از درگاه" };
  }
  if (data.Success && data.ResultCode === 0) {
    return { ok: true, refNum: params.refNum, resultCode: 0 };
  }
  return {
    ok: false,
    code: String(data.ResultCode ?? "UNKNOWN"),
    message: data.ResultDescription ?? "اصلاحیه تراکنش انجام نشد",
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
    case "TokenNotFound":
    case "TokenRequired":
      return "توکن پرداخت نامعتبر یا منقضی شده";
    case "TerminalNotFound":
      return "ترمینال یافت نشد";
    case "MultisettlePolicyErrors":
      return "محدودیت‌های مدل چندحسابی رعایت نشده";
    default:
      return "خطای نامشخص در پرداخت";
  }
}
