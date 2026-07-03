import { NextResponse } from "next/server";
import { signSeminarChallenge } from "@/lib/auth";
import {
  checkOtpRateLimit,
  generateOtp,
  getSeminar,
  recordOtpSent,
} from "@/lib/db";
import { faDigits, toEnglishDigits } from "@/lib/formatting";
import { sendOtpSms } from "@/lib/sms";
import { allow, clientIp } from "@/lib/rate-limit";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * مرحله ۱ پاپ‌آپ رزرو سمینار:
 *   نام، کد ملی و شماره موبایل را می‌گیرد، اعتبارسنجی می‌کند، OTP ارسال می‌کند
 *   و یک challenge امضاشده برمی‌گرداند که اطلاعات را تا مرحله ۲ نگه می‌دارد.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = clientIp(req);
    if (!allow(`seminar-reserve-start:${ip}`, { windowMs: 60_000, max: 10 })) {
      return NextResponse.json(
        { error: "درخواست‌های شما زیاد است. کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { slug: rawSlug } = await ctx.params;
    const slug = safeDecode(rawSlug);
    const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
    if (!seminar) {
      return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });
    }
    if (seminar.status !== "published" || !seminar.allowPurchase) {
      return NextResponse.json(
        { error: "این سمینار در حال حاضر قابل رزرو نیست" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as {
      fullName?: string;
      nationalId?: string;
      phone?: string;
    };

    const fullName = body.fullName?.trim() ?? "";
    const nationalId = toEnglishDigits(body.nationalId ?? "").replace(/\D/g, "");
    const phone = toEnglishDigits(body.phone ?? "").replace(/\D/g, "");

    if (fullName.length < 3) {
      return NextResponse.json(
        { error: "نام و نام خانوادگی را کامل وارد کنید" },
        { status: 400 }
      );
    }
    if (!/^\d{10}$/.test(nationalId)) {
      return NextResponse.json(
        { error: "کد ملی باید ۱۰ رقم باشد" },
        { status: 400 }
      );
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

    const smsResult = await sendOtpSms(phone, code);
    if (!smsResult.ok) {
      return NextResponse.json(
        { error: smsResult.error ?? "ارسال پیامک ناموفق بود" },
        { status: 502 }
      );
    }

    recordOtpSent(phone, { code, expiresAt, attempts: 0 });

    const challenge = signSeminarChallenge({
      seminarSlug: seminar.slug,
      fullName,
      nationalId,
      phone,
    });

    return NextResponse.json({
      success: true,
      challenge,
      devCode:
        smsResult.simulated && process.env.NODE_ENV !== "production"
          ? code
          : undefined,
    });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
