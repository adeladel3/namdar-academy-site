import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const SOCIAL = [
  {
    label: "اینستاگرام",
    href: "https://www.instagram.com/amirhossein.namavar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "تلگرام",
    href: "https://t.me/namdaracademy",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
  },
  {
    label: "آپارات",
    href: "https://www.aparat.com/namdaracademy",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "یوتیوب",
    href: "https://www.youtube.com/@namdaracademy",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M21.58 7.19c-.23-.86-.9-1.54-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42c-.86.23-1.53.91-1.76 1.77C2 8.76 2 12 2 12s0 3.24.42 4.81c.23.86.9 1.54 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42c.86-.23 1.53-.91 1.76-1.77C22 15.24 22 12 22 12s0-3.24-.42-4.81zM10 15V9l5.19 3L10 15z" />
      </svg>
    ),
  },
  {
    label: "واتس‌اپ",
    href: "https://wa.me/982191008222",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.5 2 2 6.5 2 12c0 1.77.47 3.5 1.35 5.02L2 22l5.1-1.33C8.6 21.52 10.27 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
      </svg>
    ),
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#0f1f4a] text-white mt-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-11 h-11 rounded-full bg-white text-[#0f1f4a] flex items-center justify-center font-bold text-lg">
                ن
              </div>
              <span className="font-bold text-xl">نامدارآکادمی</span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              مرجع آموزش ترید و سرمایه‌گذاری با بیش از یک میلیون کاربر فعال.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="text-white/70 hover:text-white">
                  دوره‌ها
                </Link>
              </li>
              <li>
                <Link href="/coaching" className="text-white/70 hover:text-white">
                  کوچینگ MON
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-white/70 hover:text-white">
                  مقالات
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-white">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white">
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">پشتیبانی</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-white/70 hover:text-white">
                  سوالات متداول
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white">
                  قوانین و مقررات
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-white">
                  حریم خصوصی
                </Link>
              </li>
              <li>
                <a
                  href="tel:+982191008222"
                  className="text-white/70 hover:text-white font-mono"
                  dir="ltr"
                >
                  021-91008222
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">خبرنامه</h4>
            <p className="text-white/70 text-sm mb-3">
              آخرین تحلیل‌ها و تخفیف‌ها را دریافت کنید.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span className="text-white/60">
            © ۱۴۰۵ نامدار آکادمی. تمامی حقوق محفوظ است.
          </span>
          <div className="flex items-center gap-3">
            <a
              referrerPolicy="origin"
              target="_blank"
              rel="noreferrer"
              href="https://trustseal.enamad.ir/?id=699340&Code=wZiC45jUHBdz9hkJcayl5ZiPyrnTr664"
              className="bg-white rounded-lg p-1.5 shadow-lg inline-block"
              aria-label="نماد اعتماد الکترونیکی"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=699340&Code=wZiC45jUHBdz9hkJcayl5ZiPyrnTr664"
                alt="نماد اعتماد الکترونیکی"
                className="h-16 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
