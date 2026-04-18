"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { CourseLevelKey, CourseStatus } from "@/lib/db";
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
  badge?: string;
  status: CourseStatus;
  createdAt: number;
  publishedAt?: number;
  duration: string;
  lessons: number;
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

function discountPercent(c: CourseCardData) {
  if (!c.discountPrice || c.discountPrice >= c.price) return 0;
  return Math.round(((c.price - c.discountPrice) / c.price) * 100);
}

// Deterministic rating derived from studentsCount — 4.4 to 4.95
function fakeRating(c: CourseCardData) {
  const base = 4.4 + ((c.studentsCount % 55) / 100);
  return Math.min(4.95, Math.round(base * 10) / 10);
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
      <section className="relative overflow-hidden bg-[#050924] text-white">
        {/* Layered glow */}
        <div className="pointer-events-none absolute -top-32 -right-20 h-[420px] w-[420px] rounded-full bg-[#136cb5] opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[460px] w-[460px] rounded-full bg-[#49bbbd] opacity-25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[280px] w-[280px] rounded-full bg-amber-500 opacity-[0.08] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />

        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 pt-16 pb-32 md:pt-24 md:pb-40">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs md:text-sm text-white/80 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inset-0 rounded-full bg-[#49bbbd] opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-[#49bbbd]" />
              </span>
              کتابخانه آموزشی نامدار آکادمی
            </span>

            <h1 className="mt-7 text-[40px] md:text-[72px] font-black tracking-tight leading-[1.05]">
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
            <p className="mt-7 max-w-2xl text-base md:text-lg text-white/70 leading-relaxed">
              مسیری ساختاریافته که با متدولوژی اختصاصی استاد نام‌آور و هزاران
              ساعت تجربه میدانی طراحی شده. هر دوره، یک قدم جدی به سمت حرفه‌ای
              شدن.
            </p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-3 md:gap-5 w-full max-w-3xl">
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
                  className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur px-3 py-5 md:px-6 md:py-6 hover:border-[#49bbbd]/40 transition"
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
                  <div className="text-2xl md:text-4xl font-black text-white tracking-tight">
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
                    <CourseCard key={c.slug} course={c} />
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
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative block overflow-hidden rounded-[2rem] bg-[#050924] text-white shadow-[0_40px_100px_-30px_rgba(5,9,36,0.5)] ring-1 ring-white/5 hover:shadow-[0_60px_140px_-30px_rgba(5,9,36,0.7)] transition-all duration-500"
    >
      {/* Animated gradient border glow on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-r from-[#49bbbd]/0 via-[#49bbbd]/40 to-[#136cb5]/0 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />

      <div className="relative grid md:grid-cols-5 gap-0">
        {/* Image */}
        <div className="relative md:col-span-2 aspect-[16/10] md:aspect-auto md:min-h-[420px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.previewImage}
            alt=""
            aria-hidden
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
            }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition duration-[700ms] ease-out"
          />
          {/* Cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#050924]/40 via-transparent to-[#050924]/50" />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#050924] via-[#050924]/20 to-transparent" />

          {/* Play badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-20 w-20 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/30 flex items-center justify-center group-hover:scale-110 transition duration-500">
              <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white" className="relative -translate-x-0.5">
                <path d="M6 4l14 8-14 8V4z" />
              </svg>
            </div>
          </div>

          {/* Top-left tag */}
          <div className="absolute top-5 right-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#49bbbd] text-[#050924] text-xs font-extrabold px-3 py-1.5 shadow-lg shadow-[#49bbbd]/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              دوره منتخب
            </span>
          </div>

          {discount > 0 && (
            <span className="absolute bottom-5 right-5 rounded-full bg-rose-500 text-white text-xs font-extrabold px-3 py-1.5 shadow-lg shadow-rose-500/40">
              {faDigits(discount)}٪ تخفیف
            </span>
          )}
        </div>

        {/* Body */}
        <div className="relative md:col-span-3 p-6 md:p-12 flex flex-col">
          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className={`inline-flex items-center gap-1.5 font-semibold ${LEVEL_ACCENTS[course.level].text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_ACCENTS[course.level].dot}`} />
              سطح {LEVEL_LABELS[course.level]}
            </span>
            <span className="h-3 w-px bg-white/15" />
            {course.duration && (
              <>
                <span className="text-white/60">مدت: {course.duration}</span>
                <span className="h-3 w-px bg-white/15" />
              </>
            )}
            {course.lessons > 0 && (
              <>
                <span className="text-white/60">{faDigits(course.lessons)} درس</span>
                <span className="h-3 w-px bg-white/15" />
              </>
            )}
            <span className="inline-flex items-center gap-1 text-amber-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-semibold">{faDigits(rating.toFixed(1))}</span>
            </span>
          </div>

          <h2 className="mt-5 text-3xl md:text-5xl font-black leading-[1.05] tracking-tight">
            {course.title}
          </h2>
          <p className="mt-4 text-white/65 leading-relaxed line-clamp-3 max-w-xl">
            {course.shortDesc}
          </p>

          {/* Instructor */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#1b3c8a] to-[#49bbbd] text-white font-black text-sm ring-2 ring-white/10">
              {course.instructor?.trim()?.[0] ?? "ن"}
            </div>
            <div>
              <div className="text-[11px] text-white/45">مدرس</div>
              <div className="text-sm font-bold">{course.instructor}</div>
            </div>
          </div>

          <div className="mt-auto pt-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              {course.isFree ? (
                <div className="text-3xl font-black text-emerald-400">رایگان</div>
              ) : (
                <>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <div className="text-sm text-white/40 line-through">
                      {formatToman(course.price)}
                    </div>
                  )}
                  <div className="text-3xl font-black text-white">
                    {formatToman(course.discountPrice ?? course.price)}
                  </div>
                </>
              )}
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-white text-[#050924] text-sm font-extrabold px-7 py-3.5 group-hover:bg-[#49bbbd] transition duration-300">
              ورود به دوره
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:-translate-x-1">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================ Card ============================ */

function CourseCard({ course }: { course: CourseCardData }) {
  const discount = discountPercent(course);
  const rating = fakeRating(course);
  const ref = useRef<HTMLAnchorElement>(null);

  // 3D tilt effect on pointer move
  function handleMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rotX = (0.5 - y) * 6;
    const rotY = (x - 0.5) * 6;
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
      href={`/courses/${course.slug}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-[#050924] text-white ring-1 ring-white/5 shadow-[0_15px_40px_-20px_rgba(5,9,36,0.35)] hover:shadow-[0_40px_80px_-30px_rgba(5,9,36,0.55)] transition-all duration-500 [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Gradient border glow */}
      <div className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-[#49bbbd]/0 via-[#49bbbd]/30 to-[#136cb5]/0 opacity-0 group-hover:opacity-100 blur-xl transition duration-500" />

      {/* Media */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.previewImage}
          alt=""
          aria-hidden
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
          }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-[700ms] ease-out"
        />
        {/* Cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050924] via-[#050924]/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,9,36,0.45)_100%)]" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500">
          <div className="relative h-14 w-14 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center scale-75 group-hover:scale-100 transition duration-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="-translate-x-0.5">
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          </div>
        </div>

        {/* Top-right level dot */}
        <div className={`absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold ring-1 ${LEVEL_ACCENTS[course.level].ring}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_ACCENTS[course.level].dot}`} />
          <span className={LEVEL_ACCENTS[course.level].text}>{LEVEL_LABELS[course.level]}</span>
        </div>

        {/* Top-left badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
          {course.badge && (
            <span className="rounded-full bg-white text-[#050924] text-[11px] font-extrabold px-2.5 py-1 shadow">
              {course.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 shadow">
              {faDigits(discount)}٪ تخفیف
            </span>
          )}
        </div>

        {/* Bottom info ribbon */}
        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur px-2.5 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-300">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {faDigits(rating.toFixed(1))}
          </span>
          <div className="inline-flex items-center gap-1.5">
            {course.lessons > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur px-2.5 py-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M22 8.5v7M2 12h14M16 8.5l6 3.5-6 3.5v-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {faDigits(course.lessons)} درس
              </span>
            )}
            {course.duration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur px-2.5 py-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {course.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative p-5 flex flex-col flex-1">
        <h3 className="text-lg font-extrabold text-white line-clamp-1 group-hover:text-[#49bbbd] transition">
          {course.title}
        </h3>
        <p className="mt-2 text-sm text-white/55 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {course.shortDesc}
        </p>

        {/* Instructor + students */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#1b3c8a] to-[#49bbbd] text-white font-bold text-[11px] ring-2 ring-white/10">
              {course.instructor?.trim()?.[0] ?? "ن"}
            </div>
            <span className="text-xs text-white/60 truncate">
              {course.instructor}
            </span>
          </div>
          <span className="text-[11px] text-white/45 inline-flex items-center gap-1 shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
            {faDigits(course.studentsCount)}
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 flex items-end justify-between">
          <div>
            {course.isFree ? (
              <div className="text-lg font-black text-emerald-400">رایگان</div>
            ) : (
              <>
                {course.discountPrice && course.discountPrice < course.price && (
                  <div className="text-xs text-white/35 line-through leading-none">
                    {formatTomanCompact(course.price)}
                  </div>
                )}
                <div className="text-lg font-black text-white leading-tight">
                  {formatToman(course.discountPrice ?? course.price)}
                </div>
              </>
            )}
          </div>
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white group-hover:bg-[#49bbbd] group-hover:text-[#050924] transition duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
