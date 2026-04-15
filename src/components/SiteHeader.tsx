"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/about", label: "درباره ما" },
  { href: "/courses", label: "دوره‌ها" },
  { href: "/articles", label: "مقالات" },
  { href: "/contact", label: "تماس با ما" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#eef2f7]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#1b3c8a] text-white flex items-center justify-center font-bold">
            ن
          </div>
          <span className="font-bold text-[#1b3c8a] text-lg hidden sm:inline">
            نامدارآکادمی
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[17px] font-medium transition ${
                  active
                    ? "text-[#1b3c8a]"
                    : "text-[#1b3c8a]/70 hover:text-[#1b3c8a]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-[#1b3c8a] text-sm font-medium hover:bg-[#eef4ff] transition"
          >
            ورود
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-full bg-[#1b3c8a] text-white text-sm font-medium hover:opacity-90 transition"
          >
            ثبت‌نام
          </Link>
        </div>

        <button
          type="button"
          aria-label="منو"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-[#1b3c8a]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#eef2f7] bg-white">
          <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-[#1b3c8a] text-base font-medium hover:bg-[#eef4ff]"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 mt-2 border-t border-[#eef2f7]">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2 rounded-full border border-[#1b3c8a] text-[#1b3c8a] font-medium"
              >
                ورود
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2 rounded-full bg-[#1b3c8a] text-white font-medium"
              >
                ثبت‌نام
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
