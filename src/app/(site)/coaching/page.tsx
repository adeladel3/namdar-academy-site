import Link from "next/link";
import CoachingRegisterForm from "./CoachingRegisterForm";
import { faDigits } from "@/lib/formatting";

export const metadata = {
  title: "کوچینگ MON — نامدار آکادمی",
  description:
    "برنامه ۱۸ هفته‌ای کوچینگ حرفه‌ای معامله‌گری با سبک MON، مستقیم زیر نظر استاد امیرحسین نام‌آور.",
};

const STATS: { label: string; value: string; sub?: string }[] = [
  { label: "سرمایه اهدا شده به فارغ‌التحصیلان", value: "+۱۰۰,۰۰۰ $" },
  { label: "فارغ‌التحصیل", value: "+۲,۰۰۰ نفر" },
  { label: "نرخ موفقیت", value: "۷۳٪" },
  { label: "مدت دوره", value: "۱۸ هفته", sub: "کلاس‌های زنده + محتوای ضبط‌شده" },
];

const SYLLABUS: { weeks: string; title: string; description: string }[] = [
  {
    weeks: "هفته ۱",
    title: "روان‌شناسی معامله‌گری",
    description:
      "شناخت ترس، طمع و عادات ذهنی که مانع سودسازی پایدار می‌شوند. ساخت mindset حرفه‌ای.",
  },
  {
    weeks: "هفته ۲",
    title: "مدیریت سرمایه پیشرفته",
    description:
      "محاسبه حجم پوزیشن، ریسک به ریوارد، و سیستم‌های pyramiding/scaling در بازار واقعی.",
  },
  {
    weeks: "هفته‌های ۳ تا ۶",
    title: "تحلیل تکنیکال و سبک MON",
    description:
      "متدولوژی اختصاصی نامدار — از ساختار بازار تا نقاط ورود/خروج با سبک MON.",
  },
  {
    weeks: "هفته‌های ۷ تا ۱۱",
    title: "Master Classes",
    description:
      "عمیق‌ترین جلسات برای تعمیق مفاهیم، case-study روی معاملات واقعی و Q&A زنده.",
  },
  {
    weeks: "هفته‌های ۱۲ تا ۱۵",
    title: "اقتصاد کلان و فاندامنتال",
    description:
      "خواندن تقویم اقتصادی، Fed، بانک‌های مرکزی، داده‌های کلان و تأثیر آن‌ها بر بازار.",
  },
  {
    weeks: "هفته‌های ۱۶ تا ۱۸",
    title: "کلاس‌های تخصصی و بستر سرمایه",
    description:
      "آماده‌سازی برای دریافت سرمایه از صندوق نامدار + review فینال استراتژی شخصی.",
  },
];

const PERKS = [
  {
    title: "آموزش مستقیم از استاد نام‌آور",
    body: "تمام کلاس‌های اصلی به‌صورت زنده با ۱۶ سال تجربه‌ی واقعی بازار ارائه می‌شود.",
  },
  {
    title: "کامیونیتی Discord اختصاصی",
    body: "تحلیل روزانه، سوال و جواب، بانک ستاپ‌های اختصاصی و ارتباط با بقیه دانش‌پذیران.",
  },
  {
    title: "پشتیبانی تیکتی اختصاصی",
    body: "هر سوال تخصصی شما در زمان معقول پاسخ داده می‌شود.",
  },
  {
    title: "گواهی رسمی پایان دوره",
    body: "گواهی معتبر نامدار آکادمی — امکان معرفی برای جذب سرمایه از صندوق.",
  },
  {
    title: "دسترسی مادام‌العمر به محتوا",
    body: "تمام جلسات ضبط‌شده و منابع برای همیشه در اختیار شماست.",
  },
  {
    title: "مسیر جذب سرمایه",
    body: "فارغ‌التحصیلان موفق امکان دریافت سرمایه از صندوق آکادمی را دارند.",
  },
];

const TESTIMONIALS = [
  {
    name: "علیرضا میرزایی",
    role: "فارغ‌التحصیل دوره ۱۴۰۳",
    quote:
      "قبل از MON بدون نظم معامله می‌کردم. بعد از ۱۸ هفته، سه ماهه پشت سر هم سودده بودم و الان با سرمایه صندوق کار می‌کنم.",
  },
  {
    name: "مریم قاسم‌زاده",
    role: "تریدر حرفه‌ای",
    quote:
      "سبک MON ترکیبی از تحلیل تکنیکال دقیق و روان‌شناسی قوی‌ست. مسیر ۶ ماهه‌ی من به طور کامل عوض شد.",
  },
  {
    name: "محمد شریفی",
    role: "مدیر سرمایه",
    quote:
      "کامیونیتی Discord ارزشش به تنهایی از شهریه دوره بیشتره. تحلیل‌های روزانه‌ی تیم نامدار مرجع منه.",
  },
];

