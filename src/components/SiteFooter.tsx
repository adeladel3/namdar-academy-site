import Link from "next/link";

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
            <p className="text-white/70 text-sm leading-relaxed">
              مرجع آموزش ترید و سرمایه‌گذاری با بیش از یک میلیون کاربر فعال.
            </p>
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
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">خبرنامه</h4>
            <p className="text-white/70 text-sm mb-3">
              آخرین تحلیل‌ها و تخفیف‌ها را دریافت کنید.
            </p>
            <form
              className="flex gap-2"
              action="/api/newsletter"
              method="post"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="ایمیل شما"
                className="flex-1 h-10 px-4 rounded-full bg-white/10 text-white placeholder:text-white/50 border border-white/20 text-sm focus:outline-none focus:border-white/50"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-full bg-white text-[#0f1f4a] font-bold text-sm hover:bg-white/90 transition"
              >
                عضویت
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 text-center text-white/60 text-sm">
          © ۱۴۰۵ نامدار آکادمی. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
