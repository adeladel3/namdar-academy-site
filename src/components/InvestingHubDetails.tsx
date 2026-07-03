"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Data — two groups: who it's for, and which goals you reach.
// Easy to extend: add an item, no layout change needed.
type DetailItem = {
  key: string;
  label: string;
  title: string;
  desc: string;
  points: string[];
};

const AUDIENCE: DetailItem[] = [
  {
    key: "beginner",
    label: "تریدرهای مبتدی",
    title: "تریدرهای تازه‌وارد بازار",
    desc: "اگر تازه وارد بازارهای مالی شده‌ای و می‌خواهی از صفر و با یک مسیر ساختاریافته یاد بگیری، این محصول برای توست.",
    points: [
      "یادگیری اصول پایه بازار از پایه تا پیشرفته",
      "شروع با ست‌آپ‌های کم‌ریسک و قابل‌اجرا",
      "همراهی مربی و تیم پشتیبانی در تمام مراحل",
      "مسیر رشد مرحله به مرحله، بدون سردرگمی",
    ],
  },
  {
    key: "active",
    label: "معامله‌گران فعال",
    title: "معامله‌گران فعال و حرفه‌ای",
    desc: "اگر هر روز معامله می‌کنی و به سیگنال دقیق، تحلیل لحظه‌ای و ابزار تصمیم‌گیری سریع نیاز داری، اینجا جای توست.",
    points: [
      "سیگنال‌های لحظه‌ای با نقاط ورود و خروج مشخص",
      "تحلیل تکنیکال حرفه‌ای جفت‌ارزها، طلا و کریپتو",
      "هشدار هوشمند در شکست سطوح کلیدی",
      "دسترسی به تیم تحلیل در معاملات کلیدی",
    ],
  },
  {
    key: "investor",
    label: "سرمایه‌گذاران بلندمدت",
    title: "سرمایه‌گذاران با دید بلندمدت",
    desc: "اگر به‌جای معامله روزانه، دنبال رشد پایدار سرمایه در یک پرتفوی هوشمند هستی، سرویس نوا دقیقاً برای همین طراحی شده.",
    points: [
      "سبدچینی اختصاصی بر اساس سطح ریسک شما",
      "تنوع دارایی: سهام، طلا، ارز دیجیتال و درآمد ثابت",
      "گزارش عملکرد ماهانه و بازنگری دوره‌ای",
      "مشاوره با کارشناسان ارشد بازار سرمایه",
    ],
  },
  {
    key: "global",
    label: "علاقه‌مندان بازارهای جهانی",
    title: "فعالان بازارهای جهانی",
    desc: "اگر می‌خواهی از فرصت‌های بازار طلا، فارکس و ارزهای دیجیتال در کنار هم بهره ببری، این محصول تمام این بازارها را در یک جا جمع کرده است.",
    points: [
      "پوشش کامل طلا، فارکس، کریپتو و شاخص‌ها",
      "تحلیل هم‌زمان چند بازار با هماهنگی اخبار",
      "فرصت‌یابی با استراتژی‌های اختصاصی هر بازار",
      "دسترسی ۲۴ ساعته به تیم تحلیل بین‌المللی",
    ],
  },
];