export default function CoachingPage() {
  return (
    <div className="bg-[#f7fafd] min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-[#0f1f4a] via-[#1b3c8a] to-[#136cb5] text-white overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-[#f7cf5a]" />
                برنامه پرچم‌دار نامدار آکادمی
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                کوچینگ MON
                <br />
                مسیر حرفه‌ای‌سازی معامله‌گر
              </h1>
              <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mb-8">
                یک برنامه ۱۸ هفته‌ای تحول‌محور — از روان‌شناسی ترید تا دریافت
                سرمایه از صندوق نامدار. مستقیم زیر نظر استاد امیرحسین نام‌آور.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="#register"
                  className="px-8 py-4 rounded-full bg-[#f7cf5a] text-[#2d1c03] font-bold text-lg hover:brightness-105 transition"
                >
                  ثبت‌نام در MON ←
                </Link>
                <Link
                  href="#syllabus"
                  className="px-8 py-4 rounded-full border-2 border-white/40 text-white font-bold text-lg hover:bg-white/10 transition"
                >
                  مشاهده سرفصل‌ها
                </Link>
              </div>
            </div>

            {/* Hero card */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-[#136cb5] to-[#49bbbd] rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/figma/tt6a9115copy2.jpg')] bg-cover bg-center opacity-80" />
                  <div className="relative w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl hover:scale-110 transition cursor-pointer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1b3c8a">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
                <div className="text-xs text-white/60 mb-2">استاد دوره</div>
                <div className="font-bold text-lg mb-1">
                  مهندس امیرحسین نام‌آور
                </div>
                <div className="text-sm text-white/70">
                  ۱۶ سال تجربه تدریس · بنیان‌گذار متدولوژی MON
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-[#e5eaf5] grid grid-cols-2 md:grid-cols-4 divide-x divide-[#eef2f7] divide-x-reverse overflow-hidden">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 md:p-8 text-center">
              <div className="text-2xl md:text-4xl font-bold text-[#1b3c8a] mb-2">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-[#010514]/65">
                {s.label}
              </div>
              {s.sub && (
                <div className="text-[11px] text-[#010514]/45 mt-1">{s.sub}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-[#010514] mb-3">
            چرا MON؟
          </h2>
          <p className="text-[#010514]/60 max-w-2xl mx-auto">
            تنها برنامه‌ای که همه‌ی اجزای لازم برای تبدیل شدن به یک تریدر حرفه‌ای
            را یکجا در کنار هم دارد.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERKS.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-3xl p-6 border border-[#e5eaf5] hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] text-white flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-[#010514] mb-2">{p.title}</h3>
              <p className="text-sm text-[#010514]/70 leading-7">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Syllabus */}
      <section id="syllabus" className="bg-white py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-[#010514] mb-3">
              مسیر ۱۸ هفته‌ای MON
            </h2>
            <p className="text-[#010514]/60 max-w-2xl mx-auto">
              شش فاز کلیدی، طراحی شده به‌صورت پله‌پله تا شما را از مبتدی به
              تریدر حرفه‌ای تبدیل کند.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {SYLLABUS.map((s, i) => (
              <div
                key={s.title}
                className="flex gap-5 p-6 rounded-3xl bg-[#f7fafd] border border-[#eef2f7]"
              >
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#1b3c8a] text-white font-bold text-xl flex items-center justify-center">
                  {faDigits(i + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#1b3c8a] font-bold mb-1">
                    {s.weeks}
                  </div>
                  <h3 className="font-bold text-[#010514] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#010514]/70 leading-7">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-[#010514] mb-3">
            روایت فارغ‌التحصیلان
          </h2>
          <p className="text-[#010514]/60 max-w-2xl mx-auto">
            بیش از ۲,۰۰۰ فارغ‌التحصیل موفق. چند نمونه از مسیرهایی که MON تغییر داده.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-3xl p-6 border border-[#e5eaf5] relative"
            >
              <svg
                className="absolute top-5 left-5 text-[#1b3c8a]/15"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9.75 4.75L7 9.25H9v7.5H3v-7.5l2.75-4.5h4zm8.5 0L15.5 9.25h2v7.5h-6v-7.5l2.75-4.5h4z" />
              </svg>
              <p className="text-[#010514]/80 leading-8 mb-5 relative">
                «{t.quote}»
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#eef2f7]">
                <span className="w-11 h-11 rounded-full bg-gradient-to-br from-[#136cb5] to-[#49bbbd] text-white font-bold flex items-center justify-center">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <div className="font-bold text-[#010514]">{t.name}</div>
                  <div className="text-xs text-[#010514]/55">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA / Register */}
      <section
        id="register"
        className="bg-gradient-to-l from-[#1b3c8a] to-[#136cb5] text-white py-16 md:py-24"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-4">
              آماده تبدیل شدن به تریدر حرفه‌ای هستید؟
            </h2>
            <p className="text-white/85 leading-8 mb-6">
              تعداد ظرفیت‌های هر دوره محدود است. برای مصاحبه و بررسی تناسب، فرم
              ثبت‌نام را پر کنید — تیم پذیرش در ۴۸ ساعت آینده با شما تماس
              خواهد گرفت.
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="2.4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                مصاحبه رایگان تعیین سطح
              </li>
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="2.4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ضمانت بازگشت وجه در ۷ روز ابتدایی
              </li>
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="2.4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                امکان پرداخت اقساطی
              </li>
            </ul>
          </div>
          <div>
            <CoachingRegisterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
