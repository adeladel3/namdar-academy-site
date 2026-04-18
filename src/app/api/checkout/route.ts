import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createOrder,
  generateId,
  getCourse,
  isEnrolled,
} from "@/lib/db";
import {
  SEP_START_URL,
  isSepConfigured,
  requestToken,
  tomanToRial,
} from "@/lib/saman";

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
  const course = body.slug ? getCourse(body.slug) : undefined;
  if (!course) {
    return NextResponse.json({ error: "دوره پیدا نشد" }, { status: 404 });
  }
  if (course.status !== "published" || !course.allowPurchase) {
    return NextResponse.json(
      { error: "این دوره در حال حاضر قابل خرید نیست" },
      { status: 400 }
    );
  }

  if (isEnrolled(session.userId, course.slug)) {
    return NextResponse.json(
      { error: "شما قبلاً در این دوره ثبت‌نام کرده‌اید", enrolled: true },
      { status: 400 }
    );
  }

  const originalAmount = course.price;
  const finalAmount = course.discountPrice ?? course.price;
  const discountAmount = Math.max(0, originalAmount - finalAmount);

  const orderId = generateId("ord");
  createOrder({
    id: orderId,
    userId: session.userId,
    courseSlug: course.slug,
    amount: originalAmount,
    discountAmount,
    finalAmount,
    status: "pending",
    paymentMethod: "sep",
    createdAt: Date.now(),
  });

  const origin = new URL(req.url).origin;
  const callbackUrl = new URL("/api/payment/callback", origin).toString();

  if (!isSepConfigured()) {
    // Dev fallback: bypass bank, redirect straight to success callback.
    const url = new URL("/api/payment/callback", origin);
    url.searchParams.set("ResNum", orderId);
    url.searchParams.set("State", "OK");
    url.searchParams.set("RefNum", "DEV-" + orderId);
    url.searchParams.set("TraceNo", String(Math.floor(Math.random() * 1e9)));
    url.searchParams.set("AffectiveAmount", String(tomanToRial(finalAmount)));
    return NextResponse.json({ paymentUrl: url.toString(), simulated: true });
  }

  const token = await requestToken({
    amountRial: tomanToRial(finalAmount),
    orderId,
    callbackUrl,
    cellNumber: session.phone,
  });
  if (!token.ok) {
    return NextResponse.json(
      { error: token.message, code: token.code },
      { status: 502 }
    );
  }
  const redirectUrl = `${SEP_START_URL}?token=${encodeURIComponent(token.token)}`;
  return NextResponse.json({ paymentUrl: redirectUrl });
}
