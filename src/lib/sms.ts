import { getSettingsGroup } from "@/lib/db";

type SmsSettings = {
  provider?: string;
  apiKey?: string;
  senderLine?: string;
  otpTemplate?: string;
  otpPatternName?: string;
};

export type SendSmsResult = {
  ok: boolean;
  simulated?: boolean;
  error?: string;
  statusCode?: number;
  messageId?: string | number;
};

// ترجمه پاسخ‌های کاوه‌نگار بر اساس کد وضعیت (return.status)
const KAVENEGAR_STATUS_FA: Record<number, string> = {
  200: "عملیات موفق بود",
  400: "یکی از پارامترهای ارسالی درست نیست",
  401: "کلید دسترسی کاوه‌نگار معتبر نیست",
  402: "محدودیت در ارسال روزانه — با پشتیبانی کاوه‌نگار تماس بگیرید",
  403: "کلید دسترسی کاوه‌نگار غیرفعال شده است",
  404: "این روش ارسال پشتیبانی نمی‌شود",
  405: "روش درخواست (GET/POST) اشتباه است",
  406: "پارامترهای اجباری درخواست خالی است",
  407: "دسترسی به این سرویس برای شما فعال نیست",
  411: "شماره گیرنده نامعتبر است",
  412: "شماره فرستنده نامعتبر است",
  413: "متن پیام نامعتبر است یا از کاراکترهای غیرمجاز دارد",
  414: "حجم درخواست از حد مجاز بیشتر است",
  415: "متن پیام خالی است",
  416: "آی‌پی سرور اجازه دسترسی به کاوه‌نگار را ندارد",
  417: "کد زبان انتخابی صحیح نیست",
  418: "اعتبار حساب کاوه‌نگار شما کافی نیست — لطفاً شارژ کنید",
  422: "داده‌های ارسال شده نامعتبر است",
  424: "الگوی تایید شده با این نام در کاوه‌نگار پیدا نشد",
  426: "این سرویس نیاز به فعال‌سازی ویژه در پنل کاوه‌نگار دارد",
  428: "کد پستی ارسال شده نادرست است",
  429: "آی‌پی سرور اجازه دسترسی به این روش را ندارد",
  431: "ساختار کد پیگیری نادرست است",
  432: "کد پیگیری تکراری است",
  451: "شماره فرستنده معتبر نیست",
  452: "تعداد شماره‌های گیرنده نامعتبر است",
  501: "سرور کاوه‌نگار در دسترس نیست — لحظاتی بعد دوباره تلاش کنید",
};

export function translateKavenegarStatus(
  status: number | undefined,
  fallback?: string
): string {
  if (typeof status === "number" && KAVENEGAR_STATUS_FA[status]) {
    return KAVENEGAR_STATUS_FA[status];
  }
  if (fallback) return fallback;
  if (typeof status === "number") {
    return `خطای ارسال پیامک (کد ${status})`;
  }
  return "ارسال پیامک ناموفق بود";
}

function readSettings(): SmsSettings {
  const dbSettings = getSettingsGroup("sms.") as SmsSettings;
  return {
    provider: dbSettings.provider || "kavenegar",
    apiKey: dbSettings.apiKey || process.env.SMS_API_KEY || undefined,
    senderLine: dbSettings.senderLine || process.env.SMS_SENDER_LINE || undefined,
    otpTemplate: dbSettings.otpTemplate || undefined,
    otpPatternName:
      dbSettings.otpPatternName || process.env.SMS_OTP_PATTERN || undefined,
  };
}

function renderTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? "");
}

type KavenegarResponse = {
  return?: { status: number; message: string };
  entries?: { messageid?: number }[] | null;
};

async function callKavenegar(url: string): Promise<KavenegarResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    return (await res.json().catch(() => null)) as KavenegarResponse | null;
  } finally {
    clearTimeout(timeout);
  }
}

function isNetworkError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message || "";
  if (e.name === "AbortError") return true;
  return (
    /fetch failed|ENOTFOUND|ECONNREFUSED|ENETUNREACH|EAI_AGAIN|ETIMEDOUT|timeout/i.test(
      msg
    ) ||
    // Node fetch wraps the underlying error in cause
    !!(e as { cause?: { code?: string } }).cause?.code
  );
}

function resultFromKavenegar(data: KavenegarResponse | null): SendSmsResult {
  const status = data?.return?.status;
  if (status === 200) {
    const entry = Array.isArray(data?.entries) ? data.entries[0] : undefined;
    return { ok: true, statusCode: 200, messageId: entry?.messageid };
  }
  return {
    ok: false,
    statusCode: status,
    error: translateKavenegarStatus(status, data?.return?.message),
  };
}

async function sendViaKavenegarPattern(
  apiKey: string,
  phone: string,
  code: string,
  template: string
): Promise<SendSmsResult> {
  const url = `https://api.kavenegar.com/v1/${encodeURIComponent(
    apiKey
  )}/verify/lookup.json?receptor=${encodeURIComponent(
    phone
  )}&token=${encodeURIComponent(code)}&template=${encodeURIComponent(template)}`;
  return resultFromKavenegar(await callKavenegar(url));
}

