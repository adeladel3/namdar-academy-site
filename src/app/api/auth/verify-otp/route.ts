import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import {
  generateId,
  otpStore,
  userStore,
  type UserRecord,
} from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { phone, otp, name } = await req.json();
    if (typeof phone !== "string" || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }
    if (typeof otp !== "string" || !/^\d{5,6}$/.test(otp)) {
      return NextResponse.json(
        { error: "کد تایید معتبر نیست" },
        { status: 400 }
      );
    }

    const record = otpStore.get(phone);
    if (!record) {
      return NextResponse.json(
        { error: "کدی برای این شماره ارسال نشده است" },
        { status: 400 }
      );
    }
    if (record.expiresAt < Date.now()) {
      otpStore.delete(phone);
      return NextResponse.json(
        { error: "کد منقضی شده. لطفاً دوباره درخواست کد بدهید" },
        { status: 400 }
      );
    }
    if (record.attempts >= 5) {
      otpStore.delete(phone);
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    if (record.code !== otp) {
      record.attempts += 1;
      return NextResponse.json({ error: "کد نامعتبر است" }, { status: 400 });
    }

    // OTP is valid — clear it and upsert user
    otpStore.delete(phone);

    let user: UserRecord | undefined = [...userStore.values()].find(
      (u) => u.phone === phone
    );
    if (!user) {
      user = {
        id: generateId(),
        phone,
        name: (typeof name === "string" && name.trim()) || "کاربر",
        role: "user",
      };
      userStore.set(user.id, user);
    } else if (typeof name === "string" && name.trim() && user.name === "کاربر") {
      user.name = name.trim();
    }

    await setSession({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
