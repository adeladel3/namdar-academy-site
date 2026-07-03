import CoachingRegisterForm from "./CoachingRegisterForm";
import CoachingBookingFormGlass from "./CoachingBookingFormGlass";
import CoachingHero from "./CoachingHero";
import BackToTop from "@/components/BackToTop";
import FloatingSupportDock from "@/components/FloatingSupportDock";
import ExpandableProse from "@/components/ExpandableProse";
import { faDigits } from "@/lib/formatting";
import { getCourse, getSetting } from "@/lib/db";
import SyllabusIcon from "@/components/SyllabusIcon";
import type { SyllabusSection } from "@/lib/db";

export const metadata = {
  title: "کوچینگ MON — نامدار آکادمی",
  description:
    "برنامه ۱۸ هفته‌ای کوچینگ حرفه‌ای معامله‌گری با سبک MON، مستقیم زیر نظر استاد امیرحسین نام‌آور.",
};

export const dynamic = "force-dynamic";

const KEY_TOPICS: { label: string; icon: React.ReactNode }[] = [
  {
    label: "روان‌شناسی",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 3a3.5 3.5 0 00-3.45 4.07A3.5 3.5 0 005 14a3.5 3.5 0 003 3.46V20a2 2 0 002 2h0V3.5A.5.5 0 009.5 3z" />
        <path d="M14.5 3a3.5 3.5 0 013.45 4.07A3.5 3.5 0 0119 14a3.5 3.5 0 01-3 3.46V20a2 2 0 01-2 2h0V3.5a.5.5 0 01.5-.5z" />
      </svg>
    ),
  },
  {
    label: "مدیریت سرمایه",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <circle cx="12" cy="12.5" r="2.4" />
        <path d="M6 9.5h.01M18 15.5h.01" />
      </svg>
    ),
  },
  {
    label: "تحلیل تکنیکال",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-6 4 3 4-7 5 4" />
        <polyline points="3 21 21 21" />
      </svg>
    ),
  },
  {
    label: "Master Class",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10L12 4 2 10l10 6 10-6z" />
        <path d="M6 12v5a6 6 0 0012 0v-5" />
      </svg>
    ),
  },
  {
    label: "فاندامنتال",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
      </svg>
    ),
  },
  {
    label: "بستر سرمایه",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5L12 16l-5.5 3 1-6.5L3 8.8 9 8z" />
      </svg>
    ),
  },
];

const METHOD_FAQ: { q: string; a: string }[] = [
  {
    q: "تفاوت سبک MON با سایر سبک‌ها چیست؟",
    a: "MON یک سبک پیشرفته بر پایهٔ نقدینگی و ساختار بازار است که به دنبال شناسایی سطوح نقدینگی و نواحی مهم تأثیرگذار بر حرکات قیمتی است. فقط در نواحی کلیدی چارت معامله می‌شود و علاوه بر قیمت، به زمان نیز اهمیت ویژه‌ای داده می‌شود.",
  },
  {
    q: "ریسک به ریوارد در سبک MON چقدر است؟",
    a: "در این سبک نسبت ریوارد به ریسک معمولاً بالاتر از ۴ است، اما میانگین دیتای به‌دست‌آمده از معاملات واقعی فارغ‌التحصیلان بین ۵ تا ۷ قرار می‌گیرد.",
  },
  {
    q: "وین‌ریت سبک MON چقدر است؟",
    a: "وین‌ریت سبک به‌خودی‌خود پایین است، اما در دورهٔ MON با تجربیات و نکات تدریس‌شده توسط مهندس نام‌آور تا حد معقولی افزایش می‌یابد. اعداد دقیق قابل اعلام نیستند، ولی نکات مهمی دربارهٔ نحوهٔ معامله و مدیریت سرمایه در جلسات Recap چارت تدریس می‌شود.",
  },
  {
    q: "سبک MON چقدر سود می‌دهد؟",
    a: "پاسخ به این سوال مستقیماً با مهارت اجرایی هر فرد ارتباط دارد و فردبه‌فرد متفاوت است. در یک سال اخیر افرادی بوده‌اند که توانسته‌اند اکانت‌هایشان را به سود ماهانهٔ ۱۰٪ برسانند یا چالش پراپ‌فرم‌ها را پاس کنند.",
  },
  {
    q: "سبک MON در چه تایم‌فریم‌هایی قابل اجراست؟",
    a: "این سبک قابل اجرا روی تمامی تایم‌فریم‌هاست و به اصطلاح Universal محسوب می‌شود.",
  },
  {
    q: "ورودها و خروج‌ها از معامله در MON چه نواحی است؟",
    a: "ورودها و خروج‌ها بر اساس سطوح نقدینگی در کنار مشاهدهٔ تأییدیه‌های ساختاری مشخص می‌شوند.",
  },
  {
    q: "سبک MON در روز یا هفته چندتا پوزیشن می‌گیرد؟",
    a: "این موضوع وابسته به استراتژی شخصی فرد و نوع تریدری است که خود انتخاب می‌کند (اسکلپر، سوئینگ‌تریدر، پوزیشن‌تریدر). برای اسکلپرها می‌توان حداقل ۱۴ تا ۱۸ معامله در هفته در نظر گرفت.",
  },
  {
    q: "سبک MON در چه بازارهایی قابل معامله است؟",
    a: "در تمامی بازارهایی که نقدینگی مناسبی دارند: فارکس، شاخص‌ها، کریپتو، طلا و کامودیتی‌ها.",
  },
  {
    q: "چه ستاپ‌ها و استراتژی‌هایی در MON تدریس می‌شود؟",
    a: "در این دوره ده‌ها ستاپ آموزش داده می‌شود تا هر فرد بتواند با استفاده از آن‌ها استراتژی شخصی خود را ساخته و مکتوب نماید. در جلسات Recap نیز چند استراتژی توسط مهندس نام‌آور به‌صورت عملیاتی روی چارت تدریس می‌شود.",
  },
  {
    q: "سبک MON برای افرادی که از صفر می‌خواهند شروع کنند مناسب است؟",
    a: "درون این دوره بخشی به نام «پیش‌نیاز» تعبیه شده تا افرادی که دانش کمی از بازارهای مالی دارند بتوانند بهره ببرند. اما این سبک پیشرفته است و توصیه می‌شود افراد آمادگی‌های لازم را پیش از آن داشته باشند.",
  },
  {
    q: "حد ضرر (استاپ) در سبک MON معمولاً چقدر است؟",
    a: "می‌تواند استاپ‌هایی از حداقل ۲ پیپ برای اسکلپرها، و بیشتر برای دیگر معامله‌گران در تایم‌فریم‌های بالاتر داشته باشد.",
  },
  {
    q: "آیا منتورینگ بعد از پایان ۱۸ هفته ادامه دارد؟",
    a: "بله. پشتیبانی و منتورینگ آموزشی پس از پایان دوره به‌صورت دائمی و اختصاصی فعال است.",
  },
];

const KEY_ACHIEVEMENTS: {
  level: string;
  badge: string;
  title: string;
  desc: string;
  pct: number;
  icon: React.ReactNode;
}[] = [
  {
    level: "LVL · MAX",
    badge: "PRECISION",
    title: "۲ پیپ استاپ",
    desc: "میانگین حد ضرر دانش‌پذیران تنها ۲ پیپ — دقتی در سطح تیم‌های حرفه‌ای.",
    pct: 96,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="#f7cf5a" />
      </svg>
    ),
  },
  {
    level: "LVL · LEGEND",
    badge: "FUNDED",
    title: "+$۱۰M جذب سرمایه",
    desc: "بیش از ۱۰ میلیون دلار سرمایه جذب‌شده توسط فارغ‌التحصیلان کوچینگ.",
    pct: 88,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
        <polyline points="14 3 14 8 19 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    level: "LVL · ELITE",
    badge: "STREAK",
    title: "+۲۰۰ ریوارد در ماه",
    desc: "ستاپ‌های کدشده ۱.۲.۳.۴ همراه با پلن معاملاتی مکتوب — ماهانه بیش از ۲۰۰ ریوارد.",
    pct: 78,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
];