const GOALS: DetailItem[] = [
  {
    key: "skill",
    label: "ارتقای سبک معامله‌گری",
    title: "پرورش یک سبک معامله‌گری منظم",
    desc: "تمرکز ما روی شکل‌گیری یک سبک معامله‌گری منطقی و ساختارمند است؛ دور از هیجان، مبتنی بر تحلیل و تصمیم‌های آگاهانه.",
    points: [
      "تمرین ست‌آپ‌هایی با نسبت ریسک به ریوارد منطقی",
      "جایگزینی برنامه‌ریزی به‌جای تصمیم‌های احساسی",
      "چارچوبی قابل تکرار و آموزش‌پذیر",
      "گزارش شفاف از روند کار در هر دوره",
    ],
  },
  {
    key: "risk",
    label: "اصول مدیریت ریسک",
    title: "آشنایی با اصول مدیریت ریسک",
    desc: "پیش از هر چیز، روی مفاهیم مدیریت ریسک و ساختار تصمیم‌گیری تمرکز می‌کنیم — تا در شرایط مختلف بازار با نگاهی سنجیده‌تر حرکت کنی.",
    points: [
      "مفاهیم تعیین حد ضرر بر پایه ساختار بازار",
      "مبانی سایزینگ پوزیشن و مدیریت حجم",
      "چارچوب تصمیم‌گیری در نوسانات شدید",
      "بازنگری و اصلاح الگوهای تکرارشونده",
    ],
  },
  {
    key: "portfolio",
    label: "ساختار پرتفوی متنوع",
    title: "آشنایی با سبدچینی هوشمند",
    desc: "همه تخم‌مرغ‌ها را در یک سبد نگذار. با سبدچینی اختصاصی نوا، یک چارچوب برای متنوع‌سازی پرتفوی در اختیار تو قرار می‌گیرد.",
    points: [
      "ایده‌هایی برای تنوع دارایی و کاهش تمرکز ریسک",
      "تخصیص متناسب با اهداف و شرایط شخصی شما",
      "بازنگری دوره‌ای و بازآرایی پرتفوی",
      "درنظرگیری شرایط کلان اقتصادی",
    ],
  },
  {
    key: "literacy",
    label: "دانش ماندگار بازار",
    title: "یادگیری یک مهارت ماندگار",
    desc: "دانشی که در هر شرایط بازار همراه توست و می‌تواند مسیر تصمیم‌گیری‌های مالی‌ات را شفاف‌تر کند.",
    points: [
      "ترکیب چند سرویس در یک مسیر یادگیری منسجم",
      "افزایش درک از رفتار بازارهای مختلف",
      "مهارتی قابل انتقال و ماندگار در ذهن",
      "نگاه آگاهانه‌تر به تصمیم‌های مالی",
    ],
  },
];

