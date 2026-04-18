import { NextResponse } from "next/server";
import { validateDiscount } from "@/lib/db";

/**
 * Validates a coupon against a cart of items. Returns the total amountOff
 * across all items (course-specific coupons only discount the matching item;
 * global coupons discount the full cart total).
 */
export async function POST(req: Request) {
  let body: { code?: string; items?: { slug: string; price: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const code = body.code?.trim();
  if (!code) return NextResponse.json({ error: "کد الزامی" }, { status: 400 });
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
  }

  let totalOff = 0;
  let usedForCourse: string | undefined;

  // Try applying against the full-cart as a global coupon first.
  const cartTotal = body.items.reduce((s, i) => s + (i.price || 0), 0);
  const globalTry = validateDiscount({
    code,
    courseSlug: body.items[0].slug,
    amountToman: cartTotal,
  });

  if (globalTry.ok) {
    // If discount isn't scoped to a course, it applies to the whole cart.
    const rawDiscount = globalTry;
    // Re-check scope using the raw record.
    // `validateDiscount` already enforces courseSlug scope; if it passed on
    // the first item but other items don't match, we need per-item logic.
    let appliedAcrossAll = 0;
    let eligible = 0;
    for (const it of body.items) {
      const v = validateDiscount({
        code,
        courseSlug: it.slug,
        amountToman: it.price,
      });
      if (v.ok) {
        appliedAcrossAll += v.amountOff;
        eligible += 1;
      }
    }
    if (eligible === 0) {
      return NextResponse.json(
        { error: "این کد برای هیچ‌یک از دوره‌های سبد قابل استفاده نیست" },
        { status: 400 }
      );
    }
    totalOff = appliedAcrossAll;
    usedForCourse = eligible === 1 ? body.items.find((i) => {
      const v = validateDiscount({
        code,
        courseSlug: i.slug,
        amountToman: i.price,
      });
      return v.ok;
    })?.slug : undefined;
    return NextResponse.json({
      code: rawDiscount.code,
      amountOff: totalOff,
      courseSlug: usedForCourse,
    });
  }

  return NextResponse.json({ error: globalTry.error }, { status: 400 });
}