function ResultImageCard({
  imageUrl,
  caption,
  index,
  accent = "gold",
}: {
  imageUrl: string;
  caption: string;
  index: number;
  accent?: "gold" | "teal";
}) {
  const accentColor = accent === "gold" ? "#f7cf5a" : "#49bbbd";
  const accentDark = accent === "gold" ? "#d4a62a" : "#2f9a9c";
  return (
    <div
      className="relative aspect-[9/16] rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 40%), rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.28)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.30), 0 22px 50px -16px rgba(0,0,0,0.55), 0 0 26px -10px ${accentColor}40`,
      }}
    >
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b3c8a] via-[#136cb5] to-[#0e1a3d]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />

      <span
        aria-hidden
        className="absolute top-3 left-5 w-14 h-2.5 rounded-full bg-white/40 blur-sm pointer-events-none"
      />

      <div
        className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur text-[10px] font-extrabold"
        style={{
          border: `1px solid ${accentColor}70`,
          color: accentColor,
        }}
      >
        <span
          className="w-1 h-1 rounded-full"
          style={{ background: accentColor }}
        />
        {faDigits(index)}/{faDigits(4)}
      </div>

      {!imageUrl && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-4 text-white/80">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-2 opacity-80"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <div className="text-xs font-bold">محل بارگذاری عکس</div>
        </div>
      )}

      {/* Caption pill at bottom */}
      <div className="absolute inset-x-3 bottom-3">
        <div
          className="rounded-2xl px-3 py-2.5 text-center"
          style={{
            background:
              "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 40%), rgba(0,0,0,0.50)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${accentColor}55`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 0 18px -8px ${accentColor}80`,
          }}
        >
          <div
            className="font-extrabold text-base md:text-lg leading-tight tabular-nums"
            style={{
              color: accentColor,
              textShadow: `0 0 12px ${accentDark}88`,
            }}
          >
            {caption}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoTestimonialCard({
  posterUrl,
  videoUrl,
  name,
  role,
  index,
}: {
  posterUrl: string;
  videoUrl: string;
  name: string;
  role: string;
  index: number;
}) {
  return (
    <div
      className="relative aspect-[9/16] rounded-3xl overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 40%), rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.28)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.30), 0 22px 50px -16px rgba(0,0,0,0.55), 0 0 24px -10px rgba(247,207,90,0.25)",
      }}
    >
      {posterUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${posterUrl}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b3c8a] via-[#136cb5] to-[#49bbbd]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />

      <span
        aria-hidden
        className="absolute top-3 left-5 w-14 h-2.5 rounded-full bg-white/40 blur-sm pointer-events-none"
      />

      <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 border border-[#f7cf5a]/45 backdrop-blur text-[10px] font-extrabold text-[#f7cf5a]">
        <span className="w-1 h-1 rounded-full bg-[#f7cf5a]" />
        {faDigits(index)}/{faDigits(4)}
      </div>

      {/* Play button center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="absolute w-20 h-20 rounded-full bg-[#f7cf5a]/15 animate-ping" />
        <span className="relative w-16 h-16 rounded-full bg-[#f7cf5a]/30 backdrop-blur-md border border-[#f7cf5a]/65 flex items-center justify-center group-hover:scale-110 transition shadow-[0_0_36px_-4px_#f7cf5a]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#f7cf5a"
            className="drop-shadow-[0_0_8px_#f7cf5a] mr-0.5"
          >
            <polygon points="8 5 19 12 8 19 8 5" />
          </svg>
        </span>
      </div>

      {/* Placeholder hint when no video */}
      {!videoUrl && !posterUrl && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 text-center px-4 text-white/70">
          <div className="text-xs font-bold">محل بارگذاری ویدیو</div>
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute inset-x-3 bottom-3">
        <div
          className="rounded-2xl p-3"
          style={{
            background:
              "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.04) 40%), rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
          }}
        >
          <div className="font-extrabold text-white text-sm leading-tight">
            {name}
          </div>
          <div className="text-[11px] text-white/75 mt-0.5">{role}</div>
        </div>
      </div>
    </div>
  );
}

function BenefitGlassCard({
  title,
  body,
  icon,
  align = "right",
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  align?: "right" | "left";
}) {
  return (
    <div
      className="relative rounded-2xl p-5 group hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.04) 40%), rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.30), 0 14px 34px -12px rgba(0,0,0,0.45), 0 0 22px -10px rgba(247,207,90,0.25)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-2 left-4 w-12 h-2.5 rounded-full bg-white/35 blur-sm pointer-events-none"
      />
      <span
        aria-hidden
        className={
          "absolute -bottom-8 w-24 h-24 rounded-full bg-[#f7cf5a]/15 blur-2xl pointer-events-none " +
          (align === "right" ? "-left-8" : "-right-8")
        }
      />

      <div
        className={
          "relative flex items-start gap-3 " +
          (align === "right" ? "" : "flex-row-reverse text-left")
        }
      >
        <div className="shrink-0 w-11 h-11 rounded-xl bg-[#f7cf5a]/25 border border-[#f7cf5a]/45 text-[#f7cf5a] flex items-center justify-center shadow-[0_0_18px_-6px_rgba(247,207,90,0.6)] group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-white text-sm md:text-[15px] mb-1.5 leading-tight">
            {title}
          </h3>
          <p className="text-[11px] md:text-xs text-white/75 leading-6">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

const BENEFITS_RIGHT: {
  title: string;
  body: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "سیستم تحلیلی منسجم MON",
    body: "متدولوژی اختصاصی نامدار، حاصل سال‌ها تجربه و بومی‌سازی مفاهیم پیشرفته در یک چهارچوب یکپارچه‌ی تصمیم‌گیری.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    title: "بومی‌سازی برای بازار ایران",
    body: "آموزش‌ها بر اساس تجربه معامله‌گران ایرانی و واقعیت دسترسی به بروکرها.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "روان‌شناسی + تصمیم‌گیری",
    body: "توجه همزمان به تحلیل تکنیکال، روان‌شناسی و فرایند تصمیم‌گیری حرفه‌ای.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 3a3.5 3.5 0 00-3.45 4.07A3.5 3.5 0 005 14a3.5 3.5 0 003 3.46V20a2 2 0 002 2h0V3.5A.5.5 0 009.5 3z" />
        <path d="M14.5 3a3.5 3.5 0 013.45 4.07A3.5 3.5 0 0119 14a3.5 3.5 0 01-3 3.46V20a2 2 0 01-2 2h0V3.5a.5.5 0 01.5-.5z" />
      </svg>
    ),
  },
];

const BOOKING_SPECS: {
  title: string;
  body?: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "فرمت برگزاری",
    body: "ویدیوهای ضبط‌شدهٔ اختصاصی + برخی کلاس‌های پایه به‌صورت آنلاین",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="14" rx="2" />
        <line x1="8" y1="22" x2="16" y2="22" />
        <line x1="12" y1="18" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    title: "بستر مشاهده ویدیو",
    body: "پلیر اختصاصی نامدار آکادمی + اپلیکیشن موبایل",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    title: "مدت و حجم محتوا",
    body: "۱۸ هفته دوره با +۲۰ ساعت ویدیو آموزشی + جلسات تعاملی",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </svg>
    ),
  },
  {
    title: "پشتیبانی و منتورینگ",
    body: "پشتیبانی و منتورینگ آموزشی به‌صورت دائمی",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: "کامیونیتی Discord",
    body: "دسترسی به منتورینگ، تمرین، بک‌تست و کامیونیتی از داخل سرور دیسکورد",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="3" />
        <circle cx="17" cy="11" r="2.5" />
        <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
        <path d="M14 20c0-2 1.5-3.5 3.5-3.5S21 18 21 20" />
      </svg>
    ),
  },
  {
    title: "بستر جذب سرمایه",
    body: "امکان معرفی به صندوق نامدار آکادمی پس از پایان دوره",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="6" />
        <polyline points="9 12 11 14 15 10" />
        <path d="M8 14l-2 8 6-3 6 3-2-8" />
      </svg>
    ),
  },
];

