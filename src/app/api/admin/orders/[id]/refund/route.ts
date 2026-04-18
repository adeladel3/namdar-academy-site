import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getOrder, logAudit, updateOrder } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (order.status !== "paid" && order.status !== "partial_refund")
    return NextResponse.json(
      { error: "سفارش در وضعیت قابل استرداد نیست" },
      { status: 400 }
    );

  let body: { amount?: number; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return NextResponse.json({ error: "مبلغ نامعتبر" }, { status: 400 });

  const alreadyRefunded = order.refundAmount ?? 0;
  const remaining = order.finalAmount - alreadyRefunded;
  if (amount > remaining)
    return NextResponse.json(
      { error: "مبلغ بیشتر از باقیمانده قابل استرداد است" },
      { status: 400 }
    );

  const totalRefunded = alreadyRefunded + amount;
  const status =
    totalRefunded >= order.finalAmount ? "refunded" : "partial_refund";

  updateOrder(id, {
    status,
    refundedAt: Date.now(),
    refundAmount: totalRefunded,
    refundReason: body.reason || order.refundReason,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "order.refund",
    targetType: "order",
    targetId: id,
    metadata: { amount, reason: body.reason },
  });

  return NextResponse.json({ success: true });
}
