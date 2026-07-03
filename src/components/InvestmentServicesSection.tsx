"use client";

import Link from "@/components/SafeLink";
import { useEffect, useRef, useState } from "react";

const imgEggs = "/figma/investing-hub-shell.png";
const imgFinvestCopy1 = "/figma/finvestcopy1.png";
const imgUntitled1Copy1 = "/figma/untitled1copy1.png";

// Feature chips — easy to edit / reorder / add. Arranged as a 3×2 grid
// inside the bottom glass shell of the Investing Hub frame. Order follows
// RTL reading: row 1 right→left, then row 2 right→left.
type HubFeature = {
  key: string;
  label: string;
  title: string;
  tagline: string;
  desc: string;
  highlights: string[];
  href: string;
  accent: string;
};

const HUB_FEATURES: readonly HubFeature[] = [
  {
    key: "forex",
    label: "ترید فارکس",
    title: "ترید حرفه‌ای بازار فارکس",
    tagline: "FOREX TRADING",
    desc: "آموزش جامع معامله‌گری در بازار جهانی جفت‌ارزها — از پرایس‌اکشن و تحلیل تکنیکال تا مدیریت ریسک و روان‌شناسی معامله.",
    highlights: [
      "تحلیل تکنیکال پیشرفته جفت‌ارزها",
      "استراتژی‌های معامله‌گری روزانه و سوئینگ",
      "مدیریت سرمایه و ریسک حرفه‌ای",
      "معامله زنده همراه با تیم تحلیل",
    ],
    href: "/coaching?feature=forex",
    accent: "#7ab8ff",
  },
  {
    key: "gold",
    label: "نوسان‌گیری طلا",
    title: "نوسان‌گیری در بازار طلا",
    tagline: "GOLD SCALPING",
    desc: "روش‌های اختصاصی تحلیل و نوسان‌گیری در طلای جهانی (XAUUSD) با نگاه به ست‌آپ‌های ساختارمند.",
    highlights: [
      "تحلیل لحظه‌ای بازار طلا",
      "بررسی نقاط احتمالی چرخش قیمت",
      "چارچوب‌های معاملاتی با مدیریت ریسک",
      "هم‌خوانی با اخبار اقتصادی و داده‌های کلان",
    ],
    href: "/coaching?feature=gold",
    accent: "#f7cf5a",
  },
  {
    key: "ai",
    label: "تحلیل هوشمند AI",
    title: "تحلیل هوشمند با هوش مصنوعی",
    tagline: "AI ANALYSIS",
    desc: "به کمک مدل‌های هوش مصنوعی، چارت‌ها را لحظه‌ای اسکن می‌کنیم و فرصت‌های معاملاتی قابل بررسی را شناسایی می‌کنیم.",
    highlights: [
      "اسکن لحظه‌ای چارت‌ها با AI",
      "شناسایی خودکار الگوهای کلاسیک",
      "پیشنهاد ست‌آپ‌های قابل بررسی",
      "هشدار هوشمند در شکست سطوح کلیدی",
    ],
    href: "/coaching?feature=ai",
    accent: "#b48bff",
  },
  {
    key: "crypto",
    label: "نوسان‌گیری کریپتو",
    title: "نوسان‌گیری در بازار کریپتو",
    tagline: "CRYPTO TRADING",
    desc: "روش‌های تخصصی نوسان‌گیری در بازار ارزهای دیجیتال — از بیت‌کوین و اتریوم تا آلت‌کوین‌های پرپتانسیل.",
    highlights: [
      "تحلیل تایم‌فریم کوتاه و میان‌مدت",
      "بررسی داده‌های آنچین و حجم معاملات",
      "مدیریت پرتفوی ارزهای دیجیتال",
      "شناسایی آلت‌کوین‌های آماده حرکت",
    ],
    href: "/coaching?feature=crypto",
    accent: "#f4a358",
  },
  {
    key: "signal",
    label: "سیگنال لحظه‌ای",
    title: "سیگنال‌های لحظه‌ای معاملاتی",
    tagline: "LIVE SIGNALS",
    desc: "دریافت سیگنال‌های تحلیلی لحظه‌ای از تیم تحلیلگران، همراه با جزئیات ورود، حد ضرر و حد سود پیشنهادی.",
    highlights: [
      "نقاط پیشنهادی ورود، حد ضرر و حد سود",
      "دلایل منطقی هر تحلیل",
      "ارسال از تلگرام و اپ اختصاصی",
      "آرشیو عملکرد سیگنال‌ها در دوره‌های قبل",
    ],
    href: "/coaching?feature=signal",
    accent: "#6be6c1",
  },
  {
    key: "support",
    label: "مشاوره ۲۴ ساعته",
    title: "مشاوره و پشتیبانی ۲۴ ساعته",
    tagline: "24/7 SUPPORT",
    desc: "تیم کارشناسان نامدار آکادمی در تمام ساعات شبانه‌روز آماده پاسخگویی، بررسی معاملات و راهنمایی شماست.",
    highlights: [
      "پاسخ سریع به سوالات تحلیلی",
      "بررسی معاملات باز شما",
      "راهنمایی در لحظات بحرانی بازار",
      "ارتباط مستقیم با تیم پشتیبانی",
    ],
    href: "/coaching?feature=support",
    accent: "#ff89b3",
  },
];

