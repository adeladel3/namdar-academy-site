"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RetryLicenseButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function retry() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/user/spotplayer-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErr(data.error ?? "تلاش ناموفق بود. لطفاً کمی بعد دوباره امتحان کنید.");
        return;
      }
      router.refresh();
    } catch {
      setErr("خطا در ارتباط با سرور.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={retry}
        disabled={busy}
        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#1b3c8a] text-white font-extrabold text-[14px] hover:opacity-95 active:translate-y-[1px] transition disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 109-9 9 9 0 00-7.5 4" />
          <polyline points="3 3 3 7 7 7" />
        </svg>
        {busy ? "در حال ساخت لایسنس..." : "تلاش مجدد برای دریافت کد"}
      </button>
      {err && (
        <p className="text-[13px] text-rose-600 font-bold leading-6">{err}</p>
      )}
    </div>
  );
}
