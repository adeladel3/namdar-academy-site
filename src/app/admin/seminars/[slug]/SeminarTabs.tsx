"use client";

import Link from "@/components/SafeLink";
import { usePathname } from "next/navigation";
import { cx } from "@/components/admin/ui";

export default function SeminarTabs({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "";
  const encoded = encodeURIComponent(slug);
  const base = `/admin/seminars/${encoded}`;

  // دو ناحیه‌ی محتوای کاملاً مجزا که کاربر در درخواستش روی آن‌ها تأکید کرد:
  //   ١) محتوای فرانت سایت (لندینگ عمومی)
  //   ٢) محتوای پنل کاربری (فقط برای خریداران)
  // برای جلوگیری از گیج شدن، تب‌ها برچسب صریح دارند.
  const tabs = [
    { href: base, label: "نمای کلی", match: base },
    { href: `${base}/edit`, label: "تنظیمات کلی", match: `${base}/edit` },
    {
      href: `${base}/landing-content`,
      label: "محتوای فرانت سایت (لندینگ)",
      match: `${base}/landing-content`,
    },
    {
      href: `${base}/member-content`,
      label: "محتوای پنل خریداران",
      match: `${base}/member-content`,
    },
    {
      href: `${base}/registrations`,
      label: "ثبت‌نام‌ها",
      match: `${base}/registrations`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e5eaf5] overflow-x-auto">
      <div className="flex items-center min-w-max">
        {tabs.map((t) => {
          // pathname از Next با مقادیر non-encoded هم می‌تواند بیاید. هر دو
          // حالت را با مقایسه‌ی decode‌شده هندل کنیم تا تب فعال درست تشخیص
          // داده شود.
          const decodedPath = (() => {
            try { return decodeURIComponent(pathname); } catch { return pathname; }
          })();
          const decodedMatch = (() => {
            try { return decodeURIComponent(t.match); } catch { return t.match; }
          })();
          const active = pathname === t.match || decodedPath === decodedMatch;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                "px-5 py-3 text-sm whitespace-nowrap transition border-b-2",
                active
                  ? "text-[#1b3c8a] border-[#1b3c8a] font-bold"
                  : "text-[#010514]/65 border-transparent hover:text-[#1b3c8a]"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
