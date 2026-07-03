import Link from "@/components/SafeLink";
import NewsletterForm from "./NewsletterForm";
import { getSetting } from "@/lib/db";
import { phoneToTelHref } from "@/lib/formatting";

const imgLayer21 = "/figma/layer21.png";

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "آموزش ترید و بازار مالی", href: "/courses" },
  { label: "سرمایه‌گذاری و مشاوره", href: "/investing" },
  { label: "کوچینگ MON", href: "/coaching" },
  { label: "بلاگ و مقالات", href: "/articles" },
  { label: "درباره ما", href: "/about" },
];

const SUPPORT_LINKS: { label: string; href: string }[] = [
  { label: "سؤالات متداول", href: "/faq" },
  { label: "قوانین و مقررات", href: "/terms" },
  { label: "حریم خصوصی", href: "/privacy" },
  { label: "تماس با ما", href: "/contact" },
  { label: "پنل کاربری", href: "/dashboard" },
];

type SocialKey = "instagram" | "telegram" | "aparat" | "youtube" | "whatsapp";

const SOCIAL_DEFS: {
  key: SocialKey;
  label: string;
  defaultHref: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "instagram",
    label: "اینستاگرام",
    defaultHref: "https://www.instagram.com/amirhossein.namavar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "telegram",
    label: "تلگرام",
    defaultHref: "https://t.me/namdaracademy",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
  },
  {
    key: "aparat",
    label: "آپارات",
    defaultHref: "https://www.aparat.com/namdaracademy",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2M5.2 5.2l2.3 2.3M16.5 16.5l2.3 2.3M5.2 18.8l2.3-2.3M16.5 7.5l2.3-2.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "یوتیوب",
    defaultHref: "https://www.youtube.com/@namdaracademy",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
        <path d="M21.58 7.19c-.23-.86-.9-1.54-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42c-.86.23-1.53.91-1.76 1.77C2 8.76 2 12 2 12s0 3.24.42 4.81c.23.86.9 1.54 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42c.86-.23 1.53-.91 1.76-1.77C22 15.24 22 12 22 12s0-3.24-.42-4.81zM10 15V9l5.19 3L10 15z" />
      </svg>
    ),
  },
  {
    key: "whatsapp",
    label: "واتس‌اپ",
    defaultHref: "https://wa.me/982191008222",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
        <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.5 2 2 6.5 2 12c0 1.77.47 3.5 1.35 5.02L2 22l5.1-1.33C8.6 21.52 10.27 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
      </svg>
    ),
  },
];

