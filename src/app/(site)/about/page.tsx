import Link from "@/components/SafeLink";
import { getSetting } from "@/lib/db";
import { faDigits } from "@/lib/formatting";

export const metadata = {
  title: "درباره نامدار آکادمی",
  description:
    "نامدار آکادمی؛ مرجع تخصصی آموزش ترید، سرمایه‌گذاری و بازارهای مالی در ایران — بیش از ۱۶ سال تجربه و یک میلیون کاربر فارسی‌زبان.",
};

const defaultMissionPhoto = "/uploads/seminar-speaker-potential.jpg";
const defaultFounderPhoto = "/uploads/IMG_0756.JPG";

type Metric = {
  label: string;
  value: string;
  suffix?: string;
  href?: string;
};
type Pillar = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href?: string;
};
type Step = {
  step: string;
  title: string;
  desc: string;
  href?: string;
  cta?: string;
};
type Milestone = {
  year: string;
  title: string;
  desc: string;
  href?: string;
};
type Credential = { label: string };
type TrustBadge = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const defaultMetrics: Metric[] = [
  { label: "سال تجربه", value: "۱۶", suffix: "+", href: "#timeline" },
  { label: "کاربر فارسی‌زبان", value: "۱M", suffix: "+", href: "/courses" },
  { label: "دانش‌پذیر حرفه‌ای", value: "۱۰K", suffix: "+", href: "/courses" },
  { label: "میانگین رضایت", value: "۴.۹", suffix: "/۵", href: "/articles" },
];