// Geometry of the 3×2 grid layout (inside the 1440×1000 frame).
// Centred horizontally on the frame and anchored toward the bottom of
// the glass shell so chips sit cleanly inside the glass card.
const HUB_GRID = {
  cx: 720,
  cy: 820,   // vertical centre of grid → bottom band of glass
  cols: 3,
  rows: 2,
  bw: 280,
  bh: 70,
  gx: 42,    // horizontal gap between buttons
  gy: 28,    // vertical gap between rows
} as const;

export default function InvestmentServicesSection() {
  const [open, setOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<HubFeature | null>(null);

  const hubDialogRef = useRef<HTMLDialogElement>(null);
  const featureDialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native <dialog>s via showModal/close. The browser places them
  // in the top layer, so they escape the transformed .figma-canvas ancestor
  // — no portal, no scroll-lock tricks, no layout reflow on the big canvas.
  // That eliminates the visible "kick" we had with the fixed/portal modal.
  useEffect(() => {
    const el = hubDialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = featureDialogRef.current;
    if (!el) return;
    if (activeFeature) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [activeFeature]);

  return (
    <>
      {/*
        SINGLE WIDE ROUNDED CONTAINER — 1440×1000, rounded-[28px].
        - Sharp eggs stay at their original 720×1000 footprint in the
          centre, NOT resized or moved.
        - To make the extended left/right regions indistinguishable from
          the original image, we layer three effects:
            1. a heavily blurred copy of the eggs image (scaled 1.8×)
               fills the whole frame, so the colour/lighting bleeds
               naturally past the 720×1000 centre,
            2. a horizontal colour gradient on top matches the image's
               left and right edge tones,
            3. the sharp centre image is feather-masked on its left and
               right edges (12% fade) so it blends into the backdrop
               with no visible seam.
      */}
      {/*
        SINGLE WIDE ROUNDED CONTAINER — 1440×1000, rounded-[28px].
        - Sharp eggs stay at their original 720×1000 footprint in the
          centre, NOT resized or moved.
        - To make the extended left/right regions indistinguishable from
          the original image, we layer three effects:
            1. a heavily blurred copy of the eggs image (scaled 1.8×)
               fills the whole frame, so the colour/lighting bleeds
               naturally past the 720×1000 centre,
            2. a horizontal colour gradient on top matches the image's
               left and right edge tones,
            3. the sharp centre image is feather-masked on its left and
               right edges (12% fade) so it blends into the backdrop
               with no visible seam.
      */}
      <div
        className="investing-hub-frame absolute h-[1000px] w-[1440px] left-[calc(50%-720px)] top-[5232px] rounded-[28px] overflow-hidden bg-[#5a7e9d]"
        dir="rtl"
      >
        {/* Ambient backdrop — heavily blurred so the eggs dissolve into a
            pure colour field. Scale 1.8× pushes stretched pixels off-canvas
            on the sides, leaving only clean colour bleed. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgEggs}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{
            filter: "blur(110px) saturate(115%)",
            transform: "scale(1.8)",
          }}
        />

        {/* Edge-colour continuation — tints the far left and far right to
            the average edge colour of the eggs image, so the transition
            from sharp centre to soft backdrop is perfectly colour-matched. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(94,126,160,0.55) 0%, rgba(94,126,160,0) 22%, rgba(94,126,160,0) 78%, rgba(94,126,160,0.55) 100%)",
          }}
        />

        {/* Sharp eggs — original 720×1000, centred. The FINVEST/NOVA detail
            modal that used to open on click was retired per user request
            (2026-04); the visual is now purely decorative. */}
        <div
          aria-hidden
          className="absolute h-[1000px] w-[720px] left-[calc(50%-360px)] top-0 overflow-hidden"
          style={{
            /* 2-axis feather mask:
               - horizontal: fade left/right 12% edges into backdrop,
               - vertical  : fade the bottom ~half (glass-shell band)
                 into backdrop so the visible seam disappears and the
                 section below the eggs blends like the blurred bg.
               mask-composite: intersect → BOTH masks must be opaque. */
            maskImage: [
              "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              "linear-gradient(180deg, #000 0%, #000 48%, transparent 78%)",
            ].join(", "),
            WebkitMaskImage: [
              "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              "linear-gradient(180deg, #000 0%, #000 48%, transparent 78%)",
            ].join(", "),
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgEggs}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />
        </div>

        {/* INVESTING HUB — luxury English lockup above the eggs.
            Uses Cinzel for the elegant serif caps; hairline ornaments
            on both sides for an editorial/haute feel. */}
        <div
          aria-hidden
          className="absolute top-[20px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none z-10"
        >
          <div className="flex items-center gap-5">
            <span
              className="block h-px w-[110px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.65))",
              }}
            />
            <span
              className="block w-1.5 h-1.5 rotate-45"
              style={{ background: "rgba(255,255,255,0.8)" }}
            />
            <span
              className="block h-px w-[110px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.65), transparent)",
              }}
            />
          </div>
          <h2
            className="text-center whitespace-nowrap"
            style={{
              fontFamily: "var(--font-cinzel), 'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 64,
              letterSpacing: "0.32em",
              lineHeight: 1,
              paddingRight: "0.32em",
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #e8eef8 55%, #b7c9e2 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow:
                "0 2px 18px rgba(0,0,0,0.22), 0 0 48px rgba(0,0,0,0.18)",
              filter:
                "drop-shadow(0 4px 24px rgba(10,22,48,0.45))",
            }}
            dir="ltr"
          >
            INVESTING HUB
          </h2>
          <div className="flex items-center gap-3">
            <span
              className="block h-px w-[70px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4))",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontWeight: 500,
                fontSize: 11,
                letterSpacing: "0.6em",
                color: "rgba(255,255,255,0.78)",
                paddingRight: "0.6em",
              }}
              dir="ltr"
            >
              NAMDAR CAPITAL
            </span>
            <span
              className="block h-px w-[70px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.4), transparent)",
              }}
            />
          </div>
        </div>

        {/* Feature glass buttons — arranged as a 3×2 grid inside the
            bottom glass shell of the frame. RTL reading order: index 0
            sits in the top-right cell. */}
        {(() => {
          const totalW =
            HUB_GRID.cols * HUB_GRID.bw + (HUB_GRID.cols - 1) * HUB_GRID.gx;
          const totalH =
            HUB_GRID.rows * HUB_GRID.bh + (HUB_GRID.rows - 1) * HUB_GRID.gy;
          const startX = HUB_GRID.cx - totalW / 2;
          const startY = HUB_GRID.cy - totalH / 2;
          return HUB_FEATURES.map((f, i) => {
            const col = i % HUB_GRID.cols;
            const row = Math.floor(i / HUB_GRID.cols);
            // RTL: rightmost column is column 0 visually
            const visualCol = HUB_GRID.cols - 1 - col;
            const x = startX + visualCol * (HUB_GRID.bw + HUB_GRID.gx);
            const y = startY + row * (HUB_GRID.bh + HUB_GRID.gy);
            return (
              <div
                key={f.label}
                className="hub-grid__slot absolute z-10"
                style={{
                  left: x,
                  top: y,
                  width: HUB_GRID.bw,
                  height: HUB_GRID.bh,
                }}
              >
                <FeatureGlassButton
                  label={f.label}
                  onClick={(e) => {
                    // Blur the clicked button BEFORE setState so it stops
                    // being :focus. Otherwise the browser's "keep focused
                    // elt in view" heuristic can scrollIntoView on the
                    // transformed .figma-canvas ancestor.
                    (e.currentTarget as HTMLButtonElement).blur();
                    setActiveFeature(f);
                  }}
                />
              </div>
            );
          });
        })()}

        {/* CTA — centered just above the 3×2 feature grid (grid spans
            y=736..904). Glass pill matching the feature buttons'
            aesthetic, sized a touch larger to read as a primary action. */}
        <Link
          href="/courses/investing-hub"
          aria-label="مشاهده کامل Investing Hub"
          className="group absolute z-20 inline-flex items-center justify-center rounded-xl px-10 py-4 text-[17px] font-extrabold text-[#3a2405] transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f7cf5a]"
          style={{
            left: "50%",
            top: 640,
            transform: "translateX(-50%)",
            background:
              "linear-gradient(180deg, rgba(255,235,150,0.55) 0%, rgba(247,207,90,0.4) 45%, rgba(212,164,73,0.35) 100%)",
            backdropFilter: "blur(22px) saturate(1.8)",
            WebkitBackdropFilter: "blur(22px) saturate(1.8)",
            border: "1px solid rgba(255,230,140,0.7)",
            boxShadow:
              "0 18px 40px -10px rgba(212,164,73,0.55), inset 0 1.5px 0 rgba(255,250,220,0.85), inset 0 -1.5px 0 rgba(170,120,30,0.28), inset 0 12px 24px rgba(255,245,200,0.35), inset 0 -10px 22px rgba(170,120,30,0.2), 0 0 20px rgba(247,207,90,0.25)",
            textShadow: "0 1px 3px rgba(255,245,200,0.6)",
          }}
        >
          {/* Top specular sheen — the wet-highlight band that sells the
              glass-with-gold illusion. Sits above the gradient at ~18% opacity. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-[3px] h-[40%] rounded-[8px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 85%)",
              filter: "blur(0.5px)",
            }}
          />
          <span className="relative">مشاهده کامل Investing Hub</span>
        </Link>
      </div>

      {/* Modal — native <dialog>, top layer, no scroll lock */}
      <HubModal
        ref={hubDialogRef}
        open={open}
        onClose={() => setOpen(false)}
      />

      {/* Feature detail popup — native <dialog>, top layer */}
      <FeaturePopup
        ref={featureDialogRef}
        feature={activeFeature}
        onClose={() => setActiveFeature(null)}
      />

      <style jsx global>{`
        .hub-modal-dialog[open],
        .hub-feature-dialog[open],
        .hub-detail-dialog[open] {
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          inset: 0;
          margin: 0;
          padding: 24px;
          background: transparent;
          border: 0;
          color: inherit;
          overflow: auto;
          display: grid;
          place-items: center;
        }
        .hub-modal-dialog::backdrop,
        .hub-feature-dialog::backdrop,
        .hub-detail-dialog::backdrop {
          background: rgba(6, 12, 30, 0.35);
        }
      `}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