const SETTING_KEY: Record<SocialKey, string> = {
  instagram: "site.socialInstagram",
  telegram: "site.socialTelegram",
  aparat: "site.socialAparat",
  youtube: "site.socialYoutube",
  whatsapp: "site.socialWhatsapp",
};

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 6.5-9 13-9 13s-9-6.5-9-13a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[14px] h-[14px]" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function LandingFigmaFooter() {
  const contactPhone =
    getSetting<string>("site.contactPhone") || "021-9100-8222";
  const contactTelHref = phoneToTelHref(contactPhone);

  // Resolve each social link from site.* settings; admin can blank a value
  // out to hide that icon entirely.
  const SOCIAL = SOCIAL_DEFS.flatMap((d) => {
    const v = getSetting<string>(SETTING_KEY[d.key]);
    const href = typeof v === "string" && v.trim() ? v.trim() : d.defaultHref;
    if (!href) return [];
    return [{ label: d.label, href, icon: d.icon }];
  });
  return (
    <footer
      className="absolute left-0 top-[8823px] w-[1920px] h-[593px] overflow-hidden"
      data-node-id="4:20"
      data-name="Footer"
      dir="rtl"
    >
      {/* Background gradient + subtle glow accents */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0b1638 0%, #0f1f4a 45%, #0a1636 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-[220px] right-[10%] w-[520px] h-[520px] rounded-full blur-[110px] opacity-[0.18]"
        style={{ background: "radial-gradient(circle, #49bbbd 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-[180px] left-[6%] w-[460px] h-[460px] rounded-full blur-[110px] opacity-[0.15]"
        style={{ background: "radial-gradient(circle, #f7cf5a 0%, transparent 70%)" }}
      />
      {/* Top hairline accent */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(73,187,189,0.55) 25%, rgba(247,207,90,0.55) 75%, transparent 100%)",
        }}
      />

      <div className="relative h-full flex flex-col px-[156px] pt-[72px] pb-[28px] text-white">
        {/* ── Top grid: 4 columns ─────────────────────────── */}
        <div className="grid grid-cols-[1.35fr_1fr_1fr_1.45fr] gap-[64px] flex-1">
          {/* Column 1 — Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-4 mb-6 group w-fit"
              aria-label="نامدار آکادمی"
            >
              <span
                className="font-['Yekan_Bakh:Bold',sans-serif] text-white text-[28px] font-extrabold tracking-tight whitespace-nowrap"
                dir="rtl"
              >
                نامدار آکادمی
              </span>
              <span
                className="relative w-[82px] h-[70px] shrink-0 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(73,187,189,0.45)] border border-white/40"
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #e8f4f5 60%, #d7ecee 100%)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgLayer21}
                  alt=""
                  aria-hidden
                  className="w-[50px] h-[36px] object-contain"
                />
              </span>
            </Link>

            <p className="font-['Yekan_Bakh:Regular',sans-serif] text-[15px] leading-[2] text-[#c9cbe3] mb-7 max-w-[380px]">
              مرجع تخصصی آموزش ترید، تحلیل بازار و سرمایه‌گذاری در ایران.
              با بیش از یک میلیون کاربر فعال، در کنار شماییم تا مسیر
              حرفه‌ای‌شدن در بازارهای مالی را هموارتر کنیم.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2.5">
              {SOCIAL.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="w-[42px] h-[42px] rounded-full bg-white/[0.06] border border-white/10 text-white/80 hover:text-white hover:bg-white/[0.12] hover:border-white/30 flex items-center justify-center transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick links */}
          <div>
            <h4 className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px] font-extrabold mb-6 flex items-center gap-3">
              <span
                aria-hidden
                className="w-1 h-5 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #49bbbd 0%, #1b3c8a 100%)",
                }}
              />
              دسترسی سریع
            </h4>
            <ul className="space-y-3.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-2 text-[14px] text-[#b2b3cf] hover:text-white transition font-['Yekan_Bakh:Medium',sans-serif]"
                  >
                    <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-[#49bbbd]">
                      <IconChevronLeft />
                    </span>
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div>
            <h4 className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px] font-extrabold mb-6 flex items-center gap-3">
              <span
                aria-hidden
                className="w-1 h-5 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #f7cf5a 0%, #d4a62a 100%)",
                }}
              />
              پشتیبانی و قوانین
            </h4>
            <ul className="space-y-3.5">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-2 text-[14px] text-[#b2b3cf] hover:text-white transition font-['Yekan_Bakh:Medium',sans-serif]"
                  >
                    <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-[#f7cf5a]">
                      <IconChevronLeft />
                    </span>
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Newsletter + contact */}
          <div>
            <h4 className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px] font-extrabold mb-3 flex items-center gap-3">
              <span
                aria-hidden
                className="w-1 h-5 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #b2b3cf 100%)",
                }}
              />
              عضویت در خبرنامه
            </h4>
            <p className="font-['Yekan_Bakh:Regular',sans-serif] text-[13.5px] leading-[1.9] text-[#b2b3cf] mb-4">
              تحلیل‌های هفتگی بازار، ویدیوهای آموزشی جدید و تخفیف‌های
              ویژه را مستقیم در ایمیل خود دریافت کنید.
            </p>

            <NewsletterForm />

            {/* Contact block */}
            <ul className="mt-6 space-y-3 font-['Yekan_Bakh:Medium',sans-serif] text-[13.5px] text-[#c9cbe3]">
              <li className="flex items-center gap-3">
                <span className="w-[34px] h-[34px] rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#49bbbd] shrink-0">
                  <IconPhone />
                </span>
                <a
                  href={contactTelHref}
                  className="font-mono tracking-wide hover:text-white transition"
                  dir="ltr"
                >
                  {contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-[34px] h-[34px] rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#49bbbd] shrink-0">
                  <IconMail />
                </span>
                <a
                  href="mailto:info@namdaracademy.com"
                  className="hover:text-white transition"
                  dir="ltr"
                >
                  info@namdaracademy.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-[34px] h-[34px] rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#49bbbd] shrink-0">
                  <IconPin />
                </span>
                <span>تهران، ایران</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-[34px] h-[34px] rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#49bbbd] shrink-0">
                  <IconClock />
                </span>
                <span>شنبه تا پنج‌شنبه · ۹ تا ۱۸</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────── */}
        <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-8">
          <p className="font-['Yekan_Bakh:Medium',sans-serif] text-[13px] text-[#b2b3cf]">
            © ۱۴۰۵ نامدار آکادمی — تمامی حقوق مادی و معنوی محفوظ است.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[12px] text-[#b2b3cf] font-['Yekan_Bakh:Medium',sans-serif]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#49bbbd] animate-pulse" />
              پشتیبانی آنلاین فعال
            </div>

            <span aria-hidden className="w-px h-5 bg-white/10" />

            <div className="flex items-center gap-3 text-[12px] text-[#b2b3cf] font-['Yekan_Bakh:Medium',sans-serif]">
              <span>درگاه پرداخت امن</span>
              <span className="px-2.5 py-1 rounded-md bg-white/[0.08] border border-white/10 font-['Poppins:SemiBold',sans-serif] tracking-wide">
                SAMAN · SEP
              </span>
            </div>

            <span aria-hidden className="w-px h-5 bg-white/10" />

            <a
              referrerPolicy="origin"
              target="_blank"
              rel="noopener"
              href="https://trustseal.enamad.ir/?id=699340&Code=wZiC45jUHBdz9hkJcayl5ZiPyrnTr664"
              className="bg-white rounded-md p-1 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)] inline-block"
              aria-label="نماد اعتماد الکترونیکی"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=699340&Code=wZiC45jUHBdz9hkJcayl5ZiPyrnTr664"
                alt="نماد اعتماد الکترونیکی"
                className="h-12 w-auto block"
                {...{ code: "wZiC45jUHBdz9hkJcayl5ZiPyrnTr664" }}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
