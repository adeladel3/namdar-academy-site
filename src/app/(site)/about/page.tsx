import Link from "next/link";

export const metadata = {
  title: "درباره نامدار آکادمی",
};

const values = [
  {
    icon: "🎯",
    title: "کیفیت بی‌قید و شرط",
    desc: "محتوای دوره‌ها بر اساس تجربه‌ی واقعی در بازارهای مالی تدوین شده‌اند.",
  },
  {
    icon: "🤝",
    title: "پشتیبانی واقعی",
    desc: "تیم پشتیبانی اختصاصی در تمام طول دوره در کنار دانش‌پذیران است.",
  },
  {
    icon: "🔄",
    title: "به‌روزرسانی دائمی",
    desc: "محتوا همگام با تغییرات بازار بازبینی و به‌روزرسانی می‌شود.",
  },
  {
    icon: "🏆",
    title: "نتیجه‌محور",
    desc: "هدف ما مهارت عملی دانش‌پذیر است، نه صرفاً آموزش تئوری.",
  },
];

const timeline = [
  { year: "۱۳۸۸", event: "آغاز فعالیت استاد نام‌آور در بازارهای مالی" },
  { year: "۱۳۹۲", event: "تدریس اولین دوره تخصصی ترید" },
  { year: "۱۳۹۷", event: "راه‌اندازی رسمی نامدار آکادمی" },
  { year: "۱۴۰۱", event: "عبور از مرز ۱۰ هزار دانش‌پذیر فعال" },
  { year: "۱۴۰۵", event: "راه‌اندازی پلتفرم جدید و دوره‌های بین‌المللی" },
];

export default function AboutPage() {
  return (
    <div className="bg-[#f7fafd]">
      <section className="bg-gradient-to-l from-[#0f1f4a] via-[#1b3c8a] to-[#136cb5] text-white py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-white/15 text-sm mb-5">
            درباره ما
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-5">
            نامدار آکادمی
          </h1>
          <p className="text-white/85 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            بیش از ۱۶ سال است که با تدریس تخصصی ترید و سرمایه‌گذاری، در کنار
            بیش از یک میلیون کاربر فارسی‌زبان، مسیر حرفه‌ای شدن در بازارهای
            مالی را هموار می‌کنیم.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-[#010514] mb-5">
              مأموریت ما
            </h2>
            <p className="text-[#010514]/75 leading-[2] text-base md:text-lg">
              در نامدار آکادمی باور داریم یادگیری درست، سود پایدار می‌آورد. ما
              به دانش‌پذیران کمک می‌کنیم با یک سیستم ذهنی حرفه‌ای، مهارت فنی
              دقیق، و مدیریت ریسک سخت‌گیرانه، به استقلال مالی برسند — نه با
              شانس، بلکه با دانش.
            </p>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#dbe7ff] to-[#49bbbd]/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/figma/portraitteachergivingonlineclass2.png"
              alt="استاد امیرحسین نام‌آور"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-[#010514] mb-3">
              ارزش‌های نامدار
            </h2>
            <p className="text-[#010514]/65">
              هر آنچه در نامدار آکادمی می‌سازیم، بر این چهار ستون تکیه دارد.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 rounded-3xl bg-[#f7fafd] border border-[#e5eaf5]"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-[#010514] mb-2">{v.title}</h3>
                <p className="text-sm text-[#010514]/70 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-[#010514] mb-3">
              مسیر ما
            </h2>
          </div>
          <ol className="relative border-r-2 border-[#e5eaf5] pr-8 space-y-8">
            {timeline.map((t) => (
              <li key={t.year} className="relative">
                <span className="absolute -right-[37px] top-1 w-4 h-4 rounded-full bg-[#1b3c8a] ring-4 ring-[#eef4ff]" />
                <div className="bg-white rounded-2xl p-5 shadow border border-[#e5eaf5]">
                  <div className="text-[#1b3c8a] font-bold">{t.year}</div>
                  <div className="text-[#010514]/75 mt-1">{t.event}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8 bg-gradient-to-l from-[#136cb5] to-[#49bbbd] text-white">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            آماده‌اید مسیر را با ما آغاز کنید؟
          </h2>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto">
            دوره‌های ما را ببینید یا برای مشاوره‌ی رایگان با ما در تماس باشید.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/courses"
              className="px-8 py-3 rounded-full bg-white text-[#136cb5] font-bold hover:opacity-90 transition"
            >
              مشاهده دوره‌ها
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white/10 transition"
            >
              تماس با ما
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
