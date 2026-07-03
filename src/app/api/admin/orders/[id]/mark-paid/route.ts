import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { enroll, getOrder, logAudit, updateOrder } from "@/lib/db";
import { ensureLicenseForEnrollment } from "@/lib/spotplayer";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  updateOrder(id, {
    status: "paid",
    paidAt: Date.now(),
    paymentMethod: "manual",
    refNum: order.refNum ?? `MANUAL-${id}`,
  });
  const enrollment = enroll(order.userId, order.courseSlug, {
    source: "purchase",
    orderId: id,
  });
  // دوره اسپات‌پلیر: ساخت لایسنس پس از تأیید دستی پرداخت (best-effort).
  try {
    await ensureLicenseForEnrollment(enrollment.id);
  } catch (e) {
    console.error("[spotplayer] ensure after mark-paid failed:", e);
  }

  logAudit({
    actorId: guard.session.userId,
    action: "order.mark-paid",
    targetType: "order",
    targetId: id,
  });

  return NextResponse.json({ success: true });
}