const BENEFITS_LEFT: {
  title: string;
  body: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "نقدینگی و ساختار بازار",
    body: "آموزش مفاهیم نقدینگی و ساختار بازار با رویکرد موسسه‌محور و Order Flow.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-6 4 3 4-7 5 4" />
        <polyline points="3 21 21 21" />
      </svg>
    ),
  },
  {
    title: "ساده‌سازی مفاهیم پیچیده",
    body: "مفاهیم تحلیلی سنگین به زبان روان، بدون افت دقت علمی و عمق آموزشی.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 014 12.7c-.7.5-1 1.3-1 2.1V18H9v-1.2c0-.8-.3-1.6-1-2.1A7 7 0 0112 2z" />
      </svg>
    ),
  },
  {
    title: "تمرین‌محوری و سناریوی واقعی",
    body: "بک‌تست هفتگی روی چارت واقعی + بررسی سناریوهای عملی با منتور.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

function SupportGlassCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-3xl p-5 group hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 40%), rgba(255,255,255,0.10)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.28)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 40px -12px rgba(0,0,0,0.4), 0 0 24px -8px rgba(247,207,90,0.18)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-3 left-5 w-14 h-3 rounded-full bg-white/40 blur-sm pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-[#f7cf5a]/15 blur-2xl pointer-events-none"
      />

      <div className="relative w-12 h-12 rounded-2xl bg-[#f7cf5a]/25 border border-[#f7cf5a]/45 text-[#f7cf5a] flex items-center justify-center mb-3 shadow-[0_0_20px_-6px_rgba(247,207,90,0.6)] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="relative font-extrabold text-white text-sm md:text-base mb-1.5 leading-tight">
        {title}
      </h3>
      <p className="relative text-[11px] md:text-xs text-white/75 leading-6">
        {body}
      </p>
    </div>
  );
}

const SUPPORT_PILLARS: {
  title: string;
  body: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "منتور خصوصی MON",
    body: "جلسات اختصاصی پرسش و پاسخ با استاد نام‌آور برای حل چالش‌های شخصی معامله‌گری",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" />
        <path d="M17 4l2 2-2 2" />
      </svg>
    ),
  },
  {
    title: "اندیکاتور هوشمند MON",
    body: "اندیکاتور هوشمند MON؛ همراه همیشگی شما روی چارت برای شناسایی موقعیت‌های کلیدی بازار",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="15 7 21 7 21 13" />
      </svg>
    ),
  },
  {
    title: "کانال تحلیلی ویژه",
    body: "کانال اختصاصی «Insight» در دیسکورد؛ نشست‌های لایو ترید گروهی و تحلیل لحظه‌ای بازار با تیم MON",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-6 4 3 4-7 5 4" />
        <path d="M2 12a10 10 0 0120 0M5 12a7 7 0 0114 0" opacity="0.4" />
      </svg>
    ),
  },
  {
    title: "کامیونیتی Discord",
    body: "عضویت در شبکه‌ای پویا از معامله‌گران؛ مشاهده‌ی زنده‌ی معاملات و فعالیت‌های روزانه‌ی هم‌دوره‌ای‌ها در دیسکورد",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="3" />
        <circle cx="17" cy="11" r="2.5" />
        <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
        <path d="M14 20c0-2 1.5-3.5 3.5-3.5S21 18 21 20" />
      </svg>
    ),
  },
  {
    title: "فایل‌های آموزشی",
    body: "جزوات، چک‌لیست، نقشه ذهنی و خلاصهٔ هر جلسه",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    title: "تمرین و بک‌تست هفتگی",
    body: "تمرین‌های هفته‌به‌هفته با بازخورد مستقیم منتور",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
];

/** Fallback syllabus shown when the MON course record in the DB has no
 *  `syllabusSections` set yet. The admin can override this from
 *  /admin/courses/mon/syllabus; on save, this array is bypassed. */
const DEFAULT_SYLLABUS: SyllabusSection[] = [
  {
    id: "default-psychology",
    title: "روان‌شناسی معامله‌گری حرفه‌ای",
    iconKey: "brain",
    bullets: [
      "شناخت ترس، طمع و عادات ذهنی مخرب",
      "ساخت Mindset حرفه‌ای و انضباط معاملاتی",
      "مدیریت احساسات در سود و ضرر متوالی",
      "بازی با احتمالات و پذیرش ضرر کنترل‌شده",
      "روان‌شناسی معامله‌گری در سیستم موسسه‌محور",
    ],
  },
  {
    id: "default-risk",
    title: "مدیریت سرمایه پیشرفته",
    iconKey: "money",
    bullets: [
      "محاسبه دقیق حجم پوزیشن بر اساس ریسک",
      "ریسک به ریوارد بهینه برای انواع ستاپ‌ها",
      "تکنیک‌های Pyramiding و Scaling در بازار واقعی",
      "مدیریت Drawdown و حفظ سرمایه بلندمدت",
      "طراحی Trading Plan شخصی",
    ],
  },
  {
    id: "default-technical",
    title: "تحلیل تکنیکال و سبک اختصاصی MON",
    iconKey: "chart",
    bullets: [
      "ساختار بازار و تغییر فاز بازیگران بزرگ",
      "Order block، Breaker block و Mitigation",
      "مفاهیم BMS و MSS در تحلیل ساختاری",
      "Judas Swing و منطق زمان‌بندی بازار",
      "نقاط ورود/خروج با متدولوژی MON",
    ],
  },
  {
    id: "default-master",
    title: "Master Classes اختصاصی",
    iconKey: "graduation",
    bullets: [
      "Case-study روی معاملات واقعی هفتگی",
      "تعمیق مفاهیم پیشرفته تحلیلی",
      "Q&A زنده با مهندس نام‌آور",
      "بررسی ستاپ‌های روزانه و بانک ستاپ",
      "ده‌ها مبحث کاربردی دیگر در چهارچوب MON",
    ],
  },
  {
    id: "default-macro",
    title: "اقتصاد کلان و تحلیل فاندامنتال",
    iconKey: "globe",
    bullets: [
      "خواندن دقیق تقویم اقتصادی",
      "Fed، بانک‌های مرکزی و سیاست‌های پولی",
      "داده‌های کلان (CPI, NFP, PMI و ...)",
      "تأثیر اخبار و رویدادهای ژئوپلیتیک بر بازار",
      "ترکیب فاندامنتال با تحلیل تکنیکال",
    ],
  },
  {
    id: "default-prop",
    title: "کلاس‌های تخصصی و بستر جذب سرمایه",
    iconKey: "star",
    bullets: [
      "آماده‌سازی برای دریافت سرمایه از صندوق نامدار",
      "Review نهایی استراتژی شخصی",
      "معیارهای ارزیابی و پایداری سودآوری",
      "مسیر تبدیل به تریدر تأمین سرمایه‌شده",
      "پشتیبانی پس از پایان دوره",
    ],
  },
];

// Resolved at render-time inside CoachingPage so the active value depends on
// the DB record (admin-overridable from /admin/courses/mon/syllabus) rather
// than the module load order.
function resolveSyllabus(): SyllabusSection[] {
  const monCourse = getCourse("mon");
  const fromDb = monCourse?.syllabusSections;
  if (fromDb && fromDb.length > 0) return fromDb;
  return DEFAULT_SYLLABUS;
}

