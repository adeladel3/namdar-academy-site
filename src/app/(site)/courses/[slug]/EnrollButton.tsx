"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/data/courses";

export default function EnrollButton({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleEnroll() {
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

  return (
    <div>
      <button
        type="button"
        onClick={handleEnroll}
        disabled={loading}
        className="w-full py-4 rounded-full bg-gradient-to-l from-[#136cb5] to-[#49bbbd] text-white font-bold text-lg shadow-lg shadow-[#136cb5]/25 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-wait"
      >
        {loading ? "در حال انتقال..." : "ثبت‌نام در این دوره"}
      </button>
      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  );
}
