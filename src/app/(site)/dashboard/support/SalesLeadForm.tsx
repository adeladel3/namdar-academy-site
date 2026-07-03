"use client";

import { useEffect, useRef, useState } from "react";

function CourseSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (slug: string) => void;
  options: { slug: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((c) => c.slug === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full h-11 flex items-center justify-between gap-2 rounded-xl bg-[#f7fafd] border px-3 text-[14px] text-right transition ${
          open
            ? "border-[#1b3c8a]/45 ring-2 ring-[#1b3c8a]/10 bg-white"
            : "border-[#e5eaf5] hover:border-[#1b3c8a]/25"
        }`}
      >
        <span
          className={selected ? "text-[#0e1a3d] font-bold" : "text-[#0e1a3d]/45"}
        >
          {selected ? selected.title : "— انتخاب کنید —"}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#0e1a3d]/55 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-30 left-0 right-0 mt-2 rounded-2xl bg-white border border-[#e5eaf5] overflow-hidden"
          style={{
            boxShadow: "0 18px 40px -14px rgba(14,26,61,0.22)",
            animation: "slfDropIn 0.14s ease-out",
          }}
          role="listbox"
        >
          <div className="max-h-[240px] overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#0e1a3d]/55 text-center">
                دوره‌ای برای انتخاب موجود نیست
              </div>
            ) : (
              options.map((c) => {
                const active = c.slug === value;
                return (
                  <button
                    type="button"
                    key={c.slug}
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(c.slug);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-right text-[13.5px] transition flex items-center justify-between gap-2 ${
                      active
                        ? "bg-[#eef4ff] text-[#1b3c8a] font-extrabold"
                        : "text-[#0e1a3d] hover:bg-[#f4f7fc]"
                    }`}
                  >
                    <span>{c.title}</span>
                    {active && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slfDropIn {
          from { transform: translateY(-4px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export type CourseOption = { slug: string; title: string };

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

export default function SalesLeadForm({
  defaultPhone,
  defaultName,
  courses,
}: {
  defaultPhone: string;
  defaultName: string;
  courses: CourseOption[];
}) {
  const [courseSlug, setCourseSlug] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [preferredTime, setPreferredTime] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    if (!courseSlug) {
      setError("یک دوره را انتخاب کنید");
      setStatus("error");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("شماره تماس معتبر نیست");
      setStatus("error");
      return;
    }
    const course = courses.find((c) => c.slug === courseSlug);
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/callback-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: defaultName || undefined,
          topic: course ? `مشاوره فروش — ${course.title}` : "مشاوره فروش",
          preferredTime: preferredTime.trim() || undefined,
          note: note.trim() || undefined,
          source: "dashboard-sales-lead",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "خطا در ارسال درخواست");
      }
      setStatus("success");
      setCourseSlug("");
      setPreferredTime("");
      setNote("");
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mb-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#059669"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="font-extrabold text-emerald-800 text-[15px] mb-1.5">
          درخواست شما ثبت شد
        </div>
        <p className="text-[13px] text-emerald-700/90 leading-[1.9]">
          همکاران ما به ترتیب اولویت با شما تماس می‌گیرند.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl bg-white border border-[#e5eaf5] p-5 md:p-6 space-y-4"
    >
      <div>
        <label className="block text-[13px] font-bold text-[#0e1a3d]/80 mb-2">
          دوره / سرویس مورد نظر
        </label>
        <CourseSelect
          value={courseSlug}
          options={courses}
          onChange={(slug) => {
            setCourseSlug(slug);
            if (status === "error") setStatus("idle");
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-[#0e1a3d]/80 mb-2">
            شماره تماس
          </label>
          <input
            type="tel"
            inputMode="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => {
              setPhone(sanitizePhone(e.target.value));
              if (status === "error") setStatus("idle");
            }}
            placeholder="09123456789"
            className="w-full h-11 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] px-3 text-[14px] text-[#0e1a3d] tabular-nums focus:outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 transition"
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#0e1a3d]/80 mb-2">
            زمان مناسب تماس (اختیاری)
          </label>
          <input
            type="text"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            placeholder="مثلاً: شنبه تا چهارشنبه ۱۰ تا ۱۴"
            maxLength={80}
            className="w-full h-11 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] px-3 text-[14px] text-[#0e1a3d] focus:outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0e1a3d]/80 mb-2">
          توضیح (اختیاری)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="سوال، نیازمندی، یا موضوع خاصی که می‌خواهید در تماس مطرح کنید..."
          className="w-full rounded-xl bg-[#f7fafd] border border-[#e5eaf5] px-3 py-3 text-[14px] text-[#0e1a3d] leading-[1.9] focus:outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 transition resize-none"
        />
      </div>

      {status === "error" && error && (
        <div className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full h-12 rounded-full text-white font-extrabold text-[14.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-70"
        style={{
          background: "linear-gradient(100deg, #0e1a3d 0%, #1b3c8a 100%)",
          boxShadow: "0 14px 32px -10px rgba(14,26,61,0.5)",
        }}
      >
        {status === "submitting"
          ? "در حال ارسال..."
          : "ثبت درخواست تماس و مشاوره"}
      </button>
    </form>
  );
}
