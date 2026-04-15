import { NextResponse } from "next/server";
import { enrollmentStore, orderStore } from "@/lib/otp-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const status = url.searchParams.get("Status");
  const authority = url.searchParams.get("Authority");

  if (!orderId) {
    return NextResponse.redirect(new URL("/dashboard?payment=error", url));
  }
  const order = orderStore.get(orderId);
  if (!order) {
    return NextResponse.redirect(new URL("/dashboard?payment=error", url));
  }

  if (status === "OK") {
    // TODO: in production, verify via ZarinPal /payment/verify.json before enrolling.
    order.status = "paid";
    order.authority = authority ?? undefined;
    order.refId = Math.random().toString(36).slice(2).toUpperCase();

    const set = enrollmentStore.get(order.userId) ?? new Set<string>();
    set.add(order.courseSlug);
    enrollmentStore.set(order.userId, set);

    return NextResponse.redirect(
      new URL(`/dashboard?payment=success&order=${orderId}`, url)
    );
  }

  order.status = "failed";
  return NextResponse.redirect(
    new URL(`/dashboard?payment=failed&order=${orderId}`, url)
  );
}
