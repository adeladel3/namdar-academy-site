"use client";

import Link from "@/components/SafeLink";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { toEnglishDigits } from "@/lib/formatting";

type Step = "phone" | "otp" | "totp";

// Only accept same-origin relative paths. Blocks `//evil.com/x`,
// `https://evil.com`, `javascript:...`, and protocol-relative URLs that some
// user agents interpret as cross-origin redirects.
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/dashboard";
  return raw;
}

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpChallenge, setTotpChallenge] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDevCode(null);
    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل معتبر نیست (مثال: 09121234567)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ارسال کد با خطا مواجه شد");
      if (typeof data.devCode === "string") setDevCode(data.devCode);
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
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "کد تایید صحیح نیست");
      if (data.requiresTotp && typeof data.challenge === "string") {
        setTotpChallenge(data.challenge);
        setStep("totp");
        return;
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(totpCode)) {
      setError("کد شناسه‌ساز باید ۶ رقم باشد");
      return;
    }
    if (!totpChallenge) {
      setError("نشست تایید منقضی شده. دوباره وارد شوید");
      setStep("phone");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge: totpChallenge, code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "کد شناسه‌ساز صحیح نیست");
      router.push(next);
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
          <div className="flex justify-center mb-5">
            <BrandLogo variant="dark" size="md" />
          </div>
          <h1 className="text-2xl font-bold text-[#010514]">
            {step === "phone"
              ? "ورود به نامدار آکادمی"
              : step === "otp"
              ? "تایید شماره"
              : "تایید دو مرحله‌ای"}
          </h1>
          <p className="text-sm text-[#010514]/65 mt-2">
            {step === "phone"
              ? "شماره موبایل خود را وارد کنید تا کد تایید ارسال شود"
              : step === "otp"
              ? `کد ۶ رقمی ارسال‌شده به ${phone} را وارد کنید`
              : "کد ۶ رقمی را از اپ شناسه‌ساز (Google Authenticator) وارد کنید"}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#010514] mb-2">
                شماره موبایل
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) =>
                  setPhone(toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 11))
                }
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
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "در حال ارسال..." : "ارسال کد تایید"}
            </button>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={handleVerify} className="space-y-4">
            {devCode && (
              <button
                type="button"
                onClick={() => setOtp(devCode)}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-right hover:bg-amber-100 transition"
              >
                <div>
                  <div className="text-[11px] font-extrabold tracking-wider">DEV MODE</div>
                  <div className="text-[11.5px] opacity-80 mt-0.5">
                    کلیک کنید تا کد خودکار وارد شود
                  </div>
                </div>
                <div className="font-mono text-lg font-black tabular-nums" dir="ltr">
                  {devCode}
                </div>
              </button>
            )}
            <div>
              <label className="block text-sm font-medium text-[#010514] mb-2">
                کد تایید
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={otp}
                onChange={(e) =>
                  setOtp(toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 6))
                }
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
              {loading ? "در حال بررسی..." : "تایید و ورود"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
              className="w-full text-sm text-[#1b3c8a] hover:underline"
            >
              ویرایش شماره موبایل
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyTotp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#010514] mb-2">
                کد شناسه‌ساز
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                value={totpCode}
                onChange={(e) =>
                  setTotpCode(toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 6))
                }
                placeholder="------"
                maxLength={6}
                className="w-full h-14 px-4 rounded-xl border border-[#e5eaf5] text-[#010514] text-center tracking-[0.5em] text-xl font-mono focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
                required
                autoFocus
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
              {loading ? "در حال بررسی..." : "تایید و ورود"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setTotpCode("");
                setTotpChallenge(null);
                setError(null);
              }}
              className="w-full text-sm text-[#1b3c8a] hover:underline"
            >
              بازگشت به ابتدا
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#e5eaf5] text-center text-sm text-[#010514]/65">
          حساب ندارید؟{" "}
          <Link href="/signup" className="text-[#1b3c8a] font-bold hover:underline">
            ثبت‌نام کنید
          </Link>
        </div>
      </div>
    </div>
  );
}
