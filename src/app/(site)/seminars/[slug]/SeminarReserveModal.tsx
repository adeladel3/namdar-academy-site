"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { faDigits, toEnglishDigits } from "@/lib/formatting";

type Step = "details" | "otp" | "redirecting";

export default function SeminarReserveModal({
  open,
  onClose,
  seminarSlug,
  seminarTitle,
  priceLabel,
  alreadyAuthed,
  defaultName,
  defaultPhone,
}: {
  open: boolean;
  onClose: () => void;
  seminarSlug: string;
  seminarTitle: string;
  priceLabel: string;
  /** اگر کاربر از قبل login باشد، مرحله OTP را کلاً رد می‌کنیم
   *  و فقط دو فیلد نام و کد ملی را می‌گیریم. */
  alreadyAuthed: boolean;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [fullName, setFullName] = useState(defaultName ?? "");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [otp, setOtp] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // قفل کردن اسکرول پس‌زمینه وقتی پاپ‌آپ بازه
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC برای بستن
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  // ریست مرحله وقتی پاپ‌آپ باز/بسته می‌شود
  useEffect(() => {
    if (open) {
      setStep("details");
      setError(null);
      setInfo(null);
      setOtp("");
      setChallenge(null);
    }
  }, [open]);

  // شمارنده‌ی ارسال مجدد OTP
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // فوکوس روی فیلد OTP وقتی وارد مرحله می‌شویم
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const cleanPhone = useMemo(
    () => toEnglishDigits(phone).replace(/\D/g, ""),
    [phone]
  );
  const cleanNationalId = useMemo(
    () => toEnglishDigits(nationalId).replace(/\D/g, ""),
    [nationalId]
  );

  function validateDetails(): string | null {
    if (fullName.trim().length < 3) return "نام و نام خانوادگی را کامل وارد کنید";
    if (!/^\d{10}$/.test(cleanNationalId)) return "کد ملی باید ۱۰ رقم باشد";
    if (!alreadyAuthed && !/^09\d{9}$/.test(cleanPhone))
      return "شماره موبایل معتبر نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹)";
    return null;
  }

  async function submitDetails() {
    setError(null);
    const v = validateDetails();
    if (v) {
      setError(v);
      return;
    }
    if (alreadyAuthed) {
      // login هست — مرحله OTP را skip می‌کنیم و مستقیم checkout
      await goCheckout(null);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/seminars/${encodeURIComponent(seminarSlug)}/reserve/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            nationalId: cleanNationalId,
            phone: cleanPhone,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ارسال کد تأیید");
      setChallenge(data.challenge);
      setStep("otp");
      setResendIn(60);
      if (data.devCode) {
        setInfo(`(حالت توسعه) کد تست: ${faDigits(data.devCode)}`);
      } else {
        setInfo(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendOtp() {
    if (resendIn > 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/seminars/${encodeURIComponent(seminarSlug)}/reserve/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            nationalId: cleanNationalId,
            phone: cleanPhone,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ارسال کد تأیید");
      setChallenge(data.challenge);
      setResendIn(60);
      if (data.devCode) setInfo(`(حالت توسعه) کد تست: ${faDigits(data.devCode)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitOtp() {
    const code = toEnglishDigits(otp).replace(/\D/g, "");
    if (!/^\d{5,6}$/.test(code)) {
      setError("کد تأیید را کامل وارد کنید");
      return;
    }
    if (!challenge) {
      setError("نشست رزرو منقضی شده — لطفاً از ابتدا تلاش کنید");
      setStep("details");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/seminars/${encodeURIComponent(seminarSlug)}/reserve/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challenge, otp: code }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "کد نامعتبر است");
      // OTP تأیید شد و session ست شد — حالا چالش را به checkout می‌فرستیم.
      await goCheckout(challenge);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setSubmitting(false);
    }
  }

  async function goCheckout(challengeToken: string | null) {
    setStep("redirecting");
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/seminars/${encodeURIComponent(seminarSlug)}/reserve/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challenge: challengeToken ?? undefined,
            fullName: alreadyAuthed ? fullName.trim() : undefined,
            nationalId: alreadyAuthed ? cleanNationalId : undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.registered) {
          // قبلاً ثبت‌نام کرده — مستقیم به پنل سمینار ببریمش
          router.push(`/dashboard/seminars/${encodeURIComponent(seminarSlug)}`);
          return;
        }
        throw new Error(data.error ?? "خطا در اتصال به درگاه");
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      throw new Error("پاسخ نامعتبر از سرور");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
      setStep(alreadyAuthed ? "details" : "otp");
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seminar-reserve-title"
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#06142f]/60 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ animation: "reservePopIn 0.22s ease-out" }}
      >
        {/* هدر */}
        <div className="relative bg-gradient-to-l from-[#1b3c8a] via-[#136cb5] to-[#49bbbd] text-white px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5">
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            aria-label="بستن"
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center disabled:opacity-50 z-10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
          <div className="flex items-start gap-2.5 sm:gap-3 mb-3 pl-10">
            <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#f7cf5a] text-[#2d1c03] flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(212,166,42,0.55)]">
              <svg className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2a2 2 0 0 0 0 4v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-2a2 2 0 0 0 0-4z" />
                <path d="M9 6v12" strokeDasharray="2 3" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs text-white/80 mb-0.5 leading-tight">ظرفیت محدود — رزرو صندلی</div>
              <h2
                id="seminar-reserve-title"
                className="text-sm sm:text-lg font-extrabold leading-snug line-clamp-2 break-words"
              >
                {seminarTitle}
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[11px] sm:text-xs bg-white/15 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold whitespace-nowrap">
              مبلغ: {priceLabel}
            </span>
            <StepDots step={step} />
          </div>
        </div>

        {/* بدنه */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {step === "details" && (
            <>
              <Field label="نام و نام خانوادگی (مطابق شناسنامه)">
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثلاً: امیرحسین نام‌آور"
                  disabled={submitting}
                  className={inputCls}
                />
              </Field>
              <Field label="کد ملی">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  autoComplete="off"
                  value={nationalId}
                  // فقط ارقام مجاز است (انگلیسی/فارسی/عربی). هر کاراکتر
                  // غیرعددی همان لحظه‌ی ورود حذف می‌شود تا کاربر نتواند
                  // حروف فارسی یا کاراکترهای دیگر تایپ کند.
                  onChange={(e) =>
                    setNationalId(
                      toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  // چون input به‌خاطر اعداد dir="ltr" دارد، در غیاب این wrapping
                  // کلمات فارسی placeholder جابه‌جا می‌شوند ("۱۰ رقم" → "رقم ۱۰").
                  // U+202B (RLE) + U+202C (PDF) یک Right-to-Left Embedding می‌سازد
                  // که فقط ترتیب نمایش placeholder را اصلاح می‌کند؛ روی value و
                  // ورود اعداد توسط کاربر اثری ندارد.
                  placeholder={"‫۱۰ رقم‬"}
                  maxLength={10}
                  disabled={submitting}
                  className={`${inputCls} font-mono tracking-wider`}
                  dir="ltr"
                />
              </Field>
              {!alreadyAuthed && (
                <Field label="شماره موبایل">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="\d*"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 11),
                      )
                    }
                    placeholder="09123456789"
                    maxLength={11}
                    disabled={submitting}
                    className={`${inputCls} font-mono tracking-wider`}
                    dir="ltr"
                  />
                </Field>
              )}
              {alreadyAuthed && defaultPhone && (
                <p className="text-[11px] text-[#010514]/55 flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  وارد حساب کاربری <span dir="ltr" className="font-mono">{defaultPhone}</span> هستید
                </p>
              )}
            </>
          )}

          {step === "otp" && (
            <>
              <p className="text-sm text-[#010514]/75 leading-7">
                کد ۶ رقمی به شماره <span dir="ltr" className="font-mono font-bold text-[#1b3c8a]">{cleanPhone}</span> ارسال شد.
              </p>
              <Field label="کد تأیید">
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="••••••"
                  maxLength={6}
                  disabled={submitting}
                  className={`${inputCls} font-mono tracking-[0.5em] text-center text-lg`}
                  dir="ltr"
                />
              </Field>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendIn > 0 || submitting}
                  className="text-[#1b3c8a] font-bold hover:underline disabled:text-[#010514]/40 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendIn > 0
                    ? `ارسال مجدد در ${faDigits(resendIn)} ثانیه`
                    : "ارسال مجدد کد"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setError(null);
                  }}
                  className="text-[#010514]/65 hover:text-[#1b3c8a]"
                  disabled={submitting}
                >
                  اصلاح شماره
                </button>
              </div>
            </>
          )}

          {step === "redirecting" && (
            <div className="py-10 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin"
                  style={{ animationDuration: "1.2s" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
              <p className="text-sm text-[#010514]/75 leading-7">
                در حال انتقال به درگاه پرداخت...
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 leading-6">
              {error}
            </p>
          )}
          {info && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-6">
              {info}
            </p>
          )}
        </div>

        {/* فوتر */}
        {step !== "redirecting" && (
          <div className="px-6 py-4 border-t border-[#eef2f7] bg-[#f7fafd]">
            {step === "details" && (
              <button
                type="button"
                onClick={submitDetails}
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-l from-[#1b3c8a] to-[#136cb5] text-white font-extrabold text-[15px] shadow-lg shadow-[#136cb5]/25 hover:opacity-95 transition disabled:opacity-60"
              >
                {submitting ? "در حال ارسال کد..." : alreadyAuthed ? "ادامه و پرداخت" : "ارسال کد تأیید"}
              </button>
            )}
            {step === "otp" && (
              <button
                type="button"
                onClick={submitOtp}
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-l from-[#1b3c8a] to-[#136cb5] text-white font-extrabold text-[15px] shadow-lg shadow-[#136cb5]/25 hover:opacity-95 transition disabled:opacity-60"
              >
                {submitting ? "در حال انتقال به درگاه..." : "تأیید و پرداخت"}
              </button>
            )}
            <p className="text-[10.5px] text-[#010514]/55 text-center mt-3 leading-5">
              با کلیک روی ادامه با{" "}
              <a href="/p/terms" target="_blank" className="text-[#1b3c8a] font-bold hover:underline">
                قوانین استفاده
              </a>{" "}
              موافقت می‌کنید.
            </p>
          </div>
        )}

        <style jsx>{`
          @keyframes reservePopIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-[#e5eaf5] bg-white text-[#010514] placeholder:text-[#010514]/35 focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15 transition disabled:opacity-60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-[#010514]/70 mb-1.5 font-bold">{label}</span>
      {children}
    </label>
  );
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["details", "otp", "redirecting"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center gap-1.5">
      {order.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i === idx
              ? "w-6 bg-[#f7cf5a]"
              : i < idx
              ? "w-3 bg-white/75"
              : "w-3 bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}
