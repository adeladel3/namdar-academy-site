"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileForm({
  initial,
}: {
  initial: {
    name: string;
    email: string;
    avatar: string;
    phone: string;
    createdAt: number;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [status, setStatus] = useState<
    "idle" | "saving" | "done" | "error"
  >("idle");
  const [msg, setMsg] = useState("");

  const dirty =
    name.trim() !== initial.name ||
    email.trim().toLowerCase() !== (initial.email ?? "").toLowerCase() ||
    avatar.trim() !== (initial.avatar ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || status === "saving") return;
    setStatus("saving");
    setMsg("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          avatar: avatar.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || "خطا در ذخیره اطلاعات");
        setStatus("error");
        return;
      }
      setStatus("done");
      setMsg("تغییرات با موفقیت ذخیره شد.");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setMsg("خطا در ارتباط با سرور");
      setStatus("error");
    }
  }

  const initial_char = (name.trim() || "ن")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar preview */}
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div
            className="shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl ring-4 ring-white shadow-[0_12px_30px_-10px_rgba(27,60,138,0.6)] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1b3c8a, #136cb5 55%, #49bbbd)",
            }}
          >
            {avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatar}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              initial_char
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-[#0e1a3d] text-[15px] mb-1">
              تصویر پروفایل
            </div>
            <p className="text-[12px] text-[#0e1a3d]/55 leading-7">
              نشانی (URL) یک تصویر مربعی را وارد کنید. اگر خالی بگذارید، حرف اول
              نام به‌عنوان آواتار نمایش داده می‌شود.
            </p>
            <input
              type="url"
              dir="ltr"
              placeholder="https://example.com/avatar.jpg"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="mt-3 w-full h-11 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[13px] text-[#0e1a3d] px-4 focus:outline-none focus:border-[#136cb5] focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Identity fields */}
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6 space-y-4">
        <div className="font-extrabold text-[#0e1a3d] text-[15px] mb-1">
          اطلاعات شخصی
        </div>

        <Field label="نام و نام خانوادگی" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            className="w-full h-12 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[14.5px] text-[#0e1a3d] px-4 focus:outline-none focus:border-[#136cb5] focus:bg-white transition"
          />
        </Field>

        <Field label="ایمیل" hint="برای ارسال فاکتور و اطلاع‌رسانی (اختیاری)">
          <input
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full h-12 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[14px] text-[#0e1a3d] px-4 focus:outline-none focus:border-[#136cb5] focus:bg-white transition"
          />
        </Field>

        <Field
          label="شمارهٔ موبایل"
          hint="شمارهٔ ورودی قابل تغییر نیست. برای تغییر با پشتیبانی در تماس باشید."
        >
          <input
            type="tel"
            dir="ltr"
            value={initial.phone}
            readOnly
            className="w-full h-12 rounded-2xl bg-[#f1f4f9] border border-[#e3e9f4] text-[14.5px] text-[#0e1a3d]/60 px-4 cursor-not-allowed tracking-wider"
          />
        </Field>
      </div>

      {/* Status + submit */}
      {msg && (
        <div
          className={`p-3.5 rounded-2xl text-[13px] font-bold ${
            status === "done"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-[11.5px] text-[#0e1a3d]/50">
          حساب ایجاد شده در: {new Date(initial.createdAt).toLocaleDateString("fa-IR")}
        </div>
        <button
          type="submit"
          disabled={!dirty || status === "saving"}
          className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-white font-extrabold text-[14px] transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg,#1b3c8a,#136cb5 55%,#1b3c8a)",
            boxShadow: "0 14px 30px -10px rgba(19,108,181,0.55)",
          }}
        >
          {status === "saving" ? "در حال ذخیره..." : "ذخیرهٔ تغییرات"}
          {status !== "saving" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-bold text-[#0e1a3d]/80 mb-1.5">
        {label}
        {required && <span className="text-rose-500 mr-1">*</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-[11px] text-[#0e1a3d]/50 mt-1.5 leading-6">
          {hint}
        </span>
      )}
    </label>
  );
}
