import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/db";
import { toEnglishDigits } from "@/lib/formatting";
import { sendTestSms } from "@/lib/sms";

// In-memory rate limiter: at most 3 test SMS per admin per minute, and a
// 60-second cooldown between sends. Kavenegar charges per message — a rogue
// or compromised admin looping this endpoint can rack up a large bill fast.
const recentByAdmin = new Map<string, number[]>();
const MAX_PER_MIN = 3;

function allow(userId: string): boolean {
  const now = Date.now();
  const prev = recentByAdmin.get(userId) ?? [];
  const fresh = prev.filter((t) => now - t < 60_000);
  if (fresh.length >= MAX_PER_MIN) return false;
  fresh.push(now);
  recentByAdmin.set(userId, fresh);
  return true;
}

export async function POST(req: Request) {
  // Was requireStaff — only admins should be able to send from company SMS
  // credit. Support role does not need this tool.
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  if (!allow(guard.session.userId)) {
    return NextResponse.json(
      { error: "تعداد ارسال تست در یک دقیقه از حد مجاز عبور کرده. دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const phone = toEnglishDigits(body.phone?.trim() ?? "").replace(/\D/g, "");
  if (!phone || !/^09\d{9}$/.test(phone))
    return NextResponse.json({ error: "شماره نامعتبر" }, { status: 400 });

  const result = await sendTestSms(
    phone,
    "این پیامک تست از نامدار آکادمی است."
  );

  logAudit({
    actorId: guard.session.userId,
    action: "sms.test",
    targetType: "sms",
    targetId: phone,
  });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error ?? "ارسال ناموفق" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    message: result.simulated
      ? `پیامک تست شبیه‌سازی شد (کلید کاوه‌نگار ثبت نشده). ${phone}`
      : `پیامک تست به ${phone} ارسال شد.`,
  });
}
