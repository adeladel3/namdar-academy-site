"use client";

import Link from "@/components/SafeLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import BrandLogo from "@/components/BrandLogo";

type NavItem = {
  href: string;
  label: string;
  gold?: boolean;
  /**
   * Render as a disabled pill with a small "به زودی" chip instead of a real
   * link. Used until the separate gold platform launches; then swap `href`
   * to the platform URL and drop this flag.
   */
  comingSoon?: boolean;
  /** External absolute URL — open with a regular <a> in a new tab. */
  external?: boolean;
  children?: { href: string; label: string }[];
};

const NAV: NavItem[] = [
  { href: "/", label: "خانه" },
  {
    href: "/courses",
    label: "محصولات",
    children: [
      { href: "/courses", label: "آموزش ترید و بازار مالی" },
      { href: "/investing", label: "سرمایه‌گذاری و مشاوره" },
    ],
  },
  { href: "https://www.azgeram.com", label: "خرید و فروش طلا", gold: true, external: true },
  {
    href: "https://investinghub.namdaracademy.com",
    label: "سرمایه‌گذاری",
    external: true,
  },
  { href: "/articles", label: "مقالات" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

export default function SiteHeader({
  session = null,
}: {
  session?: { name: string; role: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const { count } = useCart();
  const userInitial = session?.name?.trim()?.[0] ?? "ن";

  const activeIdx = (() => {
    const exact = NAV.findIndex((n) => n.href === pathname);
    if (exact !== -1) return exact;
    return NAV.findIndex(
      (n) => n.href !== "/" && pathname?.startsWith(n.href)
    );
  })();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(14,26,61,0.18)] border-b border-[#e3e9f4]"
            : "bg-white/60 backdrop-blur-md"
        }`}
        dir="rtl"
      >
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 h-[88px] flex items-center justify-between gap-6">
          {/* Right: Brand (RTL first) — smaller on mobile */}
          <span className="lg:hidden">
            <BrandLogo variant="dark" size="xs" />
          </span>
          <span className="hidden lg:inline-flex">
            <BrandLogo variant="dark" size="md" />
          </span>


          {/* Center: Pill nav (dark navy gradient pills, gold-bordered active/gold pill) */}
          <nav className="hidden lg:flex items-center gap-3.5">
            {NAV.map((l, i) => {
              const isActive = i === activeIdx;
              const hasChildren = !!l.children?.length;
              const pillStyle = l.gold
                ? {
                    background:
                      "linear-gradient(180deg, #fde285 0%, #f7cf5a 45%, #d4a62a 100%)",
                    border: "2px solid #b48a1f",
                    boxShadow:
                      "0 14px 28px -8px rgba(247,207,90,0.7), 0 0 24px -6px rgba(247,207,90,0.55), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(180,138,31,0.35)",
                    color: "#2d1c03",
                    fontWeight: 800,
                    textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                  }
                : isActive
                ? {
                    background:
                      "linear-gradient(180deg, #3a5dab 0%, #1a2a4f 100%)",
                    border: "2px solid #f7cf5a",
                    color: "#fff",
                    boxShadow:
                      "0 10px 22px -10px rgba(247,207,90,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }
                : {
                    background:
                      "linear-gradient(180deg, #3a5dab 0%, #1a2a4f 100%)",
                    color: "#fff",
                    boxShadow:
                      "0 10px 22px -10px rgba(27,60,138,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                  };

              if (hasChildren) {
                return (
                  <div key={l.href} className="relative group">
                    <Link
                      href={l.href}
                      className="relative inline-flex items-center justify-center gap-1 h-[48px] px-6 rounded-full text-[15px] font-medium whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5"
                      style={pillStyle}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-3 top-[2px] h-[1px] rounded-full pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                        }}
                      />
                      {l.label}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-[2px] opacity-80 transition-transform duration-200 group-hover:rotate-180 group-hover:opacity-100"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </Link>
                    <div className="absolute top-full right-0 mt-2 min-w-[240px] opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-40">
                      <div
                        className="rounded-2xl overflow-hidden border border-[#e3e9f4] bg-white/95 backdrop-blur-xl"
                        style={{
                          boxShadow:
                            "0 24px 48px -18px rgba(14,26,61,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset",
                        }}
                      >
                        {l.children!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block px-5 py-3.5 text-[14px] font-medium text-[#0e1a3d] hover:bg-[#f4f7fd] hover:text-[#1b3c8a] transition border-b border-[#eef1f8] last:border-b-0"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              if (l.comingSoon) {
                return (
                  <span
                    key={l.href}
                    role="button"
                    aria-disabled="true"
                    dir="rtl"
                    title="به‌زودی"
                    className="relative inline-flex items-center gap-2.5 h-[48px] px-5 rounded-full text-[15px] font-medium whitespace-nowrap cursor-not-allowed select-none"
                    style={pillStyle}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-3 top-[2px] h-[1px] rounded-full pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                      }}
                    />
                    {l.label}
                    {/* Small dark chip sitting inside the gold pill — reads
                        as a tag attached to the label, not a floating badge. */}
                    <span
                      className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full text-[10px] font-extrabold tracking-[0.04em]"
                      style={{
                        background:
                          "linear-gradient(180deg, #2d1c03 0%, #1a1104 100%)",
                        color: "#f7cf5a",
                        border: "1px solid rgba(247,207,90,0.5)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px -2px rgba(45,28,3,0.4)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: "#f7cf5a",
                          boxShadow: "0 0 6px #f7cf5a",
                        }}
                      />
                      به‌زودی
                    </span>
                  </span>
                );
              }

              const desktopLinkProps = l.external
                ? { target: "_blank" as const, rel: "noopener noreferrer" }
                : {};

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  {...desktopLinkProps}
                  className="relative group inline-flex items-center justify-center h-[48px] px-6 rounded-full text-[15px] font-medium whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5"
                  style={pillStyle}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-3 top-[2px] h-[1px] rounded-full pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                    }}
                  />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Left: Cart + Login */}
          <div className="hidden lg:flex items-center gap-3.5 shrink-0">
            {/* Cart */}
            <Link
              href="/cart"
              aria-label="سبد خرید"
              className="relative w-[48px] h-[48px] rounded-full flex items-center justify-center text-[#1b3c8a] hover:text-[#0e1a3d] transition-all duration-200 group bg-white/70 backdrop-blur-sm border border-[#e3e9f4] hover:border-[#1b3c8a]/40 hover:shadow-md"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                className="group-hover:scale-110 transition-transform"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span
                  className="absolute -top-1 -left-1 min-w-[20px] h-[20px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff4d4d, #d63a35)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {count.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>

            {/* Login pill OR User pill (dashboard link) */}
            {session ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2.5 h-[48px] pl-5 pr-2 rounded-full text-[14.5px] font-medium text-white whitespace-nowrap max-w-[240px] transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #136cb5 0%, #1b3c8a 45%, #49bbbd 100%)",
                  boxShadow:
                    "0 12px 26px -10px rgba(19,108,181,0.55), inset 0 1px 0 rgba(255,255,255,0.22)",
                }}
              >
                <span
                  className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[#1b3c8a] font-black text-[14px] bg-white/95 ring-2 ring-white/60"
                >
                  {userInitial}
                </span>
                <span className="font-bold truncate">{session.name}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group inline-flex items-center gap-2.5 h-[48px] px-6 rounded-full text-[15px] font-medium text-white whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #136cb5 0%, #1b3c8a 45%, #49bbbd 100%)",
                  boxShadow:
                    "0 12px 26px -10px rgba(19,108,181,0.55), inset 0 1px 0 rgba(255,255,255,0.22)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  className="transition-transform group-hover:scale-110"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>ورود / ثبت نام</span>
              </Link>
            )}
          </div>

          {/* Mobile right cluster */}
          <div className="lg:hidden flex items-center gap-1">
            <Link
              href="/cart"
              aria-label="سبد خرید"
              className="relative w-10 h-10 flex items-center justify-center text-[#1b3c8a]"
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
              className="w-10 h-10 flex items-center justify-center text-[#1b3c8a]"
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
          <div className="bg-white/95 backdrop-blur-xl border-t border-[#e3e9f4] px-4 py-4 flex flex-col gap-2">
            {NAV.map((l, i) => {
              const isActive = i === activeIdx;
              const pillStyle = l.gold
                ? {
                    background:
                      "linear-gradient(180deg, #fde285 0%, #f7cf5a 45%, #d4a62a 100%)",
                    border: "2px solid #b48a1f",
                    color: "#2d1c03",
                    fontWeight: 800,
                    boxShadow:
                      "0 10px 22px -8px rgba(247,207,90,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
                  }
                : isActive
                ? {
                    background:
                      "linear-gradient(180deg, #3a5dab 0%, #1a2a4f 100%)",
                    border: "2px solid #f7cf5a",
                  }
                : {
                    background:
                      "linear-gradient(180deg, #3a5dab 0%, #1a2a4f 100%)",
                  };

              const hasChildren = !!l.children?.length;
              const isExpanded = mobileExpanded === l.href;

              if (hasChildren) {
                return (
                  <div key={l.href} className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpanded(isExpanded ? null : l.href)
                      }
                      className="px-5 py-3 rounded-full text-[15px] font-medium text-white flex items-center justify-center gap-1"
                      style={pillStyle}
                    >
                      {l.label}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-[2px] opacity-80 transition-transform duration-200"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "none",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-200"
                      style={{
                        maxHeight: isExpanded ? 200 : 0,
                        opacity: isExpanded ? 1 : 0,
                      }}
                    >
                      <div className="flex flex-col gap-1.5 pr-4 pl-2 pt-1">
                        {l.children!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setOpen(false)}
                            className="px-4 py-2.5 rounded-2xl text-[13.5px] font-medium text-[#1b3c8a] bg-[#f4f7fd] border border-[#e3e9f4] text-right"
                          >
                            ← {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              if (l.comingSoon) {
                return (
                  <span
                    key={l.href}
                    role="button"
                    aria-disabled="true"
                    dir="rtl"
                    className="px-5 py-3 rounded-full text-[15px] font-medium text-center inline-flex items-center justify-center gap-2.5 cursor-not-allowed select-none"
                    style={pillStyle}
                  >
                    {l.label}
                    <span
                      className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full text-[10px] font-extrabold tracking-[0.04em]"
                      style={{
                        background:
                          "linear-gradient(180deg, #2d1c03 0%, #1a1104 100%)",
                        color: "#f7cf5a",
                        border: "1px solid rgba(247,207,90,0.5)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px -2px rgba(45,28,3,0.4)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: "#f7cf5a",
                          boxShadow: "0 0 6px #f7cf5a",
                        }}
                      />
                      به‌زودی
                    </span>
                  </span>
                );
              }

              const mobileLinkProps = l.external
                ? { target: "_blank" as const, rel: "noopener noreferrer" }
                : {};

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  {...mobileLinkProps}
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 rounded-full text-[15px] font-medium text-white text-center"
                  style={pillStyle}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="flex gap-2 pt-3 mt-2 border-t border-[#e3e9f4]">
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-2.5 rounded-full text-white font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #136cb5 0%, #1b3c8a 45%, #49bbbd 100%)",
                  }}
                >
                  <span className="w-7 h-7 rounded-full bg-white/95 text-[#1b3c8a] font-black text-[13px] flex items-center justify-center">
                    {userInitial}
                  </span>
                  <span className="truncate">{session.name}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full text-white font-medium"
                  style={{
                    background:
                      "linear-gradient(135deg, #136cb5 0%, #1b3c8a 45%, #49bbbd 100%)",
                  }}
                >
                  ورود / ثبت نام
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
