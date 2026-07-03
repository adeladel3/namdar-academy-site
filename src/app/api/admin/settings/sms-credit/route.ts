import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getKavenegarAccountInfo } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const info = await getKavenegarAccountInfo();
  if (!info.ok) {
    return NextResponse.json({ ok: false, error: info.error }, { status: 200 });
  }
  return NextResponse.json({
    ok: true,
    remainingCredit: info.remainingCredit,
    expireDate: info.expireDate,
    type: info.type,
  });
}
