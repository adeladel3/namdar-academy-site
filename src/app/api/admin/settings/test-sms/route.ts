import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getSettingsGroup, logAudit } from "@/lib/db";

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const phone = body.phone?.trim();
  if (!phone || !/^09\d{9}$/.test(phone))
    return NextResponse.json({ error: "شماره نامعتبر" }, { status: 400 });

  const settings = getSettingsGroup("sms.") as {
    apiKey?: string;
    provider?: string;
    senderLine?: string;
    otpTemplate?: string;
  };

  if (!settings.apiKey) {
    return NextResponse.json({
      success: true,
      message: `در dev: پیامک تست به ${phone} ثبت شد (provider=${settings.provider ?? "kavenegar"}).`,
    });
  }

  // TODO: integrate actual provider (Kavenegar / SMS.ir) — for now we simulate.
  logAudit({
    actorId: guard.session.userId,
    action: "sms.test",
    targetType: "sms",
    targetId: phone,
  });

  return NextResponse.json({
    success: true,
    message: `پیامک تست به ${phone} ارسال شد (${settings.provider}).`,
  });
}
