import { NextResponse } from "next/server";
import { checkOtpRateLimit, generateOtp, recordOtpSent } from "@/lib/db";
import { faDigits, toEnglishDigits } from "@/lib/formatting";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { phone: rawPhone, name } = await req.json();
    const phone = typeof rawPhone === "string" ? toEnglishDigits(rawPhone).replace(/\D/g, "") : "";
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ error: "نام کامل وارد کنید" }, { status: 400 });
    }
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