async function sendViaKavenegarSms(
  apiKey: string,
  phone: string,
  message: string,
  sender?: string
): Promise<SendSmsResult> {
  const params = new URLSearchParams({ receptor: phone, message });
  if (sender) params.set("sender", sender);
  const url = `https://api.kavenegar.com/v1/${encodeURIComponent(
    apiKey
  )}/sms/send.json?${params.toString()}`;
  return resultFromKavenegar(await callKavenegar(url));
}

export type KavenegarAccountInfo =
  | {
      ok: true;
      remainingCredit: number;
      expireDate?: string;
      type?: string;
    }
  | { ok: false; error: string };

export async function getKavenegarAccountInfo(): Promise<KavenegarAccountInfo> {
  const s = readSettings();
  if (!s.apiKey) {
    return { ok: false, error: "کلید دسترسی کاوه‌نگار تنظیم نشده است" };
  }
  try {
    const url = `https://api.kavenegar.com/v1/${encodeURIComponent(
      s.apiKey
    )}/account/info.json`;
    const data = (await callKavenegar(url)) as
      | (KavenegarResponse & {
          entries?:
            | { remaincredit?: number; expiredate?: string; type?: string }
            | null;
        })
      | null;
    if (data?.return?.status === 200) {
      const entry = data?.entries as
        | { remaincredit?: number; expiredate?: string; type?: string }
        | undefined;
      return {
        ok: true,
        remainingCredit: Math.floor(entry?.remaincredit ?? 0),
        expireDate: entry?.expiredate,
        type: entry?.type,
      };
    }
    return {
      ok: false,
      error: translateKavenegarStatus(data?.return?.status, data?.return?.message),
    };
  } catch (e) {
    if (isNetworkError(e)) {
      console.error("[sms] kavenegar account-info network error:", e);
      return {
        ok: false,
        error:
          "سرور کاوه‌نگار از این آی‌پی در دسترس نیست (احتمالاً آی‌پی خارج از ایران یا وی‌پی‌ان).",
      };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "خطا در اتصال به کاوه‌نگار",
    };
  }
}

const isProd = () => process.env.NODE_ENV === "production";

function networkErrorResult(e: unknown, devLog: () => void): SendSmsResult {
  if (!isProd()) {
    devLog();
    return { ok: true, simulated: true };
  }
  // جزئیات فنی (مثل "This operation was aborted") را به کاربر نشان نمی‌دهیم؛
  // فقط در لاگ سرور می‌رود تا اوپراتور بتواند پیگیری کند.
  console.error("[sms] kavenegar network error:", e);
  return {
    ok: false,
    error:
      "در حال حاضر امکان ارسال پیامک تأیید وجود ندارد. لطفاً چند لحظه دیگر دوباره تلاش کنید.",
  };
}

export async function sendOtpSms(
  phone: string,
  code: string
): Promise<SendSmsResult> {
  const s = readSettings();

  if (!s.apiKey) {
    if (!isProd()) console.log(`[DEV-OTP] ${phone} → ${code}`);
    return { ok: true, simulated: true };
  }

  if ((s.provider || "kavenegar") !== "kavenegar") {
    return { ok: false, error: `ارائه‌دهنده «${s.provider}» هنوز پیاده‌سازی نشده` };
  }

  try {
    if (s.otpPatternName) {
      return await sendViaKavenegarPattern(s.apiKey, phone, code, s.otpPatternName);
    }
    const message = renderTemplate(
      s.otpTemplate || "کد ورود شما به {{brand}}: {{code}}",
      { code, brand: "نامدار آکادمی" }
    );
    return await sendViaKavenegarSms(s.apiKey, phone, message, s.senderLine);
  } catch (e) {
    if (isNetworkError(e)) {
      return networkErrorResult(e, () =>
        console.log(`[DEV-OTP-FALLBACK] ${phone} → ${code} (کاوه‌نگار در دسترس نیست)`)
      );
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "خطا در اتصال به کاوه‌نگار",
    };
  }
}

export async function sendTestSms(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  const s = readSettings();
  if (!s.apiKey) {
    if (!isProd()) console.log(`[DEV-SMS] ${phone} → ${message}`);
    return { ok: true, simulated: true };
  }
  if ((s.provider || "kavenegar") !== "kavenegar") {
    return { ok: false, error: `ارائه‌دهنده «${s.provider}» هنوز پیاده‌سازی نشده` };
  }
  try {
    return await sendViaKavenegarSms(s.apiKey, phone, message, s.senderLine);
  } catch (e) {
    if (isNetworkError(e)) {
      return networkErrorResult(e, () =>
        console.log(`[DEV-SMS-FALLBACK] ${phone} → ${message} (کاوه‌نگار در دسترس نیست)`)
      );
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "خطا در اتصال به کاوه‌نگار",
    };
  }
}
