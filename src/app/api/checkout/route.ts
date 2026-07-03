import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createOrder,
  generateId,
  getCourse,
  getReferralLink,
  getSalesAgentByCode,
  isEnrolled,
} from "@/lib/db";
import {
  readReferralCookie,
  readReferralLinkCookie,
} from "@/lib/referral";
import {
  getPublicBaseUrl,
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

  // Referral attribution — read the cookie set by the edge middleware. Only
  // attribute if the agent is still active; freeze the rate as it stands
  // today so later changes to course.agentCommissionPercent don't rewrite
  // already-completed sales.
  const refCode = readReferralCookie(req);
  const linkIdCookie = readReferralLinkCookie(req);
  const agent = refCode ? getSalesAgentByCode(refCode) : undefined;
  const attributable = agent && agent.isActive ? agent : undefined;
  // Only credit the specific link when it both exists and belongs to the
  // same agent — defends against a cookie tampering that could otherwise
  // inflate one link's conversion stats with another agent's sale.
  const link = linkIdCookie ? getReferralLink(linkIdCookie) : undefined;
  const linkBelongsToAgent =
    attributable && link && link.agentId === attributable.id && link.isActive
      ? link
      : undefined;
  const rate =
    attributable && typeof course.agentCommissionPercent === "number"
      ? Math.max(0, Math.min(100, course.agentCommissionPercent))
      : 0;
  const commissionAmount = attributable
    ? Math.round((finalAmount * rate) / 100)
    : 0;

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
    ...(attributable
      ? {
          referralCode: attributable.referralCode,
          agentId: attributable.id,
          referralLinkId: linkBelongsToAgent?.id,
          commissionRate: rate,
          commissionAmount,
        }
      : {}),
  });

  const baseUrl = getPublicBaseUrl(req.url);
  const callbackUrl = new URL("/api/payment/callback", baseUrl).toString();

  if (!isSepConfigured()) {
    // Dev fallback: bypass bank, redirect straight to success callback.
    const url = new URL("/api/payment/callback", baseUrl || new URL(req.url).origin);
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
  return NextResponse.json({ paymentUrl: token.paymentUrl });
}
