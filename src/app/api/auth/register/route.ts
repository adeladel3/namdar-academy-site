import { NextResponse } from "next/server";
import { generateOtp, setOtp } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { phone, name } = await req.json();
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ error: "نام کامل وارد کنید" }, { status: 400 });
    }
    if (typeof phone !== "string" || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }

    const code = generateOtp();
    setOtp(phone, {
      code,
      expiresAt: Date.now() + 2 * 60 * 1000,
      attempts: 0,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV-OTP] ${phone} → ${code} (register name: ${name})`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
