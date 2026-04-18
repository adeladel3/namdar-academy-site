import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import {
  createUser,
  deleteOtp,
  findUserByPhone,
  generateId,
  getOtp,
  setOtp,
  touchUserLogin,
  updateUser,
} from "@/lib/db";

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

    const record = getOtp(phone);
    if (!record) {
      return NextResponse.json(
        { error: "کدی برای این شماره ارسال نشده است" },
        { status: 400 }
      );
    }
    if (record.expiresAt < Date.now()) {
      deleteOtp(phone);
      return NextResponse.json(
        { error: "کد منقضی شده. لطفاً دوباره درخواست کد بدهید" },
        { status: 400 }
      );
    }
    if (record.attempts >= 5) {
      deleteOtp(phone);
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است" },
        { status: 429 }
      );
    }

    if (record.code !== otp) {
      setOtp(phone, { ...record, attempts: record.attempts + 1 });
      return NextResponse.json({ error: "کد نامعتبر است" }, { status: 400 });
    }

    deleteOtp(phone);

    let user = findUserByPhone(phone);
    if (!user) {
      user = createUser({
        id: generateId("u"),
        phone,
        name: (typeof name === "string" && name.trim()) || "کاربر",
      });
    } else if (typeof name === "string" && name.trim() && user.name === "کاربر") {
      user = updateUser(user.id, { name: name.trim() }) ?? user;
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

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