/**
 * FeatureGlassButton — a glass-morphism button matching the scene's palette.
 * Shows a feature label + arrow; on hover, lifts, brightens, and slides a
 * subtle sheen across the surface. Link makes each feature navigable.
 */
function FeatureGlassButton({
  label,
  onClick,
}: {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hub-feature group relative flex items-center gap-3.5 rounded-xl px-5 w-full h-full text-right focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4a90ff]/40 overflow-hidden cursor-pointer"
      style={{
        backgroundImage: [
          "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 18%)",
          "linear-gradient(148deg, rgba(130,165,205,0.55) 0%, rgba(55,90,135,0.70) 100%)",
        ].join(", "),
        border: "1px solid rgba(255,255,255,0.26)",
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,0.44)",
          "inset 0 -1px 0 rgba(0,15,40,0.18)",
          "0 8px 22px rgba(10,22,48,0.20)",
        ].join(", "),
      }}
    >
      {/* Hover sheen */}
      <span
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-xl"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 70%)",
        }}
      />

      {/* Icon bubble */}
      <span
        aria-hidden
        className="hub-feature__icon shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{
          background:
            "linear-gradient(160deg, rgba(240,246,254,0.95) 0%, rgba(200,220,245,0.85) 100%)",
          border: "1.5px solid rgba(120,160,210,0.75)",
          boxShadow:
            "0 3px 10px rgba(10,22,48,0.28), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3a537f"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>

      {/* Label */}
      <span className="hub-feature__label flex-1 font-['Yekan_Bakh:Bold',sans-serif] text-[17px] text-white leading-[1.1] whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Native <dialog> wrapper. The browser top-layer makes the dialog escape
