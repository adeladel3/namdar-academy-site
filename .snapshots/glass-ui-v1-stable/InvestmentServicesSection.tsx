"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const imgInvestingHub = "/figma/investing-hub-clean.png";
const imgFinvestCopy1 = "/figma/finvestcopy1.png";
const imgUntitled1Copy1 = "/figma/untitled1copy1.png";

export default function InvestmentServicesSection() {
  const [open, setOpen] = useState(false);

  // ESC to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* The card */}
      <div
        className="absolute h-[1000px] w-[720px] left-[calc(50%-360px)] top-[5232px]"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="باز کردن جزئیات Investing Hub"
          className="group relative block h-full w-full rounded-[28px] overflow-hidden transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_48px_110px_rgba(60,90,150,0.45)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4a90ff]/40 cursor-pointer bg-transparent border-0 p-0"
          style={{
            boxShadow:
              "0 36px 90px rgba(60,90,150,0.35), 0 12px 32px rgba(30,60,120,0.18)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgInvestingHub}
            alt="Investing Hub"
            className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-[1.02]"
            draggable={false}
          />

          {/* subtle hover shimmer */}
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 45%, rgba(255,255,255,0.08) 100%)",
            }}
          />

          {/*
            "Investing Hub" — placed directly onto the cleaned image.
            The baked "Feature" pill and "Transparent Glass Effect" title
            were both inpainted out of the PNG itself (per-column above/below
            glass sampling with vertical interpolation), so the scene now
            has a clean empty strip where the title sits. No mask, badge,
            background or border are needed here — just the text.
          */}
          <h3
            className="absolute font-['Poppins:Bold',sans-serif] text-white pointer-events-none"
            style={{
              top: "57.2%",
              left: "20%",
              right: "20%",
              margin: 0,
              fontSize: "48px",
              lineHeight: 1,
              letterSpacing: "-1.6px",
              textShadow: "0 2px 14px rgba(15,30,55,0.25)",
            }}
            dir="ltr"
          >
            Investing Hub
          </h3>

          {/*
            FRONT pill — the dominant readable layer, sharper and more opaque
            than the depth layer behind it. Carries only its own Persian content.
          */}
          <div
            className="absolute pointer-events-none flex items-center gap-3.5 rounded-[20px] px-5 py-3.5"
            dir="rtl"
            style={{
              left: "17%",
              right: "17%",
              bottom: "18%",
              background:
                "linear-gradient(145deg, rgba(55,85,125,0.82) 0%, rgba(28,52,88,0.88) 100%)",
              border: "1px solid rgba(255,255,255,0.24)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.22), 0 14px 34px rgba(10,20,45,0.55)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="shrink-0 w-[40px] h-[40px] rounded-full flex items-center justify-center"
              style={{
                background: "rgba(235,243,252,0.95)",
                border: "2px solid rgba(110,155,205,0.9)",
                boxShadow: "0 3px 10px rgba(15,30,55,0.3)",
              }}
              aria-hidden
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3d5685"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>

            <p className="flex-1 font-['Yekan_Bakh:Medium',sans-serif] text-[13.5px] text-white leading-[1.65] text-right">
              ترکیب معامله‌گری هوشمند{" "}
              <span className="font-['Poppins:Bold',sans-serif] text-[#f7dea0]" dir="ltr">
                FINVEST
              </span>{" "}
              و سبدچینی اختصاصی{" "}
              <span className="font-['Poppins:Bold',sans-serif] text-[#d9b6ff]" dir="ltr">
                NOVA
              </span>{" "}
              — سیگنال لحظه‌ای، تحلیل AI و مشاوره ۲۴ ساعته.
            </p>
          </div>

          {/* "Click to explore" hint ribbon — appears on hover */}
          <span
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-md"
            style={{
              background: "rgba(10,20,40,0.55)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 8px 22px rgba(10,20,40,0.35)",
            }}
            dir="ltr"
            aria-hidden
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-white tracking-wide">
              Click to explore
            </span>
          </span>
        </button>
      </div>

      {/* Modal */}
      {open && <HubModal onClose={() => setOpen(false)} />}

      <style jsx global>{`
        @keyframes hubModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hubModalScaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(18px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
function HubModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ animation: "hubModalFadeIn 220ms ease-out both" }}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hub-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="بستن"
        className="absolute inset-0 w-full h-full bg-transparent border-0 p-0 cursor-default"
        style={{
          background: "rgba(6,12,30,0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-[1100px] rounded-[32px] overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #8fa8cc 0%, #5d7aa8 45%, #2e4470 100%)",
          boxShadow:
            "0 60px 140px rgba(6,12,30,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          animation: "hubModalScaleIn 380ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Ambient lights */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: "-120px",
            top: "-120px",
            width: 460,
            height: 460,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(247,207,90,0.28) 0%, transparent 68%)",
            filter: "blur(50px)",
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            right: "-120px",
            bottom: "-120px",
            width: 460,
            height: 460,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(199,75,255,0.28) 0%, transparent 68%)",
            filter: "blur(50px)",
          }}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-5 left-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="relative px-10 pt-10 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: "rgba(10,20,40,0.45)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#b0c6ff] animate-ping opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b0c6ff]" />
            </span>
            <span className="font-['Poppins:Bold',sans-serif] text-[11px] text-white/90 tracking-[2.4px]" dir="ltr">
              HUB · DIVERSIFY
            </span>
          </div>
          <h2
            id="hub-modal-title"
            className="font-['Poppins:Black',sans-serif] text-white leading-[1.05] tracking-[-1.5px] mb-3"
            style={{ fontSize: 54 }}
            dir="ltr"
          >
            Investing Hub
          </h2>
          <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[17px] text-white/80 leading-[1.65] max-w-[720px] mx-auto">
            دو سرویس مکمل برای مدیریت هوشمند سرمایه — همه تخم‌مرغ‌ها را در یک سبد نگذار.
          </p>
        </div>

        {/* Two brand cards */}
        <div className="relative px-8 pb-10 grid grid-cols-2 gap-5">
          <BrandCard
            brand="FINVEST"
            tagline="FINVEST TRADING ASSISTANT"
            title="دستیار معامله‌گری فینوست"
            subtitle="سیگنال‌های حرفه‌ای + تحلیل AI"
            logoSrc={imgFinvestCopy1}
            logoStyle={{ left: -36, top: -20, width: 252, height: 125, maxWidth: "none" }}
            features={[
              "سیگنال لحظه‌ای طلا، نفت و شاخص‌ها",
              "تحلیل تکنیکال هوشمند با AI",
              "مدیریت ریسک و هشدار خودکار",
              "آنلاین ۲۴ ساعته ۷ روز هفته",
            ]}
            cta="اطلاعات بیشتر"
            href="/coaching"
            accent="#f7cf5a"
            accentSoft="#ffb84a"
            bg="linear-gradient(135deg, #0a0e2f 0%, #1a1555 60%, #2a1a4a 100%)"
          />
          <BrandCard
            brand="NOVA"
            tagline="NOVA PORTFOLIO CONSULTING"
            title="مشاوره سبدچینی نوا"
            subtitle="سبد متناسب با سطح ریسک شما"
            logoSrc={imgUntitled1Copy1}
            features={[
              "سبدچینی اختصاصی هم‌راستا با اهداف",
              "جلسات آنلاین با کارشناسان ارشد",
              "گزارش عملکرد ماهانه با جزئیات",
              "مشاوره و پشتیبانی ۲۴ ساعته",
            ]}
            cta="درخواست مشاوره"
            href="/coaching"
            accent="#c74bff"
            accentSoft="#a534e1"
            bg="linear-gradient(135deg, #120b2f 0%, #2a1055 55%, #3a0f66 100%)"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function BrandCard({
  brand,
  tagline,
  title,
  subtitle,
  logoSrc,
  logoStyle,
  features,
  cta,
  href,
  accent,
  accentSoft,
  bg,
}: {
  brand: string;
  tagline: string;
  title: string;
  subtitle: string;
  logoSrc: string;
  logoStyle?: React.CSSProperties;
  features: string[];
  cta: string;
  href: string;
  accent: string;
  accentSoft: string;
  bg: string;
}) {
  return (
    <div
      className="relative rounded-[24px] p-[1.5px] overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent}66, rgba(255,255,255,0.08) 50%, ${accent}66)`,
      }}
    >
      <div
        className="relative rounded-[23px] p-6 flex flex-col h-full"
        style={{ background: bg }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <span
              aria-hidden
              className="absolute -inset-3 rounded-full"
              style={{
                background: `radial-gradient(circle, ${accent}55 0%, transparent 65%)`,
                filter: "blur(12px)",
              }}
            />
            <div
              className="relative w-[62px] h-[62px] rounded-full overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentSoft})`,
                boxShadow: `0 10px 26px ${accent}55, inset 0 0 0 1.5px rgba(255,255,255,0.22)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={`${brand} logo`}
                className="absolute"
                style={
                  logoStyle ?? {
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: 8,
                  }
                }
              />
            </div>
          </div>
          <span
            className="font-['Poppins:Bold',sans-serif] text-[11px] tracking-[2px] px-3 py-1.5 rounded-full"
            style={{
              color: accent,
              background: `${accent}14`,
              border: `1px solid ${accent}35`,
            }}
            dir="ltr"
          >
            {brand}
          </span>
        </div>

        {/* Brand tagline */}
        <p
          className="font-['Poppins:Medium',sans-serif] text-[10.5px] tracking-[2.2px] mb-2"
          style={{ color: `${accent}cc` }}
          dir="ltr"
        >
          {tagline}
        </p>

        {/* Title + subtitle */}
        <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[24px] text-white leading-[1.2] mb-1">
          {title}
        </h3>
        <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[14px] text-white/70 leading-[1.5] mb-4">
          {subtitle}
        </p>

        {/* Features */}
        <ul className="flex flex-col gap-2.5 mb-5 mb-auto">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-right">
              <span
                className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accentSoft})`,
                  boxShadow: `0 3px 10px ${accent}55`,
                }}
                aria-hidden
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a0e2f"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="font-['Yekan_Bakh:Medium',sans-serif] text-[14px] text-white/90 leading-[1.45]">
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={href}
          className="group/btn mt-auto flex items-center justify-between gap-3 px-5 py-3 rounded-[14px] transition-transform duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${accentSoft} 100%)`,
            boxShadow: `0 10px 24px ${accent}55, inset 0 0 0 1px rgba(255,255,255,0.22)`,
          }}
        >
          <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[15px] text-[#0a0e2f]">
            {cta}
          </span>
          <span className="w-7 h-7 rounded-full bg-[#0a0e2f] flex items-center justify-center transition-transform group-hover/btn:-translate-x-1">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accent}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
