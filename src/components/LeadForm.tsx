"use client";

import { useEffect, useRef, useState } from "react";

function sanitizePhone(v: string) {
  return v
    .replace(/[\u06F0-\u06F9]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48)
    )
    .replace(/[\u0660-\u0669]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48)
    )
    .replace(/[^\d+]/g, "")
    .slice(0, 14);
}

function isValidPhone(v: string) {
  const digits = v.replace(/\D/g, "");
  if (digits.startsWith("09") && digits.length === 11) return true;
  if (digits.startsWith("989") && digits.length === 12) return true;
  if (digits.startsWith("9") && digits.length === 10) return true;
  if (digits.startsWith("0") && digits.length >= 10 && digits.length <= 11)
    return true;
  return false;
}

export type LeadFormVariant = "light" | "dark";

export default function LeadForm({
  source,
  relatedCourseSlug,
  relatedCourseTitle,
  topic,
  variant = "light",
  showName = true,
  ctaLabel = "درخواست مشاوره",
  successTitle = "شماره‌ات ثبت شد",
  successBody = "تیم نامدار آکادمی در کمتر از ۲۴ ساعت با شما تماس می‌گیرد.",
  autoResetMs = 5000,
}: {
  /** Which page / CTA placed this form — used for admin analytics ("source"). */
  source: string;
  /** Slug of the course/product the lead is about, if any. */
  relatedCourseSlug?: string;
  /** Optional friendly title shown above the form ("می‌خواهید دربارهٔ X مشاوره بگیرید؟"). */
  relatedCourseTitle?: string;
  /** Topic string to send to admin (fallback when no course slug is available). */
  topic?: string;
  /** `light` = white card (landings); `dark` = on-dark surfaces. */
  variant?: LeadFormVariant;
  showName?: boolean;
  ctaLabel?: string;
  successTitle?: string;
  successBody?: string;
  /** When > 0, the form auto-resets back to idle after success. */
  autoResetMs?: number;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    if (showName && name.trim().length < 2) {
      setErrorMsg("نام خود را وارد کنید");
      setStatus("error");
      return;
    }
    if (!isValidPhone(phone)) {
      setErrorMsg("شماره وارد‌شده معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/callback-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone,
          topic: topic || relatedCourseTitle || undefined,
          relatedCourseSlug,
          source,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "خطا در ارسال درخواست");
      }
      setStatus("success");
      setName("");
      setPhone("");
      if (autoResetMs > 0) {
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setStatus("idle"), autoResetMs);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "خطا در ارسال درخواست");
      setStatus("error");
    }
  }

  const dark = variant === "dark";

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl px-4 py-5 text-center ${
          dark
            ? "bg-emerald-500/15 border border-emerald-400/35 text-emerald-100"
            : "bg-emerald-50 border border-emerald-200 text-emerald-800"
        }`}
        role="status"
      >
        <div
          className={`mx-auto w-11 h-11 rounded-full flex items-center justify-center mb-2 ${
            dark ? "bg-emerald-400/25" : "bg-emerald-500/15"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={dark ? "#6ee7b7" : "#059669"}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="font-['Yekan_Bakh:Bold',sans-serif] text-[14.5px] font-extrabold mb-1">
          {successTitle}
        </div>
        <p
          className={`text-[12px] leading-[1.8] ${
            dark ? "text-emerald-100/85" : "text-emerald-700/85"
          }`}
        >
          {successBody}
        </p>
      </div>
    );
  }

  const fieldCx = dark
    ? "px-4 py-[13px] rounded-xl bg-white/[0.07] border border-white/15 text-[14px] text-white placeholder-white/40 outline-none focus:border-[#f7cf5a]/70 focus:ring-2 focus:ring-[#f7cf5a]/15 transition"
    : "px-4 py-[13px] rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-[14px] text-[#0e1a3d] placeholder-[#0e1a3d]/40 outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 transition";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {showName && (
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMsg("");
            }
          }}
          placeholder="نام و نام خانوادگی"
          className={`${fieldCx} font-['Yekan_Bakh:Medium',sans-serif]`}
          dir="rtl"
          autoComplete="name"
          disabled={status === "submitting"}
        />
      )}

      <input
        type="tel"
        inputMode="tel"
        name="phone"
        value={phone}
        onChange={(e) => {
          setPhone(sanitizePhone(e.target.value));
          if (status === "error") {
            setStatus("idle");
            setErrorMsg("");
          }
        }}
        placeholder="شماره موبایل"
        className={`${fieldCx} font-['Yekan_Bakh:Medium',sans-serif] tabular-nums`}
        dir="ltr"
        autoComplete="tel"
        disabled={status === "submitting"}
      />

      {status === "error" && errorMsg && (
        <div
          className={`text-[12px] rounded-lg px-3 py-2 ${
            dark
              ? "text-rose-200 bg-rose-500/10 border border-rose-400/30"
              : "text-rose-600 bg-rose-50 border border-rose-100"
          }`}
        >
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group relative mt-1 py-[14px] rounded-xl text-white font-['Yekan_Bakh:Bold',sans-serif] font-extrabold text-[16px] hover:brightness-110 transition flex items-center justify-center gap-2.5 overflow-hidden disabled:opacity-70 active:scale-[0.99]"
        style={{
          background: dark
            ? "linear-gradient(100deg, #f7cf5a 0%, #d4a62a 100%)"
            : "linear-gradient(100deg, #0e1a3d 0%, #1b3c8a 100%)",
          color: dark ? "#2d1c03" : "#ffffff",
          boxShadow: dark
            ? "0 14px 32px -10px rgba(247,207,90,0.6)"
            : "0 14px 32px -10px rgba(14,26,61,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <span className="relative">
          {status === "submitting" ? "در حال ارسال..." : ctaLabel}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dark ? "#2d1c03" : "#f7cf5a"}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative transition-transform group-hover:-translate-x-0.5"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
    </form>
  );
}
