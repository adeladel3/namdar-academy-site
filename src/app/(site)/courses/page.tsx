"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COURSES, formatToman } from "@/data/courses";

const LEVELS = ["همه", "مقدماتی", "متوسط", "پیشرفته"] as const;

export default function CoursesPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("همه");

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      const matchesQ =
        q.trim() === "" ||
        c.title.includes(q.trim()) ||
        c.shortDesc.includes(q.trim());
      const matchesL = level === "همه" || c.level === level;
      return matchesQ && matchesL;
    });
  }, [q, level]);

  return (
    <div className="bg-[#f7fafd] min-h-screen py-10 md:py-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-[#010514] mb-3">
            دوره‌های نامدار آکادمی
          </h1>
          <p className="text-[#010514]/60 max-w-2xl mx-auto">
            مسیر یادگیری تخصصی ترید و سرمایه‌گذاری را از اینجا آغاز کنید.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="دوره مورد نظر خود را جستجو کن"
              className="w-full h-14 pr-14 pl-5 rounded-full bg-white text-[#010514] placeholder:text-[#010514]/40 text-base shadow border border-[#e5eaf5] focus:outline-none focus:border-[#136cb5] focus:ring-2 focus:ring-[#136cb5]/15"
            />
            <svg
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1b3c8a]"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20 20l-3-3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                level === l
                  ? "bg-[#1b3c8a] text-white"
                  : "bg-white text-[#1b3c8a] border border-[#e5eaf5] hover:border-[#1b3c8a]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#010514]/60">
            دوره‌ای با این مشخصات یافت نشد.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <Link
                key={c.slug}
                href={`/courses/${c.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl hover:-translate-y-1 transition border border-[#e5eaf5]"
              >
                <div className="relative aspect-video bg-gradient-to-br from-[#136cb5] to-[#49bbbd] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition"
                  />
                  {c.badge && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white text-[#1b3c8a] text-xs font-bold shadow">
                      {c.badge}
                    </span>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs font-medium">
                    {c.level}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#010514] mb-2 line-clamp-1 group-hover:text-[#136cb5] transition">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[#010514]/65 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {c.shortDesc}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#010514]/60 mb-4">
                    <span>📚 {c.lessons} درس</span>
                    <span>⏱ {c.duration}</span>
                    <span>👥 {c.students.toLocaleString("fa-IR")}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#e5eaf5]">
                    <div>
                      <div className="text-xs text-[#010514]/60">قیمت</div>
                      <div className="text-[#1b3c8a] font-bold">
                        {formatToman(c.price)}
                      </div>
                    </div>
                    <span className="text-[#1b3c8a] font-bold text-sm group-hover:gap-2 transition-all inline-flex items-center gap-1">
                      مشاهده <span>←</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
