import { NextResponse } from "next/server";
import { setSession, signTotpChallenge } from "@/lib/auth";
import {
  createUser,
  deleteOtp,
  findUserByPhone,
  generateId,
  getOtp,
  getReferralLink,
  getSalesAgentByCode,
  incrementLinkSignups,
  setOtp,
  touchUserLogin,
  updateUser,
} from "@/lib/db";
import { toEnglishDigits } from "@/lib/formatting";
import { allow, clientIp } from "@/lib/rate-limit";
import {
  readReferralCookie,
  readReferralLinkCookie,
} from "@/lib/referral";

export async function POST(req: Request) {
  try {
    // Per-IP cap on verify attempts. The per-phone record already blocks 5
    // wrong guesses against a single OTP, but an attacker can request a
    // fresh OTP for many phones and burn through the attempt budget. 30
    // verifies per IP per minute is loose enough for a legit user who
    // fat-fingers a code a few times while also catching scripted abuse.
    const ip = clientIp(req);
    if (!allow(`otp-verify:${ip}`, { windowMs: 60_000, max: 30 })) {
      return NextResponse.json(
        { error: "درخواست‌های شما زیاد است" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { phone: rawPhone, otp: rawOtp, name } = await req.json();
    const phone = typeof rawPhone === "string" ? toEnglishDigits(rawPhone).replace(/\D/g, "") : "";
    const otp = typeof rawOtp === "string" ? toEnglishDigits(rawOtp).replace(/\D/g, "") : "";
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }
    if (!/^\d{5,6}$/.test(otp)) {
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
    const isNewUser = !user;
    if (!user) {
      // Capture referral attribution before creating the user so we can
      // freeze it on the record. Looking up agent + link from the cookies
      // both ensures the values are still valid right now and lets us bump
      // the signup counter on the specific link the visitor used.
      const refCode = readReferralCookie(req);
      const linkId = readReferralLinkCookie(req);
      const agent = refCode ? getSalesAgentByCode(refCode) : undefined;
      const link = linkId ? getReferralLink(linkId) : undefined;
      const linkBelongsToAgent =
        agent && link && link.agentId === agent.id && link.isActive;
      const referralPatch =
        agent && agent.isActive
          ? {
              referredByAgentId: agent.id,
              referredByLinkId: linkBelongsToAgent ? link!.id : undefined,
              referredAt: Date.now(),
            }
          : {};

      user = createUser({
        id: generateId("u"),
        phone,
        name: (typeof name === "string" && name.trim()) || "کاربر",
        ...referralPatch,
      });

      // Only bump the signup counter on a successful new-user creation —
      // returning existing users don't count as fresh signups.
      if (linkBelongsToAgent) {
        incrementLinkSignups(link!.id);
      }
    } else if (typeof name === "string" && name.trim() && user.name === "کاربر") {
      user = updateUser(user.id, { name: name.trim() }) ?? user;
    }
    void isNewUser;

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

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return NextResponse.json({
        success: true,
        requiresTotp: true,
        challenge: signTotpChallenge(user.id),
      });
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
