import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, verifyTotpSetup } from "@/lib/auth";
import { getUser, updateUser } from "@/lib/db";
import { verifyTotp } from "@/lib/totp";

const SETUP_COOKIE = "totp_setup";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد نشده‌اید" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code : "";
    if (!code) {
      return NextResponse.json({ error: "کد نامعتبر" }, { status: 400 });
    }

    const user = getUser(session.userId);
    if (!user) {
      return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });
    }
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "شناسه‌ساز قبلاً فعال شده است" },
        { status: 409 }
      );
    }

    // Pull the secret from the setup cookie we set in /setup. Ignore any
    // `secret` a client sends in the body — that was the original
    // vulnerability (anyone could install their own authenticator).
    const store = await cookies();
    const setupToken = store.get(SETUP_COOKIE)?.value;
    if (!setupToken) {
      return NextResponse.json(
        { error: "ابتدا کد QR را از بخش راه‌اندازی بگیرید" },
        { status: 400 }
      );
    }
    const setup = verifyTotpSetup(setupToken, session.userId);
    if (!setup) {
      return NextResponse.json(
        { error: "زمان راه‌اندازی منقضی شده — دوباره شروع کنید" },
        { status: 400 }
      );
    }

    if (!verifyTotp(setup.secret, code)) {
      return NextResponse.json(
        { error: "کد وارد‌شده نامعتبر است" },
        { status: 400 }
      );
    }

    updateUser(user.id, {
      twoFactorEnabled: true,
      twoFactorSecret: setup.secret,
    });
    store.delete(SETUP_COOKIE);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
