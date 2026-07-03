import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/db";
import { faDigits, formatToman } from "@/lib/formatting";
import EnrollButton from "../[slug]/EnrollButton";
import FloatingSupportDock from "@/components/FloatingSupportDock";
import InvestingHubClient from "./InvestingHubClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Investing Hub — نامدار آکادمی",
  description:
    "پلتفرم چنددارایی مدیریت هوشمند سرمایه؛ فینوست برای معامله‌گری حرفه‌ای و نوا برای سبدچینی تخصصی.",
};

const SLUG = "investing-hub";

const CORE_CAPABILITIES: {
  key: string;
  title: string;
  tagline: string;
  bullets: string[];
  accent: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "multi",
    title: "پوشش چندبازار",
    tagline: "MULTI-MARKET COVERAGE",
    bullets: [
      "بورس تهران (سهام و شاخص‌ها)",
      "طلا، دلار و دارایی‌های کلان",
      "فارکس و کامودیتی‌های جهانی",
      "کریپتو (BTC، ETH، آلت‌کوین‌ها)",
    ],
    accent: "#7ab8ff",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
      </svg>
    ),
  },
  {
    key: "structured",
    title: "تحلیل ساختارمند معامله",
    tagline: "STRUCTURED INTELLIGENCE",
    bullets: [
      "نقاط بهینهٔ ورود و خروج",
      "سناریوسازی Bull / Bear / Sideways",
      "ترکیب تکنیکال + فاندامنتال",
      "تحلیل رفتار قیمت و نقدینگی",
    ],
    accent: "#f7cf5a",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-6 4 3 4-7 5 4" />
        <polyline points="3 21 21 21" />
      </svg>
    ),
  },
  {
    key: "risk",
    title: "تخصیص در طیف ریسک",
    tagline: "RISK SPECTRUM",
    bullets: [
      "دارایی کم‌ریسک (محافظه‌کارانه)",
      "دارایی متعادل",
      "دارایی پرریسک (فرصت‌محور)",
      "پرتفوی متنوع و پایدار",
    ],
    accent: "#b48bff",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12A10 10 0 1112 2v10z" />
        <path d="M22 12A10 10 0 0012 2v10z" opacity=".4" />
      </svg>
    ),
  },
  {
    key: "signal",
    title: "لایهٔ سیگنال و اجرا",
    tagline: "SIGNAL & EXECUTION",
    bullets: [
      "سیگنال طلا (XAUUSD)",
      "سیگنال فارکس",
      "سیگنال کامودیتی‌ها",
      "زمان‌بندی دقیق ورود/خروج",
    ],
    accent: "#6be6c1",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h4l3-9 4 18 3-9h6" />
      </svg>
    ),
  },
  {
    key: "learn",
    title: "یادگیری پیوسته",
    tagline: "CONTINUOUS LEARNING",
    bullets: [
      "وبینارهای هفتگی تحلیل بازار",
      "بررسی معاملات واقعی",
      "آموزش کاربردی و قابل اجرا",
      "به‌روزرسانی متدولوژی",
    ],
    accent: "#ff89b3",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z" />
        <path d="M4 19.5V21h16" />
      </svg>
    ),
  },
  {
    key: "support",
    title: "پشتیبانی ۲۴ ساعته",
    tagline: "24/7 SUPPORT",
    bullets: [
      "پاسخ سریع به سوالات تحلیلی",
      "بررسی معاملات باز شما",
      "راهنمایی در لحظات بحرانی",
      "ارتباط مستقیم با تیم",
    ],
    accent: "#f4a358",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0118 0v6a2 2 0 01-2 2h-1v-7h3" />
        <path d="M3 18V12h3v8H5a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const METHOD_LAYERS: {
  idx: string;
  title: string;
  tagline: string;
  desc: string;
}[] = [
  {
    idx: "۰۱",
    title: "ساختار کلان بازار",
    tagline: "MARKET CONTEXT",
    desc: "پیش از هر تصمیم، ساختار کلان بازار و چرخهٔ اقتصاد شناسایی می‌شود تا جهت اصلی حرکت مشخص باشد — نه برخلاف روند، نه علیه جریان نقدینگی.",
  },
  {
    idx: "۰۲",
    title: "نقدینگی و رفتار قیمت",
    tagline: "LIQUIDITY & PRICE",
    desc: "نواحی کلیدی نقدینگی، شکار استاپ‌ها، و مناطق واکنشی بازار شناسایی می‌شوند — جایی که قیمت واقعاً تصمیم می‌گیرد، نه جایی که به‌ظاهر می‌رود.",
  },
  {
    idx: "۰۳",
    title: "اجرای دقیق",
    tagline: "EXECUTION PRECISION",
    desc: "زمان‌بندی دقیق ورود و خروج با نسبت ریسک به ریوارد منطقی — معامله با برنامه، نه با هیجان. هر ورود، یک فرضیهٔ قابل‌اندازه‌گیری.",
  },
];

