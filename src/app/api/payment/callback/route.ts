import { NextResponse } from "next/server";
import { enroll, getOrder, updateOrder } from "@/lib/db";
import {
  isSepConfigured,
  sepStateMessage,
  tomanToRial,
  verifyTransaction,
} from "@/lib/saman";

async function handle(req: Request, fields: URLSearchParams) {
  const origin = new URL(req.url).origin;
  const orderId = fields.get("ResNum") ?? fields.get("orderId");
  const state = fields.get("State");
  const refNum = fields.get("RefNum");

  if (!orderId) {
    return NextResponse.redirect(
      new URL("/dashboard?payment=error&reason=missing_order", origin)
    );
  }
  const order = getOrder(orderId);
  if (!order) {
    return NextResponse.redirect(
      new URL("/dashboard?payment=error&reason=order_not_found", origin)
    );
  }

  if (state !== "OK" || !refNum) {
    updateOrder(orderId, { status: "failed" });
    const reason = encodeURIComponent(sepStateMessage(state));
    return NextResponse.redirect(
      new URL(
        `/dashboard?payment=failed&order=${orderId}&reason=${reason}`,
        origin
      )
    );
  }

  const expectedRial = tomanToRial(order.finalAmount);
  const reportedAmount = Number(
    fields.get("AffectiveAmount") ?? fields.get("Amount") ?? 0
  );
  if (reportedAmount && reportedAmount !== expectedRial) {
    updateOrder(orderId, { status: "failed" });
    return NextResponse.redirect(
      new URL(
        `/dashboard?payment=failed&order=${orderId}&reason=${encodeURIComponent(
          "مبلغ تراکنش با سفارش مطابقت ندارد"
        )}`,
        origin
      )
    );
  }

  if (isSepConfigured()) {
    const v = await verifyTransaction({ refNum });
    if (!v.ok) {
      updateOrder(orderId, { status: "failed" });
      return NextResponse.redirect(
        new URL(
          `/dashboard?payment=failed&order=${orderId}&reason=${encodeURIComponent(v.message)}`,
          origin
        )
      );
    }
    if (v.amountRial && v.amountRial !== expectedRial) {
      updateOrder(orderId, { status: "failed" });
      return NextResponse.redirect(
        new URL(
          `/dashboard?payment=failed&order=${orderId}&reason=${encodeURIComponent("مبلغ تأیید شده درگاه با سفارش مطابقت ندارد")}`,
          origin
        )
      );
    }
  }

  updateOrder(orderId, {
    status: "paid",
    paidAt: Date.now(),
    refNum,
    authority: fields.get("TraceNo") ?? undefined,
  });

  // Handle bundled cart orders: courseSlug may be comma-separated.
  const slugs = order.courseSlug.includes(",")
    ? order.courseSlug.split(",").map((s) => s.trim()).filter(Boolean)
    : [order.courseSlug];
  for (const slug of slugs) {
    enroll(order.userId, slug, {
      source: "purchase",
      orderId: order.id,
    });
  }

  return NextResponse.redirect(
    new URL(`/dashboard?payment=success&order=${orderId}`, origin)
  );
}

export async function POST(req: Request) {
  const form = await req.formData();
  const params = new URLSearchParams();
  for (const [k, v] of form.entries()) params.append(k, String(v));
  return handle(req, params);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle(req, url.searchParams);
}