const defaultPillars: Pillar[] = [
  {
    title: "سخت‌گیری در کیفیت",
    desc: "هر سرفصل بر اساس تجربه‌ی معاملاتی واقعی و بک‌تست سیستماتیک تدوین می‌شود؛ نه بازنویسی منابع عمومی.",
    href: "/courses",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="la-ico">
        <path
          d="M12 2l2.39 4.84 5.34.78-3.86 3.77.91 5.32L12 14.77l-4.78 2.51.91-5.32L4.27 7.62l5.34-.78L12 2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "روش علمی و قابل‌تکرار",
    desc: "چارچوب آموزشی مبتنی بر سه ستون: سیستم ذهنی، مهارت فنی، مدیریت ریسک — قابل اندازه‌گیری و سنجش.",
    href: "/articles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="la-ico">
        <path
          d="M4 19V5m0 14h16M8 15V9m4 6V7m4 8v-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "همراهی تخصصی",
    desc: "تیم پشتیبانی، مربیان و منتورهای اختصاصی در کنار هر دانش‌پذیر از روز نخست تا استقلال معاملاتی.",
    href: "/coaching",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="la-ico">
        <path
          d="M16 11a4 4 0 10-8 0M3 20a7 7 0 0114 0M19 8v6m3-3h-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "پاسخ‌گویی و شفافیت",
    desc: "گزارش عملکرد، مسیر ارتقا و دسترسی به استاد — همه چیز مستند و قابل پیگیری در پنل دانش‌پذیر.",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="la-ico">
        <path
          d="M9 12l2 2 4-4M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const defaultSteps: Step[] = [
  {
    step: "۰۱",
    title: "ارزیابی و طراحی مسیر",
    desc: "از سطح فعلی و هدف مالی شما شروع می‌کنیم؛ مسیر آموزشی اختصاصی طراحی می‌شود.",
    href: "/contact",
    cta: "درخواست ارزیابی",
  },
  {
    step: "۰۲",
    title: "آموزش ساختاریافته",
    desc: "دوره‌های ما گام‌به‌گام مفهوم، تمرین، بک‌تست و معامله‌ی زنده را پوشش می‌دهند.",
    href: "/courses",
    cta: "مشاهده دوره‌ها",
  },
  {
    step: "۰۳",
    title: "منتورشیپ و ارزیابی مداوم",
    desc: "با گزارش عملکرد هفتگی، جلسات رفع‌اشکال و ممیزی معامله‌ها، مسیر پایدار می‌شود.",
    href: "/coaching",
    cta: "خدمات منتورشیپ",
  },
];

const defaultTimeline: Milestone[] = [
  {
    year: "۱۳۸۸",
    title: "آغاز مسیر در بازارهای مالی",
    desc: "ورود حرفه‌ای استاد نام‌آور به بازارهای سرمایه‌ای و شروع مطالعه‌ی سیستماتیک.",
    href: "/articles",
  },
  {
    year: "۱۳۹۲",
    title: "اولین دوره‌ی تخصصی",
    desc: "تدریس اختصاصی ترید برای گروه محدود؛ تولد متدولوژی پایه‌ی نامدار.",
    href: "/courses",
  },
  {
    year: "۱۳۹۷",
    title: "راه‌اندازی رسمی آکادمی",
    desc: "تأسیس نامدار آکادمی با تمرکز بر آموزش ساختاریافته‌ی سرمایه‌گذاری.",
    href: "/courses",
  },
  {
    year: "۱۴۰۱",
    title: "عبور از ۱۰٬۰۰۰ دانش‌پذیر",
    desc: "گسترش تیم منتورها و راه‌اندازی پلتفرم ارزیابی عملکرد معامله‌گران.",
    href: "/coaching",
  },
  {
    year: "۱۴۰۵",
    title: "پلتفرم جدید و محصولات بین‌المللی",
    desc: "عرضه نسخه‌ی تازه‌ی نامدار و دوره‌های اختصاصی بازار جهانی.",
    href: "/courses",
  },
];

const defaultTrust: TrustBadge[] = [
  {
    label: "درگاه امن بانک سامان",
    href: "/faq",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path
          d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    label: "نماد الکترونیکی",
    href: "/contact",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path
          d="M4 7h16M4 12h16M4 17h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "پشتیبانی ۷ روز هفته",
    href: "/contact",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path
          d="M12 8v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const defaultCredentials: Credential[] = [
  { label: "۱۶+ سال معامله‌گری حرفه‌ای" },
  { label: "مدرس متدولوژی‌های MON و LQ1" },
  { label: "مربی بیش از ۱۰٬۰۰۰ دانش‌پذیر" },
  { label: "سخنران رویدادهای تخصصی فارکس و کریپتو" },
];

function resolveList<T>(key: string, fallback: T[]): T[] {
  const v = getSetting<T[]>(key);
  return Array.isArray(v) && v.length > 0 ? v : fallback;
}

const glassCss = `
  .la-scope {
    --la-ink: #0e1a3a;
    --la-ink-soft: #3c4664;
    --la-ink-dim: #5c6686;
    --la-accent: #1b3c8a;
    --la-accent-2: #136cb5;
    --la-accent-3: #49bbbd;
    --la-gold: #e9b970;
    position: relative;
    color: var(--la-ink);
    overflow: hidden;
    isolation: isolate;
    background:
      radial-gradient(1100px 700px at 80% -10%, #eaf3ff 0%, transparent 60%),
      radial-gradient(900px 700px at 10% 110%, #dbeaf7 0%, transparent 60%),
      radial-gradient(700px 500px at 85% 85%, #d7efef 0%, transparent 55%),
      radial-gradient(900px 600px at 50% 40%, #f3ecdb 0%, transparent 60%),
      #eef4fb;
  }
  .la-scope::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image:
      radial-gradient(rgba(14,26,58,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
  }
  .la-scope > * { position: relative; z-index: 1; }

  /* Chromatic halo behind glass surfaces */
  .la-ca { position: relative; isolation: isolate; }
  .la-ca::before,
  .la-ca::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    pointer-events: none;
    z-index: -1;
    filter: blur(10px);
    opacity: 0.45;
    mix-blend-mode: screen;
  }
  .la-ca::before {
    box-shadow:
      0 0 0 2px rgba(255,60,120,0.3),
      0 0 0 6px rgba(255,170,60,0.22);
    transform: translate(2px, 1px);
  }
  .la-ca::after {
    box-shadow:
      0 0 0 2px rgba(60,180,255,0.45),
      0 0 0 6px rgba(140,80,255,0.22);
    transform: translate(-2px, -1px);
  }

  .la-glass {
    position: relative;
    background:
      linear-gradient(
        180deg,
        rgba(255,255,255,0.62) 0%,
        rgba(255,255,255,0.22) 35%,
        rgba(255,255,255,0.14) 65%,
        rgba(255,255,255,0.52) 100%
      );
    backdrop-filter: blur(22px) saturate(1.7);
    -webkit-backdrop-filter: blur(22px) saturate(1.7);
    box-shadow:
      0 18px 38px rgba(15,31,74,0.14),
      0 4px 10px rgba(15,31,74,0.08),
      0 0 0 1px rgba(255,255,255,0.55),
      inset 0 1.5px 0 rgba(255,255,255,0.95),
      inset 0 -1.5px 0 rgba(255,255,255,0.7),
      inset 0 12px 24px rgba(255,255,255,0.22),
      inset 0 -10px 20px rgba(255,255,255,0.16);
    color: var(--la-ink);
  }

  .la-glass-dark {
    position: relative;
    color: #fff;
    background:
      linear-gradient(
        180deg,
        rgba(14,26,58,0.72) 0%,
        rgba(27,60,138,0.55) 50%,
        rgba(19,108,181,0.55) 100%
      );
    backdrop-filter: blur(22px) saturate(1.5);
    -webkit-backdrop-filter: blur(22px) saturate(1.5);
    box-shadow:
      0 25px 50px -10px rgba(15,31,74,0.45),
      0 0 0 1px rgba(255,255,255,0.18),
      inset 0 1.5px 0 rgba(255,255,255,0.35),
      inset 0 -1.5px 0 rgba(255,255,255,0.12),
      inset 0 14px 24px rgba(255,255,255,0.08);
  }

  .la-pill {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 14px 34px;
    font-weight: 700;
    font-size: 16px;
    color: #fff;
    overflow: hidden;
    letter-spacing: 0.01em;
    cursor: pointer;
    user-select: none;
    transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
    will-change: transform;
  }
  .la-pill:hover {
    transform: translateY(-2px);
    filter: brightness(1.04);
  }
  .la-pill:active {
    transform: translateY(1px) scale(0.985);
    filter: brightness(0.95);
  }
  .la-pill:focus-visible {
    outline: 2px solid #49bbbd;
    outline-offset: 3px;
  }
  .la-pill::before {
    content: "";
    position: absolute;
    left: 14px;
    right: 14px;
    top: 4px;
    height: 40%;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0));
    filter: blur(0.5px);
    pointer-events: none;
  }
  .la-pill::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 999px;
    box-shadow:
      inset 0 -10px 18px rgba(0,0,0,0.22),
      inset 0 2px 2px rgba(255,255,255,0.55),
      inset 0 0 0 1px rgba(255,255,255,0.30);
    pointer-events: none;
  }
  .la-pill > * { position: relative; z-index: 1; }
  .la-pill.blue {
    background:
      radial-gradient(120% 90% at 50% 0%, #6fa9ff 0%, transparent 55%),
      linear-gradient(180deg, #2c70d8 0%, #154eb0 55%, #0a347d 100%);
    box-shadow:
      0 22px 50px -10px rgba(20,70,180,0.55),
      0 8px 14px rgba(20,70,180,0.3);
  }
  .la-pill.ghost {
    background:
      linear-gradient(
        180deg,
        rgba(255,255,255,0.55) 0%,
        rgba(255,255,255,0.2) 50%,
        rgba(255,255,255,0.45) 100%
      );
    color: var(--la-ink);
    box-shadow:
      0 18px 38px rgba(15,31,74,0.14),
      0 0 0 1px rgba(255,255,255,0.6),
      inset 0 1.5px 0 rgba(255,255,255,0.95),
      inset 0 -1.5px 0 rgba(255,255,255,0.7);
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
  }
  .la-pill.ghost::after {
    box-shadow:
      inset 0 -10px 18px rgba(0,0,0,0.06),
      inset 0 2px 2px rgba(255,255,255,0.8),
      inset 0 0 0 1px rgba(255,255,255,0.55);
  }

  .la-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    color: var(--la-accent);
    background: linear-gradient(
      180deg,
      rgba(255,255,255,0.7) 0%,
      rgba(255,255,255,0.35) 100%
    );
    backdrop-filter: blur(16px) saturate(1.5);
    -webkit-backdrop-filter: blur(16px) saturate(1.5);
    box-shadow:
      0 6px 14px rgba(15,31,74,0.08),
      0 0 0 1px rgba(255,255,255,0.65),
      inset 0 1px 0 rgba(255,255,255,0.9);
  }
  .la-chip .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--la-accent-3);
    box-shadow: 0 0 0 3px rgba(73,187,189,0.25);
  }

  .la-ico { width: 24px; height: 24px; }

  .la-eyebrow {
    display: inline-block;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
    color: var(--la-accent-2);
  }

  .la-metric .v {
    font-size: 36px;
    font-weight: 800;
    color: var(--la-accent);
    letter-spacing: -0.01em;
    line-height: 1.1;
  }
  .la-metric .s {
    font-size: 20px;
    color: var(--la-accent-2);
    font-weight: 700;
    margin-right: 2px;
  }

  .la-step-num {
    font-size: 44px;
    font-weight: 800;
    background: linear-gradient(180deg, #1b3c8a 0%, #49bbbd 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: -0.02em;
  }

  .la-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(15,31,74,0.15), transparent);
  }

  .la-timeline-rail {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 50%;
    transform: translateX(50%);
    width: 2px;
    background: linear-gradient(180deg, #49bbbd, #136cb5, #0f1f4a);
    border-radius: 2px;
  }
  .la-timeline-node {
    position: absolute;
    right: 50%;
    top: 24px;
    transform: translateX(50%);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(180deg, #ffffff, #e7eef9);
    box-shadow:
      0 0 0 1px rgba(15,31,74,0.2),
      0 0 0 5px rgba(231,238,249,0.9),
      0 4px 10px rgba(15,31,74,0.18);
  }

  .la-portrait-wrap {
    position: relative;
    border-radius: 32px;
    padding: 10px;
    background:
      linear-gradient(
        180deg,
        rgba(255,255,255,0.65) 0%,
        rgba(255,255,255,0.22) 35%,
        rgba(255,255,255,0.14) 65%,
        rgba(255,255,255,0.52) 100%
      );
    backdrop-filter: blur(22px) saturate(1.7);
    -webkit-backdrop-filter: blur(22px) saturate(1.7);
    box-shadow:
      0 30px 60px -20px rgba(15,31,74,0.35),
      0 0 0 1px rgba(255,255,255,0.55),
      inset 0 1.5px 0 rgba(255,255,255,0.95);
  }

  .la-blob {
    position: absolute;
    filter: blur(60px);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
`;

export default function AboutPage() {
  const heroEyebrow =
    getSetting<string>("about.hero.eyebrow") || "درباره نامدار آکادمی";
  const heroTitle =
    getSetting<string>("about.hero.title") ||
    "هم‌قدم معامله‌گرانی که سود را با دانش می‌سازند";
  const heroLead =
    getSetting<string>("about.hero.lead") ||
    "نامدار آکادمی یک مرجع تخصصی آموزش ترید و سرمایه‌گذاری است؛ بیش از ۱۶ سال کنار یک میلیون کاربر فارسی‌زبان، مسیر حرفه‌ای شدن در بازارهای مالی را مهندسی کرده‌ایم.";

  const missionTitle =
    getSetting<string>("about.mission.title") || "مأموریت ما";
  const missionBody =
    getSetting<string>("about.mission.body") ||
    "در نامدار آکادمی باور داریم یادگیری درست، سود پایدار می‌آورد. ما به دانش‌پذیران کمک می‌کنیم با یک سیستم ذهنی حرفه‌ای، مهارت فنی دقیق و مدیریت ریسک سخت‌گیرانه، به استقلال مالی برسند — نه با شانس، بلکه با دانش.";
  const visionBody =
    getSetting<string>("about.vision.body") ||
    "چشم‌انداز ما ساختن بزرگ‌ترین جامعه‌ی معامله‌گران فارسی‌زبان است؛ جامعه‌ای که بر پایه‌ی داده، اخلاق حرفه‌ای و نظم معاملاتی تصمیم می‌گیرد.";

  const founderName =
    getSetting<string>("about.founder.name") || "استاد امیرحسین نام‌آور";
  const founderRole =
    getSetting<string>("about.founder.role") || "بنیان‌گذار و مدیر آموزشی";
  const founderBio =
    getSetting<string>("about.founder.bio") ||
    "امیرحسین نام‌آور با بیش از ۱۶ سال حضور مستمر در بازارهای مالی، متدولوژی اختصاصی نامدار را طراحی کرده است. رویکرد او ترکیب تحلیل ساختاری بازار با مدیریت سرمایه‌ی سیستماتیک و روان‌شناسی معامله‌گری است.";

  const missionPhoto =
    getSetting<string>("about.mission.photo") || defaultMissionPhoto;
  const founderPhoto =
    getSetting<string>("about.founder.photo") || defaultFounderPhoto;

  const metrics = resolveList<Metric>("about.metrics", defaultMetrics);
  const pillars = resolveList<Pillar>("about.pillars", defaultPillars);
  const steps = resolveList<Step>("about.methodology", defaultSteps);
  const timeline = resolveList<Milestone>("about.timeline", defaultTimeline);
  const credentials = resolveList<Credential>(
    "about.founder.credentials",
    defaultCredentials
  );

  return (
    <div className="la-scope">
      <style>{glassCss}</style>

      {/* Ambient blobs */}
      <div
        className="la-blob"
        style={{
          top: "-120px",
          right: "-80px",
          width: "420px",
          height: "420px",
          background:
            "radial-gradient(circle, rgba(73,187,189,0.45), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="la-blob"
        style={{
          top: "300px",
          left: "-120px",
          width: "520px",
          height: "520px",
          background:
            "radial-gradient(circle, rgba(19,108,181,0.35), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="la-blob"
        style={{
          top: "900px",
          right: "10%",
          width: "380px",
          height: "380px",
          background:
            "radial-gradient(circle, rgba(233,185,112,0.35), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="la-blob"
        style={{
          top: "1600px",
          left: "20%",
          width: "440px",
          height: "440px",
          background:
            "radial-gradient(circle, rgba(27,60,138,0.28), transparent 60%)",
        }}
        aria-hidden
      />

      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <nav className="text-xs mb-8" style={{ color: "#5c6686" }}>
            <Link href="/" className="hover:underline">
              خانه
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: "#0e1a3a" }}>درباره ما</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7">
              <span className="la-chip la-ca">
                <span className="dot" />
                {heroEyebrow}
              </span>
              <h1
                className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.3]"
                style={{ color: "#0e1a3a" }}
              >
                {heroTitle}
              </h1>
              <p
                className="mt-6 text-base md:text-lg max-w-2xl leading-[2.1]"
                style={{ color: "#3c4664" }}
              >
                {heroLead}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/courses" className="la-pill blue la-ca">
                  مشاهده دوره‌ها
                </Link>
                <Link href="/contact" className="la-pill ghost la-ca">
                  گفت‌وگو با تیم ما
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="la-glass la-ca rounded-[32px] p-6 md:p-7">
                <div
                  className="text-xs mb-4"
                  style={{ color: "#5c6686" }}
                >
                  در یک نگاه
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  {metrics.map((m) => (
                    <Link
                      key={m.label}
                      href={m.href || "/courses"}
                      className="la-metric group rounded-2xl p-3 -m-3 transition hover:bg-white/40"
                    >
                      <dt
                        className="text-xs mb-1"
                        style={{ color: "#5c6686" }}
                      >
                        {m.label}
                      </dt>
                      <dd className="v">
                        <bdi dir="ltr">
                          {m.value}
                          {m.suffix && <span className="s">{m.suffix}</span>}
                        </bdi>
                      </dd>
                      <span
                        className="mt-1 inline-flex items-center gap-1 text-[11px] opacity-0 group-hover:opacity-100 transition"
                        style={{ color: "#136cb5" }}
                      >
                        جزئیات
                        <span>←</span>
                      </span>
                    </Link>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Mission & Vision */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="md:col-span-7 order-2 md:order-1">
            <div className="la-eyebrow">مأموریت و چشم‌انداز</div>
            <h2
              className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight"
              style={{ color: "#0e1a3a" }}
            >
              {missionTitle}
            </h2>
            <p
              className="mt-5 leading-[2.1] text-base md:text-lg"
              style={{ color: "#3c4664" }}
            >
              {missionBody}
            </p>
            <div className="mt-7 la-glass la-ca rounded-2xl p-6">
              <div className="la-eyebrow">چشم‌انداز ۱۴۱۰</div>
              <p
                className="mt-2 leading-[2] text-base"
                style={{ color: "#0e1a3a" }}
              >
                {visionBody}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/courses" className="la-pill blue la-ca">
                شروع یادگیری
              </Link>
              <Link href="/faq" className="la-pill ghost la-ca">
                سؤالات متداول
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 order-1 md:order-2">
            <div className="la-portrait-wrap la-ca">
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-[#dbe7ff]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={missionPhoto}
                  alt={founderName}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center 20%" }}
                />
                <div
                  className="absolute inset-x-3 bottom-3 rounded-2xl p-4 la-glass"
                  style={{ backdropFilter: "blur(14px) saturate(1.4)" }}
                >
                  <div className="text-xs" style={{ color: "#3c4664" }}>
                    {founderRole}
                  </div>
                  <div
                    className="font-bold text-lg"
                    style={{ color: "#0e1a3a" }}
                  >
                    {founderName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-12">
            <div className="la-eyebrow">اصول ما</div>
            <h2
              className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight"
              style={{ color: "#0e1a3a" }}
            >
              چهار ستونی که روی آن ایستاده‌ایم
            </h2>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: "#5c6686" }}
            >
              هر محصول، دوره و تصمیم سازمانی نامدار بر چهار اصل زیر سنجیده
              می‌شود. اگر از یکی عبور کند، وارد بازار نمی‌شود.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <Link
                key={p.title}
                href={p.href || "/courses"}
                className="la-glass la-ca rounded-[28px] p-6 relative group transition hover:-translate-y-1"
              >
                <div
                  className="absolute top-4 left-5 font-extrabold text-sm"
                  style={{ color: "rgba(15,31,74,0.18)" }}
                >
                  {faDigits(String(i + 1).padStart(2, "0"))}
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{
                    background:
                      "radial-gradient(120% 90% at 50% 0%, #6fa9ff 0%, transparent 55%), linear-gradient(180deg, #2c70d8 0%, #154eb0 55%, #0a347d 100%)",
                    boxShadow:
                      "0 12px 24px -8px rgba(20,70,180,0.55), inset 0 1.5px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  {p.icon}
                </div>
                <h3
                  className="mt-5 font-extrabold text-lg"
                  style={{ color: "#0e1a3a" }}
                >
                  {p.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-[2]"
                  style={{ color: "#3c4664" }}
                >
                  {p.desc}
                </p>
                <div
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold transition group-hover:gap-2"
                  style={{ color: "#136cb5" }}
                >
                  اطلاعات بیشتر
                  <span>←</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Leadership / Founder */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="la-glass-dark la-ca rounded-[36px] overflow-hidden p-8 md:p-12 grid md:grid-cols-12 gap-10 items-center relative">
            <div
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(73,187,189,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(19,108,181,0.5) 0%, transparent 40%)",
              }}
              aria-hidden
            />
            <div className="md:col-span-5 relative">
              <div className="la-portrait-wrap la-ca">
                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={founderPhoto}
                    alt={founderName}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center top" }}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-7 relative text-white">
              <div
                className="la-eyebrow"
                style={{ color: "#7ad4d6" }}
              >
                رهبری
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">
                {founderName}
              </h2>
              <div className="text-white/70 mt-1">{founderRole}</div>
              <p className="mt-5 text-white/85 leading-[2.1] text-base md:text-lg max-w-2xl">
                {founderBio}
              </p>

              <ul className="mt-7 grid sm:grid-cols-2 gap-3 max-w-2xl">
                {credentials.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-start gap-3 rounded-2xl p-4"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 shrink-0 mt-0.5"
                      style={{ color: "#7ad4d6" }}
                      fill="none"
                    >
                      <path
                        d="M5 12l5 5L20 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-white/90 leading-relaxed">
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/courses" className="la-pill blue la-ca">
                  دوره‌های استاد نام‌آور
                </Link>
                <Link href="/contact" className="la-pill ghost la-ca">
                  ارتباط مستقیم
                </Link>
                <Link href="/coaching" className="la-pill ghost la-ca">
                  درخواست منتورشیپ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="py-16 md:py-24 px-4 md:px-8 scroll-mt-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <div className="la-eyebrow">مسیر ما</div>
            <h2
              className="mt-3 text-3xl md:text-4xl font-extrabold"
              style={{ color: "#0e1a3a" }}
            >
              از یک کلاس خصوصی تا یک آکادمی بین‌المللی
            </h2>
          </div>

          <div className="relative">
            <div className="la-timeline-rail" />
            <ol className="space-y-10">
              {timeline.map((t, i) => {
                const rightSide = i % 2 === 0;
                return (
                  <li
                    key={t.year}
                    className="relative grid md:grid-cols-2 md:gap-10"
                  >
                    <div
                      className={
                        rightSide
                          ? "md:col-start-1 md:pl-10"
                          : "md:col-start-2 md:pr-10"
                      }
                    >
                      <Link
                        href={t.href || "/articles"}
                        className="la-glass la-ca rounded-[24px] p-6 block group transition hover:-translate-y-1"
                      >
                        <div
                          className="inline-flex items-center gap-2 font-bold"
                          style={{ color: "#136cb5" }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: "#49bbbd" }}
                          />
                          {t.year}
                        </div>
                        <h3
                          className="mt-2 font-extrabold text-lg"
                          style={{ color: "#0e1a3a" }}
                        >
                          {t.title}
                        </h3>
                        <p
                          className="mt-1 text-sm leading-[2]"
                          style={{ color: "#3c4664" }}
                        >
                          {t.desc}
                        </p>
                        <div
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold opacity-70 group-hover:opacity-100 group-hover:gap-2 transition"
                          style={{ color: "#136cb5" }}
                        >
                          مطالعه‌ی بیشتر
                          <span>←</span>
                        </div>
                      </Link>
                    </div>
                    <span className="hidden md:block la-timeline-node" />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="la-glass-dark la-ca rounded-[36px] p-10 md:p-16 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 20%, rgba(73,187,189,0.6) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(233,185,112,0.35) 0%, transparent 45%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
                آماده‌اید قدم بعدی مسیر مالی‌تان را با نامدار بردارید؟
              </h2>
              <p className="mt-5 text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-[2]">
                تیم ما ارزیابی رایگان مسیر معاملاتی شما را انجام می‌دهد و
                مناسب‌ترین دوره و خدمت را پیشنهاد می‌کند.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/courses" className="la-pill blue la-ca">
                  مشاهده دوره‌ها
                </Link>
                <Link href="/contact" className="la-pill ghost la-ca">
                  درخواست مشاوره
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
