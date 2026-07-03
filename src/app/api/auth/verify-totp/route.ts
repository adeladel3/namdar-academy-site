import { NextResponse } from "next/server";
import { setSession, verifyTotpChallenge } from "@/lib/auth";
import { getUser, touchUserLogin } from "@/lib/db";
import { toEnglishDigits } from "@/lib/formatting";
import { verifyTotp } from "@/lib/totp";

export async function POST(req: Request) {
  try {
    const { challenge, code: rawCode } = await req.json();
    const code = typeof rawCode === "string" ? toEnglishDigits(rawCode).replace(/\D/g, "") : "";
    if (typeof challenge !== "string" || !code) {
      return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
    }

    const userId = verifyTotpChallenge(challenge);
    if (!userId) {
      return NextResponse.json(
        { error: "نشست تایید منقضی شده. دوباره تلاش کنید" },
        { status: 400 }
      );
    }

    const user = getUser(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });
    }
    if (user.status === "disabled") {
      return NextResponse.json(
        { error: "حساب کاربری غیرفعال است" },
        { status: 403 }
      );
    }

    if (!verifyTotp(user.twoFactorSecret, code)) {
      return NextResponse.json(
        { error: "کد شناسه‌ساز نامعتبر است" },
        { status: 400 }
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
