"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { CourseRecord } from "@/lib/db";

export default function EnrollButton({ course }: { course: CourseRecord }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { add, has } = useCart();

  const alreadyInCart = has(course.slug);

  async function buyNow() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: course.slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=/courses/${course.slug}`);
          return;
        }
        throw new Error(data.error ?? "خطا در ایجاد پرداخت");
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("پاسخ نامعتبر از سرور");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای ناشناخته";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function addToCart() {
    add({
      slug: course.slug,
      title: course.title,
      price: course.discountPrice ?? course.price,
      originalPrice: course.price,
      image: course.previewImage,
    });
  }

  // `relative isolate z-30` keeps the button stack above any sibling decorative
  // blobs/blur layers in the surrounding pricing card. Without this, third-party
  // chat-widget overlays (Goftino welcome bubble) could intercept taps on mobile.
  return (
    <div className="relative isolate z-30 space-y-3" style={{ pointerEvents: "auto" }}>
      <button
        type="button"
        onClick={buyNow}
        disabled={loading}
        className="relative z-10 w-full py-4 rounded-full bg-gradient-to-l from-[#136cb5] to-[#49bbbd] text-white font-bold text-lg shadow-lg shadow-[#136cb5]/25 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-wait"
        style={{ pointerEvents: "auto", touchAction: "manipulation" }}
      >
        {loading ? "در حال انتقال..." : "خرید مستقیم"}
      </button>

      {alreadyInCart ? (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="relative z-10 w-full py-3 rounded-full border-2 border-[#1b3c8a] text-[#1b3c8a] font-bold text-base hover:bg-[#eef4ff] transition inline-flex items-center justify-center gap-2"
          style={{ pointerEvents: "auto", touchAction: "manipulation" }}
        >
          <span>✓</span> در سبد خرید — مشاهده سبد
        </button>
      ) : (
        <button
          type="button"
          onClick={addToCart}
          className="relative z-10 w-full py-3 rounded-full border-2 border-[#1b3c8a] text-[#1b3c8a] font-bold text-base hover:bg-[#eef4ff] transition inline-flex items-center justify-center gap-2"
          style={{ pointerEvents: "auto", touchAction: "manipulation" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          افزودن به سبد خرید
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  );
}
