import { NextResponse } from "next/server";
import { checkOtpRateLimit, generateOtp, recordOtpSent } from "@/lib/db";
import { faDigits, toEnglishDigits } from "@/lib/formatting";
import { sendOtpSms } from "@/lib/sms";
import { allow, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Per-IP cap that's independent of phone number. Without this an
    // attacker can iterate thousands of phones from a single IP and either
    // burn our Kavenegar credit or reconnaissance-spray OTPs across
    // population-level phone lists.
    const ip = clientIp(req);
    if (!allow(`otp-send:${ip}`, { windowMs: 60_000, max: 10 })) {
      return NextResponse.json(
        { error: "درخواست‌های شما زیاد است. کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { phone: rawPhone } = await req.json();
    const phone = typeof rawPhone === "string" ? toEnglishDigits(rawPhone).replace(/\D/g, "") : "";
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }

    const limit = checkOtpRateLimit(phone);
    if (!limit.ok) {
      const msg =
        limit.reason === "cooldown"
          ? `برای دریافت کد تازه ${faDigits(limit.retryAfterSec)} ثانیه صبر کنید`
          : "سقف روزانه ارسال کد برای این شماره پر شده است";
      return NextResponse.json(
        { error: msg, retryAfterSec: limit.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const code = generateOtp();
    const expiresAt = Date.now() + 2 * 60 * 1000;

    const result = await sendOtpSms(phone, code);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "ارسال پیامک ناموفق بود" },
        { status: 502 }
      );
    }

    recordOtpSent(phone, { code, expiresAt, attempts: 0 });

    return NextResponse.json({
      success: true,
      devCode:
        result.simulated && process.env.NODE_ENV !== "production"
          ? code
          : undefined,
    });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