export default function CoachingPage() {
  const bannerImageUrl = getSetting<string>("coaching.bannerImageUrl") || "";
  const bannerCaption =
    getSetting<string>("coaching.bannerCaption") ||
    "کلاس درس و سالن سمینار نامدار آکادمی";

  const introTitle =
    getSetting<string>("coaching.introTitle") || "معرفی دوره کوچینگ MON";
  const introParagraph1 =
    getSetting<string>("coaching.introParagraph1") ||
    "دوره کوچینگ MON در نامدار آکادمی با نگاه مدرن و پیشرفته به معامله‌گری حرفه‌ای طراحی شده است: یک مسیر آموزشی سیستم‌محور که معامله‌گر را از درک سطحی بازار به فهم عمیق تصمیمات پشت پرده حرکت قیمت می‌رساند.";
  const introParagraph2 =
    getSetting<string>("coaching.introParagraph2") ||
    "در MON متدولوژی اختصاصی نامدار به‌عنوان یکی از مهم‌ترین لایه‌های تحلیلی استفاده شده است، اما آموزش به آن محدود نمی‌شود؛ این دوره حاصل سال‌ها تجربه و تحقیق و بومی‌سازی مفاهیم پیشرفته توسط جناب مهندس امیرحسین نام‌آور است تا معامله‌گر بتواند با دیدی یکپارچه و عملیاتی در بازار ترید کند.";
  const introParagraph3 =
    getSetting<string>("coaching.introParagraph3") || "";
  const introVideoUrl = getSetting<string>("coaching.introVideoUrl") || "";
  const introVideoPoster =
    getSetting<string>("coaching.introVideoPoster") || "";
  const introVideoCaption =
    getSetting<string>("coaching.introVideoCaption") ||
    "توضیحات مهندس نام‌آور در خصوص MON";

  const introParagraphs = [introParagraph1, introParagraph2, introParagraph3].filter(
    (p) => p && p.trim().length > 0
  );

  const curriculumTitle =
    getSetting<string>("coaching.curriculumTitle") ||
    "ریز محتوای سرفصل‌های کوچینگ MON";
  const curriculumDesc =
    getSetting<string>("coaching.curriculumDesc") ||
    "سرفصل‌های MON به صورت مرحله‌به‌مرحله طراحی شده‌اند تا دانش‌پذیر را از مبانی به تحلیل پیشرفته حرکت دهند. روی هر سرفصل کلیک کنید تا جزئیات آن را ببینید.";

  const supportEyebrow =
    getSetting<string>("coaching.supportEyebrow") || "برنامه‌ریزی هفته به هفته";
  const supportTitle =
    getSetting<string>("coaching.supportTitle") ||
    "محتوای پشتیبانی کوچینگ MON";
  const supportDesc =
    getSetting<string>("coaching.supportDesc") ||
    "در دورهٔ کوچینگ MON پشتیبانی بخشی از ساختار آموزشی است نه یک گزینهٔ جانبی؛ دانش‌پذیران به یک فضای آموزشی اختصاصی متصل می‌شوند تا اجرای آموخته‌ها در بازار واقعی برایشان آسان شود.";

  const benefitsEyebrow =
    getSetting<string>("coaching.benefitsEyebrow") || "ویژگی‌های کلیدی دوره";
  const benefitsTitle =
    getSetting<string>("coaching.benefitsTitle") ||
    "مزیت‌های طلایی کوچینگ MON";
  const benefitsDesc =
    getSetting<string>("coaching.benefitsDesc") ||
    "دورهٔ MON برای پاسخ‌گویی به نیاز معامله‌گران جدی طراحی شده، نه آموزش سطحی و عمومی.\n\nدر ادامه با مهم‌ترین ویژگی‌های کلیدی این دوره آشنا می‌شوید.";
  const benefitsInstructorPhoto =
    getSetting<string>("coaching.benefitsInstructorPhoto") ||
    "/figma/portraitteachergivingonlineclass2.jpg";
  const benefitsInstructorName =
    getSetting<string>("coaching.benefitsInstructorName") ||
    "مهندس امیرحسین نام‌آور";
  const benefitsInstructorRole =
    getSetting<string>("coaching.benefitsInstructorRole") ||
    "بنیان‌گذار متدولوژی MON";

  const keyAchievementsEyebrow =
    getSetting<string>("coaching.keyAchievementsEyebrow") ||
    "فصل چهارم — در حال اجرا";
  const keyAchievementsTitle =
    getSetting<string>("coaching.keyAchievementsTitle") ||
    "دستاوردهای کلیدی فارغ‌التحصیلان MON";
  const keyAchievementsDesc =
    getSetting<string>("coaching.keyAchievementsDesc") ||
    "اعداد واقعی از سه شاخص تعیین‌کنندهٔ موفقیت دانش‌پذیران: دقت اجرا، جذب سرمایه و ثبات سودآوری ماهانه.";

  const bookingEyebrow =
    getSetting<string>("coaching.bookingEyebrow") || "ثبت‌نام آنلاین";
  const bookingTitle =
    getSetting<string>("coaching.bookingTitle") || "ثبت‌نام در کوچینگ MON";
  const bookingDesc =
    getSetting<string>("coaching.bookingDesc") ||
    "تعداد ظرفیت‌های هر دوره محدود است. فرم را تکمیل کنید تا تیم پذیرش پس از مصاحبهٔ کوتاه برای تعیین سطح، با شما هماهنگ کند.";
  const bookingPrice =
    getSetting<string>("coaching.bookingPrice") || "$۵٬۰۰۰";
  const bookingPriceUnit =
    getSetting<string>("coaching.bookingPriceUnit") || "USD";
  const bookingPriceNote =
    getSetting<string>("coaching.bookingPriceNote") ||
    "پرداخت با دلار و تتر (USDT) پذیرفته می‌شود";

  const videoTestimonialsEyebrow =
    getSetting<string>("coaching.videoTestimonialsEyebrow") ||
    "تجربه فارغ‌التحصیلان MON";
  const videoTestimonialsTitle =
    getSetting<string>("coaching.videoTestimonialsTitle") ||
    "نظر شرکت‌کنندگان قبلی کوچینگ MON";
  const videoTestimonialsDesc =
    getSetting<string>("coaching.videoTestimonialsDesc") ||
    "روایت مستقیم چهار تن از فارغ‌التحصیلان موفق دورهٔ MON دربارهٔ مسیر تبدیل شدنشان به تریدرهای حرفه‌ای.";

  const videoTestimonials = [1, 2, 3, 4].map((i) => ({
    posterUrl:
      getSetting<string>(`coaching.videoTestimonial${i}Poster`) || "",
    videoUrl: getSetting<string>(`coaching.videoTestimonial${i}Url`) || "",
    name:
      getSetting<string>(`coaching.videoTestimonial${i}Name`) ||
      ["علیرضا میرزایی", "مریم قاسم‌زاده", "محمد شریفی", "سارا رضایی"][i - 1],
    role:
      getSetting<string>(`coaching.videoTestimonial${i}Role`) ||
      [
        "فارغ‌التحصیل دوره ۱۴۰۳",
        "تریدر حرفه‌ای فارکس",
        "مدیر سرمایه — صندوق نامدار",
        "تریدر فول‌تایم کریپتو",
      ][i - 1],
  }));

  // بخش پایانی «درخواست ثبت‌نام» — عنوان، پاراگراف معرفی و سه گزینه bullet.
  // بولت‌های ۲ و ۳ به‌صورت پیش‌فرض خالی هستند؛ متن‌های قبلی («ضمانت بازگشت
  // وجه» و «پرداخت اقساطی») برای کوچینگ خصوصی صحیح نبود. اگر ادمین در پنل
  // مقدار وارد کند، نمایش داده می‌شود؛ اگر خالی بماند، نمایش داده نمی‌شود.
  const registerHeading =
    getSetting<string>("coaching.registerHeading") ||
    "آماده تبدیل شدن به تریدر حرفه‌ای هستید؟";
  const registerLead =
    getSetting<string>("coaching.registerLead") ||
    "تعداد ظرفیت‌های هر دوره محدود است. برای ثبت‌نام، فرم را پر کنید — تیم پذیرش در ۴۸ ساعت آینده با شما تماس خواهد گرفت.";
  const registerBullets = [
    getSetting<string>("coaching.registerBullet1") ||
      "مصاحبه رایگان تعیین سطح",
    getSetting<string>("coaching.registerBullet2") || "",
    getSetting<string>("coaching.registerBullet3") || "",
  ]
    .map((s) => s.trim())
    .filter(Boolean);

  // کارت‌های «ویژگی‌های کلیدی دوره» (BENEFITS_RIGHT) و «پشتیبانی MON»
  // (SUPPORT_PILLARS) — هر دو از قبل با متن پیش‌فرض در فایل تعریف شده‌اند،
  // ولی title/body هر کارت از طریق /admin/settings/coaching قابل ویرایش
  // است (آیکن SVG ثابت می‌ماند تا طراحی به هم نخورد).
  function withCardOverrides<T extends { title: string; body: string }>(
    arr: T[],
    prefix: string
  ): T[] {
    return arr.map((item, i) => {
      const n = i + 1;
      const t = getSetting<string>(`${prefix}${n}Title`)?.trim();
      const b = getSetting<string>(`${prefix}${n}Body`)?.trim();
      return {
        ...item,
        title: t || item.title,
        body: b || item.body,
      };
    });
  }
  const benefitsRight = withCardOverrides(BENEFITS_RIGHT, "coaching.benefit");
  const supportPillars = withCardOverrides(
    SUPPORT_PILLARS,
    "coaching.pillar"
  );

  const tradingResultsEyebrow =
    getSetting<string>("coaching.tradingResultsEyebrow") ||
    "گزارش عملکرد فارغ‌التحصیلان";
  const tradingResultsTitle =
    getSetting<string>("coaching.tradingResultsTitle") ||
    "نتایج معاملاتی شرکت‌کنندگان قبلی کوچینگ MON";
  const tradingResultsDesc =
    getSetting<string>("coaching.tradingResultsDesc") ||
    "اسکرین‌شات‌های واقعی از حساب‌های فارغ‌التحصیلان MON — بازدهی، نسبت برد و دقت ستاپ‌های اجرا شده.";

  const tradingResults = [1, 2, 3, 4].map((i) => ({
    imageUrl:
      getSetting<string>(`coaching.tradingResult${i}Image`) || "",
    caption:
      getSetting<string>(`coaching.tradingResult${i}Caption`) ||
      [
        "+۳۸٪ بازدهی سه‌ماهه",
        "۲ پیپ میانگین استاپ",
        "+۲۰۰ ریوارد ماهانه",
        "۶ ماه + پیوسته در سود",
      ][i - 1],
  }));

  const fundingResultsEyebrow =
    getSetting<string>("coaching.fundingResultsEyebrow") ||
    "مسیر جذب سرمایه";
  const fundingResultsTitle =
    getSetting<string>("coaching.fundingResultsTitle") ||
    "نتایج جذب سرمایه شرکت‌کنندگان قبلی کوچینگ MON";
  const fundingResultsDesc =
    getSetting<string>("coaching.fundingResultsDesc") ||
    "گواهی‌های Funded و سرمایه‌های تأمین‌شده از صندوق نامدار و پراپ‌فرم‌های معتبر برای فارغ‌التحصیلان MON.";

  const fundingResults = [1, 2, 3, 4].map((i) => ({
    imageUrl:
      getSetting<string>(`coaching.fundingResult${i}Image`) || "",
    caption:
      getSetting<string>(`coaching.fundingResult${i}Caption`) ||
      [
        "+$۱۰۰٬۰۰۰ سرمایه دریافتی",
        "۲ Phase تأیید‌شده",
        "صندوق نامدار $۵۰K",
        "Pass در ۴ هفته",
      ][i - 1],
  }));

  const methodFaqEyebrow =
    getSetting<string>("coaching.methodFaqEyebrow") ||
    "هر آنچه قبل از ثبت‌نام باید بدانید";
  const methodFaqTitle =
    getSetting<string>("coaching.methodFaqTitle") ||
    "سوالات متداول روش MON";
  const methodFaqDesc =
    getSetting<string>("coaching.methodFaqDesc") ||
    "پاسخ مهم‌ترین سوالاتی که دانش‌پذیران دربارهٔ متدولوژی، نتایج و اجرای واقعی سبک MON پرسیده‌اند. روی هر سوال کلیک کنید تا پاسخ کامل را ببینید.";

  const meetEyebrow =
    getSetting<string>("coaching.meetEyebrow") ||
    "مدرس و تریدر بازارهای مالی";
  const meetTitle =
    getSetting<string>("coaching.meetTitle") ||
    "معرفی مدرس دوره — جناب مهندس امیرحسین نام‌آور";
  const meetBio1 =
    getSetting<string>("coaching.meetBio1") ||
    "مهندس امیرحسین نام‌آور، بنیان‌گذار نامدار آکادمی، با بیش از دو دهه فعالیت مستمر در بازارهای مالی و آموزش حرفه‌ای معامله‌گری، از چهره‌های تأثیرگذار این حوزه در ایران به‌شمار می‌رود.";
  const meetBio2 =
    getSetting<string>("coaching.meetBio2") ||
    "رویکرد سیستماتیک، نگاه عمیق به ساختار بازار و توانایی تبدیل مفاهیم پیچیده به مدل‌های قابل اجرا، باعث شده محتوای آموزشی ایشان فراتر از آموزش‌های متداول و مبتنی بر منطق حرفه‌ای بازارهای جهانی باشد.";
  const meetPhoto =
    getSetting<string>("coaching.meetPhoto") ||
    "/uploads/seminar-portrait-phone.jpg";

  const syllabusSections = resolveSyllabus();

  return (
    <div className="bg-[#f7fafd] min-h-screen" dir="rtl">
      <CoachingHero />

      <section className="relative bg-gradient-to-b from-[#64b5f6] via-[#3d92cf] to-[#0e1a3d]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-2 md:pt-4 pb-10 md:pb-14">
          <div className="relative rounded-[1.75rem] overflow-hidden border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] aspect-[16/6] md:aspect-[16/5] bg-gradient-to-br from-[#1b3c8a] via-[#136cb5] to-[#49bbbd]">
            {bannerImageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${bannerImageUrl}')` }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/85 text-center px-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-3 opacity-80"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <div className="text-sm md:text-base font-bold">
                  بنر کلاس درس / سالن سمینار
                </div>
                <div className="text-[11px] md:text-xs text-white/70 mt-1">
                  از مسیر «مدیریت ← تنظیمات ← کوچینگ» تصویر را بارگذاری کنید
                </div>
              </div>
            )}

            {bannerImageUrl && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-5 bottom-4 md:inset-x-8 md:bottom-6 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 border border-white/15 backdrop-blur text-[11px] md:text-xs text-white/90 font-bold">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f7cf5a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                    {bannerCaption}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section
        id="about-course"
        className="relative bg-[#dceefd] text-[#010514] scroll-mt-24 overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute top-10 right-[-120px] w-[420px] h-[420px] rounded-full opacity-[0.30] blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-10 left-[-120px] w-[380px] h-[380px] rounded-full opacity-[0.28] blur-[110px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #7ec8f5, transparent 70%)" }}
        />

        <div className="relative max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/30 border border-[#d4a62a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#7a5a08] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a62a] shadow-[0_0_8px_#f7cf5a]" />
              ABOUT THE COURSE
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-[#0e1a3d]">
              {introTitle}
            </h2>
            <div className="mt-5 h-[3px] w-24 rounded-full bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a] shadow-[0_0_18px_rgba(247,207,90,0.55)]" />
          </div>

          <div className="flex flex-col gap-10 lg:gap-12 items-stretch">
            <div className="relative mx-auto w-full max-w-[820px]">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#f7cf5a]/40 via-[#d4a62a]/15 to-[#49bbbd]/40 blur-2xl opacity-70"
              />
              <div className="relative rounded-[1.75rem] overflow-hidden border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] aspect-video bg-black group">
                {introVideoPoster ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${introVideoPoster}')` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1b3c8a] via-[#136cb5] to-[#49bbbd]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35" />

                {introVideoUrl ? (
                  <button
                    type="button"
                    aria-label="پخش ویدیوی توضیحات مهندس نام‌آور"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#f7cf5a]/10 animate-ping" />
                    <span className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#f7cf5a]/25 backdrop-blur-md border border-[#f7cf5a]/60 flex items-center justify-center hover:scale-110 transition shadow-[0_0_40px_-5px_#f7cf5a]">
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="#f7cf5a"
                        className="drop-shadow-[0_0_8px_#f7cf5a]"
                      >
                        <polygon points="8 5 19 12 8 19 8 5" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/85 text-center px-6">
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 opacity-80"
                    >
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <div className="text-sm md:text-base font-bold">
                      جای بارگذاری ویدیو
                    </div>
                    <div className="text-[11px] md:text-xs text-white/70 mt-1">
                      از پنل ادمین فایل را آپلود کنید
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-[#f7cf5a]/30 backdrop-blur text-[11px] md:text-xs text-[#f7cf5a] font-bold">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 14" />
                    </svg>
                    {introVideoCaption}
                  </span>
                </div>
              </div>
            </div>

            {/* Each paragraph is a self-contained grid cell so it reads
                horizontally on md+ without the heading/content drift that
                CSS multi-column flow causes on rich legacy HTML. */}
            <ExpandableProse collapsedHeight={260} fadeColor="rgba(247,250,253,1)">
              <div className="text-[#010514]/80 leading-9 text-base md:text-lg text-justify grid gap-x-10 gap-y-5 md:grid-cols-2 [&>p]:mb-0">
                {introParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </ExpandableProse>
          </div>
        </div>
      </section>

      <section
        id="curriculum-detail"
        className="relative bg-[#dceefd] text-[#010514] scroll-mt-24 overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute top-20 right-[-100px] w-[420px] h-[420px] rounded-full opacity-[0.30] blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-20 left-[-100px] w-[380px] h-[380px] rounded-full opacity-[0.28] blur-[110px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #7ec8f5, transparent 70%)" }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/30 border border-[#d4a62a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#7a5a08] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a62a] shadow-[0_0_8px_#f7cf5a]" />
              CURRICULUM DETAIL
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              {curriculumTitle}
            </h2>
            <p className="text-[#010514]/65 max-w-2xl mx-auto text-sm md:text-base leading-7">
              {curriculumDesc}
            </p>
          </div>

          <div className="grid lg:grid-cols-[420px_1fr] gap-6 lg:gap-10 items-start">
            {/* Left: Key topics card */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-[#f7cf5a]/30 via-[#d4a62a]/10 to-[#49bbbd]/30 blur-2xl opacity-60"
              />
              <div className="relative rounded-3xl bg-gradient-to-br from-[#1b3c8a] via-[#1d5fa3] to-[#136cb5] border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] p-6 md:p-7 overflow-hidden">
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#f7cf5a]/15 blur-3xl pointer-events-none"
                />
                <div className="relative flex items-center justify-center gap-2 mb-6 text-center">
                  <span className="text-3xl md:text-4xl font-black text-[#f7cf5a] drop-shadow-[0_0_12px_rgba(247,207,90,0.6)]">
                    {faDigits(6)}
                  </span>
                  <h3 className="font-extrabold text-base md:text-lg leading-tight text-white">
                    سرفصل کلیدی کوچینگ MON
                  </h3>
                </div>
                <div className="relative grid grid-cols-2 gap-3">
                  {KEY_TOPICS.map((t) => (
                    <div
                      key={t.label}
                      className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-4 text-center hover:bg-white/15 hover:-translate-y-0.5 transition group"
                    >
                      <div className="w-12 h-12 mx-auto rounded-xl bg-[#f7cf5a]/20 border border-[#f7cf5a]/40 text-[#f7cf5a] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        {t.icon}
                      </div>
                      <div className="text-xs md:text-sm font-bold text-white/95 leading-tight">
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Accordion */}
            <div className="space-y-3">
              {syllabusSections.map((c, i) => (
                <details
                  key={c.id}
                  open={i === 0}
                  className="group rounded-2xl bg-white border border-[#bcd9f4] shadow-[0_8px_24px_-12px_rgba(14,26,61,0.18)] overflow-hidden open:shadow-[0_16px_40px_-16px_rgba(14,26,61,0.28)] transition"
                >
                  <summary className="list-none cursor-pointer flex items-center gap-4 px-5 py-4 hover:bg-[#f4faff] transition">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-[#f7cf5a]/25 border border-[#d4a62a]/40 text-[#7a5a08] flex items-center justify-center">
                      <SyllabusIcon iconKey={c.iconKey} />
                    </span>
                    <span className="flex-1 font-extrabold text-[#0e1a3d] text-sm md:text-base">
                      {c.title}
                    </span>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#f7cf5a] text-[#2d1c03] flex items-center justify-center transition-transform group-open:rotate-180">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-1 border-t border-[#e2effb]">
                    <ul className="space-y-2 mt-4">
                      {c.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-sm text-[#010514]/75 leading-7"
                        >
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#d4a62a] mt-2.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="support"
        className="relative overflow-hidden bg-gradient-to-b from-[#1d88d1] via-[#136cb5] to-[#0b4a7a] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full opacity-30 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full opacity-25 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#f7cf5a] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
              GOLDEN SUPPORT
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              {supportTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
              <span className="text-[#f7cf5a] text-sm md:text-base font-bold">
                {supportEyebrow}
              </span>
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
            </div>
            <p className="text-white/80 max-w-3xl mx-auto text-sm md:text-base leading-8">
              {supportDesc}
            </p>
          </div>

          {/* Desktop schematic */}
          <div className="hidden lg:block relative max-w-[1080px] mx-auto h-[640px]">
            <svg
              aria-hidden
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1080 640"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(247,207,90,0.55)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
                </linearGradient>
                <radialGradient id="hubRing" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="transparent" />
                  <stop offset="78%" stopColor="rgba(247,207,90,0.45)" />
                  <stop offset="82%" stopColor="rgba(247,207,90,0.05)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              <circle cx="540" cy="320" r="260" fill="none" stroke="rgba(255,255,255,0.10)" strokeDasharray="2 6" />
              <circle cx="540" cy="320" r="200" fill="url(#hubRing)" />

              <line x1="540" y1="320" x2="270" y2="120" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1="540" y1="320" x2="810" y2="120" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1="540" y1="320" x2="160" y2="320" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1="540" y1="320" x2="920" y2="320" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1="540" y1="320" x2="270" y2="520" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1="540" y1="320" x2="810" y2="520" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
            </svg>

            {/* Central hub */}
            <div
              className="absolute z-10"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="relative w-[220px] h-[220px] rounded-full flex flex-col items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 35%), radial-gradient(circle at 75% 75%, rgba(247,207,90,0.45) 0%, transparent 50%), rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  boxShadow:
                    "inset 0 0 36px rgba(255,255,255,0.25), inset 0 -14px 30px rgba(247,207,90,0.18), 0 30px 70px -15px rgba(0,0,0,0.55), 0 0 40px rgba(247,207,90,0.18)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: "20%",
                    top: "14%",
                    width: "32%",
                    height: "20%",
                    background:
                      "radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 65%)",
                    filter: "blur(2px)",
                  }}
                />
                <div className="relative w-14 h-14 mb-2 flex items-center justify-center text-[#f7cf5a] drop-shadow-[0_2px_8px_rgba(247,207,90,0.6)]">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5L12 16l-5.5 3 1-6.5L3 8.8 9 8z" />
                  </svg>
                </div>
                <div className="relative text-center text-white/90 text-[11px] tracking-[0.18em] font-bold mb-1">
                  +CONTENT
                </div>
                <div className="relative text-center text-white text-base font-extrabold">
                  محتوای پشتیبان
                </div>
                <div className="relative text-center text-[#f7cf5a] text-lg font-black mt-0.5">
                  MON
                </div>
              </div>
            </div>

            {/* 6 cards in radial positions */}
            <div className="absolute" style={{ top: "0%", left: "16%", width: "230px" }}>
              <SupportGlassCard {...supportPillars[0]} />
            </div>
            <div className="absolute" style={{ top: "0%", right: "16%", width: "230px" }}>
              <SupportGlassCard {...supportPillars[1]} />
            </div>
            <div className="absolute" style={{ top: "50%", left: "0%", width: "230px", transform: "translateY(-50%)" }}>
              <SupportGlassCard {...supportPillars[2]} />
            </div>
            <div className="absolute" style={{ top: "50%", right: "0%", width: "230px", transform: "translateY(-50%)" }}>
              <SupportGlassCard {...supportPillars[3]} />
            </div>
            <div className="absolute" style={{ bottom: "0%", left: "16%", width: "230px" }}>
              <SupportGlassCard {...supportPillars[4]} />
            </div>
            <div className="absolute" style={{ bottom: "0%", right: "16%", width: "230px" }}>
              <SupportGlassCard {...supportPillars[5]} />
            </div>
          </div>

          {/* Mobile / tablet stack */}
          <div className="lg:hidden">
            <div className="mx-auto max-w-[280px] mb-8">
              <div
                className="relative aspect-square rounded-full flex flex-col items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 35%), radial-gradient(circle at 75% 75%, rgba(247,207,90,0.4) 0%, transparent 50%), rgba(255,255,255,0.08)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow:
                    "inset 0 0 30px rgba(255,255,255,0.2), 0 25px 60px -15px rgba(0,0,0,0.5)",
                }}
              >
                <div className="text-[#f7cf5a] mb-2">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5L12 16l-5.5 3 1-6.5L3 8.8 9 8z" />
                  </svg>
                </div>
                <div className="text-white/90 text-[11px] tracking-[0.18em] font-bold">+CONTENT</div>
                <div className="text-white text-base font-extrabold">محتوای پشتیبان</div>
                <div className="text-[#f7cf5a] text-lg font-black">MON</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {supportPillars.map((p) => (
                <SupportGlassCard key={p.title} {...p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className="relative overflow-hidden bg-gradient-to-b from-[#0b4a7a] via-[#0e1a3d] to-[#0e1a3d] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-30 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 right-0 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#f7cf5a] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
              GOLDEN BENEFITS
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              {benefitsTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
              <span className="text-[#f7cf5a] text-sm md:text-base font-bold">
                {benefitsEyebrow}
              </span>
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
            </div>
            <p className="text-white/80 max-w-3xl mx-auto text-sm md:text-base leading-8 whitespace-pre-line">
              {benefitsDesc}
            </p>
          </div>

          {/* Desktop: 3 cards | photo | 3 cards */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_360px_1fr] gap-6 xl:gap-8 items-center">
            <div className="space-y-5">
              {BENEFITS_LEFT.map((b) => (
                <BenefitGlassCard key={b.title} {...b} align="left" />
              ))}
            </div>

            <div className="relative mx-auto">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-[#f7cf5a] via-[#d4a62a] to-[#49bbbd] opacity-70 blur-2xl"
              />
              <div className="relative w-[340px] aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={benefitsInstructorPhoto}
                  alt={benefitsInstructorName}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/15" />
                <div
                  aria-hidden
                  className="absolute inset-0 ring-1 ring-inset ring-[#f7cf5a]/30 rounded-[2rem] pointer-events-none"
                />

                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 border border-[#f7cf5a]/45 backdrop-blur text-[10px] md:text-[11px] tracking-[0.18em] font-extrabold text-[#f7cf5a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
                  INSTRUCTOR
                </div>

                <div className="absolute inset-x-5 bottom-5">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background:
                        "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 40%), rgba(0,0,0,0.45)",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px -8px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="text-[10px] tracking-[0.2em] text-[#f7cf5a] font-bold mb-1">
                      مدرس دوره
                    </div>
                    <div className="font-extrabold text-white text-base leading-tight">
                      {benefitsInstructorName}
                    </div>
                    <div className="text-xs text-white/75 mt-1">
                      {benefitsInstructorRole}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {benefitsRight.map((b) => (
                <BenefitGlassCard key={b.title} {...b} align="right" />
              ))}
            </div>
          </div>

          {/* Mobile / tablet: photo on top + grid */}
          <div className="lg:hidden">
            <div className="relative mx-auto max-w-[300px] mb-8">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#f7cf5a] via-[#d4a62a] to-[#49bbbd] opacity-60 blur-xl"
              />
              <div className="relative aspect-[3/4] rounded-[1.75rem] overflow-hidden border border-white/30 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={benefitsInstructorPhoto}
                  alt={benefitsInstructorName}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-4 bottom-4">
                  <div className="text-[10px] tracking-[0.2em] text-[#f7cf5a] font-bold mb-1">
                    مدرس دوره
                  </div>
                  <div className="font-extrabold text-white text-base leading-tight">
                    {benefitsInstructorName}
                  </div>
                  <div className="text-xs text-white/75 mt-1">
                    {benefitsInstructorRole}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[...benefitsRight, ...BENEFITS_LEFT].map((b) => (
                <BenefitGlassCard key={b.title} {...b} align="right" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="key-achievements"
        className="relative overflow-hidden bg-gradient-to-b from-[#0e1a3d] via-[#12214a] to-[#0e1a3d] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-20 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-20 left-1/4 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#f7cf5a] mb-3 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
                KEY ACHIEVEMENTS
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                {keyAchievementsTitle}
              </h2>
              <p className="text-white/65 text-sm md:text-base mt-2 max-w-2xl leading-7">
                {keyAchievementsDesc}
              </p>
            </div>
            <div className="text-[10px] md:text-[11px] tracking-[0.28em] text-white/50 font-extrabold">
              {keyAchievementsEyebrow}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {KEY_ACHIEVEMENTS.map((a) => (
              <div
                key={a.title}
                className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-5 overflow-hidden backdrop-blur"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a]"
                />
                <div
                  aria-hidden
                  className="absolute -top-12 -right-10 w-32 h-32 rounded-full bg-[#f7cf5a]/20 blur-3xl pointer-events-none"
                />
                <div className="relative flex items-center justify-between gap-3 mb-3">
                  <div className="text-[10px] tracking-[0.22em] text-white/60 font-extrabold">
                    {a.level}
                  </div>
                  <span className="px-2.5 py-1 rounded-full border border-[#f7cf5a]/35 bg-[#f7cf5a]/10 text-[9px] md:text-[10px] font-extrabold tracking-[0.2em] text-[#f7cf5a]">
                    {a.badge}
                  </span>
                </div>
                <div className="relative flex items-start gap-3 mb-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-base md:text-lg mb-1.5 leading-tight text-white">
                      {a.title}
                    </div>
                    <p className="text-[11px] md:text-xs text-white/60 leading-6">
                      {a.desc}
                    </p>
                  </div>
                </div>
                <div className="relative flex items-center gap-3">
                  <span className="text-[10px] text-white/60 font-extrabold tabular-nums min-w-[32px]">
                    {faDigits(a.pct)}٪
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a] rounded-full shadow-[0_0_10px_rgba(247,207,90,0.65)]"
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="booking"
        className="relative overflow-hidden bg-gradient-to-b from-[#0e1a3d] via-[#12214a] to-[#0e1a3d] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-32 right-1/3 w-[520px] h-[520px] rounded-full opacity-25 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 left-0 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#f7cf5a] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
              ENROLL NOW
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              {bookingTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
              <span className="text-[#f7cf5a] text-sm md:text-base font-bold">
                {bookingEyebrow}
              </span>
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
            </div>
            <p className="text-white/80 max-w-3xl mx-auto text-sm md:text-base leading-8">
              {bookingDesc}
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-6 lg:gap-8 items-start">
            {/* Right (RTL start): Form */}
            <div>
              <CoachingBookingFormGlass />
            </div>

            {/* Left (RTL end): Specs */}
            <div className="space-y-3.5">
              {/* Price feature card */}
              <div
                className="relative rounded-3xl p-5 md:p-6 overflow-hidden"
                style={{
                  background:
                    "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.05) 40%), linear-gradient(135deg, rgba(247,207,90,0.20), rgba(212,166,42,0.10) 60%, rgba(255,255,255,0.05))",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(247,207,90,0.45)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.4), 0 18px 50px -15px rgba(247,207,90,0.35), 0 0 28px -8px rgba(247,207,90,0.30)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute top-3 left-6 w-20 h-3 rounded-full bg-white/40 blur-sm pointer-events-none"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#f7cf5a]/30 blur-3xl pointer-events-none"
                />
                <div className="relative flex items-center gap-4">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#f7cf5a]/30 border border-[#f7cf5a]/50 text-[#f7cf5a] flex items-center justify-center shadow-[0_0_24px_-6px_rgba(247,207,90,0.7)]">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="2" x2="12" y2="22" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] tracking-[0.2em] font-bold text-[#f7cf5a] mb-1">
                      مبلغ سرمایه‌گذاری
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-black text-2xl md:text-3xl text-white drop-shadow-[0_2px_8px_rgba(247,207,90,0.5)] tabular-nums">
                        {bookingPrice}
                      </span>
                      <span className="text-sm md:text-base font-bold text-white/85">
                        {bookingPriceUnit}
                      </span>
                    </div>
                    <div className="text-[11px] md:text-xs text-white/70 mt-1.5">
                      {bookingPriceNote}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 spec cards */}
              {BOOKING_SPECS.map((s) => (
                <div
                  key={s.title}
                  className="relative rounded-2xl p-4 md:p-5 overflow-hidden hover:-translate-y-0.5 transition group"
                  style={{
                    background:
                      "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 40%), rgba(255,255,255,0.07)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.20)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 30px -12px rgba(0,0,0,0.45)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute top-2 left-4 w-12 h-2 rounded-full bg-white/30 blur-sm pointer-events-none"
                  />
                  <div className="relative flex items-start gap-3">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-[#f7cf5a]/20 border border-[#f7cf5a]/40 text-[#f7cf5a] flex items-center justify-center group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-white text-sm md:text-[15px] mb-1 leading-tight">
                        {s.title}
                      </h3>
                      {s.body && (
                        <p className="text-[11px] md:text-xs text-white/70 leading-6">
                          {s.body}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="video-testimonials"
        className="relative overflow-hidden bg-gradient-to-b from-[#0e1a3d] via-[#0b3060] to-[#0e1a3d] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-20 left-10 w-[500px] h-[500px] rounded-full opacity-25 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-20 right-10 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#f7cf5a] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
              STUDENT VOICES
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              {videoTestimonialsTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
              <span className="text-[#f7cf5a] text-sm md:text-base font-bold">
                {videoTestimonialsEyebrow}
              </span>
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
            </div>
            <p className="text-white/80 max-w-3xl mx-auto text-sm md:text-base leading-8">
              {videoTestimonialsDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-[1200px] mx-auto">
            {videoTestimonials.map((v, i) => (
              <VideoTestimonialCard
                key={i}
                index={i + 1}
                posterUrl={v.posterUrl}
                videoUrl={v.videoUrl}
                name={v.name}
                role={v.role}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="trading-results"
        className="relative overflow-hidden bg-gradient-to-b from-[#0e1a3d] via-[#0a2547] to-[#0e1a3d] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-20 right-10 w-[500px] h-[500px] rounded-full opacity-25 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-20 left-10 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #1d88d1, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#49bbbd]/15 border border-[#49bbbd]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#7fe3e5] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#49bbbd] shadow-[0_0_8px_#49bbbd]" />
              TRADING RESULTS
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              {tradingResultsTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#49bbbd]/60" />
              <span className="text-[#7fe3e5] text-sm md:text-base font-bold">
                {tradingResultsEyebrow}
              </span>
              <span className="h-px w-10 bg-[#49bbbd]/60" />
            </div>
            <p className="text-white/80 max-w-3xl mx-auto text-sm md:text-base leading-8">
              {tradingResultsDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-[1200px] mx-auto">
            {tradingResults.map((r, i) => (
              <ResultImageCard
                key={i}
                index={i + 1}
                imageUrl={r.imageUrl}
                caption={r.caption}
                accent="teal"
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="funding-results"
        className="relative overflow-hidden bg-gradient-to-b from-[#0e1a3d] via-[#12214a] to-[#0e1a3d] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-20 left-10 w-[500px] h-[500px] rounded-full opacity-30 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-20 right-10 w-[420px] h-[420px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #d4a62a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#f7cf5a] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
              FUNDED ACCOUNTS
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
              {fundingResultsTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
              <span className="text-[#f7cf5a] text-sm md:text-base font-bold">
                {fundingResultsEyebrow}
              </span>
              <span className="h-px w-10 bg-[#f7cf5a]/60" />
            </div>
            <p className="text-white/80 max-w-3xl mx-auto text-sm md:text-base leading-8">
              {fundingResultsDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-[1200px] mx-auto">
            {fundingResults.map((r, i) => (
              <ResultImageCard
                key={i}
                index={i + 1}
                imageUrl={r.imageUrl}
                caption={r.caption}
                accent="gold"
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="method-faq"
        className="relative overflow-hidden bg-[#dceefd] text-[#010514] scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute top-1/4 right-0 w-[480px] h-[480px] rounded-full opacity-30 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-1/4 left-0 w-[420px] h-[420px] rounded-full opacity-28 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #7ec8f5, transparent 70%)" }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/30 border border-[#d4a62a]/40 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#7a5a08] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a62a] shadow-[0_0_8px_#f7cf5a]" />
              MON METHOD FAQ
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              {methodFaqTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#d4a62a]/60" />
              <span className="text-[#7a5a08] text-sm md:text-base font-bold">
                {methodFaqEyebrow}
              </span>
              <span className="h-px w-10 bg-[#d4a62a]/60" />
            </div>
            <p className="text-[#010514]/70 max-w-3xl mx-auto text-sm md:text-base leading-8">
              {methodFaqDesc}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {METHOD_FAQ.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group rounded-2xl bg-white border border-[#bcd9f4] shadow-[0_8px_24px_-12px_rgba(14,26,61,0.18)] overflow-hidden open:shadow-[0_16px_40px_-16px_rgba(14,26,61,0.28)] transition"
              >
                <summary className="list-none cursor-pointer flex items-center gap-4 px-5 py-4 hover:bg-[#f4faff] transition">
                  <span className="shrink-0 w-9 h-9 rounded-xl bg-[#f7cf5a]/25 border border-[#d4a62a]/40 text-[#7a5a08] flex items-center justify-center font-extrabold text-sm tabular-nums">
                    {faDigits(i + 1)}
                  </span>
                  <span className="flex-1 font-extrabold text-[#0e1a3d] text-sm md:text-base leading-7">
                    {item.q}
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#f7cf5a] text-[#2d1c03] flex items-center justify-center transition-transform group-open:rotate-180">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1 border-t border-[#e2effb] mr-[3.25rem]">
                  <p className="text-sm md:text-[15px] text-[#010514]/75 leading-8 mt-3">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        id="meet-instructor"
        className="relative overflow-hidden bg-[#fdf2da] text-[#010514] scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-32 right-0 w-[520px] h-[520px] rounded-full opacity-40 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 left-0 w-[420px] h-[420px] rounded-full opacity-30 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #d4a62a, transparent 70%)" }}
        />

        <div className="relative max-w-[1300px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0e1a3d]/10 border border-[#0e1a3d]/20 text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold text-[#0e1a3d] mb-4 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0e1a3d]" />
              MEET YOUR MENTOR
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              {meetTitle}
            </h2>
            <div className="inline-flex items-center gap-3 mt-2">
              <span className="h-px w-10 bg-[#0e1a3d]/40" />
              <span className="text-[#7a5a08] text-sm md:text-base font-bold">
                {meetEyebrow}
              </span>
              <span className="h-px w-10 bg-[#0e1a3d]/40" />
            </div>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-center">
            {/* Photo card */}
            <div className="relative mx-auto lg:mx-0">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-[#f7cf5a] via-[#d4a62a] to-[#0e1a3d] opacity-40 blur-2xl"
              />
              <div className="relative w-[300px] md:w-[360px] aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_30px_80px_-20px_rgba(14,26,61,0.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meetPhoto}
                  alt="مهندس امیرحسین نام‌آور"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a3d]/85 via-transparent to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <div className="text-[10px] tracking-[0.2em] text-[#f7cf5a] font-bold mb-1">
                    استاد دوره
                  </div>
                  <div className="font-extrabold text-white text-lg leading-tight">
                    مهندس امیرحسین نام‌آور
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    بنیان‌گذار نامدار آکادمی
                  </div>
                </div>
              </div>
            </div>

            {/* Bio + credentials */}
            <div className="space-y-5">
              <div className="relative rounded-3xl bg-[#0e1a3d] text-white p-6 md:p-7 overflow-hidden shadow-[0_20px_50px_-20px_rgba(14,26,61,0.55)]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a]"
                />
                <div
                  aria-hidden
                  className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-[#f7cf5a]/10 blur-3xl pointer-events-none"
                />
                <p className="relative text-sm md:text-base leading-9 text-white/90 mb-4">
                  {meetBio1}
                </p>
                <p className="relative text-sm md:text-base leading-9 text-white/90">
                  {meetBio2}
                </p>
              </div>

              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "بنیان‌گذار نامدار آکادمی", icon: "star" },
                  { label: "+۱۶ سال تجربهٔ معامله‌گری حرفه‌ای", icon: "clock" },
                  { label: "طراح متدولوژی اختصاصی MON", icon: "spark" },
                  {
                    label: "مدرس بیش از +۲٬۰۰۰ تریدر فارغ‌التحصیل",
                    icon: "users",
                  },
                  { label: "مدیر صندوق سرمایه نامدار", icon: "shield" },
                  {
                    label: "سخنران سمینارهای ملی بازارهای مالی",
                    icon: "mic",
                  },
                ].map((c) => (
                  <li
                    key={c.label}
                    className="flex items-start gap-3 rounded-2xl bg-white border border-[#f3e3b3] px-4 py-3 shadow-[0_6px_18px_-10px_rgba(212,166,42,0.4)] hover:-translate-y-0.5 transition"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-[#f7cf5a]/25 border border-[#d4a62a]/40 text-[#7a5a08] flex items-center justify-center">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="text-sm text-[#0e1a3d] font-bold leading-7 flex-1">
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="register"
        className="bg-gradient-to-l from-[#1b3c8a] to-[#136cb5] text-white py-16 md:py-24 scroll-mt-24"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-4">
              {registerHeading}
            </h2>
            <p className="text-white/85 leading-8 mb-6 whitespace-pre-line">
              {registerLead}
            </p>
            {registerBullets.length > 0 && (
              <ul className="space-y-2 text-sm text-white/80">
                {registerBullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="2.4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <CoachingRegisterForm />
          </div>
        </div>
      </section>


      <BackToTop />

      {/* Floating support dock — stays pinned in the viewport margin so users can
          reach share / contact without scrolling, and never enters the reading column. */}
      <FloatingSupportDock
        shareTitle="کوچینگ MON — نامدار آکادمی"
        sharePath="/coaching"
        supportText="برای مشاوره رایگان و بررسی تناسب شرایطتان با برنامهٔ کوچینگ MON، با تیم پذیرش نامدار آکادمی در تماس باشید."
      />
    </div>
  );
}
