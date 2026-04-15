"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "info" | "otp";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError("لطفاً نام و نام خانوادگی را کامل وارد کنید");
      return;
    }
    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل معتبر نیست (مثال: 09121234567)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ثبت‌نام با خطا مواجه شد");
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{5,6}$/.test(otp)) {
      setError("کد تایید باید ۵ یا ۶ رقم باشد");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "کد تایید صحیح نیست");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafd] via-white to-[#eef4ff] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#e5eaf5]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#1b3c8a] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4">
            ن
          </div>
          <h1 className="text-2xl font-bold text-[#010514]">
            {step === "info" ? "ثبت‌نام در نامدار آکادمی" : "تایید شماره"}
          </h1>
          <p className="text-sm text-[#010514]/65 mt-2">
            {step === "info"
              ? "به خانواده بزرگ نامدار آکادمی خوش آمدید"
              : `کد ۶ رقمی ارسال‌شده به ${phone} را وارد کنید`}
          </p>
        </div>

        {step === "info" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#010514] mb-2">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="علی محمدی"
                className="w-full h-12 px-4 rounded-xl border border-[#e5eaf5] text-[#010514] focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#010514] mb-2">
                شماره موبایل
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09121234567"
                maxLength={11}
                className="w-full h-12 px-4 rounded-xl border border-[#e5eaf5] text-[#010514] text-left focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </div>
            )}
            <label className="flex items-start gap-2 text-sm text-[#010514]/75">
              <input type="checkbox" required className="mt-1" />
              <span>
                با{" "}
                <Link href="/terms" className="text-[#1b3c8a] hover:underline">
                  قوانین و مقررات
                </Link>{" "}
                و{" "}
                <Link href="/privacy" className="text-[#1b3c8a] hover:underline">
                  حریم خصوصی
                </Link>{" "}
                موافقم.
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "در حال ارسال..." : "ثبت‌نام و ارسال کد تایید"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#010514] mb-2">
                کد تایید
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
                maxLength={6}
                className="w-full h-14 px-4 rounded-xl border border-[#e5eaf5] text-[#010514] text-center tracking-[0.5em] text-xl font-mono focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
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
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "در حال بررسی..." : "تایید و تکمیل ثبت‌نام"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#e5eaf5] text-center text-sm text-[#010514]/65">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="text-[#1b3c8a] font-bold hover:underline">
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
}
