import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getOrder, logAudit, updateOrder } from "@/lib/db";

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
  if (order.status === "paid")
    return NextResponse.json(
      { error: "سفارش پرداخت‌شده را نمی‌توان لغو کرد؛ از استرداد استفاده کنید" },
      { status: 400 }
    );

  updateOrder(id, { status: "failed" });
  logAudit({
    actorId: guard.session.userId,
    action: "order.cancel",
    targetType: "order",
    targetId: id,
  });
  return NextResponse.json({ success: true });
}
