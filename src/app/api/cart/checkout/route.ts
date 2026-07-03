import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createOrder,
  generateId,
  getCourse,
  getSalesAgentByCode,
  incrementDiscountUses,
  isEnrolled,
  validateDiscount,
} from "@/lib/db";
import { readReferralCookie } from "@/lib/referral";
import {
  getPublicBaseUrl,
  isSepConfigured,
  requestToken,
  tomanToRial,
} from "@/lib/saman";

/**
 * Multi-item cart checkout. For a single item we follow the usual one-order
 * flow. For multi-item carts we create a parent "bundle" order and submit
 * the sum to the payment gateway; on success, each course gets its own
 * enrollment record (all tied to the parent order id).
 *
 * SEP payment gateway only accepts a single amount, so we consolidate.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "ابتدا وارد حساب کاربری شوید" },
      { status: 401 }
    );
  }

  let body: { slugs?: string[]; couponCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  const slugs = Array.isArray(body.slugs) ? body.slugs : [];
  if (slugs.length === 0) {
    return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
  }

  // Resolve courses, filter out already-enrolled/unpurchasable.
  const items: {
    slug: string;
    title: string;
    price: number;
    original: number;
  }[] = [];
  for (const slug of slugs) {
    const course = getCourse(slug);
    if (!course) continue;
    if (course.status !== "published" || !course.allowPurchase) continue;
    if (isEnrolled(session.userId, slug)) continue;
    items.push({
      slug: course.slug,
      title: course.title,
      price: course.discountPrice ?? course.price,
      original: course.price,
    });
  }
  if (items.length === 0) {
    return NextResponse.json(
      { error: "هیچ دوره‌ای برای خرید معتبر نیست" },
      { status: 400 }
    );
  }

  // Apply coupon per eligible item.
  let couponOff = 0;
  if (body.couponCode) {
    for (const it of items) {
      const v = validateDiscount({
        code: body.couponCode,
        courseSlug: it.slug,
        amountToman: it.price,
      });
      if (v.ok) couponOff += v.amountOff;
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const originalTotal = items.reduce((s, i) => s + i.original, 0);
  const discountAmount = originalTotal - subtotal + couponOff;
  const finalAmount = Math.max(0, subtotal - couponOff);

  // Create a single parent order. courseSlug stores a comma-separated list
  // so we can expand on success; each item gets its own enrollment.
  const orderId = generateId("ord");
  const bundleSlug = items.length === 1 ? items[0].slug : items.map((i) => i.slug).join(",");

  // Referral attribution. For multi-item bundles we take the weighted
  // average commission rate so an agent who refers a bundle of unevenly
  // configured courses still gets a sensible payout. Single-item bundles
  // reduce to a plain percentage of finalAmount.
  const refCode = readReferralCookie(req);
  const agent = refCode ? getSalesAgentByCode(refCode) : undefined;
  const attributable = agent && agent.isActive ? agent : undefined;
  let commissionAmount = 0;
  let weightedRate = 0;
  if (attributable) {
    for (const it of items) {
      const c = getCourse(it.slug);
      const r = Math.max(
        0,
        Math.min(100, c?.agentCommissionPercent ?? 0),
      );
      commissionAmount += Math.round((it.price * r) / 100);
    }
    weightedRate =
      finalAmount > 0
        ? Math.round((commissionAmount * 100) / finalAmount)
        : 0;
  }

  createOrder({
    id: orderId,
    userId: session.userId,
    courseSlug: bundleSlug,
    amount: originalTotal,
    discountAmount,
    finalAmount,
    status: "pending",
    paymentMethod: "sep",
    couponCode: body.couponCode ? body.couponCode.toUpperCase() : undefined,
    createdAt: Date.now(),
    ...(attributable
      ? {
          referralCode: attributable.referralCode,
          agentId: attributable.id,
          commissionRate: weightedRate,
          commissionAmount,
        }
      : {}),
  });

  const baseUrl = getPublicBaseUrl(req.url);
  const callbackUrl = new URL("/api/payment/callback", baseUrl).toString();

  if (!isSepConfigured()) {
    // Dev simulate
    if (body.couponCode) incrementDiscountUses(body.couponCode);
    const url = new URL("/api/payment/callback", baseUrl || new URL(req.url).origin);
    url.searchParams.set("ResNum", orderId);
    url.searchParams.set("State", "OK");
    url.searchParams.set("RefNum", "DEV-" + orderId);
    url.searchParams.set("TraceNo", String(Math.floor(Math.random() * 1e9)));
    url.searchParams.set("AffectiveAmount", String(tomanToRial(finalAmount)));
    return NextResponse.json({ paymentUrl: url.toString(), simulated: true });
  }

  if (finalAmount <= 0) {
    return NextResponse.json(
      { error: "مبلغ نهایی برای پرداخت نامعتبر است" },
      { status: 400 }
    );
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
  if (body.couponCode) incrementDiscountUses(body.couponCode);

  return NextResponse.json({ paymentUrl: token.paymentUrl });
}
