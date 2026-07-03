import { NextResponse } from "next/server";
import {
  enroll,
  getOrder,
  getSeminar,
  incrementLinkPaidOrders,
  registerSeminar,
  updateOrder,
} from "@/lib/db";
import {
  isSepConfigured,
  sepStateMessage,
  tomanToRial,
  verifyTransaction,
} from "@/lib/saman";
import { ensureLicenseForEnrollment } from "@/lib/spotplayer";

function resultUrl(
  origin: string,
  params: Record<string, string | number | undefined>
) {
  const url = new URL("/payment/result", origin);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  return url;
}

async function handle(req: Request, fields: URLSearchParams) {
  const origin = new URL(req.url).origin;
  const host = (() => {
    try {
      return new URL(req.url).hostname;
    } catch {
      return "";
    }
  })();
  const isLocalDev =
    process.env.NODE_ENV !== "production" &&
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(host);
  const orderId = fields.get("ResNum") ?? fields.get("orderId");
  const state = fields.get("State");
  const refNum = fields.get("RefNum");
  const traceNo = fields.get("TraceNo") ?? undefined;
  const securePan = fields.get("SecurePan") ?? undefined;
  const hashedCardNumber = fields.get("HashedCardNumber") ?? undefined;

  if (!orderId) {
    return NextResponse.redirect(
      resultUrl(origin, {
        status: "failed",
        reason: "شناسه سفارش در پاسخ بانک یافت نشد",
      })
    );
  }
  const order = getOrder(orderId);
  if (!order) {
    return NextResponse.redirect(
      resultUrl(origin, {
        status: "failed",
        orderId,
        reason: "سفارش یافت نشد",
      })
    );
  }

  // Idempotency: if this order is already finalized, just show the stored outcome.
  if (order.status === "paid") {
    return NextResponse.redirect(
      resultUrl(origin, {
        status: "success",
        orderId,
        refNum: order.refNum,
        amount: order.finalAmount,
      })
    );
  }
  if (order.status === "failed") {
    return NextResponse.redirect(
      resultUrl(origin, {
        status: "failed",
        orderId,
        reason: sepStateMessage(state),
      })
    );
  }

  if (state !== "OK" || !refNum) {
    updateOrder(orderId, { status: "failed" });
    return NextResponse.redirect(
      resultUrl(origin, {
        status: "failed",
        orderId,
        reason: sepStateMessage(state),
      })
    );
  }

  const expectedRial = tomanToRial(order.finalAmount);
  const reportedAmount = Number(
    fields.get("AffectiveAmount") ?? fields.get("Amount") ?? 0
  );
  if (reportedAmount && reportedAmount !== expectedRial) {
    updateOrder(orderId, { status: "failed" });
    return NextResponse.redirect(
      resultUrl(origin, {
        status: "failed",
        orderId,
        reason: "مبلغ تراکنش با سفارش مطابقت ندارد",
      })
    );
  }

  if (isSepConfigured() && !isLocalDev) {
    const v = await verifyTransaction({ refNum });
    if (!v.ok) {
      updateOrder(orderId, { status: "failed" });
      return NextResponse.redirect(
        resultUrl(origin, {
          status: "failed",
          orderId,
          reason: v.message,
        })
      );
    }
    if (v.amountRial && v.amountRial !== expectedRial) {
      updateOrder(orderId, { status: "failed" });
      return NextResponse.redirect(
        resultUrl(origin, {
          status: "failed",
          orderId,
          reason: "مبلغ تأیید شده درگاه با سفارش مطابقت ندارد",
        })
      );
    }
  }

  // Only fields we derived from the verified response (`refNum` checked
  // against the bank in verifyTransaction above) go on the order. User-
  // controllable form fields (traceNo/securePan/hashedCardNumber) are
  // dropped to avoid feeding unvalidated strings into admin UI (XSS /
  // log poisoning).
  updateOrder(orderId, {
    status: "paid",
    paidAt: Date.now(),
    refNum,
    authority: refNum,
  });

  // Bump the "paid orders" counter on the specific referral link this sale
  // came through. Only counted once per order — we already moved the status
  // from pending to paid above, and we won't run this block again because
  // of the `order.status === "paid"` short-circuit at the top of handle().
  if (order.referralLinkId) {
    incrementLinkPaidOrders(order.referralLinkId);
  }

  // سفارش‌های سمینار: به جای enroll دوره، یک SeminarRegistration می‌سازیم
  // که اطلاعات شناسنامه‌ای فریز‌شده روی سفارش را به ثبت‌نام منتقل می‌کند.
  if (order.productType === "seminar" && order.seminarSlug) {
    const seminar = getSeminar(order.seminarSlug);
    if (seminar) {
      registerSeminar({
        userId: order.userId,
        seminarSlug: seminar.slug,
        fullName: order.buyerFullName ?? "—",
        nationalId: order.buyerNationalId ?? "",
        phone: order.buyerPhone ?? "",
        orderId: order.id,
        source: "purchase",
      });
    }
  } else {
    const slugs = order.courseSlug.includes(",")
      ? order.courseSlug.split(",").map((s) => s.trim()).filter(Boolean)
      : [order.courseSlug];
    for (const slug of slugs) {
      const enrollment = enroll(order.userId, slug, {
        source: "purchase",
        orderId: order.id,
      });
      // برای دوره‌های اسپات‌پلیر، بلافاصله لایسنس می‌سازیم. این کار best-effort
      // است؛ اگر سرویس اسپات‌پلیر در دسترس نباشد، خطا روی ثبت‌نام ذخیره می‌شود
      // و موقع باز کردن صفحه لایسنس دوباره تلاش می‌شود. هرگز نباید ریدایرکت
      // موفقیت پرداخت را به‌خاطر اسپات‌پلیر متوقف کند.
      try {
        await ensureLicenseForEnrollment(enrollment.id);
      } catch (e) {
        console.error("[spotplayer] ensure after purchase failed:", e);
      }
    }
  }

  return NextResponse.redirect(
    resultUrl(origin, {
      status: "success",
      orderId,
      refNum,
      amount: order.finalAmount,
    })
  );
}

export async function POST(req: Request) {
  const form = await req.formData();
  const params = new URLSearchParams();
  for (const [k, v] of form.entries()) params.append(k, String(v));
  return handle(req, params);
}

// In dev (no SEP terminal configured, or running on localhost) we accept GET
// for the simulation flow. In production — SEP always POSTs, so GET is
// hostile by definition and must not flip an order to "paid".
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const host = (() => {
    try {
      return new URL(req.url).hostname;
    } catch {
      return "";
    }
  })();
  const isLocalDev =
    process.env.NODE_ENV !== "production" &&
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(host);
  if (process.env.NODE_ENV === "production" || (isSepConfigured() && !isLocalDev)) {
    return NextResponse.redirect(
      resultUrl(origin, {
        status: "failed",
        reason: "روش ارسال پاسخ بانک نامعتبر است",
      })
    );
  }
  const url = new URL(req.url);
  return handle(req, url.searchParams);
}