// every stacking context / transformed ancestor on the page, so there is
// no paint/layout work on the big figma-canvas when it opens.
function HubModal({
  ref,
  open,
  onClose,
}: {
  ref: React.Ref<HTMLDialogElement>;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="hub-modal-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        // Click-outside-to-close: dialog fills the viewport; clicks outside
        // the inner card land on the dialog itself.
        if (e.target === e.currentTarget) onClose();
      }}
      className="hub-modal-dialog"
      dir="rtl"
    >
      {open && (
      <div
        className="relative w-full max-w-[1100px] rounded-[32px] overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #8fa8cc 0%, #5d7aa8 45%, #2e4470 100%)",
          boxShadow:
            "0 60px 140px rgba(6,12,30,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
          border: "1.5px solid rgba(255,255,255,0.2)",
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
            هیچ‌وقت همهٔ تخم‌مرغ‌هایت را در یک سبد نگذار — با فینوست، حرفه‌ای معامله کن؛ با نوا، سبد اختصاصی بچین. دو بالِ مکملِ مدیریتِ هوشمندِ سرمایه.
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
      )}
    </dialog>
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

// ---------------------------------------------------------------------------
/**
 * FeaturePopup — rectangular detail card shown when a user clicks one of the
 * 6 feature chips. Uses native <dialog> + showModal() so the browser's top
 * layer lifts the popup out of the transformed .figma-canvas ancestor — no
 * portal, no scroll-lock, no layout reflow on the big canvas.
 */
