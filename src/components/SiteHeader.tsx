"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/courses", label: "دوره‌ها" },
  { href: "/articles", label: "مقالات" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/coaching", label: "نامدار گلد", gold: true },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  // Animated sliding pill — measures the active/hovered nav item and slides
  // a background behind it. Inspired by Linear / Vercel / Arc Browser headers.
  const navRef = useRef<HTMLElement | null>(null);
  const [pill, setPill] = useState<{
    left: number;
    width: number;
    visible: boolean;
  }>({ left: 0, width: 0, visible: false });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeIdx = (() => {
    const exact = NAV.findIndex((n) => n.href === pathname);
    if (exact !== -1) return exact;
    return NAV.findIndex(
      (n) => n.href !== "/" && pathname?.startsWith(n.href)
    );
  })();

  const visibleIdx = hoveredIdx ?? activeIdx;

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || visibleIdx < 0) {
      setPill((p) => ({ ...p, visible: false }));
      return;
    }
    const el = nav.querySelector<HTMLElement>(
      `[data-nav-idx="${visibleIdx}"]`
    );
    if (!el) return;
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setPill({
      left: r.left - navRect.left,
      width: r.width,
      visible: true,
    });
  }, [visibleIdx, pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const nav = navRef.current;
      if (!nav || visibleIdx < 0) return;
      const el = nav.querySelector<HTMLElement>(
        `[data-nav-idx="${visibleIdx}"]`
      );
      if (!el) return;
      const navRect = nav.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setPill({ left: r.left - navRect.left, width: r.width, visible: true });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [visibleIdx]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b border-white/8 ${
          scrolled
            ? "backdrop-blur-xl shadow-lg shadow-black/15"
            : "backdrop-blur-md"
        }`}
        style={{
          background: scrolled
            ? "linear-gradient(180deg, rgba(26,42,79,0.92) 0%, rgba(45,68,120,0.90) 100%)"
            : "linear-gradient(180deg, #1a2a4f 0%, #243b6b 60%, #2d4478 100%)",
        }}
      >
        <div
          className={`max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? "h-[64px]" : "h-[76px]"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="font-bold text-white text-lg tracking-tight leading-none">
                نامدارآکادمی
              </span>
              <span className="text-white/45 text-[10px] mt-1 tracking-wider">
                NAMDAR ACADEMY
              </span>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] flex items-center justify-center shadow-lg shadow-[#1b3c8a]/30 group-hover:shadow-[#49bbbd]/40 transition-all duration-300 group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M3 20V4l8 16V4l8 16V4"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#f7cf5a] ring-2 ring-[#1a2a4f] animate-pulse" />
            </div>
          </Link>

          {/* Nav with sliding pill */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center relative"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              aria-hidden
              className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-full bg-white/10 border border-white/15 transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                pill.visible ? "opacity-100" : "opacity-0"
              }`}
              style={{
                left: `${pill.left}px`,
                width: `${pill.width}px`,
              }}
            />
            {NAV.map((l, i) => {
              const active = i === activeIdx;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-nav-idx={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  className={`relative px-5 py-2.5 text-[15px] font-medium transition-colors duration-200 whitespace-nowrap ${
                    l.gold
                      ? "text-[#f7cf5a] hover:text-[#ffe28a]"
                      : active
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/cart"
              aria-label="سبد خرید"
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 group"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="group-hover:scale-110 transition-transform"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span
                  className="absolute top-1.5 left-1.5 min-w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#ff4444] to-[#ff6b6b] text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg shadow-[#ff4444]/40"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {count.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-white/10" />

            <Link
              href="/login"
              className="group flex items-center gap-2 px-4 py-2 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all duration-200"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="group-hover:scale-110 transition-transform"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>ورود / ثبت نام</span>
            </Link>

            {/* Gradient-border CTA with hover fill animation */}
            <Link
              href="/signup"
              className="relative group px-5 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#136cb5] via-[#49bbbd] to-[#f7cf5a]" />
              <span className="absolute inset-[2px] rounded-full bg-[#1a2a4f] group-hover:bg-transparent transition-colors duration-300" />
              <span className="relative text-white text-sm font-bold group-hover:text-[#1a2a4f] transition-colors duration-300">
                شروع کنید
              </span>
            </Link>
          </div>

          {/* Mobile right */}
          <div className="lg:hidden flex items-center gap-1">
            <Link
              href="/cart"
              aria-label="سبد خرید"
              className="relative w-10 h-10 flex items-center justify-center text-white/80"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span className="absolute top-1 left-1 min-w-[16px] h-[16px] rounded-full bg-[#ff4444] text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {count.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="منو"
              onClick={() => setOpen((v) => !v)}
              className="w-10 h-10 flex items-center justify-center text-white/90"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-[#0a1430]/95 backdrop-blur-xl border-t border-white/10 px-4 py-4 flex flex-col gap-1">
            {NAV.map((l, i) => {
              const active = i === activeIdx;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    l.gold
                      ? "text-[#f7cf5a]"
                      : active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="flex gap-2 pt-3 mt-2 border-t border-white/10">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full border border-white/20 text-white font-medium"
              >
                ورود
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full bg-gradient-to-r from-[#136cb5] to-[#49bbbd] text-white font-bold"
              >
                شروع کنید
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
