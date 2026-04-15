"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.phone || !form.message) {
      setError("لطفاً فیلدهای ضروری را پر کنید.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("ارسال پیام با خطا مواجه شد");
      setStatus("ok");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "خطا");
    }
  }

  return (
    <div className="bg-[#f7fafd] py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-[#010514] mb-3">
            تماس با ما
          </h1>
          <p className="text-[#010514]/65 max-w-2xl mx-auto">
            تیم نامدار آکادمی در کنار شماست. هر سوالی دارید، از طریق فرم زیر یا
            راه‌های ارتباطی، با ما در میان بگذارید.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 text-center border border-[#e5eaf5]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#136cb5] to-[#49bbbd] flex items-center justify-center text-2xl">
              📞
            </div>
            <h3 className="font-bold text-[#010514] mb-2">شماره تماس</h3>
            <a
              dir="ltr"
              href="tel:02191234567"
              className="text-[#1b3c8a] font-medium hover:underline"
            >
              021-9123-4567
            </a>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center border border-[#e5eaf5]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#136cb5] to-[#49bbbd] flex items-center justify-center text-2xl">
              ✉️
            </div>
            <h3 className="font-bold text-[#010514] mb-2">ایمیل</h3>
            <a
              href="mailto:info@namdaracademy.ir"
              className="text-[#1b3c8a] font-medium hover:underline"
            >
              info@namdaracademy.ir
            </a>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center border border-[#e5eaf5]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#136cb5] to-[#49bbbd] flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="font-bold text-[#010514] mb-2">پیام‌رسان‌ها</h3>
            <p className="text-[#1b3c8a] font-medium">تلگرام و واتساپ</p>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto bg-white rounded-3xl shadow p-8 md:p-10 border border-[#e5eaf5]">
          <h2 className="text-xl md:text-2xl font-bold text-[#010514] mb-6">
            ارسال پیام
          </h2>

          {status === "ok" ? (
            <div className="p-6 text-center rounded-2xl bg-green-50 border border-green-200 text-green-800">
              ✅ پیام شما با موفقیت ارسال شد. تیم ما در اسرع وقت با شما تماس
              خواهد گرفت.
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="block mx-auto mt-3 text-sm text-green-700 underline"
              >
                ارسال پیام جدید
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#010514] mb-2">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-[#e5eaf5] focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#010514] mb-2">
                    شماره تماس *
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-[#e5eaf5] text-left focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#010514] mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-[#e5eaf5] text-left focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#010514] mb-2">
                  متن پیام *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5eaf5] focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15 resize-none"
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="h-12 px-8 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
              >
                {status === "sending" ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
