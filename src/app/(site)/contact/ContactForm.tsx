"use client";

import { useState } from "react";

export default function ContactForm({
  courses = [],
}: {
  courses?: { slug: string; title: string }[];
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    relatedCourseSlug: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (form.name.trim().length < 3) {
      setStatus("error");
      setMsg("نام و نام خانوادگی را کامل وارد کنید");
      return;
    }
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 8) {
      setStatus("error");
      setMsg("شماره تماس معتبر وارد کنید");
      return;
    }
    if (form.message.trim().length < 10) {
      setStatus("error");
      setMsg("متن پیام خیلی کوتاه است");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          subject: form.subject || "پیام از صفحه تماس",
          message: form.message,
          relatedCourseSlug: form.relatedCourseSlug || undefined,
          source: "contact-page",
        }),
      });
      if (!res.ok) throw new Error("ارسال پیام با خطا مواجه شد");
      setStatus("ok");
      setMsg("پیام شما با موفقیت ثبت شد و در اسرع وقت بررسی خواهد شد.");
      setForm({
        name: "",
        phone: "",
        email: "",
        subject: "",
        relatedCourseSlug: "",
        message: "",
      });
    } catch (e) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "خطای شبکه");
    }
  }

  const inputCx =
    "w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-[#f7cf5a]/70 focus:bg-white/[0.10] focus:ring-2 focus:ring-[#f7cf5a]/20 transition backdrop-blur";

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-[2rem] p-6 md:p-8 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 40%), rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.30), 0 30px 70px -20px rgba(0,0,0,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-3 left-6 w-24 h-3 rounded-full bg-white/35 blur-sm pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[#f7cf5a]/15 blur-3xl pointer-events-none"
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/35 text-[10px] tracking-[0.22em] font-extrabold text-[#f7cf5a] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
          SEND US A MESSAGE
        </div>
        <h2 className="font-extrabold text-white text-2xl md:text-3xl leading-tight mb-1.5">
          ارسال پیام
        </h2>
        <p className="text-sm text-white/65 mb-6">
          فرم را پر کنید — کارشناسان ما در اسرع وقت پاسخ می‌دهند.
        </p>
      </div>

      <div className="relative space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
              نام و نام خانوادگی <span className="text-[#f7cf5a]">*</span>
            </span>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className={inputCx}
            />
          </label>
          <label className="block">
            <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
              شماره موبایل <span className="text-[#f7cf5a]">*</span>
            </span>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
              dir="ltr"
              placeholder="09123456789"
              className={`${inputCx} font-mono text-left`}
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
              ایمیل (اختیاری)
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              dir="ltr"
              className={`${inputCx} text-left`}
            />
          </label>
          <label className="block">
            <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
              موضوع
            </span>
            <select
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              className={inputCx}
            >
              <option value="" className="text-[#010514]">
                یک گزینه انتخاب کنید
              </option>
              <option value="مشاوره دوره" className="text-[#010514]">
                مشاوره دوره
              </option>
              <option value="پشتیبانی حساب" className="text-[#010514]">
                پشتیبانی حساب
              </option>
              <option value="همکاری و نمایندگی" className="text-[#010514]">
                همکاری و نمایندگی
              </option>
              <option value="سایر" className="text-[#010514]">
                سایر
              </option>
            </select>
          </label>
        </div>

        {courses.length > 0 && (
          <label className="block">
            <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
              دوره یا سرویس مورد نظر (اختیاری)
            </span>
            <select
              value={form.relatedCourseSlug}
              onChange={(e) => set("relatedCourseSlug", e.target.value)}
              className={inputCx}
            >
              <option value="" className="text-[#010514]">
                — بدون مورد خاص —
              </option>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug} className="text-[#010514]">
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
            متن پیام <span className="text-[#f7cf5a]">*</span>
          </span>
          <textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-[#f7cf5a]/70 focus:bg-white/[0.10] focus:ring-2 focus:ring-[#f7cf5a]/20 transition backdrop-blur resize-none leading-8"
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className="group relative w-full py-4 rounded-full font-extrabold text-base md:text-lg transition active:translate-y-[1px] disabled:opacity-60 text-[#2d1c03] shadow-[0_14px_40px_-10px_rgba(247,207,90,0.7),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(247,207,90,0.85),inset_0_1px_0_rgba(255,255,255,0.6)]"
          style={{
            background:
              "linear-gradient(180deg, #f7cf5a 0%, #e8bc3a 50%, #d4a62a 100%)",
          }}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {status === "sending" ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="animate-spin"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="14 40"
                  />
                </svg>
                در حال ارسال…
              </>
            ) : (
              <>
                ارسال پیام
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:-translate-x-1"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </>
            )}
          </span>
        </button>

        {msg && (
          <p
            className={`relative text-sm px-4 py-3 rounded-xl backdrop-blur ${
              status === "ok"
                ? "bg-emerald-400/15 text-emerald-100 border border-emerald-300/30"
                : "bg-red-400/15 text-red-100 border border-red-300/30"
            }`}
          >
            {msg}
          </p>
        )}

        <p className="text-[11px] text-white/45 text-center leading-6">
          با ارسال این فرم، پذیرفته‌اید که تیم پشتیبانی نامدار آکادمی با شما تماس
          بگیرد.
        </p>
      </div>
    </form>
  );
}
