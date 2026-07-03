"use client";

import Link from "@/components/SafeLink";

const PILLS: { label: string; x: number; w: number }[] = [
  { label: "تکنیکال", x: 1255, w: 126 },
  { label: "فاندامنتال", x: 1123, w: 126 },
  { label: "طلا", x: 1048, w: 70 },
  { label: "دلار", x: 973, w: 70 },
  { label: "موضوعات روان‌شناسی معاملات", x: 707, w: 260 },
  { label: "فاندامنتال", x: 575, w: 126 },
];

export default function LandingNavOverlay() {
  return (
    <>
      {/* nav header removed — SiteHeader (in (site) layout) provides global nav for all routes */}

      {/* Hero value-prop — right column, aligned with instructor's head on the left.
       * Hero portrait frame spans y=122→1053; head sits around y=300–360.
       * The badge is the visual entry point, so we anchor it to head-level. */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: 40,
          top: 230,
          width: 920,
          height: 840,
          background:
            "radial-gradient(ellipse 60% 70% at 60% 40%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute flex flex-col items-start text-right"
        style={{ right: 180, top: 320, width: 780 }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium mb-8 whitespace-nowrap"
          style={{
            background: "rgba(27,60,138,0.08)",
            color: "#1b3c8a",
            border: "1px solid rgba(27,60,138,0.18)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#f7cf5a]" />
          مرجع تخصصی آموزش بازارهای مالی در ایران
        </div>
        <h1
          className="leading-[1.3] m-0 font-black"
          style={{
            fontSize: 60,
            color: "#06142f",
            letterSpacing: "-0.3px",
            textShadow: "0 2px 24px rgba(255,255,255,0.9)",
          }}
        >
          <span className="block whitespace-nowrap">آموزش حرفه‌ای</span>
          <span className="block whitespace-nowrap">
            {/* ترید — editorial highlight: distinct amber gradient + hand-drawn brush underline */}
            <span className="relative inline-block align-baseline">
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #f7cf5a 0%, #f0b429 50%, #d49319 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ترید
              </span>
              <svg
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  right: "-2%",
                  left: "-2%",
                  bottom: -10,
                  width: "104%",
                  height: 14,
                }}
                viewBox="0 0 120 14"
                preserveAspectRatio="none"
              >
                <path
                  d="M3 9 C 28 3, 92 3, 117 7"
                  stroke="#f0b429"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />
                <path
                  d="M8 11 C 35 6, 88 6, 112 10"
                  stroke="#f7cf5a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #136cb5 0%, #49bbbd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {" "}و سرمایه‌گذاری
            </span>
          </span>
        </h1>
        <p
          className="mt-8"
          style={{
            fontSize: 22,
            color: "rgba(6,20,47,0.72)",
            lineHeight: 1.9,
            maxWidth: 780,
            textShadow: "0 2px 18px rgba(255,255,255,0.9)",
          }}
        >
          از مبتدی تا حرفه‌ای در{" "}
          <span style={{ fontWeight: 600, color: "rgba(6,20,47,0.88)" }}>
            کریپتو، فارکس، طلا و بازار بورس
          </span>{" "}
          — زیر نظر{" "}
          <span
            className="relative inline-block font-bold whitespace-nowrap"
            style={{ color: "#1b3c8a" }}
          >
            استاد امیرحسین نام‌آور
            <span
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                right: 0,
                left: 0,
                bottom: -3,
                height: 2,
                background:
                  "linear-gradient(90deg, #136cb5 0%, #49bbbd 50%, #f7cf5a 100%)",
                borderRadius: 2,
              }}
            />
          </span>
        </p>

        {/* CTAs — vertically stacked, uniform width, right-aligned to balance the left photo */}
        <div className="mt-14 flex flex-col items-start gap-5">
          <Link
            href="/courses"
            className="inline-flex items-center justify-start gap-3 h-[64px] pr-6 pl-7 rounded-full text-[15px] font-bold text-white whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5"
            style={{
              width: 340,
              background:
                "linear-gradient(135deg, #136cb5 0%, #1b3c8a 45%, #49bbbd 100%)",
              boxShadow: "0 14px 28px -10px rgba(19,108,181,0.55)",
            }}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.18)" }}
              aria-hidden
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            مشاهده آموزش‌های غیرحضوری
          </Link>
          <Link
            href="/coaching"
            className="inline-flex items-center justify-start gap-3 h-[64px] pr-6 pl-7 rounded-full text-[15px] font-bold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5"
            style={{
              width: 340,
              background: "white",
              color: "#1b3c8a",
              border: "2px solid #1b3c8a",
              boxShadow: "0 10px 22px -12px rgba(27,60,138,0.35)",
            }}
          >
            <span
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-full overflow-hidden"
              aria-hidden
            >
              {/* MON sphere — source PNG has "STUDENT REVIEWS" text below the sphere,
                  so render at a 96:141 aspect and clip the bottom via overflow-hidden. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src="/figma/image1.png"
                className="absolute left-0 top-0 max-w-none"
                style={{ width: 32, height: 47 }}
              />
            </span>
            کوچینگ حضوری ترید MON
          </Link>
          <Link
            href="/investing"
            aria-label="سرمایه‌گذاری کریپتو و طلا — اینوستینگ هاب"
            className="inline-flex items-center justify-start gap-3 h-[64px] pr-6 pl-7 rounded-full text-[15px] font-bold whitespace-nowrap text-[#06142f] transition-all duration-200 hover:-translate-y-0.5"
            style={{
              width: 340,
              background: "linear-gradient(135deg, #f7cf5a 0%, #f0b429 100%)",
              boxShadow: "0 12px 24px -10px rgba(240,180,41,0.55)",
            }}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "rgba(6,20,47,0.12)" }}
              aria-hidden
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#06142f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            سرمایه‌گذاری کریپتو و طلا
          </Link>
        </div>
      </div>

      {PILLS.map((p, i) => (
        <Link
          key={`${p.label}-${i}`}
          href={`/courses?q=${encodeURIComponent(p.label)}`}
          aria-label={p.label}
          className="absolute block rounded-[6px] transition-all duration-200 hover:scale-110 hover:brightness-125"
          style={{
            top: 923,
            left: p.x,
            width: p.w,
            height: 39,
            transformOrigin: "center",
          }}
        />
      ))}
    </>
  );
}
