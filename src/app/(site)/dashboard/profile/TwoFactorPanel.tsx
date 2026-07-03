"use client";

import { useState } from "react";

type SetupData = {
  secret: string;
  uri: string;
  qrDataUrl: string;
};

type Mode = "idle" | "setup" | "disable";

export default function TwoFactorPanel({
  initiallyEnabled,
}: {
  initiallyEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [mode, setMode] = useState<Mode>("idle");
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function startSetup() {
    setError(null);
    setSuccess(null);
    setCode("");
    setLoading(true);
    try {
      const res = await fetch("/api/user/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در آماده‌سازی");
      setSetup({ secret: data.secret, uri: data.uri, qrDataUrl: data.qrDataUrl });
      setMode("setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!setup) return;
    if (!/^\d{6}$/.test(code)) {
      setError("کد باید ۶ رقم باشد");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: setup.secret, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "کد نامعتبر است");
      setEnabled(true);
      setMode("idle");
      setSetup(null);
      setCode("");
      setSuccess("تایید دو مرحله‌ای با موفقیت فعال شد");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("کد باید ۶ رقم باشد");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "کد نامعتبر است");
      setEnabled(false);
      setMode("idle");
      setCode("");
      setSuccess("تایید دو مرحله‌ای غیرفعال شد");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl bg-white border border-[#e5eaf5] p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-[18px] md:text-[20px] font-extrabold text-[#0e1a3d]">
            تایید دو مرحله‌ای (Google Authenticator)
          </h2>
          <p className="text-[13px] text-[#0e1a3d]/65 mt-1.5 leading-[1.9]">
            با یک اپ شناسه‌ساز مثل Google Authenticator، Authy یا Microsoft
            Authenticator هنگام ورود یک کد ۶ رقمی هم درخواست می‌شود. بدون نیاز
            به اینترنت بین‌المللی کار می‌کند.
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-extrabold ${
            enabled
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-[#f4f7fc] text-[#0e1a3d]/60 border border-[#e5eaf5]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              enabled ? "bg-emerald-500" : "bg-[#0e1a3d]/35"
            }`}
          />
          {enabled ? "فعال" : "غیرفعال"}
        </span>
      </div>

      {success && (
        <div className="mt-4 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-4 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {error}
        </div>
      )}

      {mode === "idle" && (
        <div className="mt-5 flex flex-wrap gap-3">
          {enabled ? (
            <button
              type="button"
              onClick={() => {
                setMode("disable");
                setError(null);
                setSuccess(null);
                setCode("");
              }}
              className="h-11 px-5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[13.5px] font-bold hover:bg-rose-100 transition"
            >
              غیرفعال‌سازی تایید دو مرحله‌ای
            </button>
          ) : (
            <button
              type="button"
              onClick={startSetup}
              disabled={loading}
              className="h-11 px-5 rounded-full bg-[#1b3c8a] text-white text-[13.5px] font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "در حال آماده‌سازی..." : "فعال‌سازی تایید دو مرحله‌ای"}
            </button>
          )}
        </div>
      )}

      {mode === "setup" && setup && (
        <form onSubmit={confirmEnable} className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="shrink-0 rounded-2xl bg-white border border-[#e5eaf5] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.qrDataUrl}
                alt="QR code"
                width={180}
                height={180}
                className="block"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-3 text-[13px] text-[#0e1a3d]/80 leading-[1.9]">
              <p>
                QR بالا را با اپ شناسه‌ساز اسکن کنید. اگر نمی‌توانید اسکن کنید،
                کلید زیر را دستی وارد اپ کنید:
              </p>
              <div
                className="font-mono text-[13px] tracking-[2px] bg-[#f4f7fc] border border-[#e5eaf5] rounded-xl p-3 select-all break-all"
                dir="ltr"
              >
                {setup.secret}
              </div>
              <p className="text-[12px] text-[#0e1a3d]/55">
                بعد از افزودن حساب در اپ، کد ۶ رقمی جاری را پایین وارد کنید تا
                فعال‌سازی تکمیل شود.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#0e1a3d]/85 mb-2">
              کد ۶ رقمی جاری
            </label>
            <input
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="------"
              maxLength={6}
              className="w-full max-w-[280px] h-12 px-4 rounded-xl border border-[#e5eaf5] text-[#0e1a3d] text-center tracking-[0.5em] text-lg font-mono focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-5 rounded-full bg-[#1b3c8a] text-white text-[13.5px] font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "در حال بررسی..." : "تایید و فعال‌سازی"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setSetup(null);
                setCode("");
                setError(null);
              }}
              className="h-11 px-5 rounded-full bg-[#f4f7fc] text-[#0e1a3d]/70 text-[13.5px] font-bold hover:bg-[#eaeff8] transition"
            >
              انصراف
            </button>
          </div>
        </form>
      )}

      {mode === "disable" && (
        <form onSubmit={confirmDisable} className="mt-5 space-y-4">
          <p className="text-[13px] text-[#0e1a3d]/75 leading-[1.9]">
            برای غیرفعال‌سازی، کد ۶ رقمی جاری از اپ شناسه‌ساز را وارد کنید.
          </p>
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="------"
            maxLength={6}
            className="w-full max-w-[280px] h-12 px-4 rounded-xl border border-[#e5eaf5] text-[#0e1a3d] text-center tracking-[0.5em] text-lg font-mono focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
            required
            autoFocus
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-5 rounded-full bg-rose-600 text-white text-[13.5px] font-bold hover:bg-rose-700 transition disabled:opacity-60"
            >
              {loading ? "در حال بررسی..." : "غیرفعال‌سازی"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setCode("");
                setError(null);
              }}
              className="h-11 px-5 rounded-full bg-[#f4f7fc] text-[#0e1a3d]/70 text-[13.5px] font-bold hover:bg-[#eaeff8] transition"
            >
              انصراف
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
