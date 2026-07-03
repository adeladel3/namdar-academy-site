"use client";

import Link from "@/components/SafeLink";
import { useState } from "react";
import { phoneToTelHref } from "@/lib/formatting";

export default function MonActionBoxes({
  contactPhone = "021-9100-8222",
}: {
  contactPhone?: string;
}) {
  return (
    <div
      className="absolute left-[156px] right-[157px] top-[3492px]"
      dir="rtl"
    >
      <div className="grid grid-cols-3 gap-5 h-[500px]">
        {/* ========== BOX 1 — Product page card (GOLD) ========== */}
        <ProductPageCard />

        {/* ========== BOX 2 — Callback form (GREEN + ANIMATED) ========== */}
        <CallbackCard />

        {/* ========== BOX 3 — Direct phone (DARK BLUE) ========== */}
        <DirectCallCard contactPhone={contactPhone} />
      </div>

      <style jsx global>{`
        @keyframes monShimmerAb {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes monBorderPulse {
          0%, 100% {
            box-shadow: 0 20px 50px rgba(74,222,128,0.28),
                        0 0 0 0 rgba(74,222,128,0.55);
          }
          50% {
            box-shadow: 0 20px 50px rgba(74,222,128,0.45),
                        0 0 0 10px rgba(74,222,128,0);
          }
        }
        @keyframes monSweep {
          0% { transform: translateX(0); }
          60%, 100% { transform: translateX(650%); }
        }
        @keyframes monIconGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.1); }
        }
        @keyframes monIconWiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-10deg); }
          30% { transform: rotate(10deg); }
          45% { transform: rotate(-6deg); }
          60% { transform: rotate(6deg); }
          75% { transform: rotate(0deg); }
        }
        @keyframes monBtnPulse {
          0%, 100% { filter: brightness(1); box-shadow: 0 8px 24px rgba(74,222,128,0.4); }
          50% { filter: brightness(1.12); box-shadow: 0 10px 30px rgba(74,222,128,0.65); }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 1 — Product page (Gold)
// ---------------------------------------------------------------------------
function ProductPageCard() {
  return (
    <Link
      href="/coaching"
      className="mon-action-box group relative rounded-[24px] p-[1.5px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(247,207,90,0.45)]"
      style={{
        background:
          "linear-gradient(135deg, #f7cf5a 0%, #ffb84a 50%, #f7cf5a 100%)",
        boxShadow: "0 18px 40px rgba(247,207,90,0.35)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
          animation: "monShimmerAb 1.8s ease-in-out infinite",
        }}
      />
      <div
        className="relative h-full rounded-[23px] p-7 flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, #f7cf5a 0%, #ffb84a 100%)",
        }}
      >
        {/* Header — icon + STEP chip */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-[64px] h-[64px] rounded-2xl bg-[#2d1c03]/15 flex items-center justify-center shadow-[inset_0_2px_6px_rgba(45,28,3,0.12)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d1c03" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-8H9v8H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <span
            className="font-['Poppins:Bold',sans-serif] text-[13px] text-[#2d1c03]/85 tracking-[2px] px-3 py-1.5 rounded-full bg-[#2d1c03]/10 border border-[#2d1c03]/15"
            dir="ltr"
          >
            STEP 01
          </span>
        </div>

        {/* Title + subtitle */}
        <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[30px] text-[#2d1c03] leading-[1.2] mb-1.5">
          صفحه دوره <span className="font-['Poppins:Bold',sans-serif]" dir="ltr">MON</span>
        </h3>
        <p className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px] text-[#2d1c03]/80 leading-[1.5] mb-4">
          مسیر کامل دوره در یک نگاه
        </p>

        <div className="h-px bg-[#2d1c03]/15 mb-4" />

        {/* Description */}
        <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[16px] text-[#2d1c03]/90 leading-[1.85] mb-4">
          سرفصل‌های دقیق، قیمت <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[#2d1c03]">شفاف</span>، روش پرداخت <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[#2d1c03]">اقساطی</span> و دریافت <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[#2d1c03]">گواهی‌نامه معتبر</span>.
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 mb-auto">
          {[
            { label: "۳۶ ساعت ویدیو", icon: "▶" },
            { label: "۱۲ هفته آموزش", icon: "◉" },
            { label: "گواهی معتبر", icon: "★" },
          ].map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#2d1c03]/10 border border-[#2d1c03]/15 font-['Yekan_Bakh:Bold',sans-serif] text-[13.5px] text-[#2d1c03]"
            >
              <span className="text-[11px]">{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-[14px] bg-[#2d1c03] text-[#f7cf5a] group-hover:bg-[#1a0f02] transition-colors">
            <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px]">مشاهده صفحه دوره</span>
            <span className="w-8 h-8 rounded-full bg-[#f7cf5a] flex items-center justify-center transition-transform group-hover:-translate-x-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d1c03" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center justify-center gap-2 text-[#2d1c03]/85 hover:text-[#2d1c03] font-['Yekan_Bakh:Bold',sans-serif] text-[14.5px] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            دانلود سرفصل PDF
          </button>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Card 2 — Callback request form (Green, animated)
// ---------------------------------------------------------------------------
function CallbackCard() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  function sanitize(v: string) {
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

  function isValid(v: string) {
    const digits = v.replace(/\D/g, "");
    if (digits.startsWith("09") && digits.length === 11) return true;
    if (digits.startsWith("989") && digits.length === 12) return true;
    if (digits.startsWith("9") && digits.length === 10) return true;
    if (digits.startsWith("0") && digits.length >= 10 && digits.length <= 11) return true;
    return false;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    if (!isValid(phone)) {
      setErrorMsg("شماره وارد‌شده معتبر نیست. مثال: 09123456789");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/callback-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          source: "mon-coaching-action-box",
          relatedCourseSlug: "mon",
          topic: "کوچینگ MON",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "خطا در ارسال درخواست");
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "خطا در ارسال درخواست");
      setStatus("error");
    }
  }

  const isError = status === "error";
  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";
  const valid = isValid(phone);
  const typing = phone.length > 0 && !valid && !isError;
  const idle = !valid && !isError && !isSubmitting && phone.length === 0;

  return (
    <div
      className="relative rounded-[24px] p-[1.5px] overflow-hidden transition-transform duration-300"
      style={{
        background: isError
          ? "linear-gradient(135deg, rgba(239,68,68,0.7), rgba(239,68,68,0.25) 50%, rgba(239,68,68,0.7))"
          : isSuccess
          ? "linear-gradient(135deg, rgba(74,222,128,0.85), rgba(73,187,189,0.4) 50%, rgba(74,222,128,0.85))"
          : "linear-gradient(135deg, rgba(74,222,128,0.7) 0%, rgba(73,187,189,0.3) 50%, rgba(74,222,128,0.7) 100%)",
        boxShadow: "0 18px 40px rgba(74,222,128,0.28)",
        animation: idle ? "monBorderPulse 2.4s ease-in-out infinite" : undefined,
      }}
    >
      {/* sweep shimmer on idle */}
      {idle && (
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-[24px] overflow-hidden"
        >
          <span
            className="absolute inset-y-0 -left-1/3 w-1/3 opacity-80"
            style={{
              background:
                "linear-gradient(110deg, transparent 0%, rgba(74,222,128,0.35) 50%, transparent 100%)",
              animation: "monSweep 3s ease-in-out infinite",
            }}
          />
        </span>
      )}

      <div
        className="relative h-full rounded-[23px] p-7 flex flex-col"
        style={{
          background: "linear-gradient(135deg, #0a0e2f, #1a1555)",
        }}
      >
        {/* Header — icon + STEP chip */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative shrink-0">
            <span
              aria-hidden
              className="absolute -inset-2 rounded-[22px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(74,222,128,0.55) 0%, transparent 70%)",
                animation: "monIconGlow 1.8s ease-in-out infinite",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-0 rounded-2xl animate-ping opacity-55"
              style={{ background: "rgba(74,222,128,0.45)" }}
            />
            <span
              aria-hidden
              className="absolute -inset-1 rounded-2xl blur-[10px] opacity-60"
              style={{ background: "#4ade80" }}
            />
            <div
              className="relative w-[64px] h-[64px] rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                boxShadow: "0 8px 22px rgba(74,222,128,0.55)",
                animation: idle ? "monIconWiggle 2s ease-in-out infinite" : undefined,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#052e1b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#4ade80]/35 bg-[#4ade80]/10">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
            </span>
            <span
              className="font-['Poppins:Bold',sans-serif] text-[13px] text-[#4ade80] tracking-[2px]"
              dir="ltr"
            >
              STEP 02
            </span>
          </div>
        </div>

        {/* Title + subtitle */}
        <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[30px] text-white leading-[1.2] mb-1.5">
          درخواست <span className="text-[#4ade80]">تماس کارشناس</span>
        </h3>
        <p className="font-['Yekan_Bakh:Bold',sans-serif] text-[15px] text-white/80 leading-[1.7] mb-4">
          ساعات پاسخ‌گویی در روزهای کاری:
          <br />
          شنبه تا چهارشنبه — ساعت ۹:۰۰ الی ۱۸:۰۰
          <br />
          پنجشنبه — ساعت ۹:۰۰ الی ۱۴:۰۰
        </p>

        <div className="h-px bg-white/10 mb-4" />

        {isSuccess ? (
          <>
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
              <div
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #4ade80, #22c55e)",
                  boxShadow: "0 8px 22px rgba(74,222,128,0.55)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#052e1b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4 className="font-['Yekan_Bakh:Bold',sans-serif] text-[22px] text-white">
                درخواست شما ثبت شد
              </h4>
              <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[15px] text-white/80 leading-[1.75] max-w-[280px]">
                تیم نامدار آکادمی تا ۲۴ ساعت آینده با شما تماس خواهد گرفت.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhone("");
                setStatus("idle");
              }}
              className="mt-4 text-center font-['Yekan_Bakh:Bold',sans-serif] text-[14.5px] text-white/75 hover:text-white transition-colors"
            >
              ثبت درخواست جدید
            </button>
          </>
        ) : (
          <>
            {/* Description */}
            <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[16px] text-white/85 leading-[1.85] mb-4">
              اگر سوالی درباره <span className="font-['Yekan_Bakh:Bold',sans-serif] text-white">سرفصل دوره</span>، شرایط <span className="font-['Yekan_Bakh:Bold',sans-serif] text-white">ثبت‌نام</span> یا روش پرداخت دارید، شماره‌تان را بگذارید.
            </p>

            <form onSubmit={submit} className="mt-auto flex flex-col gap-3">
              <div className="relative">
                {(typing || valid || idle) && (
                  <span
                    aria-hidden
                    className="absolute -inset-[2px] rounded-[14px] pointer-events-none blur-[6px] opacity-70"
                    style={{
                      backgroundImage: valid
                        ? "linear-gradient(90deg, #4ade80, #22c55e, #4ade80)"
                        : "linear-gradient(90deg, #4ade80, #ffb84a, #4ade80)",
                      backgroundSize: "200% 100%",
                      animation: "monShimmerAb 1.6s linear infinite",
                    }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-2.5 h-[56px] rounded-[13px] border-[1.5px] px-4 transition-all duration-200 ${
                    isError
                      ? "border-[#ef4444] bg-[#fff5f5]"
                      : valid
                      ? "border-[#4ade80] bg-white shadow-[0_0_0_3px_rgba(74,222,128,0.25)]"
                      : "border-white bg-white focus-within:border-[#4ade80] focus-within:shadow-[0_0_0_3px_rgba(74,222,128,0.25)]"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isError ? "#ef4444" : "#22c55e"}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 ${typing || idle ? "animate-pulse" : ""}`}
                  >
                    <rect x="7" y="2" width="10" height="20" rx="2" />
                    <path d="M11 18h2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => {
                      setPhone(sanitize(e.target.value));
                      if (isError) {
                        setStatus("idle");
                        setErrorMsg("");
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none font-['Poppins:Bold',sans-serif] text-[19px] text-[#081738] tabular-nums tracking-[1.5px] placeholder:text-[#081738]/55 placeholder:font-['Poppins:Medium',sans-serif] placeholder:tracking-wide"
                    aria-invalid={isError}
                  />
                  {valid && (
                    <span
                      className="shrink-0 w-[24px] h-[24px] rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #4ade80, #22c55e)",
                        boxShadow: "0 3px 10px rgba(74,222,128,0.55)",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#052e1b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                  {typing && (
                    <span className="shrink-0 flex items-center">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#f7cf5a] opacity-70 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f7cf5a]" />
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {isError && errorMsg && (
                <div
                  className="text-[12px] text-[#fca5a5] font-['Yekan_Bakh:Medium',sans-serif] leading-tight flex items-center gap-1.5"
                  dir="rtl"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !valid}
                className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-[14px] transition-all disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  // CTA visibility was the user's chief complaint: in idle the
                  // button was a translucent 35%-opacity green chip on a dark
                  // card — invisible from across the room. Now idle and typing
                  // states share the same fully-saturated green gradient as
                  // `valid` so the call-to-action reads from first glance;
                  // the visual difference between "ready" and "not-yet" lives
                  // in opacity + shadow, not in the colour itself.
                  background:
                    "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  color: "#052e1b",
                  boxShadow: valid
                    ? "0 10px 28px rgba(74,222,128,0.55)"
                    : "0 6px 18px rgba(74,222,128,0.35)",
                  animation: idle ? "monBtnPulse 1.6s ease-in-out infinite" : undefined,
                  opacity: isSubmitting ? 1 : valid ? 1 : 0.88,
                }}
                aria-label="ثبت درخواست تماس"
              >
                <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px]">
                  {isSubmitting ? "در حال ثبت..." : "ثبت درخواست تماس"}
                </span>
                <span className="w-8 h-8 rounded-full bg-[#052e1b]/15 flex items-center justify-center">
                  {isSubmitting ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 2a10 10 0 1 1-7.07 2.93" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5" />
                      <path d="M12 19l-7-7 7-7" />
                    </svg>
                  )}
                </span>
              </button>

              <p className="text-center font-['Yekan_Bakh:Bold',sans-serif] text-[13px] text-white/80 leading-tight">
                پاسخ‌گویی ۷ روز هفته · بدون محدودیت سوال
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 3 — Direct phone call (Dark blue)
// ---------------------------------------------------------------------------
function DirectCallCard({ contactPhone }: { contactPhone: string }) {
  const [copied, setCopied] = useState(false);

  const phoneNumber = contactPhone;
  const telHref = phoneToTelHref(contactPhone);

  async function copy() {
    try {
      await navigator.clipboard.writeText(phoneNumber.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="mon-action-box group relative rounded-[24px] p-[1.5px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background:
          "linear-gradient(135deg, rgba(122,196,255,0.7), rgba(163,124,255,0.3) 50%, rgba(122,196,255,0.7))",
        boxShadow: "0 18px 40px rgba(122,196,255,0.28)",
      }}
    >
      <div
        className="relative h-full rounded-[23px] p-7 flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, #0a0e2f, #1a1555)",
        }}
      >
        {/* Header — icon + STEP chip */}
        <div className="flex items-start justify-between mb-5">
          <div className="shrink-0 relative">
            <span
              aria-hidden
              className="absolute -inset-1 rounded-2xl blur-[10px] opacity-55"
              style={{ background: "#7ac4ff" }}
            />
            <div
              className="relative w-[64px] h-[64px] rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7ac4ff, #4a90ff)",
                boxShadow: "0 8px 22px rgba(122,196,255,0.5)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#061a33" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
          </div>
          <span
            className="font-['Poppins:Bold',sans-serif] text-[13px] text-[#7ac4ff] tracking-[2px] px-3 py-1.5 rounded-full bg-[#7ac4ff]/10 border border-[#7ac4ff]/30"
            dir="ltr"
          >
            STEP 03
          </span>
        </div>

        {/* Title + subtitle */}
        <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[30px] text-white leading-[1.2] mb-1.5">
          تماس <span className="text-[#7ac4ff]">مستقیم</span>
        </h3>
        <p className="font-['Yekan_Bakh:Bold',sans-serif] text-[15px] text-white/80 leading-[1.7] mb-4">
          ساعات پاسخ‌گویی در روزهای کاری:
          <br />
          شنبه تا چهارشنبه — ساعت ۹:۰۰ الی ۱۸:۰۰
          <br />
          پنجشنبه — ساعت ۹:۰۰ الی ۱۴:۰۰
        </p>

        <div className="h-px bg-white/10 mb-4" />

        {/* Description */}
        <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[16px] text-white/85 leading-[1.85] mb-4">
          برای سوالات <span className="font-['Yekan_Bakh:Bold',sans-serif] text-white">فوری</span>، گفتگوی سریع با کارشناس یا دریافت <span className="font-['Yekan_Bakh:Bold',sans-serif] text-white">مشاوره لحظه‌ای</span>، مستقیم با دفتر مرکزی تماس بگیرید.
        </p>

        {/* Phone number display card */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-[14px] mb-auto"
          style={{
            background:
              "linear-gradient(135deg, rgba(122,196,255,0.12), rgba(122,196,255,0.04))",
            border: "1px solid rgba(122,196,255,0.25)",
          }}
        >
          <div className="text-right">
            <div className="font-['Yekan_Bakh:Bold',sans-serif] text-[13px] text-white/65 tracking-wide mb-1">
              شماره دفتر مرکزی
            </div>
            <div
              className="font-['Poppins:Bold',sans-serif] text-[26px] text-white tabular-nums tracking-[0.5px] leading-none"
              dir="ltr"
            >
              {phoneNumber}
            </div>
          </div>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all hover:bg-[#7ac4ff]/20"
            style={{
              background: copied
                ? "linear-gradient(135deg, #4ade80, #22c55e)"
                : "rgba(122,196,255,0.15)",
              border: "1px solid rgba(122,196,255,0.3)",
            }}
            aria-label={copied ? "کپی شد" : "کپی شماره"}
          >
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#052e1b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ac4ff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-3">
          <a
            href={telHref}
            className="group/btn flex items-center justify-between gap-3 px-4 py-3.5 rounded-[14px] transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #7ac4ff 0%, #4a90ff 100%)",
              boxShadow: "0 10px 28px rgba(122,196,255,0.45)",
            }}
          >
            <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px] text-[#061a33]">
              تماس فوری
            </span>
            <span className="w-8 h-8 rounded-full bg-[#061a33] flex items-center justify-center transition-transform group-hover/btn:-translate-x-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7ac4ff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </span>
          </a>
          <a
            href="https://wa.me/989123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-white/80 hover:text-[#4ade80] font-['Yekan_Bakh:Bold',sans-serif] text-[14.5px] transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.85 12.85 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            واتس‌اپ پشتیبانی
          </a>
        </div>
      </div>
    </div>
  );
}
