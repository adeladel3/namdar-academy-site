import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUser, updateUser } from "@/lib/db";
import { verifyTotp } from "@/lib/totp";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد نشده‌اید" }, { status: 401 });
  }
  try {
    const { code } = await req.json();
    if (typeof code !== "string") {
      return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
    }

    const user = getUser(session.userId);
    if (!user) {
      return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });
    }
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "شناسه‌ساز فعال نیست" },
        { status: 409 }
      );
    }

    if (!verifyTotp(user.twoFactorSecret, code)) {
      return NextResponse.json(
        { error: "کد وارد‌شده نامعتبر است" },
        { status: 400 }
      );
    }

    updateUser(user.id, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
