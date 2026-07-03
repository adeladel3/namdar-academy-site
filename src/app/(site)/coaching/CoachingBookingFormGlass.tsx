"use client";

import { useState } from "react";

export default function CoachingBookingFormGlass() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    experience: "beginner",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );
  const [msg, setMsg] = useState("");

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 3) {
      setStatus("err");
      setMsg("نام کامل را وارد کنید");
      return;
    }
    if (!/^09\d{9}$/.test(form.phone)) {
      setStatus("err");
      setMsg("شماره موبایل معتبر وارد کنید");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          subject: "ثبت‌نام در کوچینگ MON",
          message: `سطح فعلی: ${form.experience}${form.message ? `\n\n${form.message}` : ""}`,
          relatedCourseSlug: "mon",
          source: "coaching-booking-glass",
        }),
      });
      if (res.ok) {
        setStatus("ok");
        setMsg("درخواست شما ثبت شد. تیم پذیرش به‌زودی تماس می‌گیرد.");
        setForm({
          name: "",
          phone: "",
          email: "",
          experience: "beginner",
          message: "",
        });
      } else {
        setStatus("err");
        setMsg("خطا در ارسال — دوباره تلاش کنید");
      }
    } catch {
      setStatus("err");
      setMsg("خطای شبکه");
    }
  }

  const inputCx =
    "w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/45 focus:outline-none focus:border-[#f7cf5a]/70 focus:bg-white/15 transition backdrop-blur";

  return (
    <form
      onSubmit={submit}
      className="relative rounded-3xl p-6 md:p-7 space-y-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 40%), rgba(255,255,255,0.10)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.28)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.35), 0 30px 70px -20px rgba(0,0,0,0.55), 0 0 30px -10px rgba(247,207,90,0.25)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-3 left-6 w-20 h-3 rounded-full bg-white/40 blur-sm pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-[#f7cf5a]/15 blur-3xl pointer-events-none"
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7cf5a]/20 border border-[#f7cf5a]/40 text-[10px] tracking-[0.2em] font-extrabold text-[#f7cf5a] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
          BOOK YOUR SEAT
        </div>
        <h3 className="font-extrabold text-white text-xl md:text-2xl mb-1">
          فرم ثبت‌نام کوچینگ MON
        </h3>
        <p className="text-xs md:text-sm text-white/70 mb-4">
          فرم را پر کنید، تا ۴۸ ساعت تیم پذیرش با شما تماس می‌گیرد.
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
            نام و نام خانوادگی *
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
            موبایل *
          </span>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
            dir="ltr"
            placeholder="09123456789"
            className={`${inputCx} font-mono`}
          />
        </label>
      </div>

      <label className="relative block">
        <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
          ایمیل (اختیاری)
        </span>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          dir="ltr"
          className={inputCx}
        />
      </label>

      <label className="relative block">
        <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
          سطح فعلی شما در بازار
        </span>
        <select
          value={form.experience}
          onChange={(e) => set("experience", e.target.value)}
          className={inputCx}
        >
          <option value="beginner" className="text-[#010514]">
            تازه‌کار
          </option>
          <option value="intermediate" className="text-[#010514]">
            آشنا با پایه‌ها
          </option>
          <option value="advanced" className="text-[#010514]">
            ترید می‌کنم ولی سود پایدار ندارم
          </option>
          <option value="pro" className="text-[#010514]">
            حرفه‌ای — به‌دنبال سطح بالاتر
          </option>
        </select>
      </label>

      <label className="relative block">
        <span className="block text-[11px] text-white/70 mb-1.5 font-bold">
          توضیح کوتاه هدف شما (اختیاری)
        </span>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCx} min-h-[90px] leading-7`}
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="relative w-full py-4 rounded-full font-extrabold text-base md:text-lg transition disabled:opacity-50 text-[#2d1c03] shadow-[0_14px_40px_-10px_rgba(247,207,90,0.7),inset_0_1px_0_rgba(255,255,255,0.45)]"
        style={{
          background:
            "linear-gradient(180deg, #f7cf5a 0%, #e8bc3a 50%, #d4a62a 100%)",
        }}
      >
        {status === "loading" ? "در حال ارسال..." : "ارسال درخواست ثبت‌نام"}
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
    </form>
  );
}
