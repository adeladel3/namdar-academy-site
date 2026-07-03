import { NextResponse } from "next/server";
import { getSession, verifySeminarChallenge } from "@/lib/auth";
import {
  createOrder,
  generateId,
  getSeminar,
  isRegisteredForSeminar,
} from "@/lib/db";
import { toEnglishDigits } from "@/lib/formatting";
import {
  getPublicBaseUrl,
  isSepConfigured,
  requestToken,
  tomanToRial,
} from "@/lib/saman";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * مرحله ۳ پاپ‌آپ رزرو سمینار:
 *   پس از login موفق کاربر، challenge را دوباره بررسی می‌کنیم تا اطلاعات
 *   شناسنامه‌ای فریز شده روی سفارش ذخیره شود، سپس Order با productType
 *   "seminar" ساخته و کاربر به درگاه سامان منتقل می‌شود.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "ابتدا تأیید هویت را کامل کنید" },
      { status: 401 }
    );
  }

  const { slug: rawSlug } = await ctx.params;
  const slug = safeDecode(rawSlug);
  const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
  if (!seminar) {
    return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });
  }
  if (seminar.status !== "published" || !seminar.allowPurchase) {
    return NextResponse.json(
      { error: "این سمینار در حال حاضر قابل رزرو نیست" },
      { status: 400 }
    );
  }
  if (isRegisteredForSeminar(session.userId, seminar.slug)) {
    return NextResponse.json(
      { error: "شما قبلاً برای این سمینار ثبت‌نام کرده‌اید", registered: true },
      { status: 400 }
    );
  }

  let body: { challenge?: string; fullName?: string; nationalId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  // اطلاعات شناسنامه‌ای ممکن است از challenge (مسیر استاندارد) یا از body
  // (وقتی کاربر قبلاً login بوده و پاپ‌آپ مرحله ۱ را skip کرده) بیاید.
  let fullName: string | undefined;
  let nationalId: string | undefined;
  let phone: string | undefined;

  if (body.challenge) {
    const payload = verifySeminarChallenge(body.challenge);
    if (!payload || payload.seminarSlug !== seminar.slug) {
      return NextResponse.json(
        { error: "نشست رزرو منقضی شده است. لطفاً از ابتدا تلاش کنید." },
        { status: 400 }
      );
    }
    if (payload.phone !== session.phone) {
      return NextResponse.json(
        { error: "شماره موبایل با حساب کاربری منطبق نیست" },
        { status: 400 }
      );
    }
    fullName = payload.fullName;
    nationalId = payload.nationalId;
    phone = payload.phone;
  } else {
    // کاربری که قبلاً login بوده و مستقیم به مرحله ۳ رسیده — انتظار داریم
    // فرم دو فیلد را در body بفرستد.
    fullName = body.fullName?.trim();
    nationalId = body.nationalId
      ? toEnglishDigits(body.nationalId).replace(/\D/g, "")
      : undefined;
    phone = session.phone;
  }

  if (!fullName || fullName.length < 3) {
    return NextResponse.json(
      { error: "نام و نام خانوادگی را کامل وارد کنید" },
      { status: 400 }
    );
  }
  if (!nationalId || !/^\d{10}$/.test(nationalId)) {
    return NextResponse.json({ error: "کد ملی نامعتبر است" }, { status: 400 });
  }

  const originalAmount = seminar.price;
  const finalAmount = seminar.discountPrice ?? seminar.price;
  const discountAmount = Math.max(0, originalAmount - finalAmount);

  const orderId = generateId("ord");
  createOrder({
    id: orderId,
    userId: session.userId,
    productType: "seminar",
    courseSlug: seminar.slug, // برای سازگاری با گزارش‌های قدیمی
    seminarSlug: seminar.slug,
    buyerFullName: fullName,
    buyerNationalId: nationalId,
    buyerPhone: phone,
    amount: originalAmount,
    discountAmount,
    finalAmount,
    status: "pending",
    paymentMethod: "sep",
    createdAt: Date.now(),
  });

  const baseUrl = getPublicBaseUrl(req.url);
  const callbackUrl = new URL("/api/payment/callback", baseUrl).toString();

  // درگاه سپ هیچ‌وقت localhost را به‌عنوان RedirectUrl قبول نمی‌کند، پس
  // در توسعه‌ی محلی حتی اگر ترمینال پیکربندی شده باشد، به جای فراخوانی
  // واقعی، callback ساختگی را صدا می‌زنیم تا فلوی پس از پرداخت قابل تست باشد.
  const reqHost = (() => {
    try {
      return new URL(req.url).hostname;
    } catch {
      return "";
    }
  })();
  const isLocalDev =
    process.env.NODE_ENV !== "production" &&
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(reqHost);

  if (!isSepConfigured() || isLocalDev) {
    // فاز توسعه: درگاه واقعی پیکربندی نشده یا روی localhost هستیم؛
    // مستقیم به callback ساختگی برو تا فرآیند تست شود.
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