function FeaturePopup({
  ref,
  feature,
  onClose,
}: {
  ref: React.Ref<HTMLDialogElement>;
  feature: HubFeature | null;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="feature-popup-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="hub-feature-dialog"
      dir="rtl"
    >
      {feature && (
      /* Card (rectangular) */
      <div
        className="relative w-full max-w-[720px] rounded-[24px] overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #8fa8cc 0%, #4f6d9c 55%, #2a3f66 100%)",
          boxShadow:
            "0 50px 120px rgba(6,12,30,0.65), inset 0 1px 0 rgba(255,255,255,0.22)",
          border: "1.5px solid rgba(255,255,255,0.22)",
        }}
      >
        {/* Ambient accent glow — matches per-feature accent colour */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            right: "-80px",
            top: "-80px",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${feature.accent}55 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: "-80px",
            bottom: "-80px",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${feature.accent}33 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />

        {/* Close × button (top-left) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer group/close"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
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
          {/* tooltip */}
          <span
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap font-['Yekan_Bakh:Medium',sans-serif] text-[11px] text-white/90 px-2.5 py-1 rounded-md opacity-0 group-hover/close:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              background: "rgba(10,22,48,0.85)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            بستن
          </span>
        </button>

        {/* Header */}
        <div className="relative px-8 pt-10 pb-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              background: `${feature.accent}22`,
              border: `1px solid ${feature.accent}55`,
            }}
          >
            <span
              className="relative flex h-1.5 w-1.5"
              aria-hidden
            >
              <span
                className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                style={{ background: feature.accent }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: feature.accent }}
              />
            </span>
            <span
              className="font-['Poppins:Bold',sans-serif] text-[10.5px] tracking-[2.2px]"
              style={{ color: feature.accent }}
              dir="ltr"
            >
              {feature.tagline}
            </span>
          </div>
          <h2
            id="feature-popup-title"
            className="font-['Yekan_Bakh:Bold',sans-serif] text-white leading-[1.2] text-[30px] mb-3"
          >
            {feature.title}
          </h2>
          <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[15px] text-white/80 leading-[1.85]">
            {feature.desc}
          </p>
        </div>

        {/* Highlights */}
        <ul className="relative px-8 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {feature.highlights.map((h) => (
            <li
              key={h}
              className="flex items-center gap-2.5 text-right rounded-[14px] px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <span
                className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${feature.accent}, ${feature.accent}aa)`,
                  boxShadow: `0 3px 10px ${feature.accent}55`,
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
              <span className="font-['Yekan_Bakh:Medium',sans-serif] text-[14px] text-white/95 leading-[1.45]">
                {h}
              </span>
            </li>
          ))}
        </ul>

        {/* Footer — CTA + close hint */}
        <div className="relative px-8 pt-6 pb-6 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href={feature.href}
            className="group/btn flex items-center justify-between gap-3 px-5 py-3 rounded-[14px] transition-transform duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${feature.accent} 0%, ${feature.accent}cc 100%)`,
              boxShadow: `0 10px 24px ${feature.accent}55, inset 0 0 0 1px rgba(255,255,255,0.22)`,
            }}
          >
            <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[15px] text-[#0a0e2f]">
              مشاهده جزئیات بیشتر
            </span>
            <span className="w-7 h-7 rounded-full bg-[#0a0e2f] flex items-center justify-center transition-transform group-hover/btn:-translate-x-1">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke={feature.accent}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </span>
          </Link>

          {/* Close hint — tells user how to dismiss */}
          <div className="flex items-center gap-2 text-white/70 font-['Yekan_Bakh:Medium',sans-serif] text-[12.5px]">
            <span>برای بستن:</span>
            <span
              className="inline-flex items-center justify-center h-6 px-2 rounded-md"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
              dir="ltr"
            >
              Esc
            </span>
            <span>یا کلیک خارج از کارت</span>
          </div>
        </div>
      </div>
      )}
    </dialog>
  );
}