const TARGET_USERS: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "سرمایه‌گذاران فردی",
    desc: "کسانی که می‌خواهند سرمایهٔ شخصی را با روشی داده‌محور و منظم رشد دهند.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0116 0v2" />
      </svg>
    ),
  },
  {
    title: "تریدرهای فعال",
    desc: "معامله‌گرانی که سیگنال دقیق، تحلیل لحظه‌ای و ابزار تصمیم‌گیری سریع نیاز دارند.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    title: "مدیران سرمایه",
    desc: "افرادی که مسئولیت مدیریت حرفه‌ای و سیستماتیک سرمایه را بر عهده دارند.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5L12 16l-5.5 3 1-6.5L3 8.8 9 8z" />
      </svg>
    ),
  },
  {
    title: "علاقه‌مندان تنوع‌بخشی",
    desc: "کسانی که می‌خواهند دارایی‌های خود را میان چند بازار و طیف ریسک توزیع کنند.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Investing Hub چه تفاوتی با یک سرویس سیگنال معمولی دارد؟",
    a: "Investing Hub یک پلتفرم تصمیم‌سازی است، نه صرفاً سیگنال‌دهی. ترکیب تحلیل چندبازار، سبدچینی اختصاصی، و یادگیری پیوسته — در کنار سیگنال — کاربر را از سطح دریافت اطلاعات به سطح اجرای استراتژی می‌رساند.",
  },
  {
    q: "تفاوت فینوست و نوا چیست؟",
    a: "فینوست روی معامله‌گری حرفه‌ای، سیگنال‌های لحظه‌ای و تحلیل AI تمرکز دارد. نوا روی سبدچینی بلندمدت بر اساس سطح ریسک و اهداف شما. این دو مکمل یکدیگرند و می‌توانند هم‌زمان استفاده شوند.",
  },
  {
    q: "برای مبتدی مناسب است؟",
    a: "بله. Investing Hub ابزار مسیر رشد مرحله‌به‌مرحله دارد؛ اما اگر کاملاً تازه‌کار هستی، ما پیشنهاد می‌کنیم ابتدا دوره NOVA را بگذرانی و سپس به Investing Hub بپیوندی.",
  },
  {
    q: "دسترسی به محتوا چند ساعته است؟",
    a: "تیم تحلیل و پشتیبانی به‌صورت ۲۴ ساعته در ۷ روز هفته فعال است. سیگنال‌ها و تحلیل‌ها لحظه‌ای ارسال می‌شوند و وبینارهای هفتگی در تقویم اختصاصی قرار می‌گیرد.",
  },
  {
    q: "ضمانت بازگشت وجه دارد؟",
    a: "تا ۷ روز پس از خرید، در صورت عدم رضایت از پلتفرم، کل مبلغ بدون پرسش و پاسخ عودت داده می‌شود.",
  },
];

