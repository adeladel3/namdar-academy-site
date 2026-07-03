"use client";

import Link from "@/components/SafeLink";
import { useMemo, useRef, useState } from "react";
import type { CourseLevelKey, CourseStatus } from "@/lib/db";
import { courseDetailHref } from "@/lib/course-links";
import {
  LEVEL_LABELS,
  faDigits,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export type CourseCardData = {
  slug: string;
  title: string;
  shortDesc: string;
  previewImage: string;
  level: CourseLevelKey;
  price: number;
  discountPrice?: number;
  isFree: boolean;
  instructor: string;
  studentsCount: number;
  hideStudentsCount?: boolean;
  badge?: string;
  status: CourseStatus;
  createdAt: number;
  publishedAt?: number;
  duration: string;
  lessons: number;
  /** نوع محصول. پیش‌فرض «course». با «seminar» کارت به صفحه‌ی سمینار لینک
   *  می‌شود، نشان «سمینار حضوری» می‌گیرد و عبارت دکمه و مکان رویداد تغییر
   *  می‌کند. */
  kind?: "course" | "seminar";
  /** مقصد پیش‌فرض کلیک روی کارت. اگر تعیین نشود، از courseDetailHref استفاده
   *  می‌شود. برای سمینارها مسیر «/seminars/<slug>» را پاس می‌کنیم. */
  detailHref?: string;
  /** برای سمینارها: نام محل برگزاری (روی کارت چاپ می‌شود). */
  venueName?: string;
};

type LevelKey = "all" | "beginner" | "intermediate" | "advanced";
type SortKey = "popular" | "newest" | "cheapest" | "expensive";

const LEVEL_OPTIONS: { key: LevelKey; label: string }[] = [
  { key: "all", label: "همه دوره‌ها" },
  { key: "beginner", label: "مقدماتی" },
  { key: "intermediate", label: "متوسط" },
  { key: "advanced", label: "پیشرفته" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "محبوب‌ترین" },
  { key: "newest", label: "جدیدترین" },
  { key: "cheapest", label: "ارزان‌ترین" },
  { key: "expensive", label: "گران‌ترین" },
];

const LEVEL_ACCENTS: Record<CourseLevelKey, { dot: string; text: string; ring: string }> = {
  beginner: { dot: "bg-emerald-400", text: "text-emerald-300", ring: "ring-emerald-400/30" },
  intermediate: { dot: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-400/30" },
  advanced: { dot: "bg-rose-400", text: "text-rose-300", ring: "ring-rose-400/30" },
};

function effectivePrice(c: CourseCardData) {
  if (c.isFree) return 0;
  return c.discountPrice ?? c.price;
}

/** Resolve the target link for a card — seminars carry their own
 *  `detailHref` (/seminars/<slug>) while regular courses fall back to the
 *  shared courseDetailHref helper. */
function cardHref(c: CourseCardData): string {
  if (c.detailHref) return c.detailHref;
  return courseDetailHref(c.slug);
}

function isSeminar(c: CourseCardData): boolean {
  return c.kind === "seminar";
}

function discountPercent(c: CourseCardData) {
  if (!c.discountPrice || c.discountPrice >= c.price) return 0;
  return Math.round(((c.price - c.discountPrice) / c.price) * 100);
}

// Deterministic rating derived from studentsCount — 4.4 to 4.95
function fakeRating(c: CourseCardData) {
  const base = 4.4 + ((c.studentsCount % 55) / 100);
  return Math.min(4.95, Math.round(base * 10) / 10);
}

// Per-course brand logos. Mirrors the hidden brand-circles block in Landing.tsx
// so the look stays in sync. MON and FINVEST source PNGs have non-square
// framing and need a custom crop to sit nicely inside a circular wrapper.
type BrandLogo = {
  src: string;
  glow: string;          // radial-gradient backdrop
  bg: string;            // circle tile background
  // absolute-positioned img style — matches the Landing hero crops.
  imgStyle: React.CSSProperties;
};

const BRAND_LOGOS: Record<string, BrandLogo> = {
  mon: {
    src: "/figma/image1.png",
    glow: "radial-gradient(circle, rgba(255,176,75,0.55) 0%, rgba(255,176,75,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(255,220,160,0.25), rgba(35,20,10,0.9) 70%)",
    // MON PNG includes "STUDENT REVIEWS" text below the sphere; render taller
    // than the circular wrapper and rely on overflow-hidden to clip the text.
    imgStyle: { left: "0%", top: "0%", width: "100%", height: "146%", objectFit: "cover" as const, maxWidth: "none" },
  },
  nova: {
    src: "/figma/untitled1copy1.png",
    glow: "radial-gradient(circle, rgba(66,71,186,0.55) 0%, rgba(66,71,186,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(160,170,230,0.25), rgba(20,24,55,0.9) 70%)",
    imgStyle: { inset: 0, width: "100%", height: "100%", objectFit: "contain" as const, padding: "6%" },
  },
  lq1: {
    src: "/figma/layer11.png",
    glow: "radial-gradient(circle, rgba(12,156,75,0.55) 0%, rgba(12,156,75,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(120,220,170,0.2), rgba(8,38,22,0.9) 70%)",
    imgStyle: { inset: 0, width: "100%", height: "100%", objectFit: "contain" as const, padding: "4%" },
  },
  finvest: {
    src: "/figma/finvestcopy1.png",
    glow: "radial-gradient(circle, rgba(18,18,18,0.45) 0%, rgba(18,18,18,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(150,150,150,0.12), rgba(10,10,12,0.95) 70%)",
    // FINVEST source is a landscape PNG whose actual circular mark sits on its
    // left ~40%. Scale to ~262% width, nudge the crop so the mark is centered.
    imgStyle: { left: "-38%", top: "-16%", width: "262%", height: "131%", maxWidth: "none" },
  },
};

function getBrandLogo(slug: string): BrandLogo | null {
  return BRAND_LOGOS[slug] ?? null;
}

/** Circular brand-logo tile — used inside both the featured hero and the
 * regular grid card. `size` is a responsive class-string for the wrapper's
 * width/height (the tile is always a square circle). */
function BrandLogoTile({ slug, size }: { slug: string; size: string }) {
  const logo = getBrandLogo(slug);
  if (!logo) return null;
  return (
    <div className={`relative ${size}`}>
      {/* Soft brand halo behind the circle */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-full blur-2xl pointer-events-none"
        style={{ background: logo.glow }}
      />
      <div
        className="relative h-full w-full rounded-full overflow-hidden ring-1 ring-white/70 shadow-[0_18px_48px_-14px_rgba(14,26,61,0.45)]"
        style={{ background: logo.bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          aria-hidden
          draggable={false}
          src={logo.src}
          className="absolute pointer-events-none select-none"
          style={logo.imgStyle}
        />
      </div>
    </div>
  );
}

export default function CoursesGrid({
  courses,
  initialQuery = "",
}: {
  courses: CourseCardData[];
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [level, setLevel] = useState<LevelKey>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  const published = useMemo(
    () => courses.filter((c) => c.status === "published"),
    [courses]
  );

  const stats = useMemo(() => {
    const totalStudents = published.reduce((s, c) => s + (c.studentsCount || 0), 0);
    const totalLessons = published.reduce((s, c) => s + (c.lessons || 0), 0);
    return {
      courses: published.length,
      students: totalStudents,
      lessons: totalLessons,
    };
  }, [published]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = published
      .filter((c) => {
        if (level !== "all" && c.level !== level) return false;
        if (onlyFree && !c.isFree) return false;
        if (onlyDiscount && !(c.discountPrice && c.discountPrice < c.price)) return false;
        if (!needle) return true;
        return (
          c.title.toLowerCase().includes(needle) ||
          c.shortDesc.toLowerCase().includes(needle) ||
          c.instructor.toLowerCase().includes(needle)
        );
      })
      .slice();

    list.sort((a, b) => {
      switch (sort) {
        case "newest":
          return (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt);
        case "cheapest":
          return effectivePrice(a) - effectivePrice(b);
        case "expensive":
          return effectivePrice(b) - effectivePrice(a);
        case "popular":
        default:
          return b.studentsCount - a.studentsCount;
      }
    });

    return list;
  }, [published, q, level, onlyFree, onlyDiscount, sort]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="bg-[#f4f7fc] min-h-screen" dir="rtl">
      {/* ===== HERO ===== */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(to left, #0f1f4a 0%, #1b3c8a 50%, #136cb5 100%)",
        }}
      >
        {/* Soft accent glows tuned for the brighter navy gradient */}
        <div className="pointer-events-none absolute -top-32 -right-24 h-[460px] w-[460px] rounded-full bg-[#49bbbd] opacity-25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full bg-[#0f1f4a] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[320px] w-[320px] rounded-full bg-[#f7cf5a] opacity-[0.10] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />

        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-20 md:pt-12 md:pb-28">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs md:text-sm text-white/80 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inset-0 rounded-full bg-[#49bbbd] opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-[#49bbbd]" />
              </span>
              آموزشی نامدار آکادمی
            </span>

            <h1 className="mt-5 text-[34px] md:text-[60px] font-black tracking-tight leading-[1.05]">
              <span className="block">از اولین کندل</span>
              <span className="block">
                تا{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-l from-[#49bbbd] via-[#5ec8ea] to-white bg-clip-text text-transparent">
                    استراتژی حرفه‌ای
                  </span>
                  <svg
                    className="absolute -bottom-2 right-0 w-full text-[#49bbbd]"
                    height="12"
                    viewBox="0 0 300 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8 C 80 2, 150 2, 298 6"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-white/70 leading-relaxed">
              مسیری ساختاریافته که با متدولوژی اختصاصی استاد نام‌آور و هزاران
              ساعت تجربه میدانی طراحی شده. هر دوره، یک قدم جدی به سمت حرفه‌ای
              شدن.
            </p>

            {/* Stats */}
            <div className="mt-7 grid grid-cols-3 gap-3 md:gap-5 w-full max-w-3xl">
              {[
                { value: `+${faDigits(stats.courses)}`, label: "دوره تخصصی", icon: "book" },
                {
                  value: `+${faDigits(
                    stats.students >= 1000
                      ? `${Math.floor(stats.students / 1000)}K`
                      : stats.students
                  )}`,
                  label: "دانش‌پذیر فعال",
                  icon: "users",
                },
                { value: `+${faDigits(stats.lessons)}`, label: "درس ویدیویی", icon: "play" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur px-3 py-3.5 md:px-6 md:py-4 hover:border-[#49bbbd]/40 transition"
                >
                  <div className="flex items-center justify-center mb-2 text-[#49bbbd]">
                    {s.icon === "book" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14zM4 19.5V21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {s.icon === "users" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                    {s.icon === "play" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                  <div className="text-xl md:text-3xl font-black text-white tracking-tight">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs md:text-sm text-white/55">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagonal divider */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full text-[#f4f7fc]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,80 C240,20 480,20 720,50 C960,80 1200,80 1440,30 L1440,100 L0,100 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* ===== FILTER BAR ===== */}
      <section className="relative -mt-20 md:-mt-24 z-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(5,9,36,0.35)] ring-1 ring-[#e3e9f4] p-4 md:p-5">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b3c8a]/50"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="جستجو در عنوان، توضیح یا نام مدرس..."
                  className="w-full h-12 md:h-14 pr-12 pl-28 rounded-2xl bg-[#f7fafd] text-[#010514] placeholder:text-[#010514]/40 text-sm md:text-base ring-1 ring-[#e3e9f4] focus:outline-none focus:ring-2 focus:ring-[#136cb5]/40 focus:bg-white transition"
                />
                <kbd className="hidden md:inline-flex absolute left-3 top-1/2 -translate-y-1/2 items-center gap-1 rounded-lg bg-white border border-[#e3e9f4] px-2 py-1 text-[11px] text-[#010514]/50 font-mono">
                  ⌘ K
                </kbd>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none h-12 md:h-14 w-full lg:w-56 rounded-2xl bg-[#f7fafd] ring-1 ring-[#e3e9f4] px-4 pl-10 text-sm md:text-base text-[#010514] focus:outline-none focus:ring-2 focus:ring-[#136cb5]/40 focus:bg-white transition cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      مرتب‌سازی: {o.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#1b3c8a]/50"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Chips row */}
            <div className="mt-4 pt-4 border-t border-dashed border-[#e3e9f4] flex flex-wrap gap-2 items-center">
              {LEVEL_OPTIONS.map((opt) => {
                const active = level === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setLevel(opt.key)}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition ${
                      active
                        ? "bg-[#050924] text-white shadow-[0_10px_25px_-10px_rgba(5,9,36,0.6)]"
                        : "bg-[#f4f7fc] text-[#010514]/70 hover:bg-[#eef2f9] hover:text-[#1b3c8a]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}

              <span className="hidden md:block w-px h-6 bg-[#e3e9f4] mx-2" />

              <button
                type="button"
                onClick={() => setOnlyFree((v) => !v)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition inline-flex items-center gap-1.5 ${
                  onlyFree
                    ? "bg-emerald-600 text-white"
                    : "bg-[#f4f7fc] text-[#010514]/70 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={onlyFree ? 1 : 0.4}
                  />
                </svg>
                فقط رایگان
              </button>

              <button
                type="button"
                onClick={() => setOnlyDiscount((v) => !v)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition inline-flex items-center gap-1.5 ${
                  onlyDiscount
                    ? "bg-rose-600 text-white"
                    : "bg-[#f4f7fc] text-[#010514]/70 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="7" cy="7" r="1.5" fill="currentColor" />
                </svg>
                تخفیف‌دار
              </button>

              <div className="ms-auto text-xs md:text-sm text-[#010514]/50">
                <span className="font-bold text-[#1b3c8a]">{faDigits(filtered.length)}</span>{" "}
                دوره یافت شد
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-20">
        {filtered.length === 0 ? (
          <EmptyState onReset={() => { setQ(""); setLevel("all"); setOnlyFree(false); setOnlyDiscount(false); }} />
        ) : (
          <>
            {featured && <FeaturedCard course={featured} />}

            {rest.length > 0 && (
              <>
                <div className="mt-14 md:mt-20 mb-8 flex items-end justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#49bbbd] to-[#1b3c8a]" />
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-[#010514] tracking-tight">
                        دوره‌های دیگر
                      </h2>
                      <p className="text-sm text-[#010514]/55 mt-1">
                        مرتب‌سازی: {SORT_OPTIONS.find((s) => s.key === sort)?.label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                  {rest.map((c) => (
                    <CourseCard key={`${c.kind ?? "course"}:${c.slug}`} course={c} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/* ============================ Featured ============================ */

function FeaturedCard({ course }: { course: CourseCardData }) {
  const discount = discountPercent(course);
  const rating = fakeRating(course);
  const seminar = isSeminar(course);
  return (
    <Link
      href={cardHref(course)}
      className="group relative block overflow-hidden rounded-[2rem] text-[#0e1a3d] transition-all duration-500"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 45%, rgba(229,234,245,0.7) 100%)",
        backdropFilter: "blur(28px) saturate(1.6)",
        WebkitBackdropFilter: "blur(28px) saturate(1.6)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow:
          "0 32px 80px -28px rgba(14,26,61,0.25), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      {/* Glass sheen at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 right-0 h-[40%] z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Iridescent pastel hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"
        style={{
          background:
            "conic-gradient(from 120deg, rgba(247,207,90,0.24), rgba(73,187,189,0.28), rgba(165,52,225,0.2), rgba(27,60,138,0.22), rgba(247,207,90,0.24))",
        }}
      />

      <div className="relative grid md:grid-cols-5 gap-0 z-[2]">
        {/* Image — swapped for per-brand circular logo when the course matches
            a known brand (MON / NOVA / LQ1 / FINVEST). Falls back to the
            generic preview image for anything else. */}
        <div className="relative md:col-span-2 aspect-[16/10] md:aspect-auto md:min-h-[420px] overflow-hidden bg-gradient-to-br from-[#eef2fb] to-[#dbe3f2] flex items-center justify-center">
          {getBrandLogo(course.slug) ? (
            <BrandLogoTile
              slug={course.slug}
              size="w-[220px] h-[220px] md:w-[280px] md:h-[280px] group-hover:scale-[1.04] transition duration-[600ms]"
            />
          ) : (
            <>
              {/* وقتی previewImage خالی باشد (مثل سمیناری که هنوز heroImage
                  آپلود نشده) اصلاً <img> رندر نمی‌کنیم تا browser warning ندهد. */}
              {course.previewImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={course.previewImage}
                  alt=""
                  aria-hidden
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition duration-[700ms] ease-out"
                />
              )}
              {/* Play badge — only for on-demand courses. Seminars get a
                  ticket icon instead, since they aren't videos. */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-20 w-20 rounded-full bg-white/75 backdrop-blur-md ring-1 ring-white/85 flex items-center justify-center group-hover:scale-110 transition duration-500 shadow-[0_14px_36px_-8px_rgba(14,26,61,0.35)]">
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                  {seminar ? (
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0e1a3d"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="relative"
                    >
                      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z" />
                      <path d="M9 7v10" strokeDasharray="2 3" />
                    </svg>
                  ) : (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="#0e1a3d"
                      className="relative -translate-x-0.5"
                    >
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Soft veil into the glass body */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 35%, rgba(255,255,255,0.2) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 hidden md:block"
            style={{
              background:
                "linear-gradient(270deg, rgba(255,255,255,0.55), transparent 35%)",
            }}
          />

          {discount > 0 && (
            <span className="absolute bottom-5 right-5 rounded-full bg-rose-500/95 backdrop-blur text-white text-xs font-extrabold px-3 py-1.5 shadow-lg shadow-rose-500/40">
              {faDigits(discount)}٪ تخفیف
            </span>
          )}
        </div>

        {/* Body */}
        <div className="relative md:col-span-3 p-6 md:p-12 flex flex-col">
          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {seminar ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-[#1b3c8a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f7cf5a]" />
                سمینار حضوری
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 font-bold ${LEVEL_ACCENTS_LIGHT[course.level].text}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${LEVEL_ACCENTS_LIGHT[course.level].dot}`}
                />
                سطح {LEVEL_LABELS[course.level]}
              </span>
            )}
            <span className="h-3 w-px bg-[#0e1a3d]/15" />
            {course.duration && (
              <>
                <span className="text-[#0e1a3d]/65 font-medium">
                  {seminar ? course.duration : `مدت: ${course.duration}`}
                </span>
                <span className="h-3 w-px bg-[#0e1a3d]/15" />
              </>
            )}
            {seminar && course.venueName && (
              <>
                <span className="text-[#0e1a3d]/65 font-medium">
                  📍 {course.venueName}
                </span>
                <span className="h-3 w-px bg-[#0e1a3d]/15" />
              </>
            )}
            {!seminar && course.lessons > 0 && (
              <>
                <span className="text-[#0e1a3d]/65 font-medium">
                  {faDigits(course.lessons)} درس
                </span>
                <span className="h-3 w-px bg-[#0e1a3d]/15" />
              </>
            )}
            {!seminar && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-bold">{faDigits(rating.toFixed(1))}</span>
              </span>
            )}
          </div>

          <h2 className="mt-5 text-3xl md:text-5xl font-black leading-[1.05] tracking-tight text-[#0e1a3d]">
            {course.title}
          </h2>
          <p className="mt-4 text-[#0e1a3d]/65 leading-relaxed line-clamp-3 max-w-xl">
            {course.shortDesc}
          </p>

          {/* Instructor */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#1b3c8a] to-[#49bbbd] text-white font-black text-sm ring-2 ring-white shadow-sm">
              {course.instructor?.trim()?.[0] ?? "ن"}
            </div>
            <div>
              <div className="text-[11px] text-[#0e1a3d]/50 font-medium">مدرس</div>
              <div className="text-sm font-bold text-[#0e1a3d]">{course.instructor}</div>
            </div>
          </div>

          <div className="mt-auto pt-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              {course.isFree ? (
                <div className="text-3xl font-black text-emerald-600">رایگان</div>
              ) : (
                <>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <div className="text-sm text-[#0e1a3d]/40 line-through">
                      {formatToman(course.price)}
                    </div>
                  )}
                  <div className="text-3xl font-black text-[#0e1a3d]">
                    {formatToman(course.discountPrice ?? course.price)}
                  </div>
                </>
              )}
            </div>

            <span
              className="group/cta inline-flex items-center gap-2 rounded-full text-[#2d1c03] text-sm font-extrabold px-7 py-3.5 transition duration-400 ring-1 ring-[#f7cf5a]/50"
              style={{
                background:
                  "linear-gradient(100deg, #fff4d6 0%, #f7cf5a 40%, #d4a62a 100%)",
                boxShadow:
                  "0 14px 36px -10px rgba(247,207,90,0.55), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              {seminar ? "رزرو صندلی" : "ورود به دوره"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================ Card ============================ */

/** Light-tone level palette for glass cards */
const LEVEL_ACCENTS_LIGHT: Record<
  CourseLevelKey,
  { dot: string; text: string; ring: string }
> = {
  beginner: { dot: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-400/40" },
  intermediate: { dot: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-400/40" },
  advanced: { dot: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-400/40" },
};

function CourseCard({ course }: { course: CourseCardData }) {
  const discount = discountPercent(course);
  const rating = fakeRating(course);
  const seminar = isSeminar(course);
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rotX = (0.5 - y) * 5;
    const rotY = (x - 0.5) * 5;
    el.style.setProperty("--rx", `${rotX.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${rotY.toFixed(2)}deg`);
  }
  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      ref={ref}
      href={cardHref(course)}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] text-[#0e1a3d] transition-all duration-500 [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] will-change-transform"
      style={{
        transformStyle: "preserve-3d",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.5) 45%, rgba(229,234,245,0.68) 100%)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow:
          "0 22px 55px -22px rgba(14,26,61,0.22), 0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(14,26,61,0.04) inset",
      }}
    >
      {/* Glass sheen at top (simulates light reflection) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 right-0 h-1/3 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Iridescent pastel glow on hover (easter-egg vibe) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"
        style={{
          background:
            "conic-gradient(from 120deg, rgba(247,207,90,0.22), rgba(73,187,189,0.24), rgba(165,52,225,0.18), rgba(27,60,138,0.22), rgba(247,207,90,0.22))",
        }}
      />

      {/* Media — circular brand logo when the course matches a known brand,
          otherwise the generic previewImage cover. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#eef2fb] to-[#d6dfee] flex items-center justify-center">
        {getBrandLogo(course.slug) ? (
          <BrandLogoTile
            slug={course.slug}
            size="w-[140px] h-[140px] group-hover:scale-[1.06] transition duration-[600ms]"
          />
        ) : (
          <>
            {course.previewImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={course.previewImage}
                alt=""
                aria-hidden
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition duration-[700ms] ease-out"
              />
            )}
            {/* Play button — frosted glass, reveals on hover (generic only) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500">
              <div className="relative h-14 w-14 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/80 flex items-center justify-center scale-75 group-hover:scale-100 transition duration-500 shadow-[0_10px_30px_-8px_rgba(14,26,61,0.35)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0e1a3d" className="-translate-x-0.5">
                  <path d="M6 4l14 8-14 8V4z" />
                </svg>
              </div>
            </div>
          </>
        )}
        {/* Light cinematic veil */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.35) 100%)",
          }}
        />

        {/* Top-right chip — frosted glass. For seminars we replace the
            level badge with a distinct "in-person seminar" tag. */}
        {seminar ? (
          <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#1b3c8a]/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold ring-1 ring-white/40 text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f7cf5a]" />
            سمینار حضوری
          </div>
        ) : (
          <div
            className={`absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold ring-1 ${LEVEL_ACCENTS_LIGHT[course.level].ring}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${LEVEL_ACCENTS_LIGHT[course.level].dot}`}
            />
            <span className={LEVEL_ACCENTS_LIGHT[course.level].text}>
              {LEVEL_LABELS[course.level]}
            </span>
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
          {course.badge && (
            <span className="rounded-full bg-white/80 backdrop-blur-md text-[#0e1a3d] text-[11px] font-extrabold px-2.5 py-1 ring-1 ring-white/80 shadow-sm">
              {course.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-rose-500/90 backdrop-blur text-white text-[11px] font-extrabold px-2.5 py-1 shadow-sm">
              {faDigits(discount)}٪ تخفیف
            </span>
          )}
        </div>

        {/* Bottom info ribbon — frosted chips */}
        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[#0e1a3d] text-[11px] font-medium">
          {seminar && course.venueName ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/85 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/80 max-w-[60%]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="font-bold truncate">{course.venueName}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/75 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/80">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-amber-500"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-bold">{faDigits(rating.toFixed(1))}</span>
            </span>
          )}
          <div className="inline-flex items-center gap-1.5">
            {course.lessons > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/80">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 8.5v7M2 12h14M16 8.5l6 3.5-6 3.5v-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {faDigits(course.lessons)} درس
              </span>
            )}
            {course.duration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/80">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {course.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body — glass with navy text */}
      <div className="relative p-5 flex flex-col flex-1 z-[2]">
        <h3 className="text-lg font-extrabold text-[#0e1a3d] line-clamp-1 group-hover:text-[#1b3c8a] transition">
          {course.title}
        </h3>
        <p className="mt-2 text-sm text-[#0e1a3d]/60 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {course.shortDesc}
        </p>

        {/* Instructor + students */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#1b3c8a] to-[#49bbbd] text-white font-bold text-[11px] ring-2 ring-white shadow-sm">
              {course.instructor?.trim()?.[0] ?? "ن"}
            </div>
            <span className="text-xs text-[#0e1a3d]/70 truncate font-medium">
              {course.instructor}
            </span>
          </div>
          {!course.hideStudentsCount && (
            <span className="text-[11px] text-[#0e1a3d]/50 inline-flex items-center gap-1 shrink-0 font-medium">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
              {faDigits(course.studentsCount)}
            </span>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-[#0e1a3d]/[0.08] flex items-end justify-between">
          <div>
            {course.isFree ? (
              <div className="text-lg font-black text-emerald-600">رایگان</div>
            ) : (
              <>
                {course.discountPrice && course.discountPrice < course.price && (
                  <div className="text-xs text-[#0e1a3d]/35 line-through leading-none">
                    {formatTomanCompact(course.price)}
                  </div>
                )}
                <div className="text-lg font-black text-[#0e1a3d] leading-tight">
                  {formatToman(course.discountPrice ?? course.price)}
                </div>
              </>
            )}
          </div>
          <span
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/80 backdrop-blur-md text-[#0e1a3d] ring-1 ring-white/90 group-hover:bg-gradient-to-br group-hover:from-[#f7cf5a] group-hover:to-[#d4a62a] group-hover:text-[#2d1c03] group-hover:ring-[#f7cf5a]/50 transition duration-400 shadow-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ============================ Empty ============================ */

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-24 px-4">
      <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-[#e3e9f4] to-white ring-1 ring-[#e3e9f4] flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#1b3c8a]">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-xl font-extrabold text-[#010514] mb-2">
        دوره‌ای با این مشخصات پیدا نشد
      </h3>
      <p className="text-[#010514]/55 max-w-md mx-auto">
        فیلترها را ساده‌تر کنید یا با کلمات کلیدی دیگر جستجو کنید.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#050924] text-white text-sm font-semibold px-6 py-3 hover:bg-[#1b3c8a] transition"
      >
        پاک کردن فیلترها
      </button>
    </div>
  );
}
