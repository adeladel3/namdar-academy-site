"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/admin/ui";

export default function CourseTabs({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "";
  const base = `/admin/courses/${slug}`;

  const tabs = [
    { href: base, label: "نمای کلی", match: base },
    { href: `${base}/edit`, label: "اطلاعات پایه", match: `${base}/edit` },
    { href: `${base}/pricing`, label: "قیمت و انتشار", match: `${base}/pricing` },
    {
      href: `${base}/curriculum`,
      label: "سرفصل‌ها و ویدیوها",
      match: `${base}/curriculum`,
    },
    {
      href: `${base}/students`,
      label: "دانش‌پذیران",
      match: `${base}/students`,
    },
    {
      href: `${base}/analytics`,
      label: "آنالیتیکس",
      match: `${base}/analytics`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e5eaf5] overflow-x-auto">
      <div className="flex items-center min-w-max">
        {tabs.map((t) => {
          const active = pathname === t.match;
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
