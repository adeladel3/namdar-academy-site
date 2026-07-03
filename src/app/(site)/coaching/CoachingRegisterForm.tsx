"use client";

import { useState } from "react";

export default function CoachingRegisterForm() {
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
          source: "coaching-register-form",
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

  return (
    <form
      onSubmit={submit}
      className="bg-white text-[#010514] rounded-3xl p-6 md:p-8 shadow-2xl space-y-4"
    >
      <h3 className="font-bold text-xl mb-2">درخواست ثبت‌نام در MON</h3>
      <p className="text-sm text-[#010514]/60 mb-4">
        فرم را پر کنید، تا ۴۸ ساعت تماس می‌گیریم.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs text-[#010514]/70 mb-1.5 font-medium">
            نام و نام خانوادگی *
          </span>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] focus:outline-none focus:border-[#1b3c8a]"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-[#010514]/70 mb-1.5 font-medium">
            موبایل *
          </span>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
            dir="ltr"
            placeholder="09123456789"
            className="w-full px-4 py-2.5 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] font-mono focus:outline-none focus:border-[#1b3c8a]"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-xs text-[#010514]/70 mb-1.5 font-medium">
          ایمیل (اختیاری)
        </span>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          dir="ltr"
          className="w-full px-4 py-2.5 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] focus:outline-none focus:border-[#1b3c8a]"
        />
      </label>

      <label className="block">
        <span className="block text-xs text-[#010514]/70 mb-1.5 font-medium">
          سطح فعلی شما در بازار
        </span>
        <select
          value={form.experience}
          onChange={(e) => set("experience", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] focus:outline-none focus:border-[#1b3c8a]"
        >
          <option value="beginner">تازه‌کار</option>
          <option value="intermediate">آشنا با پایه‌ها</option>
          <option value="advanced">ترید می‌کنم ولی سود پایدار ندارم</option>
          <option value="pro">حرفه‌ای — به‌دنبال سطح بالاتر</option>
        </select>
      </label>

      <label className="block">
        <span className="block text-xs text-[#010514]/70 mb-1.5 font-medium">
          توضیح کوتاه هدف شما (اختیاری)
        </span>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] focus:outline-none focus:border-[#1b3c8a] min-h-[80px]"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 rounded-full bg-[#1b3c8a] text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {status === "loading" ? "در حال ارسال..." : "ارسال درخواست"}
      </button>

      {msg && (
        <p
          className={`text-sm px-4 py-3 rounded-xl ${
            status === "ok"
              ? "bg-green-50 text-green-800 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
