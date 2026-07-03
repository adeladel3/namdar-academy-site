import { getSetting, listCourses } from "@/lib/db";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "تماس با ما — نامدار آکادمی",
  description:
    "راه‌های ارتباطی با نامدار آکادمی — تماس تلفنی، ایمیل، تلگرام و فرم پیام مستقیم.",
};

export const dynamic = "force-dynamic";

function onlyDigits(s: string) {
  return (s || "").replace(/[^\d+]/g, "");
}

// Canonical Namdar Academy contact info. Used when the admin hasn't (yet)
// overridden a value via /admin/settings/site. Kept in sync with the footer
// so every public surface shows the same real numbers.
const DEFAULT_PHONE = "021-9100-8222";
const DEFAULT_EMAIL = "info@namdaracademy.com";
const DEFAULT_ADDRESS = "تهران، ایران\nلندن، انگلستان\nدبی، امارات";
const DEFAULT_HOURS = "شنبه تا پنج‌شنبه · ۹:۰۰ تا ۱۸:۰۰";

function settingOr(key: string, fallback: string) {
  const v = getSetting<string>(key);
  return typeof v === "string" && v.trim().length > 0 ? v : fallback;
}

export default function ContactPage() {
  const phone = settingOr("site.contactPhone", DEFAULT_PHONE);
  const email = settingOr("site.contactEmail", DEFAULT_EMAIL);
  const addresses = settingOr("site.address", DEFAULT_ADDRESS)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const workingHours = settingOr("site.contactHours", DEFAULT_HOURS);

  const telHref = `tel:${onlyDigits(phone)}`;
  const mailHref = `mailto:${email}`;

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0b1530 0%, #11245a 45%, #1b3c8a 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[620px] h-[620px] rounded-full opacity-60 blur-[160px]"
        style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 -left-40 w-[620px] h-[620px] rounded-full opacity-40 blur-[160px]"
        style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-[1240px] mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-[11px] tracking-[0.22em] font-extrabold text-white backdrop-blur mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_10px_#f7cf5a]" />
            CONTACT NAMDAR ACADEMY
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            با تیم{" "}
            <span
              style={{
                background:
                  "linear-gradient(180deg, #f7cf5a 0%, #e8bc3a 60%, #d4a62a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              نامدار آکادمی
            </span>{" "}
            در ارتباط باشید
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto leading-8">
            از طریق راه‌های ارتباطی زیر یا فرم پیام مستقیم با ما در تماس باشید.
            پاسخ‌گویی در ساعات کاری، کمتر از ۲۴ ساعت.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-10 md:mb-14">
          <ContactAction
            href={telHref}
            badge="CALL"
            label="تماس تلفنی"
            value={phone}
            cta="شماره‌گیری"
            ltr
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
              </svg>
            }
          />
          <ContactAction
            href="https://t.me/namdaracademyy"
            external
            badge="TELEGRAM"
            label="تلگرام"
            value="@namdaracademyy"
            cta="مشاهده کانال رسمی"
            ltr
            accent="sky"
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
            }
          />
          <ContactAction
            href={mailHref}
            badge="EMAIL"
            label="ایمیل"
            value={email}
            cta="ارسال ایمیل"
            ltr
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            }
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-8 items-start">
          <InfoPanel
            addresses={addresses}
            hours={workingHours}
            phone={phone}
            email={email}
          />
          <ContactForm
            courses={listCourses({ status: "published" }).map((c) => ({
              slug: c.slug,
              title: c.title,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function ContactAction({
  href,
  external,
  badge,
  label,
  value,
  cta,
  ltr,
  accent = "gold",
  icon,
}: {
  href: string;
  external?: boolean;
  badge: string;
  label: string;
  value: string;
  cta: string;
  ltr?: boolean;
  accent?: "gold" | "emerald" | "sky";
  icon: React.ReactNode;
}) {
  const accentClass = {
    gold: "text-[#f7cf5a] group-hover:shadow-[0_10px_30px_-10px_rgba(247,207,90,0.55)]",
    emerald:
      "text-[#5ee7a0] group-hover:shadow-[0_10px_30px_-10px_rgba(94,231,160,0.55)]",
    sky: "text-[#7cc8ff] group-hover:shadow-[0_10px_30px_-10px_rgba(124,200,255,0.55)]",
  }[accent];
  const iconBg = {
    gold: "bg-gradient-to-br from-[#f7cf5a]/25 to-[#d4a62a]/15 border-[#f7cf5a]/30",
    emerald:
      "bg-gradient-to-br from-emerald-400/25 to-emerald-600/15 border-emerald-300/30",
    sky: "bg-gradient-to-br from-sky-400/25 to-sky-600/15 border-sky-300/30",
  }[accent];

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group relative block rounded-3xl p-5 md:p-6 overflow-hidden transition-transform active:translate-y-[1px] hover:-translate-y-0.5 ${accentClass}`}
      style={{
        background:
          "radial-gradient(circle at 25% 15%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 45%), rgba(255,255,255,0.07)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.28), 0 18px 40px -20px rgba(0,0,0,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-2 left-5 w-16 h-2.5 rounded-full bg-white/35 blur-sm pointer-events-none"
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${iconBg}`}
          >
            <span className="w-5 h-5 block">{icon}</span>
          </span>
          <span className="text-[9px] tracking-[0.22em] font-extrabold text-white/50">
            {badge}
          </span>
        </div>
        <div>
          <div className="text-[11px] text-white/55 mb-1 font-bold">{label}</div>
          <div
            dir={ltr ? "ltr" : "rtl"}
            className={`font-extrabold text-white text-[15px] md:text-[16px] ${ltr ? "text-left" : ""} leading-tight`}
          >
            {value}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[12px] font-bold text-white/80 group-hover:text-white transition">
            {cta}
          </span>
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/20 transition group-hover:bg-white group-hover:text-[#0b1530] ${accentClass}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}

function InfoPanel({
  addresses,
  hours,
  phone,
  email,
}: {
  addresses: string[];
  hours: string;
  phone: string;
  email: string;
}) {
  return (
    <div
      className="relative rounded-[2rem] p-6 md:p-8 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 80% 10%, rgba(73,187,189,0.22) 0%, rgba(255,255,255,0.03) 45%), rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.28), 0 30px 70px -20px rgba(0,0,0,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-3 left-6 w-24 h-3 rounded-full bg-white/30 blur-sm pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-[#49bbbd]/20 blur-3xl pointer-events-none"
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] tracking-[0.22em] font-extrabold text-white/85 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#49bbbd] shadow-[0_0_8px_#49bbbd]" />
          OUR OFFICE
        </div>
        <h2 className="text-white font-extrabold text-2xl md:text-3xl leading-tight mb-2">
          دفتر مرکزی نامدار آکادمی
        </h2>
        <p className="text-white/65 text-sm leading-8 mb-6">
          تیم ما آماده‌ی پاسخ‌گویی به سؤالات شما درباره‌ی دوره‌ها، کوچینگ MON،
          همکاری‌ها و پشتیبانی حساب کاربری است.
        </p>

        <ul className="space-y-4">
          <AddressRow addresses={addresses} />
          <InfoRow
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
            label="ساعات کاری"
            value={hours}
          />
          <InfoRow
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
              </svg>
            }
            label="تلفن ثابت"
            value={phone}
            ltr
          />
          <InfoRow
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            }
            label="ایمیل"
            value={email}
            ltr
          />
        </ul>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  ltr,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/15 text-white/85 flex items-center justify-center shrink-0 mt-0.5">
        <span className="w-[18px] h-[18px] block">{icon}</span>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-white/50 font-bold mb-0.5">{label}</div>
        <div
          dir={ltr ? "ltr" : "rtl"}
          className={`text-white text-[14px] md:text-[15px] font-bold leading-7 ${ltr ? "text-left" : ""}`}
        >
          {value}
        </div>
      </div>
    </li>
  );
}

function splitCityCountry(s: string) {
  const parts = s.split(/[،,]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { city: s, country: "" };
  if (parts.length === 1) return { city: parts[0], country: "" };
  return { city: parts[0], country: parts.slice(1).join("، ") };
}

function AddressRow({ addresses }: { addresses: string[] }) {
  const isMulti = addresses.length > 1;
  return (
    <li className="flex items-start gap-3">
      <span className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/15 text-white/85 flex items-center justify-center shrink-0 mt-0.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px]"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-white/50 font-bold mb-1.5">
          {isMulti ? `دفاتر ما (${addresses.length})` : "آدرس"}
        </div>
        <ul className="space-y-1.5">
          {addresses.map((a, i) => {
            const { city, country } = splitCityCountry(a);
            return (
              <li
                key={`${a}-${i}`}
                className="flex items-baseline gap-2 leading-7"
              >
                <span className="text-white text-[14px] md:text-[15px] font-bold">
                  {city}
                </span>
                {country && (
                  <>
                    <span
                      aria-hidden
                      className="w-1 h-1 rounded-full bg-[#49bbbd]/60"
                    />
                    <span className="text-white/55 text-[12px] font-bold">
                      {country}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}