export default async function InvestingHubPage() {
  const course = getCourse(SLUG);
  if (!course) notFound();

  return (
    <div className="bg-[#05122a] min-h-screen text-white" dir="rtl">
      {/* ═════════════ HERO — eggs shell + INVESTING HUB lockup ═════════════ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, #050e23 0%, #0a1a3c 35%, #13305f 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 pt-6 md:pt-8">
          <nav className="text-white/55 text-sm mb-5 flex gap-2">
            <Link href="/" className="hover:text-white transition">خانه</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-white transition">دوره‌ها</Link>
            <span>/</span>
            <span className="text-white/85">Investing Hub</span>
          </nav>
        </div>

        {/* Eggs frame with wide ambient backdrop, inspired by the home section */}
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8">
          <div
            className="relative h-[320px] md:h-[420px] rounded-[28px] overflow-hidden bg-[#5a7e9d]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/figma/investing-hub-shell.png"
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              style={{ filter: "blur(110px) saturate(115%)", transform: "scale(1.8)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(94,126,160,0.55) 0%, rgba(94,126,160,0) 20%, rgba(94,126,160,0) 80%, rgba(94,126,160,0.55) 100%)",
              }}
            />

            {/* Centered shell */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-full aspect-[720/1000] overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(180deg, #000 0%, #000 60%, transparent 92%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(180deg, #000 0%, #000 60%, transparent 92%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/figma/investing-hub-shell.png"
                alt="Investing Hub"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />
            </div>

            {/* Luxury lockup — INVESTING HUB */}
            <div
              aria-hidden
              className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 md:gap-3 pointer-events-none z-10"
            >
              <div className="flex items-center gap-4">
                <span className="block h-px w-[60px] md:w-[80px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65))" }} />
                <span className="block w-1.5 h-1.5 rotate-45" style={{ background: "rgba(255,255,255,0.8)" }} />
                <span className="block h-px w-[60px] md:w-[80px]" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.65), transparent)" }} />
              </div>
              <h1
                className="text-center whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-cinzel), 'Playfair Display', serif",
                  fontWeight: 600,
                  fontSize: "clamp(24px, 4vw, 42px)",
                  letterSpacing: "0.3em",
                  lineHeight: 1,
                  paddingRight: "0.3em",
                  backgroundImage:
                    "linear-gradient(180deg, #ffffff 0%, #e8eef8 55%, #b7c9e2 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 2px 18px rgba(0,0,0,0.22), 0 0 48px rgba(0,0,0,0.18)",
                  filter: "drop-shadow(0 4px 24px rgba(10,22,48,0.45))",
                }}
                dir="ltr"
              >
                INVESTING HUB
              </h1>
              <div className="flex items-center gap-3">
                <span className="block h-px w-[40px] md:w-[55px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4))" }} />
                <span
                  style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontWeight: 500,
                    fontSize: 10,
                    letterSpacing: "0.55em",
                    color: "rgba(255,255,255,0.78)",
                    paddingRight: "0.55em",
                  }}
                  dir="ltr"
                >
                  NAMDAR CAPITAL
                </span>
                <span className="block h-px w-[40px] md:w-[55px]" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.4), transparent)" }} />
              </div>
            </div>

            {/* Bottom-center glass intro card */}
            <div className="absolute inset-x-3 bottom-4 md:inset-x-8 md:bottom-6 flex justify-center">
              <div
                className="relative rounded-[18px] px-4 py-2.5 md:px-6 md:py-3 max-w-[640px] w-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%)",
                  backdropFilter: "blur(18px) saturate(140%)",
                  WebkitBackdropFilter: "blur(18px) saturate(140%)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 40px rgba(6,12,30,0.40)",
                }}
              >
                <p className="text-center text-[12px] md:text-[13.5px] leading-[1.8] text-white/90 font-['Yekan_Bakh:Medium',sans-serif]">
                  دو سرویس مکمل برای مدیریت هوشمند سرمایه؛ معامله‌گری حرفه‌ای با
                  <span className="text-[#f7cf5a] font-bold mx-1">فینوست</span>
                  و سبدچینی تخصصی با
                  <span className="text-[#c78bff] font-bold mx-1">نوا</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Meta strip */}
          <div className="mt-5 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "سطح", value: "پیشرفته" },
              { label: "مدت دسترسی", value: "سالانه" },
              { label: "بازارها", value: "۴ بازار" },
              { label: "پشتیبانی", value: "۲۴/۷" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-2xl px-4 py-4 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <div className="text-[11px] text-white/55 tracking-[0.18em] mb-1">{m.label}</div>
                <div className="text-sm md:text-base font-extrabold text-white">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════ INTRO ═════════════ */}
      <section className="relative py-10 md:py-14">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 text-center">
          <Eyebrow>OVERVIEW</Eyebrow>
          <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
            یک زیرساخت تصمیم‌سازی، نه یک سرویس سیگنال
          </h2>
          <p className="text-white/70 text-base md:text-lg leading-9 max-w-3xl mx-auto">
            Investing Hub با پوشش هم‌زمان بازارهای داخلی و بین‌المللی، به شما امکان می‌دهد
            پرتفویی متوازن میان دارایی‌های کم‌ریسک تا پرریسک ایجاد کرده و تصمیمات خود را
            بر پایهٔ تحلیل‌های ساختاریافته اتخاذ کنید — با رویکردی داده‌محور و سیستماتیک.
          </p>
        </div>
      </section>

      {/* ═════════════ 6 GLASS FEATURE CHIPS — hub-style ═════════════ */}
      <section className="relative pb-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow>CAPABILITIES</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              شش قابلیت کلیدی
            </h2>
          </div>

          <InvestingHubClient capabilities={CORE_CAPABILITIES} />
        </div>
      </section>

      {/* ═════════════ METHODOLOGY — 3 layers ═════════════ */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full opacity-25 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 right-1/4 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Eyebrow>METHODOLOGY</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              سه لایه تصمیم‌گیری
            </h2>
            <p className="text-white/65 max-w-2xl mx-auto text-sm md:text-base leading-7">
              هر معامله از این سه لایه عبور می‌کند تا تصمیم، منطقی و قابل‌اندازه‌گیری باشد.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {METHOD_LAYERS.map((l) => (
              <div
                key={l.idx}
                className="relative rounded-[22px] p-6 md:p-7 overflow-hidden group hover:-translate-y-1 transition duration-500"
                style={{
                  background:
                    "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.02) 45%), rgba(255,255,255,0.05)",
                  backdropFilter: "blur(16px) saturate(140%)",
                  WebkitBackdropFilter: "blur(16px) saturate(140%)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.22), 0 18px 48px -18px rgba(0,0,0,0.55)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute top-3 left-6 w-20 h-3 rounded-full bg-white/25 blur-sm pointer-events-none"
                />
                <div
                  className="font-black text-[64px] leading-none bg-clip-text text-transparent mb-3"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(247,207,90,0.95), rgba(247,207,90,0.25))",
                  }}
                >
                  {l.idx}
                </div>
                <div className="text-[11px] tracking-[0.24em] font-bold text-[#f7cf5a]/85 mb-2" dir="ltr">
                  {l.tagline}
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white mb-3 leading-tight">
                  {l.title}
                </h3>
                <p className="text-sm text-white/70 leading-8">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════ TWO BRAND CARDS — FINVEST + NOVA ═════════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Eyebrow>TWO WINGS</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              دو بالِ مکمل مدیریت سرمایه
            </h2>
            <p className="text-white/65 max-w-2xl mx-auto text-sm md:text-base leading-7">
              فینوست برای معامله‌گری حرفه‌ای؛ نوا برای سبدچینی تخصصی. می‌توانی یکی را انتخاب کنی یا از ترکیب دو سرویس بهره ببری.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <BrandCard
              brand="FINVEST"
              tagline="FINVEST TRADING ASSISTANT"
              title="دستیار معامله‌گری فینوست"
              subtitle="سیگنال‌های حرفه‌ای + تحلیل AI"
              logoSrc="/figma/finvestcopy1.png"
              logoStyle={{ left: -36, top: -20, width: 252, height: 125, maxWidth: "none" }}
              features={[
                "سیگنال لحظه‌ای طلا، نفت و شاخص‌ها",
                "تحلیل تکنیکال هوشمند با AI",
                "مدیریت ریسک و هشدار خودکار",
                "آنلاین ۲۴ ساعته ۷ روز هفته",
              ]}
              accent="#f7cf5a"
              accentSoft="#ffb84a"
              bg="linear-gradient(135deg, #0a0e2f 0%, #1a1555 60%, #2a1a4a 100%)"
            />
            <BrandCard
              brand="NOVA"
              tagline="NOVA PORTFOLIO CONSULTING"
              title="مشاوره سبدچینی نوا"
              subtitle="سبد متناسب با سطح ریسک شما"
              logoSrc="/figma/untitled1copy1.png"
              features={[
                "سبدچینی اختصاصی هم‌راستا با اهداف",
                "جلسات آنلاین با کارشناسان ارشد",
                "گزارش عملکرد ماهانه با جزئیات",
                "مشاوره و پشتیبانی ۲۴ ساعته",
              ]}
              accent="#c74bff"
              accentSoft="#a534e1"
              bg="linear-gradient(135deg, #120b2f 0%, #2a1055 55%, #3a0f66 100%)"
            />
          </div>
        </div>
      </section>

      {/* ═════════════ TARGET USERS ═════════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow>WHO IT&apos;S FOR</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              برای چه کسانی طراحی شده؟
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {TARGET_USERS.map((u) => (
              <div
                key={u.title}
                className="relative rounded-2xl p-5 text-center group hover:-translate-y-1 transition"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f7cf5a]/15 border border-[#f7cf5a]/35 text-[#f7cf5a] flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  {u.icon}
                </div>
                <h3 className="font-extrabold text-white text-base mb-2 leading-tight">
                  {u.title}
                </h3>
                <p className="text-[13px] text-white/65 leading-7">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════ VALUE PROPOSITION STRIP ═════════════ */}
      <section className="relative py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div
            className="relative rounded-[28px] px-6 md:px-10 py-8 md:py-10 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(247,207,90,0.10) 0%, rgba(27,60,138,0.15) 55%, rgba(199,75,255,0.10) 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full opacity-30 blur-[100px] pointer-events-none"
              style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full opacity-30 blur-[100px] pointer-events-none"
              style={{ background: "radial-gradient(circle, #c74bff, transparent 70%)" }}
            />

            <div className="relative grid md:grid-cols-4 gap-6 md:gap-8">
              {[
                { t: "یکپارچه", d: "چند بازار در یک سامانه" },
                { t: "داده‌محور", d: "کاهش تصمیم هیجانی" },
                { t: "دقیق", d: "زمان‌بندی ورود و خروج" },
                { t: "شخصی‌سازی", d: "استراتژی متناسب با تو" },
              ].map((v) => (
                <div key={v.t} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-white mb-2">{v.t}</div>
                  <div className="text-sm text-white/70">{v.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════ PRICING / ENROLL ═════════════ */}
      <section id="pricing" className="relative py-16 md:py-24 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow>ENROLL NOW</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              آمادهٔ ورود به Investing Hub هستید؟
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base leading-7">
              با یک‌بار پرداخت، دسترسی سالانه به کل پلتفرم، سیگنال‌ها، وبینارها و مشاورهٔ اختصاصی.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-8 items-start">
            {/* Pricing card */}
            <div
              className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.04) 45%), linear-gradient(135deg, rgba(247,207,90,0.20), rgba(212,166,42,0.08) 60%, rgba(255,255,255,0.04))",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(247,207,90,0.45)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 50px -15px rgba(247,207,90,0.30)",
              }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#f7cf5a]/30 border border-[#f7cf5a]/55 text-[#f7cf5a] flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.2em] font-bold text-[#f7cf5a] mb-1">
                    مبلغ دسترسی سالانه
                  </div>
                  {course.discountPrice ? (
                    <>
                      <div className="text-sm text-white/55 line-through mb-1">
                        {formatToman(course.price)}
                      </div>
                      <div className="font-black text-3xl md:text-4xl text-white tabular-nums">
                        {formatToman(course.discountPrice)}
                      </div>
                    </>
                  ) : (
                    <div className="font-black text-3xl md:text-4xl text-white tabular-nums">
                      {formatToman(course.price)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                {course.allowPurchase ? (
                  <EnrollButton course={course} />
                ) : (
                  <div className="text-center py-3 rounded-full bg-white/10 text-white/65 border border-white/15">
                    این محصول در حال حاضر قابل خرید نیست
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 gap-3 text-[12px] text-white/85">
                <InfoRow label="سطح" value="پیشرفته" />
                <InfoRow label="مدت دسترسی" value="یک سال" />
                <InfoRow label="سرویس‌ها" value="FINVEST + NOVA" />
                <InfoRow label="پشتیبانی" value={faDigits("24") + " ساعته"} />
              </div>
            </div>

            {/* Inclusions list */}
            <div className="space-y-3.5">
              {[
                {
                  title: "سیگنال‌های لحظه‌ای چندبازار",
                  body: "دریافت نقاط ورود/خروج، حد ضرر و حد سود در طلا، فارکس و کامودیتی‌ها.",
                },
                {
                  title: "سبدچینی اختصاصی نوا",
                  body: "سبد متناسب با سطح ریسک و اهداف سرمایه‌گذاری شما با بازنگری دوره‌ای.",
                },
                {
                  title: "تحلیل AI چارت‌ها",
                  body: "اسکن هوشمند، شناسایی الگو، هشدار خودکار در شکست سطوح کلیدی.",
                },
                {
                  title: "وبینارهای هفتگی",
                  body: "انتقال دانش عملی و بررسی معاملات واقعی با تیم تحلیل.",
                },
                {
                  title: "ضمانت بازگشت وجه ۷ روزه",
                  body: "اگر در یک هفتهٔ اول راضی نبودی، کل مبلغ بدون پرسش عودت داده می‌شود.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="relative rounded-2xl p-4 md:p-5 overflow-hidden flex items-start gap-3"
                  style={{
                    background:
                      "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 45%), rgba(255,255,255,0.05)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
                  }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#f7cf5a]/20 border border-[#f7cf5a]/40 text-[#f7cf5a] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-white text-[15px] mb-1 leading-tight">
                      {f.title}
                    </h3>
                    <p className="text-[13px] text-white/70 leading-7">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════ FAQ ═════════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              سوالات متداول
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group rounded-2xl overflow-hidden transition"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <summary className="list-none cursor-pointer flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition">
                  <span className="shrink-0 w-9 h-9 rounded-xl bg-[#f7cf5a]/20 border border-[#f7cf5a]/45 text-[#f7cf5a] flex items-center justify-center font-extrabold text-sm tabular-nums">
                    {faDigits(i + 1)}
                  </span>
                  <span className="flex-1 font-extrabold text-white text-sm md:text-base leading-7">
                    {item.q}
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#f7cf5a] text-[#0a0e2f] flex items-center justify-center transition-transform group-open:rotate-180">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1 border-t border-white/10 mr-[3.25rem]">
                  <p className="text-sm md:text-[15px] text-white/75 leading-8 mt-3">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════ CLOSING CTA ═════════════ */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div
            className="relative rounded-[28px] p-8 md:p-14 text-center overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #0a0e2f 0%, #1a1555 55%, #2a1a4a 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-32 -right-24 w-[380px] h-[380px] rounded-full opacity-30 blur-[120px]"
              style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full opacity-30 blur-[120px]"
              style={{ background: "radial-gradient(circle, #c74bff, transparent 70%)" }}
            />

            <h2 className="relative text-2xl md:text-4xl font-extrabold leading-tight mb-4">
              همه تخم‌مرغ‌ها را در یک سبد نگذار.
            </h2>
            <p className="relative text-white/75 max-w-2xl mx-auto text-sm md:text-base leading-8 mb-8">
              به Investing Hub بپیوند و مسیر تصمیم‌گیری مالی‌ات را از دریافت اطلاعات به اجرای
              استراتژی ارتقا بده.
            </p>
            <div className="relative">
              <a
                href="#pricing"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[#0a0e2f] font-extrabold text-base md:text-lg transition-transform hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(135deg, #f7cf5a 0%, #ffb84a 100%)",
                  boxShadow: "0 18px 40px rgba(247,207,90,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
                }}
              >
                شروع ثبت‌نام
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <FloatingSupportDock
        shareTitle="Investing Hub"
        sharePath="/courses/investing-hub"
        supportText="برای مشاوره رایگان درباره Investing Hub، با تیم نامدار کپیتال در تماس باشید."
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
      style={{
        background: "rgba(247,207,90,0.14)",
        border: "1px solid rgba(247,207,90,0.35)",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
      <span
        className="text-[10.5px] md:text-[11px] tracking-[0.24em] font-extrabold text-[#f7cf5a]"
        dir="ltr"
      >
        {children}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/55 text-[11px]">{label}</span>
      <span className="font-bold text-white truncate">{value}</span>
    </div>
  );
}

function BrandCard({
  brand,
  tagline,
  title,
  subtitle,
  logoSrc,
  logoStyle,
  features,
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
      <div className="relative rounded-[23px] p-6 md:p-7 flex flex-col h-full" style={{ background: bg }}>
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
              className="relative w-[66px] h-[66px] rounded-full overflow-hidden"
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
                style={logoStyle ?? { inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
              />
            </div>
          </div>
          <span
            className="font-['Poppins:Bold',sans-serif] text-[11px] tracking-[2px] px-3 py-1.5 rounded-full"
            style={{ color: accent, background: `${accent}14`, border: `1px solid ${accent}35` }}
            dir="ltr"
          >
            {brand}
          </span>
        </div>

        <p
          className="text-[10.5px] tracking-[2.2px] mb-2 font-bold"
          style={{ color: `${accent}cc` }}
          dir="ltr"
        >
          {tagline}
        </p>

        <h3 className="text-[22px] md:text-[24px] text-white font-extrabold leading-[1.2] mb-1">
          {title}
        </h3>
        <p className="text-sm text-white/70 leading-[1.7] mb-5">{subtitle}</p>

        <ul className="flex flex-col gap-2.5">
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
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a0e2f" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="text-[14px] text-white/90 leading-[1.55]">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
