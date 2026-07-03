"use client";

import Link from "@/components/SafeLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { courseDetailHref } from "@/lib/course-links";
import { formatToman } from "@/lib/formatting";

export default function CartView() {
  const router = useRouter();
  const { items, remove, total, originalTotal, clear } = useCart();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    amountOff: number;
    courseSlug?: string;
  } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const itemDiscount = originalTotal - total;
  const couponOff = coupon?.amountOff ?? 0;
  const grandTotal = Math.max(0, total - couponOff);

  async function applyCoupon() {
    if (!code.trim()) return;
    setCouponMsg(null);
    if (items.length === 0) {
      setCouponMsg("سبد خرید خالی است");
      return;
    }
    // Validate against the first item's slug if coupon is course-specific;
    // API will re-validate at checkout time per item.
    try {
      const res = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          items: items.map((i) => ({ slug: i.slug, price: i.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCoupon(null);
        setCouponMsg(data.error ?? "خطا");
        return;
      }
      setCoupon({
        code: data.code,
        amountOff: data.amountOff,
        courseSlug: data.courseSlug,
      });
      setCouponMsg(null);
    } catch {
      setCouponMsg("خطای شبکه");
    }
  }

  async function checkout() {
    if (items.length === 0) return;
    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugs: items.map((i) => i.slug),
          couponCode: coupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?next=/cart");
          return;
        }
        setCheckoutError(data.error ?? "خطا در پرداخت");
        return;
      }
      if (data.paymentUrl) {
        clear();
        window.location.href = data.paymentUrl;
      }
    } catch {
      setCheckoutError("خطای شبکه");
    } finally {
      setCheckoutBusy(false);
    }
  }

  return (
    <div className="bg-[#f7fafd] min-h-screen py-10 md:py-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#010514] mb-6">
          سبد خرید
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-14 text-center border border-dashed border-[#e5eaf5]">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-[#010514] mb-2">
              سبد خرید شما خالی است
            </h2>
            <p className="text-[#010514]/60 mb-6">
              دوره‌های نامدار آکادمی را ببینید و شروع کنید.
            </p>
            <Link
              href="/courses"
              className="inline-block px-8 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition"
            >
              مشاهده دوره‌ها
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="bg-white rounded-3xl border border-[#e5eaf5] p-4 flex items-center gap-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={courseDetailHref(item.slug)}
                      className="font-bold text-[#010514] hover:text-[#1b3c8a] transition truncate block"
                    >
                      {item.title}
                    </Link>
                    <div className="text-sm text-[#010514]/55 font-mono" dir="ltr">
                      /{item.slug}
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    {item.price < item.originalPrice && (
                      <div className="text-xs text-[#010514]/50 line-through">
                        {formatToman(item.originalPrice)}
                      </div>
                    )}
                    <div className="font-bold text-[#1b3c8a]">
                      {formatToman(item.price)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    className="w-10 h-10 rounded-full text-red-600 hover:bg-red-50 transition flex items-center justify-center shrink-0"
                    aria-label="حذف از سبد"
                    title="حذف"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <aside className="bg-white rounded-3xl border border-[#e5eaf5] p-6 h-fit sticky top-24 space-y-4">
              <h2 className="font-bold text-lg mb-2">خلاصه سفارش</h2>

              <div className="space-y-2 text-sm pb-4 border-b border-[#eef2f7]">
                <div className="flex justify-between">
                  <span className="text-[#010514]/65">
                    جمع دوره‌ها ({items.length.toLocaleString("fa-IR")})
                  </span>
                  <span>{formatToman(originalTotal)}</span>
                </div>
                {itemDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>تخفیف دوره‌ها</span>
                    <span>- {formatToman(itemDiscount)}</span>
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-green-700">
                    <span>کد تخفیف ({coupon.code})</span>
                    <span>- {formatToman(coupon.amountOff)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#010514]/70 mb-1.5 font-medium">
                  کد تخفیف
                </label>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="مثلاً SPRING20"
                    dir="ltr"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#e5eaf5] font-mono text-sm focus:outline-none focus:border-[#1b3c8a]"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={!code.trim()}
                    className="px-4 py-2 rounded-xl bg-[#1b3c8a] text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
                  >
                    اعمال
                  </button>
                </div>
                {couponMsg && (
                  <p className="text-xs text-red-600 mt-1.5">{couponMsg}</p>
                )}
                {coupon && (
                  <p className="text-xs text-green-700 mt-1.5">
                    کد «{coupon.code}» با موفقیت اعمال شد.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-[#eef2f7]">
                <span className="text-[#010514]/65">مبلغ قابل پرداخت</span>
                <span className="font-bold text-xl text-[#1b3c8a]">
                  {formatToman(grandTotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={checkout}
                disabled={checkoutBusy}
                className="w-full py-4 rounded-full bg-gradient-to-l from-[#136cb5] to-[#49bbbd] text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-60"
              >
                {checkoutBusy ? "در حال انتقال به درگاه..." : "ادامه و پرداخت"}
              </button>

              {checkoutError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {checkoutError}
                </p>
              )}

              <button
                type="button"
                onClick={clear}
                className="w-full text-sm text-[#010514]/55 hover:text-red-600 transition"
              >
                خالی کردن سبد
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
