import { NextResponse } from "next/server";
import { generateOtp, otpStore } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (typeof phone !== "string" || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }

    const code = generateOtp();
    const expiresAt = Date.now() + 2 * 60 * 1000;
    otpStore.set(phone, { code, expiresAt, attempts: 0 });

    // TODO: integrate SMS provider (Kavenegar / SMS.ir)
    // For dev, log the OTP to the server console.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV-OTP] ${phone} → ${code}`);
    }

    return NextResponse.json({
      success: true,
      // NEVER include `code` in production responses
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
