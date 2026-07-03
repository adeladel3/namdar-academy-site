import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getCourse, getUser, listAllOrders } from "@/lib/db";
import { csvCell, csvRow } from "@/lib/csv";

export async function GET(req: Request) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;

  const orders = listAllOrders();
  const header = [
    "id",
    "created_at",
    "paid_at",
    "user_name",
    "phone",
    "course_slug",
    "course_title",
    "amount",
    "discount",
    "final",
    "status",
    "method",
    "ref_num",
    "refunded",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const o of orders) {
    const u = getUser(o.userId);
    const c = getCourse(o.courseSlug);
    lines.push(
      csvRow([
        o.id,
        new Date(o.createdAt).toISOString(),
        o.paidAt ? new Date(o.paidAt).toISOString() : "",
        u?.name ?? "",
        u?.phone ?? "",
        o.courseSlug,
        c?.title ?? "",
        o.amount,
        o.discountAmount,
        o.finalAmount,
        o.status,
        o.paymentMethod,
        o.refNum ?? "",
        o.refundAmount ?? "",
      ])
    );
  }
  const body = "\uFEFF" + lines.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
