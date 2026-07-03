import { NextResponse } from "next/server";
import { setSession, verifySeminarChallenge } from "@/lib/auth";
import {
  createUser,
  deleteOtp,
  findUserByPhone,
  generateId,
  getOtp,
  getSeminar,
  setOtp,
  touchUserLogin,
  updateUser,
} from "@/lib/db";
import { toEnglishDigits } from "@/lib/formatting";
import { allow, clientIp } from "@/lib/rate-limit";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * مرحله ۲ پاپ‌آپ رزرو سمینار:
 *   کد OTP را تأیید می‌کند، در صورت نبود کاربر حساب می‌سازد، و session
 *   را ست می‌کند. خود اطلاعات شناسنامه‌ای از challenge بازخوانی می‌شود
 *   و در پاسخ به سمت کلاینت ارسال نمی‌شود (کلاینت آن را در state دارد).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = clientIp(req);
    if (!allow(`seminar-reserve-verify:${ip}`, { windowMs: 60_000, max: 30 })) {
      return NextResponse.json(
        { error: "درخواست‌های شما زیاد است" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { slug: rawSlug } = await ctx.params;
    const slug = safeDecode(rawSlug);
    const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
    if (!seminar) {
      return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });
    }

    const body = (await req.json()) as {
      challenge?: string;
      otp?: string;
    };

    const payload = verifySeminarChallenge(body.challenge ?? "");
    if (!payload) {
      return NextResponse.json(
        { error: "نشست رزرو منقضی شده است. لطفاً از ابتدا تلاش کنید." },
        { status: 400 }
      );
    }
    if (payload.seminarSlug !== seminar.slug) {
      return NextResponse.json({ error: "نشست نامعتبر" }, { status: 400 });
    }

    const otp = toEnglishDigits(body.otp ?? "").replace(/\D/g, "");
    if (!/^\d{5,6}$/.test(otp)) {
      return NextResponse.json({ error: "کد تایید نامعتبر است" }, { status: 400 });
    }

    const record = getOtp(payload.phone);
    if (!record) {
      return NextResponse.json(
        { error: "کدی برای این شماره ارسال نشده است" },
        { status: 400 }
      );
    }
    if (record.expiresAt < Date.now()) {
      deleteOtp(payload.phone);
      return NextResponse.json(
        { error: "کد منقضی شده. لطفاً دوباره درخواست کد بدهید" },
        { status: 400 }
      );
    }
    if (record.attempts >= 5) {
      deleteOtp(payload.phone);
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }
    if (record.code !== otp) {
      setOtp(payload.phone, { ...record, attempts: record.attempts + 1 });
      return NextResponse.json({ error: "کد نامعتبر است" }, { status: 400 });
    }

    deleteOtp(payload.phone);

    let user = findUserByPhone(payload.phone);
    if (!user) {
      // کاربر تازه — حساب جدید با نام شناسنامه‌ای می‌سازیم. اگر بعداً
      // login عادی کرد، نامش جدید‌تر می‌شود.
      user = createUser({
        id: generateId("u"),
        phone: payload.phone,
        name: payload.fullName,
      });
    } else if (
      (!user.name || user.name === "کاربر") &&
      payload.fullName.length >= 3
    ) {
      user = updateUser(user.id, { name: payload.fullName }) ?? user;
    }

    if (user.status === "disabled") {
      return NextResponse.json(
        {
          error:
            "حساب کاربری شما غیرفعال است" +
            (user.disabledReason ? ` — ${user.disabledReason}` : ""),
        },
        { status: 403 }
      );
    }

    touchUserLogin(user.id);
    await setSession({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