// ---------------------------------------------------------------------------
export default function InvestingHubDetails() {
  const [active, setActive] = useState<DetailItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native <dialog> via showModal/close. The browser puts the
  // dialog in the top layer, so it escapes the transformed .figma-canvas
  // ancestor — no portal, no scroll-lock tricks, no layout reflow on the
  // big canvas. Native Esc-to-close is handled by the UA; we still mirror
  // it into React state via the `cancel`/`close` events below.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (active) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [active]);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-[6280px] w-[1200px]"
      dir="rtl"
    >
      <div className="grid grid-cols-2 gap-7">
        <DetailCard
          title="برای چه کسانی مناسب است؟"
          subtitle="ببین آیا اینوستینگ هاب برای تو طراحی شده"
          accent="#1b3c8a"
          accentSoft="#4a90ff"
          icon={
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          items={AUDIENCE}
          onSelect={setActive}
        />
        <DetailCard
          title="چه مسیری پیش روی توست؟"
          subtitle="تجربه‌ای که در اینوستینگ هاب پیش می‌آید"
          accent="#b87333"
          accentSoft="#f7cf5a"
          icon={
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          }
          items={GOALS}
          onSelect={setActive}
        />
      </div>

      <DetailPopup
        ref={dialogRef}
        item={active}
        onClose={() => setActive(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
function DetailCard({
  title,
  subtitle,
  accent,
  accentSoft,
  icon,
  items,
  onSelect,
}: {
  title: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  icon: React.ReactNode;
  items: DetailItem[];
  onSelect: (item: DetailItem) => void;
}) {
  return (
    <div
      className="relative rounded-[28px] p-8 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #ffffff 0%, #f6f8fc 60%, #eef2f9 100%)",
        border: "1px solid rgba(27,60,138,0.10)",
        boxShadow:
          "0 24px 60px -20px rgba(14,26,61,0.22), 0 2px 6px rgba(14,26,61,0.06)",
      }}
    >
      {/* Accent glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "-60px",
          top: "-60px",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-4 mb-6">
        <span
          className="shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accentSoft})`,
            color: "#ffffff",
            boxShadow: `0 10px 24px ${accent}44`,
          }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <h3
            className="font-['Yekan_Bakh:Bold',sans-serif] text-[22px] text-[#081738] leading-[1.3]"
          >
            {title}
          </h3>
          <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[13.5px] text-[#3a4a6e] leading-[1.55] mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Buttons grid */}
      <div className="relative grid grid-cols-2 gap-3">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={(e) => {
              // Blur the clicked button BEFORE setState so it stops being
              // :focus. Otherwise the browser's native "keep focused elt
              // in view" heuristic can scrollIntoView on the .figma-canvas
              // ancestor, which uses transform: scale() — the divided
              // coordinates produce the visible "kick".
              (e.currentTarget as HTMLButtonElement).blur();
              onSelect(item);
            }}
            className="group flex items-center justify-between gap-3 px-4 py-3.5 rounded-[14px] text-right focus:outline-none focus-visible:ring-4 cursor-pointer"
            style={{
              background: "#ffffff",
              border: `1.5px solid ${accent}22`,
              boxShadow: `0 4px 12px ${accent}10`,
            }}
          >
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentSoft})`,
                color: "#ffffff",
                boxShadow: `0 3px 10px ${accent}44`,
              }}
              aria-hidden
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="flex-1 font-['Yekan_Bakh:Bold',sans-serif] text-[14.5px] text-[#081738] leading-[1.3]">
              {item.label}
            </span>
            <svg
              className="shrink-0 transition-transform group-hover:-translate-x-1"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accent}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Native <dialog> wrapper. The browser top-layer makes the dialog escape
// every stacking context / transformed ancestor on the page, so there is
// no paint/layout work on the big figma-canvas when it opens.
const DetailPopup = function DetailPopupImpl({
  ref,
  item,
  onClose,
}: {
  ref: React.Ref<HTMLDialogElement>;
  item: DetailItem | null;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="detail-popup-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        // Click-outside-to-close: the <dialog> itself receives clicks that
        // land on its backdrop (the invisible area outside the inner card).
        // We treat any click whose direct target is the <dialog> element
        // as a backdrop click.
        if (e.target === e.currentTarget) onClose();
      }}
      className="hub-detail-dialog"
    >
      {item && (
      <div
        className="relative w-full max-w-[680px] rounded-[24px] overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #ffffff 0%, #f4f7fc 55%, #e7edf7 100%)",
          boxShadow:
            "0 50px 120px rgba(6,12,30,0.5), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1.5px solid rgba(27,60,138,0.14)",
        }}
      >
        {/* Accent glow */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            right: "-80px",
            top: "-80px",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(27,60,138,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Close × */}
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer group/close"
          style={{
            background: "rgba(27,60,138,0.08)",
            border: "1px solid rgba(27,60,138,0.18)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1b3c8a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap font-['Yekan_Bakh:Medium',sans-serif] text-[11px] text-white px-2.5 py-1 rounded-md opacity-0 group-hover/close:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              background: "rgba(10,22,48,0.85)",
            }}
          >
            بستن
          </span>
        </button>

        {/* Header */}
        <div className="relative px-8 pt-10 pb-2">
          <h2
            id="detail-popup-title"
            className="font-['Yekan_Bakh:Bold',sans-serif] text-[#081738] leading-[1.25] text-[28px] mb-3"
          >
            {item.title}
          </h2>
          <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[15px] text-[#3a4a6e] leading-[1.85]">
            {item.desc}
          </p>
        </div>

        {/* Bullets */}
        <ul className="relative px-8 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {item.points.map((p) => (
            <li
              key={p}
              className="flex items-center gap-2.5 text-right rounded-[14px] px-3 py-2.5"
              style={{
                background: "rgba(27,60,138,0.04)",
                border: "1px solid rgba(27,60,138,0.08)",
              }}
            >
              <span
                className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #1b3c8a, #4a90ff)",
                  boxShadow: "0 3px 10px rgba(27,60,138,0.35)",
                }}
                aria-hidden
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="font-['Yekan_Bakh:Medium',sans-serif] text-[14px] text-[#081738] leading-[1.45]">
                {p}
              </span>
            </li>
          ))}
        </ul>

        {/* Footer — close hint */}
        <div className="relative px-8 pt-6 pb-6 flex items-center justify-end">
          <div className="flex items-center gap-2 text-[#3a4a6e] font-['Yekan_Bakh:Medium',sans-serif] text-[12.5px]">
            <span>برای بستن:</span>
            <span
              className="inline-flex items-center justify-center h-6 px-2 rounded-md"
              style={{
                background: "rgba(27,60,138,0.08)",
                border: "1px solid rgba(27,60,138,0.18)",
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
};
