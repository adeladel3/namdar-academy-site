import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findCourse } from "@/data/courses";
import {
  enrollmentStore,
  generateId,
  orderStore,
} from "@/lib/otp-store";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "ابتدا وارد حساب کاربری شوید" },
      { status: 401 }
    );
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
  const course = body.slug ? findCourse(body.slug) : undefined;
  if (!course) {
    return NextResponse.json({ error: "دوره پیدا نشد" }, { status: 404 });
  }

  const already = enrollmentStore.get(session.userId);
  if (already?.has(course.slug)) {
    return NextResponse.json(
      { error: "شما قبلاً در این دوره ثبت‌نام کرده‌اید", enrolled: true },
      { status: 400 }
    );
  }

  const orderId = generateId();
  orderStore.set(orderId, {
    id: orderId,
    userId: session.userId,
    courseSlug: course.slug,
    amount: course.price,
    status: "pending",
    createdAt: Date.now(),
  });

  // TODO: replace with real ZarinPal request once MERCHANT_ID is set.
  // Flow: POST to https://payment.zarinpal.com/pg/v4/payment/request.json
  // with { merchant_id, amount, callback_url, description }.
  // Get `authority`, redirect user to https://payment.zarinpal.com/pg/StartPay/{authority}
  // On callback, call /pg/v4/payment/verify.json to confirm.
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  if (!merchantId) {
    // Dev fallback: simulate a success callback
    const origin = new URL(req.url).origin;
    const url = new URL("/api/payment/callback", origin);
    url.searchParams.set("orderId", orderId);
    url.searchParams.set("Status", "OK");
    url.searchParams.set("Authority", "DEVSIMULATED-" + orderId);
    return NextResponse.json({ paymentUrl: url.toString(), simulated: true });
  }

  // Real ZarinPal integration (implement when credentials exist)
  return NextResponse.json(
    { error: "درگاه پرداخت هنوز پیکربندی نشده است" },
    { status: 501 }
  );
}
