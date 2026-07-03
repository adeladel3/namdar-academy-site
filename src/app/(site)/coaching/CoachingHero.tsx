"use client";

import Link from "@/components/SafeLink";
import { faDigits } from "@/lib/formatting";

type Bubble = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
};

const BUBBLES: Bubble[] = [
  {
    id: "intro",
    label: "معرفی",
    href: "#about-course",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "syllabus",
    label: "سرفصل‌ها",
    href: "#curriculum-detail",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" />
        <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
      </svg>
    ),
  },
  {
    id: "instructor",
    label: "مدرس",
    href: "#meet-instructor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      </svg>
    ),
  },
  {
    id: "perks",
    label: "مزیت‌ها",
    href: "#benefits",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5-5.5-3-5.5 3 1-6.5L3 8.8 9 8z" />
      </svg>
    ),
  },
  {
    id: "testimonials",
    label: "نظرات",
    href: "#video-testimonials",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12a8 8 0 10-14.9 4l-1.1 4 4-1.1A8 8 0 0020 12z" />
      </svg>
    ),
  },
  {
    id: "results",
    label: "نتایج",
    href: "#trading-results",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 7-8" />
        <polyline points="14 7 20 7 20 13" />
      </svg>
    ),
  },
  {
    id: "register",
    label: "ثبت‌نام",
    href: "#register",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H5a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2v-6" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    id: "faq",
    label: "سوالات",
    href: "#method-faq",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M9.2 9.2a3 3 0 015.6 1.3c0 2-2.8 2.2-2.8 4" />
        <circle cx="12" cy="17.2" r="0.7" fill="currentColor" />
      </svg>
    ),
  },
];

function smoothScrollTo(href: string) {
  const id = href.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 96;
  const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
  window.scrollTo({ top, behavior: "smooth" });
  history.replaceState(null, "", href);
}

function GlassBubble({ bubble }: { bubble: Bubble }) {
  return (
    <a
      href={bubble.href}
      aria-label={bubble.label}
      onClick={(e) => {
        e.preventDefault();
        smoothScrollTo(bubble.href);
      }}
      className="group relative flex flex-col items-center focus:outline-none cursor-pointer"
    >
      <div
        className="relative w-[76px] h-[76px] md:w-[92px] md:h-[92px] rounded-full transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:-translate-y-1.5 group-hover:rotate-[6deg] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 38%), radial-gradient(circle at 78% 28%, rgba(255,180,220,0.38) 0%, transparent 45%), radial-gradient(circle at 70% 78%, rgba(120,220,255,0.48) 0%, transparent 48%), radial-gradient(circle at 30% 75%, rgba(255,220,150,0.32) 0%, transparent 50%), rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow:
            "inset 0 0 26px rgba(255,255,255,0.22), inset -10px -8px 22px rgba(120,220,255,0.12), inset 10px 8px 22px rgba(255,180,220,0.1), 0 14px 32px -8px rgba(10,40,80,0.45), 0 0 18px rgba(255,255,255,0.18)",
        }}
      >
        {/* Specular highlight */}
        <span
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            left: "20%",
            top: "14%",
            width: "32%",
            height: "22%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 65%)",
            filter: "blur(2px)",
          }}
        />

        {/* Bottom-right iridescent rim */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(circle at 78% 78%, rgba(255,230,180,0.45) 0%, transparent 22%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Icon */}
        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_5px_rgba(10,40,80,0.45)] transition-transform duration-500 group-hover:scale-110">
          {bubble.icon}
        </span>

        {/* Hover rainbow glow */}
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,180,220,0.35), rgba(180,220,255,0.35), rgba(255,230,180,0.3), rgba(200,180,255,0.35), rgba(255,180,220,0.35))",
            filter: "blur(12px)",
            zIndex: -1,
          }}
        />
      </div>

      <span className="mt-3 text-[11px] md:text-[13px] text-white/85 group-hover:text-white font-bold transition-colors whitespace-nowrap">
        {bubble.label}
      </span>
    </a>
  );
}

export default function CoachingHero() {
  return (
    <section
      id="intro"
      className="relative overflow-hidden bg-gradient-to-l from-[#0b4a7a] via-[#1d88d1] to-[#64b5f6] text-white scroll-mt-24"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #f7cf5a 0, transparent 40%), radial-gradient(circle at 85% 80%, #49bbbd 0, transparent 45%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16 min-h-[560px] md:min-h-[720px] flex flex-col">
        <nav className="text-white/70 text-sm mb-6 flex gap-2">
          <Link href="/" className="hover:text-white">
            خانه
          </Link>
          <span>/</span>
          <span className="text-white">کوچینگ MON</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm">
                سطح حرفه‌ای
              </span>
              <span className="px-3 py-1 rounded-full bg-[#f7cf5a] text-[#2d1c03] text-sm font-bold">
                کوچینگ اختصاصی
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              کوچینگ MON
            </h1>

            <p className="text-white/85 text-base md:text-lg leading-8 md:leading-9 max-w-2xl">
              برنامهٔ ۱۸ هفته‌ای کوچینگ حرفه‌ای معامله‌گری با سبک MON، مستقیم
              زیر نظر استاد امیرحسین نام‌آور — از روان‌شناسی و مدیریت سرمایه
              تا متدولوژی اختصاصی نامدار و بستر جذب سرمایه.
            </p>

            <div className="flex flex-wrap gap-6 mt-8 text-sm">
              <div>
                <div className="text-white/60">مدرس</div>
                <div className="font-bold mt-1">استاد امیرحسین نام‌آور</div>
              </div>
              <div>
                <div className="text-white/60">مدت دوره</div>
                <div className="font-bold mt-1">{faDigits(18)} هفته</div>
              </div>
              <div>
                <div className="text-white/60">فارغ‌التحصیل</div>
                <div className="font-bold mt-1">+{faDigits(2000)} نفر</div>
              </div>
              <div>
                <div className="text-white/60">نرخ موفقیت</div>
                <div className="font-bold mt-1">{faDigits(73)}٪</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8 glass bubbles */}
        <div className="mt-auto pt-12 md:pt-16">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 justify-items-center">
            {BUBBLES.map((b) => (
              <GlassBubble key={b.id} bubble={b} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
